export interface BillingLineItemInput {
  description: string;
  quantity: number;
  unit_price_cents: number;
}

export interface BillingLineItemRecord extends BillingLineItemInput {
  line_total_cents: number;
}
