import { describe, expect, it } from 'vitest'
import { daysBetween, nextPeriodStart } from '../src/subscriptions/billing-period.js'
import { utc } from './fixtures.js'

describe('nextPeriodStart', () => {
  it('moves a monthly subscription on by one month', () => {
    expect(nextPeriodStart(utc('2026-02-15'), 'monthly')).toEqual(utc('2026-03-15'))
  })

  it('clamps to the last day of a short month', () => {
    expect(nextPeriodStart(utc('2026-01-31'), 'monthly')).toEqual(utc('2026-02-28'))
  })

  it('moves an annual subscription on by one year', () => {
    expect(nextPeriodStart(utc('2026-02-15'), 'annual')).toEqual(utc('2027-02-15'))
  })
})

describe('daysBetween', () => {
  it('counts whole days forwards', () => {
    expect(daysBetween(utc('2026-02-15'), utc('2026-03-15'))).toBe(28)
  })

  it('is zero for the same day', () => {
    expect(daysBetween(utc('2026-02-15'), utc('2026-02-15'))).toBe(0)
  })

  it('goes negative backwards', () => {
    expect(daysBetween(utc('2026-03-15'), utc('2026-02-15'))).toBe(-28)
  })
})
