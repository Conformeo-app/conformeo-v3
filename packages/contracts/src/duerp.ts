import type { EntityId, VersionedRecord } from "./common";
import type { ComplianceStatus } from "./compliance";

export type DuerpSeverity = "low" | "medium" | "high";
export type DuerpEntryStatus = "active" | "archived";

export interface DuerpEntryRecord extends VersionedRecord {
  organization_id: EntityId;
  site_id: EntityId | null;
  site_name: string | null;
  work_unit_name: string;
  risk_label: string;
  severity: DuerpSeverity;
  prevention_action: string | null;
  status: DuerpEntryStatus;
  compliance_status: ComplianceStatus;
  proof_count: number;
}

export interface DuerpEntryCreateRequest {
  site_id?: EntityId | null;
  work_unit_name: string;
  risk_label: string;
  severity: DuerpSeverity;
  prevention_action?: string | null;
}

export interface DuerpEntryUpdateRequest {
  site_id?: EntityId | null;
  work_unit_name?: string | null;
  risk_label?: string | null;
  severity?: DuerpSeverity | null;
  prevention_action?: string | null;
  status?: DuerpEntryStatus | null;
}
