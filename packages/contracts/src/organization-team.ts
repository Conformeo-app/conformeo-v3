import type { VersionedRecord } from "./common";
import type { OrganizationMembershipRoleCode } from "./organization-membership";
import type { UserStatus } from "./user";

export interface OrganizationTeamMemberRecord {
  user_id: string;
  display_name: string;
  email: string;
  status: UserStatus;
  role_code: OrganizationMembershipRoleCode;
  role_label: string;
}

export interface OrganizationTeamRecord extends VersionedRecord {
  organization_id: string;
  name: string;
  description: string | null;
  member_count: number;
  members: OrganizationTeamMemberRecord[];
}

export interface OrganizationTeamUpsertRequest {
  name: string;
  description?: string | null;
  member_user_ids: string[];
}
