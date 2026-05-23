import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Github,
  Library,
  AlertTriangle,
  Activity,
  Mail,
  Calendar,
  Cpu,
} from 'lucide-react'

export const metadata = {
  title: 'AgentGuard — Six Diagnostics for autonomous crypto agents · OpenInterp',
  description:
    'Six Diagnostics applied to LLM agents managing capital on-chain. Manual audits available now ($5K, 1–2 days). Hosted SaaS Q3 2026 — early-access waitlist open. Built by the OpenInterp team (11 studies on Qwen3.6-27B, six walked back, FabricationGuard, agent-probe-guard SDK).',
}

const AUDIT_EMAIL = 'caio@openinterp.org'
const WAITLIST_EMAIL = 'caio@openinterp.org'
const REGISTRY_URL = 'https://github.com/OpenInterpretability/registry'
const PROTOCOL_URL = '/research'
const AGENT_PROBE_GUARD_URL = '/products/agent-probe-guard'

const failureModes = [
  {
    name: 'Probe-detected-then-not',
    desc: 'Probe AUROC 0.86 in dev collapses to 0.30 in production. Env coupling between training env and live inference env breaks the direction.',
    diagnostic: 'env_coupling',
  },
  {
    name: 'Steering looks causal but is softmax shift',
    desc: 'Direction "flips" outputs at α=+5; Δrel after control-token normalization is −0.046. Uniform temperature change, not lever.',
    diagnostic: 'saturation_direction',
  },
  {
    name: 'CoT-redirect causes obfuscation',
    desc: 'Intervention clears 88% of verbalized sabotage but the action still ships sabotaged. Monitor goes blind.',
    diagnostic: 'template_lock (output-CoT decoupling)',
  },
  {
    name: 'Top-k probe hits 0.85 recall from marginal',
    desc: 'Predictive SAE recall@1024 = 0.85 reproduced ±0.03 by shuffled-source baseline. Probe learned marginal, not signal.',
    diagnostic: 'marginal_fit',
  },
] as const

const auditDeliverables = [
  'A signed causal_report.json per the OpenInterp Eval Standard v0.1',
  'A probe_card.json documenting every probe/monitor in your pipeline + the baselines it passed',
  'A written recommendation memo (PDF, ~10 pages) covering the failure modes detected and how to mitigate',
  'Optional: an intervention_trace.json record of any in-loop steering you currently run',
  'Apache-2.0 reproducer scripts so you can re-run the diagnostics yourself',
] as const

export default function AgentGuardPage() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-20 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
            Services live · SaaS waitlist open · Q3 2026
          </div>

          <h1 className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-ink-900 dark:text-white text-balance">
            Six Diagnostics for{' '}
            <span className="gradient-text font-semibold">autonomous crypto agents.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg sm:text-xl text-ink-900/80 dark:text-ink-50/80 text-balance leading-relaxed font-medium">
            Your LLM agent moves capital. Its probes, monitors, and steering interventions
            need to survive their own diagnostics — or they're shipping a false sense of safety.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base text-ink-900/60 dark:text-ink-50/60 text-balance leading-relaxed">
            We built the protocol from 11 studies on Qwen3.6-27B — six walked back.
            We now audit yours.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${AUDIT_EMAIL}?subject=${encodeURIComponent('AgentGuard audit inquiry')}&body=${encodeURIComponent('Hi Caio,\n\nWe operate an LLM agent that handles [briefly describe scope + capital at risk].\n\nWe\'d like to discuss a Six Diagnostics audit.\n\nBest,\n')}`}
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Apply for audit — $5K
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={`mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent('AgentGuard SaaS waitlist')}&body=${encodeURIComponent('Hi Caio,\n\nPlease add me to the AgentGuard SaaS waitlist.\n\nMy agent / use case: [briefly]\n\nThanks,\n')}`}
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/50 dark:bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Join SaaS waitlist (Q3 2026)
            </a>
            <Link
              href={PROTOCOL_URL}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              Read the Six Diagnostics →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Why this exists ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-8">
        <div className="card p-7 sm:p-9 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-brand-500/5" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em]">Four failure modes — already documented</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Your safety stack is shipping at least one of these.
            </h2>
            <p className="mt-3 text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
              We caught all four in our own work on one model.
              Six of our claims walked back. The protocol is what survived.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {failureModes.map((f) => (
                <div key={f.name} className="rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{f.name}</h3>
                    <span className="chip bg-red-500/10 text-red-700 dark:text-red-300 ring-red-500/30 ring-inset text-[10px] shrink-0">
                      {f.diagnostic}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-ink-900/60 dark:text-ink-50/60">
              Full registry of walked-back claims: {' '}
              <a href={`${REGISTRY_URL}/tree/main/failed-replications`} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                openinterp registry/failed-replications →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== Manual audit offer (PRIMARY) ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-16">
        <div className="card p-7 sm:p-9 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-emerald-500/5" aria-hidden="true" />
          <div className="relative">
            <span className="chip bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Live offer · $5,000 · 1–2 days turnaround
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
              Manual Six Diagnostics audit of your agent stack.
            </h2>
            <p className="mt-3 text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              You send us your probes, monitors, and any steering interventions currently in your
              agent's pipeline. We run the Six Diagnostics protocol on each. You receive:
            </p>
            <ul className="mt-5 space-y-2.5">
              {auditDeliverables.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-ink-900/80 dark:text-ink-50/80 leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 font-medium">Price</div>
                <div className="mt-0.5 font-mono text-sm font-semibold">$5,000</div>
              </div>
              <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 font-medium">Turnaround</div>
                <div className="mt-0.5 font-mono text-sm font-semibold">1–2 days</div>
              </div>
              <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 font-medium">License</div>
                <div className="mt-0.5 font-mono text-sm font-semibold">Apache-2.0 reproducers</div>
              </div>
              <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 font-medium">NDA</div>
                <div className="mt-0.5 font-mono text-sm font-semibold">On request</div>
              </div>
            </div>
            <div className="mt-7">
              <a
                href={`mailto:${AUDIT_EMAIL}?subject=${encodeURIComponent('AgentGuard audit inquiry')}&body=${encodeURIComponent('Hi Caio,\n\nWe operate an LLM agent that handles [briefly describe scope + capital at risk].\n\nWe\'d like to discuss a Six Diagnostics audit. Specifically interested in [probes / monitors / steering / all].\n\nBest,\n')}`}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Apply for audit
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SaaS waitlist ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-16">
        <div className="card p-7 sm:p-9 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-pink-500/5" aria-hidden="true" />
          <div className="relative">
            <span className="chip bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30 ring-inset inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Coming Q3 2026 · waitlist open
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
              AgentGuard SaaS — hosted Six Diagnostics endpoint.
            </h2>
            <p className="mt-3 text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Webhook-callable safety gate. Your agent POSTs a candidate action;
              you get back PROCEED / FLAG / BLOCK with a causal_report.json reason.
              Designed for autonomous on-chain agents managing capital. First customers
              recruited from the audit cohort.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 font-medium">Free</div>
                <div className="mt-1 font-mono text-2xl font-semibold">$0</div>
                <div className="mt-0.5 text-xs text-ink-900/55 dark:text-ink-50/55">10 checks/day · evaluation only</div>
              </div>
              <div className="rounded-lg border border-brand-500/30 bg-brand-500/5 p-4">
                <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-400 font-medium">Production</div>
                <div className="mt-1 font-mono text-2xl font-semibold">$99<span className="text-sm text-ink-900/55 dark:text-ink-50/55">/mo</span></div>
                <div className="mt-0.5 text-xs text-ink-900/55 dark:text-ink-50/55">10K checks · 99.5% SLA · webhooks</div>
              </div>
              <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 font-medium">Unlimited</div>
                <div className="mt-1 font-mono text-2xl font-semibold">$999<span className="text-sm text-ink-900/55 dark:text-ink-50/55">/mo</span></div>
                <div className="mt-0.5 text-xs text-ink-900/55 dark:text-ink-50/55">unlimited · custom probes · dedicated</div>
              </div>
            </div>
            <div className="mt-7">
              <a
                href={`mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent('AgentGuard SaaS waitlist')}&body=${encodeURIComponent('Hi Caio,\n\nPlease add me to the AgentGuard SaaS waitlist.\n\nMy agent / use case: [briefly]\nExpected check volume / month: [estimate]\nTier interest: [Free / Production / Unlimited]\n\nThanks,\n')}`}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Join waitlist
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Built on credibility line ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-2">
            Built by
          </span>
          <p className="text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            The OpenInterp team —{' '}
            <Link href="/research" className="text-brand-600 dark:text-brand-400 hover:underline">11 studies</Link>{' '}
            on Qwen3.6-27B since launching OpenInterp in April 2026,{' '}
            <a href={`${REGISTRY_URL}/tree/main/failed-replications`} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">6 honest-negative walk-backs</a>,{' '}
            shipping artifacts:{' '}
            <Link href="/products/fabricationguard" className="text-brand-600 dark:text-brand-400 hover:underline">FabricationGuard</Link>,{' '}
            <Link href={AGENT_PROBE_GUARD_URL} className="text-brand-600 dark:text-brand-400 hover:underline">agent-probe-guard</Link>,{' '}
            <Link href="/probebench" className="text-brand-600 dark:text-brand-400 hover:underline">ProbeBench</Link>,{' '}
            and the{' '}
            <a href={REGISTRY_URL} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">OpenInterp Eval Standard</a>.
            Apache-2.0 throughout.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="chip bg-black/[0.03] dark:bg-white/[0.04] text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10 inline-flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            FabricationGuard · AUROC 0.88 cross-task
          </span>
          <span className="chip bg-black/[0.03] dark:bg-white/[0.04] text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10 inline-flex items-center gap-1.5">
            <Cpu className="h-3 w-3" />
            agent-probe-guard SDK · detect-only by design
          </span>
          <span className="chip bg-black/[0.03] dark:bg-white/[0.04] text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10 inline-flex items-center gap-1.5">
            <Library className="h-3 w-3" />
            Failed-Replication Registry · 6 entries
          </span>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-20 mb-16">
        <div className="card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-emerald-500/5" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              When the capital is real, the diagnostics should be too.
            </h2>
            <p className="mt-3 text-ink-900/70 dark:text-ink-50/70 max-w-2xl mx-auto text-balance leading-relaxed">
              We're recruiting the first cohort of audit customers in 2026 Q2.
              Apply now and you also get priority access to the Q3 SaaS beta.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${AUDIT_EMAIL}?subject=${encodeURIComponent('AgentGuard audit inquiry')}`}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Apply for audit
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Github className="h-4 w-4" /> Browse Eval Standard
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
