/**
 * Short-lived cache for the API gateway, so a request does not wait on Hexclave three times.
 *
 *   gw:key:<sha256(api key)>  {uid, email, restricted, at}  fresh 60 s, kept 15 min   (never the key itself)
 *   gw:ukeys:<uid>            set of cached key hashes          (to invalidate them all at once)
 *   gw:bal:<uid>              the token balance                 fresh 5 min, kept 15 min, decremented on every debit
 *   gw:balat:<uid>            when the balance was read from Hexclave
 *
 * Stale while revalidate: an entry past its fresh time still answers the request, and the route reads Hexclave again
 * after the response (so a caller who calls once every few minutes does not wait ~2 s on Hexclave every time). A key
 * revoked or an account suspended in Hexclave directly, without going through our routes, is then refused from the
 * second request on, instead of after up to 60 s of requests.
 *
 * Anything that changes who a key belongs to, whether the account may call, or the balance invalidates the
 * cache on the spot: revoking a key, suspending or deleting an account, adding credits. If Redis is down the
 * gateway falls back to asking Hexclave, so the cache can make a request faster but never let one through.
 */
import { createHash } from "crypto"
import { pipeline, redis } from "@/lib/crypto-pay/redis"

const IDENT_FRESH = 60
const BAL_FRESH = 300
const KEEP = 900

export type Ident = { uid: string; email: string | null; restricted: boolean; internal?: boolean }

export const keyHash = (apiKey: string) => createHash("sha256").update(apiKey).digest("hex")

/** The cached identity of a key, and whether it is past its fresh time (then the caller revalidates it). */
export async function getIdent(hash: string): Promise<{ ident: Ident; stale: boolean } | null> {
  const v = await redis<string | null>("GET", `gw:key:${hash}`)
  if (!v) return null
  const { at, ...ident } = JSON.parse(v) as Ident & { at?: number }
  return { ident, stale: !at || Date.now() - at > IDENT_FRESH * 1000 }
}

export async function putIdent(hash: string, ident: Ident): Promise<void> {
  await pipeline([
    ["SET", `gw:key:${hash}`, JSON.stringify({ ...ident, at: Date.now() }), "EX", KEEP],
    ["SADD", `gw:ukeys:${ident.uid}`, hash],
    ["EXPIRE", `gw:ukeys:${ident.uid}`, 3600],
  ])
}

/** The cached balance, and whether it is past its fresh time (then the caller reads Hexclave again after responding). */
export async function getBalance(uid: string): Promise<{ balance: number; stale: boolean } | null> {
  const [v, at] = (await pipeline([
    ["GET", `gw:bal:${uid}`],
    ["GET", `gw:balat:${uid}`],
  ])) as (string | null)[]
  if (v === null || v === undefined) return null
  return { balance: Number(v), stale: !at || Date.now() - Number(at) > BAL_FRESH * 1000 }
}

export async function putBalance(uid: string, balance: number): Promise<void> {
  await pipeline([
    ["SET", `gw:bal:${uid}`, Math.trunc(balance), "EX", KEEP],
    ["SET", `gw:balat:${uid}`, Date.now(), "EX", KEEP],
  ])
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
