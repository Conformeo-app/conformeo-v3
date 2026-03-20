import type { EntityId, IsoDateTime } from "./common";
import type { DocumentLifecycleStatus, DocumentStatus } from "./document";

export type WorksiteStatus = "planned" | "in_progress" | "blocked" | "completed";
export type WorksiteCoordinationTargetType = "worksite" | "worksite_document";
export type WorksiteCoordinationStatus = "todo" | "in_progress" | "done";
export type WorksiteChecklistItemStatus = "todo" | "done" | "attention";
export type WorksiteLocalSyncStatus = "local_only" | "pending_sync" | "synced";
export type WorksiteProofStatus = WorksiteLocalSyncStatus;
export type WorksiteEquipmentStatus = "ready" | "attention" | "unavailable";
export type WorksiteEquipmentMovementType =
  | "assigned_to_worksite"
  | "removed_from_worksite"
  | "marked_damaged";
export type WorksiteSafetyChecklistAnswer = "yes" | "no" | "na";
export type WorksiteSafetyChecklistStatus = "draft" | "validated";
export type WorksiteRiskType = "fall" | "slip" | "electrical" | "traffic" | "other";
export type WorksiteRiskSeverity = "low" | "medium" | "high";

export interface WorksiteCoordinationRecord {
  target_type: WorksiteCoordinationTargetType;
  target_id: EntityId;
  status: WorksiteCoordinationStatus;
  assignee_user_id: EntityId | null;
  assignee_display_name: string | null;
  comment_text: string | null;
  updated_at: IsoDateTime | null;
}

export interface WorksiteCoordinationUpdateRequest {
  status: WorksiteCoordinationStatus;
  assignee_user_id: EntityId | null;
  comment_text: string | null;
}

export interface WorksiteAssigneeRecord {
  user_id: EntityId;
  display_name: string;
  role_code: string;
}

export interface WorksiteApiSummary {
  id: EntityId;
  organization_id: EntityId;
  name: string;
  client_name: string;
  address: string;
  status: WorksiteStatus;
  planned_for: IsoDateTime | null;
  updated_at: IsoDateTime;
  coordination: WorksiteCoordinationRecord;
}

export interface WorksitePreventionPlanExportRequest {
  useful_date: string | null;
  intervention_context: string | null;
  vigilance_points: string[];
  measure_points: string[];
  additional_contact: string | null;
}

export interface WorksiteDocumentRecord {
  id: EntityId;
  version: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  deleted_at: IsoDateTime | null;
  worksite_id: EntityId;
  worksite_name: string;
  document_type: string;
  document_type_label: string;
  source: string;
  lifecycle_status: DocumentLifecycleStatus;
  linked_signature_id: EntityId | null;
  linked_signature_label: string | null;
  linked_signature_file_name: string | null;
  linked_signature_uploaded_at: IsoDateTime | null;
  linked_proofs: WorksiteProofRecord[];
  status: DocumentStatus;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  has_stored_file: boolean;
  uploaded_at: IsoDateTime | null;
  notes: string | null;
  coordination: WorksiteCoordinationRecord;
}

export interface WorksiteDocumentStatusUpdateRequest {
  lifecycle_status: DocumentLifecycleStatus;
}

export interface WorksiteSignatureRecord {
  id: EntityId;
  version: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  deleted_at: IsoDateTime | null;
  worksite_id: EntityId;
  worksite_name: string;
  label: string;
  file_name: string;
  status: DocumentStatus;
  uploaded_at: IsoDateTime | null;
}

export interface WorksiteDocumentSignatureUpdateRequest {
  signature_document_id: EntityId | null;
}

export interface WorksiteDocumentProofUpdateRequest {
  proof_document_ids: EntityId[];
}

export interface WorksiteProofRecord {
  id: EntityId;
  version: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  deleted_at: IsoDateTime | null;
  worksite_id: EntityId;
  worksite_name: string;
  label: string;
  file_name: string;
  status: DocumentStatus;
  uploaded_at: IsoDateTime | null;
  notes: string | null;
}

export interface WorksiteSummary extends WorksiteApiSummary {
  is_offline_ready: boolean;
  offline_prepared_at: IsoDateTime | null;
}

export interface WorksiteContact {
  id: EntityId;
  role: string;
  name: string;
  phone: string | null;
}

export interface WorksiteEquipment {
  id: EntityId;
  name: string;
  type: string;
  status: WorksiteEquipmentStatus;
}

export interface WorksiteEquipmentMovement {
  id: EntityId;
  worksite_id: EntityId;
  equipment_id: EntityId;
  equipment_name: string;
  movement_type: WorksiteEquipmentMovementType;
  resulting_status: WorksiteEquipmentStatus;
  captured_at: IsoDateTime | null;
  actor_user_id: EntityId | null;
  actor_display_name: string | null;
  sync_status: WorksiteLocalSyncStatus;
}

export interface WorksiteProofSummary {
  id: EntityId;
  label: string;
  file_name: string | null;
  thumbnail_local_uri: string | null;
  comment_text: string | null;
  captured_at: IsoDateTime | null;
  sync_status: WorksiteProofStatus;
}

export interface WorksiteVoiceNoteSummary {
  id: EntityId;
  label: string;
  file_name: string | null;
  playback_local_uri: string | null;
  captured_at: IsoDateTime | null;
  duration_seconds: number | null;
  sync_status: WorksiteLocalSyncStatus;
}

export interface WorksiteSignatureSummary {
  id: EntityId;
  label: string;
  file_name: string | null;
  signature_local_uri: string | null;
  captured_at: IsoDateTime | null;
  sync_status: WorksiteLocalSyncStatus;
}

export interface WorksiteRiskReport {
  id: EntityId;
  worksite_id: EntityId;
  risk_type: WorksiteRiskType;
  severity: WorksiteRiskSeverity;
  note_text: string | null;
  photo_file_name: string | null;
  photo_thumbnail_local_uri: string | null;
  captured_at: IsoDateTime | null;
  sync_status: WorksiteLocalSyncStatus;
}

export interface WorksiteSafetyChecklistItem {
  id: EntityId;
  label: string;
  answer: WorksiteSafetyChecklistAnswer | null;
}

export interface WorksiteSafetyChecklist {
  id: EntityId;
  worksite_id: EntityId;
  status: WorksiteSafetyChecklistStatus;
  comment_text: string | null;
  updated_at: IsoDateTime | null;
  items: WorksiteSafetyChecklistItem[];
  sync_status: WorksiteLocalSyncStatus;
}

export interface WorksiteChecklistItem {
  id: EntityId;
  label: string;
  status: WorksiteChecklistItemStatus;
}

export interface WorksiteEssentialDetail extends WorksiteSummary {
  contacts: WorksiteContact[];
  equipments: WorksiteEquipment[];
  recent_equipment_movements: WorksiteEquipmentMovement[];
  recent_proofs: WorksiteProofSummary[];
  recent_voice_notes: WorksiteVoiceNoteSummary[];
  recent_signatures: WorksiteSignatureSummary[];
  risk_reports: WorksiteRiskReport[];
  checklist_today: WorksiteChecklistItem[];
  safety_checklist: WorksiteSafetyChecklist;
}
