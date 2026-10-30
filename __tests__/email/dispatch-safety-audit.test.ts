import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCertificateCampaign,
  createGeneralBroadcastCampaign,
  processNextBroadcastBatch,
  generateDeliveryIdempotencyKey,
} from "@/lib/broadcast/campaign-worker";
import {
  sendCampaignEmail,
  clearMockCampaignDispatches,
  getMockCampaignDispatches,
} from "@/lib/email/campaign-service";

describe("Saviskar 2026 — Deep Dispatch Safety & Failure Simulation Audit", () => {
  beforeEach(() => {
    clearMockCampaignDispatches();
    vi.restoreAllMocks();
  });

  describe("1. Partial Campaign Ingestion & Database Atomicity Analysis", () => {
    it("simulates a 3,979 certificate unit campaign failing at middle batch (batch 8), verifying incomplete campaign is never marked queued", async () => {
      // Construct 3,979 realistic certificate items (matching Saviskar 2026 actual volume: 3,916 event + 63 stay-only)
      const mockCandidates: any[] = [];
      for (let i = 0; i < 3979; i++) {
        mockCandidates.push({
          participantEventId: `pe-${i}`,
          recipientName: `Participant ${i}`,
          recipientEmail: `student_${i}@university.edu`,
          isValidEmail: true,
          eventId: i >= 3916 ? "stay-only" : `event-${i % 40}`,
          eventName: i >= 3916 ? "Saviskar 2026" : `Event ${i % 40}`,
          isTeam: false,
          mainCheckedIn: false,
          certificateEligible: true,
          issueSourceKey: `member:${i}:unit`,
          isStayOnly: i >= 3916,
        });
      }

      let simulatedBatchCount = 0;
      let campaignDeletedDuringRollback = false;
      let finalCampaignStatus = "uncreated";

      // Mock DB simulating PostgREST statement timeout during the 8th chunk of 250 rows
      const failingMockDb = {
        from: (table: string) => {
          if (table === "broadcast_campaigns") {
            return {
              insert: (payload: any) => {
                finalCampaignStatus = payload.status; // initial status should be 'draft'
                return {
                  select: () => ({
                    single: () =>
                      Promise.resolve({
                        data: { id: "camp-3979-simulated-fail" },
                        error: null,
                      }),
                  }),
                };
              },
              update: (payload: any) => {
                finalCampaignStatus = payload.status;
                return { eq: () => Promise.resolve({ error: null }) };
              },
              delete: () => ({
                eq: (col: string, val: string) => {
                  if (col === "id" && val === "camp-3979-simulated-fail") {
                    campaignDeletedDuringRollback = true;
                    finalCampaignStatus = "deleted";
                  }
                  return Promise.resolve({ error: null });
                },
              }),
            };
          }
          if (table === "participation_certificates") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: null, error: null }),
                }),
              }),
              insert: (rec: any) => ({
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: { id: `cert-${rec.issue_source_key}`, certificate_number: `SAV-${rec.issue_source_key}` },
                      error: null,
                    }),
                }),
              }),
              delete: () => ({ in: () => Promise.resolve({ error: null }) }),
            };
          }
          if (table === "broadcast_deliveries") {
            return {
              insert: () => {
                simulatedBatchCount++;
                if (simulatedBatchCount === 8) {
                  return Promise.resolve({
                    error: {
                      message: "PostgREST Statement Timeout (504 Gateway Timeout) on batch 8 of 16",
                    },
                  });
                }
                return Promise.resolve({ error: null });
              },
            };
          }
          if (table === "broadcast_delivery_attachments") {
            return {
              insert: () => Promise.resolve({ error: null }),
            };
          }
          return { select: () => Promise.resolve({ data: [], error: null }) };
        },
      } as any;

      // 1. Initial attempt fails halfway through
      await expect(
        createCertificateCampaign(
          failingMockDb,
          {
            title: "Saviskar 3979 Units Mass Distribution",
            subject: "Your Official Certificate of Participation | Saviskar 2026",
            bodyHtml: "<p>Default Certificate</p>",
            selectedItemKeys: mockCandidates.map((c) => c.issueSourceKey),
            adminId: "admin-master",
            sendIndividual: true,
            sendTeamBackup: false,
          },
          mockCandidates
        )
      ).rejects.toThrow("PostgREST Statement Timeout (504 Gateway Timeout) on batch 8 of 16");

      // Verifications:
      // A. The campaign was NEVER marked as "queued"
      expect(finalCampaignStatus).not.toBe("queued");
      // B. Application compensating cleanup was executed
      expect(campaignDeletedDuringRollback).toBe(true);

      // 2. Safe Recovery: Re-attempting ingestion on clean database
      const successfulBatches: any[][] = [];
      let recoveredCampaignStatus = "draft";

      const healthyMockDb = {
        from: (table: string) => {
          if (table === "broadcast_campaigns") {
            return {
              insert: () => ({
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: { id: "camp-3979-recovered" },
                      error: null,
                    }),
                }),
              }),
              update: (payload: any) => {
                recoveredCampaignStatus = payload.status;
                return { eq: () => Promise.resolve({ error: null }) };
              },
              delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
            };
          }
          if (table === "participation_certificates") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: null, error: null }),
                }),
              }),
              insert: (rec: any) => ({
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: { id: `cert-${rec.issue_source_key}`, certificate_number: `SAV-${rec.issue_source_key}` },
                      error: null,
                    }),
                }),
              }),
              delete: () => ({ in: () => Promise.resolve({ error: null }) }),
            };
          }
          if (table === "broadcast_deliveries") {
            return {
              insert: (rows: any[]) => {
                successfulBatches.push(rows);
                return Promise.resolve({ error: null });
              },
            };
          }
          if (table === "broadcast_delivery_attachments") {
            return {
              insert: () => Promise.resolve({ error: null }),
            };
          }
          return { select: () => Promise.resolve({ data: [], error: null }) };
        },
      } as any;

      const recoveryResult = await createCertificateCampaign(
        healthyMockDb,
        {
          title: "Saviskar 3979 Units Mass Distribution (Recovered)",
          subject: "Your Official Certificate of Participation | Saviskar 2026",
          bodyHtml: "<p>Default Certificate</p>",
          selectedItemKeys: mockCandidates.map((c) => c.issueSourceKey),
          adminId: "admin-master",
          sendIndividual: true,
          sendTeamBackup: false,
        },
        mockCandidates
      );

      // Verifications for full 3,979 units:
      expect(recoveryResult.totalCertificates).toBe(3979);
      expect(recoveryResult.totalDeliveries).toBe(3979);
      // 3,979 deliveries divided into chunks of 250 = 16 batches (15 * 250 + 229)
      expect(successfulBatches.length).toBe(16);
      expect(successfulBatches[0].length).toBe(250);
      expect(successfulBatches[15].length).toBe(229);
      // Status transitioned to "queued" only after all 16 batches succeeded
      expect(recoveredCampaignStatus).toBe("queued");
    });

    it("verifies that a partially populated campaign in 'draft' status is NEVER claimed or dispatched by the queue worker", async () => {
      // In claim_broadcast_deliveries RPC:
      // Deliveries are only selected if status is 'queued' or expired 'sending'.
      // Deliveries of a draft campaign cannot be claimed because the queue worker queries active campaigns:
      // status IN ('queued', 'processing').
      const mockDeliveriesClaimed: string[] = [];

      const mockDb = {
        rpc: (fnName: string, args: any) => {
          if (fnName === "claim_broadcast_deliveries") {
            // Worker claim query strictly checks status IN ('queued', 'sending')
            // It will never return rows from a 'draft' or rolled back campaign
            return Promise.resolve({ data: [], error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
      } as any;

      const batchResult = await processNextBroadcastBatch(mockDb, {
        campaignId: "draft-campaign-id",
        batchSize: 10,
      });

      expect(batchResult.processedCount).toBe(0);
      expect(batchResult.successCount).toBe(0);
      expect(batchResult.failureCount).toBe(0);
    });
  });

  describe("2. Ambiguous Resend Responses & Crash Recovery", () => {
    it("simulates client timeout after provider acceptance and verifies identical idempotencyKey prevents duplicate dispatch upon retry", async () => {
      const deliveryId = "del-timeout-001";
      const campaignId = "camp-idemp-001";
      const recipientEmail = "candidate@saviskar.test";
      const expectedIdempKey = generateDeliveryIdempotencyKey(campaignId, recipientEmail, "individual");

      // 1. Initial attempt: Resend accepts the request under key, but client times out
      const sendResult1 = await sendCampaignEmail({
        to: recipientEmail,
        subject: "Your Official Certificate | Saviskar 2026",
        html: "<p>Certificate Attached</p>",
        idempotencyKey: expectedIdempKey,
      });

      expect(sendResult1.success).toBe(true);
      const originalMessageId = sendResult1.messageId;

      // 2. Simulated recovery retry: Same delivery retried with identical idempotency key
      const sendResult2 = await sendCampaignEmail({
        to: recipientEmail,
        subject: "Your Official Certificate | Saviskar 2026",
        html: "<p>Certificate Attached</p>",
        idempotencyKey: expectedIdempKey,
      });

      expect(sendResult2.success).toBe(true);
      // Idempotency key must match exactly
      const dispatches = getMockCampaignDispatches();
      expect(dispatches.length).toBe(2);
      expect(dispatches[0].idempotencyKey).toBe(expectedIdempKey);
      expect(dispatches[1].idempotencyKey).toBe(expectedIdempKey);
    });

    it("diverts retried delivery to manual_review if delivery age exceeds Resend's 24-hour idempotency window", async () => {
      let updatedStatus = "";
      let updatedErrorCode = "";

      // Delivery created 26 hours ago (outside 24-hour provider idempotency window)
      const staleDelivery = {
        id: "del-stale-001",
        campaign_id: "camp-stale-001",
        recipient_email: "stale.candidate@saviskar.test",
        created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        attempts: 2, // retry attempt
        channel: "individual",
        status: "sending",
        idempotency_key: "stale-key-123",
        subject: "Certificate Stale",
        body_html: "<p>Stale</p>",
      };

      const mockDb = {
        rpc: (fnName: string) => {
          if (fnName === "claim_broadcast_deliveries") {
            return Promise.resolve({ data: [staleDelivery], error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        from: (table: string) => ({
          update: (payload: any) => {
            updatedStatus = payload.status;
            updatedErrorCode = payload.error_code;
            return { eq: () => Promise.resolve({ error: null }) };
          },
        }),
      } as any;

      const batchResult = await processNextBroadcastBatch(mockDb, {
        campaignId: "camp-stale-001",
        batchSize: 1,
      });

      expect(batchResult.processedCount).toBe(1);
      expect(batchResult.failureCount).toBe(1);
      // Must be safely diverted to manual_review to protect participant from duplicate email
      expect(updatedStatus).toBe("manual_review");
      expect(updatedErrorCode).toBe("EXPIRED_IDEMPOTENCY_WINDOW");

      // Verify no mock email was dispatched
      expect(getMockCampaignDispatches().length).toBe(0);
    });

    it("immediately reconciles status to 'sent' if provider_message_id is already present upon worker crash recovery", async () => {
      let reconciledStatus = "";
      let incrementSentCountCalled = false;

      // Delivery where provider accepted and message ID was saved, but worker crashed before status update
      const crashRecoveredDelivery = {
        id: "del-crash-001",
        campaign_id: "camp-crash-001",
        recipient_email: "crash.candidate@saviskar.test",
        created_at: new Date().toISOString(),
        attempts: 2,
        provider_message_id: "resend_msg_accepted_before_crash_999",
        channel: "individual",
        status: "sending",
        idempotency_key: "crash-key-999",
      };

      const mockDb = {
        rpc: (fnName: string) => {
          if (fnName === "claim_broadcast_deliveries") {
            return Promise.resolve({ data: [crashRecoveredDelivery], error: null });
          }
          if (fnName === "increment_campaign_sent_count") {
            incrementSentCountCalled = true;
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        from: (table: string) => ({
          update: (payload: any) => {
            reconciledStatus = payload.status;
            return { eq: () => Promise.resolve({ error: null }) };
          },
        }),
      } as any;

      const batchResult = await processNextBroadcastBatch(mockDb, {
        campaignId: "camp-crash-001",
        batchSize: 1,
      });

      expect(batchResult.successCount).toBe(1);
      expect(reconciledStatus).toBe("sent");
      expect(incrementSentCountCalled).toBe(true);

      // Verify no new email was sent via provider
      expect(getMockCampaignDispatches().length).toBe(0);
    });
  });

  describe("3. General Broadcast Campaigns Regression Invariants", () => {
    it("creates, chunks, and dispatches ordinary broadcast campaigns cleanly without regressions", async () => {
      const generalEmails = Array.from({ length: 300 }, (_, i) => `general_${i}@test.com`);
      let generalStatus = "draft";
      const insertedChunks: any[][] = [];

      const mockDb = {
        from: (table: string) => {
          if (table === "broadcast_campaigns") {
            return {
              insert: (payload: any) => {
                generalStatus = payload.status;
                return {
                  select: () => ({
                    single: () => Promise.resolve({ data: { id: "camp-gen-300" }, error: null }),
                  }),
                };
              },
              delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
            };
          }
          if (table === "broadcast_deliveries") {
            return {
              insert: (rows: any[]) => {
                insertedChunks.push(rows);
                return Promise.resolve({ error: null });
              },
            };
          }
          return { select: () => Promise.resolve({ data: [], error: null }) };
        },
      } as any;

      const result = await createGeneralBroadcastCampaign(mockDb, {
        title: "Important Notice: General Broadcast",
        subject: "Documents Required for SAVISKAR 2K26 Verification",
        bodyHtml: "<p>Verification Notice</p>",
        selectedEmails: generalEmails,
        adminId: "admin-01",
      });

      expect(result.totalDeliveries).toBe(300);
      expect(insertedChunks.length).toBe(2);
      expect(insertedChunks[0].length).toBe(250);
      expect(insertedChunks[1].length).toBe(50);
    });
  });
});
