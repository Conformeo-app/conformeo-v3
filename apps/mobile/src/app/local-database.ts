import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection
} from "@capacitor-community/sqlite";
import type {
  WorksiteApiSummary,
  WorksiteCoordinationRecord,
  WorksiteEquipment,
  WorksiteEquipmentMovement,
  WorksiteEquipmentMovementType,
  WorksiteEquipmentStatus,
  WorksiteEssentialDetail,
  WorksiteProofSummary,
  WorksiteRiskReport,
  WorksiteSafetyChecklist,
  WorksiteSafetyChecklistAnswer,
  WorksiteSafetyChecklistStatus,
  WorksiteSafetyChecklistItem,
  WorksiteSignatureSummary,
  WorksiteVoiceNoteSummary,
  WorksiteSummary
} from "@conformeo/contracts";
import { defineCustomElements as defineJeepSqlite } from "jeep-sqlite/loader";

import {
  LOCAL_DATABASE_MIGRATIONS,
  LOCAL_DATABASE_NAME,
  LOCAL_DATABASE_SCHEMA_VERSION
} from "./local-database.migrations";
import type {
  LocalDatabaseStatus,
  LocalFileReference,
  LocalRecord,
  LocalRecordSyncStatus,
  LocalSyncFailureInput,
  LocalSyncOperation,
  LocalSyncOperationStatus,
  LocalSyncOperationType,
  ListLocalFileReferencesOptions,
  ListLocalSyncOperationsOptions,
  EnqueueLocalSyncOperationInput,
  CaptureWorksiteProofInput,
  CaptureWorksiteSignatureInput,
  CreateWorksiteEquipmentMovementInput,
  CreateWorksiteRiskReportInput,
  PreparedWorksiteSyncBatch,
  PreparedWorksiteSyncItem,
  SaveWorksiteSafetyChecklistInput,
  CaptureWorksiteVoiceNoteInput,
  UpdateWorksiteProofCommentInput,
  WorksiteSyncableEntityName,
  UpsertLocalFileReferenceInput,
  UpsertLocalRecordInput
} from "./local-database.types";
import { getDefaultWorksiteEquipments } from "./worksite-equipment-catalog";

type SqliteRow = Record<string, unknown>;

interface MigrationState {
  version: number;
  appliedAt: string | null;
}

const WORKSITE_SUMMARY_ENTITY = "worksite_summary";
const WORKSITE_DETAIL_ENTITY = "worksite_detail";
const WORKSITE_EQUIPMENT_MOVEMENT_ENTITY = "worksite_equipment_movement";
const WORKSITE_PROOF_ENTITY = "worksite_proof";
const WORKSITE_SIGNATURE_ENTITY = "worksite_signature";
const WORKSITE_RISK_REPORT_ENTITY = "worksite_risk_report";
const WORKSITE_SAFETY_CHECKLIST_ENTITY = "worksite_safety_checklist";
const WORKSITE_VOICE_NOTE_ENTITY = "worksite_voice_note";
const WORKSITE_SYNCABLE_ENTITY_NAMES: WorksiteSyncableEntityName[] = [
  WORKSITE_EQUIPMENT_MOVEMENT_ENTITY,
  WORKSITE_PROOF_ENTITY,
  WORKSITE_VOICE_NOTE_ENTITY,
  WORKSITE_SAFETY_CHECKLIST_ENTITY,
  WORKSITE_RISK_REPORT_ENTITY,
  WORKSITE_SIGNATURE_ENTITY
];
const WORKSITE_SAFETY_CHECKLIST_TEMPLATE: Array<Pick<WorksiteSafetyChecklistItem, "id" | "label">> = [
  { id: "access_clear", label: "Accès au chantier dégagé" },
  { id: "epi_ready", label: "Équipements de protection portés" },
  { id: "area_secured", label: "Zone d’intervention sécurisée" },
  { id: "instructions_shared", label: "Consignes sécurité rappelées" }
];

const MIGRATION_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS local_schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  );
`;

function nowIso(): string {
  return new Date().toISOString();
}

function createOperationId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `syncop-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function mapWorksiteEquipmentStatusFromMovementType(
  movementType: WorksiteEquipmentMovementType
): WorksiteEquipmentStatus {
  switch (movementType) {
    case "assigned_to_worksite":
      return "ready";
    case "removed_from_worksite":
      return "unavailable";
    case "marked_damaged":
      return "attention";
  }
}

function addMinutes(baseDate: Date, minutes: number): string {
  return new Date(baseDate.getTime() + minutes * 60_000).toISOString();
}

function computeRetryAt(attempts: number, maxAttempts: number): string | null {
  if (attempts >= maxAttempts) {
    return null;
  }

  const boundedDelayMinutes = Math.min(2 ** Math.max(attempts - 1, 0), 15);
  return addMinutes(new Date(), boundedDelayMinutes);
}

function createDefaultWorksiteCoordination(worksiteId: string): WorksiteCoordinationRecord {
  return {
    target_type: "worksite",
    target_id: worksiteId,
    status: "todo",
    assignee_user_id: null,
    assignee_display_name: null,
    comment_text: null,
    updated_at: null
  };
}

function parsePayload(value: unknown): Record<string, unknown> {
  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }

  return {};
}

function toRecordPayload(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

function createLocalId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isWorksiteSyncableEntityName(value: string): value is WorksiteSyncableEntityName {
  return WORKSITE_SYNCABLE_ENTITY_NAMES.includes(value as WorksiteSyncableEntityName);
}

function getWorksiteSafetyChecklistRecordId(worksiteId: string): string {
  return `worksite-safety-checklist-${worksiteId}`;
}

function createDefaultWorksiteSafetyChecklist(worksiteId: string): WorksiteSafetyChecklist {
  return {
    id: getWorksiteSafetyChecklistRecordId(worksiteId),
    worksite_id: worksiteId,
    status: "draft",
    comment_text: null,
    updated_at: null,
    items: WORKSITE_SAFETY_CHECKLIST_TEMPLATE.map((item) => ({
      ...item,
      answer: null
    })),
    sync_status: "local_only"
  };
}

class MobileLocalDatabase {
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private initializationPromise: Promise<void> | null = null;
  private webBootstrapPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.performInitialization();
    }
    return this.initializationPromise;
  }

  async getStatus(): Promise<LocalDatabaseStatus> {
    const db = await this.getDatabase();
    const migrationState = await this.getMigrationState(db);
    const recordCount = await this.countRows(
      db,
      "SELECT COUNT(*) AS count FROM local_records WHERE deleted_at IS NULL"
    );
    const fileReferenceCount = await this.countRows(
      db,
      "SELECT COUNT(*) AS count FROM local_file_references WHERE deleted_at IS NULL"
    );
    const syncOperationCount = await this.countRows(db, "SELECT COUNT(*) AS count FROM local_sync_queue");
    const pendingSyncOperationCount = await this.countRows(
      db,
      "SELECT COUNT(*) AS count FROM local_sync_queue WHERE status = 'pending'"
    );
    const failedSyncOperationCount = await this.countRows(
      db,
      "SELECT COUNT(*) AS count FROM local_sync_queue WHERE status = 'failed'"
    );
    const retryableSyncOperationCount = await this.countRows(
      db,
      `
        SELECT COUNT(*) AS count
        FROM local_sync_queue
        WHERE
          (
            status = 'pending'
            AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
          )
          OR (
            status = 'failed'
            AND attempts < max_attempts
            AND next_attempt_at IS NOT NULL
            AND next_attempt_at <= ?
          )
      `,
      [nowIso(), nowIso()]
    );

    return {
      databaseName: LOCAL_DATABASE_NAME,
      platform: Capacitor.getPlatform(),
      storageEngine: Capacitor.getPlatform() === "web" ? "sqlite-web" : "sqlite-native",
      schemaVersion: migrationState.version,
      recordCount,
      fileReferenceCount,
      syncOperationCount,
      pendingSyncOperationCount,
      failedSyncOperationCount,
      retryableSyncOperationCount,
      lastMigrationAt: migrationState.appliedAt
    };
  }

  async getSetting(key: string): Promise<string | null> {
    const db = await this.getDatabase();
    const result = await db.query("SELECT value FROM local_settings WHERE key = ? LIMIT 1", [key]);
    const row = (result.values?.[0] ?? null) as SqliteRow | null;
    return typeof row?.value === "string" ? row.value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const db = await this.getDatabase();
    const timestamp = nowIso();
    await db.run(
      `
        INSERT INTO local_settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `,
      [key, value, timestamp]
    );
    await this.persistIfNeeded();
  }

  async upsertLocalRecord(input: UpsertLocalRecordInput): Promise<void> {
    const db = await this.getDatabase();
    const existing = await this.getLocalRecord(input.entityName, input.recordId);
    const timestamp = nowIso();
    const createdAt = existing?.createdAt ?? timestamp;
    const version = input.version ?? existing?.version ?? 0;
    const syncStatus = input.syncStatus ?? existing?.syncStatus ?? "local_only";

    await db.run(
      `
        INSERT INTO local_records (
          entity_name,
          record_id,
          organization_id,
          sync_status,
          version,
          payload,
          created_at,
          updated_at,
          deleted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(entity_name, record_id) DO UPDATE SET
          organization_id = excluded.organization_id,
          sync_status = excluded.sync_status,
          version = excluded.version,
          payload = excluded.payload,
          updated_at = excluded.updated_at,
          deleted_at = excluded.deleted_at
      `,
      [
        input.entityName,
        input.recordId,
        input.organizationId ?? null,
        syncStatus,
        version,
        JSON.stringify(input.payload),
        createdAt,
        timestamp,
        input.deletedAt ?? null
      ]
    );
    await this.persistIfNeeded();
  }

  async listLocalRecords(entityName: string, organizationId?: string | null): Promise<LocalRecord[]> {
    const db = await this.getDatabase();
    const query =
      organizationId === undefined
        ? `
            SELECT *
            FROM local_records
            WHERE entity_name = ? AND deleted_at IS NULL
            ORDER BY updated_at DESC
          `
        : `
            SELECT *
            FROM local_records
            WHERE entity_name = ? AND deleted_at IS NULL AND organization_id IS ?
            ORDER BY updated_at DESC
          `;
    const params = organizationId === undefined ? [entityName] : [entityName, organizationId ?? null];
    const result = await db.query(query, params);
    return (result.values ?? []).map((row) => this.mapLocalRecord(row as SqliteRow));
  }

  async getLocalRecord(entityName: string, recordId: string): Promise<LocalRecord | null> {
    const db = await this.getDatabase();
    const result = await db.query(
      `
        SELECT *
        FROM local_records
        WHERE entity_name = ? AND record_id = ?
        LIMIT 1
      `,
      [entityName, recordId]
    );
    const row = (result.values?.[0] ?? null) as SqliteRow | null;
    return row ? this.mapLocalRecord(row) : null;
  }

  async upsertLocalFileReference(input: UpsertLocalFileReferenceInput): Promise<void> {
    const db = await this.getDatabase();
    const existing = await this.getLocalFileReference(input.fileId);
    const timestamp = nowIso();
    const createdAt = existing?.createdAt ?? timestamp;

    await db.run(
      `
        INSERT INTO local_file_references (
          file_id,
          organization_id,
          owner_entity_name,
          owner_record_id,
          file_name,
          document_type,
          source,
          local_uri,
          mime_type,
          size_bytes,
          checksum,
          captured_at,
          created_at,
          updated_at,
          deleted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(file_id) DO UPDATE SET
          organization_id = excluded.organization_id,
          owner_entity_name = excluded.owner_entity_name,
          owner_record_id = excluded.owner_record_id,
          file_name = excluded.file_name,
          document_type = excluded.document_type,
          source = excluded.source,
          local_uri = excluded.local_uri,
          mime_type = excluded.mime_type,
          size_bytes = excluded.size_bytes,
          checksum = excluded.checksum,
          captured_at = excluded.captured_at,
          updated_at = excluded.updated_at,
          deleted_at = excluded.deleted_at
      `,
      [
        input.fileId,
        input.organizationId ?? null,
        input.ownerEntityName ?? null,
        input.ownerRecordId ?? null,
        input.fileName,
        input.documentType ?? "attachment",
        input.source ?? "local_capture",
        input.localUri,
        input.mimeType ?? null,
        input.sizeBytes ?? null,
        input.checksum ?? null,
        input.capturedAt ?? null,
        createdAt,
        timestamp,
        input.deletedAt ?? null
      ]
    );
    await this.persistIfNeeded();
  }

  async listLocalFileReferences(
    options: ListLocalFileReferencesOptions = {}
  ): Promise<LocalFileReference[]> {
    const db = await this.getDatabase();
    const clauses = ["deleted_at IS NULL"];
    const values: Array<string | number | null> = [];

    if (options.organizationId !== undefined) {
      clauses.push("organization_id IS ?");
      values.push(options.organizationId ?? null);
    }

    if (options.ownerEntityName !== undefined) {
      clauses.push("owner_entity_name IS ?");
      values.push(options.ownerEntityName ?? null);
    }

    if (options.ownerRecordId !== undefined) {
      clauses.push("owner_record_id IS ?");
      values.push(options.ownerRecordId ?? null);
    }

    const limit = Math.min(Math.max(options.limit ?? 12, 1), 100);
    const result = await db.query(
      `
        SELECT *
        FROM local_file_references
        WHERE ${clauses.join(" AND ")}
        ORDER BY COALESCE(captured_at, created_at) DESC, created_at DESC
        LIMIT ${limit}
      `,
      values
    );
    return (result.values ?? []).map((row) => this.mapLocalFileReference(row as SqliteRow));
  }

  async getLocalFileReference(fileId: string): Promise<LocalFileReference | null> {
    const db = await this.getDatabase();
    const result = await db.query(
      `
        SELECT *
        FROM local_file_references
        WHERE file_id = ?
        LIMIT 1
      `,
      [fileId]
    );
    const row = (result.values?.[0] ?? null) as SqliteRow | null;
    return row ? this.mapLocalFileReference(row) : null;
  }

  async createWorksiteEquipmentMovement(
    input: CreateWorksiteEquipmentMovementInput
  ): Promise<WorksiteEquipmentMovement> {
    const movementId = createLocalId("worksite-equipment-movement");
    const organizationId = input.organizationId ?? null;
    const resultingStatus = mapWorksiteEquipmentStatusFromMovementType(input.movementType);
    const payload = {
      attached_to_entity_type: "worksite",
      attached_to_entity_id: input.worksiteId,
      attached_to_field: "equipment_movement",
      worksite_id: input.worksiteId,
      equipment_id: input.equipmentId,
      equipment_name: input.equipmentName,
      equipment_type: input.equipmentType,
      movement_type: input.movementType,
      resulting_status: resultingStatus,
      captured_at: input.capturedAt,
      actor_user_id: input.actorUserId ?? null,
      actor_display_name: normalizeOptionalText(input.actorDisplayName),
      label: "Mouvement équipement"
    };

    await this.upsertLocalRecord({
      entityName: WORKSITE_EQUIPMENT_MOVEMENT_ENTITY,
      recordId: movementId,
      organizationId,
      syncStatus: "local_only",
      payload
    });
    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_EQUIPMENT_MOVEMENT_ENTITY,
      entityId: movementId,
      operationType: "create",
      baseVersion: 0,
      payload
    });

    const createdRecord = await this.getLocalRecord(WORKSITE_EQUIPMENT_MOVEMENT_ENTITY, movementId);
    const createdMovement = createdRecord ? this.mapWorksiteEquipmentMovement(createdRecord) : null;
    if (!createdMovement) {
      throw new Error("Le mouvement d’équipement local n'a pas pu être enregistré.");
    }

    return createdMovement;
  }

  async captureWorksiteProof(input: CaptureWorksiteProofInput): Promise<WorksiteProofSummary> {
    const proofId = createLocalId("worksite-proof");
    const organizationId = input.organizationId ?? null;
    const mimeType = input.mimeType ?? "image/jpeg";
    const payload = {
      attached_to_entity_type: "worksite",
      attached_to_entity_id: input.worksiteId,
      attached_to_field: "proof_photo",
      document_type: "photo_proof",
      source: "mobile_capture",
      status: "pending",
      file_name: input.fileName,
      mime_type: mimeType,
      size_bytes: input.sizeBytes ?? null,
      uploaded_at: input.capturedAt,
      captured_at: input.capturedAt,
      comment_text: null,
      label: "Photo preuve"
    };

    await this.upsertLocalRecord({
      entityName: WORKSITE_PROOF_ENTITY,
      recordId: proofId,
      organizationId,
      syncStatus: "local_only",
      payload
    });
    await this.upsertLocalFileReference({
      fileId: proofId,
      organizationId,
      ownerEntityName: WORKSITE_PROOF_ENTITY,
      ownerRecordId: proofId,
      fileName: input.fileName,
      documentType: "photo_proof",
      source: "mobile_capture",
      localUri: input.localUri,
      mimeType,
      sizeBytes: input.sizeBytes ?? null,
      capturedAt: input.capturedAt
    });
    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_PROOF_ENTITY,
      entityId: proofId,
      operationType: "upload_media",
      baseVersion: 0,
      payload: {
        ...payload,
        file_id: proofId
      }
    });

    return {
      id: proofId,
      label: "Photo preuve",
      file_name: input.fileName,
      thumbnail_local_uri: input.localUri,
      comment_text: null,
      captured_at: input.capturedAt,
      sync_status: "pending_sync"
    };
  }

  async captureWorksiteVoiceNote(
    input: CaptureWorksiteVoiceNoteInput
  ): Promise<WorksiteVoiceNoteSummary> {
    const noteId = createLocalId("worksite-voice-note");
    const organizationId = input.organizationId ?? null;
    const mimeType = input.mimeType ?? "audio/webm";
    const payload = {
      attached_to_entity_type: "worksite",
      attached_to_entity_id: input.worksiteId,
      attached_to_field: "voice_note",
      document_type: "voice_note",
      source: "mobile_capture",
      status: "pending",
      file_name: input.fileName,
      mime_type: mimeType,
      size_bytes: input.sizeBytes ?? null,
      duration_seconds: input.durationSeconds ?? null,
      uploaded_at: input.capturedAt,
      captured_at: input.capturedAt,
      label: "Note vocale"
    };

    await this.upsertLocalRecord({
      entityName: WORKSITE_VOICE_NOTE_ENTITY,
      recordId: noteId,
      organizationId,
      syncStatus: "local_only",
      payload
    });
    await this.upsertLocalFileReference({
      fileId: noteId,
      organizationId,
      ownerEntityName: WORKSITE_VOICE_NOTE_ENTITY,
      ownerRecordId: noteId,
      fileName: input.fileName,
      documentType: "voice_note",
      source: "mobile_capture",
      localUri: input.localUri,
      mimeType,
      sizeBytes: input.sizeBytes ?? null,
      capturedAt: input.capturedAt
    });
    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_VOICE_NOTE_ENTITY,
      entityId: noteId,
      operationType: "upload_media",
      baseVersion: 0,
      payload: {
        ...payload,
        file_id: noteId
      }
    });

    return {
      id: noteId,
      label: "Note vocale",
      file_name: input.fileName,
      playback_local_uri: input.localUri,
      captured_at: input.capturedAt,
      duration_seconds: input.durationSeconds ?? null,
      sync_status: "pending_sync"
    };
  }

  async captureWorksiteSignature(
    input: CaptureWorksiteSignatureInput
  ): Promise<WorksiteSignatureSummary> {
    const signatureId = createLocalId("worksite-signature");
    const organizationId = input.organizationId ?? null;
    const mimeType = input.mimeType ?? "image/png";
    const payload = {
      attached_to_entity_type: "worksite",
      attached_to_entity_id: input.worksiteId,
      attached_to_field: "signature",
      document_type: "signature",
      source: "mobile_capture",
      status: "pending",
      file_name: input.fileName,
      mime_type: mimeType,
      size_bytes: input.sizeBytes ?? null,
      uploaded_at: input.capturedAt,
      captured_at: input.capturedAt,
      label: "Signature simple"
    };

    await this.upsertLocalRecord({
      entityName: WORKSITE_SIGNATURE_ENTITY,
      recordId: signatureId,
      organizationId,
      syncStatus: "local_only",
      payload
    });
    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_SIGNATURE_ENTITY,
      entityId: signatureId,
      operationType: "create",
      baseVersion: 0,
      payload
    });
    await this.upsertLocalFileReference({
      fileId: signatureId,
      organizationId,
      ownerEntityName: WORKSITE_SIGNATURE_ENTITY,
      ownerRecordId: signatureId,
      fileName: input.fileName,
      documentType: "signature",
      source: "mobile_capture",
      localUri: input.localUri,
      mimeType,
      sizeBytes: input.sizeBytes ?? null,
      capturedAt: input.capturedAt
    });
    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_SIGNATURE_ENTITY,
      entityId: signatureId,
      operationType: "upload_media",
      baseVersion: 0,
      payload: {
        ...payload,
        file_id: signatureId
      }
    });

    return {
      id: signatureId,
      label: "Signature simple",
      file_name: input.fileName,
      signature_local_uri: input.localUri,
      captured_at: input.capturedAt,
      sync_status: "pending_sync"
    };
  }

  async createWorksiteRiskReport(
    input: CreateWorksiteRiskReportInput
  ): Promise<WorksiteRiskReport> {
    const reportId = createLocalId("worksite-risk");
    const organizationId = input.organizationId ?? null;
    const noteText = normalizeOptionalText(input.noteText);
    const hasPhoto = typeof input.photoLocalUri === "string" && input.photoLocalUri.length > 0;
    const photoFileName = hasPhoto
      ? (input.photoFileName && input.photoFileName.length > 0
        ? input.photoFileName
        : `signalement-${Date.now()}.jpg`)
      : null;
    const photoMimeType = input.photoMimeType ?? "image/jpeg";
    const payload = {
      attached_to_entity_type: "worksite",
      attached_to_entity_id: input.worksiteId,
      attached_to_field: hasPhoto ? "risk_report_photo" : null,
      document_type: hasPhoto ? "risk_report_photo" : null,
      source: "mobile_capture",
      status: "pending",
      worksite_id: input.worksiteId,
      risk_type: input.riskType,
      severity: input.severity,
      note_text: noteText,
      photo_file_name: photoFileName,
      has_photo: hasPhoto,
      captured_at: input.capturedAt,
      label: "Signalement de risque"
    };

    await this.upsertLocalRecord({
      entityName: WORKSITE_RISK_REPORT_ENTITY,
      recordId: reportId,
      organizationId,
      syncStatus: "local_only",
      payload
    });
    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_RISK_REPORT_ENTITY,
      entityId: reportId,
      operationType: "create",
      baseVersion: 0,
      payload
    });

    if (hasPhoto && input.photoLocalUri) {
      await this.upsertLocalFileReference({
        fileId: reportId,
        organizationId,
        ownerEntityName: WORKSITE_RISK_REPORT_ENTITY,
        ownerRecordId: reportId,
        fileName: photoFileName ?? `signalement-${Date.now()}.jpg`,
        documentType: "risk_report_photo",
        source: "mobile_capture",
        localUri: input.photoLocalUri,
        mimeType: photoMimeType,
        sizeBytes: input.photoSizeBytes ?? null,
        capturedAt: input.capturedAt
      });
      await this.enqueueSyncOperation({
        organizationId,
        entityName: WORKSITE_RISK_REPORT_ENTITY,
        entityId: reportId,
        operationType: "upload_media",
        baseVersion: 0,
        payload: {
          ...payload,
          file_id: reportId
        }
      });
    }

    const createdRecord = await this.getLocalRecord(WORKSITE_RISK_REPORT_ENTITY, reportId);
    const fileReference = hasPhoto ? await this.getLocalFileReference(reportId) : null;
    const createdReport = createdRecord
      ? this.mapWorksiteRiskReport(createdRecord, fileReference)
      : null;

    if (!createdReport) {
      throw new Error("Le signalement de risque local n'a pas pu être enregistré.");
    }

    return createdReport;
  }

  async getWorksiteSafetyChecklist(
    organizationId: string | null,
    worksiteId: string
  ): Promise<WorksiteSafetyChecklist> {
    const record = organizationId
      ? await this.getLocalRecord(WORKSITE_SAFETY_CHECKLIST_ENTITY, getWorksiteSafetyChecklistRecordId(worksiteId))
      : null;
    return record ? this.mapWorksiteSafetyChecklist(record) ?? createDefaultWorksiteSafetyChecklist(worksiteId)
      : createDefaultWorksiteSafetyChecklist(worksiteId);
  }

  async saveWorksiteSafetyChecklist(
    input: SaveWorksiteSafetyChecklistInput
  ): Promise<WorksiteSafetyChecklist> {
    const recordId = getWorksiteSafetyChecklistRecordId(input.worksiteId);
    const existingRecord = await this.getLocalRecord(WORKSITE_SAFETY_CHECKLIST_ENTITY, recordId);
    const updatedAt = nowIso();
    const organizationId = input.organizationId ?? existingRecord?.organizationId ?? null;
    const normalizedItems = input.items.map((item) => ({
      id: item.id,
      label: item.label,
      answer: item.answer
    }));
    const payload = {
      worksite_id: input.worksiteId,
      status: input.status,
      comment_text: normalizeOptionalText(input.commentText),
      updated_at: updatedAt,
      items: normalizedItems
    };

    await this.upsertLocalRecord({
      entityName: WORKSITE_SAFETY_CHECKLIST_ENTITY,
      recordId,
      organizationId,
      syncStatus: existingRecord?.syncStatus ?? "local_only",
      version: (existingRecord?.version ?? 0) + 1,
      payload
    });

    const operationType =
      !existingRecord
        ? "create"
        : this.readWorksiteSafetyChecklistStatus(existingRecord.payload.status) !== input.status
          ? "status_change"
          : "update";

    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_SAFETY_CHECKLIST_ENTITY,
      entityId: recordId,
      operationType,
      baseVersion: existingRecord?.version ?? 0,
      payload: {
        worksite_id: input.worksiteId,
        status: input.status,
        comment_text: normalizeOptionalText(input.commentText),
        items: normalizedItems,
        updated_at: updatedAt
      }
    });

    const updatedRecord = await this.getLocalRecord(WORKSITE_SAFETY_CHECKLIST_ENTITY, recordId);
    const updatedChecklist = updatedRecord ? this.mapWorksiteSafetyChecklist(updatedRecord) : null;
    if (!updatedChecklist) {
      throw new Error("La checklist sécurité locale n'a pas pu être enregistrée.");
    }
    return updatedChecklist;
  }

  async updateWorksiteProofComment(
    input: UpdateWorksiteProofCommentInput
  ): Promise<WorksiteProofSummary> {
    const existingRecord = await this.getLocalRecord(WORKSITE_PROOF_ENTITY, input.proofId);
    if (!existingRecord) {
      throw new Error("La photo preuve demandée est introuvable sur cet appareil.");
    }

    const fileReference = await this.getLocalFileReference(input.proofId);
    const currentComment = normalizeOptionalText(existingRecord.payload.comment_text);
    const nextComment = normalizeOptionalText(input.commentText);

    if (currentComment === nextComment) {
      const unchangedSummary = this.mapWorksiteProofSummary(existingRecord, fileReference);
      if (!unchangedSummary) {
        throw new Error("La photo preuve locale ne peut pas être relue.");
      }
      return unchangedSummary;
    }

    const organizationId = existingRecord.organizationId ?? input.organizationId ?? null;
    const updatedAt = nowIso();
    const nextPayload = {
      ...existingRecord.payload,
      comment_text: nextComment,
      updated_at: updatedAt
    };

    await this.upsertLocalRecord({
      entityName: existingRecord.entityName,
      recordId: existingRecord.recordId,
      organizationId,
      syncStatus: existingRecord.syncStatus,
      version: existingRecord.version + 1,
      payload: nextPayload,
      deletedAt: existingRecord.deletedAt
    });
    await this.enqueueSyncOperation({
      organizationId,
      entityName: WORKSITE_PROOF_ENTITY,
      entityId: input.proofId,
      operationType: "update",
      baseVersion: existingRecord.version,
      payload: {
        attached_to_entity_type: existingRecord.payload.attached_to_entity_type,
        attached_to_entity_id: existingRecord.payload.attached_to_entity_id,
        attached_to_field: existingRecord.payload.attached_to_field,
        document_type: existingRecord.payload.document_type,
        comment_text: nextComment,
        updated_at: updatedAt
      }
    });

    const updatedRecord = await this.getLocalRecord(WORKSITE_PROOF_ENTITY, input.proofId);
    const updatedSummary = updatedRecord
      ? this.mapWorksiteProofSummary(updatedRecord, fileReference)
      : null;
    if (!updatedSummary) {
      throw new Error("La photo preuve locale n'a pas pu être mise à jour.");
    }
    return updatedSummary;
  }

  async importWorksiteSummaries(
    organizationId: string | null,
    summaries: WorksiteApiSummary[]
  ): Promise<void> {
    if (!organizationId) {
      return;
    }

    for (const summary of summaries) {
      const existingSummaryRecord = await this.getLocalRecord(WORKSITE_SUMMARY_ENTITY, summary.id);
      const existingSummary = existingSummaryRecord
        ? this.mapWorksiteSummary(existingSummaryRecord)
        : null;
      const mergedSummary: WorksiteSummary = {
        ...summary,
        is_offline_ready: existingSummary?.is_offline_ready ?? false,
        offline_prepared_at: existingSummary?.offline_prepared_at ?? null
      };

      await this.upsertLocalRecord({
        entityName: WORKSITE_SUMMARY_ENTITY,
        recordId: summary.id,
        organizationId,
        syncStatus: existingSummaryRecord?.syncStatus ?? "synced",
        version: (existingSummaryRecord?.version ?? 0) + 1,
        payload: toRecordPayload(mergedSummary)
      });

      const existingDetailRecord = await this.getLocalRecord(WORKSITE_DETAIL_ENTITY, summary.id);
      const existingDetail = existingDetailRecord ? this.mapWorksiteDetail(existingDetailRecord) : null;
      const equipments = existingDetail?.equipments.length
        ? existingDetail.equipments
        : getDefaultWorksiteEquipments(mergedSummary);
      await this.upsertLocalRecord({
        entityName: WORKSITE_DETAIL_ENTITY,
        recordId: summary.id,
        organizationId,
        syncStatus: existingDetailRecord?.syncStatus ?? "synced",
        version: (existingDetailRecord?.version ?? 0) + 1,
        payload: toRecordPayload({
          contacts: existingDetail?.contacts ?? [],
          equipments,
          recent_equipment_movements: existingDetail?.recent_equipment_movements ?? [],
          recent_proofs: existingDetail?.recent_proofs ?? [],
          recent_voice_notes: existingDetail?.recent_voice_notes ?? [],
          recent_signatures: existingDetail?.recent_signatures ?? [],
          risk_reports: existingDetail?.risk_reports ?? [],
          safety_checklist: existingDetail?.safety_checklist
            ?? createDefaultWorksiteSafetyChecklist(summary.id),
          checklist_today: existingDetail?.checklist_today ?? []
        })
      });
    }

    await this.setSetting(`worksite_last_import_at:${organizationId}`, nowIso());
  }

  async listWorksiteSummaries(organizationId: string | null): Promise<WorksiteSummary[]> {
    if (!organizationId) {
      return [];
    }

    const records = await this.listLocalRecords(WORKSITE_SUMMARY_ENTITY, organizationId);
    return records
      .map((record) => this.mapWorksiteSummary(record))
      .filter((worksite): worksite is WorksiteSummary => worksite !== null);
  }

  async getWorksiteLastImportAt(organizationId: string | null): Promise<string | null> {
    if (!organizationId) {
      return null;
    }

    return this.getSetting(`worksite_last_import_at:${organizationId}`);
  }

  async getWorksiteEssentialDetail(
    organizationId: string | null,
    worksiteId: string
  ): Promise<WorksiteEssentialDetail | null> {
    if (!organizationId) {
      return null;
    }

    const summaryRecord = await this.getLocalRecord(WORKSITE_SUMMARY_ENTITY, worksiteId);
    const summary = summaryRecord ? this.mapWorksiteSummary(summaryRecord) : null;

    if (!summary) {
      return null;
    }

    const detailRecord = await this.getLocalRecord(WORKSITE_DETAIL_ENTITY, worksiteId);
    const detail = detailRecord ? this.mapWorksiteDetail(detailRecord) : null;
    const localProofs = await this.listWorksiteProofSummaries(organizationId, worksiteId);
    const localVoiceNotes = await this.listWorksiteVoiceNoteSummaries(organizationId, worksiteId);
    const localSignatures = await this.listWorksiteSignatureSummaries(organizationId, worksiteId);
    const localRiskReports = await this.listWorksiteRiskReports(organizationId, worksiteId);
    const localEquipmentMovements = await this.listWorksiteEquipmentMovements(organizationId, worksiteId);
    const safetyChecklist = await this.getWorksiteSafetyChecklist(organizationId, worksiteId);
    const mergedProofs = this.mergeWorksiteProofs(detail?.recent_proofs ?? [], localProofs);
    const mergedVoiceNotes = this.mergeWorksiteVoiceNotes(
      detail?.recent_voice_notes ?? [],
      localVoiceNotes
    );
    const mergedSignatures = this.mergeWorksiteSignatures(
      detail?.recent_signatures ?? [],
      localSignatures
    );
    const mergedRiskReports = this.mergeWorksiteRiskReports(
      detail?.risk_reports ?? [],
      localRiskReports
    );
    const mergedEquipmentMovements = this.mergeWorksiteEquipmentMovements(
      detail?.recent_equipment_movements ?? [],
      localEquipmentMovements
    );
    const mergedEquipments = this.applyEquipmentMovementsToEquipments(
      detail?.equipments.length ? detail.equipments : getDefaultWorksiteEquipments(summary),
      mergedEquipmentMovements
    );
    if (detail) {
      return {
        ...summary,
        contacts: detail.contacts,
        equipments: mergedEquipments,
        recent_equipment_movements: mergedEquipmentMovements,
        recent_proofs: mergedProofs,
        recent_voice_notes: mergedVoiceNotes,
        recent_signatures: mergedSignatures,
        risk_reports: mergedRiskReports,
        safety_checklist: safetyChecklist,
        checklist_today: detail.checklist_today
      };
    }

    return {
      ...summary,
      contacts: [],
      equipments: mergedEquipments,
      recent_equipment_movements: mergedEquipmentMovements,
      recent_proofs: mergedProofs,
      recent_voice_notes: mergedVoiceNotes,
      recent_signatures: mergedSignatures,
      risk_reports: mergedRiskReports,
      safety_checklist: safetyChecklist,
      checklist_today: []
    };
  }

  async prepareWorksiteForOffline(
    organizationId: string | null,
    worksiteId: string
  ): Promise<WorksiteEssentialDetail> {
    if (!organizationId) {
      throw new Error("Aucune organisation sélectionnée pour préparer ce chantier.");
    }

    const existingSummaryRecord = await this.getLocalRecord(WORKSITE_SUMMARY_ENTITY, worksiteId);
    const existingSummary = existingSummaryRecord ? this.mapWorksiteSummary(existingSummaryRecord) : null;
    if (!existingSummary) {
      throw new Error("Le chantier demandé est introuvable sur cet appareil.");
    }

    const preparedAt = nowIso();
    const existingDetailRecord = await this.getLocalRecord(WORKSITE_DETAIL_ENTITY, worksiteId);
    const existingDetail = existingDetailRecord ? this.mapWorksiteDetail(existingDetailRecord) : null;
    const safetyChecklist = await this.getWorksiteSafetyChecklist(organizationId, worksiteId);
    const equipments = existingDetail?.equipments.length
      ? existingDetail.equipments
      : getDefaultWorksiteEquipments(existingSummary);

    const summary: WorksiteSummary = {
      ...existingSummary,
      is_offline_ready: true,
      offline_prepared_at: preparedAt,
      updated_at: preparedAt
    };

    await this.upsertLocalRecord({
      entityName: WORKSITE_SUMMARY_ENTITY,
      recordId: worksiteId,
      organizationId,
      syncStatus: "synced",
      version: (existingSummaryRecord?.version ?? 0) + 1,
      payload: toRecordPayload(summary)
    });
    await this.upsertLocalRecord({
      entityName: WORKSITE_DETAIL_ENTITY,
      recordId: worksiteId,
      organizationId,
      syncStatus: "synced",
      version: (existingDetailRecord?.version ?? 0) + 1,
      payload: toRecordPayload({
        contacts: existingDetail?.contacts ?? [],
        equipments,
        recent_equipment_movements: existingDetail?.recent_equipment_movements ?? [],
        recent_proofs: existingDetail?.recent_proofs ?? [],
        recent_voice_notes: existingDetail?.recent_voice_notes ?? [],
        recent_signatures: existingDetail?.recent_signatures ?? [],
        risk_reports: existingDetail?.risk_reports ?? [],
        safety_checklist: safetyChecklist,
        checklist_today: existingDetail?.checklist_today ?? []
      })
    });

    return {
      ...summary,
      contacts: existingDetail?.contacts ?? [],
      equipments,
      recent_equipment_movements: existingDetail?.recent_equipment_movements ?? [],
      recent_proofs: existingDetail?.recent_proofs ?? [],
      recent_voice_notes: existingDetail?.recent_voice_notes ?? [],
      recent_signatures: existingDetail?.recent_signatures ?? [],
      risk_reports: existingDetail?.risk_reports ?? [],
      safety_checklist: safetyChecklist,
      checklist_today: existingDetail?.checklist_today ?? []
    };
  }

  async enqueueSyncOperation(input: EnqueueLocalSyncOperationInput): Promise<LocalSyncOperation> {
    const reusableOperation = await this.findReusableWorksiteSyncOperation(input);
    if (reusableOperation) {
      return this.refreshReusableWorksiteSyncOperation(reusableOperation, input);
    }

    const db = await this.getDatabase();
    const operationId = createOperationId();
    const timestamp = nowIso();
    await db.run(
      `
        INSERT INTO local_sync_queue (
          operation_id,
          organization_id,
          entity_name,
          entity_id,
          operation_type,
          status,
          base_version,
          payload,
          attempts,
          max_attempts,
          next_attempt_at,
          last_attempt_at,
          failed_at,
          last_error_code,
          last_error_message,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NULL, NULL, NULL, NULL, ?, ?)
      `,
      [
        operationId,
        input.organizationId ?? null,
        input.entityName,
        input.entityId,
        input.operationType,
        "pending",
        input.baseVersion ?? null,
        JSON.stringify(input.payload),
        input.maxAttempts ?? 5,
        input.nextAttemptAt ?? timestamp,
        timestamp,
        timestamp
      ]
    );
    await this.setLocalRecordSyncStatus(input.entityName, input.entityId, "pending_sync");
    await this.persistIfNeeded();
    const operation = await this.getSyncOperation(operationId);
    if (!operation) {
      throw new Error("La creation de l'operation locale a echoue.");
    }
    return operation;
  }

  async buildPreparedWorksiteSyncBatch(
    organizationId: string | null,
    limit = 25
  ): Promise<PreparedWorksiteSyncBatch> {
    if (!organizationId) {
      return {
        organizationId,
        items: [],
        sourceOperationCount: 0,
        preparedItemCount: 0,
        deduplicatedOperationCount: 0
      };
    }

    const sourceOperations = (await this.listSyncOperations({
      organizationId,
      statuses: ["pending", "in_progress", "failed"],
      limit: Math.max(limit * 4, 20)
    })).filter((operation) => isWorksiteSyncableEntityName(operation.entityName));

    const groupedOperations = new Map<string, LocalSyncOperation[]>();
    for (const operation of sourceOperations) {
      const groupKey = `${operation.entityName}:${operation.entityId}`;
      const existingGroup = groupedOperations.get(groupKey) ?? [];
      existingGroup.push(operation);
      groupedOperations.set(groupKey, existingGroup);
    }

    const items: PreparedWorksiteSyncItem[] = [];

    for (const operations of groupedOperations.values()) {
      if (items.length >= limit) {
        break;
      }

      const nextItems = await this.buildPreparedWorksiteSyncItemsForEntity(operations);
      for (const item of nextItems) {
        if (items.length >= limit) {
          break;
        }
        items.push(item);
      }
    }

    return {
      organizationId,
      items,
      sourceOperationCount: sourceOperations.length,
      preparedItemCount: items.length,
      deduplicatedOperationCount: Math.max(sourceOperations.length - items.length, 0)
    };
  }

  async listSyncOperations(options: ListLocalSyncOperationsOptions = {}): Promise<LocalSyncOperation[]> {
    const db = await this.getDatabase();
    const clauses: string[] = [];
    const values: Array<string | number | null> = [];

    if (options.organizationId !== undefined) {
      clauses.push("organization_id IS ?");
      values.push(options.organizationId ?? null);
    }

    if (options.statuses && options.statuses.length > 0) {
      clauses.push(`status IN (${options.statuses.map(() => "?").join(", ")})`);
      values.push(...options.statuses);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const result = await db.query(
      `
        SELECT *
        FROM local_sync_queue
        ${whereClause}
        ORDER BY
          CASE status
            WHEN 'in_progress' THEN 0
            WHEN 'pending' THEN 1
            WHEN 'failed' THEN 2
            ELSE 3
          END,
          COALESCE(next_attempt_at, created_at) ASC,
          created_at ASC
        LIMIT ${limit}
      `,
      values
    );
    return (result.values ?? []).map((row) => this.mapSyncOperation(row as SqliteRow));
  }

  async listRetryableSyncOperations(limit = 25): Promise<LocalSyncOperation[]> {
    const db = await this.getDatabase();
    const timestamp = nowIso();
    const result = await db.query(
      `
        SELECT *
        FROM local_sync_queue
        WHERE
          (
            status = 'pending'
            AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
          )
          OR (
            status = 'failed'
            AND attempts < max_attempts
            AND next_attempt_at IS NOT NULL
            AND next_attempt_at <= ?
          )
        ORDER BY COALESCE(next_attempt_at, created_at) ASC, created_at ASC
        LIMIT ${Math.min(Math.max(limit, 1), 100)}
      `,
      [timestamp, timestamp]
    );
    return (result.values ?? []).map((row) => this.mapSyncOperation(row as SqliteRow));
  }

  async getSyncOperation(operationId: string): Promise<LocalSyncOperation | null> {
    const db = await this.getDatabase();
    const result = await db.query(
      `
        SELECT *
        FROM local_sync_queue
        WHERE operation_id = ?
        LIMIT 1
      `,
      [operationId]
    );
    const row = (result.values?.[0] ?? null) as SqliteRow | null;
    return row ? this.mapSyncOperation(row) : null;
  }

  async markSyncOperationInProgress(operationId: string): Promise<LocalSyncOperation> {
    const db = await this.getDatabase();
    const operation = await this.requireSyncOperation(operationId);
    const timestamp = nowIso();
    await db.run(
      `
        UPDATE local_sync_queue
        SET
          status = ?,
          attempts = ?,
          last_attempt_at = ?,
          updated_at = ?
        WHERE operation_id = ?
      `,
      ["in_progress", operation.attempts + 1, timestamp, timestamp, operationId]
    );
    await this.persistIfNeeded();
    return this.requireSyncOperation(operationId);
  }

  async markSyncOperationFailed(
    operationId: string,
    failure: LocalSyncFailureInput
  ): Promise<LocalSyncOperation> {
    const db = await this.getDatabase();
    const operation = await this.requireSyncOperation(operationId);
    const timestamp = nowIso();
    const attempts =
      operation.status === "in_progress" ? operation.attempts : operation.attempts + 1;
    const nextAttemptAt =
      failure.retryAt === undefined ? computeRetryAt(attempts, operation.maxAttempts) : failure.retryAt;

    await db.run(
      `
        UPDATE local_sync_queue
        SET
          status = ?,
          attempts = ?,
          next_attempt_at = ?,
          failed_at = ?,
          last_error_code = ?,
          last_error_message = ?,
          updated_at = ?
        WHERE operation_id = ?
      `,
      [
        "failed",
        attempts,
        nextAttemptAt,
        timestamp,
        failure.code ?? null,
        failure.message,
        timestamp,
        operationId
      ]
    );
    await this.persistIfNeeded();
    return this.requireSyncOperation(operationId);
  }

  async markSyncOperationCompleted(operationId: string): Promise<LocalSyncOperation> {
    const db = await this.getDatabase();
    const operation = await this.requireSyncOperation(operationId);
    const timestamp = nowIso();
    await db.run(
      `
        UPDATE local_sync_queue
        SET
          status = ?,
          next_attempt_at = NULL,
          failed_at = NULL,
          last_error_code = NULL,
          last_error_message = NULL,
          updated_at = ?
        WHERE operation_id = ?
      `,
      ["completed", timestamp, operationId]
    );
    if (!(await this.hasOutstandingSyncOperationsForEntity(operation.entityName, operation.entityId))) {
      await this.setLocalRecordSyncStatus(operation.entityName, operation.entityId, "synced");
    }
    await this.persistIfNeeded();
    return this.requireSyncOperation(operationId);
  }

  async requeueSyncOperation(operationId: string): Promise<LocalSyncOperation> {
    const db = await this.getDatabase();
    const operation = await this.requireSyncOperation(operationId);
    const timestamp = nowIso();
    await db.run(
      `
        UPDATE local_sync_queue
        SET
          status = ?,
          next_attempt_at = ?,
          failed_at = NULL,
          updated_at = ?
        WHERE operation_id = ?
      `,
      ["pending", timestamp, timestamp, operationId]
    );
    await this.setLocalRecordSyncStatus(operation.entityName, operation.entityId, "pending_sync");
    await this.persistIfNeeded();
    return this.requireSyncOperation(operationId);
  }

  private async findReusableWorksiteSyncOperation(
    input: EnqueueLocalSyncOperationInput
  ): Promise<LocalSyncOperation | null> {
    if (!isWorksiteSyncableEntityName(input.entityName)) {
      return null;
    }

    if (
      input.operationType !== "create"
      && input.operationType !== "update"
      && input.operationType !== "status_change"
      && input.operationType !== "upload_media"
    ) {
      return null;
    }

    const activeOperations = await this.listSyncOperations({
      organizationId: input.organizationId,
      statuses: ["pending", "failed"],
      limit: 100
    });
    const sameEntityOperations = activeOperations
      .filter((operation) =>
        operation.entityName === input.entityName && operation.entityId === input.entityId
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

    if (input.operationType === "upload_media") {
      return sameEntityOperations.find((operation) => operation.operationType === "upload_media") ?? null;
    }

    if (input.operationType === "create") {
      return sameEntityOperations.find((operation) => operation.operationType === "create") ?? null;
    }

    return sameEntityOperations.find((operation) =>
      operation.operationType === "create"
      || operation.operationType === "update"
      || operation.operationType === "status_change"
    ) ?? null;
  }

  private async refreshReusableWorksiteSyncOperation(
    operation: LocalSyncOperation,
    input: EnqueueLocalSyncOperationInput
  ): Promise<LocalSyncOperation> {
    const db = await this.getDatabase();
    const timestamp = nowIso();
    const preferredPayload = await this.buildPreferredWorksiteSyncPayload(input);
    const nextOperationType =
      operation.operationType === "create" && input.operationType !== "upload_media"
        ? "create"
        : input.operationType;
    const nextBaseVersion =
      operation.operationType === "create" && nextOperationType === "create"
        ? operation.baseVersion ?? input.baseVersion ?? 0
        : input.baseVersion ?? operation.baseVersion;

    await db.run(
      `
        UPDATE local_sync_queue
        SET
          operation_type = ?,
          base_version = ?,
          payload = ?,
          status = ?,
          attempts = 0,
          next_attempt_at = ?,
          failed_at = NULL,
          last_error_code = NULL,
          last_error_message = NULL,
          updated_at = ?
        WHERE operation_id = ?
      `,
      [
        nextOperationType,
        nextBaseVersion,
        JSON.stringify(preferredPayload),
        "pending",
        timestamp,
        timestamp,
        operation.operationId
      ]
    );
    await this.setLocalRecordSyncStatus(input.entityName, input.entityId, "pending_sync");
    await this.persistIfNeeded();
    return this.requireSyncOperation(operation.operationId);
  }

  private async buildPreparedWorksiteSyncItemsForEntity(
    operations: LocalSyncOperation[]
  ): Promise<PreparedWorksiteSyncItem[]> {
    if (operations.length === 0 || !isWorksiteSyncableEntityName(operations[0].entityName)) {
      return [];
    }

    const entityName = operations[0].entityName as WorksiteSyncableEntityName;
    const entityId = operations[0].entityId;
    const organizationId = operations[0].organizationId ?? null;
    const orderedOperations = [...operations].sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt)
    );
    const mutationOperations = orderedOperations.filter((operation) => operation.operationType !== "upload_media");
    const mediaOperations = orderedOperations.filter((operation) => operation.operationType === "upload_media");
    const items: PreparedWorksiteSyncItem[] = [];

    if (mutationOperations.length > 0) {
      const latestMutation = mutationOperations[mutationOperations.length - 1];
      const currentRecord = await this.getLocalRecord(entityName, entityId);
      const mutationOperation =
        mutationOperations.every((operation) => operation.operationType === "delete_soft")
          ? "delete"
          : "upsert";
      items.push({
        itemId: `${entityName}:${entityId}:mutation`,
        organizationId,
        entityName,
        entityId,
        kind: "mutation",
        status: this.getPreparedWorksiteSyncItemStatus(mutationOperations),
        mutationOperation,
        sourceOperationIds: mutationOperations.map((operation) => operation.operationId),
        sourceOperationCount: mutationOperations.length,
        fileId: null,
        fileName:
          currentRecord && typeof currentRecord.payload.file_name === "string"
            ? currentRecord.payload.file_name
            : null,
        baseVersion:
          mutationOperations.some((operation) => operation.operationType === "create")
            ? 0
            : latestMutation.baseVersion,
        payload:
          mutationOperation === "delete"
            ? {
                deleted_at:
                  currentRecord?.deletedAt
                  ?? (typeof latestMutation.payload.deleted_at === "string"
                    ? latestMutation.payload.deleted_at
                    : nowIso())
              }
            : currentRecord?.payload ?? latestMutation.payload,
        createdAt: mutationOperations[0].createdAt,
        updatedAt: latestMutation.updatedAt
      });
    }

    if (mediaOperations.length > 0) {
      const latestMedia = mediaOperations[mediaOperations.length - 1];
      const fileId = typeof latestMedia.payload.file_id === "string"
        ? latestMedia.payload.file_id
        : entityId;
      const fileReference = await this.getLocalFileReference(fileId);
      items.push({
        itemId: `${entityName}:${entityId}:media`,
        organizationId,
        entityName,
        entityId,
        kind: "media_upload",
        status: this.getPreparedWorksiteSyncItemStatus(mediaOperations),
        mutationOperation: null,
        sourceOperationIds: mediaOperations.map((operation) => operation.operationId),
        sourceOperationCount: mediaOperations.length,
        fileId,
        fileName: fileReference?.fileName ?? (typeof latestMedia.payload.file_name === "string"
          ? latestMedia.payload.file_name
          : null),
        baseVersion: latestMedia.baseVersion,
        payload: {
          ...latestMedia.payload,
          file_id: fileId,
          file_name: fileReference?.fileName ?? latestMedia.payload.file_name ?? null,
          local_uri: fileReference?.localUri ?? latestMedia.payload.local_uri ?? null,
          mime_type: fileReference?.mimeType ?? latestMedia.payload.mime_type ?? null,
          size_bytes: fileReference?.sizeBytes ?? latestMedia.payload.size_bytes ?? null,
          captured_at: fileReference?.capturedAt ?? latestMedia.payload.captured_at ?? null
        },
        createdAt: mediaOperations[0].createdAt,
        updatedAt: latestMedia.updatedAt
      });
    }

    return items;
  }

  private getPreparedWorksiteSyncItemStatus(
    operations: LocalSyncOperation[]
  ): Exclude<LocalSyncOperationStatus, "completed"> {
    if (operations.some((operation) => operation.status === "failed")) {
      return "failed";
    }
    if (operations.some((operation) => operation.status === "in_progress")) {
      return "in_progress";
    }
    return "pending";
  }

  private async buildPreferredWorksiteSyncPayload(
    input: EnqueueLocalSyncOperationInput
  ): Promise<Record<string, unknown>> {
    if (input.operationType === "upload_media") {
      const fileId =
        typeof input.payload.file_id === "string" ? input.payload.file_id : input.entityId;
      const fileReference = await this.getLocalFileReference(fileId);
      return {
        ...input.payload,
        file_id: fileId,
        file_name: fileReference?.fileName ?? input.payload.file_name ?? null,
        local_uri: fileReference?.localUri ?? input.payload.local_uri ?? null,
        mime_type: fileReference?.mimeType ?? input.payload.mime_type ?? null,
        size_bytes: fileReference?.sizeBytes ?? input.payload.size_bytes ?? null,
        captured_at: fileReference?.capturedAt ?? input.payload.captured_at ?? null
      };
    }

    if (
      input.operationType === "create"
      || input.operationType === "update"
      || input.operationType === "status_change"
      || input.operationType === "delete_soft"
    ) {
      const currentRecord = await this.getLocalRecord(input.entityName, input.entityId);
      if (currentRecord) {
        return {
          ...currentRecord.payload,
          ...(currentRecord.deletedAt ? { deleted_at: currentRecord.deletedAt } : {})
        };
      }
    }

    return input.payload;
  }

  private async performInitialization(): Promise<void> {
    await this.initializeWebStoreIfNeeded();
    const db = await this.openDatabase();
    this.db = db;
    await db.execute(MIGRATION_TABLE_SQL);
    await this.applyPendingMigrations(db);
    await db.run(
      `
        INSERT INTO local_settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `,
      ["schema_version", String(LOCAL_DATABASE_SCHEMA_VERSION), nowIso()]
    );
    await this.persistIfNeeded();
  }

  private async initializeWebStoreIfNeeded(): Promise<void> {
    if (Capacitor.getPlatform() !== "web") {
      return;
    }
    if (!this.webBootstrapPromise) {
      this.webBootstrapPromise = this.performWebBootstrap();
    }
    return this.webBootstrapPromise;
  }

  private async performWebBootstrap(): Promise<void> {
    defineJeepSqlite(window);
    if (!document.querySelector("jeep-sqlite")) {
      const element = document.createElement("jeep-sqlite");
      (document.body ?? document.documentElement).appendChild(element);
    }
    await customElements.whenDefined("jeep-sqlite");
    await this.sqlite.initWebStore();
  }

  private async openDatabase(): Promise<SQLiteDBConnection> {
    const consistency = await this.sqlite
      .checkConnectionsConsistency()
      .catch(() => ({ result: false }));
    const hasConnection =
      consistency.result === true && (await this.sqlite.isConnection(LOCAL_DATABASE_NAME, false)).result === true;

    const db = hasConnection
      ? await this.sqlite.retrieveConnection(LOCAL_DATABASE_NAME, false)
      : await this.sqlite.createConnection(LOCAL_DATABASE_NAME, false, "no-encryption", 1, false);

    const isOpen = await db.isDBOpen().catch(() => ({ result: false }));
    if (isOpen.result !== true) {
      await db.open();
    }
    return db;
  }

  private async applyPendingMigrations(db: SQLiteDBConnection): Promise<void> {
    const migrationState = await this.getMigrationState(db);
    const pendingMigrations = LOCAL_DATABASE_MIGRATIONS
      .filter((migration) => migration.version > migrationState.version)
      .sort((left, right) => left.version - right.version);

    for (const migration of pendingMigrations) {
      await db.beginTransaction();
      try {
        for (const statement of migration.statements) {
          await db.execute(statement, false);
        }
        await db.run(
          "INSERT INTO local_schema_migrations (version, applied_at) VALUES (?, ?)",
          [migration.version, nowIso()],
          false
        );
        await db.commitTransaction();
      } catch (error) {
        await db.rollbackTransaction().catch(() => undefined);
        throw error;
      }
    }

    if (pendingMigrations.length > 0) {
      await this.persistIfNeeded();
    }
  }

  private async countRows(db: SQLiteDBConnection, query: string, values?: Array<string | number | null>): Promise<number> {
    const result = await db.query(query, values);
    const row = (result.values?.[0] ?? null) as SqliteRow | null;
    return typeof row?.count === "number" ? row.count : Number(row?.count ?? 0);
  }

  private async getMigrationState(db: SQLiteDBConnection): Promise<MigrationState> {
    await db.execute(MIGRATION_TABLE_SQL);
    const result = await db.query(
      `
        SELECT
          COALESCE(MAX(version), 0) AS version,
          MAX(applied_at) AS applied_at
        FROM local_schema_migrations
      `
    );
    const row = (result.values?.[0] ?? null) as SqliteRow | null;
    return {
      version: typeof row?.version === "number" ? row.version : Number(row?.version ?? 0),
      appliedAt: typeof row?.applied_at === "string" ? row.applied_at : null
    };
  }

  private async getDatabase(): Promise<SQLiteDBConnection> {
    await this.initialize();
    if (!this.db) {
      throw new Error("La base locale mobile n'est pas disponible.");
    }
    return this.db;
  }

  private async requireSyncOperation(operationId: string): Promise<LocalSyncOperation> {
    const operation = await this.getSyncOperation(operationId);
    if (!operation) {
      throw new Error("L'operation locale demandee est introuvable.");
    }
    return operation;
  }

  private async hasOutstandingSyncOperationsForEntity(
    entityName: string,
    entityId: string
  ): Promise<boolean> {
    const db = await this.getDatabase();
    const count = await this.countRows(
      db,
      `
        SELECT COUNT(*) AS count
        FROM local_sync_queue
        WHERE
          entity_name = ?
          AND entity_id = ?
          AND status IN ('pending', 'in_progress', 'failed')
      `,
      [entityName, entityId]
    );
    return count > 0;
  }

  private async setLocalRecordSyncStatus(
    entityName: string,
    recordId: string,
    syncStatus: LocalRecordSyncStatus
  ): Promise<void> {
    const db = await this.getDatabase();
    await db.run(
      `
        UPDATE local_records
        SET
          sync_status = ?,
          updated_at = ?
        WHERE entity_name = ? AND record_id = ?
      `,
      [syncStatus, nowIso(), entityName, recordId]
    );
  }

  private mapWorksiteSummary(record: LocalRecord): WorksiteSummary | null {
    const payload = record.payload;
    const id = typeof payload.id === "string" ? payload.id : record.recordId;
    const organizationId =
      typeof payload.organization_id === "string" ? payload.organization_id : record.organizationId;
    const name = typeof payload.name === "string" ? payload.name : null;
    const clientName = typeof payload.client_name === "string" ? payload.client_name : null;
    const address = typeof payload.address === "string" ? payload.address : null;
    const status = typeof payload.status === "string" ? payload.status : null;

    if (!organizationId || !name || !clientName || !address || !status) {
      return null;
    }

    return {
      id,
      organization_id: organizationId,
      name,
      client_name: clientName,
      address,
      status: status as WorksiteSummary["status"],
      planned_for: typeof payload.planned_for === "string" ? payload.planned_for : null,
      is_offline_ready: payload.is_offline_ready === true,
      offline_prepared_at:
        typeof payload.offline_prepared_at === "string" ? payload.offline_prepared_at : null,
      updated_at: typeof payload.updated_at === "string" ? payload.updated_at : record.updatedAt,
      coordination:
        payload.coordination && typeof payload.coordination === "object" && !Array.isArray(payload.coordination)
          ? (payload.coordination as WorksiteCoordinationRecord)
          : createDefaultWorksiteCoordination(id)
    };
  }

  private mapWorksiteDetail(record: LocalRecord): WorksiteEssentialDetail | null {
    return {
      contacts: Array.isArray(record.payload.contacts)
        ? (record.payload.contacts as WorksiteEssentialDetail["contacts"])
        : [],
      equipments: Array.isArray(record.payload.equipments)
        ? record.payload.equipments
            .map((item) => this.mapStoredWorksiteEquipment(item))
            .filter((equipment): equipment is WorksiteEquipment => equipment !== null)
        : [],
      recent_equipment_movements: Array.isArray(record.payload.recent_equipment_movements)
        ? record.payload.recent_equipment_movements
            .map((item) => this.mapStoredWorksiteEquipmentMovement(item))
            .filter((movement): movement is WorksiteEquipmentMovement => movement !== null)
        : [],
      recent_proofs: Array.isArray(record.payload.recent_proofs)
        ? record.payload.recent_proofs
            .map((item) => this.mapStoredWorksiteProofSummary(item))
            .filter((proof): proof is WorksiteProofSummary => proof !== null)
        : [],
      recent_voice_notes: Array.isArray(record.payload.recent_voice_notes)
        ? record.payload.recent_voice_notes
            .map((item) => this.mapStoredWorksiteVoiceNoteSummary(item))
            .filter((note): note is WorksiteVoiceNoteSummary => note !== null)
        : [],
      recent_signatures: Array.isArray(record.payload.recent_signatures)
        ? record.payload.recent_signatures
            .map((item) => this.mapStoredWorksiteSignatureSummary(item))
            .filter((signature): signature is WorksiteSignatureSummary => signature !== null)
        : [],
      risk_reports: Array.isArray(record.payload.risk_reports)
        ? record.payload.risk_reports
            .map((item) => this.mapStoredWorksiteRiskReport(item))
            .filter((report): report is WorksiteRiskReport => report !== null)
        : [],
      safety_checklist: this.mapStoredWorksiteSafetyChecklist(record.payload.safety_checklist)
        ?? createDefaultWorksiteSafetyChecklist(
          typeof record.payload.worksite_id === "string" ? record.payload.worksite_id : record.recordId
        ),
      checklist_today: Array.isArray(record.payload.checklist_today)
        ? (record.payload.checklist_today as WorksiteEssentialDetail["checklist_today"])
        : []
    } as WorksiteEssentialDetail;
  }

  private readWorksiteSafetyChecklistStatus(value: unknown): WorksiteSafetyChecklistStatus {
    return value === "validated" ? "validated" : "draft";
  }

  private readWorksiteEquipmentStatus(value: unknown): WorksiteEquipment["status"] {
    if (value === "attention" || value === "unavailable") {
      return value;
    }
    return "ready";
  }

  private mapStoredWorksiteEquipment(value: unknown): WorksiteEquipment | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const equipment = value as Record<string, unknown>;
    if (typeof equipment.id !== "string" || typeof equipment.name !== "string" || typeof equipment.type !== "string") {
      return null;
    }

    return {
      id: equipment.id,
      name: equipment.name,
      type: equipment.type,
      status: this.readWorksiteEquipmentStatus(equipment.status)
    };
  }

  private readWorksiteEquipmentMovementType(value: unknown): WorksiteEquipmentMovementType {
    switch (value) {
      case "removed_from_worksite":
      case "marked_damaged":
        return value;
      default:
        return "assigned_to_worksite";
    }
  }

  private mapStoredWorksiteEquipmentMovement(value: unknown): WorksiteEquipmentMovement | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const movement = value as Record<string, unknown>;
    if (
      typeof movement.id !== "string"
      || typeof movement.worksite_id !== "string"
      || typeof movement.equipment_id !== "string"
      || typeof movement.equipment_name !== "string"
    ) {
      return null;
    }

    return {
      id: movement.id,
      worksite_id: movement.worksite_id,
      equipment_id: movement.equipment_id,
      equipment_name: movement.equipment_name,
      movement_type: this.readWorksiteEquipmentMovementType(movement.movement_type),
      resulting_status: this.readWorksiteEquipmentStatus(movement.resulting_status),
      captured_at: typeof movement.captured_at === "string" ? movement.captured_at : null,
      actor_user_id: typeof movement.actor_user_id === "string" ? movement.actor_user_id : null,
      actor_display_name:
        typeof movement.actor_display_name === "string" ? movement.actor_display_name : null,
      sync_status:
        movement.sync_status === "pending_sync"
          ? "pending_sync"
          : movement.sync_status === "synced"
            ? "synced"
            : "local_only"
    };
  }

  private readWorksiteSafetyChecklistAnswer(value: unknown): WorksiteSafetyChecklistAnswer | null {
    if (value === "yes" || value === "no" || value === "na") {
      return value;
    }
    return null;
  }

  private mapStoredWorksiteSafetyChecklist(value: unknown): WorksiteSafetyChecklist | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const checklist = value as Record<string, unknown>;
    const worksiteId = typeof checklist.worksite_id === "string" ? checklist.worksite_id : null;
    const id = typeof checklist.id === "string"
      ? checklist.id
      : worksiteId
        ? getWorksiteSafetyChecklistRecordId(worksiteId)
        : null;

    if (!id || !worksiteId) {
      return null;
    }

    const items = Array.isArray(checklist.items)
      ? checklist.items
          .map((item) => this.mapStoredWorksiteSafetyChecklistItem(item))
          .filter((item): item is WorksiteSafetyChecklistItem => item !== null)
      : [];

    return {
      id,
      worksite_id: worksiteId,
      status: this.readWorksiteSafetyChecklistStatus(checklist.status),
      comment_text: normalizeOptionalText(checklist.comment_text),
      updated_at: typeof checklist.updated_at === "string" ? checklist.updated_at : null,
      items: items.length > 0 ? items : createDefaultWorksiteSafetyChecklist(worksiteId).items,
      sync_status:
        checklist.sync_status === "pending_sync"
          ? "pending_sync"
          : checklist.sync_status === "synced"
            ? "synced"
            : "local_only"
    };
  }

  private mapStoredWorksiteSafetyChecklistItem(value: unknown): WorksiteSafetyChecklistItem | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const item = value as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : null;
    const label = typeof item.label === "string" ? item.label : null;
    if (!id || !label) {
      return null;
    }

    return {
      id,
      label,
      answer: this.readWorksiteSafetyChecklistAnswer(item.answer)
    };
  }

  private mapWorksiteSafetyChecklist(record: LocalRecord): WorksiteSafetyChecklist | null {
    const checklist = this.mapStoredWorksiteSafetyChecklist({
      id: record.recordId,
      worksite_id: record.payload.worksite_id,
      status: record.payload.status,
      comment_text: record.payload.comment_text,
      updated_at: record.payload.updated_at ?? record.updatedAt,
      items: record.payload.items,
      sync_status:
        record.syncStatus === "pending_sync"
          ? "pending_sync"
          : record.syncStatus === "synced"
            ? "synced"
            : "local_only"
    });

    return checklist;
  }

  private mapStoredWorksiteProofSummary(value: unknown): WorksiteProofSummary | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const proof = value as Record<string, unknown>;
    const id = typeof proof.id === "string" ? proof.id : null;
    const label = typeof proof.label === "string" ? proof.label : "Photo preuve";
    const syncStatus = typeof proof.sync_status === "string" ? proof.sync_status : "local_only";

    if (!id) {
      return null;
    }

    return {
      id,
      label,
      file_name: typeof proof.file_name === "string" ? proof.file_name : null,
      thumbnail_local_uri:
        typeof proof.thumbnail_local_uri === "string" ? proof.thumbnail_local_uri : null,
      comment_text: normalizeOptionalText(proof.comment_text),
      captured_at: typeof proof.captured_at === "string" ? proof.captured_at : null,
      sync_status: syncStatus as WorksiteProofSummary["sync_status"]
    };
  }

  private async listWorksiteProofSummaries(
    organizationId: string,
    worksiteId: string
  ): Promise<WorksiteProofSummary[]> {
    const records = await this.listLocalRecords(WORKSITE_PROOF_ENTITY, organizationId);
    const proofRecords = records.filter((record) => {
      const attachedEntityType = record.payload.attached_to_entity_type;
      const attachedEntityId = record.payload.attached_to_entity_id;
      return attachedEntityType === "worksite" && attachedEntityId === worksiteId;
    });

    const proofs = await Promise.all(
      proofRecords.map(async (record) => {
        const fileReference = await this.getLocalFileReference(record.recordId);
        return this.mapWorksiteProofSummary(record, fileReference);
      })
    );

    return proofs
      .filter((proof): proof is WorksiteProofSummary => proof !== null)
      .sort((left, right) =>
        (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
      );
  }

  private mapWorksiteProofSummary(
    record: LocalRecord,
    fileReference: LocalFileReference | null
  ): WorksiteProofSummary | null {
    const fileName =
      typeof record.payload.file_name === "string"
        ? record.payload.file_name
        : fileReference?.fileName ?? null;
    const capturedAt =
      typeof record.payload.captured_at === "string"
        ? record.payload.captured_at
        : fileReference?.capturedAt ?? null;

    return {
      id: record.recordId,
      label:
        typeof record.payload.label === "string" && record.payload.label.length > 0
          ? record.payload.label
          : "Photo preuve",
      file_name: fileName,
      thumbnail_local_uri: fileReference?.localUri ?? null,
      comment_text: normalizeOptionalText(record.payload.comment_text),
      captured_at: capturedAt,
      sync_status:
        record.syncStatus === "pending_sync"
          ? "pending_sync"
          : record.syncStatus === "synced"
            ? "synced"
            : "local_only"
      };
  }

  private mapStoredWorksiteSignatureSummary(value: unknown): WorksiteSignatureSummary | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const signature = value as Record<string, unknown>;
    const id = typeof signature.id === "string" ? signature.id : null;
    const label = typeof signature.label === "string" ? signature.label : "Signature simple";
    const syncStatus = typeof signature.sync_status === "string" ? signature.sync_status : "local_only";

    if (!id) {
      return null;
    }

    return {
      id,
      label,
      file_name: typeof signature.file_name === "string" ? signature.file_name : null,
      signature_local_uri:
        typeof signature.signature_local_uri === "string" ? signature.signature_local_uri : null,
      captured_at: typeof signature.captured_at === "string" ? signature.captured_at : null,
      sync_status: syncStatus as WorksiteSignatureSummary["sync_status"]
    };
  }

  private async listWorksiteSignatureSummaries(
    organizationId: string,
    worksiteId: string
  ): Promise<WorksiteSignatureSummary[]> {
    const records = await this.listLocalRecords(WORKSITE_SIGNATURE_ENTITY, organizationId);
    const signatureRecords = records.filter((record) => {
      const attachedEntityType = record.payload.attached_to_entity_type;
      const attachedEntityId = record.payload.attached_to_entity_id;
      return attachedEntityType === "worksite" && attachedEntityId === worksiteId;
    });

    const signatures = await Promise.all(
      signatureRecords.map(async (record) => {
        const fileReference = await this.getLocalFileReference(record.recordId);
        return this.mapWorksiteSignatureSummary(record, fileReference);
      })
    );

    return signatures
      .filter((signature): signature is WorksiteSignatureSummary => signature !== null)
      .sort((left, right) =>
        (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
      );
  }

  private mapWorksiteSignatureSummary(
    record: LocalRecord,
    fileReference: LocalFileReference | null
  ): WorksiteSignatureSummary | null {
    const fileName =
      typeof record.payload.file_name === "string"
        ? record.payload.file_name
        : fileReference?.fileName ?? null;
    const capturedAt =
      typeof record.payload.captured_at === "string"
        ? record.payload.captured_at
        : fileReference?.capturedAt ?? null;

    return {
      id: record.recordId,
      label:
        typeof record.payload.label === "string" && record.payload.label.length > 0
          ? record.payload.label
          : "Signature simple",
      file_name: fileName,
      signature_local_uri: fileReference?.localUri ?? null,
      captured_at: capturedAt,
      sync_status:
        record.syncStatus === "pending_sync"
          ? "pending_sync"
          : record.syncStatus === "synced"
            ? "synced"
            : "local_only"
    };
  }

  private readWorksiteRiskType(value: unknown): WorksiteRiskReport["risk_type"] {
    switch (value) {
      case "fall":
      case "slip":
      case "electrical":
      case "traffic":
        return value;
      default:
        return "other";
    }
  }

  private readWorksiteRiskSeverity(value: unknown): WorksiteRiskReport["severity"] {
    switch (value) {
      case "low":
      case "medium":
      case "high":
        return value;
      default:
        return "medium";
    }
  }

  private mapStoredWorksiteRiskReport(value: unknown): WorksiteRiskReport | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const report = value as Record<string, unknown>;
    const id = typeof report.id === "string" ? report.id : null;
    const worksiteId = typeof report.worksite_id === "string" ? report.worksite_id : null;

    if (!id || !worksiteId) {
      return null;
    }

    return {
      id,
      worksite_id: worksiteId,
      risk_type: this.readWorksiteRiskType(report.risk_type),
      severity: this.readWorksiteRiskSeverity(report.severity),
      note_text: normalizeOptionalText(report.note_text),
      photo_file_name: typeof report.photo_file_name === "string" ? report.photo_file_name : null,
      photo_thumbnail_local_uri:
        typeof report.photo_thumbnail_local_uri === "string"
          ? report.photo_thumbnail_local_uri
          : null,
      captured_at: typeof report.captured_at === "string" ? report.captured_at : null,
      sync_status:
        report.sync_status === "pending_sync"
          ? "pending_sync"
          : report.sync_status === "synced"
            ? "synced"
            : "local_only"
    };
  }

  private async listWorksiteRiskReports(
    organizationId: string,
    worksiteId: string
  ): Promise<WorksiteRiskReport[]> {
    const records = await this.listLocalRecords(WORKSITE_RISK_REPORT_ENTITY, organizationId);
    const riskReportRecords = records.filter((record) => {
      const attachedEntityType = record.payload.attached_to_entity_type;
      const attachedEntityId = record.payload.attached_to_entity_id;
      return attachedEntityType === "worksite" && attachedEntityId === worksiteId;
    });

    const reports = await Promise.all(
      riskReportRecords.map(async (record) => {
        const fileReference = await this.getLocalFileReference(record.recordId);
        return this.mapWorksiteRiskReport(record, fileReference);
      })
    );

    return reports
      .filter((report): report is WorksiteRiskReport => report !== null)
      .sort((left, right) =>
        (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
      );
  }

  private mapWorksiteRiskReport(
    record: LocalRecord,
    fileReference: LocalFileReference | null
  ): WorksiteRiskReport | null {
    const worksiteId =
      typeof record.payload.worksite_id === "string"
        ? record.payload.worksite_id
        : typeof record.payload.attached_to_entity_id === "string"
          ? record.payload.attached_to_entity_id
          : null;

    if (!worksiteId) {
      return null;
    }

    return {
      id: record.recordId,
      worksite_id: worksiteId,
      risk_type: this.readWorksiteRiskType(record.payload.risk_type),
      severity: this.readWorksiteRiskSeverity(record.payload.severity),
      note_text: normalizeOptionalText(record.payload.note_text),
      photo_file_name:
        typeof record.payload.photo_file_name === "string"
          ? record.payload.photo_file_name
          : fileReference?.fileName ?? null,
      photo_thumbnail_local_uri: fileReference?.localUri ?? null,
      captured_at:
        typeof record.payload.captured_at === "string"
          ? record.payload.captured_at
          : fileReference?.capturedAt ?? null,
      sync_status:
        record.syncStatus === "pending_sync"
          ? "pending_sync"
          : record.syncStatus === "synced"
            ? "synced"
            : "local_only"
    };
  }

  private async listWorksiteEquipmentMovements(
    organizationId: string,
    worksiteId: string
  ): Promise<WorksiteEquipmentMovement[]> {
    const records = await this.listLocalRecords(WORKSITE_EQUIPMENT_MOVEMENT_ENTITY, organizationId);
    return records
      .filter((record) => {
        const attachedEntityType = record.payload.attached_to_entity_type;
        const attachedEntityId = record.payload.attached_to_entity_id;
        return attachedEntityType === "worksite" && attachedEntityId === worksiteId;
      })
      .map((record) => this.mapWorksiteEquipmentMovement(record))
      .filter((movement): movement is WorksiteEquipmentMovement => movement !== null)
      .sort((left, right) =>
        (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
      );
  }

  private mapWorksiteEquipmentMovement(
    record: LocalRecord
  ): WorksiteEquipmentMovement | null {
    const worksiteId =
      typeof record.payload.worksite_id === "string"
        ? record.payload.worksite_id
        : typeof record.payload.attached_to_entity_id === "string"
          ? record.payload.attached_to_entity_id
          : null;
    const equipmentId =
      typeof record.payload.equipment_id === "string" ? record.payload.equipment_id : null;
    const equipmentName =
      typeof record.payload.equipment_name === "string"
        ? record.payload.equipment_name
        : null;

    if (!worksiteId || !equipmentId || !equipmentName) {
      return null;
    }

    return {
      id: record.recordId,
      worksite_id: worksiteId,
      equipment_id: equipmentId,
      equipment_name: equipmentName,
      movement_type: this.readWorksiteEquipmentMovementType(record.payload.movement_type),
      resulting_status: this.readWorksiteEquipmentStatus(record.payload.resulting_status),
      captured_at:
        typeof record.payload.captured_at === "string" ? record.payload.captured_at : null,
      actor_user_id:
        typeof record.payload.actor_user_id === "string" ? record.payload.actor_user_id : null,
      actor_display_name:
        typeof record.payload.actor_display_name === "string"
          ? record.payload.actor_display_name
          : null,
      sync_status:
        record.syncStatus === "pending_sync"
          ? "pending_sync"
          : record.syncStatus === "synced"
            ? "synced"
            : "local_only"
    };
  }

  private mapStoredWorksiteVoiceNoteSummary(value: unknown): WorksiteVoiceNoteSummary | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const note = value as Record<string, unknown>;
    const id = typeof note.id === "string" ? note.id : null;
    const label = typeof note.label === "string" ? note.label : "Note vocale";
    const syncStatus = typeof note.sync_status === "string" ? note.sync_status : "local_only";

    if (!id) {
      return null;
    }

    return {
      id,
      label,
      file_name: typeof note.file_name === "string" ? note.file_name : null,
      playback_local_uri:
        typeof note.playback_local_uri === "string" ? note.playback_local_uri : null,
      captured_at: typeof note.captured_at === "string" ? note.captured_at : null,
      duration_seconds:
        typeof note.duration_seconds === "number"
          ? note.duration_seconds
          : note.duration_seconds == null
            ? null
            : Number(note.duration_seconds),
      sync_status: syncStatus as WorksiteVoiceNoteSummary["sync_status"]
    };
  }

  private async listWorksiteVoiceNoteSummaries(
    organizationId: string,
    worksiteId: string
  ): Promise<WorksiteVoiceNoteSummary[]> {
    const records = await this.listLocalRecords(WORKSITE_VOICE_NOTE_ENTITY, organizationId);
    const voiceNoteRecords = records.filter((record) => {
      const attachedEntityType = record.payload.attached_to_entity_type;
      const attachedEntityId = record.payload.attached_to_entity_id;
      return attachedEntityType === "worksite" && attachedEntityId === worksiteId;
    });

    const voiceNotes = await Promise.all(
      voiceNoteRecords.map(async (record) => {
        const fileReference = await this.getLocalFileReference(record.recordId);
        return this.mapWorksiteVoiceNoteSummary(record, fileReference);
      })
    );

    return voiceNotes
      .filter((note): note is WorksiteVoiceNoteSummary => note !== null)
      .sort((left, right) =>
        (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
      );
  }

  private mapWorksiteVoiceNoteSummary(
    record: LocalRecord,
    fileReference: LocalFileReference | null
  ): WorksiteVoiceNoteSummary | null {
    const fileName =
      typeof record.payload.file_name === "string"
        ? record.payload.file_name
        : fileReference?.fileName ?? null;
    const capturedAt =
      typeof record.payload.captured_at === "string"
        ? record.payload.captured_at
        : fileReference?.capturedAt ?? null;
    const durationSeconds =
      typeof record.payload.duration_seconds === "number"
        ? record.payload.duration_seconds
        : record.payload.duration_seconds == null
          ? null
          : Number(record.payload.duration_seconds);

    return {
      id: record.recordId,
      label:
        typeof record.payload.label === "string" && record.payload.label.length > 0
          ? record.payload.label
          : "Note vocale",
      file_name: fileName,
      playback_local_uri: fileReference?.localUri ?? null,
      captured_at: capturedAt,
      duration_seconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
      sync_status:
        record.syncStatus === "pending_sync"
          ? "pending_sync"
          : record.syncStatus === "synced"
            ? "synced"
            : "local_only"
    };
  }

  private mergeWorksiteVoiceNotes(
    existingVoiceNotes: WorksiteVoiceNoteSummary[],
    localVoiceNotes: WorksiteVoiceNoteSummary[]
  ): WorksiteVoiceNoteSummary[] {
    const byId = new Map<string, WorksiteVoiceNoteSummary>();
    for (const voiceNote of existingVoiceNotes) {
      byId.set(voiceNote.id, voiceNote);
    }
    for (const voiceNote of localVoiceNotes) {
      byId.set(voiceNote.id, voiceNote);
    }
    return [...byId.values()].sort((left, right) =>
      (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
    );
  }

  private mergeWorksiteSignatures(
    existingSignatures: WorksiteSignatureSummary[],
    localSignatures: WorksiteSignatureSummary[]
  ): WorksiteSignatureSummary[] {
    const byId = new Map<string, WorksiteSignatureSummary>();
    for (const signature of existingSignatures) {
      byId.set(signature.id, signature);
    }
    for (const signature of localSignatures) {
      byId.set(signature.id, signature);
    }
    return [...byId.values()].sort((left, right) =>
      (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
    );
  }

  private mergeWorksiteRiskReports(
    existingRiskReports: WorksiteRiskReport[],
    localRiskReports: WorksiteRiskReport[]
  ): WorksiteRiskReport[] {
    const byId = new Map<string, WorksiteRiskReport>();
    for (const report of existingRiskReports) {
      byId.set(report.id, report);
    }
    for (const report of localRiskReports) {
      byId.set(report.id, report);
    }
    return [...byId.values()].sort((left, right) =>
      (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
    );
  }

  private mergeWorksiteEquipmentMovements(
    existingMovements: WorksiteEquipmentMovement[],
    localMovements: WorksiteEquipmentMovement[]
  ): WorksiteEquipmentMovement[] {
    const byId = new Map<string, WorksiteEquipmentMovement>();
    for (const movement of existingMovements) {
      byId.set(movement.id, movement);
    }
    for (const movement of localMovements) {
      byId.set(movement.id, movement);
    }
    return [...byId.values()].sort((left, right) =>
      (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
    );
  }

  private applyEquipmentMovementsToEquipments(
    equipments: WorksiteEquipment[],
    movements: WorksiteEquipmentMovement[]
  ): WorksiteEquipment[] {
    const latestStatusByEquipmentId = new Map<string, WorksiteEquipmentStatus>();
    for (const movement of movements) {
      if (!latestStatusByEquipmentId.has(movement.equipment_id)) {
        latestStatusByEquipmentId.set(movement.equipment_id, movement.resulting_status);
      }
    }

    return equipments.map((equipment) => ({
      ...equipment,
      status: latestStatusByEquipmentId.get(equipment.id) ?? equipment.status
    }));
  }

  private mergeWorksiteProofs(
    existingProofs: WorksiteProofSummary[],
    localProofs: WorksiteProofSummary[]
  ): WorksiteProofSummary[] {
    const byId = new Map<string, WorksiteProofSummary>();
    for (const proof of existingProofs) {
      byId.set(proof.id, proof);
    }
    for (const proof of localProofs) {
      byId.set(proof.id, proof);
    }
    return [...byId.values()].sort((left, right) =>
      (right.captured_at ?? "").localeCompare(left.captured_at ?? "")
    );
  }

  private async persistIfNeeded(): Promise<void> {
    if (Capacitor.getPlatform() === "web") {
      await this.sqlite.saveToStore(LOCAL_DATABASE_NAME);
    }
  }

  private mapLocalRecord(row: SqliteRow): LocalRecord {
    return {
      entityName: String(row.entity_name ?? ""),
      recordId: String(row.record_id ?? ""),
      organizationId: row.organization_id == null ? null : String(row.organization_id),
      syncStatus: String(row.sync_status ?? "local_only") as LocalRecordSyncStatus,
      version: typeof row.version === "number" ? row.version : Number(row.version ?? 0),
      payload: parsePayload(row.payload),
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(row.updated_at ?? ""),
      deletedAt: row.deleted_at == null ? null : String(row.deleted_at)
    };
  }

  private mapLocalFileReference(row: SqliteRow): LocalFileReference {
    return {
      fileId: String(row.file_id ?? ""),
      organizationId: row.organization_id == null ? null : String(row.organization_id),
      ownerEntityName: row.owner_entity_name == null ? null : String(row.owner_entity_name),
      ownerRecordId: row.owner_record_id == null ? null : String(row.owner_record_id),
      fileName: String(row.file_name ?? row.file_id ?? ""),
      documentType: String(row.document_type ?? "attachment"),
      source: String(row.source ?? "local_capture"),
      localUri: String(row.local_uri ?? ""),
      mimeType: row.mime_type == null ? null : String(row.mime_type),
      sizeBytes: row.size_bytes == null ? null : Number(row.size_bytes),
      checksum: row.checksum == null ? null : String(row.checksum),
      capturedAt: row.captured_at == null ? null : String(row.captured_at),
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(row.updated_at ?? ""),
      deletedAt: row.deleted_at == null ? null : String(row.deleted_at)
    };
  }

  private mapSyncOperation(row: SqliteRow): LocalSyncOperation {
    return {
      operationId: String(row.operation_id ?? ""),
      organizationId: row.organization_id == null ? null : String(row.organization_id),
      entityName: String(row.entity_name ?? ""),
      entityId: String(row.entity_id ?? ""),
      operationType: String(row.operation_type ?? "update") as LocalSyncOperationType,
      status: String(row.status ?? "pending") as LocalSyncOperationStatus,
      baseVersion: row.base_version == null ? null : Number(row.base_version),
      payload: parsePayload(row.payload),
      attempts: typeof row.attempts === "number" ? row.attempts : Number(row.attempts ?? 0),
      maxAttempts: typeof row.max_attempts === "number" ? row.max_attempts : Number(row.max_attempts ?? 0),
      nextAttemptAt: row.next_attempt_at == null ? null : String(row.next_attempt_at),
      lastAttemptAt: row.last_attempt_at == null ? null : String(row.last_attempt_at),
      failedAt: row.failed_at == null ? null : String(row.failed_at),
      lastErrorCode: row.last_error_code == null ? null : String(row.last_error_code),
      lastErrorMessage: row.last_error_message == null ? null : String(row.last_error_message),
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(row.updated_at ?? "")
    };
  }
}

export const mobileLocalDatabase = new MobileLocalDatabase();
