import type { BillingPeriod } from '../domain/types.js'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * The date the period after `start` begins. Anchored on the day of the month
 * the subscription started, clamped for short months (31 Jan -> 28 Feb).
 */
export function nextPeriodStart(start: Date, period: BillingPeriod): Date {
  const next = new Date(start.getTime())
  if (period === 'annual') {
    next.setUTCFullYear(next.getUTCFullYear() + 1)
    return next
  }

  const dayOfMonth = start.getUTCDate()
  next.setUTCDate(1)
  next.setUTCMonth(next.getUTCMonth() + 1)
  const daysInNextMonth = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate()
  next.setUTCDate(Math.min(dayOfMonth, daysInNextMonth))
  return next
}

/** Whole days from `from` to `to`. Negative if `to` is earlier. */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY)
}

export function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}
