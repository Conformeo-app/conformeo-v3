create table if not exists organization_teams (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  name varchar(120) not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_organization_teams_org_name unique (organization_id, name)
);

create index if not exists ix_organization_teams_org_name
  on organization_teams (organization_id, name)
  where deleted_at is null;

create table if not exists organization_team_members (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  team_id uuid not null references organization_teams(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_organization_team_members_team_user unique (team_id, user_id)
);

create index if not exists ix_organization_team_members_team
  on organization_team_members (team_id)
  where deleted_at is null;

create index if not exists ix_organization_team_members_user
  on organization_team_members (user_id)
  where deleted_at is null;
