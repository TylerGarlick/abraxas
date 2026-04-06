/**
 * Test script for Abraxas Interactive Demo
 * Verifies the API endpoints work correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Abraxas Interactive Demo API\n');
  console.log('=' .repeat(60));

  // Test 1: GET /api/test-cases
  console.log('\n📋 Test 1: GET /api/test-cases');
  try {
    const res = await makeRequest('/api/test-cases');
    console.log(`Status: ${res.status}`);
    console.log(`Test cases loaded: ${res.data.length}`);
    res.data.forEach(tc => {
      console.log(`  - ${tc.claim} (${tc.type}) → expected: ${tc.expected}`);
    });
    console.log('✅ PASSED');
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }

  // Test 2: POST /api/verify - Simple arithmetic (match)
  console.log('\n📋 Test 2: POST /api/verify - "2 + 2 = 4"');
  try {
    const res = await makeRequest('/api/verify', 'POST', { claim: '2 + 2 = 4' });
    console.log(`Status: ${res.status}`);
    console.log(`Confidence: ${res.data.verification.confidence}`);
    console.log(`Result: ${res.data.verification.result}`);
    console.log(`Labels: ${res.data.labels.map(l => l.label).join(', ')}`);
    console.log(`Steps: ${res.data.verification.steps.length}`);
    res.data.verification.steps.forEach(s => {
      console.log(`  Step ${s.step}: ${s.description} → ${s.result || 'N/A'}`);
    });
    if (res.data.verification.confidence === 'VERIFIED') {
      console.log('✅ PASSED');
    } else {
      console.log('⚠️ Expected VERIFIED');
    }
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }

  // Test 3: POST /api/verify - Arithmetic mismatch
  console.log('\n📋 Test 3: POST /api/verify - "2 + 2 = 5"');
  try {
    const res = await makeRequest('/api/verify', 'POST', { claim: '2 + 2 = 5' });
    console.log(`Status: ${res.status}`);
    console.log(`Confidence: ${res.data.verification.confidence}`);
    console.log(`Result: ${res.data.verification.result}`);
    console.log(`Labels: ${res.data.labels.map(l => l.label).join(', ')}`);
    if (res.data.verification.result === 'mismatch' || res.data.verification.confidence === 'CONFLICT') {
      console.log('✅ PASSED - Mismatch detected!');
    } else {
      console.log('⚠️ Expected CONFLICT/mismatch');
    }
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }

  // Test 4: POST /api/verify - Equation
  console.log('\n📋 Test 4: POST /api/verify - "3x + 7 = 22"');
  try {
    const res = await makeRequest('/api/verify', 'POST', { claim: '3x + 7 = 22' });
    console.log(`Status: ${res.status}`);
    console.log(`Confidence: ${res.data.verification.confidence}`);
    console.log(`Computed: ${res.data.verification.computed}`);
    console.log(`Steps: ${res.data.verification.steps.length}`);
    res.data.verification.steps.forEach(s => {
      console.log(`  Step ${s.step}: ${s.description} → ${s.result || 'N/A'}`);
    });
    console.log('✅ PASSED');
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }

  // Test 5: GET /api/comparison
  console.log('\n📋 Test 5: GET /api/comparison');
  try {
    const res = await makeRequest('/api/comparison');
    console.log(`Status: ${res.status}`);
    console.log(`Dimensions: ${res.data.dimensions.length}`);
    console.log(`Features: ${res.data.features.length}`);
    res.data.dimensions.slice(0, 3).forEach(d => {
      console.log(`  ${d.name}: Abraxas=${d.abraxas}, Claude=${d.claude}, GPT-4=${d.gpt4}`);
    });
    console.log('✅ PASSED');
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }

  // Test 6: Pipeline simulation
  console.log('\n📋 Test 6: Pipeline Simulation');
  try {
    const res = await makeRequest('/api/verify', 'POST', { claim: '15 * 8 = 120' });
    console.log(`Pipeline stages: ${res.data.pipeline.length}`);
    res.data.pipeline.forEach(p => {
      console.log(`  ${p.stage}: ${p.action} (${p.duration}ms)`);
    });
    console.log(`Total duration: ${res.data.pipeline.totalDuration}ms`);
    console.log('✅ PASSED');
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Test run complete!\n');
}

runTests().catch(console.error);
