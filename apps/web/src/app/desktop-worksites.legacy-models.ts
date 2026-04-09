import type { WorksiteStatus } from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";

import type { DesktopHomeSiteEnrichmentState } from "./desktop-shell-context";

// Types transitoires encore consommés par AppComponent tant que le legacy desktop
// n'est pas entièrement découpé. Ce fichier n'expose aucune mécanique Angular active.
export type DesktopWorksiteLinkedAssetItem = {
  id: string;
  label: string;
  detail: string | null;
  statusLabel: string;
  statusTone: CfmTone;
};

export type DesktopWorksitePageItem = {
  id: string;
  name: string;
  description: string | null;
  statusLabel: string;
  statusTone: CfmTone;
  signalLabel: string;
  signalTone: CfmTone;
  temporalLabel: string;
  siteId: string | null;
  siteName: string | null;
  siteAddress: string | null;
  siteTypeLabel: string | null;
  siteEnrichmentState: DesktopHomeSiteEnrichmentState | null;
  summary: string;
  completionLabel: string;
  completionTone: CfmTone;
  completionDetail: string;
  nextActionLabel: string;
  coordinationLabel: string;
  coordinationTone: CfmTone;
  coordinationDetail: string;
  documentsCountLabel: string;
  proofsCountLabel: string;
  signaturesCountLabel: string;
  documents: DesktopWorksiteLinkedAssetItem[];
  proofs: DesktopWorksiteLinkedAssetItem[];
  signatures: DesktopWorksiteLinkedAssetItem[];
};

export type DesktopWorksiteCreateDraft = {
  name: string;
  siteId: string;
  status: WorksiteStatus;
  description: string;
};
