-- A helper identity is supplied by the actual joining person and stored atomically
-- with successful code verification. Preset scenario names are never accepted.

alter table public.trustmode_sessions
  add column if not exists helper_joined_at timestamptz;

-- The existing three-argument join remains temporarily available during the rolling
-- frontend deployment. A follow-up migration removes it after the named join ships.
create or replace function public.tm_helper_join(
  p_session_id text,
  p_helper_token text,
  p_code text,
  p_helper_name text
) returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare
  stored public.trustmode_sessions;
  next_state jsonb;
  clean_name text := regexp_replace(btrim(coalesce(p_helper_name, '')), '\s+', ' ', 'g');
  now_iso text := now()::text;
  existing_name text;
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
  if char_length(clean_name) < 2 or char_length(clean_name) > 60 or clean_name !~ '[[:alnum:]]' then
    raise exception 'enter a name using 2 to 60 letters or numbers' using errcode = '22023';
  end if;
  if stored.expires_at <= now() or coalesce(stored.state->>'status', '') in ('stopped', 'expired', 'completed') then
    raise exception 'help invitation expired or ended' using errcode = '42501';
  end if;

  existing_name := nullif(stored.state->'helper'->>'displayName', '');
  if existing_name is not null then
    if existing_name = clean_name then return stored.state; end if;
    raise exception 'someone has already joined using this invitation' using errcode = '42501';
  end if;

  next_state := jsonb_set(stored.state, '{invite,joinedAt}', to_jsonb(now_iso), true);
  next_state := jsonb_set(next_state, '{helper}', jsonb_build_object('displayName', clean_name, 'joinedAt', now_iso), true);
  next_state := jsonb_set(next_state, '{updatedAt}', to_jsonb(now_iso), true);
  next_state := jsonb_set(next_state, '{lastActiveAt}', to_jsonb(now_iso), true);
  next_state := jsonb_set(next_state, '{revision}', to_jsonb(stored.revision + 1), true);

  update public.trustmode_sessions
    set state = next_state,
        revision = stored.revision + 1,
        helper_joined_at = now(),
        verification_attempts = 0,
        verification_locked_until = null,
        updated_at = now()
    where session_id = p_session_id;
  return next_state;
end;
$$;

-- Helper writes may add exactly one reviewed suggestion event. They cannot rename
-- themselves, rewrite the invitation, claim owner actions, change form values, or
-- mutate any other top-level session data.
create or replace function public.tm_save_helper_session(
  p_session_id text,
  p_helper_token text,
  p_code text,
  p_expected_revision integer,
  p_state jsonb
) returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare
  stored public.trustmode_sessions;
  candidate jsonb;
  changed_records integer;
  changed_record jsonb;
  previous_record jsonb;
  changed_key text;
  old_events integer;
  new_events integer;
  last_event jsonb;
begin
  select * into stored from public.trustmode_sessions where session_id = p_session_id for update;
  if not found or stored.helper_token_hash <> public.tm_hash(p_helper_token) or stored.verification_code_hash <> public.tm_hash(p_code) then
    raise exception 'help invitation unavailable' using errcode = '42501';
  end if;
  if stored.expires_at <= now() or coalesce(stored.state->>'status', '') <> 'active' then
    raise exception 'help is paused, ended or expired' using errcode = '42501';
  end if;
  if stored.revision <> p_expected_revision then
    raise exception 'this information changed; refresh and try again' using errcode = '40001';
  end if;
  if p_session_id <> p_state->>'id' or coalesce((p_state->>'revision')::integer, -1) <> p_expected_revision + 1 then
    raise exception 'invalid helper update' using errcode = '22023';
  end if;

  candidate := public.tm_scrub_state(p_state);
  if (candidate - array['proposalRecords','events','revision','updatedAt','lastActiveAt'])
       is distinct from
     (stored.state - array['proposalRecords','events','revision','updatedAt','lastActiveAt']) then
    raise exception 'helpers cannot change identity, permissions, owner data or session controls' using errcode = '42501';
  end if;

  if (select array_agg(key order by key) from jsonb_object_keys(candidate->'proposalRecords') as keys(key))
       is distinct from
     (select array_agg(key order by key) from jsonb_object_keys(stored.state->'proposalRecords') as keys(key)) then
    raise exception 'helper update changed the permitted field list' using errcode = '42501';
  end if;

  select count(*), min(key)
    into changed_records, changed_key
    from jsonb_each(candidate->'proposalRecords') incoming(key, value)
    where incoming.value is distinct from (stored.state->'proposalRecords')->incoming.key;
  if changed_records <> 1 then
    raise exception 'send one suggestion at a time' using errcode = '22023';
  end if;

  changed_record := candidate->'proposalRecords'->changed_key;
  previous_record := stored.state->'proposalRecords'->changed_key;
  if coalesce(previous_record->>'status', '') not in ('prepared', 'changes-requested')
     or coalesce(changed_record->>'status', '') not in ('pending', 'blocked')
     or nullif(btrim(changed_record->>'suggestedValue'), '') is null
     or char_length(changed_record->>'suggestedValue') > 240 then
    raise exception 'invalid suggestion transition' using errcode = '42501';
  end if;

  old_events := jsonb_array_length(coalesce(stored.state->'events', '[]'::jsonb));
  new_events := jsonb_array_length(coalesce(candidate->'events', '[]'::jsonb));
  if new_events <> old_events + 1
     or (candidate->'events' - old_events) is distinct from stored.state->'events' then
    raise exception 'helper activity history is invalid' using errcode = '42501';
  end if;
  last_event := candidate->'events'->old_events;
  if last_event->>'actor' <> 'helper' or coalesce(last_event->>'type', '') not in ('PROPOSAL_SENT', 'PROPOSAL_BLOCKED') then
    raise exception 'helpers cannot claim owner or system activity' using errcode = '42501';
  end if;

  update public.trustmode_sessions
    set state = candidate,
        revision = p_expected_revision + 1,
        updated_at = now()
    where session_id = p_session_id;
  return candidate;
end;
$$;

revoke all on function public.tm_helper_join(text, text, text, text) from public;
grant execute on function public.tm_helper_join(text, text, text, text) to anon, authenticated;
revoke all on function public.tm_save_helper_session(text, text, text, integer, jsonb) from public;
grant execute on function public.tm_save_helper_session(text, text, text, integer, jsonb) to anon, authenticated;
