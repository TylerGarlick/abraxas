/**
 * Bun-style logger that outputs to stderr
 * StdIO transport: all JSON-RPC goes to stdout, logs to stderr
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const currentLevel = LogLevel.INFO;

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${formatTimestamp()}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.error(formatMessage('DEBUG', message, meta));
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (currentLevel <= LogLevel.INFO) {
      console.error(formatMessage('INFO', message, meta));
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (currentLevel <= LogLevel.WARN) {
      console.error(formatMessage('WARN', message, meta));
    }
  },

  error(message: string, meta?: Record<string, unknown>): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },
};

export default logger;
