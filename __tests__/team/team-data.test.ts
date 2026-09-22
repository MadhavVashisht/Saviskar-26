import { describe, it, expect } from "vitest";
import {
  FACULTY_LEADERSHIP,
  FACULTY_DIRECTORATE,
  SAC_OFFICE_BEARERS,
  SAC_CORE_LEADS,
  SAC_COUNCIL_MEMBERS,
  ALL_SAC_MEMBERS,
  TEAM_STATS,
  TIER_1_BYTE,
  TIER_2_BYTE,
  SAC_COLLECTIVE_BYTE,
} from "@/data/teamData";

describe("Organising Team Data Structure with Exact Student Roster", () => {
  it("should have exactly 1 Tier 1 Apex Leader (Mrs. Bismin Dhaliwal)", () => {
    expect(FACULTY_LEADERSHIP).toHaveLength(1);
    expect(FACULTY_LEADERSHIP[0].name).toBe("Mrs. Bismin Dhaliwal");
    expect(FACULTY_LEADERSHIP[0].designation).toBe("Director Students Affairs");
    expect(FACULTY_LEADERSHIP[0].tier).toBe("tier1");
  });

  it("should have exactly 5 Tier 2 Leaders (Dr. Sachin Sharma & Directorate)", () => {
    expect(FACULTY_DIRECTORATE).toHaveLength(5);
    expect(FACULTY_DIRECTORATE[0].name).toBe("Dr. Sachin Sharma");
    expect(FACULTY_DIRECTORATE[0].designation).toBe("Dean Student Affairs");
    expect(FACULTY_DIRECTORATE[1].name).toBe("Mr. Vaibhav Kelay");
    expect(FACULTY_DIRECTORATE[2].name).toBe("Mrs. Monika Dhaliwal");
    expect(FACULTY_DIRECTORATE[3].name).toBe("Mr. Anand Kumar");
    expect(FACULTY_DIRECTORATE[4].name).toBe("Mr. Aditya");
  });

  it("should have exactly 2 SAC Office Bearers: Lakshita as President and Aadit Bhardwaj as Vice President", () => {
    expect(SAC_OFFICE_BEARERS).toHaveLength(2);
    expect(TEAM_STATS.sacOfficeBearersCount).toBe(2);

    const lakshita = SAC_OFFICE_BEARERS.find((m) => m.name === "Lakshita");
    expect(lakshita).toBeDefined();
    expect(lakshita?.role).toBe("President, Student Advisory Council (SAC)");

    const aadit = SAC_OFFICE_BEARERS.find((m) => m.name === "Aadit Bhardwaj");
    expect(aadit).toBeDefined();
    expect(aadit?.role).toBe("Vice President, Student Advisory Council (SAC)");
  });

  it("should have exactly 19 other Core Members in SAC_CORE_LEADS (21 Core total with President & VP)", () => {
    expect(SAC_CORE_LEADS).toHaveLength(19);
    expect(TEAM_STATS.totalCoreTeamCount).toBe(21);
    SAC_CORE_LEADS.forEach((member) => {
      expect(member.tier).toBe("core");
      expect(member.name).toBeTruthy();
      expect(member.role).toContain("Core Member");
    });
  });

  it("should have exactly 32 Council Members in SAC_COUNCIL_MEMBERS", () => {
    expect(SAC_COUNCIL_MEMBERS).toHaveLength(32);
    expect(TEAM_STATS.sacCouncilMembersCount).toBe(32);
    SAC_COUNCIL_MEMBERS.forEach((member) => {
      expect(member.tier).toBe("council");
      expect(member.name).toBeTruthy();
    });

    // Check specific member Madhav Vashisht is present
    const madhav = SAC_COUNCIL_MEMBERS.find((m) => m.name === "Madhav Vashisht");
    expect(madhav).toBeDefined();
  });

  it("should have exactly 53 members in ALL_SAC_MEMBERS (2 office bearers + 19 core + 32 council)", () => {
    expect(ALL_SAC_MEMBERS).toHaveLength(53);
    expect(TEAM_STATS.totalSacCount).toBe(53);
  });

  it("should ensure all members have image property defined for future updates", () => {
    const allMembers = [
      ...FACULTY_LEADERSHIP,
      ...FACULTY_DIRECTORATE,
      ...ALL_SAC_MEMBERS,
    ];
    allMembers.forEach((member) => {
      expect(member).toHaveProperty("image");
    });
  });

  it("should ensure all member IDs are globally unique", () => {
    const allIds = [
      ...FACULTY_LEADERSHIP.map((m) => m.id),
      ...FACULTY_DIRECTORATE.map((m) => m.id),
      ...ALL_SAC_MEMBERS.map((m) => m.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("should provide non-empty quote soundbites for Tier 1, Tier 2, and SAC collective", () => {
    expect(TIER_1_BYTE.quote.length).toBeGreaterThan(20);
    expect(TIER_1_BYTE.attribution).toContain("Bismin");
    expect(TIER_2_BYTE.quote.length).toBeGreaterThan(20);
    expect(TIER_2_BYTE.attribution).toContain("Sachin");
    expect(SAC_COLLECTIVE_BYTE.quote.length).toBeGreaterThan(20);
    expect(SAC_COLLECTIVE_BYTE.attribution).toBeTruthy();
  });
});
