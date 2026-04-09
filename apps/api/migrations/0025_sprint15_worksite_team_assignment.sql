alter table if exists worksite_coordination_items
  add column if not exists team_id uuid references organization_teams(id) on delete set null;

create index if not exists ix_worksite_coordination_team_id
  on worksite_coordination_items(team_id);
