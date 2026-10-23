#!/usr/bin/env node

/**
 * Ethos — Source Credibility Scoring Engine
 * 
 * Scores sources on a 1-5 tier system for credibility assessment.
 * Integrates with Logos for weighted verification.
 */

const fs = require('fs');
const path = require('path');

// Load source database
const SOURCES_PATH = path.join(__dirname, 'sources.json');

function loadSources() {
  try {
    const data = fs.readFileSync(SOURCES_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading sources.json:', err.message);
    return null;
  }
}

/**
 * Score a source (returns 1-5, where 1 is highest credibility)
 * @param {string} sourceName - Name of the source (e.g., "Nature", "Reuters")
 * @returns {number} - Tier score (1-5), or 5 if unknown
 */
function scoreSource(sourceName) {
  const sources = loadSources();
  if (!sources) return 5; // Default to lowest if DB unavailable

  const normalized = sourceName.toLowerCase().trim();

  // Check aliases first (but prevent infinite recursion)
  if (sources.aliases[normalized] && sources.aliases[normalized].toLowerCase() !== normalized) {
    const resolved = sources.aliases[normalized];
    return scoreSource(resolved); // Recursive lookup
  }

  // Search all tiers
  for (const [tierNum, tierData] of Object.entries(sources.tiers)) {
    const match = tierData.sources.find(s => 
      s.name.toLowerCase() === normalized || 
      s.domain.toLowerCase() === normalized ||
      s.name.toLowerCase().includes(normalized)
    );

    if (match) {
      return parseInt(tierNum, 10);
    }
  }

  // Unknown source = Tier 5 (lowest credibility)
  return 5;
}

/**
 * Get tier information
 * @param {number} tierNum - Tier number (1-5)
 * @returns {object} - Tier metadata (name, description, weight)
 */
function getTierInfo(tierNum) {
  const sources = loadSources();
  if (!sources || !sources.tiers[tierNum]) {
    return { name: 'Unknown', description: 'Unknown tier', weight: 0.2 };
  }

  const tier = sources.tiers[tierNum];
  return {
    name: tier.name,
    description: tier.description,
    weight: tier.weight
  };
}

/**
 * Get detailed source information
 * @param {string} sourceName - Name of the source
 * @returns {object|null} - Source metadata or null if not found
 */
function getSourceInfo(sourceName) {
  const sources = loadSources();
  if (!sources) return null;

  const normalized = sourceName.toLowerCase().trim();

  // Check aliases
  if (sources.aliases[normalized]) {
    return getSourceInfo(sources.aliases[normalized]);
  }

  // Search all tiers
  for (const [tierNum, tierData] of Object.entries(sources.tiers)) {
    const match = tierData.sources.find(s => 
      s.name.toLowerCase() === normalized || 
      s.domain.toLowerCase() === normalized
    );

    if (match) {
      return {
        name: match.name,
        domain: match.domain,
        field: match.field,
        tier: parseInt(tierNum, 10),
        tierName: tierData.name,
        weight: tierData.weight,
        note: match.note || null
      };
    }
  }

  return null; // Not found
}

/**
 * Calculate weighted confidence from multiple sources
 * @param {array} sources - Array of { source: string, year?: number }
 * @returns {object} - Weighted analysis result
 */
function calculateWeightedConfidence(sources) {
  if (!sources || sources.length === 0) {
    return {
      weightedScore: 0,
      confidence: 'UNKNOWN',
      tierBreakdown: {},
      recommendation: 'No sources provided'
    };
  }

  const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalWeight = 0;
  let maxWeight = 0;

  sources.forEach(s => {
    const tier = scoreSource(s.source);
    tierCounts[tier]++;
    
    const tierInfo = getTierInfo(tier);
    totalWeight += tierInfo.weight;
    maxWeight = Math.max(maxWeight, tierInfo.weight);
  });

  // Calculate normalized score (0-1)
  const avgWeight = totalWeight / sources.length;
  const normalizedScore = avgWeight; // Already 0-1 scale

  // Determine confidence level
  let confidence = 'UNKNOWN';
  let recommendation = '';

  if (avgWeight >= 0.9) {
    confidence = 'VERY HIGH';
    recommendation = 'Strong evidence from peer-reviewed sources';
  } else if (avgWeight >= 0.7) {
    confidence = 'HIGH';
    recommendation = 'Good evidence from credible sources';
  } else if (avgWeight >= 0.5) {
    confidence = 'MODERATE';
    recommendation = 'Mixed sources, verify with higher-tier sources';
  } else if (avgWeight >= 0.3) {
    confidence = 'LOW';
    recommendation = 'Weak sourcing, seek peer-reviewed verification';
  } else {
    confidence = 'VERY LOW';
    recommendation = 'Unverified sources, do not rely on this claim';
  }

  // Check for tier conflicts
  const hasConflict = (tierCounts[1] > 0 && tierCounts[5] > 0) ||
                      (tierCounts[2] > 0 && tierCounts[5] > 0);

  return {
    weightedScore: Math.round(avgWeight * 100) / 100,
    confidence,
    tierBreakdown: tierCounts,
    recommendation,
    hasConflict,
    sourceCount: sources.length
  };
}

/**
 * Add a new source to the database (runtime only, doesn't persist)
 * @param {string} name - Source name
 * @param {number} tier - Tier (1-5)
 * @param {string} domain - Domain name
 * @param {string} field - Field/category
 */
function addSource(name, tier, domain = '', field = 'General') {
  const sources = loadSources();
  if (!sources) return false;

  if (tier < 1 || tier > 5) {
    console.error('Invalid tier. Must be 1-5.');
    return false;
  }

  // Check if already exists
  const exists = sources.tiers[tier].sources.some(s => 
    s.name.toLowerCase() === name.toLowerCase() ||
    s.domain.toLowerCase() === domain.toLowerCase()
  );

  if (exists) {
    console.log(`Source "${name}" already exists in Tier ${tier}`);
    return false;
  }

  sources.tiers[tier].sources.push({ name, domain, field });
  console.log(`Added "${name}" to Tier ${tier} (${sources.tiers[tier].name})`);
  return true;
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Ethos Source Credibility Scoring

Usage:
  node ethos-score.js score <source>     — Get tier score for a source
  node ethos-score.js info <source>      — Get detailed source info
  node ethos-score.js tier <number>      — Get tier information
  node ethos-score.js check <s1,s2,...>  — Check multiple sources

Examples:
  node ethos-score.js score Nature
  node ethos-score.js info Reuters
  node ethos-score.js tier 1
  node ethos-score.js check "Nature,Reuters,Twitter"
`);
    process.exit(0);
  }

  const command = args[0];
  const param = args[1];

  switch (command) {
    case 'score':
      const score = scoreSource(param);
      const tierInfo = getTierInfo(score);
      console.log(`Source: ${param}`);
      console.log(`Tier: ${score} (${tierInfo.name})`);
      console.log(`Weight: ${tierInfo.weight}`);
      break;

    case 'info':
      const info = getSourceInfo(param);
      if (info) {
        console.log(JSON.stringify(info, null, 2));
      } else {
        console.log(`Source "${param}" not found in database`);
      }
      break;

    case 'tier':
      const tierData = getTierInfo(parseInt(param, 10));
      console.log(`Tier ${param}: ${tierData.name}`);
      console.log(`Description: ${tierData.description}`);
      console.log(`Weight: ${tierData.weight}`);
      break;

    case 'check':
      const sourceList = param.split(',').map(s => ({ source: s.trim() }));
      const result = calculateWeightedConfidence(sourceList);
      console.log(JSON.stringify(result, null, 2));
      break;

    default:
      console.log(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = {
  scoreSource,
  getTierInfo,
  getSourceInfo,
  calculateWeightedConfidence,
  addSource,
  loadSources
};
