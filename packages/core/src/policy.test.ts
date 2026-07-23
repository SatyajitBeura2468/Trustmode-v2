import { describe, expect, it } from "vitest";
import { detectDangerousSequence, evaluateProposal, redact } from "./policy";
import { scenarios } from "./scenarios";

describe("TrustMode policy", () => {
  it("allows a safe semantic field proposal and reports every check", () => {
    const proposal = scenarios.scholarship.proposals[0];
    const decision = evaluateProposal(proposal, {
      scenarioId: "scholarship",
      allowedTargets: scenarios.scholarship.allowedTargets,
      allowedActions: ["set-field", "attach-document"],
      currentValues: { board: "Not provided" },
    });
    expect(decision.allowed).toBe(true);
    expect(decision.code).toBe("TM-POL-101");
    expect(decision.checks).toHaveLength(6);
    expect(decision.checks.every((check) => check.passed)).toBe(true);
  });

  it("blocks password changes as an owner-only action", () => {
    const unsafe = {
      ...scenarios.scholarship.proposals[0],
      action: "account-change" as const,
      statement: "Change password",
    };
    expect(evaluateProposal(unsafe).allowed).toBe(false);
    expect(evaluateProposal(unsafe).risk).toBe("blocked");
  });

  it("rejects stale owner-side values before application", () => {
    const proposal = scenarios.scholarship.proposals[0];
    const decision = evaluateProposal(proposal, {
      scenarioId: "scholarship",
      allowedTargets: scenarios.scholarship.allowedTargets,
      allowedActions: ["set-field"],
      currentValues: { board: "ICSE" },
    });
    expect(decision.code).toBe("TM-POL-304");
    expect(decision.allowed).toBe(false);
  });

  it("detects account takeover sequences", () => {
    expect(detectDangerousSequence(["Open recovery settings", "Change phone number"]).code).toBe("TM-SEQ-900");
  });

  it("redacts identity-like and secret values", () => {
    const output = redact("ID 123456789012 email owner@example.com OTP: 928144");
    expect(output).not.toContain("123456789012");
    expect(output).not.toContain("owner@example.com");
    expect(output).not.toContain("928144");
  });
});
