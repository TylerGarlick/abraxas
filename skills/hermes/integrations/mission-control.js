/**
 * Mission-Control Integration for Hermes-Delphi
 * 
 * Bridges Hermes-Delphi pipeline with Abraxas  cron system.
 * Allows  to trigger Hermes-Delphi runs and receive reports.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ABRAXAS_DIR = path.join(__dirname, '..', '..');
const HERMES_DIR = path.join(__dirname, '..');
const MISSION_CONTROL_DIR = path.join(ABRAXAS_DIR, '');
const BACKLOG_FILE = path.join(MISSION_CONTROL_DIR, 'planning', 'backlog.json');

const LOG_FILE = '/tmp/hermes-delphi-mc-integration.log';

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [MC-Integration] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/**
 * Check if Hermes-Delphi pipeline should run today
 * Based on  backlog configuration
 */
function shouldRunToday() {
  // Check if there's a task forcing a run
  const backlog = loadJSON(BACKLOG_FILE);
  if (!backlog || !backlog.tasks) return true; // Default to run
  
  // Check for any Hermes-Delphi related tasks
  const hdTasks = backlog.tasks.filter(t => 
    t.repo === 'TylerGarlick/abraxas' && 
    t.title && t.title.toLowerCase().includes('hermes')
  );
  
  // If there are pending Hermes tasks, definitely run
  if (hdTasks.some(t => t.state === 'detected' || t.state === 'planned')) {
    return true;
  }
  
  // Check last run time
  const lastRunFile = path.join(HERMES_DIR, 'data', '.last_run');
  if (fs.existsSync(lastRunFile)) {
    const lastRun = fs.readFileSync(lastRunFile, 'utf8').trim();
    const lastRunDate = new Date(lastRun);
    const now = new Date();
    
    // Run if last run was more than 20 hours ago
    const hoursSinceRun = (now - lastRunDate) / (1000 * 60 * 60);
    return hoursSinceRun >= 20;
  }
  
  return true;
}

/**
 * Mark that a run attempted
 */
function markRunAttempt() {
  const lastRunFile = path.join(HERMES_DIR, 'data', '.last_run');
  fs.writeFileSync(lastRunFile, new Date().toISOString());
}

/**
 * Create  task for Hermes-Delphi report delivery
 */
function createReportTask(report) {
  const backlog = loadJSON(BACKLOG_FILE);
  if (!backlog || !backlog.tasks) {
    log('No backlog found, skipping task creation');
    return;
  }
  
  // Check if task already exists for this report
  const existingTask = backlog.tasks.find(t => 
    t.title && t.title.includes(report.report_id)
  );
  
  if (existingTask) {
    log(`Task already exists for ${report.report_id}`);
    return;
  }
  
  // Create deliver task
  const task = {
    id: `BL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-HD-${Date.now().toString().slice(-3)}`,
    title: `Hermes-Delphi: Deliver Research Report`,
    description: `Deliver daily research report to configured recipients.\n\nReport: ${report.report_id}\nFindings: ${report.summary.total_findings}\nBriefs: ${report.summary.total_briefs}\nPipeline Health: ${report.summary.pipeline_health}`,
    category: 'non_code',
    repo: 'TylerGarlick/abraxas',
    priority: 'P2',
    state: 'detected',
    detected_at: new Date().toISOString(),
    detected_from: 'hermes-delphi-pipeline',
    plan_summary: `Review and deliver report: ${report.report_id}`,
    metadata: {
      report_id: report.report_id,
      run_id: report.run_id
    }
  };
  
  backlog.tasks.push(task);
  saveJSON(BACKLOG_FILE, backlog);
  
  log(`Created backlog task: ${task.id}`);
}

/**
 * Handle feedback loop - send Kleitos feedback to 
 */
function handleFeedbackLoop(run) {
  if (!run.feedback || !run.feedback.adaptations || run.feedback.adaptations.length === 0) {
    log('No feedback adaptations to route');
    return;
  }
  
  const backlog = loadJSON(BACKLOG_FILE);
  if (!backlog || !backlog.tasks) return;
  
  // Create improvement tasks from feedback
  run.feedback.adaptations.forEach((adaptation, idx) => {
    const task = {
      id: `BL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-HD-FB-${idx}`,
      title: `Hermes-Delphi: Implement Feedback Adaptation`,
      description: `Based on Kleitos feedback analysis, implement the following adaptation:\n\n${JSON.stringify(adaptation, null, 2)}`,
      category: 'non_code',
      repo: 'TylerGarlick/abraxas',
      priority: 'P2',
      state: 'detected',
      detected_at: new Date().toISOString(),
      detected_from: 'hermes-delphi-feedback-loop',
      plan_summary: `Implement adaptation from feedback: ${adaptation.type || 'general'}`
    };
    
    backlog.tasks.push(task);
    log(`Created feedback loop task: ${task.id}`);
  });
  
  saveJSON(BACKLOG_FILE, backlog);
}

/**
 * Main integration entry point
 */
async function integrate() {
  log('Starting Mission-Control integration...');
  
  // Check if we should run
  if (!shouldRunToday()) {
    log('Skipping run (already ran recently or blocked by task)');
    return { skipped: true, reason: 'recently_ran' };
  }
  
  // Run the Hermes-Delphi pipeline
  log('Triggering Hermes-Delphi pipeline...');
  
  return new Promise((resolve, reject) => {
    const runnerPath = path.join(HERMES_DIR, 'runner', 'pipeline-runner.js');
    
    exec(`cd "${path.join(HERMES_DIR, 'runner')}" && node pipeline-runner.js run`, (error, stdout, stderr) => {
      if (error) {
        log(`Pipeline error: ${error.message}`);
        reject(error);
        return;
      }
      
      log('Pipeline output received');
      
      // Parse report from output
      const reportFile = path.join(HERMES_DIR, 'data', 'reports');
      const files = fs.readdirSync(reportFile).filter(f => f.endsWith('-report.json'));
      
      if (files.length > 0) {
        const latestReport = loadJSON(path.join(reportFile, files[files.length - 1]));
        
        // Create  task for report
        createReportTask(latestReport);
        
        // Handle feedback loop
        const runFile = path.join(HERMES_DIR, 'data', 'runs');
        const runFiles = fs.readdirSync(runFile).filter(f => f.endsWith('.json'));
        if (runFiles.length > 0) {
          const latestRun = loadJSON(path.join(runFile, runFiles[runFiles.length - 1]));
          handleFeedbackLoop(latestRun);
        }
        
        markRunAttempt();
        resolve({ success: true, report: latestReport });
      } else {
        markRunAttempt();
        resolve({ success: true, report: null });
      }
    });
  });
}

// CLI
const command = process.argv[2] || 'run';

switch (command) {
  case 'run':
    integrate().then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }).catch(e => {
      console.error(e.message);
      process.exit(1);
    });
    break;
    
  case 'should-run':
    console.log(shouldRunToday() ? 'yes' : 'no');
    break;
    
  default:
    console.log('Usage: node -integration.js [run|should-run]');
}
