#!/usr/bin/env node
/**
 * Call to Action Writer - Crafts compelling CTAs
 * Trigger: "CTA", "MJ CTA"
 */

const CTA_TEMPLATES = {
  button: [
    'Get Started',
    'Download Now',
    'Start Free Trial',
    'Get Your Free {Benefit}',
    'Join Now',
    'Learn More'
  ],
  email: [
    'Download your {Type} now',
    'Get instant access to {Benefit}',
    'Claim your {Type} - click here',
    'Your {Type} is ready'
  ],
  landing: [
    'Get {Benefit} today',
    'Start transforming your {Area} in just {Time}',
    'The only {Type} you need',
    'Discover how to {Outcome}'
  ],
  social: [
    'Tap the link in bio',
    'Swipe to learn more',
    'Click the bio link',
    'Link in comments'
  ]
};

function generateCTAs(goal, options = {}) {
  const type = options.type || 'button';
  const templates = CTA_TEMPLATES[type] || CTA_TEMPLATES.button;
  
  // Parse goal into components
  const benefit = options.benefit || extractBenefit(goal);
  const ctaType = options.ctaType || extractType(goal);
  
  const results = templates.map(template => {
    const text = template
      .replace('{Benefit}', benefit)
      .replace('{Type}', ctaType)
      .replace('{Area}', options.area || 'business')
      .replace('{Time}', options.time || 'minutes')
      .replace('{Outcome}', options.outcome || 'succeed');
    
    return {
      text,
      type,
      score: scoreCTA(text),
      rationale: getRationale(text)
    };
  });
  
  // Sort by score
  results.sort((a, b) => b.score - a.score);
  
  return {
    goal,
    type,
    options: results.slice(0, 5)
  };
}

function extractBenefit(goal) {
  const words = goal.toLowerCase().split(/\s+/);
  const benefitWords = ['guide', 'template', 'checklist', 'course', 'ebook', 'report', 'tool'];
  
  for (const word of words) {
    if (benefitWords.includes(word)) {
      return word;
    }
  }
  
  return 'guide';
}

function extractType(goal) {
  const lower = goal.toLowerCase();
  if (lower.includes('download')) return 'download';
  if (lower.includes('trial')) return 'trial';
  if (lower.includes('signup')) return 'signup';
  if (lower.includes('ebook') || lower.includes('guide')) return 'ebook';
  return 'resource';
}

function scoreCTA(text) {
  let score = 60;
  
  // Action verbs
  const actionWords = ['get', 'download', 'start', 'join', 'learn', 'discover', 'try'];
  if (actionWords.some(w => text.toLowerCase().startsWith(w))) score += 15;
  
  // Personal pronouns
  if (/\byour\b/i.test(text)) score += 10;
  if (/\byou\b/i.test(text)) score += 5;
  
  // Urgency
  if (/now|today|immediate/i.test(text)) score += 10;
  
  // Length
  const words = text.split(/\s+/);
  if (words.length >= 2 && words.length <= 5) score += 5;
  
  return Math.min(100, score);
}

function getRationale(text) {
  const reasons = [];
  
  if (/get|download|start/i.test(text)) {
    reasons.push('Action verb at start');
  }
  if (/\byour\b/i.test(text)) {
    reasons.push('Personal possessive');
  }
  if (/\bnow|today\b/i.test(text)) {
    reasons.push('Creates urgency');
  }
  
  return reasons.join(' + ') || 'Clear, direct language';
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Call to Action Writer - Generate CTAs');
    console.log('Usage: node call-to-action-writer.js [goal] [options]');
    console.log('Options: --type button|email|landing|social');
    return;
  }
  
  const goal = args[0] || 'Download our free guide';
  const result = generateCTAs(goal, {
    type: args.includes('--type') ? args[args.indexOf('--type') + 1] : 'button'
  });
  
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateCTAs, CTA_TEMPLATES };
