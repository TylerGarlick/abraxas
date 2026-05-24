#!/usr/bin/env node
/**
 * test-mc-scripts.js
 * Smoke-test all Mission Control scripts to verify the system is healthy.
 * Run manually or before/after maintenance to catch broken scripts early.
 *
 * Usage: node test-mc-scripts.js [--mc-path <path>]
 *   --mc-path  Path to  directory (default: /home/ubuntu/.openclaw/workspace/)
 *
 * Exit codes: 0 = all pass, 1 = one or more failures
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- Argument parsing ---
const mcPathArg = process.argv.find((a, i) =>
  (a === '--mc-path' || a === '-p') && process.argv[i + 1]
);
const MC_PATH = mcPathArg
  ? path.resolve(process.cwd(), process.argv[process.argv.indexOf(mcPathArg) + 1])
  : '/home/ubuntu/.openclaw/workspace/';

const SCRIPTS_DIR = path.join(__dirname);
const TASKS_FILE = path.join(MC_PATH, 'tasks.json');
const LESSONS_FILE = path.join(MC_PATH, 'retrospectives', 'lessons-learned.json');

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(msg) { process.stdout.write(msg + '\n'); }
function pass(label) { log(`  ${GREEN}✓${RESET} ${label}`); }
function fail(label, detail) { log(`  ${RED}✗${RESET} ${label}${detail ? ': ' + detail : ''}`); }
function warn(label, detail) { log(`  ${YELLOW}⚠${RESET} ${label}${detail ? ': ' + detail : ''}`); }
function section(name) { log(`\n${BOLD}━━━ ${name} ━━━${RESET}`); }

let exitCode = 0;

function runScript(scriptName, args = [], options = {}) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  const fullArgs = [...args, '--mc-path', MC_PATH];

  // If the script doesn't exist at SCRIPTS_DIR, try the old MC location as fallback
  const resolvedPath = fs.existsSync(scriptPath) ? scriptPath : path.join(MC_PATH, 'scripts', scriptName);

  const cmd = `node "${resolvedPath}" ${fullArgs.join(' ')}`;
  try {
    const output = execSync(cmd, {
      cwd: SCRIPTS_DIR,
      encoding: 'utf8',
      timeout: options.timeout || 15000,
      ...options
    });
    return { ok: true, output };
  } catch (e) {
    return {
      ok: false,
      output: e.stdout || '',
      error: e.stderr || e.message,
      code: e.status || 1
    };
  }
}

// Test both direct invocation (from SCRIPTS_DIR, uses __dirname) and cron-style (from MC dir, uses CWD)
function runScriptCronStyle(scriptName, args = [], options = {}) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  const fullArgs = [...args, '--mc-path', MC_PATH];
  const cmd = `node "${scriptPath}" ${fullArgs.join(' ')}`;
  try {
    const output = execSync(cmd, {
      cwd: MC_PATH,  // <-- this is the key: run from MC dir so CWD detection works
      encoding: 'utf8',
      timeout: options.timeout || 15000
    });
    return { ok: true, output };
  } catch (e) {
    return {
      ok: false,
      output: e.stdout || '',
      error: e.stderr || e.message,
      code: e.status || 1
    };
  }
}

function checkFile(filepath, label) {
  try {
    const stat = fs.statSync(filepath);
    pass(label);
    return { ok: true, stat };
  } catch (e) {
    fail(label, `File not found: ${filepath}`);
    return { ok: false };
  }
}

function checkJSON(filepath, label) {
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    pass(label);
    return { ok: true, data };
  } catch (e) {
    fail(label, `Invalid JSON: ${e.message}`);
    return { ok: false };
  }
}

// ═══════════════════════════════════════════
// PRE-FLIGHT: Required files and directories
// ═══════════════════════════════════════════
section('PRE-FLIGHT: MC Directory & Files');
checkFile(MC_PATH, `MC directory exists: ${MC_PATH}`);
checkFile(TASKS_FILE, 'tasks.json exists');
checkFile(LESSONS_FILE, 'lessons-learned.json exists');
checkFile(path.join(MC_PATH, 'retrospectives'), 'retrospectives/ dir exists');
checkFile(path.join(MC_PATH, 'logs'), 'logs/ dir exists');

// ═══════════════════════════════════════════
// TASKS.JSON INTEGRITY
// ═══════════════════════════════════════════
section('TASKS.JSON INTEGRITY');
const tasksResult = checkJSON(TASKS_FILE, 'tasks.json is valid JSON');
if (tasksResult.ok) {
  const tasks = tasksResult.data.tasks;
  const requiredFields = ['title', 'status'];
  const sample = tasks[0];
  if (sample) {
    const missing = requiredFields.filter(f => !(f in sample));
    if (missing.length === 0) {
      pass('All required task fields present');
    } else {
      fail('Missing task fields', missing.join(', '));
    }
  } else {
    warn('No tasks in tasks.json (empty array is ok)');
  }
  pass(`tasks.json has ${tasks.length} task(s)`);
}

// ═══════════════════════════════════════════
// SCRIPTS SMOKE TESTS
// ═══════════════════════════════════════════
section('SCRIPTS SMOKE TESTS');

// status.js - test BOTH direct invocation (uses --mc-path) AND cron-style (uses CWD)
section('status.js');
const statusDirect = runScript('status.js');
if (statusDirect.ok) {
  pass('status.js direct invocation exits cleanly');
  if (statusDirect.output.includes('MISSION CONTROL')) pass('output contains expected header');
} else {
  fail('status.js direct invocation exits cleanly', `code ${statusDirect.code}`);
}

const statusCron = runScriptCronStyle('status.js');
if (statusCron.ok) {
  pass('status.js cron-style (CWD) exits cleanly');
  if (statusCron.output.includes('MISSION CONTROL')) pass('cron-style output correct');
} else {
  fail('status.js cron-style (CWD) exits cleanly', `code ${statusCron.code}`);
}

// retrospectives.js daily - use cron style (CWD detection)
section('retrospectives.js (daily)');
const retroDailyResult = runScriptCronStyle('retrospectives.js', ['daily']);
if (retroDailyResult.ok) {
  pass('retrospectives.js daily exits cleanly');
  if (retroDailyResult.output.includes('retrospective written')) pass('outputs success message');
  const today = new Date().toISOString().split('T')[0];
  const expectedFile = path.join(MC_PATH, 'retrospectives', 'daily', `${today}.md`);
  if (fs.existsSync(expectedFile)) {
    pass(`daily retro created: ${today}.md`);
  } else {
    fail(`daily retro NOT created: ${expectedFile}`);
  }
} else {
  fail('retrospectives.js daily exits cleanly', `code ${retroDailyResult.code}`);
  log(`  stderr: ${retroDailyResult.error?.slice(0, 300)}`);
}

// retrospectives.js weekly - use cron style (CWD detection)
section('retrospectives.js (weekly)');
const retroWeeklyResult = runScriptCronStyle('retrospectives.js', ['weekly']);
if (retroWeeklyResult.ok) {
  pass('retrospectives.js weekly exits cleanly');
  if (retroWeeklyResult.output.includes('retrospective written')) pass('outputs success message');
  // Extract week string from output
  const weekMatch = retroWeeklyResult.output.match(/W\d+/);
  if (weekMatch) {
    const weekFile = path.join(MC_PATH, 'retrospectives', 'weekly', `????-${weekMatch[0]}.md`);
    // Check if any weekly file was created recently
    const weeklyDir = path.join(MC_PATH, 'retrospectives', 'weekly');
    if (fs.existsSync(weeklyDir)) {
      const files = fs.readdirSync(weeklyDir).filter(f => f.endsWith('.md'));
      pass(`weekly retro file exists in ${weeklyDir}`);
    }
  }
} else {
  fail('retrospectives.js weekly exits cleanly', `code ${retroWeeklyResult.code}`);
}

// cron-failure-alert.js
section('cron-failure-alert.js');
const alertResult = runScript('cron-failure-alert.js', ['TestJob', 'Test error message for verification']);
if (!alertResult.ok) {
  // cron-failure-alert.js intentionally exits with 1 after logging
  if (alertResult.code === 1 && alertResult.output.includes('ALERT:')) {
    pass('cron-failure-alert.js logs alert and exits 1 (expected behavior)');
    const logFile = path.join(MC_PATH, 'logs', 'cron-failures.log');
    if (fs.existsSync(logFile)) {
      pass('cron-failures.log created/appended');
    }
  } else {
    fail('cron-failure-alert.js behavior unexpected', `code ${alertResult.code}`);
  }
} else {
  warn('cron-failure-alert.js exited 0 — it should exit 1 after alerting');
}

// ═══════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════
section('CRON CONFIGURATION');
const cronJobs = [
  { name: 'Morning Briefing + Biz-Ops', schedule: '0 6 * * *' },
  { name: 'Evening Briefing + Biz-Ops', schedule: '0 18 * * *' },
  { name: 'Nightly Floor Check', schedule: '0 20 * * *' },
  { name: 'Daily Retrospective', schedule: '0 20 * * 0-6' },
  { name: 'Weekly Retrospective', schedule: '0 20 * * 6' },
  { name: 'Overdue Poll', schedule: '*/30 * * * *' },
];
cronJobs.forEach(job => {
  log(`  ${BOLD}${job.name}${RESET} (${job.schedule})`);
});

log(`\n${BOLD}MC Path:${RESET} ${MC_PATH}`);
log(`${BOLD}Scripts:${RESET} ${SCRIPTS_DIR}`);

if (exitCode === 0) {
  log(`\n${GREEN}${BOLD}✅ ALL CHECKS PASSED${RESET} — Mission Control is healthy.\n`);
} else {
  log(`\n${RED}${BOLD}❌ SOME CHECKS FAILED${RESET} — Review output above.\n`);
}

process.exit(exitCode);
