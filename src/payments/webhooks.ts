import type { FailureReason } from './payment-processor.js'

export interface ChargeSucceeded {
  eventId: string
  type: 'charge.succeeded'
  chargeId: string
  occurredAt: Date
}

export interface ChargeFailed {
  eventId: string
  type: 'charge.failed'
  chargeId: string
  reason: FailureReason
  occurredAt: Date
}

export type PaymentEvent = ChargeSucceeded | ChargeFailed

/**
 * Entry point for webhooks from the payment processor.
 *
 * Two things the processor's docs are clear about, and support have learned the
 * hard way: delivery is at-least-once, and events are not guaranteed to arrive
 * in the order they occurred.
 *
 * Currently does nothing — nothing downstream of payments is wired up yet.
 */
export async function handlePaymentEvent(event: PaymentEvent): Promise<void> {
  void event
}
