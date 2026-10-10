/**
 * A global limit on how hard the gateway may drive the Ekbasis model server.
 *
 * The model server shares its GPUs with another production service, so sustained load on Ekbasis slows that service
 * down (measured 10 Oct 2026: four parallel clients cut its speed per request from ~25–110 to ~3–9 tokens/s). This
 * keeps Ekbasis to a bounded share of the GPUs, whoever is calling:
 *
 *   - at most EKBASIS_MAX_INFLIGHT requests reach the model server at once (default 1);
 *   - after a request, its slot stays taken for tokens / EKBASIS_TOKENS_PER_SEC seconds (default 1,500 tokens/s), so
 *     the average rate of input tokens cannot exceed that, however the calls arrive.
 *
 * Slots live in one Redis sorted set (member = request id, score = when the slot frees), shared by every serverless
 * instance. A caller waits up to EKBASIS_MAX_WAIT_MS (default 20 s) for a slot, then gets 429 with Retry-After, which
 * the client reports as "cannot foresee" (fail closed). If Redis is down the gateway does not limit (it never blocks
 * calls because of its own store), and says so in the logs.
 */
import { redis } from "@/lib/crypto-pay/redis"

const KEY = "gw:ekb:slots"
const MAX_INFLIGHT = Math.max(1, Number(process.env.EKBASIS_MAX_INFLIGHT ?? 1))
const TOKENS_PER_SEC = Math.max(1, Number(process.env.EKBASIS_TOKENS_PER_SEC ?? 1500))
export const MAX_WAIT_MS = Math.max(0, Number(process.env.EKBASIS_MAX_WAIT_MS ?? 20_000))
const HOLD_MS = 60_000 // a slot whose request never released it frees itself after this long
const MAX_COOLDOWN_MS = 30_000

// Drop freed slots, then take one if fewer than ARGV[1] are taken. ARGV: limit, now, until, id.
const ACQUIRE = `
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[2])
if redis.call('ZCARD', KEYS[1]) < tonumber(ARGV[1]) then
  redis.call('ZADD', KEYS[1], ARGV[3], ARGV[4])
  redis.call('PEXPIRE', KEYS[1], 120000)
  return 1
end
return 0`

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type Slot = { id: string; waitedMs: number } | { id: null; waitedMs: number; busy: boolean }

/** Wait for a slot. `busy: true` means none freed within MAX_WAIT_MS; `id: null, busy: false` means the limiter is off. */
export async function acquireSlot(id: string): Promise<Slot> {
  const t0 = Date.now()
  let delay = 100
  for (;;) {
    const now = Date.now()
    try {
      const ok = await redis<number>("EVAL", ACQUIRE, 1, KEY, MAX_INFLIGHT, now, now + HOLD_MS, id)
      if (ok === 1) return { id, waitedMs: now - t0 }
    } catch (e) {
      console.warn("[gateway-limit] Redis unavailable, not limiting:", e)
      return { id: null, waitedMs: Date.now() - t0, busy: false }
    }
    if (Date.now() - t0 + delay > MAX_WAIT_MS) return { id: null, waitedMs: Date.now() - t0, busy: true }
    await sleep(delay + Math.floor(Math.random() * 50))
    delay = Math.min(delay * 1.5, 1000)
  }
}

/** Free the slot after the request, keeping it taken for the cool-down its input tokens earn. */
export async function releaseSlot(id: string, inputTokens: number): Promise<void> {
  const cooldown = Math.min(MAX_COOLDOWN_MS, Math.round((1000 * Math.max(0, inputTokens)) / TOKENS_PER_SEC))
  try {
    if (cooldown > 0) await redis("ZADD", KEY, "XX", Date.now() + cooldown, id)
    else await redis("ZREM", KEY, id)
  } catch (e) {
    console.warn("[gateway-limit] release failed (the slot frees itself):", e)
  }
}
