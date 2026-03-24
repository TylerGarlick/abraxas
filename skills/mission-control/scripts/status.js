#!/usr/bin/env node

/**
 * status.js
 * Shows the current status of all tasks and factories.
 */

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../tasks.json');

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function status() {
  const data = loadTasks();
  
  console.log('\n🧪 MISSION CONTROL — Status\n');
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
