/**
 * Ergon - Tool Use Verification System
 * Basic test suite
 */

import { ErgonWrapper } from './ergon-wrapper.js';

const ergon = new ErgonWrapper();

// Test 1: Successful tool invocation
async function testSuccessfulInvocation() {
  console.log('\n--- Test 1: Successful Tool Invocation ---');
  
  ergon.registerTool('add', (input: { a: number; b: number }) => input.a + input.b);
  
  const result = await ergon.invoke<{ a: number; b: number }, number>('add', { a: 2, b: 3 });
  
  console.log('Result:', result.data);
  console.log('Verification Status:', result.verification.status);
  console.log('Confidence Score:', result.verification.confidenceScore);
  
  if (result.verification.status === 'SUCCESS' && result.data === 5) {
    console.log('✅ Test PASSED');
    return true;
  } else {
    console.log('❌ Test FAILED');
    return false;
  }
}

// Test 2: Failed tool invocation (error)
async function testFailedInvocation() {
  console.log('\n--- Test 2: Failed Tool Invocation ---');
  
  ergon.registerTool('failer', () => {
    throw new Error('Intentional failure');
  });
  
  const result = await ergon.invoke('failer', {});
  
  console.log('Success:', result.success);
  console.log('Verification Status:', result.verification.status);
  console.log('Error:', result.error);
  console.log('Error Type:', result.verification.errorType);
  
  if (result.verification.status === 'FAILED' && result.verification.errorType === 'EXPLICIT_ERROR') {
    console.log('✅ Test PASSED');
    return true;
  } else {
    console.log('❌ Test FAILED');
    return false;
  }
}

// Test 3: JSON validation
async function testJsonValidation() {
  console.log('\n--- Test 3: JSON Validation ---');
  
  ergon.registerTool('json-returner', () => JSON.stringify({ hello: 'world', count: 42 }));
  
  const result = await ergon.invoke('json-returner', {});
  
  const jsonValidation = result.verification.validationResults.find(
    v => v.validator === 'JsonValidator'
  );
  
  console.log('JSON Validation:', jsonValidation?.passed);
  console.log('Validation Message:', jsonValidation?.message);
  
  if (jsonValidation?.passed) {
    console.log('✅ Test PASSED');
    return true;
  } else {
    console.log('❌ Test FAILED');
    return false;
  }
}

// Test 4: Invalid JSON detection
async function testInvalidJsonDetection() {
  console.log('\n--- Test 4: Invalid JSON Detection ---');
  
  ergon.registerTool('bad-json', () => '{ invalid: json }');
  
  const result = await ergon.invoke('bad-json', {});
  
  const jsonValidation = result.verification.validationResults.find(
    v => v.validator === 'JsonValidator'
  );
  
  console.log('JSON Validation Passed:', jsonValidation?.passed);
  console.log('Verification Status:', result.verification.status);
  
  if (!jsonValidation?.passed) {
    console.log('✅ Test PASSED - Invalid JSON detected');
    return true;
  } else {
    console.log('❌ Test FAILED');
    return false;
  }
}

// Test 5: Silent failure detection (empty response)
async function testSilentFailureDetection() {
  console.log('\n--- Test 5: Silent Failure Detection ---');
  
  ergon.registerTool('empty-returner', () => null);
  
  const result = await ergon.invoke('empty-returner', {});
  
  const anomaly = result.verification.anomalies.find(a => a.type === 'EMPTY_RESPONSE');
  
  console.log('Anomaly Detected:', anomaly?.type);
  console.log('Anomaly Severity:', anomaly?.severity);
  console.log('Verification Status:', result.verification.status);
  
  if (anomaly) {
    console.log('✅ Test PASSED');
    return true;
  } else {
    console.log('❌ Test FAILED');
    return false;
  }
}

// Test 6: Verification history
async function testVerificationHistory() {
  console.log('\n--- Test 6: Verification History ---');
  
  // Run a few more tools
  ergon.registerTool('math1', () => 10 + 20);
  ergon.registerTool('math2', () => 100 - 1);
  
  await ergon.invoke('math1', {});
  await ergon.invoke('math2', {});
  
  const history = ergon.getHistory(5);
  
  console.log('History Length:', history.length);
  console.log('Last 5 Tools:', history.map(h => h.toolName));
  
  if (history.length >= 5) {
    console.log('✅ Test PASSED');
    return true;
  } else {
    console.log('❌ Test FAILED');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Ergon Test Suite\n');
  
  const results = [];
  
  results.push(await testSuccessfulInvocation());
  results.push(await testFailedInvocation());
  results.push(await testJsonValidation());
  results.push(await testInvalidJsonDetection());
  results.push(await testSilentFailureDetection());
  results.push(await testVerificationHistory());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed');
  }
}

// Run if called directly
runTests().catch(console.error);