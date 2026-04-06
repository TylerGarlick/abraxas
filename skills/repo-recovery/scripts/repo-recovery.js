#!/usr/bin/env node

/**
 * repo-recovery.js
 * Preserves files from a repo before resetting it.
 * 
 * Usage: node repo-recovery.js <owner/repo> [files...]
 * 
 * Example: node repo-recovery.js TylerGarlick/mission-control src/ SPEC.md README.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOKEN = 'ghp_REDACTED_OLD_TOKEN';
const WORKSPACE = '/home/ubuntu/.openclaw/workspace';

function gitClone(repo) {
  console.log(`📦 Cloning ${repo}...`);
  execSync(`cd /tmp && git clone https://${TOKEN}@github.com/${repo}.git 2>&1`, { stdio: 'pipe' });
  return `/tmp/${repo.split('/')[1]}`;
}

function gitPushClean(repoPath, commitMsg) {
  console.log(`🔄 Resetting ${repoPath} to clean state...`);
  execSync(`cd ${repoPath} && git checkout --orphan clean_state`, { stdio: 'pipe' });
  execSync(`cd ${repoPath} && git config user.email "maryjane@openclaw.ai" && git config user.name "Mary Jane"`, { stdio: 'pipe' });
  execSync(`cd ${repoPath} && git commit -m "${commitMsg}"`, { stdio: 'pipe' });
  execSync(`cd ${repoPath} && git push origin clean_state:main --force 2>&1`, { stdio: 'pipe' });
  console.log('✓ Pushed clean state to main');
}

function saveFiles(repoPath, repoName, files) {
  const saveDir = path.join(WORKSPACE, `${repoName}.old`);
  fs.mkdirSync(saveDir, { recursive: true });
  
  files.forEach(file => {
    const src = path.join(repoPath, file);
    const dst = path.join(saveDir, file);
    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        execSync(`cp -r ${src} ${dst}`, { stdio: 'pipe' });
      } else {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
      }
      console.log(`  ✓ Saved: ${file}`);
    } else {
      console.log(`  ✗ Missing: ${file}`);
    }
  });
  
  return saveDir;
}

function verifyReset(repo) {
  const url = `https://api.github.com/repos/${repo}/git/trees/main?recursive=1`;
  const res = execSync(`curl -s -H "Authorization: token ${TOKEN}" "${url}"`, { encoding: 'utf8' });
  const tree = JSON.parse(res).tree || [];
  return tree.map(t => t.path).slice(0, 5);
}

const [,, repoFull, ...files] = process.argv;

if (!repoFull) {
  console.error('Usage: node repo-recovery.js <owner/repo> [files...]');
  process.exit(1);
}

const [owner, repoName] = repoFull.split('/');
const repo = repoFull;

console.log(`\n🔧 REPO RECOVERY — ${repo}\n`);

// Clone
const repoPath = gitClone(repo);

// Save valuable files
const filesToSave = files.length > 0 ? files : ['src', 'SPEC.md', 'README.md', 'package.json'];
console.log(`\n💾 Saving files: ${filesToSave.join(', ')}`);
const saveDir = saveFiles(repoPath, repoName, filesToSave);
console.log(`  → Saved to: ${saveDir}`);

// Reset
const commitMsg = 'Reset: previous implementation saved to workspace';
gitPushClean(repoPath, commitMsg);

// Verify
console.log(`\n✅ Verification — main branch now contains:`);
const contents = verifyReset(repo);
contents.forEach(f => console.log(`  ${f}`));

console.log(`\n📋 Summary:
  Repo: ${repo}
  Saved to: ${saveDir}
  Status: RESET COMPLETE
`);
