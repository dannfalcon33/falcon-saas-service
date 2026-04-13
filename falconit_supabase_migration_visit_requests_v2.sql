-- Falcon IT v2 migration
-- Separates visit requests from incidents and enables admin scheduling flow.

create extension if not exists pgcrypto;

-- =========================================
-- ENUM
-- =========================================
do $$ begin
  create type public.visit_request_status as enum ('pending', 'scheduled', 'rejected');
exception when duplicate_object then null; end $$;

alter type public.visit_request_status add value if not exists 'pending';
alter type public.visit_request_status add value if not exists 'scheduled';
alter type public.visit_request_status add value if not exists 'rejected';

-- =========================================
-- TABLE
-- =========================================
create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  requested_by uuid references public.profiles(id) on delete set null,
  priority public.incident_priority not null default 'medium',
  title text not null default 'Solicitud de visita tecnica',
  description text not null,
  requested_at timestamptz not null default now(),
  status public.visit_request_status not null default 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  linked_visit_id uuid references public.visits(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.visit_requests add column if not exists client_id uuid;
alter table public.visit_requests add column if not exists subscription_id uuid;
alter table public.visit_requests add column if not exists requested_by uuid;
alter table public.visit_requests add column if not exists priority public.incident_priority;
alter table public.visit_requests add column if not exists title text;
alter table public.visit_requests add column if not exists description text;
alter table public.visit_requests add column if not exists requested_at timestamptz;
alter table public.visit_requests add column if not exists status public.visit_request_status;
alter table public.visit_requests add column if not exists admin_notes text;
alter table public.visit_requests add column if not exists reviewed_at timestamptz;
alter table public.visit_requests add column if not exists reviewed_by uuid;
alter table public.visit_requests add column if not exists linked_visit_id uuid;
alter table public.visit_requests add column if not exists created_at timestamptz;
alter table public.visit_requests add column if not exists updated_at timestamptz;

alter table public.visit_requests
  alter column priority set default 'medium',
  alter column title set default 'Solicitud de visita tecnica',
  alter column requested_at set default now(),
  alter column status set default 'pending',
  alter column created_at set default now(),
  alter column updated_at set default now();

update public.visit_requests set requested_at = coalesce(requested_at, created_at, now());
update public.visit_requests set created_at = coalesce(created_at, requested_at, now());
update public.visit_requests set updated_at = coalesce(updated_at, created_at, now());
update public.visit_requests set title = coalesce(nullif(title, ''), 'Solicitud de visita tecnica');

create index if not exists idx_visit_requests_client_id on public.visit_requests(client_id);
create index if not exists idx_visit_requests_subscription_id on public.visit_requests(subscription_id);
create index if not exists idx_visit_requests_status on public.visit_requests(status);
create index if not exists idx_visit_requests_requested_at on public.visit_requests(requested_at);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'visit_requests_client_id_fkey'
      and conrelid = 'public.visit_requests'::regclass
  ) then
    alter table public.visit_requests
      add constraint visit_requests_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'visit_requests_subscription_id_fkey'
      and conrelid = 'public.visit_requests'::regclass
  ) then
    alter table public.visit_requests
      add constraint visit_requests_subscription_id_fkey
      foreign key (subscription_id) references public.subscriptions(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'visit_requests_requested_by_fkey'
      and conrelid = 'public.visit_requests'::regclass
  ) then
    alter table public.visit_requests
      add constraint visit_requests_requested_by_fkey
      foreign key (requested_by) references public.profiles(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'visit_requests_reviewed_by_fkey'
      and conrelid = 'public.visit_requests'::regclass
  ) then
    alter table public.visit_requests
      add constraint visit_requests_reviewed_by_fkey
      foreign key (reviewed_by) references public.profiles(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'visit_requests_linked_visit_id_fkey'
      and conrelid = 'public.visit_requests'::regclass
  ) then
    alter table public.visit_requests
      add constraint visit_requests_linked_visit_id_fkey
      foreign key (linked_visit_id) references public.visits(id) on delete set null;
  end if;
end
$$;

alter table public.visit_requests enable row level security;

-- =========================================
-- HELPERS (shared with main schema)
-- =========================================
create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
as $$
  select c.id
  from public.clients c
  where c.owner_profile_id = auth.uid()
  limit 1
$$;

-- Keep updated_at synchronized if helper exists in baseline schema.
do $$ begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'set_updated_at' and n.nspname = 'public'
  ) then
    drop trigger if exists trg_visit_requests_updated_at on public.visit_requests;
    create trigger trg_visit_requests_updated_at
    before update on public.visit_requests
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- =========================================
-- RLS POLICIES
-- =========================================
drop policy if exists "visit_requests_select_own_or_admin" on public.visit_requests;
create policy "visit_requests_select_own_or_admin"
on public.visit_requests for select
using (
  client_id = public.current_client_id()
  or public.current_app_role() = 'admin'
);

drop policy if exists "visit_requests_client_insert_own" on public.visit_requests;
create policy "visit_requests_client_insert_own"
on public.visit_requests for insert
with check (
  client_id = public.current_client_id()
  and requested_by = auth.uid()
);

drop policy if exists "visit_requests_admin_update" on public.visit_requests;
create policy "visit_requests_admin_update"
on public.visit_requests for update
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- =========================================
-- RPC: create_visit_request
-- =========================================
create or replace function public.create_visit_request(
  p_description text,
  p_priority public.incident_priority default 'medium',
  p_subscription_id uuid default null,
  p_title text default 'Solicitud de visita tecnica'
)
returns public.visit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_subscription public.subscriptions%rowtype;
  v_request public.visit_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(trim(p_description), '') = '' then
    raise exception 'Description is required';
  end if;

  select c.id
  into v_client_id
  from public.clients c
  where c.owner_profile_id = auth.uid()
  limit 1;

  if v_client_id is null then
    raise exception 'Client profile not found';
  end if;

  if p_subscription_id is not null then
    select *
    into v_subscription
    from public.subscriptions s
    where s.id = p_subscription_id
      and s.client_id = v_client_id
      and s.status = 'active'
    order by s.created_at desc
    limit 1;
  else
    select *
    into v_subscription
    from public.subscriptions s
    where s.client_id = v_client_id
      and s.status = 'active'
    order by s.created_at desc
    limit 1;
  end if;

  if v_subscription.id is null then
    raise exception 'No active subscription found';
  end if;

  if not v_subscription.is_unlimited_snapshot and coalesce(v_subscription.visit_available_count, 0) <= 0 then
    raise exception 'No visit quota available for this plan';
  end if;

  insert into public.visit_requests (
    client_id,
    subscription_id,
    requested_by,
    priority,
    title,
    description,
    requested_at,
    status
  )
  values (
    v_client_id,
    v_subscription.id,
    auth.uid(),
    p_priority,
    coalesce(nullif(trim(p_title), ''), 'Solicitud de visita tecnica'),
    p_description,
    now(),
    'pending'
  )
  returning * into v_request;

  return v_request;
end;
$$;

-- =========================================
-- RPC: schedule_visit_from_request
-- =========================================
create or replace function public.schedule_visit_from_request(
  p_request_id uuid,
  p_admin_profile_id uuid,
  p_assigned_to uuid default null,
  p_scheduled_start timestamptz default null,
  p_scheduled_end timestamptz default null,
  p_visit_type public.visit_type default 'included',
  p_title text default null,
  p_description text default null,
  p_admin_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.visit_requests%rowtype;
  v_visit_id uuid;
  v_subscription public.subscriptions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if auth.uid() <> p_admin_profile_id then
    raise exception 'Authenticated user does not match admin profile';
  end if;

  if (
    select p.role::text
    from public.profiles p
    where p.id = p_admin_profile_id
  ) <> 'admin' then
    raise exception 'Only admin can schedule visit requests';
  end if;

  if p_scheduled_start is null then
    raise exception 'scheduled_start is required';
  end if;

  if p_scheduled_end is not null and p_scheduled_end < p_scheduled_start then
    raise exception 'scheduled_end must be greater or equal to scheduled_start';
  end if;

  select *
  into v_request
  from public.visit_requests vr
  where vr.id = p_request_id
  for update;

  if v_request.id is null then
    raise exception 'Visit request not found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Visit request is not pending';
  end if;

  if p_visit_type = 'included' and v_request.subscription_id is not null then
    select *
    into v_subscription
    from public.subscriptions s
    where s.id = v_request.subscription_id
    limit 1;

    if v_subscription.id is not null and not v_subscription.is_unlimited_snapshot and coalesce(v_subscription.visit_available_count, 0) <= 0 then
      raise exception 'Subscription has no available included visits';
    end if;
  end if;

  insert into public.visits (
    client_id,
    subscription_id,
    assigned_to,
    visit_type,
    status,
    scheduled_start,
    scheduled_end,
    title,
    description,
    created_by
  )
  values (
    v_request.client_id,
    v_request.subscription_id,
    p_assigned_to,
    p_visit_type,
    'scheduled',
    p_scheduled_start,
    p_scheduled_end,
    coalesce(nullif(trim(p_title), ''), nullif(trim(v_request.title), ''), 'Visita tecnica programada'),
    coalesce(nullif(trim(p_description), ''), v_request.description),
    p_admin_profile_id
  )
  returning id into v_visit_id;

  update public.visit_requests
  set
    status = 'scheduled',
    admin_notes = coalesce(nullif(trim(p_admin_notes), ''), admin_notes),
    reviewed_at = now(),
    reviewed_by = p_admin_profile_id,
    linked_visit_id = v_visit_id,
    updated_at = now()
  where id = p_request_id;

  return v_visit_id;
end;
$$;

-- =========================================
-- RPC: reject_visit_request
-- =========================================
create or replace function public.reject_visit_request(
  p_request_id uuid,
  p_admin_profile_id uuid,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if auth.uid() <> p_admin_profile_id then
    raise exception 'Authenticated user does not match admin profile';
  end if;

  if (
    select p.role::text
    from public.profiles p
    where p.id = p_admin_profile_id
  ) <> 'admin' then
    raise exception 'Only admin can reject visit requests';
  end if;

  update public.visit_requests
  set
    status = 'rejected',
    admin_notes = coalesce(nullif(trim(p_admin_notes), ''), admin_notes),
    reviewed_at = now(),
    reviewed_by = p_admin_profile_id,
    updated_at = now()
  where id = p_request_id
    and status = 'pending';

  if not found then
    raise exception 'Visit request is not pending or does not exist';
  end if;
end;
$$;

grant execute on function public.create_visit_request(text, public.incident_priority, uuid, text) to authenticated;
grant execute on function public.schedule_visit_from_request(uuid, uuid, uuid, timestamptz, timestamptz, public.visit_type, text, text, text) to authenticated;
grant execute on function public.reject_visit_request(uuid, uuid, text) to authenticated;

-- =========================================
-- HISTORICAL MIGRATION FROM incidents
-- =========================================
insert into public.visit_requests (
  client_id,
  subscription_id,
  requested_by,
  priority,
  title,
  description,
  requested_at,
  status,
  admin_notes,
  reviewed_at,
  reviewed_by,
  linked_visit_id,
  created_at,
  updated_at
)
select
  i.client_id,
  i.subscription_id,
  i.reported_by,
  i.priority,
  coalesce(nullif(i.title, ''), 'Solicitud de visita tecnica'),
  i.description,
  i.reported_at,
  case
    when i.status in ('resolved', 'closed') then 'scheduled'::public.visit_request_status
    else 'pending'::public.visit_request_status
  end,
  concat(
    'Migrated from incident ',
    i.id::text,
    case when coalesce(i.resolution_notes, '') <> '' then concat(' | legacy resolution: ', i.resolution_notes) else '' end
  ),
  case
    when i.status in ('resolved', 'closed') then coalesce(i.resolved_at, i.updated_at, i.created_at)
    else null
  end,
  case
    when i.status in ('resolved', 'closed') then i.assigned_to
    else null
  end,
  null,
  coalesce(i.created_at, i.reported_at, now()),
  coalesce(i.updated_at, i.created_at, now())
from public.incidents i
where i.title = 'Solicitud de visita técnica'
and not exists (
  select 1
  from public.visit_requests vr
  where vr.admin_notes ilike concat('%', i.id::text, '%')
);
