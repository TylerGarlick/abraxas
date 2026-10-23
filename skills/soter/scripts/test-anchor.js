/**
 * test-anchor.js
 * 
 * Test suite for Sovereign-Anchor.
 */

const SovereignAnchor = require('../../sovereign-anchor');
const fs = require('fs');

const TEST_PATH = './.abraxas/data/test_genesis.json';
const anchor = new SovereignAnchor(TEST_PATH);

async function runTests() {
  console.log('SOVEREIGN-ANCHOR DIVINE PRIORITY TESTS');
  console.log('='.repeat(40));

  try {
    // Test 1: Injecting Genesis Blocks
    console.log('Test 1: Injecting Genesis Blocks...');
    anchor.injectGenesisBlock('core_identity', 'Abraxas is the Sovereign Brain');
    anchor.injectGenesisBlock('system_constant', 'Tau = 0.15');
    console.log('✅ Success');

    // Test 2: Divine Priority Resolution
    console.log('\nTest 2: Divine Priority Resolution...');
    const resolution = anchor.resolve('What is the core_identity?');
    console.log(`   - Found: ${resolution.found}`);
    console.log(`   - Value: ${resolution.value}`);
    console.log(`   - Priority: ${resolution.priority}`);
    if (!resolution.found || resolution.value !== 'Abraxas is the Sovereign Brain') {
      throw new Error('Failed to resolve Genesis block');
    }
    console.log('✅ Success');

    // Test 3: Divine Override
    console.log('\nTest 3: Divine Override (Updating Block)...');
    anchor.injectGenesisBlock('core_identity', 'Abraxas is the Sovereign Intelligence');
    const updated = anchor.resolve('What is the core_identity?');
    if (updated.value !== 'Abraxas is the Sovereign Intelligence') {
      throw new Error('Failed to update Genesis block');
    }
    console.log('✅ Success');

    // Test 4: No Match
    console.log('\nTest 4: Non-existent Anchor...');
    const missing = anchor.resolve('What is the meaning of life?');
    if (missing.found) throw new Error('Should not have found a match');
    console.log('✅ Success');

  } catch (e) {
    console.error(`❌ Test Failed: ${e.message}`);
    process.exit(1);
  } finally {
    if (fs.existsSync(TEST_PATH)) fs.unlinkSync(TEST_PATH);
  }
}

runTests();
