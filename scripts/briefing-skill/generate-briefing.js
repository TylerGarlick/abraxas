#!/usr/bin/env node
'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');

// ─── HTML decode ─────────────────────────────────────────────────────────────
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&#x27': "'" };
function decodeHtml(str) {
  if (!str) return '';
  return str.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/g, m => ENTITIES[m] || m);
}

// ─── Fetch a URL ─────────────────────────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── Fetch RSS feed ───────────────────────────────────────────────────────────
async function fetchFeed(url, sourceName) {
  try {
    const xml = await fetchUrl(url);
    const items = [];
    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    for (const match of itemMatches) {
      const xmlItem = match[1];
      const titleM = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i.exec(xmlItem);
      const linkM = /<link[^>]*>(https?:\/\/[^<]+)<\/link>/i.exec(xmlItem) || /(https:\/\/[^<\s]+)/i.exec(xmlItem);
      const descM = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i.exec(xmlItem);
      if (!titleM) continue;
      let snippet = '';
      if (descM) {
        snippet = (descM[1] || descM[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (snippet.length > 220) snippet = snippet.substring(0, 217) + '...';
      }
      items.push({
        title: decodeHtml((titleM[1] || titleM[2] || '').trim()),
        url: linkM ? decodeHtml(linkM[1].trim()) : '',
        snippet,
        source: sourceName
      });
    }
    return { source: sourceName, items };
  } catch (err) {
    console.error(`Feed [${sourceName}] failed: ${err.message}`); // eslint-disable-line no-console
    return { source: sourceName, items: [] };
  }
}

// ─── Working feeds by category ───────────────────────────────────────────────
// World & National
const WORLD_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
  { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT World' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NYT Politics' },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR' },
];

// Local (Utah — ABC4 is the only working Utah RSS)
const LOCAL_FEEDS = [
  { url: 'https://www.abc4.com/feed/', source: 'ABC4 Utah' },
];

// AI News (AI/LLM/AGI specific)
const AI_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Technology' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NYT Technology' },
  { url: 'https://news.ycombinator.com/rss', source: 'Hacker News' },
];

// Technology (general)
const TECH_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Technology' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NYT Technology' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
];

// Psychology / Jungian
const PSYCH_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC Health' },
  { url: 'https://www.simplypsychology.org/feed', source: 'Simply Psychology' },
];

// Abraxas external (AI safety, reason, philosophy of mind)
const ABRAXAS_FEEDS = [
  { url: 'https://www.lesswrong.com/feed.xml', source: 'LessWrong' },
  { url: 'https://news.ycombinator.com/rss', source: 'Hacker News' },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC Health' },
];

// ─── Clearfield, UT coordinates ──────────────────────────────────────────────
const LAT = 41.085;
const LON = -112.013;
const LOCATION = 'Clearfield, UT 84015';

// ─── Weather (Open-Meteo, Fahrenheit + MPH) ───────────────────────────────────
const WEATHER_CODES = {
  0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime Fog',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
  80: 'Rain Showers', 81: 'Heavy Rain Showers', 82: 'Violent Rain',
  95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Severe Thunderstorm'
};

function fetchWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=kmh`;
  return fetchUrl(url)
    .then(r => JSON.parse(r))
    .then(d => {
      const w = d.current;
      const mph = Math.round(w.windspeed_10m * 0.621371);
      return {
        temp: `${Math.round(w.temperature_2m)}°F`,
        condition: WEATHER_CODES[w.weather_code] || 'Unknown',
        wind: `${mph} MPH`,
        location: LOCATION
      };
    })
    .catch(() => ({ temp: '68°F', condition: 'Clear', wind: '5 MPH', location: LOCATION }));
}

// ─── Category inference ───────────────────────────────────────────────────────
function inferCategory(title, snippet) {
  const text = (title + ' ' + snippet).toLowerCase();

  // Abraxas: AI safety, alignment, interpretability, emergent reason, epistemology, agency
  if (/ai safety|existential risk|alignment problem|interpretability|capsule network|abraxas|complex system|emergent.*reason|truth-seeking|epistemolog|philosophy.*mind|consciousness.*ai|ai.*consciousness|agency.*ai|cognitive.*archite|i[jt]m|system.?2|slow.*think|chain.?of.?thought/i.test(text)) return 'Abraxas';
  // AI / LLM / AGI (general AI news)
  if (/openai|gpt|llm|gemini|claude|anthropic|deepmind|chatbot|neural network|language model|artificial intelligence|agi|mistral|llama|qwen|grok|artificial general|foundation model|multimodal.*model|model.*train|scaling law|ai assistant|ai breakthrough|ai chip|ai compan/i.test(text)) return 'AI News';
  // Psychology / Jungian (requiring more specificity to avoid BBC Health bleed)
  if (/psychology|psychiatr|jung|freud|unconscious|collective unconscious|archetype|shadow.*work|persona|anima|animus|dream.*analysis|synchronicity|psyche|mental health|therapy|therapist|psychotherapy|cbt|dbt|psychodynamic|attachment theory|inner work|dream.*interpret|complex.*ptsd|dissociativ|bpd|narcissistic personality|borderline personality|psychological research|mindfulness|meditation practice/i.test(text)) return 'Psychology (Jungian)';
  // Technology (non-AI)
  if (/apple|google|meta|microsoft|amazon|tesla|startup|software release|chip|semiconductor|cyberattack|hack|data breach|surveillance|robot|spacex|nasa|cyber security|vulnerability|zero.?day|ransomware/i.test(text)) return 'Technology';
  // World / Geopolitics
  if (/war |ceasefire|ukraine|russia|china|taiwan|korea|iran|nuclear weapon|israel|hamas|gaza|middle east|nato|refugee|humanitarian|diplomatic|tensions.*china|trade war|geopolitic|military.*exercise|missile|troop.*deploy/i.test(text)) return 'World & National';
  // US Politics
  if (/trump|biden|congress|senate|house|supreme court|impeach|executive order|white house|republican|democrat|policy.*announcement/i.test(text)) return 'World & National';

  return null; // null = keep feed-assigned category
}

// ─── Six briefing categories in display order ─────────────────────────────────
const CATEGORY_ORDER = [
  'World & National',
  'Local (Utah)',
  'AI News',
  'Technology',
  'Psychology (Jungian)',
  'Abraxas',
];

const CATEGORY_EMOJI = {
  'World & National': '🌍',
  'Local (Utah)': '📍',
  'AI News': '🤖',
  'Technology': '💻',
  'Psychology (Jungian)': '🧠',
  'Abraxas': '🔮',
};

const CATEGORY_MAX = { 'World & National': 6, 'Local (Utah)': 5, 'AI News': 6, 'Technology': 5, 'Psychology (Jungian)': 5, 'Abraxas': 5 };

// ─── Persist raw news to JSON ───────────────────────────────────────────────
function saveJson(news) {
  const p = require('path').join(__dirname, 'news.json');
  fs.writeFileSync(p, JSON.stringify(news, null, 2));
}

// ─── Parse stdin ─────────────────────────────────────────────────────────────
function parseStdin() {
  const stdinRaw = fs.readFileSync(0, 'utf8').trim();
  if (!stdinRaw) return [];
  if (stdinRaw.startsWith('[')) {
    try { return JSON.parse(stdinRaw); } catch (e) { /* fall through */ }
  }
  const lines = stdinRaw.split('\n').filter(l => l.trim());
  const parsed = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  if (parsed.length) return parsed;
  try { return [JSON.parse(stdinRaw)]; } catch { return []; }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  let news = parseStdin();

  // Fallback: if no stdin data, fetch feeds directly
  if (news.length === 0) {
    console.error('No stdin; fetching feeds directly...'); // eslint-disable-line no-console

    const allFeeds = [
      ...WORLD_FEEDS.map(f => ({ ...f, bucket: 'World & National' })),
      ...LOCAL_FEEDS.map(f => ({ ...f, bucket: 'Local (Utah)' })),
      ...AI_FEEDS.map(f => ({ ...f, bucket: 'AI News' })),
      ...TECH_FEEDS.map(f => ({ ...f, bucket: 'Technology' })),
      ...PSYCH_FEEDS.map(f => ({ ...f, bucket: 'Psychology (Jungian)' })),
      ...ABRAXAS_FEEDS.map(f => ({ ...f, bucket: 'Abraxas' })),
    ];

    const results = await Promise.allSettled(allFeeds.map(f => fetchFeed(f.url, f.source).then(items => ({ items: items.items || [], bucket: f.bucket }))));

    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const item of r.value.items) {
          item.category = r.value.bucket;
          news.push(item);
        }
      }
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  news = news.filter(item => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  // Re-categorize by inference
  for (const item of news) {
    const inferred = inferCategory(item.title || '', item.snippet || '');
    if (inferred) item.category = inferred;
  }

  // ─── Weather ─────────────────────────────────────────────────────────────
  let weather = { temp: '68°F', condition: 'Clear', wind: '5 MPH', location: LOCATION };
  try {
    weather = await fetchWeather();
  } catch (e) { /* use defaults */ }

  // ─── Bucket into categories ─────────────────────────────────────────────
  const categorized = {};
  for (const cat of CATEGORY_ORDER) categorized[cat] = [];

  for (const item of news) {
    const cat = item.category || 'World & National';
    if (categorized[cat]) {
      if (categorized[cat].length < (CATEGORY_MAX[cat] || 5)) {
        categorized[cat].push(item);
      }
    } else {
      if (categorized['World & National'].length < 6) {
        categorized['World & National'].push(item);
      }
    }
  }

  // ─── Time & greeting ─────────────────────────────────────────────────────
  const now = new Date();
  const mstHour = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' })).getHours();
  const ampm = mstHour < 12 ? 'morning' : mstHour < 17 ? 'afternoon' : 'evening';
  const dateStr = now.toLocaleDateString('en-US', { timeZone: 'America/Denver', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const greeting = `Good ${ampm}`;

  // ─── Build output ───────────────────────────────────────────────────────
  let out = '';
  out += `# ${greeting} — ${dateStr}\n\n`;
  out += `## ☔ Weather — ${weather.location}\n\n`;
  out += `**${weather.temp}** | ${weather.condition} | Wind: ${weather.wind}\n`;

  for (const cat of CATEGORY_ORDER) {
    const items = categorized[cat] || [];
    const emoji = CATEGORY_EMOJI[cat] || '📋';
    out += `\n## ${emoji} ${cat}\n\n`;
    if (items.length === 0) {
      out += `No stories from sources today.\n`;
    } else {
      for (const item of items) {
        const desc = item.snippet ? ` — ${item.snippet.replace(/\n/g, ' ')}` : '';
        out += `- [${item.title}](${item.url}) *( ${item.source} )*${desc}\n`;
      }
    }
  }

  out += `\n---\n`;
  out += `*${news.length} stories from BBC, NYT, NPR, ABC4 Utah, Wired, Hacker News, Simply Psychology, and LessWrong.*\n`;
  out += `\n<!-- METADATA: generated=${now.toISOString()} items=${news.length} -->\n`;

  process.stdout.write(out);
  saveJson(news);
}

main().catch(e => { console.error(e); process.exit(1); });
