import type { EntityId, IsoDateTime, VersionedRecord } from "./common";

export type DocumentStatus = "pending" | "available" | "failed" | "archived";
export type DocumentLifecycleStatus = "draft" | "finalized";

export interface DocumentRecord extends VersionedRecord {
  organization_id: EntityId;
  attached_to_entity_type: string;
  attached_to_entity_id: EntityId;
  attached_to_field: string | null;
  uploaded_by_user_id: EntityId | null;
  linked_signature_document_id: EntityId | null;
  linked_proof_document_ids: EntityId[];
  document_type: string;
  source: string;
  lifecycle_status: DocumentLifecycleStatus | null;
  status: DocumentStatus;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_key: string | null;
  checksum: string | null;
  uploaded_at: IsoDateTime | null;
  notes: string | null;
}
