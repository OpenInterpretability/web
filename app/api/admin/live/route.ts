/** GET ?since=<stream id>: new gateway events (live feed) + the last 60 minutes per minute. */
import { requireAdmin, ajson } from "@/lib/admin"
import { readStream, readMinutes } from "@/lib/telemetry"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const since = new URL(request.url).searchParams.get("since")
  const events = await readStream(since && /^\d+-\d+$/.test(since) ? since : null, since ? 200 : 100)
  // Per-minute counts come from the stream itself (no per-minute counters are written: lib/telemetry).
  const external = new URL(request.url).searchParams.get("external") === "1"
  return ajson({ events, minutes: await readMinutes(Date.now(), 60, external) })
}
