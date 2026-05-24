#!/usr/bin/env node
/**
 * push-briefing.js
 * Usage: node push-briefing.js <yyyy> <mm> <dd>
 * Commits and pushes all briefings in research/YYYY/MM/DD/ to TylerGarlick/research
 */

const { execSync } = require('child_process');

const REPO = 'TylerGarlick/research';
const TOKEN_CMD = '~/.openclaw/workspace/.credentials/get-token.sh';
const OUTPUT_DIR = '/home/ubuntu/.openclaw/projects/research';
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

function sendToWebchat(dateStr, sectionCount, exitCode) {
  if (exitCode === 0) {
    const url = `https://github.com/TylerGarlick/research/blob/main/${dateStr}/evening-briefing.md`;
    const msg = `📋 *Evening briefing ready!*\n*Clearfield, UT*\n${sectionCount} sections curated\n<a href="${url}">View on GitHub →</a>`;
    const body = JSON.stringify({ channel: 'webchat', target: 'Tyler', message: msg });
    try {
      const res = execSync(
        `curl -s -X POST "${GATEWAY_URL}/api/messages/send" -H "Content-Type: application/json" -H "Authorization: Bearer ${GATEWAY_TOKEN}" -d '${body.replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      const parsed = JSON.parse(res);
      if (parsed.ok || parsed.message) {
        console.log('✓ Webchat announcement sent');
      } else {
        console.log('⚠ Webchat announcement skipped (channel not configured):', res.slice(0, 120));
      }
    } catch (e) {
      console.log('⚠ Webchat announcement failed:', e.message.slice(0, 200));
    }
  }
}

function main() {
  const [, , yyyy, mm, dd] = process.argv;

  if (!yyyy || !mm || !dd) {
    console.error('Usage: node push-briefing.js <yyyy> <mm> <dd>');
    process.exit(1);
  }

  try {
    const token = execSync(TOKEN_CMD, { encoding: 'utf8' }).trim();
    const remote = `https://${token}@github.com/${REPO}.git`;

    const opts = { cwd: OUTPUT_DIR, encoding: 'utf8', stdio: 'pipe' };

    // Set up git identity if not already set
    execSync(`git config user.name "Tyler Garlick"`, opts);
    execSync(`git config user.email "tyler@tylergarlick.com"`, opts);

    // Ensure remote uses token
    execSync(`git remote set-url origin ${remote}`, { ...opts, stdio: 'ignore' });

    // Commit all briefing files
    execSync(`git add ${yyyy}/${mm}/${dd}/*.md`, opts);
    const commitMsg = `Briefing ${yyyy}-${mm}-${dd} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]})`;
    execSync(`git commit -m "${commitMsg}"`, opts);

    // Push
    execSync(`git push origin main`, { ...opts, stdio: 'inherit' });
    console.log('Pushed:', commitMsg);

    // Count sections for the webchat summary
    const briefingPath = `${OUTPUT_DIR}/${yyyy}/${mm}/${dd}/evening-briefing.md`;
    let sectionCount = 0;
    try {
      const content = execSync(`grep -c "^## " "${briefingPath}" 2>/dev/null || echo 0`, { encoding: 'utf8' }).trim();
      sectionCount = parseInt(content, 10) || 0;
    } catch (_) {}
    const dateStr = `${yyyy}/${mm}/${dd}`;
    sendToWebchat(dateStr, sectionCount, 0);
  } catch (e) {
    if (e.status === 1) {
      // Nothing to commit
      console.log('Nothing to push — no changes detected');
    } else {
      console.error('Push failed:', e.message);
      process.exit(1);
    }
  }
}

main();
