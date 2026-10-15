/**
 * auth.md — agentic registration (https://github.com/workos/auth.md, v0.6), phase 1: only the user-claimed
 * `service_auth` flow. An agent posts the user's email; the user signs in here and types the 6-digit code the agent
 * shows them; the agent then gets a short-lived Ekbasis API key (a Hexclave user key, like the console's) plus a
 * service-signed identity_assertion it re-exchanges for fresh keys. No anonymous registrations, no third-party ID-JAG.
 *
 * Redis (prefix aa:):
 *   aa:reg:<id>         the registration (JSON): 24 h claim window, kept for the assertion's life once issued
 *   aa:claim:<sha256>   claim_token hash -> registration id
 *   aa:view:<sha256>    claim_attempt_token hash -> registration id (the user_code window)
 *   aa:tok:<sha256>     access_token hash -> { reg, uid, keyId } (the key's life), for RFC 7009 revocation
 *   aa:rl:*             fixed-window rate limits
 *   aa:log              capped audit list (registration, claim, token, revoke), with IPs
 * Codes and tokens are stored only as SHA-256 hashes; plaintext is returned once. The service never emails a code.
 */
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto"
import { getJSON, redis, setJSON, underLimit } from "@/lib/crypto-pay/redis"
import { invalidateUser } from "@/lib/gateway-cache"
import { getHexclaveServerApp } from "@/hexclave/server"

export const BASE = "https://openinterp.org"
export const RESOURCE = `${BASE}/api/v1`
export const SCOPES = ["ekbasis.api"]
export const PATHS = {
  identity: "/agent/identity",
  claim: "/agent/identity/claim",
  token: "/oauth2/token",
  revoke: "/oauth2/revoke",
  skill: "/auth.md",
  claimPage: "/claim",
}
export const CLAIM_GRANT = "urn:workos:agent-auth:grant-type:claim"
export const JWT_BEARER_GRANT = "urn:ietf:params:oauth:grant-type:jwt-bearer"

const REG_WINDOW_S = 24 * 3600 // the outer claim window
const USER_CODE_TTL_S = 600 // RFC 8628 user_code window
const INTERVAL_S = 5 // polling interval
const MAX_CODE_TRIES = 5 // wrong codes per attempt before the attempt dies
const MAX_ATTEMPTS = 5 // ceremonies per registration
export const ACCESS_TTL_S = 24 * 3600 // each access_token is a Hexclave key that expires in 24 h
export const ASSERTION_TTL_S = 30 * 24 * 3600 // the agent can renew keys for 30 days, until the user revokes

export type Attempt = { id: string; viewHash: string; codeHash: string; codeExpiresAt: number; tries: number; createdAt: number }
export type Reg = {
  id: string
  email: string
  createdAt: number
  expiresAt: number
  status: "pending" | "claimed" | "issued" | "revoked"
  attempt: Attempt | null
  attempts: number
  userId?: string
  claimedAt?: number
  lastPollAt?: number
  keyId?: string
  jti?: string
  ip?: string | null
  ua?: string | null
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")
const b64u = (b: Buffer) => b.toString("base64url")
const token = (prefix: string) => prefix + b64u(randomBytes(24))
const newUserCode = () => randomInt(0, 1_000_000).toString().padStart(6, "0")
export const now = () => Date.now()

export function normEmail(v: unknown): string | null {
  if (typeof v !== "string") return null
  const e = v.trim().toLowerCase()
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null
}

export function clientIp(req: Request): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null
}

export async function audit(event: string, data: Record<string, unknown>): Promise<void> {
  try {
    await redis("LPUSH", "aa:log", JSON.stringify({ t: now(), event, ...data }))
    await redis("LTRIM", "aa:log", 0, 4999)
  } catch (e) {
    console.warn("[agent-auth] audit failed:", e)
  }
}

export async function limited(key: string, limit: number, windowS: number): Promise<boolean> {
  try {
    return !(await underLimit(`aa:rl:${key}`, limit, windowS))
  } catch {
    return false // fail open on store errors, as the spec suggests
  }
}

export const getReg = (id: string) => getJSON<Reg>(`aa:reg:${id}`)
export async function putReg(reg: Reg): Promise<void> {
  const until = reg.status === "issued" || reg.status === "revoked" ? reg.claimedAt! + ASSERTION_TTL_S * 1000 : reg.expiresAt
  await setJSON(`aa:reg:${reg.id}`, reg, Math.max(60, Math.ceil((until - now()) / 1000) + 3600))
}
export async function regByClaimToken(claimToken: string): Promise<Reg | null> {
  const id = await redis<string | null>("GET", `aa:claim:${sha256(claimToken)}`)
  return id ? getReg(id) : null
}
export async function regByAttemptToken(attemptToken: string): Promise<Reg | null> {
  const id = await redis<string | null>("GET", `aa:view:${sha256(attemptToken)}`)
  if (!id) return null
  const reg = await getReg(id)
  return reg && reg.attempt?.viewHash === sha256(attemptToken) ? reg : null
}

/** A fresh ceremony (claim_attempt_token + user_code); the previous attempt's link stops working. */
export async function newAttempt(reg: Reg): Promise<{ attemptToken: string; userCode: string }> {
  if (reg.attempt) await redis("DEL", `aa:view:${reg.attempt.viewHash}`)
  const attemptToken = token("cat_")
  const userCode = newUserCode()
  reg.attempt = {
    id: token("cla_").slice(0, 20),
    viewHash: sha256(attemptToken),
    codeHash: sha256(userCode),
    codeExpiresAt: now() + USER_CODE_TTL_S * 1000,
    tries: 0,
    createdAt: now(),
  }
  reg.attempts += 1
  await redis("SET", `aa:view:${reg.attempt.viewHash}`, reg.id, "EX", USER_CODE_TTL_S)
  return { attemptToken, userCode }
}

export async function createRegistration(email: string, ip: string | null, ua: string | null) {
  const claimToken = token("clm_")
  const reg: Reg = {
    id: token("reg_").slice(0, 28),
    email,
    createdAt: now(),
    expiresAt: now() + REG_WINDOW_S * 1000,
    status: "pending",
    attempt: null,
    attempts: 0,
    ip,
    ua: ua?.slice(0, 160) ?? null,
  }
  const { attemptToken, userCode } = await newAttempt(reg)
  await redis("SET", `aa:claim:${sha256(claimToken)}`, reg.id, "EX", REG_WINDOW_S)
  await putReg(reg)
  return { reg, claimToken, attemptToken, userCode }
}

export function ceremonyBlock(reg: Reg, attemptToken: string, userCode: string) {
  return {
    user_code: userCode,
    expires_in: Math.max(0, Math.floor((reg.attempt!.codeExpiresAt - now()) / 1000)),
    verification_uri: `${BASE}${PATHS.claimPage}?claim_attempt_token=${encodeURIComponent(attemptToken)}`,
    interval: INTERVAL_S,
  }
}

export const canReattempt = (reg: Reg) => reg.attempts < MAX_ATTEMPTS
export const INTERVAL = INTERVAL_S

/** The user typed a code on /claim. */
export async function confirmCode(
  reg: Reg,
  code: string,
  user: { id: string; email: string | null; verified: boolean },
): Promise<"ok" | "expired" | "wrong" | "too_many" | "wrong_account" | "done"> {
  if (reg.status !== "pending") return "done"
  if (now() > reg.expiresAt || !reg.attempt || now() > reg.attempt.codeExpiresAt) return "expired"
  if (!user.email || !user.verified || user.email.toLowerCase() !== reg.email) return "wrong_account"
  if (reg.attempt.tries >= MAX_CODE_TRIES) return "too_many"
  const a = Buffer.from(sha256(code.replace(/\D/g, "")))
  const b = Buffer.from(reg.attempt.codeHash)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    reg.attempt.tries += 1
    if (reg.attempt.tries >= MAX_CODE_TRIES) await redis("DEL", `aa:view:${reg.attempt.viewHash}`)
    await putReg(reg)
    return reg.attempt.tries >= MAX_CODE_TRIES ? "too_many" : "wrong"
  }
  await redis("DEL", `aa:view:${reg.attempt.viewHash}`)
  reg.status = "claimed"
  reg.userId = user.id
  reg.claimedAt = now()
  await putReg(reg)
  return "ok"
}

// ------------------------------------------------------------------ identity_assertion (HS256, service-signed)

function secret(): Buffer | null {
  const s = process.env.AGENT_AUTH_SECRET
  return s && s.length >= 32 ? Buffer.from(s) : null
}
export const configured = () => secret() !== null

export function signAssertion(reg: Reg, email: string): { jwt: string; expiresAt: Date; jti: string } {
  const key = secret()
  if (!key) throw new Error("AGENT_AUTH_SECRET not set")
  const iat = Math.floor(now() / 1000)
  const exp = Math.floor(reg.claimedAt! / 1000) + ASSERTION_TTL_S
  const jti = b64u(randomBytes(16))
  const header = b64u(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })))
  const payload = b64u(Buffer.from(JSON.stringify({
    iss: BASE, aud: RESOURCE, sub: reg.id, uid: reg.userId, email, email_verified: true, scope: SCOPES.join(" "), iat, exp, jti,
  })))
  const sig = b64u(createHmac("sha256", key).update(`${header}.${payload}`).digest())
  return { jwt: `${header}.${payload}.${sig}`, expiresAt: new Date(exp * 1000), jti }
}

export function verifyAssertion(jwt: string): { ok: true; sub: string; jti: string } | { ok: false; reason: string } {
  const key = secret()
  if (!key) return { ok: false, reason: "server not configured" }
  const parts = jwt.split(".")
  if (parts.length !== 3) return { ok: false, reason: "malformed assertion" }
  const want = createHmac("sha256", key).update(`${parts[0]}.${parts[1]}`).digest()
  const got = Buffer.from(parts[2], "base64url")
  if (got.length !== want.length || !timingSafeEqual(got, want)) return { ok: false, reason: "bad signature" }
  let c: { iss?: string; aud?: string; sub?: string; exp?: number; jti?: string }
  try {
    c = JSON.parse(Buffer.from(parts[1], "base64url").toString())
  } catch {
    return { ok: false, reason: "malformed assertion" }
  }
  if (c.iss !== BASE || c.aud !== RESOURCE) return { ok: false, reason: "wrong issuer or audience" }
  if (!c.exp || c.exp * 1000 < now()) return { ok: false, reason: "assertion expired" }
  if (!c.sub || !c.jti) return { ok: false, reason: "malformed assertion" }
  return { ok: true, sub: c.sub, jti: c.jti }
}

// ------------------------------------------------------------------ access tokens = Hexclave user API keys

/** A 24 h Ekbasis API key on the user's account, recorded so RFC 7009 revocation can find it. */
export async function issueKey(reg: Reg): Promise<{ token: string; expiresIn: number }> {
  const user = await getHexclaveServerApp().getUser(reg.userId!)
  if (!user) throw new Error("user not found")
  const expiresAt = new Date(now() + ACCESS_TTL_S * 1000)
  const key = await user.createApiKey({ description: `Agent via auth.md (${reg.id.slice(0, 12)})`, expiresAt })
  reg.keyId = key.id
  await redis("SET", `aa:tok:${sha256(key.value)}`, JSON.stringify({ reg: reg.id, uid: user.id, keyId: key.id }), "EX", ACCESS_TTL_S + 3600)
  return { token: key.value, expiresIn: ACCESS_TTL_S }
}

/** The user revoked this registration's key in the console: the registration is dead (the kill switch). */
export async function keyRevokedByUser(reg: Reg): Promise<boolean> {
  if (!reg.keyId || !reg.userId) return false
  const user = await getHexclaveServerApp().getUser(reg.userId)
  if (!user) return true
  const keys = await user.listApiKeys()
  const k = keys.find((x) => x.id === reg.keyId)
  return Boolean(k && k.manuallyRevokedAt)
}

export async function revokeAccessToken(accessToken: string): Promise<boolean> {
  const rec = await getJSON<{ reg: string; uid: string; keyId: string }>(`aa:tok:${sha256(accessToken)}`)
  if (!rec) return false
  const user = await getHexclaveServerApp().getUser(rec.uid)
  const key = user ? (await user.listApiKeys()).find((k) => k.id === rec.keyId) : undefined
  // The agent revoking its own access_token (RFC 7009) is not the user's kill switch: unlink the key from the
  // registration first, so the identity_assertion stays valid and Step 5 can mint a fresh key.
  const reg = await getReg(rec.reg)
  if (reg && reg.keyId === rec.keyId) {
    reg.keyId = undefined
    await putReg(reg)
  }
  if (key && !key.manuallyRevokedAt) await key.revoke()
  await invalidateUser(rec.uid)
  await redis("DEL", `aa:tok:${sha256(accessToken)}`)
  return true
}

export function oauthJson(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache", ...extra } })
}
