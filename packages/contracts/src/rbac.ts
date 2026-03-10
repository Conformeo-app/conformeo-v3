export type KnownRoleCode = "owner" | "admin" | "member";

export type PermissionCode =
  | "organization:read"
  | "organization:update"
  | "users:read"
  | "users:manage"
  | "modules:read"
  | "modules:manage";

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
    "users:read",
    "users:manage",
    "modules:read",
    "modules:manage"
  ],
  member: [
    "organization:read",
    "modules:read"
  ]
};
