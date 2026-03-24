#!/usr/bin/env node

/**
 * create-task.js
 * Creates a new task in the Mission Control system.
 * 
 * CRITICAL: The FIRST step after creating a task is defining what "done" means.
 * This must be defined BEFORE spawning a subagent.
 * 
 * Usage: node create-task.js <title> <type> [subtasks...] [-d|--done "acceptance criteria"]
 * Types: research | writing | software | github | chained
 * 
 * Example: node create-task.js "Build URL shortener" software -d "src/ exists, README.md has setup, package.json present"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TASKS_FILE = path.join(__dirname, '../tasks.json');
const TASKS_DIR = path.join(__dirname, '../tasks');

function loadTasks() {
  const raw = fs.readFileSync(TASKS_FILE, 'utf8');
  return JSON.parse(raw);
}

function saveTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

function parseArgs(args) {
  const title = args[0];
  const type = args[1];
  const subtasks = [];
  let definitionOfDone = '';

  // Collect subtasks and -d option
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '-d' || args[i] === '--done') {
      definitionOfDone = args.slice(i + 1).join(' ');
      break;
    }
    subtasks.push(args[i]);
  }

  return { title, type, subtasks, definitionOfDone };
}

function createTask(title, type, subtasks = [], definitionOfDone = '') {
  const tasks = loadTasks();
  
  const taskId = crypto.randomBytes(4).toString('hex');
  const now = new Date().toISOString();
  
  // Determine which factories are needed
  let factories = [];
  switch (type) {
    case 'research': factories = ['research']; break;
    case 'writing':  factories = ['writing']; break;
    case 'software': factories = ['software']; break;
    case 'github':   factories = ['github']; break;
    case 'chained':  factories = ['research', 'writing', 'software']; break;
    default:         factories = [type];
  }
  
  const task = {
    id: taskId,
    title,
    type,
    status: 'created',
    factories,
    createdAt: now,
    updatedAt: now,
    subtasks: subtasks.map((st, i) => ({
      id: `${taskId}-${i}`,
      title: st,
      status: 'pending',
      assigned: null,
      createdAt: now
    })),
    currentFactory: factories[0] || null,
    nextFactory: factories[1] || null,
    chainComplete: {},
    notes: [],
    // Definition of Done — written FIRST, before spawning
    definitionOfDone: definitionOfDone || getDefaultDefinitionOfDone(type),
    acceptanceCriteria: parseCriteria(definitionOfDone || getDefaultDefinitionOfDone(type)),
    doneDefined: !!definitionOfDone
  };
  
  tasks.tasks.push(task);
  tasks.lastUpdated = now;
  saveTasks(tasks);
  
  // Create DONE.md in task directory
  const taskDir = path.join(TASKS_DIR, taskId);
  fs.mkdirSync(taskDir, { recursive: true });
  
  const doneMd = `# Definition of Done — Task [${taskId}]: "${title}"

## Acceptance Criteria

${(definitionOfDone || getDefaultDefinitionOfDone(type)).split(',').map(c => `- [ ] ${c.trim()}`).join('\n')}

## Verification

After subagent completes, run:
\`\`\`bash
cd /home/ubuntu/.openclaw/workspace/mission-control
node scripts/verify-task.js ${taskId} hybrid
\`\`\`

## Notes

_Add verification notes here._

---
*Created by Mission Control — ${now}*
`;
  fs.writeFileSync(path.join(taskDir, 'DONE.md'), doneMd);
  
  console.log(`✓ Created task [${taskId}] "${title}" (type: ${type})`);
  console.log(`  Factories: ${factories.join(' → ')}`);
  if (subtasks.length) console.log(`  Subtasks: ${subtasks.length}`);
  console.log(`  Definition of Done: ${task.definitionOfDone}`);
  console.log(`  ✓ DONE.md written to: ${taskDir}/DONE.md`);
  
  return taskId;
}

function getDefaultDefinitionOfDone(type) {
  const defaults = {
    research: 'brief.md exists, brief.md has Summary section, brief.md has Key Findings section, brief.md has Sources section, brief.md has Conclusions section, at least 2 URL citations',
    writing: 'output.md exists, output.md has content (>200 chars), output.md matches requested format',
    software: 'src/ directory exists with code files, README.md exists with setup instructions, package.json or equivalent dependency file present',
    github: 'report.md exists, report.md has content (>100 chars), at least 3 repositories mentioned',
    chained: 'all factory outputs complete, all acceptance criteria met across chain'
  };
  return defaults[type] || 'output file exists and has meaningful content';
}

function parseCriteria(criteriaStr) {
  return criteriaStr.split(',').map(c => ({
    criterion: c.trim(),
    checked: false,
    verified: false
  }));
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node create-task.js <title> <type> [subtasks...] [-d|--done "criteria"]');
  console.error('Types: research | writing | software | github | chained');
  console.error('Example: node create-task.js "Build X" software -d "src/ exists, tests pass"');
  process.exit(1);
}

const { title, type, subtasks, definitionOfDone } = parseArgs(args);
createTask(title, type, subtasks, definitionOfDone);
