create type duerp_severity as enum ('low', 'medium', 'high');
create type duerp_entry_status as enum ('active', 'archived');

create table if not exists duerp_entries (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  site_id uuid references organization_sites(id) on delete set null,
  work_unit_name varchar(160) not null,
  risk_label varchar(200) not null,
  severity duerp_severity not null,
  prevention_action text,
  status duerp_entry_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_duerp_entries_org_site
  on duerp_entries (organization_id, site_id, status)
  where deleted_at is null;
