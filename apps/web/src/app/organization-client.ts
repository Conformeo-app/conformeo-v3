import type {
  AuditLogRecord,
  BillingCustomerCreateRequest,
  BillingCustomerRecord,
  BillingCustomerUpdateRequest,
  CockpitSummaryRecord,
  BuildingSafetyAlertRecord,
  BuildingSafetyItemCreateRequest,
  BuildingSafetyItemRecord,
  BuildingSafetyItemUpdateRequest,
  DuerpEntryCreateRequest,
  DuerpEntryRecord,
  DuerpEntryUpdateRequest,
  InvoiceCreateRequest,
  InvoiceFollowUpUpdateRequest,
  InvoicePaymentCreateRequest,
  InvoiceRecord,
  InvoiceStatusUpdateRequest,
  InvoiceUpdateRequest,
  OrganizationRegulatoryProfileRecord,
  OrganizationProfileUpdateRequest,
  OrganizationRecord,
  RegulatoryEvidenceCreateRequest,
  RegulatoryEvidenceRecord,
  OrganizationSiteCreateRequest,
  OrganizationSiteRecord,
  OrganizationSiteUpdateRequest,
  QuoteCreateRequest,
  QuoteFollowUpUpdateRequest,
  QuoteRecord,
  QuoteStatusUpdateRequest,
  QuoteUpdateRequest,
  QuoteWorksiteLinkUpdateRequest,
  InvoiceWorksiteLinkUpdateRequest,
  WorksiteApiSummary,
  WorksiteAssigneeRecord,
  WorksiteCoordinationUpdateRequest,
  WorksiteDocumentProofUpdateRequest,
  WorksiteDocumentStatusUpdateRequest,
  WorksiteDocumentSignatureUpdateRequest,
  WorksiteDocumentRecord,
  WorksiteProofRecord,
  WorksitePreventionPlanExportRequest,
  WorksiteSignatureRecord
} from "@conformeo/contracts";
import { generatedEnv } from "../environments/generated-env";
import { ApiClientError, createHttpApiError, createNetworkApiError, createTimeoutApiError } from "./api-error";

const WORKSPACE_REQUEST_TIMEOUT_MS = 10000;
const REGULATORY_WORKSPACE_TIMEOUT_MS = 7000;

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
  const rawText = await response.text();
  const trimmedText = rawText.replace(/^\uFEFF/, "").trim();
  let payload: unknown = null;

  if (trimmedText) {
    try {
      payload = JSON.parse(trimmedText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }

  if (payload === null) {
    throw new Error("La réponse du serveur est incomplète ou illisible.");
  }

  return payload as T;
}

type JsonRequestOptions = {
  timeoutMs?: number;
  timeoutLabel?: string;
};

async function requestJson<T>(input: string, init: RequestInit, options: JsonRequestOptions = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const controller =
    options.timeoutMs && typeof AbortController !== "undefined"
      ? new AbortController()
      : null;
  const timeoutId =
    controller && options.timeoutMs
      ? globalThis.setTimeout(() => {
          controller.abort();
        }, options.timeoutMs)
      : null;

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller?.signal,
    });

    const rawText = await response.text();
    const trimmedText = rawText.replace(/^\uFEFF/, "").trim();
    let payload: unknown = null;

    if (trimmedText) {
      payload = JSON.parse(trimmedText);
    }

    if (!response.ok) {
      const detail =
        payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
      throw createHttpApiError(response.status, detail);
    }

    if (payload === null) {
      throw new Error("La réponse du serveur est incomplète ou illisible.");
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw createTimeoutApiError(options.timeoutLabel ?? "La requête API", options.timeoutMs ?? REGULATORY_WORKSPACE_TIMEOUT_MS);
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw createTimeoutApiError(options.timeoutLabel ?? "La requête API", options.timeoutMs ?? REGULATORY_WORKSPACE_TIMEOUT_MS);
    }

    if (error instanceof ApiClientError) {
      throw error;
    }

    throw createNetworkApiError(getApiBaseUrl());
  } finally {
    if (timeoutId !== null) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}

function parseFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) {
    return fallback;
  }
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1]);
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return plainMatch ? plainMatch[1] : fallback;
}

export async function fetchOrganizationProfile(
  accessToken: string,
  organizationId: string
): Promise<OrganizationRecord> {
  return requestJson<OrganizationRecord>(`${getApiBaseUrl()}/organizations/${organizationId}/profile`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "du profil organisation",
  });
}

export async function fetchCockpitSummary(
  accessToken: string,
  organizationId: string
): Promise<CockpitSummaryRecord> {
  return requestJson<CockpitSummaryRecord>(`${getApiBaseUrl()}/organizations/${organizationId}/cockpit-summary`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "du cockpit",
  });
}

export async function updateOrganizationProfile(
  accessToken: string,
  organizationId: string,
  payload: OrganizationProfileUpdateRequest
): Promise<OrganizationRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/profile`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<OrganizationRecord>(response);
}

export async function listOrganizationSites(
  accessToken: string,
  organizationId: string
): Promise<OrganizationSiteRecord[]> {
  return requestJson<OrganizationSiteRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/sites`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des sites",
  });
}

export async function fetchOrganizationRegulatoryProfile(
  accessToken: string,
  organizationId: string
): Promise<OrganizationRegulatoryProfileRecord> {
  return requestJson<OrganizationRegulatoryProfileRecord>(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-profile`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "du profil réglementaire",
  });
}

export async function listBuildingSafetyItems(
  accessToken: string,
  organizationId: string,
  siteId?: string | null
): Promise<BuildingSafetyItemRecord[]> {
  const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
  return requestJson<BuildingSafetyItemRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-items${suffix}`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des éléments sécurité bâtiment",
  });
}

export async function listBuildingSafetyAlerts(
  accessToken: string,
  organizationId: string,
  siteId?: string | null
): Promise<BuildingSafetyAlertRecord[]> {
  const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
  return requestJson<BuildingSafetyAlertRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-alerts${suffix}`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: REGULATORY_WORKSPACE_TIMEOUT_MS,
    timeoutLabel: "des alertes sécurité bâtiment",
  });
}

export async function listWorksites(
  accessToken: string,
  organizationId: string
): Promise<WorksiteApiSummary[]> {
  return requestJson<WorksiteApiSummary[]>(`${getApiBaseUrl()}/organizations/${organizationId}/worksites`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des chantiers",
  });
}

export async function listWorksiteAssignees(
  accessToken: string,
  organizationId: string
): Promise<WorksiteAssigneeRecord[]> {
  return requestJson<WorksiteAssigneeRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-assignees`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des affectations chantier",
  });
}

export async function listWorksiteDocuments(
  accessToken: string,
  organizationId: string
): Promise<WorksiteDocumentRecord[]> {
  return requestJson<WorksiteDocumentRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des documents chantier",
  });
}

export async function downloadGeneratedWorksiteDocument(
  accessToken: string,
  organizationId: string,
  documentId: string
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/download`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }
  return {
    blob: await response.blob(),
    fileName: parseFilename(response.headers.get("Content-Disposition"), "document-chantier.pdf")
  };
}

export async function listWorksiteSignatures(
  accessToken: string,
  organizationId: string
): Promise<WorksiteSignatureRecord[]> {
  return requestJson<WorksiteSignatureRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-signatures`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des signatures chantier",
  });
}

export async function listWorksiteProofs(
  accessToken: string,
  organizationId: string
): Promise<WorksiteProofRecord[]> {
  return requestJson<WorksiteProofRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-proofs`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des preuves chantier",
  });
}

export async function updateWorksiteDocumentStatus(
  accessToken: string,
  organizationId: string,
  documentId: string,
  payload: WorksiteDocumentStatusUpdateRequest
): Promise<WorksiteDocumentRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/status`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<WorksiteDocumentRecord>(response);
}

export async function updateWorksiteDocumentSignature(
  accessToken: string,
  organizationId: string,
  documentId: string,
  payload: WorksiteDocumentSignatureUpdateRequest
): Promise<WorksiteDocumentRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/signature`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<WorksiteDocumentRecord>(response);
}

export async function updateWorksiteDocumentProofs(
  accessToken: string,
  organizationId: string,
  documentId: string,
  payload: WorksiteDocumentProofUpdateRequest
): Promise<WorksiteDocumentRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/proofs`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<WorksiteDocumentRecord>(response);
}

export async function updateWorksiteCoordination(
  accessToken: string,
  organizationId: string,
  worksiteId: string,
  payload: WorksiteCoordinationUpdateRequest
): Promise<WorksiteApiSummary> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksites/${worksiteId}/coordination`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<WorksiteApiSummary>(response);
}

export async function updateWorksiteDocumentCoordination(
  accessToken: string,
  organizationId: string,
  documentId: string,
  payload: WorksiteCoordinationUpdateRequest
): Promise<WorksiteDocumentRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/coordination`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<WorksiteDocumentRecord>(response);
}

export async function downloadWorksiteSummaryPdf(
  accessToken: string,
  organizationId: string,
  worksiteId: string
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksites/${worksiteId}/summary.pdf`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }
  return {
    blob: await response.blob(),
    fileName: parseFilename(response.headers.get("Content-Disposition"), "fiche-chantier.pdf")
  };
}

export async function downloadWorksitePreventionPlanPdf(
  accessToken: string,
  organizationId: string,
  worksiteId: string,
  payload?: WorksitePreventionPlanExportRequest
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(
    `${getApiBaseUrl()}/organizations/${organizationId}/worksites/${worksiteId}/prevention-plan.pdf`,
    {
      method: payload ? "POST" : "GET",
      headers: payload
        ? {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
          }
        : buildHeaders(accessToken, organizationId),
      body: payload ? JSON.stringify(payload) : undefined
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }
  return {
    blob: await response.blob(),
    fileName: parseFilename(response.headers.get("Content-Disposition"), "plan-prevention.pdf")
  };
}

export async function createOrganizationSite(
  accessToken: string,
  organizationId: string,
  payload: OrganizationSiteCreateRequest
): Promise<OrganizationSiteRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/sites`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<OrganizationSiteRecord>(response);
}

export async function listBillingCustomers(
  accessToken: string,
  organizationId: string
): Promise<BillingCustomerRecord[]> {
  return requestJson<BillingCustomerRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/customers`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des clients",
  });
}

export async function listAuditLogs(
  accessToken: string,
  organizationId: string,
  options?: {
    limit?: number;
    targetId?: string | null;
    targetTypes?: string[];
  }
): Promise<AuditLogRecord[]> {
  const params = new URLSearchParams();
  if (options?.limit) {
    params.set("limit", String(options.limit));
  }
  if (options?.targetId) {
    params.set("target_id", options.targetId);
  }
  for (const targetType of options?.targetTypes ?? []) {
    params.append("target_type", targetType);
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/audit-logs${suffix}`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  return parseJsonResponse<AuditLogRecord[]>(response);
}

export async function createBillingCustomer(
  accessToken: string,
  organizationId: string,
  payload: BillingCustomerCreateRequest
): Promise<BillingCustomerRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/customers`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<BillingCustomerRecord>(response);
}

export async function duplicateQuoteToInvoice(
  accessToken: string,
  organizationId: string,
  quoteId: string
): Promise<InvoiceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/duplicate-to-invoice`, {
    method: "POST",
    headers: buildHeaders(accessToken, organizationId)
  });
  return parseJsonResponse<InvoiceRecord>(response);
}

export async function updateBillingCustomer(
  accessToken: string,
  organizationId: string,
  customerId: string,
  payload: BillingCustomerUpdateRequest
): Promise<BillingCustomerRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/customers/${customerId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<BillingCustomerRecord>(response);
}

export async function updateOrganizationSite(
  accessToken: string,
  organizationId: string,
  siteId: string,
  payload: OrganizationSiteUpdateRequest
): Promise<OrganizationSiteRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/sites/${siteId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<OrganizationSiteRecord>(response);
}

export async function createBuildingSafetyItem(
  accessToken: string,
  organizationId: string,
  payload: BuildingSafetyItemCreateRequest
): Promise<BuildingSafetyItemRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-items`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<BuildingSafetyItemRecord>(response);
}

export async function updateBuildingSafetyItem(
  accessToken: string,
  organizationId: string,
  itemId: string,
  payload: BuildingSafetyItemUpdateRequest
): Promise<BuildingSafetyItemRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-items/${itemId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<BuildingSafetyItemRecord>(response);
}

export async function listQuotes(
  accessToken: string,
  organizationId: string
): Promise<QuoteRecord[]> {
  return requestJson<QuoteRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/quotes`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des devis",
  });
}

export async function createQuote(
  accessToken: string,
  organizationId: string,
  payload: QuoteCreateRequest
): Promise<QuoteRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<QuoteRecord>(response);
}

export async function updateQuote(
  accessToken: string,
  organizationId: string,
  quoteId: string,
  payload: QuoteUpdateRequest
): Promise<QuoteRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<QuoteRecord>(response);
}

export async function updateQuoteStatus(
  accessToken: string,
  organizationId: string,
  quoteId: string,
  payload: QuoteStatusUpdateRequest
): Promise<QuoteRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/status`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<QuoteRecord>(response);
}

export async function updateQuoteFollowUpStatus(
  accessToken: string,
  organizationId: string,
  quoteId: string,
  payload: QuoteFollowUpUpdateRequest
): Promise<QuoteRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/follow-up`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<QuoteRecord>(response);
}

export async function updateQuoteWorksiteLink(
  accessToken: string,
  organizationId: string,
  quoteId: string,
  payload: QuoteWorksiteLinkUpdateRequest
): Promise<QuoteRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/worksite`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<QuoteRecord>(response);
}

export async function downloadQuotePdf(
  accessToken: string,
  organizationId: string,
  quoteId: string
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/pdf`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }
  return {
    blob: await response.blob(),
    fileName: parseFilename(response.headers.get("Content-Disposition"), "devis.pdf")
  };
}

export async function listInvoices(
  accessToken: string,
  organizationId: string
): Promise<InvoiceRecord[]> {
  return requestJson<InvoiceRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/invoices`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
    timeoutLabel: "des factures",
  });
}

export async function createInvoice(
  accessToken: string,
  organizationId: string,
  payload: InvoiceCreateRequest
): Promise<InvoiceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<InvoiceRecord>(response);
}

export async function updateInvoice(
  accessToken: string,
  organizationId: string,
  invoiceId: string,
  payload: InvoiceUpdateRequest
): Promise<InvoiceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<InvoiceRecord>(response);
}

export async function updateInvoiceStatus(
  accessToken: string,
  organizationId: string,
  invoiceId: string,
  payload: InvoiceStatusUpdateRequest
): Promise<InvoiceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/status`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<InvoiceRecord>(response);
}

export async function updateInvoiceFollowUpStatus(
  accessToken: string,
  organizationId: string,
  invoiceId: string,
  payload: InvoiceFollowUpUpdateRequest
): Promise<InvoiceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/follow-up`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<InvoiceRecord>(response);
}

export async function recordInvoicePayment(
  accessToken: string,
  organizationId: string,
  invoiceId: string,
  payload: InvoicePaymentCreateRequest
): Promise<InvoiceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/payment`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<InvoiceRecord>(response);
}

export async function updateInvoiceWorksiteLink(
  accessToken: string,
  organizationId: string,
  invoiceId: string,
  payload: InvoiceWorksiteLinkUpdateRequest
): Promise<InvoiceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/worksite`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<InvoiceRecord>(response);
}

export async function downloadInvoicePdf(
  accessToken: string,
  organizationId: string,
  invoiceId: string
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/pdf`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }
  return {
    blob: await response.blob(),
    fileName: parseFilename(response.headers.get("Content-Disposition"), "facture.pdf")
  };
}

export async function listDuerpEntries(
  accessToken: string,
  organizationId: string,
  siteId?: string | null
): Promise<DuerpEntryRecord[]> {
  const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
  return requestJson<DuerpEntryRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/duerp-entries${suffix}`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: REGULATORY_WORKSPACE_TIMEOUT_MS,
    timeoutLabel: "des entrées DUERP",
  });
}

export async function createDuerpEntry(
  accessToken: string,
  organizationId: string,
  payload: DuerpEntryCreateRequest
): Promise<DuerpEntryRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/duerp-entries`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<DuerpEntryRecord>(response);
}

export async function updateDuerpEntry(
  accessToken: string,
  organizationId: string,
  entryId: string,
  payload: DuerpEntryUpdateRequest
): Promise<DuerpEntryRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/duerp-entries/${entryId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<DuerpEntryRecord>(response);
}

export async function listRegulatoryEvidences(
  accessToken: string,
  organizationId: string,
  siteId?: string | null
): Promise<RegulatoryEvidenceRecord[]> {
  const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
  return requestJson<RegulatoryEvidenceRecord[]>(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-evidences${suffix}`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  }, {
    timeoutMs: REGULATORY_WORKSPACE_TIMEOUT_MS,
    timeoutLabel: "des pièces réglementaires",
  });
}

export async function createRegulatoryEvidence(
  accessToken: string,
  organizationId: string,
  payload: RegulatoryEvidenceCreateRequest
): Promise<RegulatoryEvidenceRecord> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-evidences`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, organizationId),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse<RegulatoryEvidenceRecord>(response);
}

export async function downloadRegulatoryExportPdf(
  accessToken: string,
  organizationId: string
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-export.pdf`, {
    method: "GET",
    headers: buildHeaders(accessToken, organizationId)
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
    throw createHttpApiError(response.status, detail);
  }
  return {
    blob: await response.blob(),
    fileName: parseFilename(
      response.headers.get("Content-Disposition"),
      `conformeo-reglementaire-${organizationId}.pdf`
    )
  };
}
