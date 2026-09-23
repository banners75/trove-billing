import { describe, expect, it } from 'vitest'
import { prorationFor } from '../src/subscriptions/proration.js'
import { utc } from './fixtures.js'

const period = {
  period: 'monthly' as const,
  periodStart: utc('2026-02-15'),
  periodEnd: utc('2026-03-15'),
}

describe('prorationFor', () => {
  it('charges the difference for the unused part of the period', () => {
    // 14 of 28 days left, £10.99 -> £15.99, so half of the £5 difference.
    const amount = prorationFor({ from: 'standard', to: 'premium', changedAt: utc('2026-03-01'), ...period })
    expect(amount).toBe(250)
  })

  it('is a credit when downgrading', () => {
    const amount = prorationFor({ from: 'premium', to: 'standard', changedAt: utc('2026-03-01'), ...period })
    expect(amount).toBe(-250)
  })

  it('charges the full difference on the first day of the period', () => {
    const amount = prorationFor({ from: 'standard', to: 'premium', changedAt: utc('2026-02-15'), ...period })
    expect(amount).toBe(500)
  })

  it('is nothing once the period is over', () => {
    const amount = prorationFor({ from: 'standard', to: 'premium', changedAt: utc('2026-03-15'), ...period })
    expect(amount).toBe(0)
  })
})
