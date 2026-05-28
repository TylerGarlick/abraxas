#!/usr/bin/env node

/**
 * Ethos Test Suite
 * Tests source credibility scoring and conflict resolution
 */

const path = require('path');
const { 
  scoreSource, 
  getTierInfo, 
  getSourceInfo, 
  calculateWeightedConfidence 
} = require('../ethos-score.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`${msg} Expected ${expected}, got ${actual}`);
  }
}

console.log('Running Ethos Test Suite\n');
console.log('=' .repeat(50));

// ─────────────────────────────────────────────────────────────
// Tier 1 Sources (Peer-Reviewed)
// ─────────────────────────────────────────────────────────────
console.log('\n📚 Tier 1 Sources (Peer-Reviewed)\n');

test('Nature scores as Tier 1', () => {
  assertEqual(scoreSource('Nature'), 1);
});

test('Science scores as Tier 1', () => {
  assertEqual(scoreSource('Science'), 1);
});

test('PNAS scores as Tier 1', () => {
  assertEqual(scoreSource('PNAS'), 1);
});

test('The Lancet scores as Tier 1', () => {
  assertEqual(scoreSource('The Lancet'), 1);
});

test('NEJM scores as Tier 1', () => {
  assertEqual(scoreSource('NEJM'), 1);
});

// ─────────────────────────────────────────────────────────────
// Tier 2 Sources (Major News)
// ─────────────────────────────────────────────────────────────
console.log('\n📰 Tier 2 Sources (Major News)\n');

test('Reuters scores as Tier 2', () => {
  assertEqual(scoreSource('Reuters'), 2);
});

test('Associated Press scores as Tier 2', () => {
  assertEqual(scoreSource('Associated Press'), 2);
});

test('BBC scores as Tier 2', () => {
  assertEqual(scoreSource('BBC'), 2);
});

test('New York Times scores as Tier 2', () => {
  assertEqual(scoreSource('New York Times'), 2);
});

test('Washington Post scores as Tier 2', () => {
  assertEqual(scoreSource('Washington Post'), 2);
});

// ─────────────────────────────────────────────────────────────
// Tier 3 Sources (Fact-Checkers)
// ─────────────────────────────────────────────────────────────
console.log('\n✅ Tier 3 Sources (Fact-Checkers)\n');

test('Snopes scores as Tier 3', () => {
  assertEqual(scoreSource('Snopes'), 3);
});

test('PolitiFact scores as Tier 3', () => {
  assertEqual(scoreSource('PolitiFact'), 3);
});

test('FactCheck.org scores as Tier 3', () => {
  assertEqual(scoreSource('FactCheck.org'), 3);
});

// ─────────────────────────────────────────────────────────────
// Tier 4 Sources (Industry)
// ─────────────────────────────────────────────────────────────
console.log('\n🏭 Tier 4 Sources (Industry)\n');

test('IEEE Spectrum scores as Tier 4', () => {
  assertEqual(scoreSource('IEEE Spectrum'), 4);
});

test('TechCrunch scores as Tier 4', () => {
  assertEqual(scoreSource('TechCrunch'), 4);
});

test('Wired scores as Tier 4', () => {
  assertEqual(scoreSource('Wired'), 4);
});

test('MIT Technology Review scores as Tier 4', () => {
  assertEqual(scoreSource('MIT Technology Review'), 4);
});

// ─────────────────────────────────────────────────────────────
// Tier 5 Sources (Unverified)
// ─────────────────────────────────────────────────────────────
console.log('\n❓ Tier 5 Sources (Unverified)\n');

test('Twitter scores as Tier 5', () => {
  assertEqual(scoreSource('Twitter'), 5);
});

test('Reddit scores as Tier 5', () => {
  assertEqual(scoreSource('Reddit'), 5);
});

test('Unknown source scores as Tier 5', () => {
  assertEqual(scoreSource('random-unknown-source'), 5);
});

// ─────────────────────────────────────────────────────────────
// Source Info Lookups
// ─────────────────────────────────────────────────────────────
console.log('\n🔍 Source Info Lookups\n');

test('Get info for Nature', () => {
  const info = getSourceInfo('Nature');
  assertEqual(info.tier, 1);
  assertEqual(info.field, 'Science');
});

test('Get info for Reuters', () => {
  const info = getSourceInfo('Reuters');
  assertEqual(info.tier, 2);
  assertEqual(info.field, 'News');
});

test('Unknown source returns null', () => {
  const info = getSourceInfo('definitely-not-real-source-xyz');
  assertEqual(info, null);
});

// ─────────────────────────────────────────────────────────────
// Weighted Confidence
// ─────────────────────────────────────────────────────────────
console.log('\n⚖️ Weighted Confidence Calculation\n');

test('All Tier 1 sources = VERY HIGH confidence', () => {
  const result = calculateWeightedConfidence([
    { source: 'Nature' },
    { source: 'Science' },
    { source: 'PNAS' }
  ]);
  assertEqual(result.confidence, 'VERY HIGH');
  assertEqual(result.weightedScore, 1);
});

test('All Tier 2 sources = HIGH confidence', () => {
  const result = calculateWeightedConfidence([
    { source: 'Reuters' },
    { source: 'AP' },
    { source: 'BBC' }
  ]);
  assertEqual(result.confidence, 'HIGH');
});

test('Mixed Tier 1 + Tier 5 = conflict detected', () => {
  const result = calculateWeightedConfidence([
    { source: 'Nature' },
    { source: 'Twitter' }
  ]);
  assertEqual(result.hasConflict, true);
});

test('Empty sources = UNKNOWN', () => {
  const result = calculateWeightedConfidence([]);
  assertEqual(result.confidence, 'UNKNOWN');
});

test('Tier 5 only = VERY LOW confidence', () => {
  const result = calculateWeightedConfidence([
    { source: 'Reddit' },
    { source: 'Twitter' },
    { source: 'random-blog' }
  ]);
  assertEqual(result.confidence, 'VERY LOW');
});

// ─────────────────────────────────────────────────────────────
// Tier Info
// ─────────────────────────────────────────────────────────────
console.log('\n📋 Tier Information\n');

test('Tier 1 weight = 1.0', () => {
  const info = getTierInfo(1);
  assertEqual(info.weight, 1.0);
});

test('Tier 2 weight = 0.8', () => {
  const info = getTierInfo(2);
  assertEqual(info.weight, 0.8);
});

test('Tier 5 weight = 0.2', () => {
  const info = getTierInfo(5);
  assertEqual(info.weight, 0.2);
});

// ─────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(50));
console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total:  ${passed + failed}\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All tests passed!\n');
  process.exit(0);
}
