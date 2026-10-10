/** GET ?status=: recent crypto orders (newest first) with the buyer's email. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson } from "@/lib/admin"
import { listOrders } from "@/lib/crypto-pay/orders"
import { NETWORKS } from "@/lib/crypto-pay/config"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const status = new URL(request.url).searchParams.get("status")
  const orders = (await listOrders({ limit: 300 })).filter((o) => !status || o.status === status)
  const app = getHexclaveServerApp()
  const emails = new Map<string, string | null>()
  await Promise.all([...new Set(orders.map((o) => o.userId))].map(async (uid) => emails.set(uid, (await app.getUser(uid).catch(() => null))?.primaryEmail ?? null)))
  return ajson({
    orders: orders.map((o) => ({
      id: o.id, userId: o.userId, email: emails.get(o.userId) ?? null, packId: o.packId, tokens: o.tokens,
      network: o.network, token: o.token, amount: Number(o.units) / 1e6, status: o.status, createdAt: o.createdAt,
      payBy: o.payBy, txHash: o.txHash ?? null, explorerUrl: o.txHash ? `${NETWORKS[o.network].explorer}${o.txHash}` : null,
    })),
  })
}
