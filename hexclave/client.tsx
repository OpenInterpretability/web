import { HexclaveClientApp } from "@hexclave/next";

let _client: HexclaveClientApp | null = null;

/** Lazily constructs the client app (must not run at build time: no env there). */
export function getHexclaveClientApp(): HexclaveClientApp {
  if (!_client) {
    _client = new HexclaveClientApp({
      tokenStore: "nextjs-cookie",
      urls: {
        default: {
          type: "hosted",
        },
      },
    });
  }
  return _client;
}
