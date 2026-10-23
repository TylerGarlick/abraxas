/**
 * test-nexus.js
 * 
 * Test suite for Sovereign-Nexus.
 */

const SovereignNexus = require('../../sovereign-nexus');
const fs = require('fs');
const path = require('path');

const TEST_PATH = './.abraxas/data/test_nexus_ledger.jsonl';
const nexus = new SovereignNexus(TEST_PATH);

async function runTests() {
  console.log('SOVEREIGN-NEXUS INTEGRITY TESTS');
  console.log('='.repeat(40));

  try {
    // Test 1: Appending blocks
    console.log('Test 1: Appending Blocks...');
    const b1 = nexus.appendBlock({ step: 1, thought: 'Initiating reasoning' });
    const b2 = nexus.appendBlock({ step: 2, thought: 'Analyzing evidence' }, b1.hash);
    const b3 = nexus.appendBlock({ step: 3, thought: 'Promoting truth' }, b2.hash);
    console.log(`   - Blocks appended. Last Hash: ${b3.hash.substring(0, 8)}...`);
    console.log('✅ Success');

    // Test 2: Chain Verification
    console.log('\nTest 2: Chain Verification...');
    const verification = nexus.verifyChain();
    console.log(`   - Chain Valid: ${verification.isValid}`);
    if (!verification.isValid) throw new Error(verification.reason);
    console.log('✅ Success');

    // Test 3: Corruption Detection
    console.log('\nTest 3: Corruption Detection...');
    const chain = nexus.getChain();
    const corruptedBlock = { ...chain[1], data: { step: 2, thought: 'TAMPERED' } };
    corruptedBlock.hash = nexus.calculateHash(corruptedBlock); // Rehash but break link to b1
    
    // Manually corrupt the file
    const lines = fs.readFileSync(TEST_PATH, 'utf8').trim().split('\n');
    lines[1] = JSON.stringify(corruptedBlock);
    fs.writeFileSync(TEST_PATH, lines.join('\n') + '\n');

    const corruptionResult = nexus.verifyChain();
    console.log(`   - Chain Valid: ${corruptionResult.isValid}`);
    console.log(`   - Corruption Index: ${corruptionResult.corruptionIndex}`);
    if (corruptionResult.isValid) throw new Error('Failed to detect corruption');
    console.log('✅ Success');

    // Test 4: Sovereign Receipt
    console.log('\nTest 4: Receipt Generation...');
    const receipt = nexus.generateReceipt(b3.hash);
    console.log(`   - Receipt found: ${!!receipt}`);
    console.log(`   - Provenance length: ${receipt.provenance.length}`);
    if (!receipt || receipt.provenance.length !== 3) throw new Error('Invalid receipt');
    console.log('✅ Success');

  } catch (e) {
    console.error(`❌ Test Failed: ${e.message}`);
    process.exit(1);
  } finally {
    if (fs.existsSync(TEST_PATH)) fs.unlinkSync(TEST_PATH);
  }
}

runTests();
