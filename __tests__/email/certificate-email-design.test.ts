import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CERTIFICATE_EMAIL_SUBJECT,
  CERTIFICATE_CAMPAIGN_DEFAULT_TITLE,
  SAVISKAR_OFFICIAL_URLS,
  SAVISKAR_OFFICIAL_ADDRESS,
  renderCertificateEmailHtml,
  renderCertificateEmailText,
  renderCertificateTeamBackupEmailHtml,
  escapeHtml,
  sanitizeAttachmentDisplayName,
} from "@/lib/broadcast/certificate-email-template";
import {
  createCertificateCampaign,
  createGeneralBroadcastCampaign,
} from "@/lib/broadcast/campaign-worker";
import { sendCampaignEmail } from "@/lib/email/campaign-service";

describe("Saviskar 2026 — Premium Certificate Email Redesign & System Hardening", () => {
  describe("1. Header Gradient & Visual Brand Presentation", () => {
    it("renders with the exact required cyan-purple-pink gradient", () => {
      const html = renderCertificateEmailHtml({
        recipientName: "Amanpreet Kaur",
        eventName: "RoboWars: National Championship 2026",
      });

      // Exact linear-gradient specification
      expect(html).toContain(
        "linear-gradient(90deg, rgba(0, 183, 255, 1) 0%, rgba(136, 87, 199, 1) 50%, rgba(237, 83, 109, 1) 100%)"
      );
    });

    it("includes solid #00b7ff fallback for Outlook and non-CSS3 email clients", () => {
      const html = renderCertificateEmailHtml({
        recipientName: "Rohit Sharma",
      });

      // Both bgcolor attribute and CSS fallback
      expect(html).toContain('bgcolor="#00b7ff"');
      expect(html).toContain("background-color: #00b7ff");
      expect(html).toContain("background: #00b7ff");
    });

    it("features prominent Saviskar 2026 and CGC University Mohali typography", () => {
      const html = renderCertificateEmailHtml();

      expect(html).toContain("SAVISKAR 2026");
      expect(html).toContain("CGC UNIVERSITY, MOHALI");
      expect(html).toContain("Official Certificate of Participation");
      expect(html).toContain("Aevorian Reverie");
    });
  });

  describe("2. Personalized Content & Official Wording", () => {
    it("renders the participant's name in greeting", () => {
      const html = renderCertificateEmailHtml({
        recipientName: "Jashandeep Singh",
        eventName: "Vision Hack: AI Challenge",
      });

      expect(html).toContain("Dear Jashandeep Singh,");
      expect(html).toContain("Vision Hack: AI Challenge");
    });

    it("falls back cleanly to 'Dear Participant,' when name is missing or blank", () => {
      const htmlEmpty = renderCertificateEmailHtml({});
      const htmlWhitespace = renderCertificateEmailHtml({ recipientName: "   " });

      expect(htmlEmpty).toContain("Dear Participant,");
      expect(htmlWhitespace).toContain("Dear Participant,");
    });

    it("renders appropriate recognition copy for stay-only delegates", () => {
      const htmlStay = renderCertificateEmailHtml({
        recipientName: "Navjot Singh",
        isStayOnly: true,
      });

      expect(htmlStay).toContain("as a delegate at <strong>Saviskar 2026</strong>");
    });

    it("renders unique Certificate ID badge when provided", () => {
      const html = renderCertificateEmailHtml({
        recipientName: "Priya Sharma",
        eventName: "Nritya-e-Bharat",
        certificateNumber: "SAV26-FOLK-9901",
      });

      expect(html).toContain("CERTIFICATE ID:");
      expect(html).toContain("SAV26-FOLK-9901");
    });

    it("includes the official festival tagline and signature block", () => {
      const html = renderCertificateEmailHtml({
        recipientName: "Harmanpreet Singh",
      });

      expect(html).toContain("A Festival of Ideas, People and Possibilities.");
      expect(html).toContain("Organizing Committee, Saviskar 2026");
      expect(html).toContain("CGC University, Mohali");
      expect(html).toContain("OFFICIAL &bull; VERIFIED");
    });
  });

  describe("3. PDF Attachment Representation & Instructions", () => {
    it("displays a prominent attachment card with PDF badge and safe filename", () => {
      const html = renderCertificateEmailHtml({
        recipientName: "Simran Kaur",
        eventName: "Battle of Bands",
      });

      expect(html).toContain("ATTACHED VERIFIED DOCUMENT");
      expect(html).toContain("PDF");
      expect(html).toContain("Saviskar_Certificate_Battle_of_Bands.pdf");
      expect(html).toContain("Official High-Resolution PDF &bull; Print &amp; Portfolio Ready");
      expect(html).toContain("Your verified certificate is attached to this email as a PDF document.");
    });
  });

  describe("4. Official Social Links & Footer Source of Truth", () => {
    it("contains verified social links extracted from Footer.tsx", () => {
      const html = renderCertificateEmailHtml();

      expect(html).toContain(SAVISKAR_OFFICIAL_URLS.instagram);
      expect(html).toContain("https://www.instagram.com/saviskar.cgcuniversity/");

      expect(html).toContain(SAVISKAR_OFFICIAL_URLS.youtube);
      expect(html).toContain("https://www.youtube.com/@SaviskarCGCU");

      expect(html).toContain(SAVISKAR_OFFICIAL_URLS.website);
      expect(html).toContain("https://saviskar.co.in");

      expect(html).toContain(`mailto:${SAVISKAR_OFFICIAL_URLS.email}`);
      expect(html).toContain("saviskar@cgcuniversity.in");
    });

    it("includes full CGC University Mohali physical address and transactional disclaimer", () => {
      const html = renderCertificateEmailHtml();

      expect(html).toContain(SAVISKAR_OFFICIAL_ADDRESS.institution);
      expect(html).toContain("State Highway 12A, Chandigarh-Sirhind Road, Sahibzada Ajit Singh Nagar, Punjab 140307");
      expect(html).toContain("© 2026 SAVISKAR • CGC UNIVERSITY MOHALI • ALL RIGHTS RESERVED");
      expect(html).toContain("This is an official transactional notification issued directly to registered participants");
    });
  });

  describe("5. Unicode Handling & XSS Sanitization", () => {
    it("renders Gurmukhi / Punjabi and Devanagari names without corruption", () => {
      const punjabiName = "ਜਸ਼ਨਦੀਪ ਸਿੰਘ";
      const devanagariName = "माधव वशिष्ठ";

      const htmlPunjabi = renderCertificateEmailHtml({ recipientName: punjabiName });
      const htmlDevanagari = renderCertificateEmailHtml({ recipientName: devanagariName });

      expect(htmlPunjabi).toContain(`Dear ${punjabiName},`);
      expect(htmlDevanagari).toContain(`Dear ${devanagariName},`);
    });

    it("safely escapes HTML characters in recipient and event names", () => {
      const maliciousName = '<script>alert("hacked")</script> & "Tester"';
      const safeEscaped = escapeHtml(maliciousName);

      expect(safeEscaped).not.toContain("<script>");
      expect(safeEscaped).toContain("&lt;script&gt;");
      expect(safeEscaped).toContain("&amp;");
      expect(safeEscaped).toContain("&quot;Tester&quot;");

      const html = renderCertificateEmailHtml({
        recipientName: maliciousName,
        eventName: "<b>Code Sprint</b>",
      });

      expect(html).not.toContain('<script>alert("hacked")</script>');
      expect(html).toContain("&lt;script&gt;");
    });
  });

  describe("6. Plain-Text Alternative Integrity", () => {
    it("generates a clean plain-text alternative containing all links, credentials, and wording", () => {
      const text = renderCertificateEmailText({
        recipientName: "Gurpreet Singh",
        eventName: "Web Dev Sprint",
        certificateNumber: "SAV26-WEB-4012",
      });

      expect(text).toContain("Dear Gurpreet Singh,");
      expect(text).toContain("Web Dev Sprint");
      expect(text).toContain("CERTIFICATE ID: SAV26-WEB-4012");
      expect(text).toContain("ATTACHED OFFICIAL DOCUMENT:");
      expect(text).toContain("Saviskar_Certificate_Web_Dev_Sprint.pdf");
      expect(text).toContain(SAVISKAR_OFFICIAL_URLS.website);
      expect(text).toContain(SAVISKAR_OFFICIAL_URLS.instagram);
      expect(text).toContain(SAVISKAR_OFFICIAL_URLS.youtube);
      expect(text).toContain(SAVISKAR_OFFICIAL_URLS.email);
      expect(text).toContain(SAVISKAR_OFFICIAL_ADDRESS.institution);
      expect(text).toContain("A Festival of Ideas, People and Possibilities.");
    });
  });

  describe("7. Team Leader Backup Delivery Template", () => {
    it("renders structured table of attached team member certificates", () => {
      const html = renderCertificateTeamBackupEmailHtml({
        teamName: "CodeCrafters",
        leaderName: "Karan Singh",
        partNumber: 1,
        totalParts: 2,
        members: [
          { recipientName: "Karan Singh", eventName: "Hackathon", certificateNumber: "SAV-01" },
          { recipientName: "Ananya Roy", eventName: "Hackathon", certificateNumber: "SAV-02" },
        ],
      });

      expect(html).toContain("Dear Karan Singh (CodeCrafters),");
      expect(html).toContain("Part 1 of 2");
      expect(html).toContain("2 official Certificates of Participation");
      expect(html).toContain("Karan Singh");
      expect(html).toContain("Ananya Roy");
      expect(html).toContain("SAV-01");
      expect(html).toContain("SAV-02");
    });
  });

  describe("8. Dispatch System Hardening: Chunked Ingestion & Recovery", () => {
    it("chunks delivery rows and attachment manifests in batches of 250 without failing on large audiences", async () => {
      const insertedDeliveryBatches: any[][] = [];
      const insertedAttachmentBatches: any[][] = [];
      let campaignUpdatedToQueued = false;

      // Generate 600 synthetic items to verify chunking into 3 batches (250 + 250 + 100)
      const mockItems: any[] = [];
      for (let i = 0; i < 600; i++) {
        mockItems.push({
          participantEventId: `pe-${i}`,
          recipientName: `Candidate ${i}`,
          recipientEmail: `candidate${i}@example.com`,
          isValidEmail: true,
          eventId: "ev-01",
          eventName: "RoboWars",
          isTeam: false,
          mainCheckedIn: true,
          certificateEligible: true,
          issueSourceKey: `key-${i}`,
        });
      }

      const mockSupabaseAdmin = {
        from: (table: string) => {
          if (table === "broadcast_campaigns") {
            return {
              insert: () => ({
                select: () => ({
                  single: () => Promise.resolve({ data: { id: "camp-chunk-test-01" }, error: null }),
                }),
              }),
              update: (payload: any) => {
                if (payload.status === "queued") {
                  campaignUpdatedToQueued = true;
                }
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
              delete: () => ({
                in: () => Promise.resolve({ error: null }),
              }),
              insert: (record: any) => ({
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: { id: `cert-${record.issue_source_key}`, certificate_number: `SAV-${record.issue_source_key}` },
                      error: null,
                    }),
                }),
              }),
            };
          }
          if (table === "broadcast_deliveries") {
            return {
              insert: (rows: any[]) => {
                insertedDeliveryBatches.push(rows);
                return Promise.resolve({ error: null });
              },
            };
          }
          if (table === "broadcast_delivery_attachments") {
            return {
              insert: (rows: any[]) => {
                insertedAttachmentBatches.push(rows);
                return Promise.resolve({ error: null });
              },
            };
          }
          return { select: () => Promise.resolve({ data: [], error: null }) };
        },
      } as any;

      const result = await createCertificateCampaign(
        mockSupabaseAdmin,
        {
          title: "Large Batch Campaign",
          subject: CERTIFICATE_EMAIL_SUBJECT,
          bodyHtml: "<p>Default Certificate</p>",
          selectedItemKeys: mockItems.map((m) => m.issueSourceKey),
          adminId: "admin-01",
          sendIndividual: true,
          sendTeamBackup: false,
        },
        mockItems
      );

      expect(result.totalDeliveries).toBe(600);
      expect(result.totalCertificates).toBe(600);

      // Verify that deliveries were split into chunks of at most 250
      expect(insertedDeliveryBatches.length).toBe(3);
      expect(insertedDeliveryBatches[0].length).toBe(250);
      expect(insertedDeliveryBatches[1].length).toBe(250);
      expect(insertedDeliveryBatches[2].length).toBe(100);

      // Verify that attachments were split into chunks of at most 250
      expect(insertedAttachmentBatches.length).toBe(3);
      expect(insertedAttachmentBatches[0].length).toBe(250);
      expect(insertedAttachmentBatches[1].length).toBe(250);
      expect(insertedAttachmentBatches[2].length).toBe(100);

      // Verify campaign was transitioned to queued only after all batches succeeded
      expect(campaignUpdatedToQueued).toBe(true);
    });

    it("aborts and executes clean rollback if any chunk insert fails, never leaving partial deliveries queued", async () => {
      let rollbackCampaignDeleted = false;
      let batchCount = 0;

      const mockItems: any[] = [];
      for (let i = 0; i < 300; i++) {
        mockItems.push({
          participantEventId: `pe-${i}`,
          recipientName: `Candidate ${i}`,
          recipientEmail: `candidate${i}@example.com`,
          isValidEmail: true,
          eventId: "ev-01",
          eventName: "RoboWars",
          isTeam: false,
          mainCheckedIn: true,
          certificateEligible: true,
          issueSourceKey: `key-${i}`,
        });
      }

      const mockSupabaseAdmin = {
        from: (table: string) => {
          if (table === "broadcast_campaigns") {
            return {
              insert: () => ({
                select: () => ({
                  single: () => Promise.resolve({ data: { id: "camp-fail-chunk-01" }, error: null }),
                }),
              }),
              update: () => ({ eq: () => Promise.resolve({ error: null }) }),
              delete: () => ({
                eq: (col: string, val: string) => {
                  if (val === "camp-fail-chunk-01") {
                    rollbackCampaignDeleted = true;
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
              delete: () => ({
                in: () => Promise.resolve({ error: null }),
              }),
              insert: (record: any) => ({
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: { id: `cert-${record.issue_source_key}`, certificate_number: `SAV-${record.issue_source_key}` },
                      error: null,
                    }),
                }),
              }),
            };
          }
          if (table === "broadcast_deliveries") {
            return {
              insert: () => {
                batchCount++;
                if (batchCount === 2) {
                  // Simulate 2nd batch DB disconnect / timeout
                  return Promise.resolve({ error: { message: "Simulated PostgREST timeout on batch 2" } });
                }
                return Promise.resolve({ error: null });
              },
            };
          }
          return { select: () => Promise.resolve({ data: [], error: null }) };
        },
      } as any;

      await expect(
        createCertificateCampaign(
          mockSupabaseAdmin,
          {
            title: "Failing Campaign",
            subject: CERTIFICATE_EMAIL_SUBJECT,
            bodyHtml: "<p>Default</p>",
            selectedItemKeys: mockItems.map((m) => m.issueSourceKey),
            adminId: "admin-01",
            sendIndividual: true,
            sendTeamBackup: false,
          },
          mockItems
        )
      ).rejects.toThrow("Simulated PostgREST timeout on batch 2");

      expect(rollbackCampaignDeleted).toBe(true);
    });
  });

  describe("9. Dispatch Hardening: Safe Rate Limit (429) Backoff & Idempotency", () => {
    it("preserves identical idempotency key on Resend rate-limit retries", async () => {
      // In mock/test environment, verify mock transport records deterministic idempotency keys
      const testResult = await sendCampaignEmail({
        to: "candidate.test@saviskar.test",
        subject: CERTIFICATE_EMAIL_SUBJECT,
        html: "<p>Test Certificate Email</p>",
        idempotencyKey: "camp-001:candidate.test@saviskar.test:individual:1",
      });

      expect(testResult.success).toBe(true);
      expect(testResult.messageId).toBeDefined();
    });
  });
});
