#!/usr/bin/env node

/**
 * patch-task.js
 * Subagents call this to update task status after completing a stage.
 * 
 * Usage: node patch-task.js <taskId> <status> [key=value ...]
 * 
 * Examples:
 *   node patch-task.js abc12345 running_software
 *   node patch-task.js abc12345 research_complete chainComplete.research=true
 */

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../tasks.json');

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

function saveTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

const [,, taskId, status, ...kvPairs] = process.argv;

if (!taskId || !status) {
  console.error('Usage: node patch-task.js <taskId> <status> [key=value ...]');
  console.error('Statuses: created | running_<factory> | <factory>_complete | done');
  process.exit(1);
}

const data = loadTasks();
const task = data.tasks.find(t => t.id === taskId);
if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }

task.status = status;
task.updatedAt = new Date().toISOString();

// Parse key=value pairs
kvPairs.forEach(pair => {
  const [k, v] = pair.split('=');
  if (k && v !== undefined) {
    // Handle nested keys like chainComplete.research
    const keys = k.split('.');
    let obj = task;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    const finalKey = keys[keys.length - 1];
    // Parse booleans
    obj[finalKey] = v === 'true' ? true : v === 'false' ? false : v;
  }
});

// Auto-advance chain if a factory completed
if (status.includes('_complete') && task.nextFactory) {
  const completedFactory = status.replace('_complete', '');
  task.currentFactory = task.nextFactory;
  task.nextFactory = task.factories[task.factories.indexOf(completedFactory) + 1] || null;
  task.status = 'created'; // Ready for next factory
}

// If all factories done, mark complete
if (task.factories.every(f => task.chainComplete?.[f])) {
  task.status = 'done';
}

data.lastUpdated = new Date().toISOString();
saveTasks(data);

console.log(`✓ Task [${taskId}] updated → ${status}`);
