import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { site } from '@/lib/constants'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    'mechanistic interpretability',
    'MCP server',
    'Model Context Protocol',
    'bring-your-own-agent',
    'sparse autoencoder',
    'SAE',
    'AI safety',
    'LLM interpretability',
    'activation probe',
    'agent-probe-guard',
    'FabricationGuard',
    'ProbeBench',
    'causality protocol',
    'Claude Code MCP',
    'Cursor MCP',
    'trace',
    'circuit',
    'attribution patching',
    'feature steering',
    'open source',
  ],
  authors: [{ name: 'Caio Vicentino', url: site.huggingface }],
  creator: 'Caio Vicentino + OpenInterpretability',
  publisher: 'OpenInterpretability',
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@openinterp',
    creator: '@openinterp',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

/**
 * Inline script runs BEFORE React hydration to apply the theme class
 * synchronously — prevents flash-of-wrong-theme (FOUC) on reload.
 * 1. Read localStorage.theme if user picked one
 * 2. Otherwise honor `prefers-color-scheme`
 * 3. Set `class="dark"` on <html> if dark
 */
const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`.trim()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased text-ink-900 dark:text-ink-50 bg-ink-50 dark:bg-ink-950">
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
