#!/usr/bin/env node

/**
 * spawn-subagent.js
 * Wraps sessions_spawn tool call with automatic subagent tracking.
 * 
 * Usage: node spawn-subagent.js <taskId> <factory> <prompt>
 * 
 * This is a helper — the actual spawning is done via sessions_spawn tool.
 * This script just registers the subagent in subagents.json for tracking.
 */

const fs = require('fs');
const path = require('path');

const SUBAGENTS_FILE = path.join(__dirname, '../../mission-control/subagents.json');

function loadSubagents() {
  try {
    return JSON.parse(fs.readFileSync(SUBAGENTS_FILE, 'utf8'));
  } catch {
    return { version: '1.0.0', active: [], history: [], lastChecked: null };
  }
}

function saveSubagents(data) {
  fs.writeFileSync(SUBAGENTS_FILE, JSON.stringify(data, null, 2));
}

const [,, taskId, factory, ...promptParts] = process.argv;

if (!taskId || !factory) {
  console.error('Usage: node spawn-subagent.js <taskId> <factory> <prompt>');
  process.exit(1);
}

// This script is called BEFORE spawning to register the subagent.
// A placeholder sessionId is stored; it will be updated by the caller.
const subagent = {
  sessionId: `pending-${taskId}-${Date.now()}`,
  taskId,
  factory,
  spawnedAt: new Date().toISOString(),
  lastHeartbeat: new Date().toISOString(),
  status: 'spawning'
};

const subs = loadSubagents();
subs.active.push(subagent);
saveSubagents(subs);

console.log(`✓ Registered subagent for task [${taskId}] factory [${factory}]`);
console.log(`  SessionId: ${subagent.sessionId}`);
console.log(`\nNow spawn via sessions_spawn tool, then update with real sessionId.`);
