create extension if not exists pgcrypto;

create type organization_status as enum ('active', 'inactive');
create type user_status as enum ('invited', 'active', 'disabled');

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  name varchar(160) not null,
  slug varchar(80) not null unique,
  legal_name varchar(160),
  status organization_status not null default 'active',
  default_locale varchar(10) not null default 'fr-FR',
  default_timezone varchar(64) not null default 'Europe/Paris',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  email varchar(255) not null unique,
  first_name varchar(80) not null,
  last_name varchar(80) not null,
  display_name varchar(160) not null,
  phone varchar(32),
  status user_status not null default 'invited',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_organizations_active on organizations (status) where deleted_at is null;
create index if not exists idx_users_active on users (status) where deleted_at is null;
