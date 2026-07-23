import { describe, expect, it } from "vitest";
import { createReceipt, createSession, reduceSession, SessionCommandError } from "./session";

const now = "2026-07-23T12:00:00.000Z";

function joinedSession() {
  const created = createSession({ scenarioId: "scholarship", mode: "together", now, entropy: "test-seed" });
  return reduceSession(created, {
    type: "JOIN_HELPER",
    actor: "helper",
    token: created.invite.token,
    code: created.invite.verificationCode,
  }, "2026-07-23T12:01:00.000Z");
}

describe("TrustMode session engine", () => {
  it("creates deterministic, expiring capability sessions", () => {
    const first = createSession({ scenarioId: "scholarship", mode: "together", now, entropy: "test-seed" });
    const second = createSession({ scenarioId: "scholarship", mode: "together", now, entropy: "test-seed" });
    expect(first.id).toBe(second.id);
    expect(first.invite.token).toBe(second.invite.token);
    expect(first.invite.verificationCode).toMatch(/^\d{6}$/);
    expect(first.schemaVersion).toBe(2);
  });

  it("rejects invalid helper capabilities", () => {
    const session = createSession({ scenarioId: "scholarship", mode: "together", now, entropy: "test-seed" });
    expect(() => reduceSession(session, {
      type: "JOIN_HELPER",
      actor: "helper",
      token: "invalid",
      code: "000000",
    }, "2026-07-23T12:01:00.000Z")).toThrowError(SessionCommandError);
  });

  it("sends, validates, reviews, and applies a proposal owner-side", () => {
    const joined = joinedSession();
    const sent = reduceSession(joined, {
      type: "SEND_PROPOSALS",
      actor: "helper",
      proposalIds: ["board"],
    }, "2026-07-23T12:02:00.000Z");
    expect(sent.proposalRecords.board.status).toBe("pending");
    expect(sent.proposalRecords.board.policy?.code).toBe("TM-POL-101");

    const applied = reduceSession(sent, {
      type: "DECIDE",
      actor: "owner",
      proposalId: "board",
      decision: "approve",
    }, "2026-07-23T12:03:00.000Z");
    expect(applied.proposalRecords.board.status).toBe("applied");
    expect(applied.portalValues.board).toBe("CBSE");
    expect(applied.events.at(-1)?.type).toBe("PROPOSAL_APPLIED");
  });

  it("prevents helper commands while paused and revokes pending work on stop", () => {
    const joined = joinedSession();
    const paused = reduceSession(joined, { type: "PAUSE", actor: "owner" }, "2026-07-23T12:02:00.000Z");
    expect(() => reduceSession(paused, {
      type: "SEND_PROPOSALS",
      actor: "helper",
      proposalIds: ["board"],
    }, "2026-07-23T12:03:00.000Z")).toThrowError(/Resume the session/);
    const stopped = reduceSession(paused, { type: "STOP", actor: "owner" }, "2026-07-23T12:04:00.000Z");
    expect(stopped.status).toBe("stopped");
    expect(stopped.invite.revokedAt).toBeTruthy();
    expect(stopped.proposalRecords.board.status).toBe("revoked");
  });

  it("produces a redacted integrity-linked receipt", () => {
    const joined = joinedSession();
    const receipt = createReceipt(joined, "2026-07-23T12:10:00.000Z");
    expect(receipt.sessionId).toBe(joined.id);
    expect(receipt.integrity).toBe(joined.events.at(-1)?.integrity);
    expect(receipt.retained).toMatch(/No credentials/);
  });
});
