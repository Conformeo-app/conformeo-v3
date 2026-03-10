import type { EntityId, VersionedRecord } from "./common";
import type { KnownRoleCode } from "./rbac";

export type OrganizationMembershipRoleCode = KnownRoleCode | (string & {});

export interface OrganizationMembershipRecord extends VersionedRecord {
  user_id: EntityId;
  organization_id: EntityId;
  role_code: OrganizationMembershipRoleCode;
  is_default: boolean;
}
