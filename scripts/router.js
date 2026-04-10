#!/usr/bin/env node

/**
 * Skill Router
 * Routes user intents to the best available skill using confidence-based matching
 * 
 * Usage:
 *   node router.js <intent> [--dispatch] [--threshold <0.0-1.0>]
 * 
 * Examples:
 *   node router.js "morning briefing"
 *   node router.js "MJ github activity" --dispatch
 *   node router.js "security audit" --threshold 0.7
 */

const { REGISTRY, getRegisteredSkills } = require('./registry.js');

// Configuration
const DEFAULT_THRESHOLD = 0.6;

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a 
 * @param {string} b
 * @returns {number}
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Tokenize a string into words (lowercase, no punctuation)
 * @param {string} str
 * @returns {string[]}
 */
function tokenize(str) {
  return str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Calculate word overlap score between two strings
 * @param {string} intent
 * @param {string} phrase
 * @returns {number} 0-1 score
 */
function wordOverlapScore(intent, phrase) {
  const intentTokens = new Set(tokenize(intent));
  const phraseTokens = new Set(tokenize(phrase));
  
  if (phraseTokens.size === 0) return 0;
  
  let overlap = 0;
  for (const token of phraseTokens) {
    if (intentTokens.has(token)) {
      overlap++;
    }
  }
  
  return overlap / phraseTokens.size;
}

/**
 * Score how well an intent matches a phrase
 * @param {string} intent - User's intent
 * @param {string} phrase - Registry phrase
 * @returns {number} 0-1 confidence score
 */
function scoreMatch(intent, phrase) {
  const normalizedIntent = intent.toLowerCase().trim();
  const normalizedPhrase = phrase.toLowerCase().trim();
  
  // Exact match
  if (normalizedIntent === normalizedPhrase) {
    return 1.0;
  }
  
  // Contains match (intent contains phrase or phrase contains intent)
  if (normalizedIntent.includes(normalizedPhrase) || normalizedPhrase.includes(normalizedIntent)) {
    return 0.85;
  }
  
  // Word overlap score
  const overlapScore = wordOverlapScore(normalizedIntent, normalizedPhrase);
  
  // Fuzzy match (Levenshtein)
  const maxLen = Math.max(normalizedIntent.length, normalizedPhrase.length);
  const distance = levenshteinDistance(normalizedIntent, normalizedPhrase);
  const fuzzyScore = maxLen > 0 ? Math.max(0, 1 - (distance / maxLen)) : 0;
  
  // Combined score: weighted average
  const combinedScore = (overlapScore * 0.6) + (fuzzyScore * 0.4);
  
  return Math.min(combinedScore, 0.84); // Cap at 0.84 to leave room for exact/contains
}

/**
 * Find the best matching skill for an intent
 * @param {string} intent - User's intent
 * @param {number} threshold - Minimum confidence threshold
 * @returns {object} Routing decision
 */
function route(intent, threshold = DEFAULT_THRESHOLD) {
  const skills = getRegisteredSkills();
  let bestMatch = null;
  let bestScore = 0;
  let bestPhrase = null;
  
  for (const skillName of skills) {
    const skill = REGISTRY[skillName];
    
    for (const phrase of skill.phrases) {
      const score = scoreMatch(intent, phrase);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = skillName;
        bestPhrase = phrase;
      }
    }
  }
  
  return {
    skill: bestScore >= threshold ? bestMatch : null,
    confidence: bestScore,
    matchedPhrase: bestScore >= threshold ? bestPhrase : null,
    mode: 'explicit',
    action: bestScore >= threshold ? 'route' : 'confirm',
    requiresConfirmation: bestScore < threshold,
    threshold: threshold
  };
}

/**
 * Format output for display
 * @param {object} result
 * @returns {string}
 */
function formatResult(result) {
  if (result.skill) {
    const skill = REGISTRY[result.skill];
    return JSON.stringify({
      skill: result.skill,
      confidence: Math.round(result.confidence * 100) / 100,
      matchedPhrase: result.matchedPhrase,
      description: skill?.description || '',
      action: result.action,
      mode: result.mode
    }, null, 2);
  } else {
    return JSON.stringify({
      skill: null,
      confidence: Math.round(result.confidence * 100) / 100,
      action: result.action,
      requiresConfirmation: result.requiresConfirmation,
      message: `No confident match found (threshold: ${result.threshold}). Try being more specific.`,
      suggestion: result.confidence > 0.3 ? getSuggestions(result) : null
    }, null, 2);
  }
}

/**
 * Get suggestions for low-confidence matches
 * @param {object} result
 * @returns {string[]}
 */
function getSuggestions(result) {
  // Return top 3 skills that had some score
  const suggestions = [];
  const threshold = result.threshold;
  
  // This is a simplified suggestion - in production you'd track all scores
  return suggestions;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const intent = args.find(arg => !arg.startsWith('--'));
  const dispatch = args.includes('--dispatch');
  const thresholdArg = args.find(arg => arg.startsWith('--threshold'));
  const threshold = thresholdArg 
    ? parseFloat(thresholdArg.split('=')[1] || thresholdArg.split(' ')[1]) 
    : DEFAULT_THRESHOLD;
  
  if (!intent) {
    console.error('Usage: node router.js <intent> [--dispatch] [--threshold <0.0-1.0>]');
    console.error('Example: node router.js "morning briefing" --dispatch');
    process.exit(1);
  }
  
  const result = route(intent, threshold);
  result.mode = dispatch ? 'dispatch' : 'explicit';
  
  console.log(formatResult(result));
}

module.exports = {
  route,
  scoreMatch,
  levenshteinDistance,
  tokenize,
  wordOverlapScore
};
