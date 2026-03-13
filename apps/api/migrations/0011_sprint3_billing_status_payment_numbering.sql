alter type quote_status add value if not exists 'accepted';
alter type quote_status add value if not exists 'declined';

alter type invoice_status add value if not exists 'paid';
alter type invoice_status add value if not exists 'overdue';

alter table quotes add column if not exists sequence_number integer;
alter table quotes add column if not exists number varchar(32);

with ranked_quotes as (
  select
    id,
    row_number() over (partition by organization_id order by created_at asc, id asc) as next_sequence
  from quotes
)
update quotes
set
  sequence_number = ranked_quotes.next_sequence,
  number = 'DEV-' || lpad(ranked_quotes.next_sequence::text, 4, '0')
from ranked_quotes
where quotes.id = ranked_quotes.id
  and (quotes.sequence_number is null or quotes.number is null);

alter table quotes alter column sequence_number set not null;
alter table quotes alter column number set not null;

create unique index if not exists ux_quotes_org_sequence_number
  on quotes (organization_id, sequence_number)
  where deleted_at is null;

create unique index if not exists ux_quotes_org_number
  on quotes (organization_id, number)
  where deleted_at is null;

alter table invoices add column if not exists sequence_number integer;
alter table invoices add column if not exists number varchar(32);
alter table invoices add column if not exists paid_amount_cents integer not null default 0;
alter table invoices add column if not exists paid_at date;

with ranked_invoices as (
  select
    id,
    row_number() over (partition by organization_id order by created_at asc, id asc) as next_sequence
  from invoices
)
update invoices
set
  sequence_number = ranked_invoices.next_sequence,
  number = 'FAC-' || lpad(ranked_invoices.next_sequence::text, 4, '0')
from ranked_invoices
where invoices.id = ranked_invoices.id
  and (invoices.sequence_number is null or invoices.number is null);

alter table invoices alter column sequence_number set not null;
alter table invoices alter column number set not null;

create unique index if not exists ux_invoices_org_sequence_number
  on invoices (organization_id, sequence_number)
  where deleted_at is null;

create unique index if not exists ux_invoices_org_number
  on invoices (organization_id, number)
  where deleted_at is null;
