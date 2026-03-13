alter table quotes add column if not exists worksite_id uuid;
alter table invoices add column if not exists worksite_id uuid;

create index if not exists ix_quotes_org_worksite_id
  on quotes (organization_id, worksite_id)
  where deleted_at is null;

create index if not exists ix_invoices_org_worksite_id
  on invoices (organization_id, worksite_id)
  where deleted_at is null;
