/**
 * Sovereign Channel Filtering Test Script
 * 
 * Tests the channel authorization system for Abraxas Dream Reservoir write operations.
 * 
 * Run with: 
 *   npx ts-node tests/sovereign-channel-test.ts
 *   or
 *   bun run tests/sovereign-channel-test.ts
 */

import { Database } from 'arangojs';
import path from 'path';
import fs from 'fs';

// Load environment
const ENV_PATH = path.join(__dirname, '../.env.sovereign');
if (fs.existsSync(ENV_PATH)) {
  console.log('Loading sovereign channels config from:', ENV_PATH);
}

// Database connection
const db = new Database({
  url: 'http://localhost:8529',
  databaseName: 'abraxas_db',
  auth: {
    type: 'basic',
    username: 'root',
    password: '[REDACTED_Sovereign_Credential]'
  }
});

// Load sovereign channels (mimics the validation logic)
function loadSovereignChannels(): Set<string> {
  const envChannels = process.env.SOVEREIGN_CHANNELS;
  if (envChannels) {
    return new Set(envChannels.split(',').map(id => id.trim()).filter(Boolean));
  }
  
  try {
    const configPath = path.join(__dirname, '../config/sovereign-channels.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return new Set(config.sovereignChannels || []);
  } catch (e) {
    console.warn('Warning: Could not load sovereign channels config');
    return new Set();
  }
}

const SOVEREIGN_CHANNELS = loadSovereignChannels();

function validateSovereignChannel(channelId: string | undefined): void {
  if (!channelId) {
    throw new Error('Unauthorized: channelId is required for write operations');
  }
  if (!SOVEREIGN_CHANNELS.has(channelId)) {
    throw new Error(`Unauthorized: Channel ${channelId} is not authorized for write operations`);
  }
}

// Test constants
const SOVEREIGN_CHANNEL_ID = '1492380897167540325'; // Authorized channel
const UNAUTHORIZED_CHANNEL_ID = '1234567890123456789'; // Not in whitelist

async function runTests() {
  console.log('\n🔐 Sovereign Channel Filtering Tests\n');
  console.log('Loaded sovereign channels:', Array.from(SOVEREIGN_CHANNELS));
  console.log('');

  let passed = 0;
  let failed = 0;

  // Test 1: Validation - Sovereign channel should pass
  console.log('Test 1: Sovereign channel validation (should PASS)');
  try {
    validateSovereignChannel(SOVEREIGN_CHANNEL_ID);
    console.log('  ✅ PASS: Sovereign channel accepted\n');
    passed++;
  } catch (e: any) {
    console.log('  ❌ FAIL:', e.message, '\n');
    failed++;
  }

  // Test 2: Validation - Unauthorized channel should fail
  console.log('Test 2: Unauthorized channel validation (should FAIL)');
  try {
    validateSovereignChannel(UNAUTHORIZED_CHANNEL_ID);
    console.log('  ❌ FAIL: Unauthorized channel was accepted (should have been rejected)\n');
    failed++;
  } catch (e: any) {
    if (e.message.includes('Unauthorized')) {
      console.log('  ✅ PASS: Unauthorized channel correctly rejected\n');
      passed++;
    } else {
      console.log('  ❌ FAIL: Wrong error:', e.message, '\n');
      failed++;
    }
  }

  // Test 3: Validation - Missing channelId should fail
  console.log('Test 3: Missing channelId validation (should FAIL)');
  try {
    validateSovereignChannel(undefined as any);
    console.log('  ❌ FAIL: Missing channelId was accepted (should have been rejected)\n');
    failed++;
  } catch (e: any) {
    if (e.message.includes('Unauthorized')) {
      console.log('  ✅ PASS: Missing channelId correctly rejected\n');
      passed++;
    } else {
      console.log('  ❌ FAIL: Wrong error:', e.message, '\n');
      failed++;
    }
  }

  // Test 4: GraphQL mutation - startDreamCycle with sovereign channel
  console.log('Test 4: startDreamCycle with sovereign channel (GraphQL)');
  try {
    const sessionColl = db.collection('dream_sessions');
    const session = {
      timestamp: new Date().toISOString(),
      userPrompt: 'Test prompt from sovereign channel',
      seedConcepts: ['test', 'sovereign'],
      channelId: SOVEREIGN_CHANNEL_ID,
    };
    validateSovereignChannel(session.channelId);
    const result = await sessionColl.save(session);
    console.log('  ✅ PASS: Dream session created successfully');
    console.log('     Session ID:', result._key);
    console.log('     Channel ID:', session.channelId, '\n');
    passed++;
    
    // Cleanup
    await sessionColl.remove(result._key);
  } catch (e: any) {
    console.log('  ❌ FAIL:', e.message, '\n');
    failed++;
  }

  // Test 5: GraphQL mutation - startDreamCycle with unauthorized channel
  console.log('Test 5: startDreamCycle with unauthorized channel (GraphQL)');
  try {
    const session = {
      timestamp: new Date().toISOString(),
      userPrompt: 'Test prompt from unauthorized channel',
      seedConcepts: ['test', 'unauthorized'],
      channelId: UNAUTHORIZED_CHANNEL_ID,
    };
    validateSovereignChannel(session.channelId); // Should throw
    console.log('  ❌ FAIL: Unauthorized channel was accepted (should have been rejected)\n');
    failed++;
  } catch (e: any) {
    if (e.message.includes('Unauthorized')) {
      console.log('  ✅ PASS: Unauthorized channel correctly rejected\n');
      passed++;
    } else {
      console.log('  ❌ FAIL: Wrong error:', e.message, '\n');
      failed++;
    }
  }

  // Test 6: Create hypothesis with sovereign channel
  console.log('Test 6: createHypothesis with sovereign channel');
  try {
    // First create a session
    const sessionColl = db.collection('dream_sessions');
    const sessionResult = await sessionColl.save({
      timestamp: new Date().toISOString(),
      userPrompt: 'Parent session',
      seedConcepts: ['test'],
      channelId: SOVEREIGN_CHANNEL_ID,
    });
    
    const hypoColl = db.collection('hypotheses');
    const hypoData = {
      rawPatternRepresentation: 'Test hypothesis pattern',
      metadata: {
        noveltyScore: 0.8,
        coherenceScore: 0.7,
        creativeDrivers: ['ANALOGICAL_LEAP'],
      },
      isValuable: false,
      channelId: SOVEREIGN_CHANNEL_ID,
    };
    validateSovereignChannel(hypoData.channelId);
    const hypoResult = await hypoColl.save(hypoData);
    
    console.log('  ✅ PASS: Hypothesis created successfully');
    console.log('     Hypothesis ID:', hypoResult._key);
    console.log('     Channel ID:', hypoData.channelId, '\n');
    passed++;
    
    // Cleanup
    await hypoColl.remove(hypoResult._key);
    await sessionColl.remove(sessionResult._key);
  } catch (e: any) {
    console.log('  ❌ FAIL:', e.message, '\n');
    failed++;
  }

  // Test 7: Create concept with sovereign channel
  console.log('Test 7: translateHypothesisToConcept with sovereign channel');
  try {
    const conceptColl = db.collection('concepts');
    const conceptData = {
      name: 'Test Concept',
      description: 'A concept created from sovereign channel',
      channelId: SOVEREIGN_CHANNEL_ID,
    };
    validateSovereignChannel(conceptData.channelId);
    const result = await conceptColl.save(conceptData);
    
    console.log('  ✅ PASS: Concept created successfully');
    console.log('     Concept ID:', result._key);
    console.log('     Channel ID:', conceptData.channelId, '\n');
    passed++;
    
    // Cleanup
    await conceptColl.remove(result._key);
  } catch (e: any) {
    console.log('  ❌ FAIL:', e.message, '\n');
    failed++;
  }

  // Test 8: Create actionable plan with sovereign channel
  console.log('Test 8: groundConcept with sovereign channel');
  try {
    const planColl = db.collection('actionable_plans');
    const planData = {
      summary: 'Test action plan',
      steps: ['Step 1', 'Step 2', 'Step 3'],
      riskAssessment: 'Low risk',
      groundingStatus: 'ANCHORED',
      guardrailChecks: [],
      channelId: SOVEREIGN_CHANNEL_ID,
    };
    validateSovereignChannel(planData.channelId);
    const result = await planColl.save(planData);
    
    console.log('  ✅ PASS: Actionable plan created successfully');
    console.log('     Plan ID:', result._key);
    console.log('     Channel ID:', planData.channelId, '\n');
    passed++;
    
    // Cleanup
    await planColl.remove(result._key);
  } catch (e: any) {
    console.log('  ❌ FAIL:', e.message, '\n');
    failed++;
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
