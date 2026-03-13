import type { EntityId, VersionedRecord } from "./common";

export type BuildingSafetyItemType = "fire_extinguisher" | "dae" | "periodic_check";
export type BuildingSafetyItemStatus = "active" | "archived";
export type BuildingSafetyAlertStatus = "ok" | "due_soon" | "overdue" | "archived";
export type BuildingSafetyAlertType = "due_soon" | "overdue";

export interface BuildingSafetyItemRecord extends VersionedRecord {
  organization_id: EntityId;
  site_id: EntityId;
  site_name: string;
  item_type: BuildingSafetyItemType;
  name: string;
  next_due_date: string;
  last_checked_at: string | null;
  status: BuildingSafetyItemStatus;
  alert_status: BuildingSafetyAlertStatus;
  notes: string | null;
}

export interface BuildingSafetyAlertRecord {
  item_id: EntityId;
  site_id: EntityId;
  site_name: string;
  item_name: string;
  item_type: BuildingSafetyItemType;
  alert_type: BuildingSafetyAlertType;
  due_date: string;
  message: string;
}

export interface BuildingSafetyItemCreateRequest {
  site_id: EntityId;
  item_type: BuildingSafetyItemType;
  name: string;
  next_due_date: string;
  last_checked_at?: string | null;
  notes?: string | null;
}

export interface BuildingSafetyItemUpdateRequest {
  name?: string | null;
  next_due_date?: string | null;
  last_checked_at?: string | null;
  status?: BuildingSafetyItemStatus | null;
  notes?: string | null;
}
