do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'worksite_equipment_status'
  ) then
    create type worksite_equipment_status as enum ('ready', 'attention', 'unavailable');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'worksite_equipment_movement_type'
  ) then
    create type worksite_equipment_movement_type as enum (
      'assigned_to_worksite',
      'removed_from_worksite',
      'marked_damaged'
    );
  end if;
end
$$;

create table if not exists worksite_equipments (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  worksite_id uuid references worksites(id) on delete set null,
  name varchar(160) not null,
  type varchar(120) not null,
  status worksite_equipment_status not null default 'ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_worksite_equipments_org_worksite
  on worksite_equipments (organization_id, worksite_id)
  where deleted_at is null;

create index if not exists ix_worksite_equipments_org_status
  on worksite_equipments (organization_id, status)
  where deleted_at is null;

create table if not exists worksite_equipment_movements (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  worksite_id uuid not null references worksites(id) on delete cascade,
  equipment_id uuid not null references worksite_equipments(id) on delete cascade,
  movement_type worksite_equipment_movement_type not null,
  resulting_status worksite_equipment_status not null,
  captured_at timestamptz not null default now(),
  actor_user_id uuid references users(id) on delete set null,
  actor_display_name varchar(160),
  sync_status varchar(16) not null default 'synced',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_worksite_equipment_movements_org_worksite
  on worksite_equipment_movements (organization_id, worksite_id, captured_at desc)
  where deleted_at is null;

create index if not exists ix_worksite_equipment_movements_org_equipment
  on worksite_equipment_movements (organization_id, equipment_id, captured_at desc)
  where deleted_at is null;
