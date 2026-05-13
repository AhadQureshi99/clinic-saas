create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update
set public = excluded.public;

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'grace_period', 'suspended', 'terminated')),
  timezone text not null default 'Asia/Kuala_Lumpur',
  created_at timestamptz not null default now()
);

alter table public.clinics add column if not exists registration_no text;
alter table public.clinics add column if not exists phone text;
alter table public.clinics add column if not exists email text;
alter table public.clinics add column if not exists address text;
alter table public.clinics add column if not exists default_language text not null default 'en';
alter table public.clinics add column if not exists bank_account_name text;
alter table public.clinics add column if not exists bank_account_number text;
-- auth_user_id links a clinic to a Supabase Auth user for email+password login
alter table public.clinics add column if not exists auth_user_id uuid unique;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  plan_name text not null,
  status text not null default 'active' check (status in ('active', 'grace_period', 'suspended', 'terminated')),
  amount_cents integer not null,
  period_start date not null,
  period_end date not null,
  grace_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount_cents integer not null,
  transaction_reference text not null,
  screenshot_path text not null,
  review_status text not null default 'pending' check (review_status in ('pending', 'verified', 'rejected')),
  reviewer_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_code text not null,
  full_name text not null,
  id_no text,
  phone text,
  date_of_birth date,
  created_at timestamptz not null default now(),
  unique (clinic_id, patient_code)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  patient_name text not null,
  doctor_name text not null,
  queue_no text,
  status text not null default 'waiting' check (status in ('waiting', 'in_consultation', 'completed', 'cancelled')),
  appointment_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.encounters (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  patient_name text not null,
  doctor_name text not null,
  chief_complaint text,
  assessment text,
  treatment_plan text,
  encounter_status text not null default 'draft' check (encounter_status in ('draft', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  item_name text not null,
  sku text,
  quantity integer not null default 0,
  reorder_level integer not null default 0,
  unit text not null default 'box',
  created_at timestamptz not null default now(),
  unique (clinic_id, item_name)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  invoice_no text not null,
  patient_name text not null,
  amount_cents integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'void')),
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (clinic_id, invoice_no)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.clinic_signup_requests (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  desired_code text not null,
  branch_count integer not null default 1,
  notes text,
  request_status text not null default 'pending' check (request_status in ('pending', 'approved', 'rejected')),
  admin_note text,
  -- auth_user_id is set during signup so admin approval can link the auth account to the clinic
  auth_user_id uuid,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Idempotent additions for existing deployments
alter table public.clinics add column if not exists auth_user_id uuid unique;
alter table public.clinic_signup_requests add column if not exists auth_user_id uuid;

create index if not exists idx_appointments_clinic_appointment_at
  on public.appointments (clinic_id, appointment_at desc);

create index if not exists idx_invoices_clinic_issued_at
  on public.invoices (clinic_id, issued_at desc);

create index if not exists idx_encounters_clinic_created_at
  on public.encounters (clinic_id, created_at desc);

create index if not exists idx_inventory_clinic_item_name
  on public.inventory (clinic_id, item_name);

create index if not exists idx_payment_proofs_review_status
  on public.payment_proofs (review_status, submitted_at desc);

create index if not exists idx_clinic_signup_requests_status
  on public.clinic_signup_requests (request_status, created_at desc);

insert into public.clinics (code, name, status)
values ('demo-clinic', 'PulseDesk Demo Clinic', 'active')
on conflict (code) do nothing;

alter table public.clinics enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.encounters enable row level security;
alter table public.inventory enable row level security;
alter table public.invoices enable row level security;
alter table public.audit_logs enable row level security;
alter table public.clinic_signup_requests enable row level security;

drop policy if exists "Public can read clinics" on public.clinics;
create policy "Public can read clinics"
on public.clinics
for select
to public
using (true);

drop policy if exists "Public can insert clinics" on public.clinics;
create policy "Public can insert clinics"
on public.clinics
for insert
to public
with check (true);

drop policy if exists "Public can update clinics" on public.clinics;
create policy "Public can update clinics"
on public.clinics
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read subscriptions" on public.subscriptions;
create policy "Public can read subscriptions"
on public.subscriptions
for select
to public
using (true);

drop policy if exists "Public can insert subscriptions" on public.subscriptions;
create policy "Public can insert subscriptions"
on public.subscriptions
for insert
to public
with check (true);

drop policy if exists "Public can update subscriptions" on public.subscriptions;
create policy "Public can update subscriptions"
on public.subscriptions
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read payment proofs" on public.payment_proofs;
create policy "Public can read payment proofs"
on public.payment_proofs
for select
to public
using (true);

drop policy if exists "Public can insert payment proofs" on public.payment_proofs;
create policy "Public can insert payment proofs"
on public.payment_proofs
for insert
to public
with check (true);

drop policy if exists "Public can update payment proofs" on public.payment_proofs;
create policy "Public can update payment proofs"
on public.payment_proofs
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read patients" on public.patients;
create policy "Public can read patients"
on public.patients
for select
to public
using (true);

drop policy if exists "Public can insert patients" on public.patients;
create policy "Public can insert patients"
on public.patients
for insert
to public
with check (true);

drop policy if exists "Public can update patients" on public.patients;
create policy "Public can update patients"
on public.patients
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read appointments" on public.appointments;
create policy "Public can read appointments"
on public.appointments
for select
to public
using (true);

drop policy if exists "Public can insert appointments" on public.appointments;
create policy "Public can insert appointments"
on public.appointments
for insert
to public
with check (true);

drop policy if exists "Public can update appointments" on public.appointments;
create policy "Public can update appointments"
on public.appointments
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read encounters" on public.encounters;
create policy "Public can read encounters"
on public.encounters
for select
to public
using (true);

drop policy if exists "Public can insert encounters" on public.encounters;
create policy "Public can insert encounters"
on public.encounters
for insert
to public
with check (true);

drop policy if exists "Public can update encounters" on public.encounters;
create policy "Public can update encounters"
on public.encounters
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read inventory" on public.inventory;
create policy "Public can read inventory"
on public.inventory
for select
to public
using (true);

drop policy if exists "Public can insert inventory" on public.inventory;
create policy "Public can insert inventory"
on public.inventory
for insert
to public
with check (true);

drop policy if exists "Public can update inventory" on public.inventory;
create policy "Public can update inventory"
on public.inventory
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read invoices" on public.invoices;
create policy "Public can read invoices"
on public.invoices
for select
to public
using (true);

drop policy if exists "Public can insert invoices" on public.invoices;
create policy "Public can insert invoices"
on public.invoices
for insert
to public
with check (true);

drop policy if exists "Public can update invoices" on public.invoices;
create policy "Public can update invoices"
on public.invoices
for update
to public
using (true)
with check (true);

drop policy if exists "Public can read audit logs" on public.audit_logs;
create policy "Public can read audit logs"
on public.audit_logs
for select
to public
using (true);

drop policy if exists "Public can insert audit logs" on public.audit_logs;
create policy "Public can insert audit logs"
on public.audit_logs
for insert
to public
with check (true);

drop policy if exists "Public can read signup requests" on public.clinic_signup_requests;
create policy "Public can read signup requests"
on public.clinic_signup_requests
for select
to public
using (true);

drop policy if exists "Public can insert signup requests" on public.clinic_signup_requests;
create policy "Public can insert signup requests"
on public.clinic_signup_requests
for insert
to public
with check (true);

drop policy if exists "Public can update signup requests" on public.clinic_signup_requests;
create policy "Public can update signup requests"
on public.clinic_signup_requests
for update
to public
using (true)
with check (true);

drop policy if exists "Public can upload payment proof images" on storage.objects;
create policy "Public can upload payment proof images"
on storage.objects
for insert
to public
with check (bucket_id = 'payment-proofs');

drop policy if exists "Public can view payment proof images" on storage.objects;
create policy "Public can view payment proof images"
on storage.objects
for select
to public
using (bucket_id = 'payment-proofs');

drop policy if exists "Public can update payment proof images" on storage.objects;
create policy "Public can update payment proof images"
on storage.objects
for update
to public
using (bucket_id = 'payment-proofs');

drop policy if exists "Public can delete payment proof images" on storage.objects;
create policy "Public can delete payment proof images"
on storage.objects
for delete
to public
using (bucket_id = 'payment-proofs');