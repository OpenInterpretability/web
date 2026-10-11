/** GET: the live price (USD per 1M input tokens) and its change history.  POST {pricePerM}: change it. */
import { revalidateTag } from "next/cache"
import { requireAdmin, ajson, audit, readJson } from "@/lib/admin"
import { getPricePerM, priceHistory, setPricePerM, PRICE_TAG } from "@/lib/pricing"
import { DEFAULT_PRICE_PER_M, MIN_PRICE_PER_M, MAX_PRICE_PER_M } from "@/lib/price"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const [pricePerM, history] = await Promise.all([getPricePerM({ fresh: true }), priceHistory()])
  return ajson({ pricePerM, history, defaultPricePerM: DEFAULT_PRICE_PER_M, min: MIN_PRICE_PER_M, max: MAX_PRICE_PER_M })
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const b = await readJson<{ pricePerM: number | string }>(request)
  const r = await setPricePerM(b.pricePerM, admin.primaryEmail ?? "?")
  if (typeof r === "string") return ajson({ error: r }, 400)
  // Public pages read the price through the data cache: expire it now instead of waiting up to 60 s.
  revalidateTag(PRICE_TAG, { expire: 0 })
  await audit(admin, "price.set", "price_per_m_usd", r)
  return ajson({ pricePerM: r.new, old: r.old })
}
