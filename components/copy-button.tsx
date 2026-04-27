'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/[0.04] px-2 py-1 text-xs font-medium text-ink-900/70 dark:text-ink-50/70 hover:bg-white dark:hover:bg-white/10 transition-colors"
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }
      }}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" /> copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> copy
        </>
      )}
    </button>
  )
}
