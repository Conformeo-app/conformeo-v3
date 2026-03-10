import type { EntityId, VersionedRecord } from "./common";

export type ModuleCode = "reglementation" | "chantier" | "facturation";

export interface OrganizationModuleRecord extends VersionedRecord {
  organization_id: EntityId;
  module_code: ModuleCode;
  is_enabled: boolean;
}
