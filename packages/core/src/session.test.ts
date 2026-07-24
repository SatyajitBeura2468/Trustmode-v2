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
    displayName: "Nandu Beura",
  }, "2026-07-23T12:01:00.000Z");
}

describe("TrustMode session engine", () => {
  it("creates deterministic, expiring invitation sessions without a preset helper", () => {
    const first = createSession({ scenarioId: "scholarship", mode: "together", now, entropy: "test-seed" });
    const second = createSession({ scenarioId: "scholarship", mode: "together", now, entropy: "test-seed" });
    expect(first.id).toBe(second.id);
    expect(first.invite.token).toBe(second.invite.token);
    expect(first.invite.verificationCode).toMatch(/^\d{6}$/);
    expect(first.helper).toBeUndefined();
    expect(first.schemaVersion).toBe(2);
  });

  it("requires both a valid invitation and a real helper name", () => {
    const session = createSession({ scenarioId: "scholarship", mode: "together", now, entropy: "test-seed" });
    expect(() => reduceSession(session, {
      type: "JOIN_HELPER",
      actor: "helper",
      token: "invalid",
      code: "000000",
      displayName: "Som",
    }, "2026-07-23T12:01:00.000Z")).toThrowError(SessionCommandError);
    expect(() => reduceSession(session, {
      type: "JOIN_HELPER",
      actor: "helper",
      token: session.invite.token,
      code: session.invite.verificationCode,
      displayName: " ",
    }, "2026-07-23T12:01:00.000Z")).toThrowError(/real name/i);
  });

  it("stores the verified helper name and sends a custom suggestion", () => {
    const joined = joinedSession();
    expect(joined.helper?.displayName).toBe("Nandu Beura");

    const sent = reduceSession(joined, {
      type: "SEND_PROPOSALS",
      actor: "helper",
      suggestions: [{ proposalId: "board", value: "CHSE Odisha" }],
    }, "2026-07-23T12:02:00.000Z");
    expect(sent.proposalRecords.board.status).toBe("pending");
    expect(sent.proposalRecords.board.suggestedValue).toBe("CHSE Odisha");
    expect(sent.proposalRecords.board.policy?.code).toBe("TM-POL-101");

    const applied = reduceSession(sent, {
      type: "DECIDE",
      actor: "owner",
      proposalId: "board",
      decision: "approve",
    }, "2026-07-23T12:03:00.000Z");
    expect(applied.proposalRecords.board.status).toBe("applied");
    expect(applied.portalValues.board).toBe("CHSE Odisha");
    expect(applied.events.at(-1)?.type).toBe("PROPOSAL_APPLIED");
  });

  it("lets the owner enter a different answer without pretending it came from the helper", () => {
    const joined = joinedSession();
    const edited = reduceSession(joined, {
      type: "SET_FIELD",
      actor: "owner",
      proposalId: "board",
      value: "State Board",
    }, "2026-07-23T12:02:00.000Z");
    expect(edited.portalValues.board).toBe("State Board");
    expect(edited.proposalRecords.board.source).toBe("owner");
    expect(edited.events.at(-1)?.type).toBe("OWNER_FIELD_EDITED");
  });

  it("prevents helper commands while paused and revokes pending work on stop", () => {
    const joined = joinedSession();
    const paused = reduceSession(joined, { type: "PAUSE", actor: "owner" }, "2026-07-23T12:02:00.000Z");
    expect(() => reduceSession(paused, {
      type: "SEND_PROPOSALS",
      actor: "helper",
      suggestions: [{ proposalId: "board", value: "CBSE" }],
    }, "2026-07-23T12:03:00.000Z")).toThrowError(/Resume help/);
    const stopped = reduceSession(paused, { type: "STOP", actor: "owner" }, "2026-07-23T12:04:00.000Z");
    expect(stopped.status).toBe("stopped");
    expect(stopped.invite.revokedAt).toBeTruthy();
    expect(stopped.proposalRecords.board.status).toBe("revoked");
  });

  it("finishes unresolved prepared fields without claiming a real submission", () => {
    const joined = joinedSession();
    const completed = reduceSession(joined, { type: "COMPLETE", actor: "owner" }, "2026-07-23T12:10:00.000Z");
    expect(completed.status).toBe("completed");
    expect(completed.proposalRecords.board.status).toBe("revoked");
    expect(completed.events.at(-1)?.summary).toMatch(/No real form was submitted/);
  });

  it("produces a redacted integrity-linked receipt", () => {
    const joined = joinedSession();
    const receipt = createReceipt(joined, "2026-07-23T12:10:00.000Z");
    expect(receipt.sessionId).toBe(joined.id);
    expect(receipt.integrity).toBe(joined.events.at(-1)?.integrity);
    expect(receipt.retained).toMatch(/No credentials/);
  });
});
