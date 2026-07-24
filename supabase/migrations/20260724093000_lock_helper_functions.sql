-- Remove mutable search paths from helper functions used by SECURITY DEFINER RPCs.
alter function public.tm_hash(text) set search_path = extensions;
alter function public.tm_scrub_state(jsonb) set search_path = pg_catalog;
