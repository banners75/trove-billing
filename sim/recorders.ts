import type { Email, Emailer } from '../src/notifications/emailer.js'
import type {
  ChargeAccepted,
  ChargeRequest,
  PaymentProcessor,
} from '../src/payments/payment-processor.js'
import { DuplicateReferenceError } from '../src/payments/payment-processor.js'
import type { PaymentEvent } from '../src/payments/webhooks.js'
import type { Character } from './scenario.js'

export interface SimEvent {
  day: number
  date: string
  subjectId: string | null
  kind: 'charge' | 'webhook' | 'email' | 'status' | 'error'
  label: string
  detail: string
  tone: 'neutral' | 'good' | 'bad'
}

export class Recorder {
  readonly events: SimEvent[] = []
  day = 0
  date = ''

  add(event: Omit<SimEvent, 'day' | 'date'>): void {
    this.events.push({ day: this.day, date: this.date, ...event })
  }
}

/**
 * Stands in for the payment processor. Submitting a charge only queues an
 * outcome — the webhook is delivered later by the runner, same as production.
 */
export class SimProcessor implements PaymentProcessor {
  private readonly seenReferences = new Set<string>()
  private readonly attemptsByCard = new Map<string, number>()
  private nextChargeNumber = 1
  readonly pending: { chargeId: string; event: PaymentEvent; cardId: string }[] = []

  constructor(
    private readonly cast: Character[],
    private readonly recorder: Recorder,
  ) {}

  async charge(request: ChargeRequest): Promise<ChargeAccepted> {
    const subjectId = this.subjectFor(request.cardId)

    if (this.seenReferences.has(request.reference)) {
      this.recorder.add({
        subjectId,
        kind: 'error',
        label: 'duplicate rejected',
        detail: `processor refused a second charge with reference ${request.reference}`,
        tone: 'bad',
      })
      throw new DuplicateReferenceError(request.reference)
    }
    this.seenReferences.add(request.reference)

    const chargeId = `ch_${this.nextChargeNumber++}`
    const attempt = (this.attemptsByCard.get(request.cardId) ?? 0) + 1
    this.attemptsByCard.set(request.cardId, attempt)

    this.recorder.add({
      subjectId,
      kind: 'charge',
      label: `charge ${formatPence(request.amount)}`,
      detail: `${chargeId}, attempt ${attempt} on this card, reference ${request.reference}`,
      tone: 'neutral',
    })

    const outcome = this.behaviourFor(request.cardId)(attempt)
    const occurredAt = new Date()
    this.pending.push({
      chargeId,
      cardId: request.cardId,
      event: outcome.ok
        ? { eventId: `evt_${chargeId}`, type: 'charge.succeeded', chargeId, occurredAt }
        : {
            eventId: `evt_${chargeId}`,
            type: 'charge.failed',
            chargeId,
            reason: outcome.reason,
            occurredAt,
          },
    })

    return { chargeId, status: 'pending' }
  }

  /** Hand back everything the processor would have delivered by now. */
  drain(now: Date): PaymentEvent[] {
    const due = this.pending.splice(0, this.pending.length)
    for (const { event, chargeId, cardId } of due) {
      this.recorder.add({
        subjectId: this.subjectFor(cardId),
        kind: 'webhook',
        label: event.type === 'charge.failed' ? `declined: ${event.reason}` : 'payment received',
        detail: `${event.type} for ${chargeId}`,
        tone: event.type === 'charge.failed' ? 'bad' : 'good',
      })
    }
    void now
    return due.map((item) => ({ ...item.event }))
  }

  private behaviourFor(cardId: string): Character['cardBehaviour'] {
    return (
      this.cast.find((c) => c.customer.cardId === cardId)?.cardBehaviour ??
      (() => ({ ok: false, reason: 'do_not_honour' }))
    )
  }

  private subjectFor(cardId: string): string | null {
    return this.cast.find((c) => c.customer.cardId === cardId)?.subscription.id ?? null
  }
}

export class SimEmailer implements Emailer {
  constructor(
    private readonly cast: Character[],
    private readonly recorder: Recorder,
  ) {}

  async send(email: Email): Promise<void> {
    const subject = this.cast.find((c) => c.customer.email === email.to)
    this.recorder.add({
      subjectId: subject?.subscription.id ?? null,
      kind: 'email',
      label: email.template,
      detail: `to ${email.to}${describeVars(email.vars)}`,
      tone: 'neutral',
    })
  }
}

function describeVars(vars: Record<string, string>): string {
  const entries = Object.entries(vars)
  if (entries.length === 0) return ''
  return ` — ${entries.map(([key, value]) => `${key}: ${value}`).join(', ')}`
}

function formatPence(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  return `${sign}£${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}
