export type LocalRecordSyncStatus = "local_only" | "pending_sync" | "synced";
export type LocalSyncOperationType =
  | "create"
  | "update"
  | "delete_soft"
  | "upload_media"
  | "status_change";
export type LocalSyncOperationStatus = "pending" | "in_progress" | "failed" | "completed";

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
