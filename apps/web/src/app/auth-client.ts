import type {
  AuthSession,
  LoginRequest,
  LoginResponse,
  ModuleCode,
  ModuleToggleRequest,
  OrganizationModuleRecord
} from "@conformeo/contracts";
import { generatedEnv } from "../environments/generated-env";
import { createHttpApiError, createNetworkApiError } from "./api-error";

const ACCESS_TOKEN_STORAGE_KEY = "conformeo.access_token";
const ORGANIZATION_ID_STORAGE_KEY = "conformeo.organization_id";
let hydratedSessionCache: { accessToken: string; session: AuthSession } | null = null;

export type PersistedSessionSnapshot = {
  accessToken: string | null;
  organizationId: string | null;
};

function getStorage(): Storage | null {
  try {
    return globalThis.window?.localStorage ?? globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readStoredValue(key: string): string | null {
  return getStorage()?.getItem(key) ?? null;
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

async function requestJson<T>(input: string, init: RequestInit): Promise<T> {
  let response: Response;
  let rawText = "";

  try {
    response = await fetch(input, init);
  } catch {
    throw createNetworkApiError(getApiBaseUrl());
  }

  try {
    rawText = await response.text();
  } catch (error) {
    console.error("[auth] unable to read API response body.", {
      url: response.url,
      status: response.status,
      error,
    });
  }

  const trimmedText = rawText.replace(/^\uFEFF/, "").trim();
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  let payload: unknown = null;
  let parsedAsJson = false;

  try {
    if (trimmedText) {
      payload = JSON.parse(trimmedText);
      parsedAsJson = true;
    }
  } catch {
    payload = null;
    parsedAsJson = false;
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? String(payload.detail)
        : rawText.trim() || "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }

  if (!parsedAsJson || payload === null) {
    console.error("[auth] unexpected API payload.", {
      status: response.status,
      contentType,
      bodyPreview: rawText.slice(0, 240),
      url: response.url,
    });
    throw new Error("La réponse du serveur est incomplète ou illisible.");
  }

  return payload as T;
}

export function getStoredAccessToken(): string | null {
  return readStoredValue(ACCESS_TOKEN_STORAGE_KEY);
}

export function getStoredOrganizationId(): string | null {
  return readStoredValue(ORGANIZATION_ID_STORAGE_KEY);
}

export function getHydratedSession(accessToken: string | null | undefined): AuthSession | null {
  if (!accessToken || !hydratedSessionCache || hydratedSessionCache.accessToken !== accessToken) {
    return null;
  }

  return hydratedSessionCache.session;
}

export function persistSession(accessToken: string, session: AuthSession): PersistedSessionSnapshot {
  const storage = getStorage();

  if (!storage) {
    throw new Error("Le navigateur ne permet pas d'enregistrer la session localement.");
  }

  try {
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    storage.setItem(ORGANIZATION_ID_STORAGE_KEY, session.current_membership.organization.id);
  } catch {
    throw new Error("La session n'a pas pu être enregistrée localement sur cet appareil.");
  }

  const persistedSnapshot: PersistedSessionSnapshot = {
    accessToken: readStoredValue(ACCESS_TOKEN_STORAGE_KEY),
    organizationId: readStoredValue(ORGANIZATION_ID_STORAGE_KEY),
  };

  if (
    persistedSnapshot.accessToken !== accessToken
    || persistedSnapshot.organizationId !== session.current_membership.organization.id
  ) {
    clearSession();
    throw new Error("La session n'a pas pu être confirmée dans le stockage local du navigateur.");
  }

  hydratedSessionCache = {
    accessToken,
    session,
  };

  return persistedSnapshot;
}

export function clearSession(reason = "unspecified"): void {
  const storage = getStorage();
  const hadStoredAccessToken = Boolean(readStoredValue(ACCESS_TOKEN_STORAGE_KEY));
  const hadStoredOrganizationId = Boolean(readStoredValue(ORGANIZATION_ID_STORAGE_KEY));

  console.warn("[auth] clearing persisted session.", {
    reason,
    hadStoredAccessToken,
    hadStoredOrganizationId,
  });

  storage?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  storage?.removeItem(ORGANIZATION_ID_STORAGE_KEY);
  hydratedSessionCache = null;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const payload = await requestJson<LoginResponse>(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!payload.access_token || !payload.session?.current_membership?.organization?.id) {
    throw new Error("La réponse de connexion reçue est incomplète.");
  }

  persistSession(payload.access_token, payload.session);
  return payload;
}

export async function fetchSession(accessToken: string, organizationId?: string | null): Promise<AuthSession> {
  return requestJson<AuthSession>(`${getApiBaseUrl()}/auth/me`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
}

export async function updateOrganizationModule(
  accessToken: string,
  organizationId: string,
  moduleCode: ModuleCode,
  isEnabled: boolean
): Promise<OrganizationModuleRecord> {
  const payload: ModuleToggleRequest = { is_enabled: isEnabled };
  return requestJson<OrganizationModuleRecord>(`${getApiBaseUrl()}/organizations/${organizationId}/modules/${moduleCode}`, {
    method: "PUT",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
