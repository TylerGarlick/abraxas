/**
 * abraxas-logos/verify.js
 * Verification layer for atomic propositions
 * Integrates Pheme (fact-checking) and Janus (epistemic labeling)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOME = os.homedir();
const LOGOS_DIR = path.join(HOME, '.logos');
const VERIFICATIONS_FILE = path.join(LOGOS_DIR, 'verifications.json');
const CACHE_DIR = path.join(LOGOS_DIR, 'cache');

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR, { recursive: true });
  }
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Verification statuses from Pheme
 */
export const VerificationStatus = {
  VERIFIED: 'VERIFIED',
  CONTRADICTED: 'CONTRADICTED',
  UNVERIFIABLE: 'UNVERIFIABLE',
  PENDING: 'PENDING',
  ERROR: 'ERROR'
};

/**
 * Janus epistemic labels
 */
export const JanusLabel = {
  KNOWN: 'KNOWN',
  INFERRED: 'INFERRED',
  UNCERTAIN: 'UNCERTAIN',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Atom classification
 */
export const AtomType = {
  FACTUAL: 'factual',
  INFERENTIAL: 'inferential',
  VALUE: 'value',
  UNKNOWN: 'unknown'
};

/**
 * Get cached verification result
 * @param {string} atom - The atom string
 * @returns {Object|null} Cached result or null
 */
function getCached(atom) {
  const cacheKey = Buffer.from(atom).toString('base64').replace(/[/+=]/g, '_');
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    // Check if cache is still valid (24 hours)
    const cacheAge = Date.now() - cached.timestamp;
    if (cacheAge < 24 * 60 * 60 * 1000) {
      return cached.result;
    }
  }
  return null;
}

/**
 * Cache verification result
 * @param {string} atom - The atom string
 * @param {Object} result - Result to cache
 */
function cacheResult(atom, result) {
  const cacheKey = Buffer.from(atom).toString('base64').replace(/[/+=]/g, '_');
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  fs.writeFileSync(cacheFile, JSON.stringify({
    timestamp: Date.now(),
    atom,
    result
  }, null, 2));
}

/**
 * Classify an atom type
 * @param {string} atom - The atomic proposition
 * @returns {string} Atom type
 */
function classifyAtom(atom) {
  const lower = atom.toLowerCase();
  
  // Check for factual indicators (includes verbs like orbits)
  const factualPatterns = [
    /\b(is|are|was|were|has|have|had|does|do|did)\b/i,
    /\b(equal|equal to|greater|less|more than|less than)\b/i,
    /\b(located|born|died|created|founded|established)\b/i,
    /\b(orbits|revolves|rotates|moves|travels|cause|causes)\b/i,
    /\b\d+(\.\d+)?\s*(million|billion|percent|%|degrees?|km|miles?|years?)\b/i
  ];
  
  // Check for inferential indicators
  const inferentialPatterns = [
    /\b(therefore|thus|hence|so|because|since|consequently)\b/i,
    /\b(imply|suggest|indicate|mean|show)\b/i,
    /\b(probably|likely|possibly|might|may)\b/i
  ];
  
  // Check for value judgments
  const valuePatterns = [
    /\b(good|bad|right|wrong|better|worse|best|worst)\b/i,
    /\b(should|ought|must|need to)\b/i,
    /\b(ethical|moral|fair|just|acceptable)\b/i
  ];
  
  // Check in order: inferential (most specific), value, factual (most common)
  for (const pattern of inferentialPatterns) {
    if (pattern.test(lower)) {
      return AtomType.INFERENTIAL;
    }
  }
  
  for (const pattern of valuePatterns) {
    if (pattern.test(lower)) {
      return AtomType.VALUE;
    }
  }
  
  for (const pattern of factualPatterns) {
    if (pattern.test(lower)) {
      return AtomType.FACTUAL;
    }
  }
  
  // Default to factual if it looks like a statement
  if (atom.includes('.') || atom.includes(' is ') || atom.includes(' are ')) {
    return AtomType.FACTUAL;
  }
  
  // If contains word+space+word pattern, likely factual
  if (/\b\w+\s+\w+/.test(lower)) {
    return AtomType.FACTUAL;
  }
  
  return AtomType.UNKNOWN;
}

/**
 * Simulate Pheme fact-checking
 * In production, this would call an external Pheme API
 * @param {string} atom - The atom to verify
 * @returns {Object} Verification result
 */
function callPhemeAPI(atom) {
  // This is a simulated response
  // In production, this would call the actual Pheme service
  const lower = atom.toLowerCase();
  
  // Known verifiable facts for simulation
  const verifiedFacts = [
    'the earth orbits the sun',
    'water boils at 100 degrees celsius',
    'paris is the capital of france',
    'humans need oxygen to survive'
  ];
  
  const contradictedFacts = [
    'the earth is flat',
    'the sun orbits the earth',
    'vaccines cause autism'
  ];
  
  for (const fact of verifiedFacts) {
    if (lower.includes(fact)) {
      return {
        status: VerificationStatus.VERIFIED,
        sources: ['wikipedia.org', 'nasa.gov'],
        confidence: 0.95,
        details: `Confirmed by ${2} authoritative sources`
      };
    }
  }
  
  for (const fact of contradictedFacts) {
    if (lower.includes(fact)) {
      return {
        status: VerificationStatus.CONTRADICTED,
        sources: ['wikipedia.org', 'scientific journals'],
        confidence: 0.98,
        details: 'Contradicted by authoritative sources'
      };
    }
  }
  
  // Default to unverifiable for unknown claims
  return {
    status: VerificationStatus.UNVERIFIABLE,
    sources: [],
    confidence: 0.0,
    details: 'No authoritative sources found for verification'
  };
}

/**
 * Apply Janus epistemic label based on verification result
 * @param {Object} verification - Pheme verification result
 * @param {string} atomType - Type of atom
 * @returns {Object} Janus label result
 */
function applyJanusLabel(verification, atomType) {
  const { status, confidence } = verification;
  
  // If factual, use verification result to determine label
  if (atomType === AtomType.FACTUAL) {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return {
          label: JanusLabel.KNOWN,
          reasoning: 'Verified by authoritative sources',
          confidence: confidence * 0.95
        };
      case VerificationStatus.CONTRADICTED:
        return {
          label: JanusLabel.UNKNOWN,
          reasoning: 'Contradicted by authoritative sources',
          confidence: confidence * 0.98
        };
      case VerificationStatus.UNVERIFIABLE:
        return {
          label: JanusLabel.UNCERTAIN,
          reasoning: 'Could not verify against authoritative sources',
          confidence: 0.3
        };
      default:
        return {
          label: JanusLabel.UNCERTAIN,
          reasoning: 'Verification pending or error',
          confidence: 0.1
        };
    }
  }
  
  // If inferential, treat as inferred
  if (atomType === AtomType.INFERENTIAL) {
    return {
      label: JanusLabel.INFERRED,
      reasoning: 'Derived through reasoning from other premises',
      confidence: 0.5
    };
  }
  
  // If value judgment, treat as uncertain
  if (atomType === AtomType.VALUE) {
    return {
      label: JanusLabel.UNCERTAIN,
      reasoning: 'Value judgment not amenable to factual verification',
      confidence: 0.2
    };
  }
  
  // Default case
  return {
    label: JanusLabel.UNKNOWN,
    reasoning: 'Unable to determine epistemic status',
    confidence: 0.0
  };
}

/**
 * Main verification function
 * @param {Object} options - Verification options
 * @param {string|string[]} options.atoms - Single atom or array of atoms
 * @param {boolean} options.skipCache - Skip cache lookup
 * @param {boolean} options.saveToHistory - Save to verification history
 * @returns {Object} Verification results
 */
export async function verify(options) {
  const { atoms, skipCache = false, saveToHistory = true } = options;
  
  ensureDirectories();
  
  // Normalize atoms to array
  const atomList = Array.isArray(atoms) ? atoms : [atoms];
  
  const results = [];
  
  for (const atom of atomList) {
    // Check cache first (unless skipped)
    if (!skipCache) {
      const cached = getCached(atom);
      if (cached) {
        results.push({
          atom,
          ...cached,
          cached: true
        });
        continue;
      }
    }
    
    // Step 1: Classify the atom type
    const atomType = classifyAtom(atom);
    
    // Step 2: Verify factual atoms with Pheme
    let verification;
    if (atomType === AtomType.FACTUAL) {
      verification = callPhemeAPI(atom);
    } else {
      // Non-factual atoms don't need Pheme verification
      verification = {
        status: atomType === AtomType.INFERENTIAL ? VerificationStatus.PENDING : VerificationStatus.UNVERIFIABLE,
        sources: [],
        confidence: 0.0,
        details: 'Not a factual claim - verification skipped'
      };
    }
    
    // Step 3: Apply Janus labels
    const janusLabel = applyJanusLabel(verification, atomType);
    
    // Combine results
    const result = {
      atom,
      atomType,
      verification,
      epistemic: janusLabel,
      combinedLabel: `[${janusLabel.label}]`,
      verificationLabel: verification.status !== VerificationStatus.PENDING 
        ? `[${verification.status}]` 
        : '',
      timestamp: Date.now(),
      cached: false
    };
    
    // Cache the result
    cacheResult(atom, {
      atomType,
      verification,
      epistemic: janusLabel
    });
    
    results.push(result);
    
    // Save to history
    if (saveToHistory) {
      saveToVerificationHistory(result);
    }
  }
  
  return {
    results: Array.isArray(atoms) ? results : results[0],
    summary: generateSummary(results)
  };
}

/**
 * Generate summary of verification results
 * @param {Object[]} results - Verification results
 * @returns {Object} Summary
 */
function generateSummary(results) {
  const counts = {
    verified: 0,
    contradicted: 0,
    unverifiable: 0,
    pending: 0,
    errors: 0,
    known: 0,
    inferred: 0,
    uncertain: 0,
    unknown: 0
  };
  
  for (const result of results) {
    const v = result.verification?.status;
    const e = result.epistemic?.label;
    
    if (v === VerificationStatus.VERIFIED) counts.verified++;
    else if (v === VerificationStatus.CONTRADICTED) counts.contradicted++;
    else if (v === VerificationStatus.UNVERIFIABLE) counts.unverifiable++;
    else if (v === VerificationStatus.PENDING) counts.pending++;
    else if (v === VerificationStatus.ERROR) counts.errors++;
    
    if (e === JanusLabel.KNOWN) counts.known++;
    else if (e === JanusLabel.INFERRED) counts.inferred++;
    else if (e === JanusLabel.UNCERTAIN) counts.uncertain++;
    else if (e === JanusLabel.UNKNOWN) counts.unknown++;
  }
  
  return {
    total: results.length,
    ...counts,
    breakdown: {
      byVerification: {
        verified: counts.verified,
        contradicted: counts.contradicted,
        unverifiable: counts.unverifiable,
        pending: counts.pending,
        errors: counts.errors
      },
      byEpistemic: {
        known: counts.known,
        inferred: counts.inferred,
        uncertain: counts.uncertain,
        unknown: counts.unknown
      }
    }
  };
}

/**
 * Save verification to history
 * @param {Object} result - Verification result
 */
function saveToVerificationHistory(result) {
  let history = [];
  
  if (fs.existsSync(VERIFICATIONS_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(VERIFICATIONS_FILE, 'utf-8'));
    } catch (e) {
      history = [];
    }
  }
  
  history.unshift({
    ...result,
    savedAt: Date.now()
  });
  
  // Keep only last 1000 verifications
  history = history.slice(0, 1000);
  
  fs.writeFileSync(VERIFICATIONS_FILE, JSON.stringify(history, null, 2));
}

/**
 * Get verification history
 * @param {number} limit - Number of results to return
 * @returns {Object[]} Verification history
 */
export function getHistory(limit = 50) {
  if (!fs.existsSync(VERIFICATIONS_FILE)) {
    return [];
  }
  
  const history = JSON.parse(fs.readFileSync(VERIFICATIONS_FILE, 'utf-8'));
  return history.slice(0, limit);
}

/**
 * Clear verification cache
 * @returns {Object} Result
 */
export function clearCache() {
  ensureDirectories();
  
  if (!fs.existsSync(CACHE_DIR)) {
    return { cleared: 0 };
  }
  
  const files = fs.readdirSync(CACHE_DIR);
  let cleared = 0;
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
      cleared++;
    }
  }
  
  return { cleared };
}

/**
 * Verify multiple atoms with fallback strategies
 * @param {string[]} atoms - Array of atoms
 * @returns {Object} Verification results with fallbacks
 */
export async function verifyWithFallback(atoms) {
  const results = [];
  const failed = [];
  
  try {
    const result = await verify({ atoms });
    return result;
  } catch (error) {
    // Fallback: process atoms individually with error handling
    for (const atom of atoms) {
      try {
        const singleResult = await verify({ atoms: atom });
        results.push(singleResult.results);
      } catch (atomError) {
        // Return error result for this atom
        results.push({
          atom,
          error: atomError.message,
          verification: { status: VerificationStatus.ERROR },
          epistemic: { label: JanusLabel.UNKNOWN },
          combinedLabel: '[ERROR]',
          verificationLabel: '[ERROR]'
        });
        failed.push(atom);
      }
    }
  }
  
  return {
    results,
    summary: generateSummary(results),
    fallbackApplied: failed.length > 0,
    failedAtoms: failed
  };
}