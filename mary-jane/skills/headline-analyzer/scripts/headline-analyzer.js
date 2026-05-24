#!/usr/bin/env node
/**
 * Headline Analyzer - Evaluates headlines for effectiveness
 * Trigger: "headline", "MJ headline"
 */

const POWER_WORDS = [
  'amazing', 'ultimate', 'essential', 'proven', 'secret', 'powerful',
  'exclusive', 'free', 'instant', 'guaranteed', 'breakthrough', 'revolutionary',
  'surprising', 'shocking', 'stunning', 'incredible', 'famous', 'sensational'
];

const QUESTIONS = ['how', 'why', 'what', 'when', 'where', 'which'];

function analyzeHeadline(headline) {
  const words = headline.split(/\s+/);
  const lowerHeadline = headline.toLowerCase();
  
  // Clarity score
  let clarityScore = 70;
  if (words.length < 3) clarityScore -= 20;
  if (words.length > 12) clarityScore -= 10;
  if (headline.includes(':') && !headline.includes(' - ')) clarityScore += 15;
  if (headline.match(/^\d+/)) clarityScore += 10;
  
  // Impact score
  const powerWordCount = POWER_WORDS.filter(w => lowerHeadline.includes(w)).length;
  const impactScore = Math.min(100, 50 + (powerWordCount * 15));
  
  // SEO score
  let seoScore = 50;
  const hasNumbers = /\d+/.test(headline);
  const hasQuestion = QUESTIONS.some(q => lowerHeadline.startsWith(q));
  if (hasNumbers) seoScore += 20;
  if (hasQuestion) seoScore += 15;
  if (headline.length >= 30 && headline.length <= 60) seoScore += 15;
  
  // Emotion score
  let emotionScore = 40;
  const emotionalWords = ['love', 'hate', 'fear', 'want', 'need', 'shock', 'surprise', 'amaze'];
  if (emotionalWords.some(w => lowerHeadline.includes(w))) emotionScore += 30;
  if (lowerHeadline.includes('you') || lowerHeadline.includes("you're")) emotionScore += 20;
  if (lowerHeadline.includes('because')) emotionScore += 10;
  
  // Calculate overall
  const overallScore = Math.round((clarityScore + impactScore + seoScore + emotionScore) / 4);
  
  // Diagnose issues
  const issues = [];
  if (words.length < 4) issues.push('Too short to be compelling');
  if (words.length > 10) issues.push('May be too long for some platforms');
  if (powerWordCount === 0) issues.push('Missing power words');
  if (!hasNumbers && !hasQuestion) issues.push('Consider adding a number or question');
  
  // Generate suggestions
  const suggestions = [];
  if (overallScore < 70) {
    suggestions.push('Add a specific number or statistic');
    suggestions.push('Include a power word');
    suggestions.push('Front-load the most important words');
  }
  
  return {
    headline,
    scores: {
      clarity: Math.round(clarityScore),
      impact: impactScore,
      seo: seoScore,
      emotion: emotionScore,
      overall: overallScore
    },
    issues,
    suggestions,
    stats: {
      wordCount: words.length,
      charCount: headline.length,
      powerWords: powerWordCount,
      hasNumber: hasNumbers,
      isQuestion: hasQuestion
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Headline Analyzer - Evaluate headlines');
    console.log('Usage: node headline-analyzer.js [headline]');
    return;
  }
  
  const headline = args.join(' ') || require('fs').readFileSync(0, 'utf-8').trim();
  const result = analyzeHeadline(headline);
  
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeHeadline, POWER_WORDS };
