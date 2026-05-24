#!/usr/bin/env node
/**
 * spawn-briefing.js — called by cron
 * Usage: node spawn-briefing.js <morning|evening>
 * 
 * Spawns an isolated agentTurn that:
 *   1. Fetches weather
 *   2. Searches news for each category
 *   3. Optionally does market research
 *   4. Generates briefing markdown
 *   5. Pushes to GitHub
 *
 * All briefing content lives in: /home/ubuntu/.openclaw/projects/research
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = '/home/ubuntu/.openclaw/projects/research';
const TOKEN_CMD = '~/.openclaw/workspace/.credentials/get-token.sh';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDatePaths() {
  const now = new Date();
  const mstOffset = -7 * 60;
  const localMs = now.getTime() + (now.getTimezoneOffset() + mstOffset) * 60 * 1000;
  const mst = new Date(localMs);
  const yyyy = String(mst.getUTCFullYear());
  const mm = String(mst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(mst.getUTCDate()).padStart(2, '0');
  const timeStr = now.toISOString().split('T')[1].slice(0, 5);
  return { yyyy, mm, dd, timeStr };
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=41.085&longitude=-112.013&current=temperature_2m,weather_code,wind_speed_10m&timezone=America/Denver';
  try {
    const d = await fetchJson(url);
    const c = d.current;
    const codes = {0:'Clear',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Fog',48:'Rime Fog',55:'Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',80:'Rain Showers',81:'Heavy Rain',82:'Violent Rain',95:'Thunderstorm'};
    return {
      temp: c.temperature_2m + '°C',
      condition: codes[c.weather_code] || 'Unknown',
      wind: c.wind_speed_10m + ' km/h',
      code: c.weather_code
    };
  } catch (e) {
    return { temp: 'N/A', condition: 'N/A', wind: 'N/A', code: 0 };
  }
}

// ─── news via web_search ────────────────────────────────────────────────────

// These are passed to the agent; we just return the query strings
const NEWS_QUERIES = [
  { category: 'AI', query: '(artificial intelligence OR "large language model" OR "AI agent" OR GPT OR Claude OR Gemini OR AGI) AND (news 2026)' },
  { category: 'Technology', query: '(technology OR software OR "developer tools" OR startup) AND (news 2026)' },
  { category: 'Psychology', query: '(depth psychology OR Jungian OR archetypes OR "shadow work" OR "collective unconscious" OR "analytical psychology" OR "Carl Jung") AND (research OR news 2026)' },
  { category: 'Abraxas', query: 'Abraxas project game development OR "Tyler Garlick" game' },
  { category: 'Global', query: '(world news OR geopolitics OR global events) AND (today 2026)' },
  { category: 'National', query: '(United States OR economy OR Congress OR Trump OR geopolitics) AND (news 2026)' },
  { category: 'Local', query: '(Utah OR "Salt Lake City" OR "Clearfield Utah" OR 84015) AND (news 2026)' },
];

// ─── market research wrapper ────────────────────────────────────────────────

async function runMarketResearch(stories) {
  // This would spawn a subagent per story for deeper research
  // For now, stub — the agent will handle inline
  return [];
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  const type = process.argv[2] || 'evening';
  const datePaths = getDatePaths();
  const { yyyy, mm, dd, timeStr } = datePaths;

  console.log(`[Mary Jane] Starting ${type} briefing for ${yyyy}-${mm}-${dd} MST`);
  console.log(`[Mary Jane] Fetching weather...`);

  const weather = await fetchWeather();
  console.log(`[Mary Jane] Weather: ${weather.condition}, ${weather.temp}, ${weather.wind}`);

  // Write weather + queries to a manifest file for the agent to pick up
  const manifest = {
    type,
    date: datePaths,
    weather,
    queries: NEWS_QUERIES,
    timestamp: new Date().toISOString()
  };

  const manifestPath = path.join(OUTPUT_DIR, '.briefing-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[Mary Jane] Manifest written to ${manifestPath}`);
  console.log(`[Mary Jane] Agent will read manifest and generate briefing.`);
  console.log(`[Mary Jane] To generate manually:`);
  console.log(`  node scripts/briefing-skill/generate-briefing.js ${type} '<weatherJson>' '<newsJson>'`);
  console.log(`  node scripts/briefing-skill/push-briefing.js ${yyyy} ${mm} ${dd}`);
}

main().catch(console.error);
