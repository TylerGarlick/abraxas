#!/usr/bin/env node

/**
 * pr-monitor.js
 * Stub script to monitor GitHub PRs.
 * Intended to be extended in the future.
 * Currently logs basic info and handles errors gracefully.
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY;
const OWNER = process.env.GITHUB_OWNER;

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable not set');
  process.exit(1);
}
if (!REPO) {
  console.error('Error: GITHUB_REPO or GITHUB_REPOSITORY environment variable not set');
  process.exit(1);
}
const [owner, repo] = REPO.includes('/') ? REPO.split('/') : [OWNER, REPO];
if (!owner || !repo) {
  console.error('Error: Unable to determine GitHub owner/repo');
  process.exit(1);
}

function getPRs() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/pulls?state=open`,
      method: 'GET',
      headers: {
        'User-Agent': 'pr-monitor-script',
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

(async () => {
  try {
    const prs = await getPRs();
    console.log(`Open PRs in ${owner}/${repo}: ${prs.length}`);
    prs.forEach(pr => {
      console.log(`#${pr.number} – ${pr.title} (${pr.user.login})`);
    });
  } catch (err) {
    console.error('Failed to fetch PRs:', err.message);
    process.exit(1);
  }
})();
