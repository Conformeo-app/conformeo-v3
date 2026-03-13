create type building_safety_item_type as enum ('fire_extinguisher', 'dae', 'periodic_check');
create type building_safety_item_status as enum ('active', 'archived');

create table if not exists building_safety_items (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  site_id uuid not null references organization_sites(id) on delete cascade,
  item_type building_safety_item_type not null,
  name varchar(160) not null,
  next_due_date date not null,
  last_checked_at date,
  status building_safety_item_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_building_safety_items_org_site
  on building_safety_items (organization_id, site_id, status)
  where deleted_at is null;
