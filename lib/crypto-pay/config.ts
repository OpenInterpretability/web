/**
 * Crypto payments for the Ekbasis console: USDC/USDT sent straight to the OpenInterp treasury wallet.
 * No processor, no fiat, no test mode. Token contracts were checked on-chain (symbol + 6 decimals).
 */

/** EIP-55 checksummed form for display; comparisons use the lowercase TREASURY. */
export const TREASURY_DISPLAY = process.env.CRYPTO_TREASURY ?? "0xf3AE7C060e79988715AAe1fEd96040b194E7B297"
export const TREASURY = TREASURY_DISPLAY.toLowerCase()

export type NetworkId = "polygon" | "arbitrum" | "base" | "ethereum"
export type TokenId = "USDC" | "USDT"

export type Network = {
  id: NetworkId
  name: string
  chainId: number
  confirmations: number
  /** blocks per eth_getLogs call; public RPCs refuse large ranges */
  chunk: number
  explorer: string
  rpcs: string[]
  /** `address` is lowercase (for matching); `display` is the EIP-55 checksummed form. */
  tokens: Partial<Record<TokenId, { address: string; display: string; label: string }>>
}

function rpcs(envName: string, defaults: string[]): string[] {
  const fromEnv = process.env[envName]
  return fromEnv ? fromEnv.split(",").map((s) => s.trim()).filter(Boolean) : defaults
}

export const NETWORKS: Record<NetworkId, Network> = {
  polygon: {
    id: "polygon",
    name: "Polygon",
    chainId: 137,
    confirmations: 64,
    chunk: 3000,
    explorer: "https://polygonscan.com/tx/",
    rpcs: rpcs("RPC_URLS_POLYGON", ["https://rpc-mainnet.matic.quiknode.pro", "https://polygon-bor-rpc.publicnode.com"]),
    tokens: {
      USDC: { address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", display: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", label: "USDC (native)" },
      USDT: { address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", display: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", label: "USDT" },
    },
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum One",
    chainId: 42161,
    confirmations: 40,
    chunk: 3000,
    explorer: "https://arbiscan.io/tx/",
    rpcs: rpcs("RPC_URLS_ARBITRUM", ["https://arb1.arbitrum.io/rpc", "https://arbitrum-one-rpc.publicnode.com"]),
    tokens: {
      USDC: { address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", display: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", label: "USDC (native)" },
      USDT: { address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", display: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", label: "USDT0" },
    },
  },
  base: {
    id: "base",
    name: "Base",
    chainId: 8453,
    confirmations: 20,
    chunk: 3000,
    explorer: "https://basescan.org/tx/",
    rpcs: rpcs("RPC_URLS_BASE", ["https://base-rpc.publicnode.com", "https://mainnet.base.org"]),
    tokens: {
      USDC: { address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", display: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", label: "USDC (native)" },
    },
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    confirmations: 12,
    chunk: 3000,
    explorer: "https://etherscan.io/tx/",
    rpcs: rpcs("RPC_URLS_ETHEREUM", ["https://ethereum-rpc.publicnode.com"]),
    tokens: {
      USDC: { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", display: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", label: "USDC" },
      USDT: { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", display: "0xdAC17F958D2ee523a2206206994597C13D831ec7", label: "USDT" },
    },
  },
}

/** Packs: price in USD (= token units / 1e6, both stablecoins have 6 decimals here) and the input tokens they buy. */
export const PACKS = {
  "pack-5": { usd: 5, tokens: 125_000_000, name: "Starter" },
  "pack-20": { usd: 20, tokens: 500_000_000, name: "Team" },
  "pack-50": { usd: 50, tokens: 1_250_000_000, name: "Business" },
} as const
export type PackId = keyof typeof PACKS

export const DECIMALS = 6
/** The order must be paid within this window (shown to the buyer)... */
export const PAY_WINDOW_MS = 60 * 60 * 1000
/** ...but a payment that lands late is still detected and credited for this long. */
export const SCAN_WINDOW_MS = 24 * 60 * 60 * 1000

export function formatUnits(units: string): string {
  const s = units.padStart(DECIMALS + 1, "0")
  return `${s.slice(0, -DECIMALS)}.${s.slice(-DECIMALS)}`
}
