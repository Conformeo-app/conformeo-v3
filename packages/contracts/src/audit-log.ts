import type { EntityId, IsoDateTime } from "./common";

export type AuditAction =
  | "create"
  | "update"
  | "soft_delete"
  | "status_change"
  | "module_activation_change";

export interface AuditLogRecord {
  id: EntityId;
  organization_id: EntityId | null;
  actor_user_id: EntityId | null;
  actor_label: string;
  action_type: AuditAction;
  target_type: string;
  target_id: EntityId;
  target_display: string | null;
  changes: Record<string, unknown> | null;
  occurred_at: IsoDateTime;
}
