alter table documents
  add column if not exists linked_signature_document_id uuid references documents(id) on delete set null;

create index if not exists ix_documents_linked_signature_document
  on documents(linked_signature_document_id);
