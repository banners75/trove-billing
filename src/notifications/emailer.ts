export interface Email {
  to: string
  template: string
  vars: Record<string, string>
}

export interface Emailer {
  send(email: Email): Promise<void>
}

/** Templates marketing have already written and signed off. */
export const TEMPLATES = {
  paymentSucceeded: 'payment_succeeded',
  paymentFailed: 'payment_failed',
  priceChanging: 'price_changing',
} as const

export class FakeEmailer implements Emailer {
  readonly sent: Email[] = []

  async send(email: Email): Promise<void> {
    this.sent.push(email)
  }

  to(address: string): Email[] {
    return this.sent.filter((email) => email.to === address)
  }
}
