#!/usr/bin/env node
/**
 * Readability Scorer - Analyzes content readability
 * Trigger: "readability", "MJ readable"
 */

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

function calculateFlesch(content) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.match(/[a-zA-Z]/));
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Flesch Reading Ease
  const flesch = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(flesch * 10) / 10));
}

function calculateGunningFog(content) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.match(/[a-zA-Z]/));
  const complexWords = words.filter(w => countSyllables(w) >= 3);
  
  if (sentences.length === 0) return 0;
  
  const percentComplex = (complexWords.length / words.length) * 100;
  const fog = 0.4 * ((words.length / sentences.length) + percentComplex);
  
  return Math.round(fog * 10) / 10;
}

function calculateSMOG(content) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.match(/[a-zA-Z]/));
  const polysyllables = words.filter(w => countSyllables(w) >= 3);
  
  if (sentences.length === 0) return 0;
  
  const smog = 1.0430 * Math.sqrt(polysyllables.length * (30 / sentences.length)) + 3.1291;
  
  return Math.round(smog * 10) / 10;
}

function calculateColemanLiau(content) {
  const letters = (content.match(/[a-zA-Z]/g) || []).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.match(/[a-zA-Z]/));
  
  if (words.length === 0) return 0;
  
  const L = (letters / words.length) * 100;
  const S = (sentences.length / words.length) * 100;
  
  const cl = (0.0588 * L) - (0.296 * S) - 15.8;
  
  return Math.round(cl * 10) / 10;
}

function analyzeReadability(content) {
  const scores = {
    flesch: calculateFlesch(content),
    gunningFog: calculateGunningFog(content),
    smog: calculateSMOG(content),
    colemanLiau: calculateColemanLiau(content)
  };
  
  // Average grade level
  const avgGrade = Math.round(((scores.gunningFog + scores.smog + scores.colemanLiau) / 3) * 10) / 10;
  
  // Interpretation
  let level;
  if (avgGrade <= 6) level = 'Elementary';
  else if (avgGrade <= 8) level = 'Middle School';
  else if (avgGrade <= 10) level = 'High School';
  else if (avgGrade <= 12) level = 'College Prep';
  else level = 'College+';
  
  return {
    scores,
    avgGradeLevel: avgGrade,
    level,
    fleschInterpretation: scores.flesch >= 70 ? 'Easy' : scores.flesch >= 50 ? 'Standard' : 'Difficult',
    suggestions: getSuggestions(scores)
  };
}

function getSuggestions(scores) {
  const suggestions = [];
  
  if (scores.gunningFog > 12) {
    suggestions.push('Reduce complex words and sentence length');
  }
  if (scores.flesch < 50) {
    suggestions.push('Simplify sentences and use shorter words');
  }
  if (scores.smog > 12) {
    suggestions.push('Break up complex sentences into simpler ones');
  }
  
  return suggestions;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Readability Scorer - Analyze content readability');
    console.log('Usage: node readability-scorer.js < content.txt');
    return;
  }
  
  const content = require('fs').readFileSync(0, 'utf-8').trim();
  const result = analyzeReadability(content);
  
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeReadability, calculateFlesch, calculateGunningFog, calculateSMOG, calculateColemanLiau };
