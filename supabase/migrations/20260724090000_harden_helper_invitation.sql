-- Additive hardening for public, capability-backed synthetic sessions.
alter table public.trustmode_sessions
  add column if not exists verification_attempts integer not null default 0 check (verification_attempts >= 0),
  add column if not exists verification_locked_until timestamptz;

create or replace function public.tm_helper_join(p_session_id text, p_helper_token text, p_code text)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare stored public.trustmode_sessions; next_state jsonb; now_iso text := now()::text;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id for update;
  if not found or stored.helper_token_hash <> public.tm_hash(p_helper_token) then
    raise exception 'help invitation unavailable' using errcode = '42501';
  end if;
  if stored.verification_locked_until is not null and stored.verification_locked_until > now() then
    raise exception 'too many attempts; wait before trying again' using errcode = '42501';
  end if;
  if stored.verification_code_hash <> public.tm_hash(p_code) then
    update public.trustmode_sessions
      set verification_attempts = verification_attempts + 1,
          verification_locked_until = case when verification_attempts + 1 >= 5 then now() + interval '10 minutes' else null end,
          updated_at = now()
      where session_id = p_session_id;
    raise exception 'that code did not work' using errcode = '42501';
  end if;
  if stored.expires_at <= now() or coalesce(stored.state->>'status', '') in ('stopped', 'expired', 'completed') then
    raise exception 'help invitation expired or ended' using errcode = '42501';
  end if;
  next_state := jsonb_set(jsonb_set(jsonb_set(stored.state, '{invite,joinedAt}', to_jsonb(now_iso), true), '{updatedAt}', to_jsonb(now_iso), true), '{lastActiveAt}', to_jsonb(now_iso), true);
  next_state := jsonb_set(next_state, '{revision}', to_jsonb(stored.revision + 1), true);
  update public.trustmode_sessions set state = next_state, revision = stored.revision + 1, verification_attempts = 0, verification_locked_until = null, updated_at = now() where session_id = p_session_id;
  return next_state;
end;
$$;

-- A helper may only move an existing suggestion from ready-for-review to pending/blocked,
-- or append a helper-authored message. Owner state, form values, session status and permissions stay immutable.
create or replace function public.tm_save_helper_session(p_session_id text, p_helper_token text, p_code text, p_expected_revision integer, p_state jsonb)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare stored public.trustmode_sessions; cleaned jsonb;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id for update;
  if not found or stored.helper_token_hash <> public.tm_hash(p_helper_token) or stored.verification_code_hash <> public.tm_hash(p_code) then raise exception 'help invitation unavailable' using errcode = '42501'; end if;
  if stored.expires_at <= now() or coalesce(stored.state->>'status', '') <> 'active' then raise exception 'help is paused, ended or expired' using errcode = '42501'; end if;
  if stored.revision <> p_expected_revision then raise exception 'this information changed; refresh and try again' using errcode = '40001'; end if;
  if p_session_id <> p_state->>'id' or coalesce((p_state->>'revision')::integer, -1) <= p_expected_revision then raise exception 'invalid helper update' using errcode = '22023'; end if;
  if p_state->'portalValues' <> stored.state->'portalValues'
     or p_state->'contract' <> stored.state->'contract'
     or p_state->>'status' <> stored.state->>'status'
     or p_state->>'scenarioId' <> stored.state->>'scenarioId' then raise exception 'helpers cannot change protected information or session controls' using errcode = '42501'; end if;
  cleaned := public.tm_scrub_state(p_state);
  update public.trustmode_sessions set state = cleaned, revision = (cleaned->>'revision')::integer, updated_at = now() where session_id = p_session_id;
  return cleaned;
end;
$$;

revoke all on function public.tm_helper_join(text, text, text) from public;
grant execute on function public.tm_helper_join(text, text, text) to anon, authenticated;
revoke all on function public.tm_save_helper_session(text, text, text, integer, jsonb) from public;
grant execute on function public.tm_save_helper_session(text, text, text, integer, jsonb) to anon, authenticated;
