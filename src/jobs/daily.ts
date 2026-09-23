import type { Clock } from '../clock.js'
import type { Emailer } from '../notifications/emailer.js'
import type { PaymentProcessor } from '../payments/payment-processor.js'
import type { SubscriptionStore } from '../subscriptions/subscription-store.js'

export interface BillingDeps {
  clock: Clock
  store: SubscriptionStore
  processor: PaymentProcessor
  emailer: Emailer
}

/**
 * Called once a day, shortly after midnight UTC, by the scheduler.
 *
 * This is where renewals get picked up today. Whether a daily sweep is the
 * right trigger for everything billing needs to do is an open question.
 */
export async function runDailyBilling(deps: BillingDeps): Promise<void> {
  void deps
}
