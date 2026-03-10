import type { EntityId, IsoDateTime } from "./common";
import type { OrganizationMembershipRecord } from "./organization-membership";
import type { OrganizationModuleRecord, ModuleCode } from "./organization-module";
import type { OrganizationRecord } from "./organization";
import type { PermissionCode } from "./rbac";
import type { UserRecord } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
  organization_id?: EntityId | null;
}

export interface ModuleToggleRequest {
  is_enabled: boolean;
}

export interface MembershipAccess {
  membership: OrganizationMembershipRecord;
  organization: OrganizationRecord;
  permissions: PermissionCode[];
  modules: OrganizationModuleRecord[];
  enabled_modules: ModuleCode[];
}

export interface AuthSession {
  user: UserRecord;
  memberships: MembershipAccess[];
  current_membership: MembershipAccess;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_at: IsoDateTime;
  session: AuthSession;
}
