/**
 * Short-lived cache for the API gateway, so a request does not wait on Hexclave three times.
 *
 *   gw:key:<sha256(api key)>  {uid, email, restricted}  60 s   (never the key itself)
 *   gw:ukeys:<uid>            set of cached key hashes          (to invalidate them all at once)
 *   gw:bal:<uid>              the token balance                 5 min, decremented on every debit
 *
 * Anything that changes who a key belongs to, whether the account may call, or the balance invalidates the
 * cache on the spot: revoking a key, suspending or deleting an account, adding credits. If Redis is down the
 * gateway falls back to asking Hexclave, so the cache can make a request faster but never let one through.
 */
import { createHash } from "crypto"
import { pipeline, redis } from "@/lib/crypto-pay/redis"

const IDENT_TTL = 60
const BAL_TTL = 300

export type Ident = { uid: string; email: string | null; restricted: boolean }

export const keyHash = (apiKey: string) => createHash("sha256").update(apiKey).digest("hex")

export async function getIdent(hash: string): Promise<Ident | null> {
  const v = await redis<string | null>("GET", `gw:key:${hash}`)
  return v ? (JSON.parse(v) as Ident) : null
}

export async function putIdent(hash: string, ident: Ident): Promise<void> {
  await pipeline([
    ["SET", `gw:key:${hash}`, JSON.stringify(ident), "EX", IDENT_TTL],
    ["SADD", `gw:ukeys:${ident.uid}`, hash],
    ["EXPIRE", `gw:ukeys:${ident.uid}`, 3600],
  ])
}

export async function getBalance(uid: string): Promise<number | null> {
  const v = await redis<string | null>("GET", `gw:bal:${uid}`)
  return v === null ? null : Number(v)
}

export async function putBalance(uid: string, balance: number): Promise<void> {
  await redis("SET", `gw:bal:${uid}`, Math.trunc(balance), "EX", BAL_TTL)
}

/** Decrement the cached balance only if it is cached (never create a negative entry from nothing). */
export async function debitCachedBalance(uid: string, tokens: number): Promise<void> {
  await redis(
    "EVAL",
    "if redis.call('EXISTS', KEYS[1]) == 1 then return redis.call('DECRBY', KEYS[1], ARGV[1]) end return nil",
    1,
    `gw:bal:${uid}`,
    Math.trunc(tokens),
  )
}

/** Credits changed: the next request reads the balance from Hexclave again. */
export async function invalidateBalance(uid: string): Promise<void> {
  try {
    await redis("DEL", `gw:bal:${uid}`)
  } catch (e) {
    console.warn("[gateway-cache] invalidateBalance failed:", e)
  }
}

/** A key was revoked, or the account was suspended or deleted: forget every cached key and the balance. */
export async function invalidateUser(uid: string): Promise<void> {
  try {
    const hashes = (await redis<string[]>("SMEMBERS", `gw:ukeys:${uid}`)) ?? []
    await pipeline([
      ...hashes.map((h) => ["DEL", `gw:key:${h}`]),
      ["DEL", `gw:ukeys:${uid}`],
      ["DEL", `gw:bal:${uid}`],
    ])
  } catch (e) {
    console.warn("[gateway-cache] invalidateUser failed:", e)
  }
}
