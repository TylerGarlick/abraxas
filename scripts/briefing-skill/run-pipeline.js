#!/usr/bin/env node
/**
 * run-pipeline.js
 * Fetch news, generate briefing, print to stdout
 */
const { execSync } = require('child_process');
const path = require('path');

const SCRIPT_DIR = path.join(__dirname);

function run(name, cmd) {
  console.error(`[pipeline] ${name}...`);
  try {
    const out = execSync(cmd, { cwd: SCRIPT_DIR, encoding: 'utf8', timeout: 25000 });
    console.error(`[pipeline] ${name} OK`);
    return out.trim();
  } catch (e) {
    console.error(`[pipeline] ${name} FAILED: ${e.message}`);
    process.exit(1);
  }
}

const newsJson = run('fetch-news', 'node fetch-news.js');
const news = JSON.parse(newsJson);
console.error(`[pipeline] fetched ${news.length} items`);

const briefing = run('generate-briefing', 
  `node generate-briefing.js evening '{}' '${newsJson.replace(/'/g, "'\"'\"'")}'`
);
console.log(briefing);
