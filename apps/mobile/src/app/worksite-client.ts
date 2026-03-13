import type { WorksiteApiSummary } from "@conformeo/contracts";
import { generatedEnv } from "../environments/generated-env";

function getApiBaseUrl(): string {
  return generatedEnv.apiBaseUrl.replace(/\/$/, "");
}

function buildHeaders(accessToken: string, organizationId: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "X-Conformeo-Organization-Id": organizationId
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

export async function fetchWorksiteSummaries(
  accessToken: string,
  organizationId: string
): Promise<WorksiteApiSummary[]> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksites`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  return parseJsonResponse<WorksiteApiSummary[]>(response);
}
