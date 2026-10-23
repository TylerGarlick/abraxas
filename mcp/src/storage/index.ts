import { mkdirSync } from "node:fs";
import type { Config } from "../config.ts";
import type { Logger } from "../logger.ts";
import { JsonStore } from "./json-store.ts";
import { NedbStore } from "./nedb-store.ts";
import type { Store } from "./types.ts";

export * from "./types.ts";

/**
 * Well-known collections. Each maps to `.abraxas/data/<name>.json`. These replace the former
 * ArangoDB collections; ad-hoc collections can be created at any time through the `store_*` tools.
 */
export const COLLECTIONS = {
  memory: "memory/fragments",
  sessions: "memory/sessions",
  claims: "epistemic/claims",
  resolutions: "epistemic/resolutions",
  ledger: "ledger/entries",
  config: "system/config",
} as const;

export function createStore(config: Config, log: Logger): Store {
  mkdirSync(config.dataDir, { recursive: true });
  const scoped = log.child("storage");
  scoped.info("opening store", { backend: config.backend, dataDir: config.dataDir });
  return config.backend === "nedb"
    ? new NedbStore(config.dataDir, scoped)
    : new JsonStore(config.dataDir, scoped);
}
