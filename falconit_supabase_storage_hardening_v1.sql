-- Falcon IT - Storage Hardening (Day 1 Go-Live)
-- Date: 2026-04-15
-- Scope:
-- 1) Enforce private buckets for sensitive files.
-- 2) Restrict upload paths for payment proofs to authenticated owner.
-- 3) Restrict service report uploads to admin/technician roles only.

-- Ensure helper functions are safe for policy checks (avoid recursive RLS issues).
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

-- -------------------------------------------------------------------
-- Buckets (private by default)
-- -------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('service-reports', 'service-reports', false)
on conflict (id) do update set public = false;

-- Optional MIME/size hardening for payment proofs and reports
update storage.buckets
set
  file_size_limit = 5242880, -- 5 MB
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']
where id = 'payment-proofs';

update storage.buckets
set
  file_size_limit = 5242880, -- 5 MB
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']
where id = 'service-reports';

-- -------------------------------------------------------------------
-- storage.objects policies for payment-proofs
-- -------------------------------------------------------------------
drop policy if exists "payment_proofs_client_insert_own_path" on storage.objects;
create policy "payment_proofs_client_insert_own_path"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and split_part(name, '/', 1) = auth.uid()::text
  and split_part(name, '/', 2) <> ''
  and exists (
    select 1
    from public.subscriptions s
    where s.id::text = split_part(name, '/', 2)
      and s.client_id = public.current_client_id()
  )
);

drop policy if exists "payment_proofs_client_delete_own_path" on storage.objects;
create policy "payment_proofs_client_delete_own_path"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'payment-proofs'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "payment_proofs_admin_manage" on storage.objects;
create policy "payment_proofs_admin_manage"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'payment-proofs'
  and public.current_app_role() = 'admin'
)
with check (
  bucket_id = 'payment-proofs'
  and public.current_app_role() = 'admin'
);

-- -------------------------------------------------------------------
-- storage.objects policies for service-reports
-- -------------------------------------------------------------------
drop policy if exists "service_reports_admin_technician_insert" on storage.objects;
create policy "service_reports_admin_technician_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'service-reports'
  and public.current_app_role() in ('admin', 'technician')
);

drop policy if exists "service_reports_admin_technician_manage" on storage.objects;
create policy "service_reports_admin_technician_manage"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'service-reports'
  and public.current_app_role() in ('admin', 'technician')
)
with check (
  bucket_id = 'service-reports'
  and public.current_app_role() in ('admin', 'technician')
);
