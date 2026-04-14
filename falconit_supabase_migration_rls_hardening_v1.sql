-- Falcon IT - RLS Hardening (2026-04-14)
-- Purpose: Prevent cross-tenant reference injection via subscription_id in client inserts.

-- PAYMENTS: client can only insert own client_id and own subscription_id.
drop policy if exists "payments_client_insert_own" on public.payments;
create policy "payments_client_insert_own"
on public.payments for insert
with check (
  client_id = public.current_client_id()
  and auth.uid() is not null
  and (
    subscription_id is null
    or exists (
      select 1
      from public.subscriptions s
      where s.id = subscription_id
        and s.client_id = public.current_client_id()
    )
  )
);

-- INCIDENTS: client can only reference own subscription_id.
drop policy if exists "incidents_client_insert_own" on public.incidents;
create policy "incidents_client_insert_own"
on public.incidents for insert
with check (
  client_id = public.current_client_id()
  and auth.uid() is not null
  and (
    subscription_id is null
    or exists (
      select 1
      from public.subscriptions s
      where s.id = subscription_id
        and s.client_id = public.current_client_id()
    )
  )
);

-- VISIT REQUESTS: client can only reference own subscription_id.
drop policy if exists "visit_requests_client_insert_own" on public.visit_requests;
create policy "visit_requests_client_insert_own"
on public.visit_requests for insert
with check (
  client_id = public.current_client_id()
  and requested_by = auth.uid()
  and (
    subscription_id is null
    or exists (
      select 1
      from public.subscriptions s
      where s.id = subscription_id
        and s.client_id = public.current_client_id()
    )
  )
);
