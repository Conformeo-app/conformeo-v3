export interface LocalDatabaseMigration {
  version: number;
  statements: string[];
}

export const LOCAL_DATABASE_NAME = "conformeo_mobile";
export const LOCAL_DATABASE_SCHEMA_VERSION = 3;

export const LOCAL_DATABASE_MIGRATIONS: LocalDatabaseMigration[] = [
  {
    version: 1,
    statements: [
      `
        CREATE TABLE IF NOT EXISTS local_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS local_records (
          entity_name TEXT NOT NULL,
          record_id TEXT NOT NULL,
          organization_id TEXT,
          sync_status TEXT NOT NULL DEFAULT 'local_only',
          version INTEGER NOT NULL DEFAULT 0,
          payload TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          PRIMARY KEY (entity_name, record_id)
        );
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_local_records_entity_org
          ON local_records (entity_name, organization_id);
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_local_records_sync_status
          ON local_records (sync_status, updated_at);
      `,
      `
        CREATE TABLE IF NOT EXISTS local_file_references (
          file_id TEXT PRIMARY KEY NOT NULL,
          organization_id TEXT,
          owner_entity_name TEXT,
          owner_record_id TEXT,
          local_uri TEXT NOT NULL,
          mime_type TEXT,
          size_bytes INTEGER,
          checksum TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        );
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_local_file_references_owner
          ON local_file_references (owner_entity_name, owner_record_id);
      `
    ]
  },
  {
    version: 2,
    statements: [
      `
        CREATE TABLE IF NOT EXISTS local_sync_queue (
          operation_id TEXT PRIMARY KEY NOT NULL,
          organization_id TEXT,
          entity_name TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          operation_type TEXT NOT NULL CHECK (
            operation_type IN ('create', 'update', 'delete_soft', 'upload_media', 'status_change')
          ),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'in_progress', 'failed', 'completed')
          ),
          base_version INTEGER,
          payload TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 5,
          next_attempt_at TEXT,
          last_attempt_at TEXT,
          failed_at TEXT,
          last_error_code TEXT,
          last_error_message TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_local_sync_queue_status_next_attempt
          ON local_sync_queue (status, next_attempt_at);
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_local_sync_queue_entity
          ON local_sync_queue (entity_name, entity_id);
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_local_sync_queue_org_status
          ON local_sync_queue (organization_id, status);
      `
    ]
  },
  {
    version: 3,
    statements: [
      `
        ALTER TABLE local_file_references
        ADD COLUMN file_name TEXT;
      `,
      `
        ALTER TABLE local_file_references
        ADD COLUMN document_type TEXT NOT NULL DEFAULT 'attachment';
      `,
      `
        ALTER TABLE local_file_references
        ADD COLUMN source TEXT NOT NULL DEFAULT 'local_capture';
      `,
      `
        ALTER TABLE local_file_references
        ADD COLUMN captured_at TEXT;
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_local_file_references_org_captured_at
          ON local_file_references (organization_id, captured_at);
      `
    ]
  }
];
