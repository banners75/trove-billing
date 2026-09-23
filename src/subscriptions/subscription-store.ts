import type { Customer, Subscription } from '../domain/types.js'

/**
 * In-memory stand-in for the subscriptions table. Everything is synchronous and
 * returns copies, so callers can't mutate stored state by accident.
 */
export class SubscriptionStore {
  private readonly subscriptions = new Map<string, Subscription>()
  private readonly customers = new Map<string, Customer>()

  seed(customers: Customer[], subscriptions: Subscription[]): void {
    for (const customer of customers) this.customers.set(customer.id, { ...customer })
    for (const sub of subscriptions) this.subscriptions.set(sub.id, { ...sub })
  }

  getSubscription(id: string): Subscription | undefined {
    const found = this.subscriptions.get(id)
    return found ? { ...found } : undefined
  }

  getCustomer(id: string): Customer | undefined {
    const found = this.customers.get(id)
    return found ? { ...found } : undefined
  }

  save(subscription: Subscription): void {
    this.subscriptions.set(subscription.id, { ...subscription })
  }

  /** Every subscription whose next period starts on or before `date`. */
  dueForRenewal(date: Date): Subscription[] {
    return [...this.subscriptions.values()]
      .filter((sub) => sub.renewsAt.getTime() <= date.getTime())
      .map((sub) => ({ ...sub }))
      .sort((a, b) => a.renewsAt.getTime() - b.renewsAt.getTime())
  }

  all(): Subscription[] {
    return [...this.subscriptions.values()].map((sub) => ({ ...sub }))
  }
}
