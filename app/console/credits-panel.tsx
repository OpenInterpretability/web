"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@hexclave/next"
import QRCode from "qrcode"
import { Wallet, Copy, Check, ExternalLink, Loader2, X, Smartphone } from "lucide-react"

const PACKS = [
  { id: "pack-5", name: "Starter", usd: 5, tokens: "125M tokens ≈ 83k checks" },
  { id: "pack-20", name: "Team", usd: 20, tokens: "500M tokens ≈ 333k checks" },
  { id: "pack-50", name: "Business", usd: 50, tokens: "1.25B tokens ≈ 833k checks" },
] as const

const NETWORKS = [
  { id: "polygon", name: "Polygon", tokens: ["USDC", "USDT"], fee: "fee ≈ $0.01" },
  { id: "arbitrum", name: "Arbitrum", tokens: ["USDC", "USDT"], fee: "fee ≈ $0.01" },
  { id: "base", name: "Base", tokens: ["USDC"], fee: "fee ≈ $0.01" },
  { id: "ethereum", name: "Ethereum", tokens: ["USDC", "USDT"], fee: "fee ≈ $1–5" },
] as const

type PublicOrder = {
  id: string
  packId: string
  tokens: number
  network: string
  networkName: string
  chainId: number
  confirmations: number
  token: string
  tokenLabel: string
  tokenAddress: string
  units: string
  treasury: string
  payBy: number
  scanUntil: number
  status: "pending" | "paid" | "expired" | "review"
  txHash: string | null
  explorerUrl: string | null
  paymentUri: string
}

function amount(units: string) {
  const s = units.padStart(7, "0")
  return `${s.slice(0, -6)}.${s.slice(-6)}`
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false)
  return (
    <div>
      <p className="text-xs text-ink-900/50 dark:text-ink-50/50">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-lg bg-black/[0.04] px-3 py-2 font-mono text-sm dark:bg-white/[0.06]">{value}</code>
        <button
          onClick={() => { void navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500) }}
          className="shrink-0 rounded-lg p-2 ring-1 ring-black/10 hover:bg-black/[0.04] dark:ring-white/15 dark:hover:bg-white/[0.06]"
          aria-label={`Copy ${label}`}
        >
          {done ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function PaymentQR({ uri }: { uri: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    QRCode.toString(uri, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } })
      .then((s) => { if (alive) setSvg(s) })
      .catch(() => { if (alive) setSvg(null) })
    return () => { alive = false }
  }, [uri])
  if (!svg) return null
  // The SVG is generated locally by the qrcode library from our own order data.
  return <div className="h-44 w-44 shrink-0 rounded-lg bg-white p-2 ring-1 ring-black/10" dangerouslySetInnerHTML={{ __html: svg }} />
}

export function CreditsPanel() {
  const user = useUser()
  const [balance, setBalance] = useState<number | null>(null)
  const [pack, setPack] = useState<string | null>(null)
  const [network, setNetwork] = useState<string>("polygon")
  const [token, setToken] = useState<string>("USDC")
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [busy, setBusy] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const poll = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadBalance = useCallback(async () => {
    try {
      const r = await fetch("/api/console/credits", { cache: "no-store" })
      if (r.status === 401) { setBalance(null); return }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setBalance((await r.json()).tokens)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  const loadOrder = useCallback(async (id?: string) => {
    const r = await fetch(`/api/console/crypto/order${id ? `?id=${encodeURIComponent(id)}` : ""}`, { cache: "no-store" })
    if (!r.ok) return
    const d = await r.json()
    if (d.order) {
      setOrder(d.order)
      if (d.order.status === "paid") void loadBalance()
    }
  }, [loadBalance])

  useEffect(() => { if (user) { void loadBalance(); void loadOrder() } }, [user, loadBalance, loadOrder])

  // While an order is pending: check the chain every 15 s and tick the countdown.
  useEffect(() => {
    if (poll.current) clearInterval(poll.current)
    if (order?.status !== "pending") return
    const id = order.id
    poll.current = setInterval(() => { void loadOrder(id) }, 15_000)
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => { if (poll.current) clearInterval(poll.current); clearInterval(tick) }
  }, [order?.id, order?.status, loadOrder])

  const tokensFor = NETWORKS.find((n) => n.id === network)?.tokens ?? ["USDC"]
  useEffect(() => { if (!(tokensFor as readonly string[]).includes(token)) setToken("USDC") }, [network, token, tokensFor])

  const create = async () => {
    if (!pack) return
    setBusy(true); setError(null); setNote(null)
    try {
      const r = await fetch("/api/console/crypto/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack, network, token }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
      setOrder(d.order); setPack(null); setTxHash("")
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const claim = async () => {
    if (!order || !txHash.trim()) return
    setBusy(true); setError(null); setNote(null)
    try {
      const r = await fetch("/api/console/crypto/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, txHash: txHash.trim() }),
      })
      const d = await r.json()
      if (d.order) setOrder(d.order)
      if (d.message) setNote(d.message)
      if (!r.ok && !d.order) throw new Error(d.error || `HTTP ${r.status}`)
      if (d.order?.status === "paid") void loadBalance()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (!user) return null

  const left = order ? Math.max(0, order.payBy - now) : 0
  const mm = String(Math.floor(left / 60000)).padStart(2, "0")
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0")

  return (
    <div className="mt-4">
      {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
        <p className="text-sm text-ink-900/60 dark:text-ink-50/60">Current balance</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {balance === null ? "—" : balance.toLocaleString()}{" "}
          <span className="text-sm font-normal text-ink-900/50 dark:text-ink-50/50">input tokens</span>
        </p>
        <p className="mt-1 text-xs text-ink-900/50 dark:text-ink-50/50">
          ≈ {balance === null ? "—" : Math.floor(balance / 1500).toLocaleString()} checks at 1.5k tokens each
        </p>
      </div>

      {order && order.status === "pending" && (
        <div className="mt-4 rounded-xl p-5 ring-1 ring-brand-500/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Send exactly {amount(order.units)} {order.token} on {order.networkName}
              </p>
              <p className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60">
                {order.tokenLabel} · pay within {mm}:{ss} · credited after {order.confirmations} confirmations
              </p>
            </div>
            <button
              onClick={() => setOrder(null)}
              className="rounded-lg p-1.5 text-ink-900/50 hover:bg-black/[0.04] dark:text-ink-50/50 dark:hover:bg-white/[0.06]"
              aria-label="Hide this order"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row">
            <div className="flex flex-col items-center gap-2">
              <PaymentQR uri={order.paymentUri} />
              <a
                href={order.paymentUri}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 sm:hidden"
              >
                <Smartphone className="h-3.5 w-3.5" /> Open in wallet
              </a>
              <p className="max-w-44 text-center text-[11px] leading-snug text-ink-900/50 dark:text-ink-50/50">
                Scan with MetaMask or another EIP-681 wallet. Check the amount and network before confirming.
              </p>
            </div>
            <div className="grid min-w-0 flex-1 content-start gap-3">
              <CopyField label="Amount (exact — the last digits identify your order)" value={amount(order.units)} />
              <CopyField label={`OpenInterp address (${order.networkName} only)`} value={order.treasury} />
              <CopyField label={`${order.token} token contract on ${order.networkName}`} value={order.tokenAddress} />
            </div>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-ink-900/60 dark:text-ink-50/60">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Watching the chain — this page updates by itself.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-ink-900/60 dark:text-ink-50/60">
            <li>Another amount, token or network is not detected. If your exchange deducts its fee from the amount, send from a wallet instead.</li>
            <li>Late payments are still detected for 24 hours.</li>
          </ul>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Already sent? Paste the transaction hash (0x…)"
              className="min-w-0 flex-1 rounded-lg bg-transparent px-3 py-2 font-mono text-sm ring-1 ring-black/10 focus:outline-none focus:ring-brand-500/60 dark:ring-white/15"
            />
            <button
              onClick={() => { void claim() }}
              disabled={busy || !txHash.trim()}
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-ink-900"
            >
              Check transaction
            </button>
          </div>
          {note && <p className="mt-2 text-xs text-ink-900/70 dark:text-ink-50/70">{note}</p>}
        </div>
      )}

      {order && order.status === "paid" && (
        <div className="mt-4 rounded-xl p-5 ring-1 ring-emerald-500/40">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4" /> Paid — {order.tokens.toLocaleString()} input tokens added
          </p>
          {order.explorerUrl && (
            <a href={order.explorerUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
              View the transaction <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {order && (order.status === "expired" || order.status === "review") && (
        <div className="mt-4 rounded-xl p-5 ring-1 ring-amber-500/40">
          <p className="text-sm font-semibold">
            {order.status === "expired" ? "This order expired without a matching payment." : "Payment received — crediting is under manual review."}
          </p>
          <p className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60">
            If you sent funds, write to caio@openinterp.org with the transaction hash and order id {order.id}.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PACKS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setPack(p.id); setError(null) }}
            disabled={busy || order?.status === "pending"}
            className={`rounded-xl p-4 text-left ring-1 hover:ring-brand-500/40 disabled:opacity-50 ${pack === p.id ? "ring-brand-500/60" : "ring-black/10 dark:ring-white/15"}`}
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-semibold">{p.name}</span>
            </div>
            <p className="mt-2 text-xl font-semibold tabular-nums">${p.usd}</p>
            <p className="mt-1 text-xs text-ink-900/50 dark:text-ink-50/50">{p.tokens}</p>
            <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">Pay with USDC or USDT</p>
          </button>
        ))}
      </div>

      {pack && (
        <div className="mt-4 rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
          <p className="text-sm font-semibold">Network</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                onClick={() => setNetwork(n.id)}
                className={`rounded-lg px-3 py-1.5 text-sm ring-1 ${network === n.id ? "bg-brand-500/10 ring-brand-500/60" : "ring-black/10 dark:ring-white/15"}`}
              >
                {n.name} <span className="text-xs text-ink-900/50 dark:text-ink-50/50">{n.fee}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold">Token</p>
          <div className="mt-2 flex gap-2">
            {(["USDC", "USDT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setToken(t)}
                disabled={!(tokensFor as readonly string[]).includes(t)}
                className={`rounded-lg px-3 py-1.5 text-sm ring-1 disabled:opacity-40 ${token === t ? "bg-brand-500/10 ring-brand-500/60" : "ring-black/10 dark:ring-white/15"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { void create() }}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-ink-900"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Get payment details
            </button>
            <button onClick={() => setPack(null)} className="rounded-lg px-4 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15">
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-ink-900/50 dark:text-ink-50/50">
        Payments are USDC or USDT only, sent straight to the OpenInterp wallet on Polygon, Arbitrum, Base or Ethereum.
        No card, no subscription, no minimum. Credits never expire.
      </p>
    </div>
  )
}
