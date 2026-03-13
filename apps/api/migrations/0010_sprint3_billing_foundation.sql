create type billing_customer_type as enum ('company', 'individual');
create type quote_status as enum ('draft', 'sent');
create type invoice_status as enum ('draft', 'issued');

create table if not exists billing_customers (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  name varchar(160) not null,
  customer_type billing_customer_type not null default 'company',
  email varchar(160),
  phone varchar(32),
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_billing_customers_org_name
  on billing_customers (organization_id, name)
  where deleted_at is null;

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references billing_customers(id) on delete cascade,
  title varchar(160),
  issue_date date not null,
  valid_until date,
  status quote_status not null default 'draft',
  currency varchar(3) not null default 'EUR',
  line_items jsonb not null default '[]'::jsonb,
  subtotal_amount_cents integer not null default 0,
  total_amount_cents integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_quotes_org_issue_date
  on quotes (organization_id, issue_date desc, created_at desc)
  where deleted_at is null;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references billing_customers(id) on delete cascade,
  title varchar(160),
  issue_date date not null,
  due_date date,
  status invoice_status not null default 'draft',
  currency varchar(3) not null default 'EUR',
  line_items jsonb not null default '[]'::jsonb,
  subtotal_amount_cents integer not null default 0,
  total_amount_cents integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_invoices_org_issue_date
  on invoices (organization_id, issue_date desc, created_at desc)
  where deleted_at is null;
