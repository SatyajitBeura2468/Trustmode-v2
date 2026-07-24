-- Display names are self-declared labels, not legal identity verification. Accept any
-- trimmed Unicode name from 2 to 60 characters so Hindi and Odia names are not
-- dependent on the database locale's definition of alphanumeric characters.
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
  if char_length(clean_name) < 2 or char_length(clean_name) > 60 then
    raise exception 'enter a name using 2 to 60 characters' using errcode = '22023';
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

revoke all on function public.tm_helper_join(text, text, text, text) from public;
grant execute on function public.tm_helper_join(text, text, text, text) to anon, authenticated;
