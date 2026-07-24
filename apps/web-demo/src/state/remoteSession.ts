import { createClient } from "@supabase/supabase-js";
import type { TrustSession } from "@trustmode/core";

const supabase = createClient(
  "https://rslkmylqvmzopgehjrkz.supabase.co",
  "sb_publishable_uE8Uw0dQ7MJRo4xJFp6Gzw_v-VS5C6F",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export interface RemoteCredentials {
  role: "owner" | "helper";
  ownerSecret?: string;
  helperToken?: string;
  verificationCode?: string;
}

function assertData(data: unknown, error: { message: string } | null): TrustSession {
  if (error || !data || typeof data !== "object") throw new Error(error?.message || "TrustMode could not reach the shared session service.");
  return data as TrustSession;
}

export function createOwnerSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createRemoteSession(session: TrustSession, ownerSecret: string): Promise<TrustSession> {
  const { data, error } = await supabase.rpc("tm_create_session", {
    p_session_id: session.id,
    p_owner_secret: ownerSecret,
    p_helper_token: session.invite.token,
    p_verification_code: session.invite.verificationCode,
    p_state: session,
    p_expires_at: session.invite.expiresAt,
  });
  return assertData(data, error);
}

export async function loadOwnerSession(sessionId: string, ownerSecret: string): Promise<TrustSession> {
  const { data, error } = await supabase.rpc("tm_owner_session", { p_session_id: sessionId, p_owner_secret: ownerSecret });
  return assertData(data, error);
}

export async function loadHelperSession(sessionId: string, helperToken: string): Promise<TrustSession> {
  const { data, error } = await supabase.rpc("tm_helper_session", { p_session_id: sessionId, p_helper_token: helperToken });
  return assertData(data, error);
}

export async function verifyHelperSession(sessionId: string, helperToken: string, verificationCode: string, displayName: string): Promise<TrustSession> {
  const { data, error } = await supabase.rpc("tm_helper_join", {
    p_session_id: sessionId,
    p_helper_token: helperToken,
    p_code: verificationCode,
    p_helper_name: displayName,
  });
  return assertData(data, error);
}

export async function saveRemoteSession(session: TrustSession, expectedRevision: number, credentials: RemoteCredentials): Promise<TrustSession> {
  const result = credentials.role === "owner"
    ? await supabase.rpc("tm_save_owner_session", {
      p_session_id: session.id,
      p_owner_secret: credentials.ownerSecret,
      p_expected_revision: expectedRevision,
      p_state: session,
    })
    : await supabase.rpc("tm_save_helper_session", {
      p_session_id: session.id,
      p_helper_token: credentials.helperToken,
      p_code: credentials.verificationCode,
      p_expected_revision: expectedRevision,
      p_state: session,
    });
  return assertData(result.data, result.error);
}
