import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Reproducibility Vault — OpenInterp Academy' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'academy')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q3"
      title="Reproducibility Vault"
      blurb="Every Trace, Circuit, Recipe, and Expedition hashed, pinned, and served forever. The interpretability reproducibility crisis, solved. Free for public artifacts; pro tier for private research."
      sections={[
        {
          heading: 'What is stored',
          body:
            'For every artifact: model weights hash, SAE weights hash, prompt, activations, rendered visualization, exact code version. Content-addressable IPFS-style addressing + redundant S3 replication. Signed by the author + timestamped.',
        },
        {
          heading: 'Why free forever',
          body:
            'Reproducibility is a public good. The Vault is cross-subsidized by Watchtower Enterprise revenue. Researchers should never worry that their 2026 paper "may no longer render" in 2030 — we hold the weights, the code, and the UI version.',
        },
        {
          heading: 'Trust model',
          body:
            'We publish a Merkle tree of all vaulted artifacts monthly. Any researcher can verify their artifact hash matches what we serve. If we ever shut down, Vault dumps are published under Apache-2.0 to the public IPFS network — the data outlives the company.',
        },
      ]}
    />
  )
}
