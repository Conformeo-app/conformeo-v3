import type { MembershipAccess, ModuleAccessLevel, ModuleCode } from "@conformeo/contracts";

function getRoleCode(membership: MembershipAccess | null): string | null {
  return membership?.membership.role_code ?? null;
}

export function getEnabledModuleCodes(membership: MembershipAccess | null): ModuleCode[] {
  if (!membership) {
    return [];
  }

  const modulesFromEnabledList = membership.enabled_modules ?? [];
  const modulesFromRecords =
    membership.modules
      ?.filter((module) => module.is_enabled)
      .map((module) => module.module_code)
    ?? [];

  return Array.from(new Set([...modulesFromEnabledList, ...modulesFromRecords]));
}

export function isModuleEnabled(membership: MembershipAccess | null, moduleCode: ModuleCode): boolean {
  return getEnabledModuleCodes(membership).includes(moduleCode);
}

export function getModuleAccessLevel(
  membership: MembershipAccess | null,
  moduleCode: ModuleCode,
): ModuleAccessLevel {
  if (!membership || !isModuleEnabled(membership, moduleCode)) {
    return "disabled";
  }

  switch (getRoleCode(membership)) {
    case "owner":
    case "admin":
      return "admin";
    case "manager":
    case "contributor":
      return "action";
    case "viewer":
    case "member":
    default:
      return "read";
  }
}

export function canReadModule(membership: MembershipAccess | null, moduleCode: ModuleCode): boolean {
  return getModuleAccessLevel(membership, moduleCode) !== "disabled";
}

export function canActOnModule(membership: MembershipAccess | null, moduleCode: ModuleCode): boolean {
  const accessLevel = getModuleAccessLevel(membership, moduleCode);
  return accessLevel === "action" || accessLevel === "admin";
}

export function canAdministerModule(membership: MembershipAccess | null, moduleCode: ModuleCode): boolean {
  return getModuleAccessLevel(membership, moduleCode) === "admin";
}

export function canAccessAdministration(membership: MembershipAccess | null): boolean {
  switch (getRoleCode(membership)) {
    case "owner":
    case "admin":
    case "manager":
      return true;
    default:
      return false;
  }
}

export function canManageAdministration(membership: MembershipAccess | null): boolean {
  switch (getRoleCode(membership)) {
    case "owner":
    case "admin":
      return true;
    default:
      return false;
  }
}

export function isAdministrationReadOnly(membership: MembershipAccess | null): boolean {
  return canAccessAdministration(membership) && !canManageAdministration(membership);
}
