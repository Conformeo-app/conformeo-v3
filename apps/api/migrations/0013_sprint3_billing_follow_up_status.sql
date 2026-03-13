alter table quotes
add column if not exists follow_up_status varchar(32) not null default 'normal';

alter table invoices
add column if not exists follow_up_status varchar(32) not null default 'normal';
