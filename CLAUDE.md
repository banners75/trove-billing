# Conventions

- Money is an integer number of pence, always. No floats, no decimal strings.
  Use the helpers in `src/domain/money.ts`.
- All dates are UTC. Never call `new Date()` outside `src/clock.ts` — take a
  `Clock`.
- External services sit behind a port (an interface in the module that owns
  them) with a fake alongside it for tests. Tests use the fakes, never mocks.
- Tests go in `test/`, named after the module under test. Build data with the
  builders in `test/fixtures.ts` rather than inline literals.
- `npm test` and `npm run typecheck` should both be clean before you push.
