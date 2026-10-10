/**
 * A limit on how hard the gateway may drive the Ekbasis model server, built so that agents get fast answers.
 *
 * The model server shares its GPUs with another production service, so SUSTAINED load on Ekbasis slows that service
 * down (measured 10 Oct 2026: four parallel clients cut its speed per request from ~25–110 to ~3–9 tokens/s). Single
 * checks and short bursts are not the problem, so they are not delayed:
 *
 *   - a token bucket refills at EKBASIS_TOKENS_PER_SEC (default 1,500 input tokens/s) up to EKBASIS_BURST_TOKENS
 *     (default 30,000). A request goes through at once while the bucket is above zero, and its input tokens are taken
 *     from the bucket afterwards (it may go below zero). Only sustained load above the rate waits;
 *   - at most EKBASIS_MAX_INFLIGHT requests (default 2, what the model server runs at once) are in flight;
 *   - our own accounts (serverMetadata.internal: studies, benchmarks) yield to customers: they go through only while
 *     the bucket is above half full, at most EKBASIS_INTERNAL_TOKENS_PER_SEC (default 600) through a lane of their own,
 *     one at a time, and may wait up to EKBASIS_INTERNAL_MAX_WAIT_MS (default 120 s).
 *
 * State lives in Redis (shared by every serverless instance). A customer request waits at most EKBASIS_MAX_WAIT_MS
 * (default 20 s), then gets 429 with Retry-After, which the client reports as "cannot foresee" (fail closed). If Redis
 * is down the gateway does not limit (it never blocks calls because of its own store), and says so in the logs.
 */
import { redis } from "@/lib/crypto-pay/redis"

const INFLIGHT = "gw:ekb:slots"
const BUCKET = "gw:ekb:bucket"
const LANE = "gw:ekb:internal"
const MAX_INFLIGHT = Math.max(1, Number(process.env.EKBASIS_MAX_INFLIGHT ?? 2))
const RATE = Math.max(1, Number(process.env.EKBASIS_TOKENS_PER_SEC ?? 1500))
const BURST = Math.max(1, Number(process.env.EKBASIS_BURST_TOKENS ?? 30_000))
export const MAX_WAIT_MS = Math.max(0, Number(process.env.EKBASIS_MAX_WAIT_MS ?? 20_000))
const INTERNAL_RATE = Math.max(1, Number(process.env.EKBASIS_INTERNAL_TOKENS_PER_SEC ?? 600))
const INTERNAL_MAX_WAIT_MS = Math.max(0, Number(process.env.EKBASIS_INTERNAL_MAX_WAIT_MS ?? 120_000))
const HOLD_MS = 60_000 // an in-flight entry whose request never released it frees itself after this long

// KEYS: inflight zset, bucket hash, lane zset. ARGV: now, id, maxInflight, rate, burst, minLevel, internal(0/1).
// Refill the bucket; admit if a slot is free, the bucket is above minLevel and (internal) the lane is free.
const ACQUIRE = `
local now = tonumber(ARGV[1])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now)
redis.call('ZREMRANGEBYSCORE', KEYS[3], '-inf', now)
local level = tonumber(redis.call('HGET', KEYS[2], 'level') or ARGV[5])
local ts = tonumber(redis.call('HGET', KEYS[2], 'ts') or now)
level = math.min(tonumber(ARGV[5]), level + (now - ts) * tonumber(ARGV[4]) / 1000)
redis.call('HSET', KEYS[2], 'level', level, 'ts', now)
redis.call('PEXPIRE', KEYS[2], 3600000)
if redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[3]) then return 0 end
if level <= tonumber(ARGV[6]) then return 0 end
if ARGV[7] == '1' and redis.call('ZCARD', KEYS[3]) >= 1 then return 0 end
redis.call('ZADD', KEYS[1], now + ${HOLD_MS}, ARGV[2])
redis.call('PEXPIRE', KEYS[1], 120000)
if ARGV[7] == '1' then
  redis.call('ZADD', KEYS[3], now + ${HOLD_MS}, ARGV[2])
  redis.call('PEXPIRE', KEYS[3], 120000)
end
return 1`

// KEYS: inflight, bucket, lane. ARGV: now, id, tokens, rate, burst, laneUntil (0 = not internal).
const RELEASE = `
local now = tonumber(ARGV[1])
redis.call('ZREM', KEYS[1], ARGV[2])
local level = tonumber(redis.call('HGET', KEYS[2], 'level') or ARGV[5])
local ts = tonumber(redis.call('HGET', KEYS[2], 'ts') or now)
level = math.min(tonumber(ARGV[5]), level + (now - ts) * tonumber(ARGV[4]) / 1000) - tonumber(ARGV[3])
redis.call('HSET', KEYS[2], 'level', level, 'ts', now)
redis.call('PEXPIRE', KEYS[2], 3600000)
if tonumber(ARGV[6]) > now then redis.call('ZADD', KEYS[3], 'XX', ARGV[6], ARGV[2]) else redis.call('ZREM', KEYS[3], ARGV[2]) end
return level`

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type Slot = { id: string; internal: boolean; waitedMs: number } | { id: null; waitedMs: number; busy: boolean }

/** Wait for a slot. `busy: true` means none in time; `id: null, busy: false` means the limiter is off. */
export async function acquireSlot(id: string, internal = false): Promise<Slot> {
  const t0 = Date.now()
  const deadline = t0 + (internal ? INTERNAL_MAX_WAIT_MS : MAX_WAIT_MS)
  const minLevel = internal ? BURST / 2 : 0
  // Customers poll fast (their wait is the latency an agent feels); our own studies poll once a second, which keeps
  // Redis commands low during long batch runs.
  let delay = internal ? 1000 : 50
  const maxDelay = internal ? 1000 : 300
  for (;;) {
    try {
      const ok = await redis<number>("EVAL", ACQUIRE, 3, INFLIGHT, BUCKET, LANE, Date.now(), id, MAX_INFLIGHT, RATE,
        BURST, minLevel, internal ? 1 : 0)
      if (ok === 1) return { id, internal, waitedMs: Date.now() - t0 }
    } catch (e) {
      console.warn("[gateway-limit] Redis unavailable, not limiting:", e)
      return { id: null, waitedMs: Date.now() - t0, busy: false }
    }
    if (Date.now() + delay > deadline) return { id: null, waitedMs: Date.now() - t0, busy: true }
    await sleep(delay + Math.floor(Math.random() * 30))
    delay = Math.min(delay * 1.5, maxDelay)
  }
}

/** After the request: free the in-flight slot and take its input tokens from the bucket; an internal request keeps its
 * lane until tokens / EKBASIS_INTERNAL_TOKENS_PER_SEC has passed since it was admitted. */
export async function releaseSlot(id: string, inputTokens: number, internal = false, acquiredAt = Date.now()): Promise<void> {
  const tokens = Math.max(0, inputTokens)
  const laneUntil = internal ? acquiredAt + Math.round((1000 * tokens) / INTERNAL_RATE) : 0
  try {
    await redis("EVAL", RELEASE, 3, INFLIGHT, BUCKET, LANE, Date.now(), id, tokens, RATE, BURST, laneUntil)
  } catch (e) {
    console.warn("[gateway-limit] release failed (the slot frees itself):", e)
  }
}
