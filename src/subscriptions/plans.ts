import type { BillingPeriod, Pence, Plan, PlanId } from '../domain/types.js'
import { pounds } from '../domain/money.js'

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    prices: { monthly: pounds(5.99), annual: pounds(59.99) },
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    prices: { monthly: pounds(10.99), annual: pounds(109.99) },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    prices: { monthly: pounds(15.99), annual: pounds(159.99) },
  },
}

export function planFor(id: PlanId): Plan {
  return PLANS[id]
}

export function priceFor(id: PlanId, period: BillingPeriod): Pence {
  return PLANS[id].prices[period]
}
