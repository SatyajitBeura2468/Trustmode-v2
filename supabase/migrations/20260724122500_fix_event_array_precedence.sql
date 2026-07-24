-- Parenthesize JSON array access before applying integer-index operators.
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
  if (candidate - 'proposalRecords'::text - 'events'::text - 'revision'::text - 'updatedAt'::text - 'lastActiveAt'::text)
       is distinct from
     (stored.state - 'proposalRecords'::text - 'events'::text - 'revision'::text - 'updatedAt'::text - 'lastActiveAt'::text) then
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
     or ((candidate->'events') - old_events) is distinct from (stored.state->'events') then
    raise exception 'helper activity history is invalid' using errcode = '42501';
  end if;
  last_event := (candidate->'events')->old_events;
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

revoke all on function public.tm_save_helper_session(text, text, text, integer, jsonb) from public;
grant execute on function public.tm_save_helper_session(text, text, text, integer, jsonb) to anon, authenticated;
