import type { VersionedRecord } from "./common";

export type UserStatus = "invited" | "active" | "disabled";

export interface UserRecord extends VersionedRecord {
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  phone: string | null;
  status: UserStatus;
  last_active_at: string | null;
}
