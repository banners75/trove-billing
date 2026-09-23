# trove-billing

The billing corner of Trove, a streaming subscription service.

```bash
npm install
npm test
npm run typecheck
```

No database, no network, no environment variables. Everything is in memory.

## What's here

| Path | |
| --- | --- |
| `src/domain/` | Types, and money as integer pence |
| `src/subscriptions/` | Plan catalogue, billing period dates, proration, the store |
| `src/payments/` | The payment processor port, its webhook types, and a fake |
| `src/notifications/` | Email port and a fake |
| `src/jobs/daily.ts` | The daily scheduler entry point |
| `src/clock.ts` | Injected clock — nothing calls `new Date()` directly |
| `test/fixtures.ts` | Builders, and `aWorld()` for a wired-up starting point |

## What's not here

Renewals. Nothing currently charges anyone for anything — plan changes are the
only thing that has ever taken money, and that path lives in the API service.
`runDailyBilling` and `handlePaymentEvent` are both empty.
