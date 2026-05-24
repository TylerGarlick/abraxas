#!/usr/bin/env node
/**
 * Link Checker - Validates links in content
 * Trigger: "check links", "MJ links"
 */

const https = require('https');
const http = require('http');

function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return links;
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const start = Date.now();
    
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      const result = {
        url,
        status: res.statusCode,
        redirects: 0,
        finalUrl: url,
        responseTime: Date.now() - start
      };
      
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        result.redirects = 1;
        result.finalUrl = res.headers.location;
      }
      
      if (res.statusCode >= 200 && res.statusCode < 400) {
        result.ok = true;
      } else {
        result.ok = false;
        result.issue = res.statusCode === 404 ? 'not_found' : 'server_error';
      }
      
      res.resume();
      resolve(result);
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        ok: false,
        issue: 'connection_error',
        error: err.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        ok: false,
        issue: 'timeout'
      });
    });
  });
}

async function checkLinks(content) {
  const links = extractLinks(content);
  const results = [];
  
  // Check links in parallel (limited batch)
  const batchSize = 5;
  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(link => checkUrl(link.url).then(result => ({ ...result, text: link.text, line: link.line })))
    );
    results.push(...batchResults);
  }
  
  // Summary
  const summary = {
    total: results.length,
    ok: results.filter(r => r.ok).length,
    broken: results.filter(r => !r.ok).length,
    redirects: results.filter(r => r.redirects > 0).length
  };
  
  return {
    links: results,
    summary,
    hasIssues: summary.broken > 0 || summary.redirects > 2
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Link Checker - Validate links in content');
    console.log('Usage: node link-checker.js < content.txt');
    return;
  }
  
  const content = require('fs').readFileSync(0, 'utf-8').trim();
  const result = await checkLinks(content);
  
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkLinks, extractLinks, checkUrl };
