#!/usr/bin/env node
/**
 * sync-repos.js - Syncs workspace repos to their remote remotes
 * Usage: node sync-repos.js <repo-name>
 * Repos: mary-jane, abraxas, research, biz-plans, 
 */

const { execSync } = require('child_process');
const path = require('path');

const REPOS = {
  'mary-jane': '/tmp/mary-jane',
  'abraxas': '/tmp/abraxas-checkout',
  'research': '/tmp/research',
  'biz-plans': '/tmp/biz-plans',
  '': '/home/ubuntu/.openclaw/workspace/',
};

const repoName = process.argv[2];

if (!repoName) {
  console.error('Usage: node sync-repos.js <repo-name>');
  console.error('Available repos:', Object.keys(REPOS).join(', '));
  process.exit(1);
}

const repoPath = REPOS[repoName];

if (!repoPath) {
  console.error(`Unknown repo: ${repoName}`);
  console.error('Available repos:', Object.keys(REPOS).join(', '));
  process.exit(1);
}

function run(cmd, cwd) {
  console.log(`[${repoName}] ${cmd}`);
  try {
    const out = execSync(cmd, {
      cwd,
      stdio: 'pipe',
      timeout: 60000,
    });
    return out.toString().trim();
  } catch (err) {
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

function syncRepo(name, repoPath) {
  console.log(`\n=== Syncing ${name} ===`);
  console.log(`Path: ${repoPath}`);

  // Check git status
  const status = run('git status --short', repoPath);
  if (!status) {
    console.log(`No changes in ${name}, skipping.`);
    return { name, changes: false };
  }

  console.log('Changes:\n' + status);

  // Add all changes
  run('git add -A', repoPath);

  // Check what's staged
  const staged = run('git diff --cached --stat', repoPath);
  console.log('Staged:\n' + staged);

  // Commit with timestamp
  const date = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const commitMsg = `sync: ${name} ${date}`;
  run(`git commit -m "${commitMsg}"`, repoPath);

  // Push
  run('git push', repoPath);

  console.log(`✓ ${name} synced successfully.`);
  return { name, changes: true };
}

try {
  const result = syncRepo(repoName, repoPath);
  if (result.changes) {
    console.log(`\n✅ ${result.name} synced and pushed.`);
  } else {
    console.log(`\n✅ ${result.name} already up to date.`);
  }
} catch (err) {
  console.error(`\n❌ Failed to sync ${repoName}:`, err.message);
  process.exit(1);
}
