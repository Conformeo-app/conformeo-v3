import type { AuthSession, LoginRequest, LoginResponse, ModuleCode, OrganizationModuleRecord } from "@conformeo/contracts";
export type PersistedSessionSnapshot = {
    accessToken: string | null;
    organizationId: string | null;
};
export declare function getStoredAccessToken(): string | null;
export declare function getStoredOrganizationId(): string | null;
export declare function getHydratedSession(accessToken: string | null | undefined): AuthSession | null;
export declare function persistSession(accessToken: string, session: AuthSession): PersistedSessionSnapshot;
export declare function clearSession(reason?: string): void;
export declare function login(request: LoginRequest): Promise<LoginResponse>;
export declare function fetchSession(accessToken: string, organizationId?: string | null): Promise<AuthSession>;
export declare function updateOrganizationModule(accessToken: string, organizationId: string, moduleCode: ModuleCode, isEnabled: boolean): Promise<OrganizationModuleRecord>;
//# sourceMappingURL=auth-client.d.ts.map