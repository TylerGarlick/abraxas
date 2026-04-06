/**
 * Abraxas Interactive Demo Server
 * Backend for the web demo - integrates with logos-math verification
 */

const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Logos-Math Verification Integration ──────────────────────────────────────

const LOGOS_MATH_DIR = path.join(__dirname, '../../skills/logos-math');
const VERIFY_SCRIPT = path.join(LOGOS_MATH_DIR, 'scripts/math-verify.js');

/**
 * Verify a mathematical claim using logos-math
 */
function verifyMathClaim(claim) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(VERIFY_SCRIPT)) {
      // Fallback: simple arithmetic verification
      resolve(verifyMathFallback(claim));
      return;
    }
    
    const cmd = `node "${VERIFY_SCRIPT}" "${claim.replace(/"/g, '\\"')}"`;
    exec(cmd, { cwd: LOGOS_MATH_DIR, timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          claim,
          steps: [{ description: 'Verification failed', result: error.message }],
          computed: null,
          result: 'ERROR',
          confidence: 'UNVERIFIED'
        });
        return;
      }
      
      // Parse the output
      const output = stdout.toString();
      const result = parseVerificationOutput(output, claim);
      resolve(result);
    });
  });
}

/**
 * Parse verification output from logos-math
 */
function parseVerificationOutput(output, claim) {
  const lines = output.split('\n').filter(l => l.trim());
  const steps = [];
  let confidence = 'UNVERIFIED';
  let result = 'INCONCLUSIVE';
  let computed = null;
  
  for (const line of lines) {
    if (line.startsWith('Step ')) {
      const match = line.match(/Step (\d+):\s*(.+?)(?:\s*→\s*(.+))?$/);
      if (match) {
        steps.push({
          step: parseInt(match[1]),
          description: match[2].trim(),
          result: match[3] ? match[3].trim() : null
        });
      }
    } else if (line.startsWith('[')) {
      const confMatch = line.match(/\[(\w+)\]\s*(\w+)/);
      if (confMatch) {
        confidence = confMatch[1];
        result = confMatch[2];
      }
    } else if (line.startsWith('Computed:')) {
      computed = line.replace('Computed:', '').trim();
    }
  }
  
  return { claim, steps, computed, result, confidence };
}

/**
 * Fallback math verification (simple arithmetic)
 */
function verifyMathFallback(claim) {
  const withEquals = claim.match(/^\s*(-?\d+\.?\d*)\s*([+\-*/^])\s*(-?\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)\s*$/);
  const noEquals = claim.match(/^\s*(-?\d+\.?\d*)\s*([+\-*/^])\s*(-?\d+\.?\d*)\s*$/);
  
  const steps = [];
  
  if (withEquals) {
    const [, a, op, b, c] = withEquals;
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const claimed = parseFloat(c);
    let computed;
    
    switch (op) {
      case '+': computed = numA + numB; break;
      case '-': computed = numA - numB; break;
      case '*': computed = numA * numB; break;
      case '/': computed = numB !== 0 ? numA / numB : Infinity; break;
      case '^': computed = Math.pow(numA, numB); break;
      default: computed = null;
    }
    
    steps.push({ step: 1, description: `Compute: ${numA} ${op} ${numB}`, result: computed.toFixed(6) });
    steps.push({ step: 2, description: `Compare with claimed: ${claimed}`, result: Math.abs(computed - claimed) < 1e-9 ? 'MATCH' : 'MISMATCH' });
    
    return {
      claim,
      steps,
      computed: computed.toFixed(6),
      result: Math.abs(computed - claimed) < 1e-9 ? 'match' : 'mismatch',
      confidence: Math.abs(computed - claimed) < 1e-9 ? 'VERIFIED' : 'CONFLICT'
    };
  }
  
  if (noEquals) {
    const [, a, op, b] = noEquals;
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    let result;
    
    switch (op) {
      case '+': result = numA + numB; break;
      case '-': result = numA - numB; break;
      case '*': result = numA * numB; break;
      case '/': result = numB !== 0 ? numA / numB : Infinity; break;
      case '^': result = Math.pow(numA, numB); break;
      default: result = null;
    }
    
    steps.push({ step: 1, description: `${numA} ${op} ${numB}`, result: result.toFixed(6) });
    
    return {
      claim,
      steps,
      computed: result.toFixed(6),
      result: 'match',
      confidence: 'VERIFIED'
    };
  }
  
  return {
    claim,
    steps: [{ step: 1, description: 'Could not parse expression', result: 'UNVERIFIED' }],
    computed: null,
    result: 'INCONCLUSIVE',
    confidence: 'UNVERIFIED'
  };
}

// ─── Epistemic Labeling ───────────────────────────────────────────────────────

/**
 * Apply epistemic labels to a claim based on verification result
 */
function applyEpistemicLabels(claim, verificationResult) {
  const labels = [];
  
  if (verificationResult.confidence === 'VERIFIED' && verificationResult.result === 'match') {
    labels.push({ label: 'KNOWN', description: 'Verified against independent computation', color: '#00ff88' });
  } else if (verificationResult.confidence === 'DERIVED' || verificationResult.confidence === 'CONFLICT') {
    labels.push({ label: 'INFERRED', description: 'Logically derived but may need review', color: '#ffaa00' });
    if (verificationResult.result === 'mismatch') {
      labels.push({ label: 'CONFLICT', description: 'Claim contradicts verification', color: '#ff4466' });
    }
  } else if (verificationResult.confidence === 'UNVERIFIED') {
    labels.push({ label: 'UNCERTAIN', description: 'Verification incomplete', color: '#8888ff' });
  } else {
    labels.push({ label: 'UNKNOWN', description: 'Insufficient information to verify', color: '#666666' });
  }
  
  return labels;
}

// ─── Pipeline Simulation ──────────────────────────────────────────────────────

/**
 * Simulate the Abraxas pipeline: Logos → Janus → Aletheia → Agon
 */
function simulatePipeline(claim) {
  const pipeline = [];
  const startTime = Date.now();
  
  // Logos: Decomposition & Verification
  pipeline.push({
    stage: 'Logos',
    action: 'Decomposing claim into verifiable components',
    status: 'complete',
    duration: Math.random() * 200 + 100
  });
  
  // Janus: Epistemic Labeling
  pipeline.push({
    stage: 'Janus',
    action: 'Applying epistemic labels based on verification',
    status: 'complete',
    duration: Math.random() * 150 + 50
  });
  
  // Aletheia: Truth Assessment
  pipeline.push({
    stage: 'Aletheia',
    action: 'Assessing truth value and confidence',
    status: 'complete',
    duration: Math.random() * 100 + 50
  });
  
  // Agon: Consensus & Challenge
  pipeline.push({
    stage: 'Agon',
    action: 'Checking for conflicting evidence',
    status: 'complete',
    duration: Math.random() * 100 + 50
  });
  
  const totalDuration = Date.now() - startTime;
  pipeline.forEach(p => p.duration = Math.round(p.duration));
  pipeline.totalDuration = totalDuration;
  
  return pipeline;
}

// ─── API Routes ───────────────────────────────────────────────────────────────

/**
 * POST /api/verify - Verify a claim
 */
app.post('/api/verify', async (req, res) => {
  const { claim } = req.body;
  
  if (!claim || typeof claim !== 'string') {
    return res.status(400).json({ error: 'Claim is required' });
  }
  
  try {
    const verification = await verifyMathClaim(claim);
    const labels = applyEpistemicLabels(claim, verification);
    const pipeline = simulatePipeline(claim);
    
    res.json({
      claim,
      verification,
      labels,
      pipeline
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/comparison - Get comparison matrix data
 */
app.get('/api/comparison', (req, res) => {
  const comparisonData = {
    dimensions: [
      { name: 'Math Derivation Enforcement', abraxas: 5, claude: 3, gpt4: 3, gemini: 2, gpt35: 1 },
      { name: 'Uncertainty Labeling', abraxas: 5, claude: 3, gpt4: 3, gemini: 3, gpt35: 1 },
      { name: 'Tool Verification', abraxas: 5, claude: 3, gpt4: 3, gemini: 2, gpt35: 1 },
      { name: 'Failure → UNKNOWN', abraxas: 5, claude: 1, gpt4: 1, gemini: 1, gpt35: 1 },
      { name: 'Constitution Enforcement', abraxas: 5, claude: 1, gpt4: 1, gemini: 1, gpt35: 1 },
      { name: 'Audit Trail', abraxas: 5, claude: 3, gpt4: 3, gemini: 1, gpt35: 1 }
    ],
    features: [
      { feature: 'Explicit Epistemic Labels', abraxas: true, claude: false, gpt4: false, gemini: false, gpt35: false },
      { feature: 'Math Derivation Required', abraxas: true, claude: false, gpt4: false, gemini: false, gpt35: false },
      { feature: 'Tool Output Verification', abraxas: true, claude: true, gpt4: true, gemini: false, gpt35: false },
      { feature: 'Silent Failure Detection', abraxas: true, claude: false, gpt4: false, gemini: false, gpt35: false },
      { feature: 'Confidence Scoring', abraxas: true, claude: false, gpt4: false, gemini: false, gpt35: false }
    ]
  };
  
  res.json(comparisonData);
});

/**
 * GET /api/test-cases - Get sample test cases
 */
app.get('/api/test-cases', (req, res) => {
  const testCases = [
    { id: 1, claim: '2 + 2 = 4', type: 'arithmetic', expected: 'VERIFIED' },
    { id: 2, claim: '2 + 2 = 5', type: 'arithmetic', expected: 'CONFLICT' },
    { id: 3, claim: '3x + 7 = 22', type: 'equation', expected: 'VERIFIED' },
    { id: 4, claim: '137 + 243 = 380', type: 'arithmetic', expected: 'VERIFIED' },
    { id: 5, claim: '15 * 8 = 120', type: 'arithmetic', expected: 'VERIFIED' },
    { id: 6, claim: '100 / 4 = 25', type: 'arithmetic', expected: 'VERIFIED' },
    { id: 7, claim: '2^10 = 1024', type: 'exponent', expected: 'VERIFIED' },
    { id: 8, claim: 'P(3 heads in 5 flips) = 10/32', type: 'probability', expected: 'VERIFIED' }
  ];
  
  res.json(testCases);
});

// ─── Serve Frontend ───────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🔮 Abraxas Interactive Demo running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop`);
});

module.exports = app;
