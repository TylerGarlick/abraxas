import type { Config } from "./config.ts";
import type { Logger } from "./logger.ts";
import type { Store } from "./storage/index.ts";

/** Shared services handed to every tool module. */
export interface AppContext {
  config: Config;
  log: Logger;
  store: Store;
}
