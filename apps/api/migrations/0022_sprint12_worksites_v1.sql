do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'worksite_status'
  ) then
    create type worksite_status as enum ('planned', 'in_progress', 'blocked', 'completed');
  end if;
end
$$;

create table if not exists worksites (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  site_id uuid references organization_sites(id) on delete set null,
  name varchar(160) not null,
  description text,
  status worksite_status not null default 'planned',
  planned_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_worksites_org_status
  on worksites (organization_id, status)
  where deleted_at is null;

create index if not exists ix_worksites_org_site
  on worksites (organization_id, site_id)
  where deleted_at is null;
