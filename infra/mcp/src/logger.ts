import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { LogLevel } from "./config.ts";

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface Logger {
  debug(msg: string, fields?: Record<string, unknown>): void;
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
  child(scope: string): Logger;
}

export interface LoggerOptions {
  level: LogLevel;
  /** Directory for `abraxas-mcp.log`; omit to log to stderr only. */
  logDir?: string;
  /** Capture sink used by tests. */
  sink?: (line: string) => void;
}

/**
 * JSON-lines logger. Always writes to stderr (stdout carries the MCP stdio protocol)
 * and optionally mirrors to `<logDir>/abraxas-mcp.log`.
 */
export function createLogger(opts: LoggerOptions, scope = "abraxas"): Logger {
  if (opts.logDir) mkdirSync(opts.logDir, { recursive: true });
  const file = opts.logDir ? join(opts.logDir, "abraxas-mcp.log") : undefined;

  const emit = (level: LogLevel, msg: string, fields?: Record<string, unknown>) => {
    if (ORDER[level] < ORDER[opts.level]) return;
    const line = JSON.stringify({ ts: new Date().toISOString(), level, scope, msg, ...fields });
    if (opts.sink) opts.sink(line);
    else process.stderr.write(line + "\n");
    if (file) appendFileSync(file, line + "\n");
  };

  return {
    debug: (m, f) => emit("debug", m, f),
    info: (m, f) => emit("info", m, f),
    warn: (m, f) => emit("warn", m, f),
    error: (m, f) => emit("error", m, f),
    child: (s) => createLogger(opts, `${scope}:${s}`),
  };
}
export const logger = createLogger({ level: 'info' });
