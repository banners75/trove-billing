import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FixedClock } from '../src/clock.js'
import { runDailyBilling } from '../src/jobs/daily.js'
import { handlePaymentEvent } from '../src/payments/webhooks.js'
import { SubscriptionStore } from '../src/subscriptions/subscription-store.js'
import type { SubscriptionStatus } from '../src/domain/types.js'

import { CAST, SIM_DAYS, SIM_START } from './scenario.js'
import { Recorder, SimEmailer, SimProcessor } from './recorders.js'
import { renderHtml } from './render.js'

export interface DaySnapshot {
  day: number
  date: string
  statuses: Record<string, SubscriptionStatus | 'gone'>
}

async function main(): Promise<void> {
  const store = new SubscriptionStore()
  store.seed(
    CAST.map((c) => c.customer),
    CAST.map((c) => c.subscription),
  )

  const clock = new FixedClock(SIM_START)
  const recorder = new Recorder()
  const processor = new SimProcessor(CAST, recorder)
  const emailer = new SimEmailer(CAST, recorder)

  const snapshots: DaySnapshot[] = []
  let previous = statusesIn(store)

  for (let day = 1; day <= SIM_DAYS; day++) {
    const today = clock.now()
    recorder.day = day
    recorder.date = isoDate(today)

    await guard(recorder, 'runDailyBilling', () =>
      runDailyBilling({ clock, store, processor, emailer }),
    )

    // The processor's webhooks land at the end of the day.
    for (const event of processor.drain(today)) {
      await guard(recorder, 'handlePaymentEvent', () => handlePaymentEvent(event))
    }

    const statuses = statusesIn(store)
    for (const [id, status] of Object.entries(statuses)) {
      if (previous[id] !== status) {
        recorder.add({
          subjectId: id,
          kind: 'status',
          label: `${previous[id]} → ${status}`,
          detail: 'subscription status changed',
          tone: status === 'active' ? 'good' : 'bad',
        })
      }
    }
    previous = statuses

    snapshots.push({ day, date: isoDate(today), statuses })
    clock.advanceDays(1)
  }

  const outPath = resolve(dirname(fileURLToPath(import.meta.url)), 'out', 'simulation.html')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, renderHtml({ snapshots, events: recorder.events }))

  const counts = tally(recorder.events)
  console.log(`\n  ${SIM_DAYS} days simulated.`)
  console.log(
    `  ${counts.charge} charges, ${counts.webhook} webhooks, ${counts.email} emails, ` +
      `${counts.status} status changes, ${counts.error} errors.`,
  )
  if (counts.charge === 0) {
    console.log('  Nothing charged anyone. runDailyBilling is still empty.')
  }
  console.log(`\n  open ${outPath}\n`)
}

function statusesIn(store: SubscriptionStore): Record<string, SubscriptionStatus | 'gone'> {
  const byId = new Map(store.all().map((sub) => [sub.id, sub.status]))
  return Object.fromEntries(CAST.map((c) => [c.subscription.id, byId.get(c.subscription.id) ?? 'gone']))
}

/** Never let a half-built engine take the page down — record and carry on. */
async function guard(recorder: Recorder, what: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
  } catch (error) {
    recorder.add({
      subjectId: null,
      kind: 'error',
      label: `${what} threw`,
      detail: error instanceof Error ? error.message : String(error),
      tone: 'bad',
    })
  }
}

function tally(events: { kind: string }[]): Record<string, number> {
  const counts: Record<string, number> = {
    charge: 0,
    webhook: 0,
    email: 0,
    status: 0,
    error: 0,
  }
  for (const event of events) counts[event.kind] = (counts[event.kind] ?? 0) + 1
  return counts
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

await main()
