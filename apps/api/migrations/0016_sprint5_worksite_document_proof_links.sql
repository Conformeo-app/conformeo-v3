alter table documents
  add column if not exists linked_proof_document_ids jsonb not null default '[]'::jsonb;
