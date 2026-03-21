alter table if exists documents
  add column if not exists content_bytes bytea;
