import { Injectable, inject } from "@angular/core";
import type {
  ApplicableRegulatoryObligationRecord,
  BillingCustomerRecord,
  MembershipAccess,
  OrganizationSiteRecord,
  QuoteRecord,
  InvoiceRecord,
  RegulatoryEvidenceRecord,
  WorksiteApiSummary,
  WorksiteDocumentRecord,
  WorksiteEquipment,
  WorksiteProofRecord,
  WorksiteSignatureRecord,
} from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";

import { canReadModule } from "./desktop-access.utils";
import { DesktopSessionStateService } from "./desktop-session-state.service";
import {
  fetchOrganizationRegulatoryProfile,
  listBillingCustomers,
  listInvoices,
  listOrganizationSites,
  listQuotes,
  listRegulatoryEvidences,
  listWorksiteDocuments,
  listWorksiteEquipments,
  listWorksiteProofs,
  listWorksiteSignatures,
  listWorksites,
} from "./organization-client";

type SearchSources = {
  worksites: WorksiteApiSummary[];
  customers: BillingCustomerRecord[];
  quotes: QuoteRecord[];
  invoices: InvoiceRecord[];
  documents: WorksiteDocumentRecord[];
  proofs: WorksiteProofRecord[];
  signatures: WorksiteSignatureRecord[];
  equipment: WorksiteEquipment[];
  sites: OrganizationSiteRecord[];
  obligations: ApplicableRegulatoryObligationRecord[];
  evidences: RegulatoryEvidenceRecord[];
};

export type DesktopGlobalSearchResult = {
  id: string;
  kind: string;
  kindLabel: string;
  title: string;
  detail: string;
  supportLabel: string | null;
  route: string;
  tone: CfmTone;
};

export type DesktopGlobalSearchSection = {
  id: string;
  label: string;
  items: DesktopGlobalSearchResult[];
};

@Injectable({ providedIn: "root" })
export class DesktopGlobalSearchService {
  private readonly sessionState = inject(DesktopSessionStateService);
  private readonly cache = new Map<string, Promise<SearchSources>>();

  async search(query: string, membership: MembershipAccess | null): Promise<DesktopGlobalSearchSection[]> {
    const normalizedQuery = this.normalize(query);
    if (normalizedQuery.length < 2) {
      return [];
    }

    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId) {
      return [];
    }

    const sources = await this.getSources(accessToken, organizationId, membership);
    return [
      this.buildWorksiteSection(sources.worksites, normalizedQuery),
      this.buildBillingSection(sources.customers, normalizedQuery),
      this.buildDocumentSection(
        sources.documents,
        sources.proofs,
        sources.signatures,
        sources.quotes,
        sources.invoices,
        normalizedQuery,
      ),
      this.buildEquipmentSection(sources.equipment, normalizedQuery),
      this.buildRegulationSection(sources.sites, sources.obligations, sources.evidences, normalizedQuery),
    ].filter((section): section is DesktopGlobalSearchSection => section !== null);
  }

  clearOrganizationCache(organizationId: string | null): void {
    if (!organizationId) {
      this.cache.clear();
      return;
    }

    Array.from(this.cache.keys()).forEach((key) => {
      if (key.startsWith(`${organizationId}:`)) {
        this.cache.delete(key);
      }
    });
  }

  private async getSources(
    accessToken: string,
    organizationId: string,
    membership: MembershipAccess | null,
  ): Promise<SearchSources> {
    const cacheKey = `${organizationId}:${[
      canReadModule(membership, "chantier"),
      canReadModule(membership, "facturation"),
      canReadModule(membership, "reglementation"),
    ].join(":")}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const request = this.loadSources(accessToken, organizationId, membership);
    this.cache.set(cacheKey, request);
    return request;
  }

  private async loadSources(
    accessToken: string,
    organizationId: string,
    membership: MembershipAccess | null,
  ): Promise<SearchSources> {
    const chantierEnabled = canReadModule(membership, "chantier");
    const facturationEnabled = canReadModule(membership, "facturation");
    const regulationEnabled = canReadModule(membership, "reglementation");

    const [
      worksites,
      customers,
      quotes,
      invoices,
      documents,
      proofs,
      signatures,
      equipment,
      sites,
      obligations,
      evidences,
    ] = await Promise.all([
      chantierEnabled ? this.safeLoad(() => listWorksites(accessToken, organizationId)) : Promise.resolve<WorksiteApiSummary[]>([]),
      facturationEnabled ? this.safeLoad(() => listBillingCustomers(accessToken, organizationId)) : Promise.resolve<BillingCustomerRecord[]>([]),
      facturationEnabled ? this.safeLoad(() => listQuotes(accessToken, organizationId)) : Promise.resolve<QuoteRecord[]>([]),
      facturationEnabled ? this.safeLoad(() => listInvoices(accessToken, organizationId)) : Promise.resolve<InvoiceRecord[]>([]),
      chantierEnabled ? this.safeLoad(() => listWorksiteDocuments(accessToken, organizationId)) : Promise.resolve<WorksiteDocumentRecord[]>([]),
      chantierEnabled ? this.safeLoad(() => listWorksiteProofs(accessToken, organizationId)) : Promise.resolve<WorksiteProofRecord[]>([]),
      chantierEnabled ? this.safeLoad(() => listWorksiteSignatures(accessToken, organizationId)) : Promise.resolve<WorksiteSignatureRecord[]>([]),
      chantierEnabled ? this.safeLoad(() => listWorksiteEquipments(accessToken, organizationId)) : Promise.resolve<WorksiteEquipment[]>([]),
      regulationEnabled ? this.safeLoad(() => listOrganizationSites(accessToken, organizationId)) : Promise.resolve<OrganizationSiteRecord[]>([]),
      regulationEnabled
        ? this.safeLoad(async () => (await fetchOrganizationRegulatoryProfile(accessToken, organizationId)).applicable_obligations)
        : Promise.resolve<ApplicableRegulatoryObligationRecord[]>([]),
      regulationEnabled ? this.safeLoad(() => listRegulatoryEvidences(accessToken, organizationId)) : Promise.resolve<RegulatoryEvidenceRecord[]>([]),
    ]);

    return {
      worksites,
      customers,
      quotes,
      invoices,
      documents,
      proofs,
      signatures,
      equipment,
      sites,
      obligations,
      evidences,
    };
  }

  private async safeLoad<T>(loader: () => Promise<T>): Promise<T> {
    try {
      return await loader();
    } catch {
      return [] as unknown as T;
    }
  }

  private buildWorksiteSection(
    worksites: WorksiteApiSummary[],
    query: string,
  ): DesktopGlobalSearchSection | null {
    const items = worksites
      .map((worksite) => ({
        score: this.scoreSearch(query, [worksite.name, worksite.client_name, worksite.site_name, worksite.address]),
        item: {
          id: `worksite-${worksite.id}`,
          kind: "worksite",
          kindLabel: "Chantier",
          title: worksite.name,
          detail: worksite.client_name || "Client à préciser",
          supportLabel: worksite.site_name || worksite.address || null,
          route: `/app/chantiers/${worksite.id}/apercu`,
          tone: this.getWorksiteTone(worksite.status),
        } satisfies DesktopGlobalSearchResult,
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 4)
      .map((entry) => entry.item);

    return items.length > 0 ? { id: "worksites", label: "Chantiers", items } : null;
  }

  private buildBillingSection(
    customers: BillingCustomerRecord[],
    query: string,
  ): DesktopGlobalSearchSection | null {
    const items = customers
      .map((customer) => ({
        score: this.scoreSearch(query, [customer.name, customer.email, customer.phone, customer.address]),
        item: {
          id: `customer-${customer.id}`,
          kind: "customer",
          kindLabel: "Client",
          title: customer.name,
          detail: customer.email || customer.phone || "Coordonnées à compléter",
          supportLabel: customer.address,
          route: "/app/facturation/clients",
          tone: "calm" as CfmTone,
        } satisfies DesktopGlobalSearchResult,
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)
      .map((entry) => entry.item);

    return items.length > 0 ? { id: "billing", label: "Facturation", items } : null;
  }

  private buildDocumentSection(
    documents: WorksiteDocumentRecord[],
    proofs: WorksiteProofRecord[],
    signatures: WorksiteSignatureRecord[],
    quotes: QuoteRecord[],
    invoices: InvoiceRecord[],
    query: string,
  ): DesktopGlobalSearchSection | null {
    const items = [
      ...documents.map((document) => ({
        score: this.scoreSearch(query, [document.document_type_label, document.file_name, document.worksite_name, document.notes]),
        item: {
          id: `document-${document.id}`,
          kind: "document",
          kindLabel: "Document",
          title: document.document_type_label,
          detail: document.worksite_name,
          supportLabel: document.file_name,
          route: `/app/documents?focus=${encodeURIComponent(document.id)}&kind=worksite_document`,
          tone: document.lifecycle_status === "finalized" ? "success" : "warning",
        } satisfies DesktopGlobalSearchResult,
      })),
      ...proofs.map((proof) => ({
        score: this.scoreSearch(query, [proof.label, proof.file_name, proof.worksite_name, proof.notes]),
        item: {
          id: `proof-${proof.id}`,
          kind: "proof",
          kindLabel: "Preuve",
          title: proof.label,
          detail: proof.worksite_name,
          supportLabel: proof.file_name,
          route: `/app/documents?focus=${encodeURIComponent(proof.id)}&kind=worksite_proof`,
          tone: proof.status === "available" ? "success" : proof.status === "failed" ? "danger" : "warning",
        } satisfies DesktopGlobalSearchResult,
      })),
      ...signatures.map((signature) => ({
        score: this.scoreSearch(query, [signature.label, signature.file_name, signature.worksite_name]),
        item: {
          id: `signature-${signature.id}`,
          kind: "signature",
          kindLabel: "Signature",
          title: signature.label,
          detail: signature.worksite_name,
          supportLabel: signature.file_name,
          route: `/app/documents?focus=${encodeURIComponent(signature.id)}&kind=worksite_signature`,
          tone: signature.status === "available" ? "success" : signature.status === "failed" ? "danger" : "warning",
        } satisfies DesktopGlobalSearchResult,
      })),
      ...quotes.map((quote) => ({
        score: this.scoreSearch(query, [quote.number, quote.customer_name, quote.title, quote.worksite_name]),
        item: {
          id: `quote-${quote.id}`,
          kind: "quote",
          kindLabel: "Devis",
          title: quote.number,
          detail: quote.customer_name,
          supportLabel: quote.title || quote.worksite_name || null,
          route: `/app/documents?focus=${encodeURIComponent(quote.id)}&kind=billing_quote`,
          tone: this.getQuoteTone(quote.status),
        } satisfies DesktopGlobalSearchResult,
      })),
      ...invoices.map((invoice) => ({
        score: this.scoreSearch(query, [invoice.number, invoice.customer_name, invoice.title, invoice.worksite_name]),
        item: {
          id: `invoice-${invoice.id}`,
          kind: "invoice",
          kindLabel: "Facture",
          title: invoice.number,
          detail: invoice.customer_name,
          supportLabel: invoice.title || invoice.worksite_name || null,
          route: `/app/documents?focus=${encodeURIComponent(invoice.id)}&kind=billing_invoice`,
          tone: this.getInvoiceTone(invoice.status),
        } satisfies DesktopGlobalSearchResult,
      })),
    ]
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)
      .map((entry) => entry.item);

    return items.length > 0 ? { id: "documents", label: "Documents", items } : null;
  }

  private buildEquipmentSection(
    equipment: WorksiteEquipment[],
    query: string,
  ): DesktopGlobalSearchSection | null {
    const items = equipment
      .map((item) => ({
        score: this.scoreSearch(query, [item.name, item.type, item.worksite_name]),
        item: {
          id: `equipment-${item.id}`,
          kind: "equipment",
          kindLabel: "Équipement",
          title: item.name,
          detail: item.type,
          supportLabel: item.worksite_name || "Parc non affecté",
          route: item.worksite_id ? `/app/chantiers/${item.worksite_id}/equipements` : "/app/chantiers/parc",
          tone: this.getEquipmentTone(item.status),
        } satisfies DesktopGlobalSearchResult,
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 4)
      .map((entry) => entry.item);

    return items.length > 0 ? { id: "equipment", label: "Parc équipement", items } : null;
  }

  private buildRegulationSection(
    sites: OrganizationSiteRecord[],
    obligations: ApplicableRegulatoryObligationRecord[],
    evidences: RegulatoryEvidenceRecord[],
    query: string,
  ): DesktopGlobalSearchSection | null {
    const items = [
      ...sites.map((site) => ({
        score: this.scoreSearch(query, [site.name, site.address, site.site_risk_summary]),
        item: {
          id: `site-${site.id}`,
          kind: "site",
          kindLabel: "Site",
          title: site.name,
          detail: site.address,
          supportLabel: site.site_risk_summary || null,
          route: "/app/reglementation/sites",
          tone: this.getSiteTone(site.location_enrichment_status ?? null),
        } satisfies DesktopGlobalSearchResult,
      })),
      ...obligations.map((obligation) => ({
        score: this.scoreSearch(query, [obligation.title, obligation.description, obligation.reason_summary]),
        item: {
          id: `obligation-${obligation.id}`,
          kind: "obligation",
          kindLabel: "Obligation",
          title: obligation.title,
          detail: obligation.reason_summary,
          supportLabel: obligation.description,
          route: "/app/reglementation/obligations",
          tone: this.getObligationTone(obligation.priority, obligation.status),
        } satisfies DesktopGlobalSearchResult,
      })),
      ...evidences.map((evidence) => ({
        score: this.scoreSearch(query, [evidence.file_name, evidence.document_type, evidence.link_label, evidence.notes]),
        item: {
          id: `evidence-${evidence.id}`,
          kind: "evidence",
          kindLabel: "Pièce",
          title: evidence.file_name,
          detail: evidence.link_label,
          supportLabel: evidence.notes || evidence.document_type,
          route: `/app/documents?focus=${encodeURIComponent(evidence.id)}&kind=regulatory_evidence`,
          tone: evidence.status === "available" ? "success" : evidence.status === "failed" ? "danger" : "warning",
        } satisfies DesktopGlobalSearchResult,
      })),
    ]
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)
      .map((entry) => entry.item);

    return items.length > 0 ? { id: "regulation", label: "Réglementation", items } : null;
  }

  private scoreSearch(query: string, fields: Array<string | null | undefined>): number {
    let score = 0;

    fields.forEach((field, index) => {
      const normalizedField = this.normalize(field);
      if (!normalizedField) {
        return;
      }

      if (normalizedField.startsWith(query)) {
        score = Math.max(score, 120 - index * 5);
        return;
      }

      if (normalizedField.includes(query)) {
        score = Math.max(score, 90 - index * 5);
      }
    });

    return score;
  }

  private getWorksiteTone(status: WorksiteApiSummary["status"]): CfmTone {
    switch (status) {
      case "blocked":
        return "danger";
      case "completed":
        return "success";
      case "in_progress":
        return "progress";
      default:
        return "calm";
    }
  }

  private getQuoteTone(status: QuoteRecord["status"]): CfmTone {
    switch (status) {
      case "accepted":
        return "success";
      case "declined":
        return "neutral";
      case "sent":
        return "progress";
      default:
        return "warning";
    }
  }

  private getInvoiceTone(status: InvoiceRecord["status"]): CfmTone {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "danger";
      case "issued":
        return "progress";
      default:
        return "warning";
    }
  }

  private getEquipmentTone(status: WorksiteEquipment["status"]): CfmTone {
    switch (status) {
      case "unavailable":
        return "danger";
      case "attention":
        return "warning";
      default:
        return "success";
    }
  }

  private getSiteTone(status: OrganizationSiteRecord["location_enrichment_status"] | null): CfmTone {
    switch (status) {
      case "failed":
      case "no_match":
        return "danger";
      case "partial":
        return "warning";
      case "enriched":
        return "success";
      default:
        return "calm";
    }
  }

  private getObligationTone(
    priority: ApplicableRegulatoryObligationRecord["priority"],
    status: ApplicableRegulatoryObligationRecord["status"],
  ): CfmTone {
    if (status === "compliant") {
      return "success";
    }
    if (priority === "high") {
      return "danger";
    }
    if (priority === "medium") {
      return "warning";
    }
    return "progress";
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
