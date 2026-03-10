create type document_status as enum (
  'pending',
  'available',
  'failed',
  'archived'
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  organization_id uuid not null references organizations(id) on delete cascade,
  attached_to_entity_type varchar(64) not null,
  attached_to_entity_id uuid not null,
  attached_to_field varchar(64),
  uploaded_by_user_id uuid references users(id) on delete set null,
  document_type varchar(64) not null,
  source varchar(64) not null default 'upload',
  status document_status not null default 'available',
  file_name varchar(255) not null,
  mime_type varchar(160),
  size_bytes bigint,
  storage_key varchar(255),
  checksum varchar(128),
  uploaded_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_documents_org_entity
  on documents (organization_id, attached_to_entity_type, attached_to_entity_id);

create index if not exists ix_documents_org_status
  on documents (organization_id, status);
