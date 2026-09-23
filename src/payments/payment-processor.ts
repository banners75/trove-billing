import type { Pence } from '../domain/types.js'

export type FailureReason = 'insufficient_funds' | 'card_expired' | 'do_not_honour'

export interface ChargeRequest {
  cardId: string
  amount: Pence
  /**
   * Our own identifier for this attempt. The processor will reject a second
   * charge sent with a reference it has already seen in the last 24 hours.
   */
  reference: string
}

export interface ChargeAccepted {
  chargeId: string
  /** Always 'pending'. The outcome arrives later, by webhook. */
  status: 'pending'
}

export class DuplicateReferenceError extends Error {
  constructor(public readonly reference: string) {
    super(`charge already submitted with reference ${reference}`)
  }
}

/**
 * Our payment processor.
 *
 * `charge` only submits the attempt — it tells us nothing about whether the
 * money arrived. The outcome comes back as a webhook (see ./webhooks.ts),
 * anywhere from a second to a few hours later.
 */
export interface PaymentProcessor {
  charge(request: ChargeRequest): Promise<ChargeAccepted>
}
