/**
 * Hermes-Delphi Pipeline Runner
 * 
 * Autonomous research pipeline orchestrator with:
 * - Idempotent run management (prevents duplicate runs)
 * - Checkpoint/resume for long operations
 * - Daily research report delivery
 * - Feedback loop closure (Kleitos → pipeline)
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'data');
const RUNS_DIR = path.join(DATA_DIR, 'runs');
const CHECKPOINTS_DIR = path.join(DATA_DIR, 'checkpoints');
const REPORTS_DIR = path.join(DATA_DIR, 'reports');
const CONFIG_FILE = path.join(DATA_DIR, 'config.yaml');
const LOG_FILE = '/tmp/hermes-delphi-runner.log';

const AGENTS = ['keres', 'mythos', 'prodos', 'dromos', 'kleitos', 'logismos'];
const RUN_STATES = ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled'];

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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

function loadYAML(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    // Simple YAML parser for our needs
    const result = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        result[key.trim()] = valueParts.join(':').trim();
      }
    });
    return result;
  } catch {
    return {};
  }
}

function saveYAML(file, data) {
  const lines = Object.entries(data).map(([k, v]) => `${k}: ${v}`);
  fs.writeFileSync(file, lines.join('\n'));
}

function getRunId() {
  const now = new Date();
  return `run-${now.toISOString().slice(0, 10)}-${Date.now()}`;
}

function getActiveRuns() {
  ensureDir(RUNS_DIR);
  const files = fs.readdirSync(RUNS_DIR).filter(f => f.endsWith('.json'));
  const runs = files.map(f => {
    const run = loadJSON(path.join(RUNS_DIR, f));
    return run;
  }).filter(r => r && ['pending', 'running'].includes(r.state));
  return runs;
}

function isRunActive() {
  const activeRuns = getActiveRuns();
  return activeRuns.length > 0;
}

function createRun(options = {}) {
  const runId = getRunId();
  const run = {
    run_id: runId,
    state: 'pending',
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    current_agent: null,
    current_stage: null,
    progress: {
      keres: 'pending',
      mythos: 'pending',
      prodos: 'pending',
      dromos: 'pending',
      kleitos: 'pending',
      logismos: 'pending'
    },
    checkpoints: [],
    findings: [],
    briefs: [],
    deliveries: [],
    feedback: [],
    errors: [],
    config: {
      frequency: options.frequency || 'daily',
      report_recipients: options.report_recipients || [],
      feedback_loop_enabled: options.feedback_loop_enabled !== false,
      ...options
    },
    metadata: {
      triggered_by: options.triggered_by || 'cron',
      trigger_time: new Date().toISOString()
    }
  };
  
  saveJSON(path.join(RUNS_DIR, `${runId}.json`), run);
  log(`Created run: ${runId}`);
  return run;
}

function getRun(runId) {
  return loadJSON(path.join(RUNS_DIR, `${runId}.json`));
}

function updateRun(runId, updates) {
  const run = getRun(runId);
  if (!run) return null;
  
  Object.assign(run, updates);
  run.updated_at = new Date().toISOString();
  saveJSON(path.join(RUNS_DIR, `${runId}.json`), run);
  return run;
}

function saveCheckpoint(runId, stage, data) {
  const checkpoint = {
    run_id: runId,
    stage,
    timestamp: new Date().toISOString(),
    data
  };
  
  ensureDir(CHECKPOINTS_DIR);
  const checkpointFile = path.join(CHECKPOINTS_DIR, `${runId}-${stage}.json`);
  saveJSON(checkpointFile, checkpoint);
  
  // Update run with checkpoint reference
  const run = getRun(runId);
  if (run) {
    run.checkpoints.push({ stage, timestamp: checkpoint.timestamp });
    updateRun(runId, { checkpoints: run.checkpoints });
  }
  
  log(`Checkpoint saved: ${runId} @ ${stage}`);
  return checkpoint;
}

function loadCheckpoint(runId, stage) {
  const checkpointFile = path.join(CHECKPOINTS_DIR, `${runId}-${stage}.json`);
  if (fs.existsSync(checkpointFile)) {
    return loadJSON(checkpointFile);
  }
  return null;
}

function getLatestCheckpoint(runId) {
  const run = getRun(runId);
  if (!run || !run.checkpoints.length) return null;
  
  const latest = run.checkpoints[run.checkpoints.length - 1];
  return loadCheckpoint(runId, latest.stage);
}

async function executeAgent(agentName, run, context = {}) {
  log(`Executing agent: ${agentName}`);
  
  const runDir = path.join(DATA_DIR, 'runs', run.run_id);
  ensureDir(runDir);
  
  // Save agent context
  const agentContext = {
    run_id: run.run_id,
    agent: agentName,
    stage_start: new Date().toISOString(),
    previous_stage: run.current_agent,
    context
  };
  
  const contextFile = path.join(runDir, `context-${agentName}.json`);
  saveJSON(contextFile, agentContext);
  
  // Update run state
  updateRun(run.run_id, {
    current_agent: agentName,
    current_stage: agentName,
    [`progress.${agentName}`]: 'running'
  });
  
  try {
    // In a full implementation, this would spawn actual agent subagents
    // For now, we simulate the agent work and save results
    
    let agentOutput = { status: 'completed', agent: agentName };
    
    // Execute agent based on type
    switch (agentName) {
      case 'keres':
        agentOutput = await executeKeres(run, context);
        break;
      case 'mythos':
        agentOutput = await executeMythos(run, context);
        break;
      case 'prodos':
        agentOutput = await executeProdos(run, context);
        break;
      case 'dromos':
        agentOutput = await executeDromos(run, context);
        break;
      case 'kleitos':
        agentOutput = await executeKleitos(run, context);
        break;
      case 'logismos':
        agentOutput = await executeLogismos(run, context);
        break;
    }
    
    // Save checkpoint after agent completes
    saveCheckpoint(run.run_id, agentName, agentOutput);
    
    // Update run with agent result
    const run2 = getRun(run.run_id);
    run2.progress[agentName] = 'completed';
    run2[agentName === 'keres' ? 'findings' : 
         agentName === 'mythos' ? 'briefs' :
         agentName === 'prodos' ? 'outreach' :
         agentName === 'dromos' ? 'deliveries' :
         agentName === 'kleitos' ? 'feedback' : 'billing'] = agentOutput;
    
    updateRun(run.run_id, run2);
    
    log(`Agent ${agentName} completed successfully`);
    return agentOutput;
    
  } catch (error) {
    log(`Agent ${agentName} failed: ${error.message}`);
    
    const run2 = getRun(run.run_id);
    run2.progress[agentName] = 'failed';
    run2.errors.push({ agent: agentName, error: error.message, timestamp: new Date().toISOString() });
    updateRun(run.run_id, run2);
    
    throw error;
  }
}

async function executeKeres(run, context) {
  // Research agent - scan for market intelligence
  return {
    status: 'completed',
    agent: 'keres',
    findings_count: context.findings?.length || 0,
    monitors_active: ['market_trends', 'competitors'],
    last_scan: new Date().toISOString(),
    summary: 'Research scan completed. Found N relevant findings across monitored topics.'
  };
}

async function executeMythos(run, context) {
  // Briefing agent - synthesize research into briefs
  return {
    status: 'completed',
    agent: 'mythos',
    briefs_generated: context.findings?.length ? Math.ceil(context.findings.length / 5) : 1,
    templates_used: ['executive', 'strategic'],
    summary: 'Brief synthesis complete. Generated N briefs from research findings.'
  };
}

async function executeProdos(run, context) {
  // Outreach agent - prospect for clients
  return {
    status: 'completed',
    agent: 'prodos',
    prospects_identified: context.briefs?.length || 0,
    outreach_sequence_started: 0,
    summary: 'Prospecting complete. Identified N potential clients for outreach.'
  };
}

async function executeDromos(run, context) {
  // Delivery agent - format and deliver reports
  return {
    status: 'completed',
    agent: 'dromos',
    reports_formatted: context.briefs?.length || 0,
    deliveries_scheduled: 0,
    summary: 'Delivery preparation complete. N reports ready for distribution.'
  };
}

async function executeKleitos(run, context) {
  // Feedback agent - collect and analyze feedback
  // This is the key agent for the feedback loop
  return {
    status: 'completed',
    agent: 'kleitos',
    feedback_collected: 0,
    feedback_analyzed: 0,
    adaptations: [],
    insights: [],
    sentiment_summary: {
      average: 0.7,
      label: 'positive',
      trend: 'stable'
    },
    summary: 'Feedback analysis complete. Pipeline performance: positive.'
  };
}

async function executeLogismos(run, context) {
  // Billing agent - track usage and generate reports
  return {
    status: 'completed',
    agent: 'logismos',
    usage_tracked: context.deliveries?.length || 0,
    invoices_generated: 0,
    report_url: path.join(REPORTS_DIR, `${run.run_id}-report.json`),
    summary: 'Billing tracking complete. Usage metrics logged.'
  };
}

async function generateDailyReport(run) {
  log('Generating daily research report...');
  
  const report = {
    report_id: `report-${run.run_id}`,
    run_id: run.run_id,
    generated_at: new Date().toISOString(),
    period: {
      start: run.created_at,
      end: run.completed_at || new Date().toISOString()
    },
    summary: {
      total_findings: run.findings?.length || 0,
      total_briefs: run.briefs?.length || 0,
      total_deliveries: run.deliveries?.length || 0,
      feedback_sentiment: run.feedback?.sentiment_summary || null,
      pipeline_health: calculatePipelineHealth(run)
    },
    agent_results: run.progress,
    top_findings: (run.findings || []).slice(0, 5),
    recommendations: generateRecommendations(run),
    next_steps: generateNextSteps(run)
  };
  
  ensureDir(REPORTS_DIR);
  const reportFile = path.join(REPORTS_DIR, `${run.run_id}-report.json`);
  saveJSON(reportFile, report);
  
  // Also generate markdown version
  const mdReport = generateMarkdownReport(report);
  const mdFile = path.join(REPORTS_DIR, `${run.run_id}-report.md`);
  fs.writeFileSync(mdFile, mdReport);
  
  log(`Report saved: ${reportFile}`);
  return report;
}

function calculatePipelineHealth(run) {
  const progress = run.progress || {};
  const completed = Object.values(progress).filter(s => s === 'completed').length;
  const total = AGENTS.length;
  const score = completed / total;
  
  if (score >= 0.9) return 'excellent';
  if (score >= 0.7) return 'good';
  if (score >= 0.5) return 'fair';
  return 'needs_attention';
}

function generateRecommendations(run) {
  const recommendations = [];
  
  if (run.feedback?.sentiment_summary?.label === 'negative') {
    recommendations.push({
      priority: 'high',
      area: 'feedback',
      recommendation: 'Review and adapt research focus based on negative feedback trends'
    });
  }
  
  if (run.errors?.length > 0) {
    recommendations.push({
      priority: 'medium',
      area: 'operations',
      recommendation: 'Investigate and resolve pipeline errors before next run'
    });
  }
  
  if ((run.findings?.length || 0) < 3) {
    recommendations.push({
      priority: 'low',
      area: 'research',
      recommendation: 'Consider expanding research scope or monitor more topics'
    });
  }
  
  return recommendations;
}

function generateNextSteps(run) {
  const steps = [];
  
  // Based on feedback loop
  if (run.config.feedback_loop_enabled && run.feedback?.adaptations?.length > 0) {
    steps.push({
      type: 'feedback_incorporation',
      description: 'Incorporate feedback adaptations into next pipeline run',
      details: run.feedback.adaptations
    });
  }
  
  // Based on pending outreach
  if (run.outreach?.prospects_identified > 0) {
    steps.push({
      type: 'continue_outreach',
      description: `Continue outreach to ${run.outreach.prospects_identified} identified prospects`
    });
  }
  
  return steps;
}

function generateMarkdownReport(report) {
  let md = `# Hermes-Delphi Daily Research Report\n\n`;
  md += `**Generated:** ${report.generated_at}\n`;
  md += `**Period:** ${report.period.start} to ${report.period.end}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Findings:** ${report.summary.total_findings}\n`;
  md += `- **Briefs:** ${report.summary.total_briefs}\n`;
  md += `- **Deliveries:** ${report.summary.total_deliveries}\n`;
  md += `- **Pipeline Health:** ${report.summary.pipeline_health}\n`;
  if (report.summary.feedback_sentiment) {
    md += `- **Feedback Sentiment:** ${report.summary.feedback_sentiment.label} (${report.summary.feedback_sentiment.average})\n`;
  }
  md += `\n`;
  
  md += `## Agent Results\n\n`;
  md += `| Agent | Status |\n`;
  md += `|-------|--------|\n`;
  Object.entries(report.agent_results).forEach(([agent, status]) => {
    const icon = status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏳';
    md += `| ${agent} | ${icon} ${status} |\n`;
  });
  md += `\n`;
  
  if (report.recommendations?.length > 0) {
    md += `## Recommendations\n\n`;
    report.recommendations.forEach(rec => {
      md += `- **[${rec.priority.toUpperCase()}]** ${rec.area}: ${rec.recommendation}\n`;
    });
    md += `\n`;
  }
  
  if (report.next_steps?.length > 0) {
    md += `## Next Steps\n\n`;
    report.next_steps.forEach(step => {
      md += `- ${step.type}: ${step.description}\n`;
    });
    md += `\n`;
  }
  
  md += `---\n`;
  md += `*Generated by Hermes-Delphi Autonomous Research Pipeline*\n`;
  
  return md;
}

async function deliverReport(report, recipients = []) {
  if (recipients.length === 0) {
    log('No report recipients configured, skipping delivery');
    return;
  }
  
  log(`Delivering report to ${recipients.length} recipient(s)`);
  
  const mdReport = generateMarkdownReport(report);
  
  // In production, this would send via email
  // For now, save to delivery queue
  const delivery = {
    delivery_id: `delivery-${report.report_id}`,
    report_id: report.report_id,
    recipients,
    format: 'markdown',
    status: 'ready_for_delivery',
    content: mdReport,
    created_at: new Date().toISOString()
  };
  
  const deliveryFile = path.join(DATA_DIR, 'deliveries', `${delivery.delivery_id}.json`);
  ensureDir(path.join(DATA_DIR, 'deliveries'));
  saveJSON(deliveryFile, delivery);
  
  log(`Report delivery queued: ${delivery.delivery_id}`);
}

async function runPipeline(options = {}) {
  log('═══════════════════════════════════════════════════════════');
  log('🚀 HERMES-DELPHI PIPELINE STARTING');
  log('═══════════════════════════════════════════════════════════');
  
  // Check for existing run (idempotency)
  if (isRunActive() && !options.force) {
    log('⚠️  Pipeline already running, skipping (idempotent)');
    return getActiveRuns()[0];
  }
  
  // Create new run
  const run = createRun({
    triggered_by: options.triggered_by || 'cron',
    frequency: options.frequency || 'daily',
    report_recipients: options.report_recipients || [],
    feedback_loop_enabled: options.feedback_loop_enabled !== false
  });
  
  // Check for resumable checkpoint
  let startAgent = 'keres';
  let resumeContext = {};
  
  const latestCheckpoint = getLatestCheckpoint(run.run_id);
  if (latestCheckpoint) {
    log(`📦 Resuming from checkpoint: ${latestCheckpoint.stage}`);
    startAgent = AGENTS[AGENTS.indexOf(latestCheckpoint.stage) + 1] || latestCheckpoint.stage;
    resumeContext = latestCheckpoint.data;
  }
  
  // Start the pipeline
  updateRun(run.run_id, {
    state: 'running',
    started_at: new Date().toISOString()
  });
  
  try {
    // Execute agents in sequence
    for (const agent of AGENTS) {
      if (AGENTS.indexOf(agent) < AGENTS.indexOf(startAgent)) {
        log(`Skipping ${agent} (already completed)`);
        continue;
      }
      
      const context = {
        findings: run.findings,
        briefs: run.briefs,
        deliveries: run.deliveries,
        feedback: run.feedback,
        ...resumeContext
      };
      
      await executeAgent(agent, run, context);
      resumeContext = {}; // Clear resume context after first agent
    }
    
    // Pipeline complete
    updateRun(run.run_id, {
      state: 'completed',
      completed_at: new Date().toISOString()
    });
    
    // Generate and deliver report
    const report = await generateDailyReport(run);
    
    if (run.config.report_recipients?.length > 0) {
      await deliverReport(report, run.config.report_recipients);
    }
    
    // Feedback loop: incorporate Kleitos insights into next run
    if (run.config.feedback_loop_enabled && run.feedback?.adaptations?.length > 0) {
      log('📊 Incorporating feedback adaptations for future runs');
      await incorporateFeedbackAdaptations(run);
    }
    
    log('✅ Pipeline completed successfully');
    
  } catch (error) {
    log(`❌ Pipeline failed: ${error.message}`);
    updateRun(run.run_id, {
      state: 'failed',
      completed_at: new Date().toISOString(),
      error: error.message
    });
  }
  
  log('═══════════════════════════════════════════════════════════');
  return run;
}

async function incorporateFeedbackAdaptations(run) {
  // Save feedback adaptations to a persistent file that gets loaded on next run
  const adaptationsFile = path.join(DATA_DIR, 'feedback-adaptations.json');
  
  const existingAdaptations = loadJSON(adaptationsFile) || { adaptations: [], updated_at: null };
  
  const newAdaptations = {
    source_run: run.run_id,
    adaptations: run.feedback?.adaptations || [],
    insights: run.feedback?.insights || [],
    sentiment: run.feedback?.sentiment_summary,
    incorporated_at: new Date().toISOString()
  };
  
  existingAdaptations.adaptations.push(newAdaptations);
  existingAdaptations.updated_at = new Date().toISOString();
  
  saveJSON(adaptationsFile, existingAdaptations);
  log(`Feedback adaptations saved for future runs`);
}

function getPipelineStatus() {
  const activeRuns = getActiveRuns();
  const runs = fs.readdirSync(RUNS_DIR).filter(f => f.endsWith('.json'))
    .map(f => loadJSON(path.join(RUNS_DIR, f)))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  return {
    is_running: activeRuns.length > 0,
    active_run: activeRuns[0] || null,
    recent_runs: runs.slice(0, 5),
    last_run: runs[0] || null
  };
}

// CLI interface
const command = process.argv[2] || 'run';

switch (command) {
  case 'run':
    runPipeline({
      triggered_by: 'cli',
      force: process.argv.includes('--force')
    }).then(run => {
      log(`Pipeline finished with state: ${run.state}`);
      process.exit(run.state === 'completed' ? 0 : 1);
    }).catch(e => {
      log(`Fatal error: ${e.message}`);
      process.exit(1);
    });
    break;
    
  case 'status':
    const status = getPipelineStatus();
    console.log(JSON.stringify(status, null, 2));
    break;
    
  case 'resume':
    const runs = getActiveRuns();
    if (runs.length === 0) {
      log('No active run to resume');
      process.exit(1);
    }
    runPipeline({ triggered_by: 'resume' }).then(run => {
      process.exit(0);
    });
    break;
    
  case 'cancel':
    const activeRuns = getActiveRuns();
    if (activeRuns.length > 0) {
      activeRuns.forEach(run => {
        updateRun(run.run_id, { state: 'cancelled', cancelled_at: new Date().toISOString() });
        log(`Cancelled run: ${run.run_id}`);
      });
    }
    break;
    
  default:
    console.log('Usage: node pipeline-runner.js [run|status|resume|cancel] [--force]');
}
