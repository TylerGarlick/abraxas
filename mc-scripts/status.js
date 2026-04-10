#!/usr/bin/env node

/**
 * Mission Control Status Check
 * Checks for overdue tasks in the Beads system
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BEADS_DIR = process.env.BEADS_DIR || '/home/ubuntu/.openclaw/workspace/mc/.beads';
const OVERDUE_SUMMARY_PATH = '/tmp/overdue-summary.txt';

function main() {
  try {
    // Run bd list to get all tasks
    const output = execSync(`cd ${BEADS_DIR} && bd list --json`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const tasks = JSON.parse(output);
    const now = new Date();
    const overdueTasks = [];

    // Check for overdue tasks (tasks created more than 7 days ago and still open)
    // In a real implementation, this would check against a due_date field
    // For now, we'll consider P1 tasks created more than 24 hours ago as potentially overdue
    tasks.forEach(task => {
      if (task.status === 'open' || task.status === 'blocked') {
        const createdAt = new Date(task.created_at);
        const ageInHours = (now - createdAt) / (1000 * 60 * 60);
        
        // P1 tasks older than 24 hours are considered overdue
        // P2 tasks older than 7 days are considered overdue
        if ((task.priority === 1 && ageInHours > 24) || 
            (task.priority === 2 && ageInHours > 168)) {
          overdueTasks.push({
            ...task,
            ageInHours: Math.round(ageInHours * 10) / 10
          });
        }
      }
    });

    // Generate summary if there are overdue tasks
    if (overdueTasks.length > 0) {
      const summary = `OVERDUE TASKS SUMMARY
Generated: ${now.toISOString()}
Total overdue: ${overdueTasks.length}

${overdueTasks.map(task => `
ID: ${task.id}
Title: ${task.title}
Priority: P${task.priority}
Status: ${task.status}
Created: ${task.created_at}
Age: ${task.ageInHours} hours
Owner: ${task.owner || 'Unassigned'}
`).join('\n---\n')}

ACTION REQUIRED: Review and prioritize these tasks.
`;
      
      fs.writeFileSync(OVERDUE_SUMMARY_PATH, summary);
      console.log(`Found ${overdueTasks.length} overdue task(s). Summary written to ${OVERDUE_SUMMARY_PATH}`);
    } else {
      console.log('No overdue tasks found.');
    }

    // Output status
    console.log(`\nTotal tasks: ${tasks.length}`);
    console.log(`Open: ${tasks.filter(t => t.status === 'open').length}`);
    console.log(`Blocked: ${tasks.filter(t => t.status === 'blocked').length}`);
    console.log(`In Progress: ${tasks.filter(t => t.status === 'in_progress').length}`);

    process.exit(0);

  } catch (error) {
    console.error('Error checking task status:', error.message);
    if (error.stderr) {
      console.error('stderr:', error.stderr.toString());
    }
    process.exit(1);
  }
}

main();
