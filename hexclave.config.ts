import type { HexclaveConfig } from "@hexclave/next";

/**
 * Hexclave config for the OpenInterp console (keys, credits, usage).
 * Payment model: prepaid credit packs — 1 USD buys 25M input tokens at $0.04/1M.
 * Credits never expire; out of credits the Ekbasis guard fails closed.
 */
export const config: HexclaveConfig = {
  apps: {
    installed: {
      authentication: { enabled: true },
      "api-keys": { enabled: true },
      payments: { enabled: true },
      emails: { enabled: true },
      analytics: { enabled: true },
    },
  },
  auth: {
    password: { allowSignIn: false },
    otp: { allowSignIn: true },
    passkey: { allowSignIn: false },
    oauth: {
      providers: {
        google: { type: "google", allowSignIn: true, allowConnectedAccounts: true },
        github: { type: "github", allowSignIn: true, allowConnectedAccounts: true },
      },
    },
  },
  payments: {
    productLines: {
      credits: { displayName: "Credit packs", customerType: "user" },
    },
    items: {
      tokens: { displayName: "Input tokens", customerType: "user" },
    },
    products: {
      "pack-5": {
        displayName: "Starter — 125M input tokens",
        productLineId: "credits",
        customerType: "user",
        prices: { once: { USD: "5.00" } },
        includedItems: { tokens: { quantity: 125000000 } },
      },
      "pack-20": {
        displayName: "Team — 500M input tokens",
        productLineId: "credits",
        customerType: "user",
        prices: { once: { USD: "20.00" } },
        includedItems: { tokens: { quantity: 500000000 } },
      },
      "pack-50": {
        displayName: "Business — 1.25B input tokens",
        productLineId: "credits",
        customerType: "user",
        prices: { once: { USD: "50.00" } },
        includedItems: { tokens: { quantity: 1250000000 } },
      },
    },
  },
  emails: {
    selectedThemeId: "1df07ae6-abf3-4a40-83a5-a1a2cbe336ac",
  },
};
