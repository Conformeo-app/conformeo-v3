import type { EntityId, IsoDateTime } from "./common";

export type WorksiteStatus = "planned" | "in_progress" | "blocked" | "completed";
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

export interface WorksiteApiSummary {
  id: EntityId;
  organization_id: EntityId;
  name: string;
  client_name: string;
  address: string;
  status: WorksiteStatus;
  planned_for: IsoDateTime | null;
  updated_at: IsoDateTime;
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
