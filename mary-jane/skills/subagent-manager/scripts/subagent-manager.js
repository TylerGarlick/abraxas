#!/usr/bin/env node

/**
 * subagent-manager.js
 * Manages subagent lifecycle, detects stale agents, recovers orphaned tasks.
 * 
 * Usage: node subagent-manager.js <action> [options]
 * Actions: check | list | stale | kill | recover
 */

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../..//tasks.json');
const SUBAGENTS_FILE = path.join(__dirname, '../..//subagents.json');

function loadJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function saveJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function loadSubagents() {
  try {
    return loadJSON(SUBAGENTS_FILE);
  } catch {
    return { version: '1.0.0', active: [], history: [], lastChecked: null };
  }
}

function saveSubagents(data) {
  data.lastChecked = new Date().toISOString();
  saveJSON(SUBAGENTS_FILE, data);
}

function loadTasks() {
  return loadJSON(TASKS_FILE);
}

// Actions

function cmdList() {
  const subs = loadSubagents();
  const now = Date.now();
  
  console.log('\n🧩 SUBAGENT MANAGER — Active & History\n');
  console.log(`Last checked: ${subs.lastChecked || 'never'}\n`);
  
  if (subs.active.length === 0) {
    console.log('  No active subagents.\n');
  } else {
    console.log('▶ ACTIVE');
    subs.active.forEach(s => {
      const age = Math.round((now - new Date(s.lastHeartbeat).getTime()) / 60000);
      const stale = age > 60 ? ' ⚠️ STALE' : '';
      console.log(`  [${s.sessionId.slice(0,8)}] ${s.taskId} | ${s.factory} | ${age}m ago${stale}`);
    });
    console.log('');
  }
  
  if (subs.history.length > 0) {
    console.log('📋 HISTORY (last 10)');
    subs.history.slice(-10).reverse().forEach(s => {
      const duration = s.endedAt 
        ? Math.round((new Date(s.endedAt) - new Date(s.spawnedAt)) / 60000) + 'min'
        : '—';
      console.log(`  [${s.outcome}] ${s.taskId} | ${s.factory} | ${duration} | ended ${s.endedAt || 'unknown'}`);
    });
    console.log('');
  }
  
  console.log(`Active: ${subs.active.length} | History: ${subs.history.length}\n`);
}

function cmdStale() {
  const subs = loadSubagents();
  const now = Date.now();
  const staleThreshold = 60 * 60 * 1000; // 60 min
  const orphanedThreshold = 90 * 60 * 1000; // 90 min
  
  const stale = [];
  const orphaned = [];
  
  subs.active.forEach(s => {
    const age = now - new Date(s.lastHeartbeat).getTime();
    if (age > orphanedThreshold) {
      orphaned.push(s);
    } else if (age > staleThreshold) {
      stale.push(s);
    }
  });
  
  console.log(`\n⚠️  STALE CHECK\n`);
  console.log(`  Stale (>60min no heartbeat): ${stale.length}`);
  stale.forEach(s => {
    const age = Math.round((now - new Date(s.lastHeartbeat).getTime()) / 60000);
    console.log(`    - ${s.taskId} | ${s.factory} | ${age}m ago`);
  });
  
  console.log(`\n  Orphaned (>90min, likely dead): ${orphaned.length}`);
  orphaned.forEach(s => {
    const age = Math.round((now - new Date(s.lastHeartbeat).getTime()) / 60000);
    console.log(`    - ${s.taskId} | ${s.factory} | ${age}m ago`);
    // Auto-move to orphaned
    s.outcome = 'orphaned';
    s.endedAt = new Date().toISOString();
    subs.history.push(s);
    subs.active = subs.active.filter(a => a.sessionId !== s.sessionId);
  });
  
  if (stale.length > 0 || orphaned.length > 0) {
    saveSubagents(subs);
    console.log(`\n  Updated subagents.json`);
  }
  
  // Also check tasks stuck in running_
  const tasks = loadTasks();
  const stuckTasks = tasks.tasks.filter(t => t.status.startsWith('running_'));
  if (stuckTasks.length > 0) {
    console.log(`\n  Stuck tasks (status=running_*): ${stuckTasks.length}`);
    stuckTasks.forEach(t => {
      const age = Math.round((now - new Date(t.updatedAt).getTime()) / 60000);
      console.log(`    - [${t.id}] ${t.title} | ${t.status} | ${age}m since update`);
    });
  }
  
  console.log('');
  return { stale, orphaned, stuckTasks };
}

function cmdRecover(taskId) {
  if (!taskId) {
    console.error('Usage: subagent-manager.js recover <taskId>');
    process.exit(1);
  }
  
  const subs = loadSubagents();
  const tasks = loadTasks();
  const task = tasks.tasks.find(t => t.id === taskId);
  
  if (!task) {
    console.error(`Task ${taskId} not found`);
    process.exit(1);
  }
  
  // Remove from active
  const wasActive = subs.active.filter(s => s.taskId === taskId);
  wasActive.forEach(s => {
    s.outcome = 'recovered';
    s.endedAt = new Date().toISOString();
    subs.history.push(s);
  });
  subs.active = subs.active.filter(s => s.taskId !== taskId);
  
  // Reset task to created
  task.status = 'created';
  task.updatedAt = new Date().toISOString();
  
  saveSubagents(subs);
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  
  console.log(`✓ Recovered task [${taskId}] "${task.title}"`);
  console.log(`  Was running: ${task.currentFactory}`);
  console.log(`  Status reset to: created`);
  console.log(`  Ready to re-spawn.`);
}

function cmdKill(sessionId) {
  if (!sessionId) {
    console.error('Usage: subagent-manager.js kill <sessionId>');
    process.exit(1);
  }
  
  const subs = loadSubagents();
  const sub = subs.active.find(s => s.sessionId === sessionId);
  
  if (sub) {
    sub.outcome = 'killed';
    sub.endedAt = new Date().toISOString();
    subs.history.push(sub);
    subs.active = subs.active.filter(s => s.sessionId !== sessionId);
    saveSubagents(subs);
    console.log(`✓ Killed subagent ${sessionId.slice(0,8)} for task ${sub.taskId}`);
  } else {
    console.log(`Subagent ${sessionId} not found in active list`);
  }
}

const [,, action, ...args] = process.argv;

if (!action || !['check', 'list', 'stale', 'kill', 'recover'].includes(action)) {
  console.log(`Usage: node subagent-manager.js <action> [options]`);
  console.log(`  list              Show all active and recent subagents`);
  console.log(`  stale             Check for stale subagents and stuck tasks`);
  console.log(`  kill <sessionId>  Kill an active subagent`);
  console.log(`  recover <taskId>  Reset a stuck task to created`);
  process.exit(1);
}

if (action === 'list') cmdList();
else if (action === 'stale') cmdStale();
else if (action === 'kill') cmdKill(args[0]);
else if (action === 'recover') cmdRecover(args[0]);
