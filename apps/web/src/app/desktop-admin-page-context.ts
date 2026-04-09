import { InjectionToken } from "@angular/core";
import type {
  KnownRoleCode,
  ModuleCode,
  ModuleAccessLevel,
  OrganizationMemberCreateRequest,
  OrganizationMemberRecord,
  OrganizationMemberUpdateRequest,
  OrganizationModuleRecord,
  OrganizationProfileUpdateRequest,
  OrganizationRecord,
  OrganizationTeamRecord,
  OrganizationTeamUpsertRequest,
} from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";
import type { Observable } from "rxjs";

import type { DesktopNavigationItem } from "./desktop-shell-context";

export interface DesktopAdministrationState {
  readonly organization: OrganizationRecord | null;
  readonly members: OrganizationMemberRecord[];
  readonly teams: OrganizationTeamRecord[];
}

export interface DesktopAdministrationPageContext {
  readonly state$: Observable<DesktopAdministrationState>;
  readonly currentMembershipRoleCode: string | null;
  readonly canAccessAdministration: boolean;
  readonly isAdministrationReadOnly: boolean;
  readonly canReadOrganization: boolean;
  readonly canManageOrganization: boolean;
  readonly canEditOrganizationSettings: boolean;
  readonly canReadUsers: boolean;
  readonly canManageUsers: boolean;
  readonly canManageModules: boolean;
  readonly organization: OrganizationRecord | null;
  readonly members: OrganizationMemberRecord[];
  readonly teams: OrganizationTeamRecord[];
  readonly organizationModules: OrganizationModuleRecord[];
  readonly memberCount: number;
  readonly teamCount: number;
  readonly invitedMemberCount: number;
  readonly disabledMemberCount: number;
  readonly enabledModuleCount: number;
  readonly loading: boolean;
  readonly savingProfile: boolean;
  readonly savingModuleCode: ModuleCode | null;
  readonly savingMemberId: string | null;
  readonly savingTeamId: string | null;
  readonly roleOptions: Array<{
    value: KnownRoleCode;
    label: string;
    summary: string;
  }>;
  readonly adminNavigationItems: DesktopNavigationItem[];
  refresh(): Promise<void>;
  saveOrganizationProfile(payload: OrganizationProfileUpdateRequest): Promise<void>;
  setModuleState(moduleCode: ModuleCode, isEnabled: boolean): Promise<void>;
  createMember(payload: OrganizationMemberCreateRequest): Promise<OrganizationMemberRecord | null>;
  updateMember(membershipId: string, payload: OrganizationMemberUpdateRequest): Promise<OrganizationMemberRecord | null>;
  createTeam(payload: OrganizationTeamUpsertRequest): Promise<OrganizationTeamRecord | null>;
  updateTeam(teamId: string, payload: OrganizationTeamUpsertRequest): Promise<OrganizationTeamRecord | null>;
  getRoleLabel(roleCode: string): string;
  getUserStatusLabel(status: string): string;
  getUserStatusTone(status: string): CfmTone;
  getModuleAccessTone(accessLevel: ModuleAccessLevel): CfmTone;
}

export const DESKTOP_ADMIN_PAGE_CONTEXT =
  new InjectionToken<DesktopAdministrationPageContext>("DESKTOP_ADMIN_PAGE_CONTEXT");
