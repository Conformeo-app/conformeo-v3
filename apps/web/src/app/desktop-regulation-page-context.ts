import { InjectionToken } from "@angular/core";
import type {
  ApplicableRegulatoryObligationRecord,
  BuildingSafetyItemRecord,
  ComplianceStatus,
  DuerpEntryRecord,
  MembershipAccess,
  ModuleAccessLevel,
  OrganizationProfileUpdateRequest,
  OrganizationRegulatoryProfileRecord,
  OrganizationSiteRecord,
  OrganizationSiteType,
  RegulatoryCriterionRecord,
  RegulatoryEvidenceLinkKind,
  RegulatoryEvidenceRecord,
  RegulatoryObligationCategory,
  RegulatoryObligationPriority,
} from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";

import type { DesktopHomeSiteEnrichmentState } from "./desktop-shell-context";

export type DesktopRegulationShowcaseSummary = {
  statusLabel: string;
  tone: CfmTone;
  headline: string;
  summary: string;
  context: string | null;
  scoreSummary: string;
  profileLabel: string;
  profileTone: CfmTone;
  siteLabel: string | null;
  siteTone: CfmTone;
};

export type DesktopRegulationShowcaseActionKind = "scroll" | "site_enrichment";

export type DesktopRegulationScoreDriverItem = {
  id: string;
  label: string;
  detail: string;
  statusLabel: string;
  tone: CfmTone;
};

export type DesktopRegulationPriorityItem = {
  id: string;
  title: string;
  familyLabel: string;
  levelLabel: string;
  tone: CfmTone;
  impact: string;
  context: string | null;
  focusLabel: string | null;
  actionLabel: string;
  actionKind: DesktopRegulationShowcaseActionKind;
  sectionId: string;
  obligationId: string | null;
  siteId: string | null;
  rank?: number;
};

export type DesktopRegulationFamilyCard = {
  id: RegulatoryObligationCategory;
  label: string;
  countLabel: string;
  detail: string;
  statusLabel: string;
  tone: CfmTone;
  highlights: Array<{
    label: string;
    value: string;
  }>;
  actionLabel: string;
  actionKind: DesktopRegulationShowcaseActionKind;
  sectionId: string;
  obligationId: string | null;
  siteId: string | null;
};

export type DesktopRegulationActionItem = {
  id: string;
  title: string;
  detail: string;
  supportLabel: string | null;
  actionLabel: string;
  tone: CfmTone;
  actionKind: DesktopRegulationShowcaseActionKind;
  sectionId: string;
  obligationId: string | null;
  siteId: string | null;
};

export type DesktopRegulationEvidenceShowcaseItem = {
  id: string;
  title: string;
  detail: string;
  statusLabel: string;
  tone: CfmTone;
  contextLabel: string | null;
};

export type DesktopRegulationAllSiteSourceKind = "declared" | "duerp" | "building_safety" | "evidence";

export type DesktopRegulationAllSiteItem = {
  key: string;
  siteId: string | null;
  name: string;
  address: string | null;
  declaredSite: OrganizationSiteRecord | null;
  sourceKinds: DesktopRegulationAllSiteSourceKind[];
};

export interface DesktopRegulationPageContext {
  readonly currentMembership: MembershipAccess | null;
  readonly shouldShowWorkspaceContent: boolean;
  readonly isReglementationEnabled: boolean;
  readonly regulationAccessLevel: ModuleAccessLevel;
  readonly isReglementationDataPending: boolean;
  readonly isReglementationDataDelayed: boolean;
  readonly regulatoryWorkspaceNotice: string | null;
  readonly canReadOrganization: boolean;
  readonly canManageOrganization: boolean;
  readonly canActOnReglementation: boolean;
  readonly canExportReglementation: boolean;
  readonly organizationProfileSaving: boolean;
  readonly isOnboardingPending: boolean;
  readonly organizationProfile: {
    has_employees: boolean | null;
  } | null;
  readonly profileForm: OrganizationProfileUpdateRequest & { hasEmployees: "" | "yes" | "no" };
  readonly canSubmitOnboarding: boolean;
  readonly regulatoryShowcaseSummary: DesktopRegulationShowcaseSummary | null;
  readonly topRegulatoryPriority: DesktopRegulationPriorityItem | null;
  readonly regulatoryComplianceScore: number;
  readonly regulatoryCriticalCount: number;
  readonly regulatoryMissingProofCount: number;
  readonly regulatoryIncompleteSitesCount: number;
  readonly regulatoryScoreDrivers: DesktopRegulationScoreDriverItem[];
  readonly regulatoryPriorityItems: DesktopRegulationPriorityItem[];
  readonly regulatoryObligationActionItems: DesktopRegulationPriorityItem[];
  readonly regulatoryProofGapItems: DesktopRegulationPriorityItem[];
  readonly regulatorySiteActionItems: DesktopRegulationPriorityItem[];
  readonly regulatoryFamilyCards: DesktopRegulationFamilyCard[];
  readonly regulatoryRecommendedActions: DesktopRegulationActionItem[];
  readonly regulatoryRecommendedActionsSummary: string;
  readonly regulatoryEvidenceShowcaseItems: DesktopRegulationEvidenceShowcaseItem[];
  readonly regulatoryObligations: ApplicableRegulatoryObligationRecord[];
  readonly regulatoryObligationsToVerifyCount: number;
  readonly overdueRegulatoryObligationCount: number;
  readonly globalBuildingSafetyOverdueCount: number;
  readonly regulatoryEvidenceAvailableCount: number;
  readonly regulatoryEvidenceCoverageCount: number;
  readonly regulatoryProofSupportSummary: string | null;
  readonly regulatoryExporting: boolean;
  readonly regulatoryProfile: OrganizationRegulatoryProfileRecord | null;
  readonly selectedRegulatoryObligation: ApplicableRegulatoryObligationRecord | null;
  readonly selectedObligationCriteria: RegulatoryCriterionRecord[];
  readonly selectedObligationEvidences: RegulatoryEvidenceRecord[];
  readonly filteredDuerpEntries: DuerpEntryRecord[];
  readonly filteredRegulatoryEvidences: RegulatoryEvidenceRecord[];
  readonly regulatoryAllSites: DesktopRegulationAllSiteItem[];
  readonly filteredBuildingSafetyItems: BuildingSafetyItemRecord[];
  readonly buildingSafetyOverdueCount: number;
  readonly buildingSafetyDueSoonCount: number;
  readonly buildingSafetyOkCount: number;
  readonly organizationSites: OrganizationSiteRecord[];
  readonly organizationSiteEnrichmentBusyId: string | null;
  getObligationCountLabel(): string;
  getCriterionTone(value: boolean | number | null): CfmTone;
  getObligationCategoryLabel(category: RegulatoryObligationCategory): string;
  getObligationPriorityLabel(priority: RegulatoryObligationPriority): string;
  getObligationPriorityTone(priority: RegulatoryObligationPriority): CfmTone;
  getComplianceStatusLabel(status: ComplianceStatus): string;
  getComplianceStatusTone(status: ComplianceStatus): CfmTone;
  getDocumentStatusLabel(status: RegulatoryEvidenceRecord["status"]): string;
  getDocumentStatusTone(status: RegulatoryEvidenceRecord["status"]): CfmTone;
  getObligationFirstAction(obligation: ApplicableRegulatoryObligationRecord, evidenceCount: number): string;
  getDuerpSeverityLabel(severity: DuerpEntryRecord["severity"]): string;
  getDuerpSeverityTone(severity: DuerpEntryRecord["severity"]): CfmTone;
  getRegulatoryEvidenceLinkKindLabel(kind: RegulatoryEvidenceLinkKind): string;
  getBuildingSafetyTypeLabel(itemType: BuildingSafetyItemRecord["item_type"]): string;
  getBuildingSafetyAlertStatusLabel(alertStatus: BuildingSafetyItemRecord["alert_status"]): string;
  getBuildingSafetyAlertStatusTone(alertStatus: BuildingSafetyItemRecord["alert_status"]): CfmTone;
  getBuildingSafetySummaryLabel(kind: "overdue" | "due_soon" | "ok"): string;
  getSiteTypeLabel(siteType: OrganizationSiteType): string;
  getSiteEnrichmentUiState(site: OrganizationSiteRecord): DesktopHomeSiteEnrichmentState;
  getSiteNameById(siteId: string): string;
  openObligationDetail(obligationId: string): void;
  exportRegulatoryPdf(): Promise<void>;
  getRegulatoryShowcaseActionLabel(action: {
    actionKind: DesktopRegulationShowcaseActionKind;
    actionLabel: string;
    siteId: string | null;
  }): string;
  isRegulatoryShowcaseActionBusy(action: {
    actionKind: DesktopRegulationShowcaseActionKind;
    siteId: string | null;
  }): boolean;
  runRegulatoryShowcaseAction(action: {
    actionKind: DesktopRegulationShowcaseActionKind;
    sectionId: string;
    obligationId: string | null;
    siteId: string | null;
  }): Promise<void>;
  relaunchSiteEnrichment(site: OrganizationSiteRecord): Promise<void>;
}

export const DESKTOP_REGULATION_PAGE_CONTEXT =
  new InjectionToken<DesktopRegulationPageContext>("DESKTOP_REGULATION_PAGE_CONTEXT");
