import type {
  OrganizationSiteRecord,
  WorksiteAssigneeRecord,
  WorksiteApiSummary,
  WorksiteCoordinationStatus,
  WorksiteDocumentRecord,
  WorksiteEquipment,
  WorksiteEquipmentMovement,
  WorksiteInterventionRecord,
  WorksiteInterventionResult,
  WorksiteProofRecord,
  WorksiteSignatureRecord,
  WorksiteTeamRecord,
  WorksiteStatus,
} from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";

export type DesktopWorksiteStatusOption = {
  value: WorksiteStatus;
  label: string;
  tone: CfmTone;
};

export type DesktopWorksiteSiteEnrichmentState = {
  label: string;
  tone: CfmTone;
  detail: string;
  reasonLabel: string | null;
};

export type DesktopWorksiteListItem = {
  id: string;
  actionRank: number;
  name: string;
  siteId: string | null;
  statusLabel: string;
  statusTone: CfmTone;
  globalStateLabel: string;
  globalStateTone: CfmTone;
  summary: string;
  temporalLabel: string;
  siteName: string | null;
  primarySignalLabel: string;
  primarySignalTone: CfmTone;
  primarySignalDetail: string;
  issueSummaryLabel: string;
  nextActionLabel: string;
  nextActionDetail: string;
  planningLabel: string;
  planningTone: CfmTone;
  nextInterventionLabel: string;
  nextInterventionDetail: string;
  completionLabel: string;
  completionTone: CfmTone;
};

export type DesktopWorksiteDocumentItem = {
  id: string;
  worksiteId: string;
  title: string;
  fileName: string;
  typeLabel: string;
  lifecycleStatusLabel: string;
  lifecycleStatusTone: CfmTone;
  technicalStatusLabel: string;
  technicalStatusTone: CfmTone;
  uploadedAtLabel: string | null;
  notes: string | null;
  linkedProofsSummary: string | null;
  linkedSignatureLabel: string | null;
};

export type DesktopWorksiteProofItem = {
  id: string;
  worksiteId: string;
  label: string;
  fileName: string;
  statusLabel: string;
  statusTone: CfmTone;
  uploadedAtLabel: string | null;
  notes: string | null;
};

export type DesktopWorksiteSignatureItem = {
  id: string;
  worksiteId: string;
  label: string;
  fileName: string;
  statusLabel: string;
  statusTone: CfmTone;
  uploadedAtLabel: string | null;
};

export type DesktopWorksiteCoordinationVm = {
  status: WorksiteCoordinationStatus;
  statusLabel: string;
  statusTone: CfmTone;
  teamId: string | null;
  teamName: string;
  teamDescription: string | null;
  teamMemberCountLabel: string;
  teamMembers: Array<{
    userId: string;
    displayName: string;
    roleLabel: string;
  }>;
  coverageLabel: string;
  coverageTone: CfmTone;
  coverageDetail: string;
  missingItems: string[];
  assigneeUserId: string;
  assigneeLabel: string;
  commentText: string;
  updatedAtLabel: string | null;
};

export type DesktopWorksiteInterventionItem = {
  id: string;
  typeLabel: string;
  statusLabel: string;
  statusTone: CfmTone;
  resultCode: WorksiteInterventionResult | null;
  resultLabel: string | null;
  resultTone: CfmTone | null;
  resultDetail: string | null;
  scheduledForLabel: string;
  assigneeLabel: string;
  teamLabel: string;
  completedAtLabel: string | null;
  detail: string;
  isOverdue: boolean;
  isDone: boolean;
  isCanceled: boolean;
  raw: WorksiteInterventionRecord;
};

export type DesktopWorksitePlanningVm = {
  statusLabel: string;
  statusTone: CfmTone;
  summary: string;
  missingItems: string[];
  readyItems: string[];
  lastInterventionLabel: string | null;
  lastInterventionTimingLabel: string | null;
  lastInterventionResultCode: WorksiteInterventionResult | null;
  lastInterventionResultLabel: string | null;
  lastInterventionResultTone: CfmTone | null;
  lastInterventionDetail: string | null;
  lastInterventionFollowUp: string | null;
  nextInterventionLabel: string;
  nextInterventionDetail: string;
  nextInterventionStatusLabel: string;
  nextInterventionStatusTone: CfmTone;
  nextInterventionAssigneeLabel: string;
  nextInterventionTimingLabel: string;
  nextActionLabel: string;
  nextActionRoute: string;
};

export type DesktopWorksiteClosureVm = {
  statusLabel: string;
  statusTone: CfmTone;
  summary: string;
  readyItems: string[];
  missingItems: string[];
  nextActionLabel: string;
  nextActionRoute: string;
  canClose: boolean;
  isClosed: boolean;
};

export type DesktopWorksiteDetailVm = {
  id: string;
  isPersisted: boolean;
  name: string;
  description: string | null;
  statusLabel: string;
  statusTone: CfmTone;
  globalStateLabel: string;
  globalStateTone: CfmTone;
  summary: string;
  temporalLabel: string;
  siteName: string | null;
  siteAddress: string | null;
  siteTypeLabel: string | null;
  siteEnrichmentState: DesktopWorksiteSiteEnrichmentState | null;
  preparationLabel: string;
  preparationTone: CfmTone;
  vigilanceLabel: string;
  vigilanceTone: CfmTone;
  primarySignalLabel: string;
  primarySignalTone: CfmTone;
  primarySignalDetail: string;
  issueSummaryLabel: string;
  primaryActionDetail: string;
  documentsCountLabel: string;
  proofsCountLabel: string;
  signaturesCountLabel: string;
  blockingItems: string[];
  actionItems: string[];
  watchItems: string[];
  availableItems: string[];
  missingItems: string[];
  nextActionLabel: string;
  primaryActionLabel: string;
  primaryActionRoute: string;
  planning: DesktopWorksitePlanningVm;
  closure: DesktopWorksiteClosureVm;
  coordination: DesktopWorksiteCoordinationVm;
  interventions: DesktopWorksiteInterventionItem[];
  documents: DesktopWorksiteDocumentItem[];
  proofs: DesktopWorksiteProofItem[];
  signatures: DesktopWorksiteSignatureItem[];
  equipments: DesktopWorksiteEquipmentItem[];
  recentEquipmentMovements: DesktopWorksiteEquipmentMovementItem[];
  equipmentSummary: DesktopWorksiteEquipmentSummary;
  raw: WorksiteApiSummary;
  linkedSite: OrganizationSiteRecord | null;
};

export type DesktopWorksiteEquipmentItem = {
  id: string;
  worksiteId: string | null;
  worksiteName: string | null;
  name: string;
  typeLabel: string;
  statusLabel: string;
  statusTone: CfmTone;
  signalLabel: string;
  lastMovementLabel: string;
  lastMovementAtLabel: string | null;
  actorLabel: string | null;
  raw: WorksiteEquipment;
};

export type DesktopWorksiteEquipmentMovementItem = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  movementLabel: string;
  resultingStatusLabel: string;
  resultingStatusTone: CfmTone;
  capturedAtLabel: string | null;
  actorLabel: string;
  detail: string;
  raw: WorksiteEquipmentMovement;
};

export type DesktopWorksiteEquipmentOption = {
  id: string;
  label: string;
  supportLabel: string;
};

export type DesktopWorksiteEquipmentParkFilter = "all" | "assigned" | "available" | "attention";

export type DesktopWorksiteEquipmentParkItem = {
  id: string;
  name: string;
  typeLabel: string;
  statusLabel: string;
  statusTone: CfmTone;
  assignmentLabel: string;
  assignmentTone: CfmTone;
  currentWorksiteId: string | null;
  currentWorksiteName: string | null;
  currentWorksiteStatusLabel: string | null;
  currentWorksiteStatusTone: CfmTone | null;
  lastMovementLabel: string;
  lastMovementAtLabel: string | null;
  actorLabel: string | null;
  isAssigned: boolean;
  needsAttention: boolean;
  raw: WorksiteEquipment;
};

export type DesktopWorksiteEquipmentParkSummary = {
  totalLabel: string;
  availableLabel: string;
  assignedLabel: string;
  attentionLabel: string;
};

export type DesktopWorksiteEquipmentSummary = {
  totalCount: number;
  totalLabel: string;
  statusLabel: string;
  statusTone: CfmTone;
  attentionLabel: string;
  nextActionLabel: string;
  recentMovementLabel: string;
  availableOptions: DesktopWorksiteEquipmentOption[];
};

export type DesktopWorksitesModuleSummary = {
  total: number;
  totalLabel: string;
  activeLabel: string;
  blockedLabel: string;
  plannedLabel: string;
  nowLabel: string;
  watchLabel: string;
  controlLabel: string;
};

export type DesktopWorksitesModuleState = {
  worksites: WorksiteApiSummary[];
  sites: OrganizationSiteRecord[];
  teams: WorksiteTeamRecord[];
  documents: WorksiteDocumentRecord[];
  proofs: WorksiteProofRecord[];
  signatures: WorksiteSignatureRecord[];
  equipments: WorksiteEquipment[];
  equipmentMovements: WorksiteEquipmentMovement[];
  assignees: WorksiteAssigneeRecord[];
};
