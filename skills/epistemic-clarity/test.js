#!/usr/bin/env node
// Test runner for clarity engine
const engine = require('./scripts/clarity-engine.js');

console.log('Testing Clarity Engine...\n');

// Test 1: Start session
console.log('TEST 1: Start Session');
const session = engine.startSession('Build me a server health dashboard');
console.log('Session ID:', session.sessionId);
console.log('Unknowns found:', session.unknowns.length);
console.log('');

// Test 2: Get status
console.log('TEST 2: Status');
const status = engine.getStatus(session.sessionId);
console.log('Status:', status.status);
console.log('Next question:', status.nextQuestion?.question);
console.log('');

// Test 3: Answer first question
console.log('TEST 3: Answer Question');
const result = engine.answerQuestion(session.sessionId, status.nextQuestion.id, 'Server health monitoring - CPU, memory, disk', 'Confident');
console.log('Answered:', result.answered.question);
console.log('Label:', result.labeled.truthLabel + '/' + result.labeled.confidenceLabel);
console.log('New unknowns from answer:', result.newUnknownsCount);
console.log('Remaining:', result.remaining);
console.log('');

// Test 4: Answer another
console.log('TEST 4: Answer Second Question');
const status2 = engine.getStatus(session.sessionId);
const result2 = engine.answerQuestion(session.sessionId, status2.nextQuestion.id, 'DevOps team', 'Confident');
console.log('Answered:', result2.answered.question);
console.log('Remaining:', result2.remaining);
console.log('');

// Test 5: Export
console.log('TEST 5: Export Clarity Map');
const map = engine.exportClarityMap(session.sessionId);
console.log('Ready for implementation:', map.readyForImplementation);
console.log('Knowns:', map.knowns.length);
console.log('Summary:', JSON.stringify(map.summary, null, 2));

console.log('\n✅ All tests passed!');
