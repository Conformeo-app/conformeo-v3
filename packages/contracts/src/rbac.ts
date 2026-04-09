export type KnownRoleCode =
  | "owner"
  | "admin"
  | "manager"
  | "contributor"
  | "viewer"
  | "member";

export type PermissionCode =
  | "organization:read"
  | "organization:update"
  | "users:read"
  | "users:manage"
  | "modules:read"
  | "modules:manage";

export type ModuleAccessLevel = "disabled" | "read" | "action" | "admin";

export const ROLE_PERMISSIONS: Record<KnownRoleCode, PermissionCode[]> = {
  owner: [
    "organization:read",
    "organization:update",
    "users:read",
    "users:manage",
    "modules:read",
    "modules:manage"
  ],
  admin: [
    "organization:read",
    "organization:update",
    "users:read",
    "users:manage",
    "modules:read",
    "modules:manage"
  ],
  manager: [
    "organization:read",
    "organization:update",
    "users:read",
    "modules:read"
  ],
  contributor: [
    "organization:read",
    "organization:update",
    "modules:read"
  ],
  viewer: [
    "organization:read",
    "modules:read"
  ],
  member: [
    "organization:read",
    "modules:read"
  ]
};

export const ROLE_LABELS: Record<KnownRoleCode, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  contributor: "Terrain",
  viewer: "Lecteur",
  member: "Membre",
};

export const ROLE_SUMMARIES: Record<KnownRoleCode, string> = {
  owner: "Administration complète de l'organisation et des accès.",
  admin: "Administration courante de l'organisation, des accès et des modules.",
  manager: "Pilotage opérationnel avec action sur les modules actifs.",
  contributor: "Action sur les modules actifs sans administration des accès.",
  viewer: "Lecture seule sur les modules actifs.",
  member: "Lecture simple sur les modules actifs.",
};

export const ASSIGNABLE_ROLE_CODES: KnownRoleCode[] = [
  "owner",
  "admin",
  "manager",
  "contributor",
  "viewer",
];

export const MODULE_ACCESS_LABELS: Record<ModuleAccessLevel, string> = {
  disabled: "Désactivé",
  read: "Lecture",
  action: "Action",
  admin: "Admin",
};
