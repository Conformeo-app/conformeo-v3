import type { EntityId, IsoDateTime, VersionedRecord } from "./common";
import type { DocumentStatus } from "./document";

export type RegulatoryEvidenceLinkKind = "obligation" | "site" | "building_safety_item" | "duerp_entry";

export interface RegulatoryEvidenceRecord extends VersionedRecord {
  organization_id: EntityId;
  link_kind: RegulatoryEvidenceLinkKind;
  link_label: string;
  obligation_id: string | null;
  site_id: EntityId | null;
  building_safety_item_id: EntityId | null;
  duerp_entry_id: EntityId | null;
  document_type: string;
  source: string;
  status: DocumentStatus;
  file_name: string;
  uploaded_at: IsoDateTime | null;
  notes: string | null;
}

export interface RegulatoryEvidenceCreateRequest {
  link_kind: RegulatoryEvidenceLinkKind;
  obligation_id?: string | null;
  site_id?: EntityId | null;
  building_safety_item_id?: EntityId | null;
  duerp_entry_id?: EntityId | null;
  file_name: string;
  document_type: string;
  notes?: string | null;
}
