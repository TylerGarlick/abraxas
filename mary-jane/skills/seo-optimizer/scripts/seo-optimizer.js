#!/usr/bin/env node
/**
 * SEO Optimizer - Analyzes content for SEO performance
 * Trigger: "SEO", "optimize SEO", "MJ SEO"
 */

function analyzeSEO(content, options = {}) {
  const targetKeyword = options.keyword || extractPrimaryKeyword(content);
  const words = content.split(/\s+/);
  
  const result = {
    keyword: targetKeyword,
    factors: {},
    score: 0,
    recommendations: []
  };
  
  // Title analysis
  const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '';
  
  result.factors.title = {
    value: title,
    length: title.length,
    hasKeyword: title.toLowerCase().includes(targetKeyword.toLowerCase()),
    score: title.length >= 30 && title.length <= 60 ? 100 : 
           title.length >= 20 && title.length <= 70 ? 75 : 50
  };
  
  // Keyword density
  const keywordCount = (content.match(new RegExp(targetKeyword, 'gi')) || []).length;
  const keywordDensity = (keywordCount / words.length * 100).toFixed(2);
  
  result.factors.keywordDensity = {
    value: keywordDensity + '%',
    count: keywordCount,
    optimal: keywordDensity >= 1 && keywordDensity <= 3,
    score: keywordDensity >= 1 && keywordDensity <= 3 ? 100 :
           keywordDensity >= 0.5 && keywordDensity <= 5 ? 75 : 50
  };
  
  // Headers structure
  const headers = content.match(/^#{1,6}\s+.+$/gm) || [];
  result.factors.headers = {
    count: headers.length,
    hasKeyword: headers.some(h => h.toLowerCase().includes(targetKeyword.toLowerCase())),
    score: headers.length >= 2 && headers.length <= 6 ? 100 : 60
  };
  
  // Links
  const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  const internalLinks = links.filter(l => l.includes('http'));
  const externalLinks = links.filter(l => !l.includes('http'));
  
  result.factors.links = {
    total: links.length,
    internal: internalLinks.length,
    external: externalLinks.length,
    score: links.length >= 1 ? 100 : 30
  };
  
  // Calculate overall score
  const scores = Object.values(result.factors).map(f => f.score);
  result.score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  // Recommendations
  if (result.factors.title.length < 30) {
    result.recommendations.push('Expand title to 50-60 characters');
  }
  if (!result.factors.title.hasKeyword) {
    result.recommendations.push('Include target keyword in title');
  }
  if (!result.factors.headers.hasKeyword) {
    result.recommendations.push('Add keyword to at least one header');
  }
  if (links.length === 0) {
    result.recommendations.push('Add internal or external links');
  }
  
  return result;
}

function extractPrimaryKeyword(content) {
  // Simple extraction - in production would use TF-IDF
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq = {};
  
  words.forEach(word => {
    if (word.length > 4) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? sorted[0][0] : 'unknown';
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('SEO Optimizer - Analyze content for SEO');
    console.log('Usage: node seo-optimizer.js [keyword] < content.txt');
    return;
  }
  
  const keyword = args[0];
  const content = require('fs').readFileSync(0, 'utf-8').trim();
  
  const result = analyzeSEO(content, { keyword });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeSEO, extractPrimaryKeyword };
