/** GET ?since=<stream id>: new gateway events (live feed) + the last 60 minutes per minute. */
import { requireAdmin, ajson } from "@/lib/admin"
import { readStream, readCounters, minuteKey } from "@/lib/telemetry"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const since = new URL(request.url).searchParams.get("since")
  const events = await readStream(since && /^\d+-\d+$/.test(since) ? since : null, since ? 200 : 100)
  const now = Date.now()
  const mins = Array.from({ length: 60 }, (_, i) => now - (59 - i) * 60_000)
  const counters = await readCounters(mins.map((t) => `tel:m:${minuteKey(t)}`))
  return ajson({
    events,
    minutes: mins.map((t, i) => ({ t, req: counters[i].req, tok: counters[i].tok, err: counters[i].err })),
  })
}
