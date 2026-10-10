import { HexclaveServerApp } from "@hexclave/next";
import { getHexclaveClientApp } from "./client";

let _server: HexclaveServerApp | null = null;

/**
 * Lazily constructs the server app (env comes from `hexclave dev` locally or Vercel envs).
 * Lazy so that `next build` never constructs it: the marketing site must not depend on Hexclave.
 */
export function getHexclaveServerApp(): HexclaveServerApp {
  if (!_server) {
    _server = new HexclaveServerApp({
      inheritsFrom: getHexclaveClientApp(),
    });
  }
  return _server;
}
