#!/usr/bin/env node
"use strict";
// --------- Mission‑Control Task Aggregator ---------
// 1. Gather all tasks.json files from listed repos
// 2. Merge their `tasks` arrays into one master list
// 3. Write to mission‑control/tasks.json
// 4. Git pull/rebase, commit, push to Mission‑Control remote

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPOS = [
  'the-red-book',
  'curiosity-hour',
  'outerspace',
  'satchel',
  'mission-control',
  'mary-jane',
  'asclepius',
  'biz-plans',
  'amplify',
  'find-Guarana'
];
const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const OUT_DIR = path.join(WORKSPACE, 'mission-control');
const OUT_FILE = path.join(OUT_DIR, 'tasks.json');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return null; }
}

function collect(repo) {
  const base = path.join(WORKSPACE, repo);
  if (!fs.existsSync(base)) return [];
  const candidates = [
    path.join(base, 'tasks.json'),
    path.join(base, 'skills', 'tasks.json')
  ];
  const skillTaskDir = path.join(base, 'skills', 'tasks');
  if (fs.existsSync(skillTaskDir) && fs.lstatSync(skillTaskDir).isDirectory()) {
    fs.readdirSync(skillTaskDir).forEach(f => {
      if (f.endsWith('.json')) candidates.push(path.join(skillTaskDir, f));
    });
  }
  let out = [];
  for (const file of candidates) {
    const data = readJson(file);
    if (data && Array.isArray(data.tasks)) out.push(...data.tasks);
  }
  return out;
}

let allTasks = [];
REPOS.forEach(r => {
  const t = collect(r);
  if (t.length) allTasks.push(...t);
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(OUT_FILE, JSON.stringify({ tasks: allTasks }, null, 2), 'utf8');

const date = new Date().toISOString().split('T')[0];
try {
  execSync('git pull --rebase mission-control master', { cwd: WORKSPACE, stdio: 'inherit' });
} catch (_) {
  console.error('Pull failed – resolve conflicts manually and re‑run.');
}

execSync(`git add ${OUT_FILE}`, { cwd: WORKSPACE, stdio: 'inherit' });
execSync(`git commit -m "Aggregate tasks ${date}"`, { cwd: WORKSPACE, stdio: 'inherit' });
execSync('git push mission-control master', { cwd: WORKSPACE, stdio: 'inherit' });

console.log(`Aggregated ${allTasks.length} tasks into ${OUT_FILE} and pushed to Mission‑Control.`);
