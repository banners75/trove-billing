/** All money in this codebase is an integer number of pence. Never floats. */
export type Pence = number

export type PlanId = 'basic' | 'standard' | 'premium'
export type BillingPeriod = 'monthly' | 'annual'

export interface Plan {
  id: PlanId
  name: string
  /** Price for a full billing period. */
  prices: Record<BillingPeriod, Pence>
}

export interface Customer {
  id: string
  email: string
  /** Token for the card we have on file. Null if they have never given us one. */
  cardId: string | null
}

export type SubscriptionStatus =
  /** Paid up and watching. */
  | 'active'
  /** We tried to take money and didn't get it. */
  | 'past_due'
  /** Over. Does not renew. */
  | 'cancelled'

export interface Subscription {
  id: string
  customerId: string
  planId: PlanId
  period: BillingPeriod
  status: SubscriptionStatus
  startedAt: Date
  /** The date the next billing period begins. */
  renewsAt: Date
}
