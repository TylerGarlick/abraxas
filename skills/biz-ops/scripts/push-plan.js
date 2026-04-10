#!/usr/bin/env node

/**
 * push-plan.js
 * Clones biz-plans repo, adds plan, commits and pushes.
 * 
 * Usage: node push-plan.js <yyyy> <mm> <dd> <filename>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOKEN = 'ghp_REDACTED_OLD_TOKEN';
const REPO = 'tylergarlick/biz-plans';
const CLONE_DIR = '/tmp/biz-plans-repo';
const PLANS_SRC = '/home/ubuntu/.openclaw/workspace/mission-control/biz-plans';

function cleanDir(dir) {
  try { execSync(`rm -rf ${dir}`, { stdio: 'pipe' }); } catch { /* ignore */ }
}

function cloneRepo() {
  cleanDir(CLONE_DIR);
  execSync(`git clone https://${TOKEN}@github.com/${REPO}.git ${CLONE_DIR}`, { stdio: 'pipe' });
}

function copyPlan(yyyy, mm, dd, filename) {
  const src = path.join(PLANS_SRC, yyyy, mm, dd, filename);
  const dstDir = path.join(CLONE_DIR, yyyy, mm, dd);
  const dst = path.join(dstDir, filename);

  if (!fs.existsSync(src)) {
    throw new Error(`Plan not found: ${src}`);
  }

  fs.mkdirSync(dstDir, { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`  Copied: ${yyyy}/${mm}/${dd}/${filename}`);
  return dst;
}

function commitAndPush(msg) {
  execSync(`cd ${CLONE_DIR} && git config user.email "tyler@tjgarlick.com" && git config user.name "Tyler Garlick"`, { stdio: 'pipe' });
  execSync(`cd ${CLONE_DIR} && git add -A`, { stdio: 'pipe' });
  execSync(`cd ${CLONE_DIR} && git commit -m "${msg}"`, { stdio: 'pipe' });
  execSync(`cd ${CLONE_DIR} && git push origin main`, { stdio: 'pipe' });
  console.log('  Pushed to GitHub');
}

const [,, yyyy, mm, dd, filename] = process.argv;

if (!yyyy || !mm || !dd || !filename) {
  console.error('Usage: node push-plan.js <yyyy> <mm> <dd> <filename>');
  process.exit(1);
}

console.log(`\n🚀 Pushing plan to ${REPO}\n`);

try {
  cloneRepo();
  copyPlan(yyyy, mm, dd, filename);
  commitAndPush(`Add opportunity plan: ${filename}`);
  console.log(`\n✅ Successfully pushed plan to GitHub`);
} catch (err) {
  console.error(`\n❌ Error: ${err.message}`);
  process.exit(1);
}
