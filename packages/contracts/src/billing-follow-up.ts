export type BillingFollowUpStatus = "normal" | "to_follow_up" | "followed_up" | "waiting_customer";

export interface BillingFollowUpUpdateRequest {
  follow_up_status: BillingFollowUpStatus;
}
