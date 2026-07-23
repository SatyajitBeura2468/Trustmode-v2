create extension if not exists pgcrypto;

create table if not exists public.trustmode_sessions (
  session_id text primary key check (session_id like 'TM-%'),
  state jsonb not null,
  owner_secret_hash text not null,
  helper_token_hash text not null,
  verification_code_hash text not null,
  expires_at timestamptz not null,
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trustmode_sessions_expires_at_idx
  on public.trustmode_sessions (expires_at);

alter table public.trustmode_sessions enable row level security;
alter table public.trustmode_sessions force row level security;
revoke all on table public.trustmode_sessions from anon, authenticated, public;

create or replace function public.tm_hash(value text)
returns text language sql immutable strict
as $$ select encode(digest(value, 'sha256'), 'hex') $$;

create or replace function public.tm_scrub_state(input_state jsonb)
returns jsonb language sql immutable strict
as $$ select input_state #- '{invite,token}' #- '{invite,verificationCode}' $$;

create or replace function public.tm_create_session(
  p_session_id text,
  p_owner_secret text,
  p_helper_token text,
  p_verification_code text,
  p_state jsonb,
  p_expires_at timestamptz
) returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if p_session_id <> p_state->>'id' or length(p_owner_secret) < 32 or length(p_helper_token) < 16 or p_verification_code !~ '^\d{6}$' then
    raise exception 'invalid session capability payload' using errcode = '22023';
  end if;
  insert into public.trustmode_sessions (
    session_id, state, owner_secret_hash, helper_token_hash, verification_code_hash, expires_at, revision
  ) values (
    p_session_id, public.tm_scrub_state(p_state), public.tm_hash(p_owner_secret), public.tm_hash(p_helper_token),
    public.tm_hash(p_verification_code), p_expires_at, coalesce((p_state->>'revision')::integer, 0)
  );
  return public.tm_scrub_state(p_state);
end;
$$;

create or replace function public.tm_owner_session(p_session_id text, p_owner_secret text)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare stored public.trustmode_sessions;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id;
  if not found or stored.owner_secret_hash <> public.tm_hash(p_owner_secret) then
    raise exception 'owner capability unavailable' using errcode = '42501';
  end if;
  return stored.state;
end;
$$;

create or replace function public.tm_helper_session(p_session_id text, p_helper_token text)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare stored public.trustmode_sessions;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id;
  if not found or stored.helper_token_hash <> public.tm_hash(p_helper_token) then
    raise exception 'helper capability unavailable' using errcode = '42501';
  end if;
  return stored.state;
end;
$$;

create or replace function public.tm_helper_join(p_session_id text, p_helper_token text, p_code text)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare stored public.trustmode_sessions; next_state jsonb; now_iso text := now()::text;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id for update;
  if not found or stored.helper_token_hash <> public.tm_hash(p_helper_token) or stored.verification_code_hash <> public.tm_hash(p_code) then
    raise exception 'helper capability unavailable' using errcode = '42501';
  end if;
  if stored.expires_at <= now() or coalesce(stored.state->>'status', '') in ('stopped', 'expired', 'completed') then
    raise exception 'helper capability expired or revoked' using errcode = '42501';
  end if;
  next_state := jsonb_set(jsonb_set(jsonb_set(stored.state, '{invite,joinedAt}', to_jsonb(now_iso), true), '{updatedAt}', to_jsonb(now_iso), true), '{lastActiveAt}', to_jsonb(now_iso), true);
  next_state := jsonb_set(next_state, '{revision}', to_jsonb(stored.revision + 1), true);
  update public.trustmode_sessions set state = next_state, revision = stored.revision + 1, updated_at = now() where session_id = p_session_id;
  return next_state;
end;
$$;

create or replace function public.tm_save_owner_session(p_session_id text, p_owner_secret text, p_expected_revision integer, p_state jsonb)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare stored public.trustmode_sessions; cleaned jsonb;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id for update;
  if not found or stored.owner_secret_hash <> public.tm_hash(p_owner_secret) then raise exception 'owner capability unavailable' using errcode = '42501'; end if;
  if stored.revision <> p_expected_revision then raise exception 'session changed in another browser' using errcode = '40001'; end if;
  if p_session_id <> p_state->>'id' or coalesce((p_state->>'revision')::integer, -1) <= p_expected_revision then raise exception 'invalid owner revision' using errcode = '22023'; end if;
  cleaned := public.tm_scrub_state(p_state);
  update public.trustmode_sessions set state = cleaned, revision = (cleaned->>'revision')::integer, expires_at = (cleaned->'invite'->>'expiresAt')::timestamptz, updated_at = now() where session_id = p_session_id;
  return cleaned;
end;
$$;

create or replace function public.tm_save_helper_session(p_session_id text, p_helper_token text, p_code text, p_expected_revision integer, p_state jsonb)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare stored public.trustmode_sessions; cleaned jsonb;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id for update;
  if not found or stored.helper_token_hash <> public.tm_hash(p_helper_token) or stored.verification_code_hash <> public.tm_hash(p_code) then raise exception 'helper capability unavailable' using errcode = '42501'; end if;
  if stored.expires_at <= now() or coalesce(stored.state->>'status', '') <> 'active' then raise exception 'session is not accepting helper changes' using errcode = '42501'; end if;
  if stored.revision <> p_expected_revision then raise exception 'session changed in another browser' using errcode = '40001'; end if;
  if p_session_id <> p_state->>'id' or coalesce((p_state->>'revision')::integer, -1) <= p_expected_revision then raise exception 'invalid helper revision' using errcode = '22023'; end if;
  if p_state->'portalValues' <> stored.state->'portalValues' then raise exception 'helpers cannot write portal values' using errcode = '42501'; end if;
  cleaned := public.tm_scrub_state(p_state);
  update public.trustmode_sessions set state = cleaned, revision = (cleaned->>'revision')::integer, updated_at = now() where session_id = p_session_id;
  return cleaned;
end;
$$;

revoke all on function public.tm_hash(text), public.tm_scrub_state(jsonb) from public;
grant execute on function public.tm_create_session(text, text, text, text, jsonb, timestamptz) to anon, authenticated;
grant execute on function public.tm_owner_session(text, text) to anon, authenticated;
grant execute on function public.tm_helper_session(text, text) to anon, authenticated;
grant execute on function public.tm_helper_join(text, text, text) to anon, authenticated;
grant execute on function public.tm_save_owner_session(text, text, integer, jsonb) to anon, authenticated;
grant execute on function public.tm_save_helper_session(text, text, text, integer, jsonb) to anon, authenticated;
