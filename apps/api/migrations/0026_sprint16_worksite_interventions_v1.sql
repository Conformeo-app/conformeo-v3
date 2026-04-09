do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'worksite_intervention_type'
  ) then
    create type worksite_intervention_type as enum (
      'preparation',
      'visit',
      'team_intervention',
      'delivery',
      'verification',
      'handover'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'worksite_intervention_status'
  ) then
    create type worksite_intervention_status as enum (
      'to_schedule',
      'planned',
      'done',
      'canceled'
    );
  end if;
end
$$;

create table if not exists worksite_interventions (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  worksite_id uuid not null references worksites(id) on delete cascade,
  intervention_type worksite_intervention_type not null default 'team_intervention',
  status worksite_intervention_status not null default 'to_schedule',
  scheduled_for timestamptz,
  completed_at timestamptz,
  team_id uuid references organization_teams(id) on delete set null,
  assignee_user_id uuid references users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_worksite_interventions_org_worksite_schedule
  on worksite_interventions (organization_id, worksite_id, scheduled_for desc)
  where deleted_at is null;

create index if not exists ix_worksite_interventions_org_status
  on worksite_interventions (organization_id, status)
  where deleted_at is null;
