#!/usr/bin/env node
/**
 * cron-failure-alert.js
 * Logs cron job failures to console and a log file.
 *
 * Usage: node cron-failure-alert.js "<job_name>" "<error_message>" [--mc-path <path>]
 *   --mc-path  Path to mission-control directory (default: derived from script location)
 */

const fs = require('fs');
const path = require('path');

// --- Argument parsing ---
const mcPathArg = process.argv.find((a, i) =>
  (a === '--mc-path' || a === '-p') && process.argv[i + 1]
);
const MC_PATH = mcPathArg
  ? path.resolve(process.cwd(), process.argv[process.argv.indexOf(mcPathArg) + 1])
  : path.resolve(__dirname, '..');

const jobName = process.argv[2];
const errorMessage = process.argv[3];

if (!jobName || !errorMessage) {
  console.error('Usage: node cron-failure-alert.js "<job_name>" "<error_message>" [--mc-path <path>]');
  process.exit(1);
}

const LOG_DIR = path.join(MC_PATH, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'cron-failures.log');
const timestamp = new Date().toISOString();

console.log(`ALERT: ${jobName} — ${errorMessage}`);

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logEntry = `[${timestamp}] ${jobName} — ${errorMessage}\n`;
fs.appendFileSync(LOG_FILE, logEntry);

process.exit(1);
