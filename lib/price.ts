/**
 * Price math shared by the server and the browser (no Redis here: lib/pricing.ts reads and writes the price).
 * The price is USD per 1M input tokens, at most 4 decimals; balances are in tokens, so a price change only
 * affects how many tokens a new order buys.
 */

export const DEFAULT_PRICE_PER_M = 0.04
export const MIN_PRICE_PER_M = 0.005
export const MAX_PRICE_PER_M = 5
/** Input tokens in a typical check (the figure every "per check" line uses). */
export const TOKENS_PER_CHECK = 1500

/** The price as an integer in 1e-4 USD, or null if it is out of bounds or has more than 4 decimals. */
export function priceUnits(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v.trim()) : typeof v === "number" ? v : NaN
  if (!Number.isFinite(n)) return null
  const u = Math.round(n * 1e4)
  if (Math.abs(n * 1e4 - u) > 1e-6) return null
  if (u < MIN_PRICE_PER_M * 1e4 || u > MAX_PRICE_PER_M * 1e4) return null
  return u
}

/** Input tokens that `usd` buys at `pricePerM`, rounded down. Integer math on 1e-4 USD units, so $5 at $0.04 is exactly 125M. */
export function tokensForUsd(usd: number, pricePerM: number): number {
  return Math.floor((usd * 1e10) / Math.round(pricePerM * 1e4))
}

/** "$0.04", "$0.0375", "$1.50" */
export function formatPrice(pricePerM: number): string {
  return `$${pricePerM.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
}

/** Cost of one typical check, two significant digits: "$0.00006". */
export function perCheckUsd(pricePerM: number): string {
  return `$${Number(((pricePerM * TOKENS_PER_CHECK) / 1e6).toPrecision(2)).toString()}`
}

/** Cost of 1,000 typical checks: "$0.06". */
export function perThousandChecksUsd(pricePerM: number): string {
  return formatPrice((pricePerM * TOKENS_PER_CHECK * 1000) / 1e6)
}

/** "125M", "1.25B" */
export function compactTokens(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumSignificantDigits: 3 }).format(n)
}

/** Typical checks a token amount covers: "83k", "1.2M". */
export function compactChecks(tokens: number): string {
  const c = Math.floor(tokens / TOKENS_PER_CHECK)
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: c >= 1e6 ? 1 : 0 }).format(c).replace("K", "k")
}
