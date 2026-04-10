#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoDir = path.resolve(__dirname, '..'); // workspace root assumed
const mcDir = path.join(repoDir, 'mission-control');
const retrosDir = path.join(mcDir, 'retros');

// Ensure retros directory exists
if (!fs.existsSync(retrosDir)) fs.mkdirSync(retrosDir, { recursive: true });

// Pull latest
try {
  execSync('git reset --hard', { cwd: mcDir });
  execSync('git pull', { cwd: mcDir });
} catch (e) { console.error('Git pull failed', e); process.exit(1); }

function readJSON(file){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e){ return null; }
}

// Task retrospectives
const tasksDir = path.join(mcDir, 'tasks');
const taskFiles = fs.readdirSync(tasksDir).filter(f=>f.endsWith('.json'));
const now = new Date();
const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tasksRetros = [];

for (const tf of taskFiles){
  const task = readJSON(path.join(tasksDir, tf));
  if (!task) continue;
  if (task.status !== 'completed') continue;
  const ts = new Date(task.completed_at || task.completedOn || task.completedOnUTC || now);
  if (ts < dayStart) continue; // only today
  const taskId = path.basename(tf, '.json');
  const markdown = `# Retrospective for ${task.title ?? taskId}\n\n**Status:** ${task.status}\n**Completed**: ${ts.toISOString()}\n\n---\n\n## What went well\n* TODO\n\n## What didn't go well\n* TODO\n\n## Action Items\n1. TODO`;
  const outFile = path.join(retrosDir, `task-${taskId}.md`);
  fs.writeFileSync(outFile, markdown);
  tasksRetros.push({id: taskId, outFile});
}

// Daily retrospective
const dailyFile = path.join(retrosDir, 'daily-retro.md');
let dailyContent = `# Daily Retrospective – ${now.toISOString().split('T')[0]}\n\n---\n\n`;
for (const tr of tasksRetros) {
  dailyContent += `- [${tr.id}](` + path.basename(tr.outFile) + `)\n`;
}
fs.writeFileSync(dailyFile, dailyContent);

// Weekly retrospective
const weekFile = path.join(retrosDir, 'weekly-retro.md');
let weekContent = `# Weekly Retrospective – Week of ${now.toISOString().split('T')[0]}\n\n---\n\n`;
weekContent += `- Daily: ` + path.basename(dailyFile) + `\n`;
fs.writeFileSync(weekFile, weekContent);

// Commit and push
try {
  execSync(`git add .`, { cwd: mcDir });
  execSync(`git commit -m "[retro-funnel] Updated daily and weekly retrospectives"`, { cwd: mcDir, stdio: 'inherit' });
  execSync(`git push`, { cwd: mcDir, stdio: 'inherit' });
} catch (e) { console.error('Git push failed', e); }

console.log('Retro funnel executed successfully.');