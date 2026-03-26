import type { AuditLogRecord, BillingCustomerCreateRequest, BillingCustomerRecord, BillingCustomerUpdateRequest, CockpitSummaryRecord, BuildingSafetyAlertRecord, BuildingSafetyItemCreateRequest, BuildingSafetyItemRecord, BuildingSafetyItemUpdateRequest, DuerpEntryCreateRequest, DuerpEntryRecord, DuerpEntryUpdateRequest, InvoiceCreateRequest, InvoiceFollowUpUpdateRequest, InvoicePaymentCreateRequest, InvoiceRecord, InvoiceStatusUpdateRequest, InvoiceUpdateRequest, OrganizationRegulatoryProfileRecord, OrganizationProfileUpdateRequest, OrganizationRecord, RegulatoryEvidenceCreateRequest, RegulatoryEvidenceRecord, OrganizationSiteCreateRequest, OrganizationSiteEnrichmentRecord, OrganizationSiteRecord, OrganizationSiteUpdateRequest, QuoteCreateRequest, QuoteFollowUpUpdateRequest, QuoteRecord, QuoteStatusUpdateRequest, QuoteUpdateRequest, QuoteWorksiteLinkUpdateRequest, InvoiceWorksiteLinkUpdateRequest, WorksiteApiSummary, WorksiteAssigneeRecord, WorksiteCoordinationUpdateRequest, WorksiteDocumentProofUpdateRequest, WorksiteDocumentStatusUpdateRequest, WorksiteDocumentSignatureUpdateRequest, WorksiteDocumentRecord, WorksiteProofRecord, WorksitePreventionPlanExportRequest, WorksiteSignatureRecord } from "@conformeo/contracts";
export declare function fetchOrganizationProfile(accessToken: string, organizationId: string): Promise<OrganizationRecord>;
export declare function fetchCockpitSummary(accessToken: string, organizationId: string): Promise<CockpitSummaryRecord>;
export declare function updateOrganizationProfile(accessToken: string, organizationId: string, payload: OrganizationProfileUpdateRequest): Promise<OrganizationRecord>;
export declare function listOrganizationSites(accessToken: string, organizationId: string): Promise<OrganizationSiteRecord[]>;
export declare function fetchOrganizationRegulatoryProfile(accessToken: string, organizationId: string): Promise<OrganizationRegulatoryProfileRecord>;
export declare function listBuildingSafetyItems(accessToken: string, organizationId: string, siteId?: string | null): Promise<BuildingSafetyItemRecord[]>;
export declare function listBuildingSafetyAlerts(accessToken: string, organizationId: string, siteId?: string | null): Promise<BuildingSafetyAlertRecord[]>;
export declare function listWorksites(accessToken: string, organizationId: string): Promise<WorksiteApiSummary[]>;
export declare function listWorksiteAssignees(accessToken: string, organizationId: string): Promise<WorksiteAssigneeRecord[]>;
export declare function listWorksiteDocuments(accessToken: string, organizationId: string): Promise<WorksiteDocumentRecord[]>;
export declare function downloadGeneratedWorksiteDocument(accessToken: string, organizationId: string, documentId: string): Promise<{
    blob: Blob;
    fileName: string;
}>;
export declare function listWorksiteSignatures(accessToken: string, organizationId: string): Promise<WorksiteSignatureRecord[]>;
export declare function listWorksiteProofs(accessToken: string, organizationId: string): Promise<WorksiteProofRecord[]>;
export declare function updateWorksiteDocumentStatus(accessToken: string, organizationId: string, documentId: string, payload: WorksiteDocumentStatusUpdateRequest): Promise<WorksiteDocumentRecord>;
export declare function updateWorksiteDocumentSignature(accessToken: string, organizationId: string, documentId: string, payload: WorksiteDocumentSignatureUpdateRequest): Promise<WorksiteDocumentRecord>;
export declare function updateWorksiteDocumentProofs(accessToken: string, organizationId: string, documentId: string, payload: WorksiteDocumentProofUpdateRequest): Promise<WorksiteDocumentRecord>;
export declare function updateWorksiteCoordination(accessToken: string, organizationId: string, worksiteId: string, payload: WorksiteCoordinationUpdateRequest): Promise<WorksiteApiSummary>;
export declare function updateWorksiteDocumentCoordination(accessToken: string, organizationId: string, documentId: string, payload: WorksiteCoordinationUpdateRequest): Promise<WorksiteDocumentRecord>;
export declare function downloadWorksiteSummaryPdf(accessToken: string, organizationId: string, worksiteId: string): Promise<{
    blob: Blob;
    fileName: string;
}>;
export declare function downloadWorksitePreventionPlanPdf(accessToken: string, organizationId: string, worksiteId: string, payload?: WorksitePreventionPlanExportRequest): Promise<{
    blob: Blob;
    fileName: string;
}>;
export declare function createOrganizationSite(accessToken: string, organizationId: string, payload: OrganizationSiteCreateRequest): Promise<OrganizationSiteRecord>;
export declare function enrichOrganizationSiteLocation(accessToken: string, organizationId: string, siteId: string): Promise<OrganizationSiteEnrichmentRecord>;
export declare function listBillingCustomers(accessToken: string, organizationId: string): Promise<BillingCustomerRecord[]>;
export declare function listAuditLogs(accessToken: string, organizationId: string, options?: {
    limit?: number;
    targetId?: string | null;
    targetTypes?: string[];
}): Promise<AuditLogRecord[]>;
export declare function createBillingCustomer(accessToken: string, organizationId: string, payload: BillingCustomerCreateRequest): Promise<BillingCustomerRecord>;
export declare function duplicateQuoteToInvoice(accessToken: string, organizationId: string, quoteId: string): Promise<InvoiceRecord>;
export declare function updateBillingCustomer(accessToken: string, organizationId: string, customerId: string, payload: BillingCustomerUpdateRequest): Promise<BillingCustomerRecord>;
export declare function updateOrganizationSite(accessToken: string, organizationId: string, siteId: string, payload: OrganizationSiteUpdateRequest): Promise<OrganizationSiteRecord>;
export declare function createBuildingSafetyItem(accessToken: string, organizationId: string, payload: BuildingSafetyItemCreateRequest): Promise<BuildingSafetyItemRecord>;
export declare function updateBuildingSafetyItem(accessToken: string, organizationId: string, itemId: string, payload: BuildingSafetyItemUpdateRequest): Promise<BuildingSafetyItemRecord>;
export declare function listQuotes(accessToken: string, organizationId: string): Promise<QuoteRecord[]>;
export declare function createQuote(accessToken: string, organizationId: string, payload: QuoteCreateRequest): Promise<QuoteRecord>;
export declare function updateQuote(accessToken: string, organizationId: string, quoteId: string, payload: QuoteUpdateRequest): Promise<QuoteRecord>;
export declare function updateQuoteStatus(accessToken: string, organizationId: string, quoteId: string, payload: QuoteStatusUpdateRequest): Promise<QuoteRecord>;
export declare function updateQuoteFollowUpStatus(accessToken: string, organizationId: string, quoteId: string, payload: QuoteFollowUpUpdateRequest): Promise<QuoteRecord>;
export declare function updateQuoteWorksiteLink(accessToken: string, organizationId: string, quoteId: string, payload: QuoteWorksiteLinkUpdateRequest): Promise<QuoteRecord>;
export declare function downloadQuotePdf(accessToken: string, organizationId: string, quoteId: string): Promise<{
    blob: Blob;
    fileName: string;
}>;
export declare function listInvoices(accessToken: string, organizationId: string): Promise<InvoiceRecord[]>;
export declare function createInvoice(accessToken: string, organizationId: string, payload: InvoiceCreateRequest): Promise<InvoiceRecord>;
export declare function updateInvoice(accessToken: string, organizationId: string, invoiceId: string, payload: InvoiceUpdateRequest): Promise<InvoiceRecord>;
export declare function updateInvoiceStatus(accessToken: string, organizationId: string, invoiceId: string, payload: InvoiceStatusUpdateRequest): Promise<InvoiceRecord>;
export declare function updateInvoiceFollowUpStatus(accessToken: string, organizationId: string, invoiceId: string, payload: InvoiceFollowUpUpdateRequest): Promise<InvoiceRecord>;
export declare function recordInvoicePayment(accessToken: string, organizationId: string, invoiceId: string, payload: InvoicePaymentCreateRequest): Promise<InvoiceRecord>;
export declare function updateInvoiceWorksiteLink(accessToken: string, organizationId: string, invoiceId: string, payload: InvoiceWorksiteLinkUpdateRequest): Promise<InvoiceRecord>;
export declare function downloadInvoicePdf(accessToken: string, organizationId: string, invoiceId: string): Promise<{
    blob: Blob;
    fileName: string;
}>;
export declare function listDuerpEntries(accessToken: string, organizationId: string, siteId?: string | null): Promise<DuerpEntryRecord[]>;
export declare function createDuerpEntry(accessToken: string, organizationId: string, payload: DuerpEntryCreateRequest): Promise<DuerpEntryRecord>;
export declare function updateDuerpEntry(accessToken: string, organizationId: string, entryId: string, payload: DuerpEntryUpdateRequest): Promise<DuerpEntryRecord>;
export declare function listRegulatoryEvidences(accessToken: string, organizationId: string, siteId?: string | null): Promise<RegulatoryEvidenceRecord[]>;
export declare function createRegulatoryEvidence(accessToken: string, organizationId: string, payload: RegulatoryEvidenceCreateRequest): Promise<RegulatoryEvidenceRecord>;
export declare function downloadRegulatoryExportPdf(accessToken: string, organizationId: string): Promise<{
    blob: Blob;
    fileName: string;
}>;
//# sourceMappingURL=organization-client.d.ts.map