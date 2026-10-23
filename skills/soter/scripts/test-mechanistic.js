/**
 * soter-test-mechanistic.js
 * 
 * Test suite for the Soter mechanistic trigger (τ=0.15).
 */

const SoterCore = require('../core');
const soter = new SoterCore();

const testCases = [
  {
    name: 'Stable Grounding (Low Sink)',
    signals: {
      attentionWeights: [
        { 'BOS': 0.05, 'Punct': 0.02 },
        { 'BOS': 0.04, 'Punct': 0.03 }
      ],
      sinkTokens: ['BOS', 'Punct']
    },
    expectedTrigger: 0,
    expectedRouting: 'STANDARD'
  },
  {
    name: 'Epistemic Stall (Trigger Tau)',
    signals: {
      attentionWeights: [
        { 'BOS': 0.16, 'Punct': 0.14 },
        { 'BOS': 0.17, 'Punct': 0.15 }
      ],
      sinkTokens: ['BOS', 'Punct']
    },
    expectedTrigger: 1,
    expectedRouting: 'CVP'
  },
  {
    name: 'Total Grounding Collapse (High Sink)',
    signals: {
      attentionWeights: [
        { 'BOS': 0.45, 'Punct': 0.30 },
        { 'BOS': 0.50, 'Punct': 0.40 }
      ],
      sinkTokens: ['BOS', 'Punct']
    },
    expectedTrigger: 1,
    expectedRouting: 'CVP'
  }
];

console.log('SOTER MECHANISTIC TRIGGER TESTS');
console.log('='.repeat(40));

testCases.forEach(tc => {
  const result = soter.evaluate('Test query', tc.signals);
  const passed = result.trigger === tc.expectedTrigger && result.routing === tc.expectedRouting;
  
  console.log(`${passed ? '✅' : '❌'} ${tc.name}`);
  console.log(`   - Avg Sink: ${result.details.mechanistic.averageSinkWeight.toFixed(3)}`);
  console.log(`   - Trigger: ${result.trigger} (Expected: ${tc.expectedTrigger})`);
  console.log(`   - Routing: ${result.routing} (Expected: ${tc.expectedRouting})`);
  console.log('----------------------------------------');
});
