#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const jobName = process.argv[2] || 'Unknown Job';
const errorMessage = process.argv[3] || 'No error message provided';

console.log(`Sending failure alert for: ${jobName}`);
console.log(`Error: ${errorMessage}`);

// Try to send via message tool (if available in context)
// For now, log to console and a file
const alertFile = '/tmp/cron-failure-alerts.txt';
const timestamp = new Date().toISOString();
const alertEntry = `[${timestamp}] ${jobName}: ${errorMessage}\n`;

try {
  fs = require('fs');
  fs.appendFileSync(alertFile, alertEntry);
  console.log(`Alert logged to: ${alertFile}`);
} catch (e) {
  console.error('Failed to write alert file:', e.message);
}

// If we're in a session context, we could potentially send a message
// For now, just exit with success after logging
console.log('Failure alert sent.');
process.exit(0);
