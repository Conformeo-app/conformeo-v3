import { InjectionToken } from "@angular/core";
import type {
  DocumentLifecycleStatus,
  WorksiteAssigneeRecord,
  WorksiteCoordinationStatus,
} from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";

export type WorksiteDocumentFilterOption = {
  id: string;
  name: string;
};

export type WorksiteDocumentTypeFilterOption = {
  value: string;
  label: string;
};

export type WorksiteDocumentLinkedAssetItem = {
  id: string;
  label: string;
  detail: string | null;
  statusLabel: string;
  statusTone: CfmTone;
};

export type WorksiteDocumentCoordinationState = {
  status: WorksiteCoordinationStatus;
  statusLabel: string;
  statusTone: CfmTone;
  assigneeLabel: string;
  commentText: string | null;
  commentSummary: string;
  updatedAtLabel: string | null;
};

export type WorksiteDocumentPageItem = {
  id: string;
  title: string;
  fileName: string;
  worksiteId: string;
  worksiteName: string;
  typeLabel: string;
  lifecycleStatusLabel: string;
  lifecycleStatusTone: CfmTone;
  technicalStatusLabel: string;
  technicalStatusTone: CfmTone;
  fileAvailabilityLabel: string;
  fileAvailabilityTone: CfmTone;
  fileSizeLabel: string | null;
  signatureStatusLabel: string;
  proofCountLabel: string;
  coordination: WorksiteDocumentCoordinationState;
  uploadedAtLabel: string | null;
  linkedSignatureLabel: string | null;
  linkedSignatureDetail: string | null;
  linkedProofsSummary: string | null;
  notes: string | null;
  linkedSignature: WorksiteDocumentLinkedAssetItem | null;
  linkedProofs: WorksiteDocumentLinkedAssetItem[];
};

export interface DesktopWorksiteDocumentsPageContext {
  shouldShowWorkspaceContent: boolean;
  currentMembership: unknown | null;
  isChantierEnabled: boolean;
  canReadOrganization: boolean;
  selectedWorksiteDocumentFilterId: string;
  selectedWorksiteDocumentTypeFilter: string;
  selectedWorksiteDocumentLifecycleFilter: "all" | DocumentLifecycleStatus;
  selectedCoordinationStatusFilter: "all" | WorksiteCoordinationStatus;
  selectedCoordinationAssigneeFilter: "all" | "unassigned" | string;
  selectedWorksiteDocumentDetailId: string | null;
  worksiteDocumentCountLabel: string;
  worksiteDocumentFilterOptions: WorksiteDocumentFilterOption[];
  worksiteDocumentTypeFilterOptions: WorksiteDocumentTypeFilterOption[];
  worksiteAssignees: WorksiteAssigneeRecord[];
  filteredWorksiteDocumentItems: WorksiteDocumentPageItem[];
  hasActiveWorksiteDocumentFilters: boolean;
  worksitePreventionPlanPdfBusyId: string | null;
  worksitePreventionPlanEditingId: string | null;
  getWorksiteAssigneeOptionLabel(assignee: WorksiteAssigneeRecord): string;
  resetWorksiteDocumentFilters(): void;
  isWorksiteDocumentDownloadBusy(document: WorksiteDocumentPageItem): boolean;
  downloadWorksiteDocument(document: WorksiteDocumentPageItem): Promise<void> | void;
  getWorksiteDocumentActionLabel(document: WorksiteDocumentPageItem): string;
  canAdjustWorksiteDocument(document: WorksiteDocumentPageItem): boolean;
  toggleWorksitePreventionPlanEditor(worksiteId: string): void;
  toggleWorksiteDocumentDetails(documentId: string): void;
}

export const DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT =
  new InjectionToken<DesktopWorksiteDocumentsPageContext>("DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT");
