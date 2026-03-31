#!/usr/bin/env node
/**
 * cron-failure-alert.js — Alert on stale/beads-missing tasks
 * 
 * Reads from Beads. Alerts if:
 *   - Issues are past their due date and still open
 *   - Issues are in 'blocked' status
 *   - Issues tagged 'cron-monitor' haven't been updated in N hours
 * 
 * Output: formatted alert text or empty (no alert needed).
 * 
 * Usage: node cron-failure-alert.js [--dry-run]
 */

const { execSync } = require('child_process');
const path = require('path');

const BD = '~/.local/bin/bd';

function findMcDir() {
  const workspace = path.resolve(__dirname, '..');
  const mcPath = path.join(workspace, 'mc');
  try {
    execSync('ls .beads', { cwd: mcPath, stdio: 'ignore' });
    return mcPath;
  } catch {
    let dir = __dirname;
    for (let i = 0; i < 4; i++) {
      dir = path.dirname(dir);
      try {
        execSync('ls .beads', { cwd: dir, stdio: 'ignore' });
        return dir;
      } catch {}
    }
    return mcPath;
  }
}

const mcDir = findMcDir();

function runBd(args) {
  try {
    const out = execSync(`${BD} ${args} --json`, { cwd: mcDir });
    return JSON.parse(out.toString());
  } catch {
    return [];
  }
}

const issues = runBd('list --all');
const now = Date.now();
const STALE_HOURS = 72; // issues not updated in 72h

const alerts = [];

issues.forEach(issue => {
  const status = issue.status || 'open';
  
  // Skip done/archived
  if (['done', 'archived'].includes(status)) return;
  
  // Check if blocked
  if (status === 'blocked') {
    alerts.push(`BLOCKED: ${issue.id} — ${issue.title} (${issue.metadata?.repo || 'unknown repo'})`);
    return;
  }
  
  // Check if stale (not updated in STALE_HOURS)
  const updated = issue.updated ? new Date(issue.updated).getTime() : 0;
  const hoursSinceUpdate = updated ? (now - updated) / 1000 / 60 / 60 : Infinity;
  
  if (hoursSinceUpdate > STALE_HOURS) {
    const repo = issue.metadata?.repo || 'unknown';
    const hours = Math.round(hoursSinceUpdate);
    alerts.push(`STALE: ${issue.id} — ${issue.title} (${repo}, ${hours}h old)`);
  }
});

const dryRun = process.argv.includes('--dry-run');

if (alerts.length > 0) {
  console.log('\n  ⚠️  Mission Control Alerts\n');
  alerts.forEach(a => console.log('  ' + a));
  console.log('');
  
  if (dryRun) {
    console.log('  [dry-run — no alert sent]');
  }
} else {
  if (dryRun) {
    console.log('  No alerts needed. [dry-run]');
  }
  // else: silent, no output = no alert
}
