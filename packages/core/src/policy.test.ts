import { describe, expect, it } from "vitest";
import { detectDangerousSequence, evaluateProposal, redact } from "./policy";
import { scenarios } from "./scenarios";

describe("TrustMode policy", () => {
  it("allows a safe semantic field proposal", () => {
    expect(evaluateProposal(scenarios.scholarship.proposals[0]).allowed).toBe(true);
  });

  it("blocks password changes", () => {
    expect(evaluateProposal({ ...scenarios.scholarship.proposals[0], action: "account-change", statement: "Change password" }).code).toBe("ACTION_BLOCKED");
  });

  it("detects account takeover sequences", () => {
    expect(detectDangerousSequence(["Open recovery settings", "Change phone number"]).code).toBe("DANGEROUS_SEQUENCE");
  });

  it("redacts identity-like values", () => {
    expect(redact("ID 123456789012 email owner@example.com")).not.toContain("123456789012");
    expect(redact("ID 123456789012 email owner@example.com")).not.toContain("owner@example.com");
  });
});
