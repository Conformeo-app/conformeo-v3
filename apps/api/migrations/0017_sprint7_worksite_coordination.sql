create table if not exists worksite_coordination_items (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  target_type varchar(32) not null,
  target_id uuid not null,
  assignee_user_id uuid references users(id) on delete set null,
  status varchar(32) not null default 'todo',
  comment_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_worksite_coordination_target unique (organization_id, target_type, target_id)
);

create index if not exists ix_worksite_coordination_org_target_type
  on worksite_coordination_items (organization_id, target_type)
  where deleted_at is null;

create index if not exists ix_worksite_coordination_org_status
  on worksite_coordination_items (organization_id, status)
  where deleted_at is null;
