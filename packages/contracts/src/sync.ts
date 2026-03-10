import type { EntityId, IsoDateTime } from "./common";

export type SyncEntityName = "organizations" | "users";
export type SyncOperation = "upsert" | "delete";
export type SyncItemState = "pending" | "in_flight" | "synced" | "conflict" | "failed";
export type SyncPushState = "accepted" | "conflict" | "rejected";

export interface SyncCursor {
  scope: "global" | "organization";
  organization_id: EntityId | null;
  cursor: string | null;
  pulled_at: IsoDateTime;
}

export interface SyncMutationEnvelope {
  mutation_id: string;
  organization_id: EntityId | null;
  entity_name: SyncEntityName;
  entity_id: EntityId;
  operation: SyncOperation;
  base_version: number | null;
  submitted_at: IsoDateTime;
  submitted_by: EntityId | null;
  payload: Record<string, unknown>;
}

export interface SyncPullRequest {
  device_id: string;
  organization_id: EntityId | null;
  entities: SyncEntityName[];
  cursor: string | null;
  limit: number;
}

export interface SyncPullItem {
  envelope: SyncMutationEnvelope;
  server_version: number;
}

export interface SyncPullResponse {
  items: SyncPullItem[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface SyncPushAck {
  mutation_id: string;
  state: SyncPushState;
  applied_version: number | null;
  conflict_reason: string | null;
  server_snapshot: Record<string, unknown> | null;
}
