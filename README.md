# PulseDesk Clinic SaaS

Modern clinic operations software for Malaysia, built with Vite, React, and Supabase.

## Current Scope

- Professional web UI shell with clinic and admin workspaces
- Clinic dashboard with live-ready metrics and queue data
- Admin billing review page for manual payment proof verification
- Multi-tenant schema starter for clinics, subscriptions, invoices, appointments, and payment proofs
- Supabase-backed browser data queries with fallback data when tables are not initialized yet

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- Supabase (Auth-ready, Postgres, Storage-ready)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Ensure environment variables exist in `.env.local`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_DEFAULT_CLINIC_CODE=demo-clinic
```

3. In Supabase SQL Editor, run:

- `supabase/schema.sql`

4. Start the app:

```bash
npm run dev
```

## Main Routes

- `/` landing
- `/clinic/dashboard` clinic dashboard
- `/clinic/patients` patient list scaffold
- `/clinic/billing` invoice scaffold
- `/admin` subscription and payment proof review

## Manual Payment Proof Workflow (MVP)

1. Clinic receives invoice and bank transfer instructions.
2. Clinic pays and uploads payment screenshot (upload endpoint to be added next).
3. Record is saved in `payment_proofs` with `review_status = pending`.
4. Super admin reviews pending proofs in `/admin` and verifies or rejects.
5. Subscription status updates to `active`, `grace_period`, or `suspended`.

## Next Build Steps

- Add Supabase Auth with tenant-aware roles
- Add secure screenshot upload to Supabase Storage
- Add admin actions to verify and reject payment proofs
- Add RLS policies for clinic-level data isolation
- Add doctor consultation, prescription, and inventory modules
