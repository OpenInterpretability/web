/**
 * The live API price (USD per 1M input tokens), set by the admin from /console/admin → Pricing.
 *
 *   cfg:price_per_m_usd   the price, as a decimal string (unset = DEFAULT_PRICE_PER_M)
 *   cfg:price_history     last 200 changes, newest first: {t, old, new, by}
 *
 * Public pages read it through the data cache (60 s, tag PRICE_TAG, invalidated on every change) and never
 * fail on it: if Redis is down they get the last price this instance saw, else the default, and it is logged.
 * Order creation reads it fresh and does fail, so an order is never priced from a fallback.
 */
import { getCached, pipeline, redis, redisConfigured } from "@/lib/crypto-pay/redis"
import { DEFAULT_PRICE_PER_M, priceUnits } from "@/lib/price"

const KEY = "cfg:price_per_m_usd"
const HISTORY = "cfg:price_history"
export const PRICE_TAG = "cfg:price"
export const PRICE_REVALIDATE = 60

export type PriceChange = { t: number; old: number; new: number; by: string }

let lastGood: number | null = null

function parse(raw: string | null): number {
  if (raw === null) return DEFAULT_PRICE_PER_M
  const u = priceUnits(raw)
  if (u === null) throw new Error(`stored price is invalid: ${raw}`)
  return u / 1e4
}

/** The current price for display. `fresh` skips the cache and throws if Redis fails (order creation uses it). */
export async function getPricePerM(opts: { fresh?: boolean } = {}): Promise<number> {
  if (opts.fresh) return parse(await redis<string | null>("GET", KEY))
  if (!redisConfigured()) return DEFAULT_PRICE_PER_M
  try {
    const v = parse(await getCached(KEY, PRICE_REVALIDATE, [PRICE_TAG]))
    lastGood = v
    return v
  } catch (e) {
    const fallback = lastGood ?? DEFAULT_PRICE_PER_M
    console.error(`[pricing] could not read the price, showing ${fallback}: ${e instanceof Error ? e.message : String(e)}`)
    return fallback
  }
}

/** Sets the price (validated: MIN..MAX, at most 4 decimals) and records the change. Returns {old, new}, or an error string. */
export async function setPricePerM(value: unknown, by: string): Promise<{ old: number; new: number } | string> {
  const u = priceUnits(value)
  if (u === null) return "the price must be between $0.005 and $5.00, with at most 4 decimals"
  const next = u / 1e4
  const old = await getPricePerM({ fresh: true })
  const change: PriceChange = { t: Date.now(), old, new: next, by }
  const [set] = await pipeline([
    ["SET", KEY, String(next)],
    ["LPUSH", HISTORY, JSON.stringify(change)],
    ["LTRIM", HISTORY, 0, 199],
  ])
  if (set !== "OK") throw new Error("redis: the price was not saved")
  lastGood = next
  return { old, new: next }
}

export async function priceHistory(count = 50): Promise<PriceChange[]> {
  const raw = (await redis<string[]>("LRANGE", HISTORY, 0, count - 1)) ?? []
  return raw.map((r) => JSON.parse(r) as PriceChange)
}
