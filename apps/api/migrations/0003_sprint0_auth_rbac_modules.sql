alter table users
  add column if not exists password_hash varchar(255);

create type organization_module_code as enum ('reglementation', 'chantier', 'facturation');

create table if not exists organization_modules (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  module_code organization_module_code not null,
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_organization_modules_org_module unique (organization_id, module_code)
);

create index if not exists idx_organization_modules_org
  on organization_modules (organization_id)
  where deleted_at is null;

insert into organization_modules (organization_id, module_code, is_enabled)
select organizations.id, module_seed.module_code, false
from organizations
cross join (
  values
    ('reglementation'::organization_module_code),
    ('chantier'::organization_module_code),
    ('facturation'::organization_module_code)
) as module_seed(module_code)
on conflict (organization_id, module_code) do nothing;
