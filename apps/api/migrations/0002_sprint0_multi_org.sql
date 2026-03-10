create table if not exists organization_memberships (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  user_id uuid not null references users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role_code varchar(64) not null default 'member',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_organization_memberships_user_organization unique (user_id, organization_id)
);

create index if not exists idx_organization_memberships_org
  on organization_memberships (organization_id)
  where deleted_at is null;

create index if not exists idx_organization_memberships_user
  on organization_memberships (user_id)
  where deleted_at is null;

create unique index if not exists idx_organization_memberships_default_user
  on organization_memberships (user_id)
  where is_default = true and deleted_at is null;
