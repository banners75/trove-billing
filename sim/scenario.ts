import type { Customer, Subscription } from '../src/domain/types.js'
import type { FailureReason } from '../src/payments/payment-processor.js'

export interface Character {
  customer: Customer
  subscription: Subscription
  /** What their card does on the nth attempt (1-indexed). */
  cardBehaviour: (attempt: number) => { ok: true } | { ok: false; reason: FailureReason }
  note: string
}

function utc(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`)
}

export const SIM_START = utc('2026-02-01')
export const SIM_DAYS = 30

export const CAST: Character[] = [
  {
    customer: { id: 'cus_alice', email: 'alice@example.com', cardId: 'card_alice' },
    subscription: {
      id: 'sub_alice',
      customerId: 'cus_alice',
      planId: 'standard',
      period: 'monthly',
      status: 'active',
      startedAt: utc('2025-11-04'),
      renewsAt: utc('2026-02-04'),
    },
    cardBehaviour: () => ({ ok: true }),
    note: 'Pays every time. The boring one.',
  },
  {
    customer: { id: 'cus_bob', email: 'bob@example.com', cardId: 'card_bob' },
    subscription: {
      id: 'sub_bob',
      customerId: 'cus_bob',
      planId: 'premium',
      period: 'monthly',
      status: 'active',
      startedAt: utc('2025-12-08'),
      renewsAt: utc('2026-02-08'),
    },
    cardBehaviour: (attempt) =>
      attempt <= 2 ? { ok: false, reason: 'insufficient_funds' } : { ok: true },
    note: 'Payday is the 20th. Declines twice, then pays.',
  },
  {
    customer: { id: 'cus_carol', email: 'carol@example.com', cardId: 'card_carol' },
    subscription: {
      id: 'sub_carol',
      customerId: 'cus_carol',
      planId: 'basic',
      period: 'annual',
      status: 'active',
      startedAt: utc('2025-02-11'),
      renewsAt: utc('2026-02-11'),
    },
    cardBehaviour: () => ({ ok: false, reason: 'card_expired' }),
    note: 'Card expired. Will never pay without a human.',
  },
  {
    customer: { id: 'cus_dan', email: 'dan@example.com', cardId: null },
    subscription: {
      id: 'sub_dan',
      customerId: 'cus_dan',
      planId: 'standard',
      period: 'monthly',
      status: 'active',
      startedAt: utc('2025-10-16'),
      renewsAt: utc('2026-02-16'),
    },
    cardBehaviour: () => ({ ok: false, reason: 'do_not_honour' }),
    note: 'No card on file at all.',
  },
]
