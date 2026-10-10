/**
 * An in-memory fake of the Upstash Redis REST API, installed by intercepting `fetch` for one URL.
 * Covers the commands this codebase sends (POST <url> with ["CMD", ...args], and POST <url>/pipeline with a
 * list of them), with Upstash's reply shapes. Expiry follows `clock.now`, so tests can move time.
 *
 *   const kv = installMockUpstash("http://kv.test")   // then set KV_REST_API_URL/TOKEN and import the libs
 */
type Entry =
  | { type: "string"; v: string }
  | { type: "list"; v: string[] }
  | { type: "hash"; v: Map<string, string> }
  | { type: "set"; v: Set<string> }
  | { type: "zset"; v: Map<string, number> }
  | { type: "stream"; v: { id: string; fields: string[] }[] }

export class MockRedis {
  data = new Map<string, Entry>()
  exp = new Map<string, number>()
  clock = { now: Date.now() }
  calls: string[][] = []
  private seq = 0

  private live(key: string): Entry | undefined {
    const e = this.exp.get(key)
    if (e !== undefined && e <= this.clock.now) {
      this.data.delete(key)
      this.exp.delete(key)
    }
    return this.data.get(key)
  }
  private get<T extends Entry["type"]>(key: string, type: T, create: boolean): Extract<Entry, { type: T }> | undefined {
    let e = this.live(key)
    if (!e) {
      if (!create) return undefined
      const init: Record<Entry["type"], () => Entry> = {
        string: () => ({ type: "string", v: "" }),
        list: () => ({ type: "list", v: [] }),
        hash: () => ({ type: "hash", v: new Map() }),
        set: () => ({ type: "set", v: new Set() }),
        zset: () => ({ type: "zset", v: new Map() }),
        stream: () => ({ type: "stream", v: [] }),
      }
      e = init[type]()
      this.data.set(key, e)
    }
    if (e.type !== type) throw new Error("WRONGTYPE Operation against a key holding the wrong kind of value")
    return e as Extract<Entry, { type: T }>
  }
  private range<T>(arr: T[], start: number, stop: number): T[] {
    const n = arr.length
    let s = start < 0 ? n + start : start
    let e = stop < 0 ? n + stop : stop
    s = Math.max(0, s)
    e = Math.min(n - 1, e)
    return s > e ? [] : arr.slice(s, e + 1)
  }
  private streamCmp(a: string, b: string) {
    const [am, as] = a.split("-").map(Number)
    const [bm, bs] = b.split("-").map(Number)
    return am - bm || as - bs
  }

  exec(command: (string | number)[]): unknown {
    const cmd = command.map(String)
    this.calls.push(cmd)
    const [name, ...a] = cmd
    const C = name.toUpperCase()
    switch (C) {
      case "SET": {
        const [key, val, ...opts] = a
        let nx = false
        let ex: number | null = null
        for (let i = 0; i < opts.length; i++) {
          const o = opts[i].toUpperCase()
          if (o === "NX") nx = true
          else if (o === "EX") ex = Number(opts[++i])
        }
        if (nx && this.live(key)) return null
        this.data.set(key, { type: "string", v: val })
        if (ex !== null) this.exp.set(key, this.clock.now + ex * 1000)
        else this.exp.delete(key)
        return "OK"
      }
      case "GET": {
        const e = this.get(a[0], "string", false)
        return e ? e.v : null
      }
      case "INCR":
      case "DECR": {
        const e = this.live(a[0])
        const n = (e && e.type === "string" ? Number(e.v) : 0) + (C === "INCR" ? 1 : -1)
        this.data.set(a[0], { type: "string", v: String(n) })
        return n
      }
      case "EXPIRE": {
        if (!this.live(a[0])) return 0
        this.exp.set(a[0], this.clock.now + Number(a[1]) * 1000)
        return 1
      }
      case "DEL": {
        let n = 0
        for (const k of a) if (this.live(k)) { this.data.delete(k); this.exp.delete(k); n++ }
        return n
      }
      case "LPUSH": {
        const e = this.get(a[0], "list", true)!
        for (const v of a.slice(1)) e.v.unshift(v)
        return e.v.length
      }
      case "LTRIM": {
        const e = this.get(a[0], "list", false)
        if (e) e.v = this.range(e.v, Number(a[1]), Number(a[2]))
        return "OK"
      }
      case "LRANGE": {
        const e = this.get(a[0], "list", false)
        return e ? this.range(e.v, Number(a[1]), Number(a[2])) : []
      }
      case "HINCRBY": {
        const e = this.get(a[0], "hash", true)!
        const n = Number(e.v.get(a[1]) ?? 0) + Number(a[2])
        e.v.set(a[1], String(n))
        return n
      }
      case "HSET": {
        const e = this.get(a[0], "hash", true)!
        let added = 0
        for (let i = 1; i < a.length; i += 2) { if (!e.v.has(a[i])) added++; e.v.set(a[i], a[i + 1]) }
        return added
      }
      case "HSETNX": {
        const e = this.get(a[0], "hash", true)!
        if (e.v.has(a[1])) return 0
        e.v.set(a[1], a[2])
        return 1
      }
      case "HGETALL": {
        const e = this.get(a[0], "hash", false)
        return e ? [...e.v.entries()].flat() : []
      }
      case "SADD": {
        const e = this.get(a[0], "set", true)!
        let n = 0
        for (const v of a.slice(1)) if (!e.v.has(v)) { e.v.add(v); n++ }
        return n
      }
      case "SREM": {
        const e = this.get(a[0], "set", false)
        let n = 0
        if (e) for (const v of a.slice(1)) if (e.v.delete(v)) n++
        return n
      }
      case "SMEMBERS": {
        const e = this.get(a[0], "set", false)
        return e ? [...e.v] : []
      }
      case "SCARD": {
        const e = this.get(a[0], "set", false)
        return e ? e.v.size : 0
      }
      case "ZADD": {
        const e = this.get(a[0], "zset", true)!
        let n = 0
        for (let i = 1; i < a.length; i += 2) { if (!e.v.has(a[i + 1])) n++; e.v.set(a[i + 1], Number(a[i])) }
        return n
      }
      case "ZINCRBY": {
        const e = this.get(a[0], "zset", true)!
        const s = (e.v.get(a[2]) ?? 0) + Number(a[1])
        e.v.set(a[2], s)
        return String(s)
      }
      case "ZREVRANGE": {
        const e = this.get(a[0], "zset", false)
        if (!e) return []
        const sorted = [...e.v.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? 1 : -1))
        const part = this.range(sorted, Number(a[1]), Number(a[2]))
        return a[3]?.toUpperCase() === "WITHSCORES" ? part.flatMap(([m, s]) => [m, String(s)]) : part.map(([m]) => m)
      }
      case "XADD": {
        const key = a[0]
        let i = 1
        let maxlen: number | null = null
        if (a[i]?.toUpperCase() === "MAXLEN") {
          i++
          if (a[i] === "~" || a[i] === "=") i++
          maxlen = Number(a[i++])
        }
        const idArg = a[i++]
        const e = this.get(key, "stream", true)!
        const id = idArg === "*" ? `${this.clock.now}-${this.seq++}` : idArg
        e.v.push({ id, fields: a.slice(i) })
        if (maxlen !== null && e.v.length > maxlen) e.v = e.v.slice(e.v.length - maxlen)
        return id
      }
      case "XRANGE":
      case "XREVRANGE": {
        const e = this.get(a[0], "stream", false)
        if (!e) return []
        let [lo, hi] = C === "XRANGE" ? [a[1], a[2]] : [a[2], a[1]]
        const count = a[3]?.toUpperCase() === "COUNT" ? Number(a[4]) : Infinity
        const inRange = (id: string) => {
          const lx = lo.startsWith("(")
          const hx = hi.startsWith("(")
          const l = lx ? lo.slice(1) : lo
          const h = hx ? hi.slice(1) : hi
          const okLo = l === "-" || (lx ? this.streamCmp(id, l) > 0 : this.streamCmp(id, l) >= 0)
          const okHi = h === "+" || (hx ? this.streamCmp(id, h) < 0 : this.streamCmp(id, h) <= 0)
          return okLo && okHi
        }
        let items = e.v.filter((x) => inRange(x.id))
        if (C === "XREVRANGE") items = items.reverse()
        return items.slice(0, count).map((x) => [x.id, x.fields])
      }
      default:
        throw new Error(`ERR mock: unsupported command '${name}'`)
    }
  }
}

/** Replaces global fetch for requests to `url` (and `url/pipeline`); everything else goes to the real fetch. */
export function installMockUpstash(url: string, token = "test-token"): MockRedis {
  const kv = new MockRedis()
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const u = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
    if (u !== url && u !== `${url}/pipeline`) return realFetch(input, init)
    const auth = new Headers(init?.headers).get("authorization")
    if (auth !== `Bearer ${token}`) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const body = JSON.parse(String(init?.body ?? "null")) as string[] | string[][]
    if (u.endsWith("/pipeline")) {
      const out = (body as string[][]).map((c) => {
        try {
          return { result: kv.exec(c) }
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) }
        }
      })
      return Response.json(out)
    }
    try {
      return Response.json({ result: kv.exec(body as string[]) })
    } catch (e) {
      return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 })
    }
  }) as typeof fetch
  process.env.KV_REST_API_URL = url
  process.env.KV_REST_API_TOKEN = token
  return kv
}
