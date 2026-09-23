import { FixedClock } from '../src/clock.js'
import { FakeEmailer } from '../src/notifications/emailer.js'
import { FakePaymentProcessor } from '../src/payments/fake-processor.js'
import { SubscriptionStore } from '../src/subscriptions/subscription-store.js'
import type { Customer, Subscription } from '../src/domain/types.js'

export function utc(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`)
}

let nextId = 1

export function aCustomer(overrides: Partial<Customer> = {}): Customer {
  const id = `cus_${nextId++}`
  return { id, email: `${id}@example.com`, cardId: `card_${id}`, ...overrides }
}

export function aSubscription(overrides: Partial<Subscription> = {}): Subscription {
  const id = `sub_${nextId++}`
  return {
    id,
    customerId: `cus_${id}`,
    planId: 'standard',
    period: 'monthly',
    status: 'active',
    startedAt: utc('2026-01-15'),
    renewsAt: utc('2026-02-15'),
    ...overrides,
  }
}

/** A world with one active customer, wired to fakes and a stopped clock. */
export function aWorld(today = utc('2026-02-15')) {
  const customer = aCustomer()
  const subscription = aSubscription({ customerId: customer.id })
  const store = new SubscriptionStore()
  store.seed([customer], [subscription])

  return {
    customer,
    subscription,
    store,
    clock: new FixedClock(today),
    processor: new FakePaymentProcessor(),
    emailer: new FakeEmailer(),
  }
}
