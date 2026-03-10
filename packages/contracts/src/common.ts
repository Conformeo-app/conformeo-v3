export type EntityId = string;
export type IsoDateTime = string;

export interface VersionedRecord {
  id: EntityId;
  version: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  deleted_at: IsoDateTime | null;
}
