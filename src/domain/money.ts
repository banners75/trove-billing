import type { Pence } from './types.js'

/** Convert pounds to pence. Only for fixtures and config — never for arithmetic. */
export function pounds(amount: number): Pence {
  return Math.round(amount * 100)
}

/** Multiply pence by a ratio, rounding half up. */
export function scale(amount: Pence, ratio: number): Pence {
  return Math.floor(amount * ratio + 0.5)
}

export function formatPence(amount: Pence): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  return `${sign}£${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}
