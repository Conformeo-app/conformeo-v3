import type { AuthSession, LoginRequest, LoginResponse } from "@conformeo/contracts";
import { generatedEnv } from "../environments/generated-env";

const ACCESS_TOKEN_STORAGE_KEY = "conformeo.access_token";
const ORGANIZATION_ID_STORAGE_KEY = "conformeo.organization_id";

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function getApiBaseUrl(): string {
  return generatedEnv.apiBaseUrl.replace(/\/$/, "");
}

function buildHeaders(accessToken?: string, organizationId?: string | null): HeadersInit {
  return {
    Accept: "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(organizationId ? { "X-Conformeo-Organization-Id": organizationId } : {})
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw new Error(detail);
  }
  return payload as T;
}

export function getStoredAccessToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
}

export function getStoredOrganizationId(): string | null {
  return getStorage()?.getItem(ORGANIZATION_ID_STORAGE_KEY) ?? null;
}

export function persistSession(accessToken: string, session: AuthSession): void {
  const storage = getStorage();
  storage?.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  storage?.setItem(ORGANIZATION_ID_STORAGE_KEY, session.current_membership.organization.id);
}

export function clearSession(): void {
  const storage = getStorage();
  storage?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  storage?.removeItem(ORGANIZATION_ID_STORAGE_KEY);
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });
  return parseJsonResponse<LoginResponse>(response);
}

export async function fetchSession(accessToken: string, organizationId?: string | null): Promise<AuthSession> {
  const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  return parseJsonResponse<AuthSession>(response);
}
