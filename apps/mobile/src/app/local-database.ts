import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection
} from "@capacitor-community/sqlite";
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
  UpsertLocalFileReferenceInput,
  UpsertLocalRecordInput
} from "./local-database.types";

type SqliteRow = Record<string, unknown>;

interface MigrationState {
  version: number;
  appliedAt: string | null;
}

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

  async enqueueSyncOperation(input: EnqueueLocalSyncOperationInput): Promise<LocalSyncOperation> {
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
