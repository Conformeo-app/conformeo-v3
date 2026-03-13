import type {
  WorksiteEquipmentMovementType,
  WorksiteRiskSeverity,
  WorksiteRiskType,
  WorksiteSafetyChecklistAnswer,
  WorksiteSafetyChecklistStatus
} from "@conformeo/contracts";

export type LocalRecordSyncStatus = "local_only" | "pending_sync" | "synced";
export type LocalSyncOperationType =
  | "create"
  | "update"
  | "delete_soft"
  | "upload_media"
  | "status_change";
export type LocalSyncOperationStatus = "pending" | "in_progress" | "failed" | "completed";
export type WorksiteSyncableEntityName =
  | "worksite_equipment_movement"
  | "worksite_proof"
  | "worksite_voice_note"
  | "worksite_safety_checklist"
  | "worksite_risk_report"
  | "worksite_signature";
export type PreparedWorksiteSyncItemKind = "mutation" | "media_upload";
export type PreparedWorksiteSyncMutationOperation = "upsert" | "delete";

export interface LocalDatabaseStatus {
  databaseName: string;
  platform: string;
  storageEngine: "sqlite-native" | "sqlite-web";
  schemaVersion: number;
  recordCount: number;
  fileReferenceCount: number;
  syncOperationCount: number;
  pendingSyncOperationCount: number;
  failedSyncOperationCount: number;
  retryableSyncOperationCount: number;
  lastMigrationAt: string | null;
}

export interface LocalRecord {
  entityName: string;
  recordId: string;
  organizationId: string | null;
  syncStatus: LocalRecordSyncStatus;
  version: number;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LocalFileReference {
  fileId: string;
  organizationId: string | null;
  ownerEntityName: string | null;
  ownerRecordId: string | null;
  fileName: string;
  documentType: string;
  source: string;
  localUri: string;
  mimeType: string | null;
  sizeBytes: number | null;
  checksum: string | null;
  capturedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UpsertLocalRecordInput {
  entityName: string;
  recordId: string;
  organizationId?: string | null;
  syncStatus?: LocalRecordSyncStatus;
  version?: number;
  payload: Record<string, unknown>;
  deletedAt?: string | null;
}

export interface UpsertLocalFileReferenceInput {
  fileId: string;
  organizationId?: string | null;
  ownerEntityName?: string | null;
  ownerRecordId?: string | null;
  fileName: string;
  documentType?: string;
  source?: string;
  localUri: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  checksum?: string | null;
  capturedAt?: string | null;
  deletedAt?: string | null;
}

export interface ListLocalFileReferencesOptions {
  limit?: number;
  organizationId?: string | null;
  ownerEntityName?: string | null;
  ownerRecordId?: string | null;
}

export interface LocalSyncOperation {
  operationId: string;
  organizationId: string | null;
  entityName: string;
  entityId: string;
  operationType: LocalSyncOperationType;
  status: LocalSyncOperationStatus;
  baseVersion: number | null;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  lastAttemptAt: string | null;
  failedAt: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreparedWorksiteSyncItem {
  itemId: string;
  organizationId: string | null;
  entityName: WorksiteSyncableEntityName;
  entityId: string;
  kind: PreparedWorksiteSyncItemKind;
  status: Exclude<LocalSyncOperationStatus, "completed">;
  mutationOperation: PreparedWorksiteSyncMutationOperation | null;
  sourceOperationIds: string[];
  sourceOperationCount: number;
  fileId: string | null;
  fileName: string | null;
  baseVersion: number | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PreparedWorksiteSyncBatch {
  organizationId: string | null;
  items: PreparedWorksiteSyncItem[];
  sourceOperationCount: number;
  preparedItemCount: number;
  deduplicatedOperationCount: number;
}

export interface EnqueueLocalSyncOperationInput {
  organizationId?: string | null;
  entityName: string;
  entityId: string;
  operationType: LocalSyncOperationType;
  baseVersion?: number | null;
  payload: Record<string, unknown>;
  maxAttempts?: number;
  nextAttemptAt?: string | null;
}

export interface ListLocalSyncOperationsOptions {
  limit?: number;
  organizationId?: string | null;
  statuses?: LocalSyncOperationStatus[];
}

export interface LocalSyncFailureInput {
  code?: string | null;
  message: string;
  retryAt?: string | null;
}

export interface CaptureWorksiteProofInput {
  organizationId?: string | null;
  worksiteId: string;
  fileName: string;
  localUri: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  capturedAt: string;
}

export interface UpdateWorksiteProofCommentInput {
  organizationId?: string | null;
  proofId: string;
  commentText: string;
}

export interface CaptureWorksiteVoiceNoteInput {
  organizationId?: string | null;
  worksiteId: string;
  fileName: string;
  localUri: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  capturedAt: string;
  durationSeconds?: number | null;
}

export interface CaptureWorksiteSignatureInput {
  organizationId?: string | null;
  worksiteId: string;
  fileName: string;
  localUri: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  capturedAt: string;
}

export interface CreateWorksiteRiskReportInput {
  organizationId?: string | null;
  worksiteId: string;
  riskType: WorksiteRiskType;
  severity: WorksiteRiskSeverity;
  noteText?: string | null;
  capturedAt: string;
  photoFileName?: string | null;
  photoLocalUri?: string | null;
  photoMimeType?: string | null;
  photoSizeBytes?: number | null;
}

export interface SaveWorksiteSafetyChecklistInput {
  organizationId?: string | null;
  worksiteId: string;
  status: WorksiteSafetyChecklistStatus;
  commentText?: string | null;
  items: Array<{
    id: string;
    label: string;
    answer: WorksiteSafetyChecklistAnswer | null;
  }>;
}

export interface CreateWorksiteEquipmentMovementInput {
  organizationId?: string | null;
  worksiteId: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  movementType: WorksiteEquipmentMovementType;
  capturedAt: string;
  actorUserId?: string | null;
  actorDisplayName?: string | null;
}
