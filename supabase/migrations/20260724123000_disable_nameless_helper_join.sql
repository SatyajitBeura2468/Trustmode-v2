-- The named helper flow is deployed. Remove the legacy join signature so no client
-- can mark a helper as joined without supplying the actual person's display name.
revoke all on function public.tm_helper_join(text, text, text) from public, anon, authenticated;
drop function if exists public.tm_helper_join(text, text, text);
