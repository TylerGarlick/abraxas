#!/usr/bin/env node
/**
 * status.js — Mission Control status via Beads
 * Shows issue counts by status and priority for each repo.
 * 
 * Usage: node status.js [--repo <name>] [--format brief|verbose]
 *   --repo    Filter by repo (default: all)
 *   --format  brief (default) or verbose
 */

const { execSync } = require('child_process');
const path = require('path');

// Find mc directory (where Beads is initialized)
function findMcDir() {
  // Try common locations
  const candidates = [
    '/home/ubuntu/.openclaw/workspace/mc',
    '/home/ubuntu/workspace/mc',
    path.resolve(__dirname, '../mc'),
  ];
  for (const mcPath of candidates) {
    try {
      execSync('ls .beads', { cwd: mcPath, stdio: 'ignore' });
      return mcPath;
    } catch {}
  }
  // Search upward from __dirname
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    dir = path.dirname(dir);
    try {
      execSync('ls .beads', { cwd: dir, stdio: 'ignore' });
      const mcCandidate = path.join(dir, 'mc');
      try {
        execSync('ls .beads', { cwd: mcCandidate, stdio: 'ignore' });
        return mcCandidate;
      } catch {}
      return dir;
    } catch {}
  }
  return '/home/ubuntu/.openclaw/workspace/mc';
}

const BD = '/home/ubuntu/.local/bin/bd';
const mcDir = findMcDir();

function runBd(args) {
  try {
    const out = execSync(`${BD} ${args} --json`, {
      cwd: mcDir,
      env: { ...process.env, HOME: '/home/ubuntu', DOLT_DIR: mcDir }
    });
    return JSON.parse(out.toString());
  } catch {
    return [];
  }
}

const issues = runBd('list --all');
const repoFilter = process.argv.includes('--repo')
  ? process.argv[process.argv.indexOf('--repo') + 1]
  : null;
const verbose = process.argv.includes('--format') && 
  process.argv[process.argv.indexOf('--format') + 1] === 'verbose';

const filtered = repoFilter
  ? issues.filter(i => i.metadata?.repo === repoFilter)
  : issues;

const byStatus = {};
const byRepo = {};
const byPriority = { 1: 0, 2: 0, 3: 0, 4: 0 };

filtered.forEach(i => {
  const s = i.status || 'open';
  byStatus[s] = (byStatus[s] || 0) + 1;
  
  const r = i.metadata?.repo || 'unknown';
  byRepo[r] = (byRepo[r] || 0) + 1;
  
  const p = typeof i.priority === 'number' ? i.priority : 3;
  byPriority[p] = (byPriority[p] || 0) + 1;
});

const total = filtered.length;
const openCount = (byStatus.open || 0) + (byStatus['in-progress'] || 0) + (byStatus.blocked || 0);

console.log('\n  Mission Control — Beads Status\n');
console.log(`  Total issues: ${total}`);
console.log(`  Open work:    ${openCount}  (${byStatus.open || 0} open, ${byStatus['in-progress'] || 0} in-progress, ${byStatus.blocked || 0} blocked)`);
console.log(`  Done:         ${byStatus.done || 0}`);

console.log('\n  By repo:');
Object.entries(byRepo).sort(([a], [b]) => a.localeCompare(b)).forEach(([repo, count]) => {
  console.log(`    ${repo}: ${count}`);
});

console.log('\n  By priority:');
console.log(`    P1 (urgent):  ${byPriority[1]}`);
console.log(`    P2 (normal):  ${byPriority[2]}`);
console.log(`    P3 (low):     ${byPriority[3]}`);

if (verbose) {
  console.log('\n  Open issues:');
  filtered.filter(i => !['done', 'archived'].includes(i.status)).forEach(i => {
    const repo = i.metadata?.repo || '—';
    const p = typeof i.priority === 'number' ? `p${i.priority}` : '';
    console.log(`    [${i.status || 'open'}] ${i.id} — ${i.title} (${repo}) ${p}`);
  });
}

console.log('');
