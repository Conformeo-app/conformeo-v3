import { generatedEnv } from "../environments/generated-env";
import { ApiClientError, createHttpApiError, createNetworkApiError, createTimeoutApiError } from "./api-error";
const WORKSPACE_REQUEST_TIMEOUT_MS = 10000;
const REGULATORY_WORKSPACE_TIMEOUT_MS = 7000;
function getApiBaseUrl() {
    return generatedEnv.apiBaseUrl.replace(/\/$/, "");
}
function buildHeaders(accessToken, organizationId) {
    return {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Conformeo-Organization-Id": organizationId
    };
}
async function parseJsonResponse(response) {
    const rawText = await response.text();
    const trimmedText = rawText.replace(/^\uFEFF/, "").trim();
    let payload = null;
    if (trimmedText) {
        try {
            payload = JSON.parse(trimmedText);
        }
        catch {
            payload = null;
        }
    }
    if (!response.ok) {
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
        throw createHttpApiError(response.status, detail);
    }
    if (payload === null) {
        throw new Error("La réponse du serveur est incomplète ou illisible.");
    }
    return payload;
}
async function requestJson(input, init, options = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const controller = options.timeoutMs && typeof AbortController !== "undefined"
        ? new AbortController()
        : null;
    const timeoutId = controller && options.timeoutMs
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
        let payload = null;
        if (trimmedText) {
            payload = JSON.parse(trimmedText);
        }
        if (!response.ok) {
            const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
            throw createHttpApiError(response.status, detail);
        }
        if (payload === null) {
            throw new Error("La réponse du serveur est incomplète ou illisible.");
        }
        return payload;
    }
    catch (error) {
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
    }
    finally {
        if (timeoutId !== null) {
            globalThis.clearTimeout(timeoutId);
        }
    }
}
function parseFilename(contentDisposition, fallback) {
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
export async function fetchOrganizationProfile(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/profile`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "du profil organisation",
    });
}
export async function fetchCockpitSummary(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/cockpit-summary`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "du cockpit",
    });
}
export async function updateOrganizationProfile(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/profile`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function listOrganizationSites(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/sites`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des sites",
    });
}
export async function fetchOrganizationRegulatoryProfile(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-profile`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "du profil réglementaire",
    });
}
export async function listBuildingSafetyItems(accessToken, organizationId, siteId) {
    const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-items${suffix}`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des éléments sécurité bâtiment",
    });
}
export async function listBuildingSafetyAlerts(accessToken, organizationId, siteId) {
    const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-alerts${suffix}`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: REGULATORY_WORKSPACE_TIMEOUT_MS,
        timeoutLabel: "des alertes sécurité bâtiment",
    });
}
export async function listWorksites(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/worksites`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des chantiers",
    });
}
export async function listWorksiteAssignees(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-assignees`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des affectations chantier",
    });
}
export async function listWorksiteDocuments(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des documents chantier",
    });
}
export async function downloadGeneratedWorksiteDocument(accessToken, organizationId, documentId) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/download`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
        throw createHttpApiError(response.status, detail);
    }
    return {
        blob: await response.blob(),
        fileName: parseFilename(response.headers.get("Content-Disposition"), "document-chantier.pdf")
    };
}
export async function listWorksiteSignatures(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-signatures`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des signatures chantier",
    });
}
export async function listWorksiteProofs(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-proofs`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des preuves chantier",
    });
}
export async function updateWorksiteDocumentStatus(accessToken, organizationId, documentId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/status`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateWorksiteDocumentSignature(accessToken, organizationId, documentId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/signature`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateWorksiteDocumentProofs(accessToken, organizationId, documentId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/proofs`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateWorksiteCoordination(accessToken, organizationId, worksiteId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksites/${worksiteId}/coordination`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateWorksiteDocumentCoordination(accessToken, organizationId, documentId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksite-documents/${documentId}/coordination`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function downloadWorksiteSummaryPdf(accessToken, organizationId, worksiteId) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksites/${worksiteId}/summary.pdf`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
        throw createHttpApiError(response.status, detail);
    }
    return {
        blob: await response.blob(),
        fileName: parseFilename(response.headers.get("Content-Disposition"), "fiche-chantier.pdf")
    };
}
export async function downloadWorksitePreventionPlanPdf(accessToken, organizationId, worksiteId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/worksites/${worksiteId}/prevention-plan.pdf`, {
        method: payload ? "POST" : "GET",
        headers: payload
            ? {
                ...buildHeaders(accessToken, organizationId),
                "Content-Type": "application/json"
            }
            : buildHeaders(accessToken, organizationId),
        body: payload ? JSON.stringify(payload) : undefined
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
        throw createHttpApiError(response.status, detail);
    }
    return {
        blob: await response.blob(),
        fileName: parseFilename(response.headers.get("Content-Disposition"), "plan-prevention.pdf")
    };
}
export async function createOrganizationSite(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/sites`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function enrichOrganizationSiteLocation(accessToken, organizationId, siteId) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/sites/${siteId}/enrich-location`, {
        method: "POST",
        headers: buildHeaders(accessToken, organizationId)
    });
    return parseJsonResponse(response);
}
export async function listBillingCustomers(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/customers`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des clients",
    });
}
export async function listAuditLogs(accessToken, organizationId, options) {
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
    return parseJsonResponse(response);
}
export async function createBillingCustomer(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/customers`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function duplicateQuoteToInvoice(accessToken, organizationId, quoteId) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/duplicate-to-invoice`, {
        method: "POST",
        headers: buildHeaders(accessToken, organizationId)
    });
    return parseJsonResponse(response);
}
export async function updateBillingCustomer(accessToken, organizationId, customerId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/customers/${customerId}`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateOrganizationSite(accessToken, organizationId, siteId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/sites/${siteId}`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function createBuildingSafetyItem(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-items`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateBuildingSafetyItem(accessToken, organizationId, itemId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/building-safety-items/${itemId}`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function listQuotes(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/quotes`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des devis",
    });
}
export async function createQuote(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateQuote(accessToken, organizationId, quoteId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateQuoteStatus(accessToken, organizationId, quoteId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/status`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateQuoteFollowUpStatus(accessToken, organizationId, quoteId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/follow-up`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateQuoteWorksiteLink(accessToken, organizationId, quoteId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/worksite`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function downloadQuotePdf(accessToken, organizationId, quoteId) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/quotes/${quoteId}/pdf`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
        throw createHttpApiError(response.status, detail);
    }
    return {
        blob: await response.blob(),
        fileName: parseFilename(response.headers.get("Content-Disposition"), "devis.pdf")
    };
}
export async function listInvoices(accessToken, organizationId) {
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/invoices`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: WORKSPACE_REQUEST_TIMEOUT_MS,
        timeoutLabel: "des factures",
    });
}
export async function createInvoice(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateInvoice(accessToken, organizationId, invoiceId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateInvoiceStatus(accessToken, organizationId, invoiceId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateInvoiceFollowUpStatus(accessToken, organizationId, invoiceId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/follow-up`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function recordInvoicePayment(accessToken, organizationId, invoiceId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/payment`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateInvoiceWorksiteLink(accessToken, organizationId, invoiceId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/worksite`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function downloadInvoicePdf(accessToken, organizationId, invoiceId) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/invoices/${invoiceId}/pdf`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
        throw createHttpApiError(response.status, detail);
    }
    return {
        blob: await response.blob(),
        fileName: parseFilename(response.headers.get("Content-Disposition"), "facture.pdf")
    };
}
export async function listDuerpEntries(accessToken, organizationId, siteId) {
    const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/duerp-entries${suffix}`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: REGULATORY_WORKSPACE_TIMEOUT_MS,
        timeoutLabel: "des entrées DUERP",
    });
}
export async function createDuerpEntry(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/duerp-entries`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function updateDuerpEntry(accessToken, organizationId, entryId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/duerp-entries/${entryId}`, {
        method: "PATCH",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function listRegulatoryEvidences(accessToken, organizationId, siteId) {
    const suffix = siteId ? `?site_id=${encodeURIComponent(siteId)}` : "";
    return requestJson(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-evidences${suffix}`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    }, {
        timeoutMs: REGULATORY_WORKSPACE_TIMEOUT_MS,
        timeoutLabel: "des pièces réglementaires",
    });
}
export async function createRegulatoryEvidence(accessToken, organizationId, payload) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-evidences`, {
        method: "POST",
        headers: {
            ...buildHeaders(accessToken, organizationId),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return parseJsonResponse(response);
}
export async function downloadRegulatoryExportPdf(accessToken, organizationId) {
    const response = await fetch(`${getApiBaseUrl()}/organizations/${organizationId}/regulatory-export.pdf`, {
        method: "GET",
        headers: buildHeaders(accessToken, organizationId)
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : "Erreur API.";
        throw createHttpApiError(response.status, detail);
    }
    return {
        blob: await response.blob(),
        fileName: parseFilename(response.headers.get("Content-Disposition"), `conformeo-reglementaire-${organizationId}.pdf`)
    };
}
