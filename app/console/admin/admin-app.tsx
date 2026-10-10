"use client"

import { useState } from "react"
import { Overview } from "./overview"
import { Live } from "./live"
import { Users } from "./users"
import { Coupons } from "./coupons"
import { Orders } from "./orders"
import { Audit } from "./audit"
import { Study } from "./study"

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "live", label: "Live" },
  { id: "users", label: "Users" },
  { id: "coupons", label: "Coupons" },
  { id: "orders", label: "Orders" },
  { id: "study", label: "Study" },
  { id: "audit", label: "Audit log" },
] as const
type Tab = (typeof TABS)[number]["id"]

export function AdminApp() {
  const [tab, setTab] = useState<Tab>("overview")
  return (
    <div className="mt-6">
      <nav className="flex flex-wrap gap-1 border-b border-black/10 dark:border-white/15">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === t.id ? "border-brand-600 text-brand-700 dark:text-brand-300" : "border-transparent text-ink-900/60 hover:text-ink-900 dark:text-ink-50/60 dark:hover:text-ink-50"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-6">
        {tab === "overview" && <Overview />}
        {tab === "live" && <Live />}
        {tab === "users" && <Users />}
        {tab === "coupons" && <Coupons />}
        {tab === "orders" && <Orders />}
        {tab === "study" && <Study />}
        {tab === "audit" && <Audit />}
      </div>
    </div>
  )
}
