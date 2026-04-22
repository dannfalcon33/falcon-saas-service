-- Falcon IT hotfix: stack depth limit exceeded on incident insert
-- Date: 2026-04-14
--
-- Root cause:
-- RLS helper functions were SECURITY INVOKER and participated in recursive
-- policy evaluation when insert checks referenced subscriptions.
--
-- Fix:
-- Make helpers SECURITY DEFINER with explicit search_path.

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.clients c
  where c.owner_profile_id = auth.uid()
  limit 1
$$;
