#!/usr/bin/env node
/**
 * Tone Analyst - Analyzes emotional tone and voice
 * Trigger: "analyze tone", "MJ tone"
 */

const TONE_MARKERS = {
  formal: {
    positive: ['therefore', 'furthermore', 'consequently', 'moreover', 'hence', 'thus', 'accordingly'],
    negative: ['can't', "won't", "don't", "isn't", "wasn't", "weren't"]
  },
  casual: {
    positive: ['awesome', 'cool', 'great', 'love', 'totally', 'pretty much', 'kind of'],
    negative: []
  },
  friendly: {
    positive: ['great', 'wonderful', 'fantastic', 'amazing', 'lovely', 'delighted'],
    negative: []
  },
  authoritative: {
    positive: ['must', 'will', 'shall', 'guarantee', 'ensure', 'require', 'mandate'],
    negative: ['maybe', 'perhaps', 'might', 'could', 'possibly']
  },
  urgent: {
    positive: ['immediately', 'now', 'urgent', 'critical', 'essential', 'must act'],
    negative: []
  },
  confident: {
    positive: ['definitely', 'certainly', 'absolutely', 'clearly', 'obviously'],
    negative: ['think', 'feel', 'believe', 'maybe', 'perhaps']
  }
};

function analyzeTone(content) {
  const lowerContent = content.toLowerCase();
  const words = lowerContent.split(/\s+/);
  const results = {};
  
  // Analyze each tone dimension
  for (const [tone, markers] of Object.entries(TONE_MARKERS)) {
    const positiveMatches = markers.positive.filter(m => lowerContent.includes(m)).length;
    const negativeMatches = markers.negative.filter(m => lowerContent.includes(m)).length;
    
    // Score 0-100
    let score = 50;
    if (markers.positive.length > 0) {
      score += Math.min(30, positiveMatches * 10);
    }
    if (markers.negative.length > 0) {
      score -= Math.min(30, negativeMatches * 10);
    }
    
    score = Math.max(0, Math.min(100, score));
    
    results[tone] = {
      score,
      indicators: positiveMatches + negativeMatches,
      assessment: score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low'
    };
  }
  
  // Overall tone assessment
  const sortedTones = Object.entries(results)
    .sort((a, b) => b[1].score - a[1].score);
  
  const primaryTone = sortedTones[0][0];
  const secondaryTones = sortedTones.slice(1, 3).map(t => t[0]);
  
  // Check for inconsistencies
  const inconsistencies = [];
  const toneScores = Object.values(results).map(r => r.score);
  const variance = calculateVariance(toneScores);
  
  if (variance > 400) {
    inconsistencies.push('High variance in tone markers suggests mixed voice');
  }
  
  return {
    dimensions: results,
    primaryTone,
    secondaryTones,
    inconsistencies,
    overallScore: Math.round(sortedTones[0][1].score),
    suggestions: getSuggestions(results)
  };
}

function calculateVariance(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
}

function getSuggestions(results) {
  const suggestions = [];
  
  if (results.formal.score < 30 && results.casual.score < 30) {
    suggestions.push('Content lacks strong voice signals - consider more intentional tone');
  }
  if (results.confident.score < 30) {
    suggestions.push('Consider using more confident language (definitely, clearly)');
  }
  if (results.friendly.score > 80) {
    suggestions.push('Very warm tone - ensure appropriate for your audience');
  }
  
  return suggestions;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Tone Analyst - Analyze content tone and voice');
    console.log('Usage: node tone-analyst.js < content.txt');
    return;
  }
  
  const content = require('fs').readFileSync(0, 'utf-8').trim();
  const result = analyzeTone(content);
  
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeTone, TONE_MARKERS };
