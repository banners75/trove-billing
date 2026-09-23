import type {
  ChargeAccepted,
  ChargeRequest,
  FailureReason,
  PaymentProcessor,
} from './payment-processor.js'
import { DuplicateReferenceError } from './payment-processor.js'
import type { PaymentEvent } from './webhooks.js'

type Outcome = { result: 'succeeds' } | { result: 'fails'; reason: FailureReason }

/**
 * Test double for the real processor. Records what we submitted, and lets a
 * test decide the outcome of each attempt and when the webhook lands.
 */
export class FakePaymentProcessor implements PaymentProcessor {
  readonly submitted: ChargeRequest[] = []
  private readonly outcomes: Outcome[] = []
  private readonly seenReferences = new Set<string>()
  private nextChargeNumber = 1

  /** Queue the outcome of the next attempt. Defaults to success. */
  willSucceed(): this {
    this.outcomes.push({ result: 'succeeds' })
    return this
  }

  willFail(reason: FailureReason = 'insufficient_funds'): this {
    this.outcomes.push({ result: 'fails', reason })
    return this
  }

  async charge(request: ChargeRequest): Promise<ChargeAccepted> {
    if (this.seenReferences.has(request.reference)) {
      throw new DuplicateReferenceError(request.reference)
    }
    this.seenReferences.add(request.reference)
    this.submitted.push({ ...request })
    return { chargeId: `ch_${this.nextChargeNumber++}`, status: 'pending' }
  }

  /**
   * The webhook the processor would send for the nth charge we submitted
   * (1-indexed). Feed it to your handler when the test wants the outcome.
   */
  eventFor(chargeNumber: number, occurredAt: Date): PaymentEvent {
    const outcome = this.outcomes[chargeNumber - 1] ?? { result: 'succeeds' }
    const chargeId = `ch_${chargeNumber}`
    const eventId = `evt_${chargeNumber}`
    return outcome.result === 'succeeds'
      ? { eventId, type: 'charge.succeeded', chargeId, occurredAt }
      : { eventId, type: 'charge.failed', chargeId, reason: outcome.reason, occurredAt }
  }
}
