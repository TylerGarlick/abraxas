#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoDir = path.resolve(__dirname, '..');
const mcDir = path.join(repoDir, 'mission-control');
const retrosDir = path.join(mcDir, 'retros');
const tasksDb = path.join(repoDir, '..', '.openclaw', 'tasks', 'runs.sqlite');

// Ensure retros directory exists
if (!fs.existsSync(retrosDir)) fs.mkdirSync(retrosDir, { recursive: true });

const mode = process.argv[2] || 'daily';
const now = new Date();
const dateStr = now.toISOString().split('T')[0];

console.log(`Running ${mode} retrospective for ${dateStr}`);

// Read tasks from SQLite database
function getTasksFromDB() {
  try {
    // Use node to read SQLite since sqlite3 CLI may not be available
    const dbReader = `
      const Database = require('better-sqlite3');
      const db = new Database('${tasksDb.replace(/'/g, "''")}');
      const tasks = db.prepare('SELECT * FROM runs WHERE status = "completed"').all();
      console.log(JSON.stringify(tasks));
      db.close();
    `;
    const result = execSync(`node -e "${dbReader.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (e) {
    console.error('Failed to read tasks from database:', e.message);
    return [];
  }
}

// Fallback: check for JSON task files
function getTasksFromFiles() {
  const tasksDir = path.join(mcDir, 'tasks');
  if (!fs.existsSync(tasksDir)) return [];
  
  const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.json'));
  const tasks = [];
  
  for (const tf of taskFiles) {
    try {
      const task = JSON.parse(fs.readFileSync(path.join(tasksDir, tf), 'utf8'));
      tasks.push({ ...task, id: path.basename(tf, '.json') });
    } catch (e) {
      console.error(`Failed to read ${tf}:`, e.message);
    }
  }
  return tasks;
}

// Get day start timestamp
const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// Fetch tasks
let tasks = getTasksFromDB();
if (tasks.length === 0) {
  tasks = getTasksFromFiles();
}

console.log(`Found ${tasks.length} total tasks`);

// Filter for completed today
const completedToday = tasks.filter(task => {
  if (task.status !== 'completed' && task.state !== 'completed') return false;
  const ts = new Date(task.completed_at || task.completedOn || task.completedOnUTC || task.updatedAt || now);
  return ts >= dayStart;
});

console.log(`Completed today: ${completedToday.length}`);

// Generate task retrospectives
const taskRetros = [];
for (const task of completedToday) {
  const taskId = task.id || task.taskId || 'unknown';
  const title = task.title || task.name || taskId;
  const markdown = `# Retrospective for ${title}

**Task ID:** ${taskId}
**Status:** ${task.status || task.state}
**Completed**: ${new Date(task.completed_at || task.completedOn || task.completedOnUTC || task.updatedAt || now).toISOString()}

---

## What went well
* TODO

## What didn't go well
* TODO

## Action Items
1. TODO
`;
  const outFile = path.join(retrosDir, `task-${taskId}-${dateStr}.md`);
  fs.writeFileSync(outFile, markdown);
  taskRetros.push({ id: taskId, title, outFile });
  console.log(`  - Created retrospective for: ${title}`);
}

// Generate daily retrospective
const dailyFile = path.join(retrosDir, `daily-retro-${dateStr}.md`);
let dailyContent = `# Daily Retrospective – ${dateStr}

Generated at: ${now.toISOString()}

## Summary
- **Total tasks completed today:** ${completedToday.length}

---

## Tasks Completed Today

`;

if (taskRetros.length > 0) {
  for (const tr of taskRetros) {
    dailyContent += `- [${tr.title}](${path.basename(tr.outFile)})\n`;
  }
} else {
  dailyContent += '*No tasks completed today.*\n';
}

dailyContent += `
---

## Reflections
*TODO: Add overall reflections on the day's work*

## Blockers/Issues
*TODO: Note any systemic issues or blockers*

## Tomorrow's Focus
*TODO: Key priorities for tomorrow*
`;

fs.writeFileSync(dailyFile, dailyContent);
console.log(`\nDaily retrospective written to: ${dailyFile}`);

// If mission-control is a git repo, commit and push
const gitDir = path.join(mcDir, '.git');
if (fs.existsSync(gitDir)) {
  try {
    execSync('git add .', { cwd: mcDir, stdio: 'pipe' });
    execSync(`git commit -m "[retro] Daily retrospective for ${dateStr}"`, { cwd: mcDir, stdio: 'pipe' });
    execSync('git push', { cwd: mcDir, stdio: 'pipe' });
    console.log('Committed and pushed to git');
  } catch (e) {
    console.log('Git operations skipped (not a repo or no changes)');
  }
} else {
  console.log('Skipping git operations (mission-control is not a git repository)');
}

console.log('\nRetro funnel executed successfully.');
process.exit(0);
