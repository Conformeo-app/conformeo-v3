create type audit_action as enum (
  'create',
  'update',
  'soft_delete',
  'status_change',
  'module_activation_change'
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  actor_user_id uuid references users(id) on delete set null,
  actor_label varchar(64) not null default 'system',
  action_type audit_action not null,
  target_type varchar(64) not null,
  target_id uuid not null,
  target_display varchar(160),
  changes jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_org_occurred_at
  on audit_logs (organization_id, occurred_at desc);

create index if not exists idx_audit_logs_target
  on audit_logs (target_type, target_id);
