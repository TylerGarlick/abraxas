#!/usr/bin/env node
/**
 * status.js
 * Shows the current status of all tasks and factories.
 *
 * Usage: node status.js [--mc-path <path>]
 *   --mc-path  Path to mission-control directory (default: derived from script location)
 */

const fs = require('fs');
const path = require('path');

// --- Argument parsing ---
// Prefer --mc-path flag, then CWD (for cron job reliability), then __dirname as last resort
const mcPathArg = process.argv.find((a, i) =>
  (a === '--mc-path' || a === '-p') && process.argv[i + 1]
);
const MC_PATH = mcPathArg
  ? path.resolve(process.cwd(), process.argv[process.argv.indexOf(mcPathArg) + 1])
  : (process.cwd().includes('mission-control') ? process.cwd() : path.resolve(__dirname, '..'));

// If run from a different cwd and no --mc-path, fall back to __dirname parent
const TASKS_FILE = path.join(MC_PATH, 'tasks.json');

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function status() {
  let data;
  try {
    data = loadTasks();
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error(`ERROR: tasks.json not found at: ${TASKS_FILE}`);
      console.error(`  Run with --mc-path <path> to specify the mission-control directory.`);
      process.exit(1);
    }
    throw e;
  }

  console.log('\n🧪 MISSION CONTROL — Status\n');
  console.log(`MC path: ${MC_PATH}`);
  console.log(`Last updated: ${formatDate(data.lastUpdated)}\n`);

  if (!data.tasks.length) {
    console.log('  No tasks. Say "MJ, build X" to create one.\n');
    return;
  }

  // Group by status
  const active = data.tasks.filter(t => t.status.startsWith('running'));
  const pending = data.tasks.filter(t => t.status === 'created' || t.status === 'pending');
  const complete = data.tasks.filter(t => t.status === 'done');

  if (active.length) {
    console.log('▶ ACTIVE');
    active.forEach(t => {
      console.log(`  [${t.id}] "${t.title}"`);
      console.log(`         Status: ${t.status} | Factory: ${t.currentFactory || '—'}`);
      console.log(`         Chain: ${t.factories.join(' → ')}`);
      if (t.subtasks.length) console.log(`         Subtasks: ${t.subtasks.filter(s=>s.status==='done').length}/${t.subtasks.length} done`);
    });
    console.log('');
  }

  if (pending.length) {
    console.log('○ PENDING');
    pending.forEach(t => {
      console.log(`  [${t.id}] "${t.title}"`);
      console.log(`         Status: ${t.status} | Created: ${formatDate(t.createdAt)}`);
    });
    console.log('');
  }

  if (complete.length) {
    console.log('✓ COMPLETE');
    complete.forEach(t => {
      console.log(`  [${t.id}] "${t.title}" — done ${formatDate(t.updatedAt)}`);
    });
    console.log('');
  }

  console.log(`Total: ${data.tasks.length} | Active: ${active.length} | Pending: ${pending.length} | Done: ${complete.length}\n`);
}

status();
