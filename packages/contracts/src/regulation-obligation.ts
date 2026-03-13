import type { ComplianceStatus } from "./compliance";
import type { EntityId } from "./common";

export type RegulatoryObligationCategory = "company" | "employees" | "safety" | "buildings";
export type RegulatoryObligationPriority = "high" | "medium" | "low";
export type RegulatoryProfileStatus = "ready" | "to_complete";
export type RegulatoryCriterionCode =
  | "has_employees"
  | "employee_count_known"
  | "has_active_site"
  | "has_premises"
  | "has_warehouse"
  | "receives_public"
  | "stores_hazardous_products"
  | "performs_high_risk_work";

export interface RegulatoryCriterionRecord {
  code: RegulatoryCriterionCode;
  label: string;
  value: boolean | number | null;
  summary: string;
}

export interface RegulatoryObligationRecord {
  id: string;
  title: string;
  description: string;
  category: RegulatoryObligationCategory;
  priority: RegulatoryObligationPriority;
  rule_key: string;
}

export interface ApplicableRegulatoryObligationRecord extends RegulatoryObligationRecord {
  status: ComplianceStatus;
  reason_summary: string;
  matched_criteria: RegulatoryCriterionCode[];
}

export interface OrganizationRegulatoryProfileRecord {
  organization_id: EntityId;
  profile_status: RegulatoryProfileStatus;
  missing_profile_items: string[];
  criteria: RegulatoryCriterionRecord[];
  applicable_obligations: ApplicableRegulatoryObligationRecord[];
}
