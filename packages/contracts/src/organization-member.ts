import type { ModuleCode } from "./organization-module";
import type { OrganizationMembershipRecord, OrganizationMembershipRoleCode } from "./organization-membership";
import type { ModuleAccessLevel } from "./rbac";
import type { UserRecord, UserStatus } from "./user";

export interface OrganizationMemberModuleAccessRecord {
  module_code: ModuleCode;
  module_label: string;
  access_level: ModuleAccessLevel;
  access_label: string;
  is_enabled: boolean;
}

export interface OrganizationMemberRecord {
  membership: OrganizationMembershipRecord;
  user: UserRecord;
  role_label: string;
  role_summary: string;
  access_overview: string;
  module_access: OrganizationMemberModuleAccessRecord[];
  team_ids: string[];
  team_names: string[];
}

export interface OrganizationMemberCreateRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role_code: OrganizationMembershipRoleCode;
}

export interface OrganizationMemberUpdateRequest {
  role_code?: OrganizationMembershipRoleCode | null;
  user_status?: UserStatus | null;
}
