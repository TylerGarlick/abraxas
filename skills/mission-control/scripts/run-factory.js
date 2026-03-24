#!/usr/bin/env node

/**
 * run-factory.js
 * Spawns a subagent to run a specific factory for a task.
 * 
 * Usage: node run-factory.js <taskId> <factory>
 * Factories: research | writing | software
 */

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../tasks.json');
const WORKSPACE = '/home/ubuntu/.openclaw/workspace/mission-control/tasks';

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

function saveTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

function loadTask(taskId) {
  const tasks = loadTasks();
  return tasks.tasks.find(t => t.id === taskId);
}

function updateTaskStatus(taskId, status, updates = {}) {
  const data = loadTasks();
  const task = data.tasks.find(t => t.id === taskId);
  if (!task) { console.error(`Task ${taskId} not found`); return; }
  task.status = status;
  task.updatedAt = new Date().toISOString();
  Object.assign(task, updates);
  data.lastUpdated = new Date().toISOString();
  saveTasks(data);
}

async function runFactory(taskId, factory) {
  const task = loadTask(taskId);
  if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
  
  const factoryDir = path.join(WORKSPACE, taskId, factory);
  fs.mkdirSync(factoryDir, { recursive: true });
  
  // Build the task context for the subagent
  const context = {
    taskId,
    factory,
    objective: task.title,
    type: task.type,
    factoryIndex: task.factories.indexOf(factory),
    chainComplete: task.chainComplete || {},
    subtasks: task.subtasks,
    workspace: factoryDir
  };
  
  // Write context to working directory
  fs.writeFileSync(path.join(factoryDir, 'context.json'), JSON.stringify(context, null, 2));
  
  console.log(`🚀 Spawning ${factory} factory for task [${taskId}]...`);
  
  // Update task status
  updateTaskStatus(taskId, `running_${factory}`, { currentFactory: factory });
  
  // Build the prompt for the subagent based on factory type
  let prompt = '';
  if (factory === 'research') {
    prompt = `You are running the RESEARCH FACTORY for task [${taskId}]: "${task.title}"
    
Working directory: ${factoryDir}
Context file: ${factoryDir}/context.json

YOUR JOB:
1. Research the objective thoroughly using web search and fetch
2. Write your findings to: ${factoryDir}/brief.md
3. Format the brief with: Summary, Key Findings, Sources, Conclusions
4. When done, update the task status by calling the OpenClaw tool to patch tasks.json

Read the context.json for full details. Verify all facts before including them.`;

  } else if (factory === 'writing') {
    const hasResearch = task.chainComplete?.research;
    prompt = `You are running the WRITING FACTORY for task [${taskId}]: "${task.title}"
    
Working directory: ${factoryDir}
Context file: ${factoryDir}/context.json
${hasResearch ? `Research brief: ${WORKSPACE}/${taskId}/research/brief.md` : ''}

YOUR JOB:
1. ${hasResearch ? 'Read the research brief and write based on it' : 'Write the content as specified'}
2. Write the output to: ${factoryDir}/output.md
3. Format appropriately for the content type
4. When done, update the task status by calling the OpenClaw tool to patch tasks.json

Read the context.json for full details.`;

  } else if (factory === 'software') {
    const hasWriting = task.chainComplete?.writing;
    prompt = `You are running the SOFTWARE FACTORY for task [${taskId}]: "${task.title}"
    
Working directory: ${factoryDir}
Context file: ${factoryDir}/context.json
${hasWriting ? `Spec/requirements: ${WORKSPACE}/${taskId}/writing/output.md` : ''}

YOUR JOB:
1. ${hasWriting ? 'Read the spec from the writing stage and implement it' : 'Implement the software as specified'}
2. Create the code in: ${factoryDir}/src/
3. Write a README.md with setup and run instructions
4. When done, update the task status by calling the OpenClaw tool to patch tasks.json

Read the context.json for full details. Write real, working code. No placeholders.`;
  }
  
  return { prompt, factoryDir, context };
}

const [,, taskId, factory] = process.argv;
if (!taskId || !factory) {
  console.error('Usage: node run-factory.js <taskId> <factory>');
  process.exit(1);
}

runFactory(taskId, factory).then(({ prompt }) => {
  console.log('Prompt ready for subagent:');
  console.log('---');
  console.log(prompt);
  console.log('---');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
