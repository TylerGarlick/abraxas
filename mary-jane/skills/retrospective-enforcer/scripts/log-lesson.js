#!/usr/bin/env node

/**
 * log-lesson.js
 * Appends a lesson, improvement, or suggestion to lessons-learned.json
 * 
 * Usage: node log-lesson.js <taskId> <lesson|improvement|suggestion> <text>
 * 
 * Example:
 *   node log-lesson.js abc12345 lesson "GitHub factory fetched 20 commits cleanly"
 *   node log-lesson.js abc12345 improvement "Factory ran 10 min longer than expected"
 *   node log-lesson.js abc12345 suggestion "Add a repo-health factory for deeper analysis"
 */

const fs = require('fs');
const path = require('path');

const LESSONS_FILE = path.join(__dirname, '../..//retrospectives/lessons-learned.json');

function loadLessons() {
  try {
    return JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8'));
  } catch {
    return { version: '1.0.0', lessonsLearned: [], systemImprovements: [], suggestedTasks: [], lastUpdated: null };
  }
}

function saveLessons(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(LESSONS_FILE, JSON.stringify(data, null, 2));
}

const [,, taskId, type, ...textParts] = process.argv;

if (!taskId || !type || textParts.length === 0) {
  console.error('Usage: node log-lesson.js <taskId> <lesson|improvement|suggestion> <text>');
  console.error('Examples:');
  console.error('  node log-lesson.js abc12345 lesson "Factory completed cleanly"');
  console.error('  node log-lesson.js abc12345 improvement "Took longer than expected"');
  console.error('  node log-lesson.js abc12345 suggestion "Add error handling"');
  process.exit(1);
}

const text = textParts.join(' ');
const entry = {
  taskId,
  text,
  date: new Date().toISOString().split('T')[0]
};

const data = loadLessons();

if (type === 'lesson') {
  data.lessonsLearned.push(entry);
  console.log(`✓ Logged LESSON to task [${taskId}]: "${text}"`);
} else if (type === 'improvement') {
  data.systemImprovements.push(entry);
  console.log(`✓ Logged IMPROVEMENT to task [${taskId}]: "${text}"`);
} else if (type === 'suggestion') {
  data.suggestedTasks.push(entry);
  console.log(`✓ Logged SUGGESTION to task [${taskId}]: "${text}"`);
} else {
  console.error(`Unknown type: ${type}. Use lesson, improvement, or suggestion.`);
  process.exit(1);
}

saveLessons(data);
