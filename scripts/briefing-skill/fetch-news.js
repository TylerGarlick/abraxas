#!/usr/bin/env node
/**
 * fetch-news.js
 * Fetches news from sources that don't bot-detect.
 * Returns array of {category, title, url, snippet, source}
 */

const https = require('https');

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&#x27;': "'" };
function decodeHtml(str) {
  return str.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/g, m => ENTITIES[m] || m);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MaryJane/1.0)' } }, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', (e) => { clearTimeout(timeout); reject(e); });
  });
}

function extractRssItems(html, sourceName, maxItems = 8) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(html)) !== null && items.length < maxItems) {
    const itemXml = m[1];
    // Title: try <title>, itunes:title, media:title (NPR uses itunes:)
    const titleM = (
      itemXml.match(/<title>(?:<!\[CDATA\[)?([^\]<\r\n]*?)(?:\]\]>)?<\/title>/) ||
      itemXml.match(/<(?:itunes:|media:)title[^>]*>([^<]*)<\/(?:itunes:|media:)title>/) ||
      itemXml.match(/<title[^>]*>([^<]*)<\/title>/)
    );
    // Link: <link>URL</link> (BBC) or <link href="..."> (some feeds)
    const linkM = (
      itemXml.match(/<link>(https?:\/\/[^<\s]+)<\/link>/) ||
      itemXml.match(/<link[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/) ||
      itemXml.match(/<link>([^<\s]*)<\/link>/)
    );
    // Description/summary: try itunes:summary, content:encoded, description
    const descM = (
      itemXml.match(/<(?:itunes:|media:)summary[^>]*>(?:<!\[CDATA\[)?([^\]<\r\n]*?)(?:\]\]>)?<\/(?:itunes:|media:)summary>/) ||
      itemXml.match(/<description>(?:<!\[CDATA\[)?([^\]<\r\n]*?)(?:\]\]>)?<\/description>/) ||
      itemXml.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/)
    );
    if (titleM && linkM && titleM[1].trim()) {
      const rawDesc = descM ? descM[1] : '';
      const descText = rawDesc.replace(/<[^>]+>/g, '').substring(0, 200);
      items.push({ title: decodeHtml(titleM[1].trim()), url: decodeHtml(linkM[1].trim()), snippet: decodeHtml(descText), source: sourceName });
    }
  }
  return items;
}

function extractHn(html) {
  const items = [];
  // Each story is in a tr with class="athing", followed by a tr with score/user/time
  const storyRe = /<tr class="athing"[^>]*>([\s\S]*?)(?=<tr class="athing"|<\/table>)/g;
  const titleRe = /<a class="titlelink"[^>]*>([^<]*)<\/a>/;
  const urlRe = /<a class="titlelink"[^>]*href="([^"]*)"[^>]*>/;
  const scoreRe = /<span id="score_(\d+)"[^>]*>(\d+)/;
  
  const matches = html.match(storyRe);
  if (!matches) return items;
  
  for (const story of matches.slice(0, 15)) {
    const title = (titleRe.exec(story) || [])[1] || '';
    const url = (urlRe.exec(story) || [])[1] || '';
    const score = (scoreRe.exec(story) || [])[2] || '';
    if (title && url) {
      const snippet = score ? `Score: ${score}` : 'HN';
      items.push({ title: title.trim(), url, snippet, source: 'HackerNews' });
    }
  }
  return items;
}

function extractGeneric(html, url) {
  const titleM = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const descM = html.match(/<meta[^>]*(?:name|property)="description"[^>]*content="([^"]*)"[^>]*>/i) 
             || html.match(/<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="description"[^>]*>/i);
  const ogM = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
  
  return {
    title: ogM ? ogM[1] : (titleM ? titleM[1].replace(/[^\x20-\x7E]/g, '').trim() : ''),
    url,
    snippet: descM ? descM[1].replace(/[^\x20-\x7E]/g, '').substring(0, 200) : '',
    source: new URL(url).hostname
  };
}

async function fetchWithTimeout(url, headers = {}) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve({ url, html: null, ok: false, error: 'timeout' }), 12000);
    const req = https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...headers
      } 
    }, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ url, html: data, ok: true }));
    });
    req.on('error', (e) => { clearTimeout(timeout); resolve({ url, html: null, ok: false, error: e.message }); });
  });
}

async function main() {
  // Fetch all sources in parallel
  const [hnResult, bbcWorldResult, bbcTechResult, nprResult, nytWorldResult] = await Promise.all([
    fetchWithTimeout('https://news.ycombinator.com/'),
    fetchWithTimeout('https://feeds.bbci.co.uk/news/world/rss.xml'),
    fetchWithTimeout('https://feeds.bbci.co.uk/news/technology/rss.xml'),
    fetchWithTimeout('https://feeds.npr.org/1001/rss.xml'),
    fetchWithTimeout('https://rss.nytimes.com/services/xml/rss/nyt/World.xml'),
  ]);

  let allNews = [];

  // HN - direct HTML
  if (hnResult.ok) {
    const items = extractHn(hnResult.html);
    allNews = allNews.concat(items.map(i => ({ ...i, category: '' })));
    console.error(`[fetch-news] hn: ${items.length} items`);
  } else {
    console.error(`[fetch-news] hn: failed (${hnResult.error})`);
  }

  // RSS feeds
  const rssSources = [
    { key: 'bbc-world', result: bbcWorldResult, name: 'BBC World', max: 5 },
    { key: 'bbc-tech', result: bbcTechResult, name: 'BBC Technology', max: 4 },
    { key: 'npr', result: nprResult, name: 'NPR', max: 5 },
    { key: 'nyt-world', result: nytWorldResult, name: 'NYT World', max: 5 },
  ];

  for (const { key, result, name, max } of rssSources) {
    if (result.ok) {
      const items = extractRssItems(result.html, name, max);
      allNews = allNews.concat(items.map(i => ({ ...i, category: '' })));
      console.error(`[fetch-news] ${key}: ${items.length} items`);
    } else {
      console.error(`[fetch-news] ${key}: failed (${result.error})`);
    }
  }

  // Remove duplicates by URL
  const seen = new Set();
  allNews = allNews.filter(n => { if (seen.has(n.url)) return false; seen.add(n.url); return true; });

  console.log(JSON.stringify(allNews));
}

main().catch(e => { console.error(e.message); process.exit(1); });
