
-- Falcon IT - Supabase definitive schema for the managed IT service dashboard
-- Product model: B2B hybrid managed IT service portal
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

-- =========================
-- ENUMS
-- =========================
do $$ begin
  create type app_role as enum ('admin', 'client', 'technician');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'negotiation', 'won', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_status as enum ('pending_payment', 'active', 'suspended', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('pending_payment', 'active', 'expired', 'suspended', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('binance', 'zinli', 'pago_movil', 'transferencia', 'efectivo', 'otro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'submitted', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visit_type as enum ('included', 'extra', 'emergency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visit_status as enum ('scheduled', 'completed', 'cancelled', 'rescheduled', 'missed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type incident_priority as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type incident_status as enum ('open', 'in_progress', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type incident_channel as enum ('dashboard', 'phone', 'whatsapp', 'email', 'onsite');
exception when duplicate_object then null; end $$;

-- =========================
-- GENERIC UPDATED_AT FUNCTION
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- PROFILES
-- Mirrors auth.users and holds role/identity inside the app
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  phone text,
  role app_role not null default 'client',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- =========================
-- PLANS
-- Master catalog for Falcon IT plans
-- =========================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text unique not null,
  price_usd numeric(10,2) not null check (price_usd >= 0),
  monthly_visit_limit integer,
  is_unlimited_visits boolean not null default false,
  response_time_min_hours integer,
  response_time_max_hours integer,
  remote_support_label text,
  maintenance_label text,
  cloud_backup_label text,
  local_backup_label text,
  backup_verification_label text,
  recovery_validation_label text,
  advisory_label text,
  monitoring_label text,
  scope_label text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plans_visit_rule check (
    (is_unlimited_visits = true and monthly_visit_limit is null)
    or
    (is_unlimited_visits = false and monthly_visit_limit is not null and monthly_visit_limit >= 0)
  )
);

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

-- =========================
-- LEADS
-- Form submissions and pre-sales pipeline
-- =========================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text,
  city text,
  service_zone text,
  plan_interest_id uuid references public.plans(id) on delete set null,
  source text,
  status lead_status not null default 'new',
  notes text,
  converted_client_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_status on public.leads(status);

-- =========================
-- CLIENTS
-- Business account entity
-- =========================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profiles(id) on delete restrict,
  business_name text not null,
  contact_name text not null,
  main_email text not null,
  main_phone text,
  rif_or_id text,
  city text,
  zone text,
  address text,
  billing_email text,
  administrative_contact text,
  invitation_sent_at timestamptz,
  access_enabled_at timestamptz,
  status client_status not null default 'pending_payment',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create index if not exists idx_clients_owner_profile_id on public.clients(owner_profile_id);
create index if not exists idx_clients_status on public.clients(status);

alter table public.leads
  drop constraint if exists leads_converted_client_id_fkey;

alter table public.leads
  add constraint leads_converted_client_id_fkey
  foreign key (converted_client_id) references public.clients(id) on delete set null;

-- =========================
-- SUBSCRIPTIONS
-- Core monthly service cycle
-- =========================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status subscription_status not null default 'pending_payment',
  start_date date,
  end_date date,
  renewal_due_date date,
  activated_at timestamptz,
  activated_by uuid references public.profiles(id) on delete set null,
  price_snapshot_usd numeric(10,2) not null check (price_snapshot_usd >= 0),
  visit_limit_snapshot integer,
  is_unlimited_snapshot boolean not null default false,
  visit_used_count integer not null default 0 check (visit_used_count >= 0),
  visit_available_count integer not null default 0 check (visit_available_count >= 0),
  days_remaining integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_dates_valid check (
    (start_date is null and end_date is null)
    or
    (start_date is not null and end_date is not null and end_date >= start_date)
  )
);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create index if not exists idx_subscriptions_client_id on public.subscriptions(client_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_active_lookup on public.subscriptions(client_id, status, end_date);

-- optional rule: one active subscription per client
create unique index if not exists uniq_one_active_subscription_per_client
on public.subscriptions(client_id)
where status = 'active';

-- =========================
-- PAYMENTS
-- Manual payment validation workflow
-- =========================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount_usd numeric(10,2) not null check (amount_usd >= 0),
  payment_method payment_method not null,
  reference_code text,
  proof_file_url text,
  proof_file_path text,
  status payment_status not null default 'pending',
  paid_at timestamptz,
  submitted_at timestamptz,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create index if not exists idx_payments_client_id on public.payments(client_id);
create index if not exists idx_payments_subscription_id on public.payments(subscription_id);
create index if not exists idx_payments_status on public.payments(status);

-- =========================
-- VISITS
-- Each visit is a row, never fixed columns
-- =========================
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  visit_type visit_type not null default 'included',
  status visit_status not null default 'scheduled',
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  completed_at timestamptz,
  title text not null,
  description text,
  internal_notes text,
  client_visible_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visits_schedule_valid check (
    scheduled_end is null or scheduled_end >= scheduled_start
  )
);

drop trigger if exists trg_visits_updated_at on public.visits;
create trigger trg_visits_updated_at
before update on public.visits
for each row execute function public.set_updated_at();

create index if not exists idx_visits_client_id on public.visits(client_id);
create index if not exists idx_visits_subscription_id on public.visits(subscription_id);
create index if not exists idx_visits_assigned_to on public.visits(assigned_to);
create index if not exists idx_visits_status on public.visits(status);
create index if not exists idx_visits_scheduled_start on public.visits(scheduled_start);

-- =========================
-- INCIDENTS
-- Client-reported failures and emergencies
-- =========================
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  reported_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  priority incident_priority not null default 'medium',
  status incident_status not null default 'open',
  channel incident_channel not null default 'dashboard',
  reported_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_incidents_updated_at on public.incidents;
create trigger trg_incidents_updated_at
before update on public.incidents
for each row execute function public.set_updated_at();

create index if not exists idx_incidents_client_id on public.incidents(client_id);
create index if not exists idx_incidents_subscription_id on public.incidents(subscription_id);
create index if not exists idx_incidents_status on public.incidents(status);
create index if not exists idx_incidents_priority on public.incidents(priority);
create index if not exists idx_incidents_reported_at on public.incidents(reported_at);

-- =========================
-- SERVICE REPORTS
-- Technical history after visits or incidents
-- =========================
create table if not exists public.service_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  visit_id uuid references public.visits(id) on delete set null,
  incident_id uuid references public.incidents(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  summary text not null,
  work_performed text,
  recommendations text,
  file_url text,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_service_reports_updated_at on public.service_reports;
create trigger trg_service_reports_updated_at
before update on public.service_reports
for each row execute function public.set_updated_at();

create index if not exists idx_service_reports_client_id on public.service_reports(client_id);
create index if not exists idx_service_reports_subscription_id on public.service_reports(subscription_id);
create index if not exists idx_service_reports_visit_id on public.service_reports(visit_id);
create index if not exists idx_service_reports_incident_id on public.service_reports(incident_id);

-- =========================
-- HELPER FUNCTIONS
-- =========================

-- Recalculate days_remaining and available visits for one subscription
create or replace function public.recalculate_subscription_metrics(p_subscription_id uuid)
returns void
language plpgsql
as $$
declare
  v_end_date date;
  v_limit integer;
  v_unlimited boolean;
  v_used integer;
begin
  select
    s.end_date,
    s.visit_limit_snapshot,
    s.is_unlimited_snapshot
  into
    v_end_date,
    v_limit,
    v_unlimited
  from public.subscriptions s
  where s.id = p_subscription_id;

  if not found then
    return;
  end if;

  select count(*)
  into v_used
  from public.visits v
  where v.subscription_id = p_subscription_id
    and v.status in ('scheduled', 'completed', 'rescheduled')
    and v.visit_type = 'included';

  update public.subscriptions
  set
    visit_used_count = coalesce(v_used, 0),
    visit_available_count = case
      when v_unlimited then 999999
      else greatest(coalesce(v_limit, 0) - coalesce(v_used, 0), 0)
    end,
    days_remaining = case
      when v_end_date is null then 0
      else greatest((v_end_date - current_date), 0)
    end
  where id = p_subscription_id;
end;
$$;

create or replace function public.trg_after_visit_sync_subscription()
returns trigger
language plpgsql
as $$
begin
  if new.subscription_id is not null then
    perform public.recalculate_subscription_metrics(new.subscription_id);
  end if;

  if tg_op = 'UPDATE' and old.subscription_id is distinct from new.subscription_id and old.subscription_id is not null then
    perform public.recalculate_subscription_metrics(old.subscription_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_visits_after_write_sync_subscription on public.visits;
create trigger trg_visits_after_write_sync_subscription
after insert or update on public.visits
for each row execute function public.trg_after_visit_sync_subscription();

create or replace function public.activate_subscription_from_verified_payment(p_payment_id uuid, p_admin_profile_id uuid)
returns void
language plpgsql
as $$
declare
  v_subscription_id uuid;
begin
  update public.payments
  set
    status = 'verified',
    verified_at = now(),
    verified_by = p_admin_profile_id
  where id = p_payment_id
  returning subscription_id into v_subscription_id;

  if v_subscription_id is null then
    return;
  end if;

  update public.subscriptions s
  set
    status = 'active',
    activated_at = now(),
    activated_by = p_admin_profile_id,
    start_date = coalesce(s.start_date, current_date),
    end_date = case 
      when s.end_date is not null and s.end_date > current_date then s.end_date + 30
      else current_date + 30
    end,
    renewal_due_date = case 
      when s.end_date is not null and s.end_date > current_date then s.end_date + 30
      else current_date + 30
    end,
    days_remaining = greatest(case 
      when s.end_date is not null and s.end_date > current_date then (s.end_date + 30) - current_date
      else 30
    end, 0)
  where s.id = v_subscription_id;

  update public.clients c
  set status = 'active'
  where c.id = (
    select client_id from public.subscriptions where id = v_subscription_id
  );

  perform public.recalculate_subscription_metrics(v_subscription_id);
end;
$$;

-- =========================
-- RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.visits enable row level security;
alter table public.incidents enable row level security;
alter table public.service_reports enable row level security;

-- Utility predicates
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

-- Profiles
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (
  id = auth.uid()
  or public.current_app_role() = 'admin'
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles for update
using (
  id = auth.uid()
  or public.current_app_role() = 'admin'
)
with check (
  id = auth.uid()
  or public.current_app_role() = 'admin'
);

-- Plans: readable by authenticated users
drop policy if exists "plans_select_authenticated" on public.plans;
create policy "plans_select_authenticated"
on public.plans for select
using (auth.uid() is not null);

-- Leads: admin only
drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all"
on public.leads for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Clients
drop policy if exists "clients_select_own_or_admin" on public.clients;
create policy "clients_select_own_or_admin"
on public.clients for select
using (
  owner_profile_id = auth.uid()
  or public.current_app_role() = 'admin'
);

drop policy if exists "clients_admin_insert_update_delete" on public.clients;
create policy "clients_admin_insert_update_delete"
on public.clients for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Subscriptions
drop policy if exists "subscriptions_select_own_or_admin" on public.subscriptions;
create policy "subscriptions_select_own_or_admin"
on public.subscriptions for select
using (
  client_id = public.current_client_id()
  or public.current_app_role() = 'admin'
);

drop policy if exists "subscriptions_admin_write" on public.subscriptions;
create policy "subscriptions_admin_write"
on public.subscriptions for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Payments
drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin"
on public.payments for select
using (
  client_id = public.current_client_id()
  or public.current_app_role() = 'admin'
);

drop policy if exists "payments_client_insert_own" on public.payments;
create policy "payments_client_insert_own"
on public.payments for insert
with check (
  client_id = public.current_client_id()
  and auth.uid() is not null
);

drop policy if exists "payments_admin_update_delete" on public.payments;
create policy "payments_admin_update_delete"
on public.payments for update
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "payments_admin_delete" on public.payments;
create policy "payments_admin_delete"
on public.payments for delete
using (public.current_app_role() = 'admin');

-- Visits
drop policy if exists "visits_select_own_admin_technician" on public.visits;
create policy "visits_select_own_admin_technician"
on public.visits for select
using (
  client_id = public.current_client_id()
  or public.current_app_role() = 'admin'
  or assigned_to = auth.uid()
);

drop policy if exists "visits_admin_write" on public.visits;
create policy "visits_admin_write"
on public.visits for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Incidents
drop policy if exists "incidents_select_own_admin_technician" on public.incidents;
create policy "incidents_select_own_admin_technician"
on public.incidents for select
using (
  client_id = public.current_client_id()
  or public.current_app_role() = 'admin'
  or assigned_to = auth.uid()
);

drop policy if exists "incidents_client_insert_own" on public.incidents;
create policy "incidents_client_insert_own"
on public.incidents for insert
with check (
  client_id = public.current_client_id()
  and auth.uid() is not null
);

drop policy if exists "incidents_admin_or_technician_update" on public.incidents;
create policy "incidents_admin_or_technician_update"
on public.incidents for update
using (
  public.current_app_role() = 'admin'
  or assigned_to = auth.uid()
)
with check (
  public.current_app_role() = 'admin'
  or assigned_to = auth.uid()
);

-- Service reports
drop policy if exists "service_reports_select_own_admin_technician" on public.service_reports;
create policy "service_reports_select_own_admin_technician"
on public.service_reports for select
using (
  client_id = public.current_client_id()
  or public.current_app_role() = 'admin'
  or created_by = auth.uid()
);

drop policy if exists "service_reports_admin_or_technician_write" on public.service_reports;
create policy "service_reports_admin_or_technician_write"
on public.service_reports for insert
with check (
  public.current_app_role() = 'admin'
  or public.current_app_role() = 'technician'
);

drop policy if exists "service_reports_admin_or_technician_update" on public.service_reports;
create policy "service_reports_admin_or_technician_update"
on public.service_reports for update
using (
  public.current_app_role() = 'admin'
  or created_by = auth.uid()
)
with check (
  public.current_app_role() = 'admin'
  or created_by = auth.uid()
);

-- =========================
-- SEED DATA FOR PLANS
-- =========================
insert into public.plans (
  code, name, price_usd, monthly_visit_limit, is_unlimited_visits,
  response_time_min_hours, response_time_max_hours,
  remote_support_label, maintenance_label, cloud_backup_label, local_backup_label,
  backup_verification_label, recovery_validation_label, advisory_label, monitoring_label,
  scope_label, description
)
values
(
  'BASICO',
  'Básico',
  60.00,
  2,
  false,
  24,
  48,
  'Limitado',
  'Básico',
  'No incluido',
  'Básico',
  'No',
  'No',
  'No',
  'No',
  'Soporte básico',
  'Pequeñas empresas con soporte operativo inicial'
),
(
  'EMPRESARIAL',
  'Empresarial',
  80.00,
  4,
  false,
  12,
  24,
  'Prioritario',
  'Preventivo + Correctivo',
  'Configuración y gestión',
  'Incluido',
  'Básica',
  'No',
  'Básica',
  'Básico',
  'Operación estable',
  'PYMES operativas con dependencia tecnológica'
),
(
  'CORPORATIVO',
  'Corporativo',
  120.00,
  null,
  true,
  4,
  8,
  'Prioritario VIP',
  'Completo + Optimización',
  'Gestión + verificación',
  'Incluido + supervisión',
  'Periódica',
  'Sí',
  'Continua',
  'Activo',
  'Protección empresarial',
  'Empresas con operación crítica o alta dependencia tecnológica'
)
on conflict (code) do update set
  name = excluded.name,
  price_usd = excluded.price_usd,
  monthly_visit_limit = excluded.monthly_visit_limit,
  is_unlimited_visits = excluded.is_unlimited_visits,
  response_time_min_hours = excluded.response_time_min_hours,
  response_time_max_hours = excluded.response_time_max_hours,
  remote_support_label = excluded.remote_support_label,
  maintenance_label = excluded.maintenance_label,
  cloud_backup_label = excluded.cloud_backup_label,
  local_backup_label = excluded.local_backup_label,
  backup_verification_label = excluded.backup_verification_label,
  recovery_validation_label = excluded.recovery_validation_label,
  advisory_label = excluded.advisory_label,
  monitoring_label = excluded.monitoring_label,
  scope_label = excluded.scope_label,
  description = excluded.description,
  updated_at = now();

-- =========================
-- STORAGE BUCKETS (run manually in Supabase UI or create with API)
-- Suggested buckets:
-- 1) payment-proofs
-- 2) service-reports
-- =========================
