alter table organizations
  add column if not exists activity_label varchar(160),
  add column if not exists employee_count integer,
  add column if not exists has_employees boolean,
  add column if not exists contact_email varchar(160),
  add column if not exists contact_phone varchar(32),
  add column if not exists headquarters_address text,
  add column if not exists onboarding_completed_at timestamptz;

create type organization_site_type as enum ('site', 'building', 'office', 'warehouse');
create type organization_site_status as enum ('active', 'archived');

create table if not exists organization_sites (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  name varchar(160) not null,
  address text not null,
  site_type organization_site_type not null default 'site',
  status organization_site_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_organization_sites_org_status
  on organization_sites (organization_id, status)
  where deleted_at is null;
