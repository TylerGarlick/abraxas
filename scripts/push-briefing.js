#!/usr/bin/env node

/**
 * push-briefing.js
 * Clones tylergarlick/research, adds briefing, updates README, commits and pushes.
 * 
 * Usage: node push-briefing.js <type> <yyyy> <mm> <dd>
 * Example: node push-briefing.js morning 2026 03 24
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOKEN = require('child_process').execSync('/home/ubuntu/.openclaw/workspace/.credentials/get-token.sh').toString().trim();
const REPO = 'TylerGarlick/research';
const CLONE_DIR = '/tmp/research-repo';
const BRIEFINGS_SRC = '/home/ubuntu/.openclaw/workspace/mission-control/briefings';

function cleanDir(dir) {
  try { execSync(`rm -rf ${dir}`, { stdio: 'pipe' }); } catch { /* ignore */ }
}

function cloneRepo() {
  cleanDir(CLONE_DIR);
  console.log(`  Cloning ${REPO}...`);
  execSync(`git clone https://${TOKEN}@github.com/${REPO}.git ${CLONE_DIR}`, { stdio: 'pipe' });
}

function copyBriefing(type, yyyy, mm, dd) {
  const src = path.join(BRIEFINGS_SRC, yyyy, mm, dd, `${type}-briefing.md`);
  const dstDir = path.join(CLONE_DIR, yyyy, mm, dd);
  const dst = path.join(dstDir, `${type}-briefing.md`);

  if (!fs.existsSync(src)) {
    throw new Error(`Briefing not found: ${src}`);
  }

  fs.mkdirSync(dstDir, { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`  Copied: ${yyyy}/${mm}/${dd}/${type}-briefing.md`);
  return dst;
}

function updateReadme(type, yyyy, mm, dd) {
  const readmePath = path.join(CLONE_DIR, 'README.md');
  const link = `[${yyyy}-${mm}-${dd} ${type} briefing](./${yyyy}/${mm}/${dd}/${type}-briefing.md)`;
  const date = `${yyyy}-${mm}-${dd}`;
  const dateStr = `**${date}** — ${type} briefing`;
  const badge = type === 'morning' ? '🌅' : '🌙';

  let readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : `# ${REPO}\n\nDaily research briefings.\n`;

  // Find the briefings section
  const briefingSection = '## 📋 Briefings\n';
  let briefingsEntry = `- ${badge} ${link}\n`;

  if (!readme.includes(briefingSection)) {
    // Add briefings section
    readme += `\n${briefingSection}\n${briefingsEntry}\n`;
  } else {
    // Insert at top of briefings section (newest first)
    const sectionEnd = readme.indexOf('\n##', readme.indexOf(briefingSection) + briefingSection.length);
    if (sectionEnd === -1) {
      // Section at end of file
      readme = readme.replace(briefingSection, briefingSection + briefingsEntry);
    } else {
      readme = readme.slice(0, sectionEnd) + briefingsEntry + readme.slice(sectionEnd);
    }
  }

  fs.writeFileSync(readmePath, readme);
  console.log(`  Updated README.md`);
}

function commitAndPush(message) {
  execSync(`cd ${CLONE_DIR} && git config user.email "tyler@tjgarlick.com" && git config user.name "Tyler Garlick"`, { stdio: 'pipe' });
  execSync(`cd ${CLONE_DIR} && git add -A && git status`, { stdio: 'inherit' });
  execSync(`cd ${CLONE_DIR} && git commit -m "${message}"`, { stdio: 'pipe' });
  execSync(`cd ${CLONE_DIR} && git push origin main`, { stdio: 'pipe' });
  console.log('  Pushed to GitHub');
}

const [,, type, yyyy, mm, dd] = process.argv;

if (!type || !yyyy || !mm || !dd) {
  console.error('Usage: node push-briefing.js <morning|evening> <yyyy> <mm> <dd>');
  process.exit(1);
}

console.log(`\n🚀 Pushing ${type} briefing for ${yyyy}-${mm}-${dd} to ${REPO}\n`);

try {
  cloneRepo();
  const dst = copyBriefing(type, yyyy, mm, dd);
  updateReadme(type, yyyy, mm, dd);
  commitAndPush(`${type.charAt(0).toUpperCase() + type.slice(1)} briefing ${yyyy}-${mm}-${dd}`);
  console.log(`\n✅ Successfully pushed ${type} briefing to GitHub`);
} catch (err) {
  console.error(`\n❌ Error: ${err.message}`);
  process.exit(1);
}
