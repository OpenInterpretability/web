import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const metadata = { title: 'Docs' }

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header>
        <div className="text-xs uppercase tracking-wider text-brand-600 font-medium">Docs</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Quickstart</h1>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Go from zero to your first mechreward-driven GRPO training run in under 10 minutes.
        </p>
      </header>

      <Section title="1 · Install">
        <Code>
{`pip install mechreward
# Optional extras
pip install "mechreward[sae]"    # sae_lens integration
pip install "mechreward[trl]"    # GRPOTrainer hook
pip install "mechreward[all]"`}
        </Code>
      </Section>

      <Section title="2 · Load a validated SAE + feature pack">
        <p className="text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          Every pack in the catalog has passed Stage Gate 1 (ρ ≥ 0.30 on held-out data). You can
          load by short name.
        </p>
        <Code>
{`import mechreward as mr

sae = mr.load_sae(release="caiovicentino1/Qwen3.5-4B-SAE-L18-topk", sae_id="layer_18")

pack = mr.load_pack("qwen3.5-4b/reasoning_pack")
# 10 helpful + 10 harmful features, validated at Spearman ρ=0.540 on 100Q held-out GSM8K`}
        </Code>
      </Section>

      <Section title="3 · Build the reward">
        <Code>
{`reward = mr.FeatureReward.from_pack(
    pack,
    sae=sae,
    aggregation="per_token",  # per-token dense, matches G3 recipe
)

composite = mr.CompositeReward(
    rewards=[
        reward,
        mr.OutcomeReward(verifier=mr.verifiers.gsm8k_exact_match),
    ],
    weights=[0.1, 1.0],  # λ_mech=0.1, validated at G2
)`}
        </Code>
      </Section>

      <Section title="4 · Plug into GRPO">
        <Code>
{`from trl import GRPOConfig, GRPOTrainer

trainer = GRPOTrainer(
    model="Qwen/Qwen3.5-4B",
    args=GRPOConfig(
        output_dir="./out",
        num_generations=4,
        learning_rate=3e-6,   # CRITICAL: Qwen3.5-4B G3 showed 1e-6 stalls
    ),
    train_dataset=gsm8k_train,
    reward_funcs=composite,
)

trainer.train()`}
        </Code>
      </Section>

      <Section title="5 · Stage Gates — don't skip them">
        <p className="text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          Before running a full G3 training, always verify the signal on your setup with G1 and G2.
          Skipping these caused us 15h of wasted compute on Qwen3.5-4B before we fixed the LR.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-ink-900/70 dark:text-ink-50/70">
          <li>
            <strong>G1 (correlation pre-test):</strong> generate 100 baseline responses, compute
            Spearman ρ between R_mech and outcome. Need ρ ≥ 0.30 before proceeding.
          </li>
          <li>
            <strong>G2 (tiny RL ablation):</strong> compare R0 (outcome only) vs R1 (outcome + SAE)
            vs R2 (outcome + raw direction) on 100 steps. Need R1 ≥ R0 + 2 pp.
          </li>
          <li>
            <strong>G3 (full RL):</strong> target ≥80% of benchmark, hack rate {"<"} 30%, MMLU
            regression {"<"} 2 pp.
          </li>
        </ul>
      </Section>

      <Section title="6 · Engineering notes that matter">
        <ul className="list-disc pl-5 space-y-2 text-ink-900/70 dark:text-ink-50/70">
          <li>
            Qwen3.5 / Qwen3.6 are multimodal — use <code className="mono">AutoModelForImageTextToText</code>,
            not CausalLM. Freeze the vision tower.
          </li>
          <li>
            Prompt format must match the SAE feature-discovery distribution. Chat template vs raw
            prompt silently breaks mech signal.
          </li>
          <li>
            <code className="mono">model.disable_adapter()</code> context manager replaces a
            separate ref_model (saves 8 GB).
          </li>
          <li>
            bf16 <code className="mono">log_softmax</code> halves logits memory — needed for
            vocab=248 k on 4 B models.
          </li>
          <li>
            fla + causal-conv1d are not optional on GDN models (10× slower without).
          </li>
        </ul>
      </Section>

      <Section title="Links">
        <ul className="space-y-2 text-ink-900/70 dark:text-ink-50/70">
          <li>
            <Link
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
              href="https://github.com/caiovicentino/mechreward"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub: caiovicentino/mechreward <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <Link
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
              href="https://github.com/caiovicentino/mechreward/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Full README with install stack <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <Link
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
              href="https://github.com/caiovicentino/mechreward/tree/main/notebooks"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reproducible notebooks (G1, G2, G3) <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </li>
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mono text-xs md:text-sm bg-ink-950 text-ink-50 dark:bg-ink-950 rounded-lg p-4 overflow-x-auto leading-relaxed">
      {children}
    </pre>
  )
}
