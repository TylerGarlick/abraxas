import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type StorageBackend = "json" | "nedb";

export interface Config {
  /** Repository / workspace root that contains the private `.abraxas` folder. */
  rootDir: string;
  /** Where all persistent data lives (`<root>/.abraxas/data`). */
  dataDir: string;
  /** Where log files are written (`<root>/.abraxas/logs`). */
  logDir: string;
  backend: StorageBackend;
  logLevel: LogLevel;
  logToFile: boolean;
  httpPort: number;
}

/** Walk upward from `start` until a directory containing `.abraxas` or `.git` is found. */
function findRoot(start: string): string {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, ".abraxas")) || existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(start);
    dir = parent;
  }
}

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const rootDir = env.ABRAXAS_ROOT ? resolve(env.ABRAXAS_ROOT) : findRoot(process.cwd());
  const workspace = join(rootDir, ".abraxas");
  const backend = env.ABRAXAS_STORAGE === "nedb" ? "nedb" : "json";
  const level = (env.ABRAXAS_LOG_LEVEL ?? "info").toLowerCase();
  return {
    rootDir,
    dataDir: env.ABRAXAS_DATA_DIR ? resolve(env.ABRAXAS_DATA_DIR) : join(workspace, "data"),
    logDir: env.ABRAXAS_LOG_DIR ? resolve(env.ABRAXAS_LOG_DIR) : join(workspace, "logs"),
    backend,
    logLevel: (["debug", "info", "warn", "error"].includes(level) ? level : "info") as LogLevel,
    logToFile: env.ABRAXAS_LOG_FILE === "1",
    httpPort: Number(env.PORT ?? env.ABRAXAS_HTTP_PORT ?? 8787),
  };
}
