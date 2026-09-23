import { describe, expect, it } from 'vitest'
import { SubscriptionStore } from '../src/subscriptions/subscription-store.js'
import { aCustomer, aSubscription, utc } from './fixtures.js'

describe('SubscriptionStore', () => {
  it('returns subscriptions due on or before the given date, soonest first', () => {
    const store = new SubscriptionStore()
    const early = aSubscription({ renewsAt: utc('2026-02-10') })
    const onTheDay = aSubscription({ renewsAt: utc('2026-02-15') })
    const later = aSubscription({ renewsAt: utc('2026-02-20') })
    store.seed([aCustomer()], [later, onTheDay, early])

    const due = store.dueForRenewal(utc('2026-02-15'))

    expect(due.map((sub) => sub.id)).toEqual([early.id, onTheDay.id])
  })

  it('does not let callers mutate stored state through the value they got back', () => {
    const store = new SubscriptionStore()
    const subscription = aSubscription()
    store.seed([aCustomer()], [subscription])

    const read = store.getSubscription(subscription.id)!
    read.status = 'cancelled'

    expect(store.getSubscription(subscription.id)!.status).toBe('active')
  })
})
