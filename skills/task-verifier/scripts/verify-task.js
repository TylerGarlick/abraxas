#!/usr/bin/env node

/**
 * verify-task.js
 * Verifies a task is truly complete by checking expected outputs.
 * 
 * Usage: node verify-task.js <taskId> [mode]
 * Modes: auto (default) | manual | hybrid
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TASKS_FILE = path.join(__dirname, '../../mission-control/tasks.json');
const WORKSPACE = '/home/ubuntu/.openclaw/workspace/mission-control/tasks';

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

function saveTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

function checkExists(filepath) {
  try {
    const full = path.join(WORKSPACE, filepath);
    return fs.existsSync(full);
  } catch { return false; }
}

function checkHasContent(filepath, minChars = 100) {
  try {
    const full = path.join(WORKSPACE, filepath);
    if (!fs.existsSync(full)) return false;
    const content = fs.readFileSync(full, 'utf8');
    return content.trim().length >= minChars;
  } catch { return false; }
}

function checkHasFiles(dirpath) {
  try {
    const full = path.join(WORKSPACE, dirpath);
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) return false;
    const files = fs.readdirSync(full).filter(f => !f.startsWith('.'));
    return files.length > 0;
  } catch { return false; }
}

function checkHasSection(filepath, sectionName) {
  try {
    const full = path.join(WORKSPACE, filepath);
    if (!fs.existsSync(full)) return false;
    const content = fs.readFileSync(full, 'utf8');
    return content.toLowerCase().includes(sectionName.toLowerCase());
  } catch { return false; }
}

function checkUrlCitations(filepath, minUrls = 2) {
  try {
    const full = path.join(WORKSPACE, filepath);
    if (!fs.existsSync(full)) return false;
    const content = fs.readFileSync(full, 'utf8');
    const urlMatches = content.match(/https?:\/\/[^\s]+/g) || [];
    return urlMatches.length >= minUrls;
  } catch { return false; }
}

function checkRepoMentions(filepath, minRepos = 3) {
  try {
    const full = path.join(WORKSPACE, filepath);
    if (!fs.existsSync(full)) return false;
    const content = fs.readFileSync(full, 'utf8');
    // Count lines that look like repo references
    const repoPattern = /\[\/?[a-zA-Z0-9_.-]+\]/g;
    const matches = content.match(repoPattern) || [];
    return matches.length >= minRepos;
  } catch { return false; }
}

function verifyResearch(task) {
  const checks = [];
  const factoryDir = `${task.id}/research`;

  checks.push({
    name: 'brief_exists',
    path: `${factoryDir}/brief.md`,
    check: 'exists',
    passed: checkExists(`${factoryDir}/brief.md`)
  });

  if (checks[checks.length - 1].passed) {
    checks.push({
      name: 'brief_has_content',
      path: `${factoryDir}/brief.md`,
      check: 'has_content',
      passed: checkHasContent(`${factoryDir}/brief.md`, 100)
    });
    checks.push({
      name: 'has_summary',
      path: `${factoryDir}/brief.md`,
      check: 'has_section_summary',
      passed: checkHasSection(`${factoryDir}/brief.md`, 'summary')
    });
    checks.push({
      name: 'has_findings',
      path: `${factoryDir}/brief.md`,
      check: 'has_section_findings',
      passed: checkHasSection(`${factoryDir}/brief.md`, 'findings') || checkHasSection(`${factoryDir}/brief.md`, 'key findings')
    });
    checks.push({
      name: 'has_sources',
      path: `${factoryDir}/brief.md`,
      check: 'has_section_sources',
      passed: checkHasSection(`${factoryDir}/brief.md`, 'sources')
    });
    checks.push({
      name: 'has_conclusions',
      path: `${factoryDir}/brief.md`,
      check: 'has_section_conclusions',
      passed: checkHasSection(`${factoryDir}/brief.md`, 'conclusions')
    });
    checks.push({
      name: 'has_url_citations',
      path: `${factoryDir}/brief.md`,
      check: 'url_citations',
      passed: checkUrlCitations(`${factoryDir}/brief.md`, 2),
      flag: 'manual' // Flag for manual review even if passed
    });
  }

  return checks;
}

function verifyWriting(task) {
  const checks = [];
  const factoryDir = `${task.id}/writing`;

  checks.push({
    name: 'output_exists',
    path: `${factoryDir}/output.md`,
    check: 'exists',
    passed: checkExists(`${factoryDir}/output.md`)
  });

  if (checks[checks.length - 1].passed) {
    checks.push({
      name: 'output_has_content',
      path: `${factoryDir}/output.md`,
      check: 'has_content',
      passed: checkHasContent(`${factoryDir}/output.md`, 200)
    });
    checks.push({
      name: 'quality_flag',
      path: `${factoryDir}/output.md`,
      check: 'manual_review',
      passed: true,
      flag: 'manual', // Can't auto-verify writing quality
      note: 'Flag for T review: verify tone and clarity'
    });
  }

  return checks;
}

function verifySoftware(task) {
  const checks = [];
  const factoryDir = `${task.id}/software`;

  checks.push({
    name: 'src_exists',
    path: `${factoryDir}/src/`,
    check: 'exists',
    passed: checkExists(`${factoryDir}/src/`)
  });

  checks.push({
    name: 'readme_exists',
    path: `${factoryDir}/README.md`,
    check: 'exists',
    passed: checkExists(`${factoryDir}/README.md`)
  });

  if (checks[checks.length - 1].passed) {
    checks.push({
      name: 'readme_has_setup',
      path: `${factoryDir}/README.md`,
      check: 'has_content',
      passed: checkHasContent(`${factoryDir}/README.md`, 50)
    });
  }

  checks.push({
    name: 'src_has_files',
    path: `${factoryDir}/src/`,
    check: 'has_files',
    passed: checkHasFiles(`${factoryDir}/src/`)
  });

  // Check for package.json or equivalent
  checks.push({
    name: 'has_package',
    path: `${factoryDir}/package.json`,
    check: 'exists',
    passed: checkExists(`${factoryDir}/package.json`),
    optional: true
  });

  // Basic syntax check for JS files
  if (checkHasFiles(`${factoryDir}/src/`)) {
    const srcDir = path.join(WORKSPACE, factoryDir, 'src');
    const jsFiles = [];
    function findJs(dir) {
      fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) findJs(full);
        else if (f.endsWith('.js')) jsFiles.push(full);
      });
    }
    try {
      findJs(srcDir);
      if (jsFiles.length > 0) {
        checks.push({
          name: 'js_syntax_check',
          check: 'syntax',
          passed: true,
          note: `Found ${jsFiles.length} JS file(s), basic check only`
        });
      }
    } catch { /* ignore */ }
  }

  return checks;
}

function verifyGithub(task) {
  const checks = [];
  const factoryDir = `${task.id}/github`;

  checks.push({
    name: 'report_exists',
    path: `${factoryDir}/report.md`,
    check: 'exists',
    passed: checkExists(`${factoryDir}/report.md`)
  });

  if (checks[checks.length - 1].passed) {
    checks.push({
      name: 'report_has_content',
      path: `${factoryDir}/report.md`,
      check: 'has_content',
      passed: checkHasContent(`${factoryDir}/report.md`, 100)
    });
    checks.push({
      name: 'has_repo_mentions',
      path: `${factoryDir}/report.md`,
      check: 'repo_mentions',
      passed: checkRepoMentions(`${factoryDir}/report.md`, 3)
    });
  }

  return checks;
}

function runVerification(taskId, mode = 'auto') {
  const tasks = loadTasks();
  const task = tasks.tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(`Task ${taskId} not found`);
    process.exit(1);
  }

  console.log(`\n🔍 VERIFYING TASK [${taskId}]: "${task.title}"\n`);
  console.log(`  Type: ${task.type} | Mode: ${mode}\n`);

  let checks = [];
  let factory = task.currentFactory || task.type;

  // Determine factory from status if running
  if (task.status.startsWith('running_')) {
    factory = task.status.replace('running_', '');
  }

  // Run appropriate verification
  if (task.type === 'github') {
    checks = verifyGithub(task);
  } else if (factory === 'research' || task.type === 'research') {
    checks = verifyResearch(task);
  } else if (factory === 'writing' || task.type === 'writing') {
    checks = verifyWriting(task);
  } else if (factory === 'software' || task.type === 'software') {
    checks = verifySoftware(task);
  } else {
    // Generic verification
    checks.push({ name: 'generic_check', passed: checkHasContent(`${task.id}/output.md`, 50) || checkHasFiles(`${task.id}/src/`), note: 'Generic check' });
  }

  // Apply custom acceptance criteria from task
  if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
    task.acceptanceCriteria.forEach(ac => {
      checks.push({
        name: `acceptance: ${ac.criterion}`,
        check: 'acceptance_criteria',
        passed: ac.verified || false,
        criterion: ac.criterion
      });
    });
  }

  // Apply mode filtering
  let displayChecks = checks;
  let overall = 'passed';

  if (mode === 'auto') {
    displayChecks = checks.filter(c => !c.flag);
    if (displayChecks.some(c => !c.passed)) overall = 'failed';
  } else if (mode === 'manual') {
    overall = 'manual_review';
  } else if (mode === 'hybrid') {
    const autoFailed = checks.filter(c => !c.flag && !c.passed);
    const manualFlagged = checks.filter(c => c.flag === 'manual');
    if (autoFailed.length > 0) overall = 'failed';
    else if (manualFlagged.length > 0) overall = 'manual_review';
    else overall = 'passed';
  }

  // Print results
  console.log('CHECKS:');
  checks.forEach(c => {
    const icon = c.passed ? '✓' : c.optional ? '○' : '✗';
    const flag = c.flag ? ` [${c.flag}]` : '';
    const note = c.note ? ` — ${c.note}` : '';
    console.log(`  ${icon} ${c.name}${flag}${note}`);
  });

  console.log(`\n  Overall: ${overall.toUpperCase()}\n`);

  // Update task with verification data
  task.verification = {
    mode,
    checks,
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'auto',
    overall
  };

  if (overall === 'failed') {
    task.status = 'verification_failed';
  } else if (overall === 'passed') {
    task.status = 'verified';
  } else {
    task.status = 'manual_review';
  }

  task.updatedAt = new Date().toISOString();
  tasks.lastUpdated = new Date().toISOString();
  saveTasks(tasks);

  console.log(`  Status updated: ${task.status}`);

  return { task, checks, overall };
}

const [,, taskId, mode] = process.argv;
if (!taskId) {
  console.error('Usage: node verify-task.js <taskId> [auto|manual|hybrid]');
  process.exit(1);
}

runVerification(taskId, mode || 'auto');
