import { systemClock } from './clock.js'
import { FakeEmailer } from './notifications/emailer.js'
import { FakePaymentProcessor } from './payments/fake-processor.js'
import { SubscriptionStore } from './subscriptions/subscription-store.js'
import type { BillingDeps } from './jobs/daily.js'

/**
 * Wiring. In production the emailer and processor are real HTTP clients and the
 * store is Postgres; none of that is in this repo, so we wire the fakes.
 */
export function createApp(overrides: Partial<BillingDeps> = {}): BillingDeps {
  return {
    clock: systemClock,
    store: new SubscriptionStore(),
    processor: new FakePaymentProcessor(),
    emailer: new FakeEmailer(),
    ...overrides,
  }
}
