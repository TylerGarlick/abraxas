#!/usr/bin/env node
"use strict";

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';

if (process.argv.length < 3) {
  console.error('Usage: sync-in-place <repo-name>');
  process.exit(1);
}

const repoName = process.argv[2];
const repoDir = path.join(WORKSPACE, repoName);
if (!fs.existsSync(repoDir)) {
  console.error(`Repo not found: ${repoDir}`);
  process.exit(1);
}

try {
  console.log(`Pulling latest for ${repoName}...`);
  execSync('git pull', { cwd: repoDir, stdio: 'inherit' });
} catch (e) {
  console.error('Pull failed', e.message);
  process.exit(1);
}

// Check for changes
const status = execSync('git status --porcelain', { cwd: repoDir }).toString();
if (status.trim() === '') {
  console.log('No changes to commit.');
  process.exit(0);
}

// Stage changes
execSync('git add .', { cwd: repoDir, stdio: 'inherit' });
const date = new Date().toISOString().split('T')[0];
execSync(`git commit -m "Sync-in-place: ${date}"`, { cwd: repoDir, stdio: 'inherit' });
execSync('git push', { cwd: repoDir, stdio: 'inherit' });
console.log('Sync completed and pushed.');
