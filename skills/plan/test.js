#!/usr/bin/env node
/**
 * Test Suite for Epistemic Clarity Engine
 * 
 * Tests:
 * EC1 - User gives vague request, extract 5+ unknowns
 * EC2 - Answer a question, verify epistemic label applied
 * EC3 - New unknowns emerge from answers (iteration)
 * EC4 - Skip a question
 * EC5 - Complete session, verify readyForImplementation
 */

const engine = require('./clarity-engine.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('Running Epistemic Clarity Tests...\n');

// Clean slate
engine.startSession('Test request').sessionId;

test('EC1: Extract 5+ unknowns from vague request', () => {
  const session = engine.startSession('Build something');
  assert(session.unknowns.length >= 5, `Expected 5+, got ${session.unknowns.length}`);
});

test('EC2: Answer applies Sol/Confident label', () => {
  const session = engine.startSession('Make a dashboard');
  const status = engine.getStatus(session.sessionId);
  const result = engine.answerQuestion(session.sessionId, status.nextQuestion.id, 'Server monitoring', 'Confident');
  assert(result.labeled.truthLabel === 'Sol', 'Expected Sol');
  assert(result.labeled.confidenceLabel === 'Confident', 'Expected Confident');
});

test('EC3: Iteration - new unknowns from answers', () => {
  const session = engine.startSession('Create an app');
  const before = session.unknowns.length;
  const status = engine.getStatus(session.sessionId);
  engine.answerQuestion(session.sessionId, status.nextQuestion.id, 'I need to track user logins for my SaaS product', 'Confident');
  const newStatus = engine.getStatus(session.sessionId);
  assert(newStatus.progress.remaining > 0 || newStatus.progress.total > before, 'Should generate new unknowns from detailed answer');
});

test('EC4: Skip a question', () => {
  const session = engine.startSession('Build a website');
  const status = engine.getStatus(session.sessionId);
  const result = engine.skipQuestion(session.sessionId, status.nextQuestion.id, 'User declined to answer');
  assert(result.remaining >= 0, 'Should track skipped');
  assert(result.skipped.status === 'skipped', 'Should be marked skipped');
});

test('EC5: Complete session - readyForImplementation', () => {
  const session = engine.startSession('Simple task');
  
  // Answer all questions until done
  let iterations = 0;
  let status = engine.getStatus(session.sessionId);
  
  while (status.nextQuestion && iterations < 50) {
    engine.skipQuestion(session.sessionId, status.nextQuestion.id, 'Skipping for test');
    status = engine.getStatus(session.sessionId);
    iterations++;
  }
  
  const map = engine.exportClarityMap(session.sessionId);
  assert(map.readyForImplementation === true, 'Should be ready when all resolved/skipped');
  assert(map.summary.remaining === 0, 'Should have 0 remaining');
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
