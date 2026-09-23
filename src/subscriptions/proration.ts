import type { BillingPeriod, Pence, PlanId } from '../domain/types.js'
import { scale } from '../domain/money.js'
import { daysBetween } from './billing-period.js'
import { priceFor } from './plans.js'

/**
 * What a plan change costs the customer for the remainder of the current period.
 *
 * Positive means we should charge them, negative means we owe them credit.
 * Used today by the plan-change endpoint, which charges immediately on an
 * upgrade and ignores the credit on a downgrade.
 */
export function prorationFor(args: {
  from: PlanId
  to: PlanId
  period: BillingPeriod
  changedAt: Date
  periodStart: Date
  periodEnd: Date
}): Pence {
  const totalDays = daysBetween(args.periodStart, args.periodEnd)
  if (totalDays <= 0) return 0

  const remainingDays = Math.max(0, daysBetween(args.changedAt, args.periodEnd))
  const unusedRatio = remainingDays / totalDays

  const oldPrice = priceFor(args.from, args.period)
  const newPrice = priceFor(args.to, args.period)

  return scale(newPrice, unusedRatio) - scale(oldPrice, unusedRatio)
}
