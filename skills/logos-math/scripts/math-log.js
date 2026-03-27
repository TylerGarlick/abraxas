#!/usr/bin/env node
/**
 * logos-math computation log manager
 * Persistent, auditable log for all mathematical reasoning operations.
 * Append-only JSON Lines format for O(1) writes.
 */

const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { Transform } = require('stream');
const readline = require('readline');

const STORAGE_DIR = path.join(__dirname, '..', 'storage', 'log');
const LOG_FILE = path.join(STORAGE_DIR, 'computation-log.jsonl');

const VALID_TYPES = ['verify', 'confidence', 'crosscheck'];
const VALID_CONFIDENCE = ['VERIFIED', 'DERIVED', 'ESTIMATED', 'UNVERIFIED'];
const VALID_VERDICTS = ['VERIFIED', 'FLAGGED', 'INCONCLUSIVE'];

// ─── Storage helpers ─────────────────────────────────────────────────────────

function ensureStorage() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '');
  }
}

function generateId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `lm-${timestamp}-${random}`;
}

function parseLogFile() {
  ensureStorage();
  const content = fs.readFileSync(LOG_FILE, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n')
    .filter(line => line.trim())
    .map(line => {
      try { return JSON.parse(line); }
      catch { return null; }
    })
    .filter(Boolean);
}

function appendEntry(entry) {
  ensureStorage();
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(LOG_FILE, line);
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEntry(entry, partial = false) {
  const errors = [];
  
  if (!partial) {
    if (!entry.type) errors.push('type is required');
    if (!entry.claim) errors.push('claim is required');
  }
  
  if (entry.type && !VALID_TYPES.includes(entry.type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }
  if (entry.confidence && !VALID_CONFIDENCE.includes(entry.confidence)) {
    errors.push(`confidence must be one of: ${VALID_CONFIDENCE.join(', ')}`);
  }
  if (entry.verdict && !VALID_VERDICTS.includes(entry.verdict)) {
    errors.push(`verdict must be one of: ${VALID_VERDICTS.join(', ')}`);
  }
  
  return errors;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

function cmdView(n = 10) {
  const entries = parseLogFile();
  const last = entries.slice(-n);
  
  if (last.length === 0) {
    console.log('Log is empty.\n');
    return;
  }
  
  console.log(`=== Last ${last.length} Log Entries ===\n`);
  last.forEach((entry, i) => {
    console.log(`[${entry.id}]`);
    console.log(`  Timestamp: ${entry.timestamp}`);
    console.log(`  Type:      ${entry.type}`);
    console.log(`  Claim:     ${entry.claim}`);
    console.log(`  Confidence: ${entry.confidence || 'N/A'}`);
    console.log(`  Verdict:   ${entry.verdict || 'N/A'}`);
    if (entry.steps && entry.steps.length > 0) {
      console.log(`  Steps:     ${entry.steps.length} steps`);
    }
    if (entry.references && entry.references.length > 0) {
      console.log(`  References: ${entry.references.join(', ')}`);
    }
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log(`  Metadata:  ${JSON.stringify(entry.metadata)}`);
    }
    console.log();
  });
}

function cmdSearch(query, options = {}) {
  const { type, confidence, limit = 50 } = options;
  const entries = parseLogFile();
  
  const queryLower = query.toLowerCase();
  const results = entries.filter(entry => {
    // Text search in claim
    if (query && !entry.claim.toLowerCase().includes(queryLower)) {
      return false;
    }
    // Filter by type
    if (type && entry.type !== type) return false;
    // Filter by confidence
    if (confidence && entry.confidence !== confidence) return false;
    return true;
  }).slice(-limit);
  
  if (results.length === 0) {
    console.log(`No entries found matching "${query}"`);
    if (type) console.log(`  (filtered by type: ${type})`);
    if (confidence) console.log(`  (filtered by confidence: ${confidence})`);
    console.log();
    return;
  }
  
  console.log(`=== ${results.length} Search Results for "${query}" ===\n`);
  results.forEach(entry => {
    console.log(`[${entry.id}] ${entry.type} | ${entry.confidence || 'N/A'} | ${entry.verdict || 'N/A'}`);
    console.log(`  Claim: ${entry.claim}`);
    console.log();
  });
}

function cmdExport(options = {}) {
  const { format = 'json', since, until } = options;
  let entries = parseLogFile();
  
  // Date filtering
  if (since) {
    const sinceDate = new Date(since);
    entries = entries.filter(e => new Date(e.timestamp) >= sinceDate);
  }
  if (until) {
    const untilDate = new Date(until);
    entries = entries.filter(e => new Date(e.timestamp) <= untilDate);
  }
  
  if (entries.length === 0) {
    console.log('No entries to export.\n');
    return;
  }
  
  if (format === 'json') {
    console.log(JSON.stringify({
      exported_at: new Date().toISOString(),
      total_entries: entries.length,
      entries
    }, null, 2));
  } else if (format === 'md') {
    console.log('# Computation Log Export\n');
    console.log(`**Exported:** ${new Date().toISOString()}`);
    console.log(`**Total Entries:** ${entries.length}\n`);
    console.log('---\n');
    
    entries.forEach(entry => {
      console.log(`## ${entry.id}`);
      console.log(`**Time:** ${entry.timestamp}`);
      console.log(`**Type:** ${entry.type}`);
      console.log(`**Claim:** ${entry.claim}`);
      console.log(`**Confidence:** ${entry.confidence || 'N/A'}`);
      console.log(`**Verdict:** ${entry.verdict || 'N/A'}`);
      
      if (entry.steps && entry.steps.length > 0) {
        console.log('\n**Steps:**');
        entry.steps.forEach((step, i) => {
          console.log(`  ${i + 1}. ${step}`);
        });
      }
      
      if (entry.references && entry.references.length > 0) {
        console.log('\n**References:**');
        entry.references.forEach(ref => console.log(`  - ${ref}`));
      }
      
      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        console.log(`\n**Metadata:** \`${JSON.stringify(entry.metadata)}\``);
      }
      
      console.log('\n---\n');
    });
  }
}

function cmdStats() {
  const entries = parseLogFile();
  
  // Type breakdown
  const byType = {};
  VALID_TYPES.forEach(t => byType[t] = 0);
  entries.forEach(e => {
    byType[e.type] = (byType[e.type] || 0) + 1;
  });
  
  // Confidence breakdown
  const byConfidence = {};
  VALID_CONFIDENCE.forEach(c => byConfidence[c] = 0);
  entries.forEach(e => {
    if (e.confidence) byConfidence[e.confidence]++;
  });
  
  // Verdict breakdown
  const byVerdict = {};
  VALID_VERDICTS.forEach(v => byVerdict[v] = 0);
  entries.forEach(e => {
    if (e.verdict) byVerdict[e.verdict]++;
  });
  
  console.log('=== Computation Log Statistics ===\n');
  console.log(`Total entries: ${entries.length}`);
  console.log(`Log file: ${LOG_FILE}`);
  console.log();
  
  console.log('By Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log();
  
  console.log('By Confidence:');
  Object.entries(byConfidence).forEach(([conf, count]) => {
    console.log(`  ${conf}: ${count}`);
  });
  console.log();
  
  if (entries.length > 0) {
    const first = entries[0].timestamp;
    const last = entries[entries.length - 1].timestamp;
    console.log(`Date range: ${first} to ${last}`);
  }
  
  console.log();
}

function cmdAdd(jsonStr) {
  let entry;
  
  try {
    entry = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Error: Invalid JSON. Provide a valid JSON object.');
    process.exit(1);
  }
  
  // Validate required fields
  const errors = validateEntry(entry, false);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
  
  // Add metadata if not present
  if (!entry.id) entry.id = generateId();
  if (!entry.timestamp) entry.timestamp = new Date().toISOString();
  if (!entry.metadata) entry.metadata = {};
  
  appendEntry(entry);
  console.log(`Entry added: ${entry.id}`);
  console.log(JSON.stringify(entry, null, 2));
}

// ─── Logger API (for integration) ───────────────────────────────────────────

function createLogger() {
  return {
    log(ops) {
      const entry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: ops.type || 'verify',
        claim: ops.claim || '',
        steps: ops.steps || [],
        confidence: ops.confidence || 'UNVERIFIED',
        references: ops.references || [],
        verdict: ops.verdict || 'INCONCLUSIVE',
        metadata: ops.metadata || {}
      };
      appendEntry(entry);
      return entry;
    },
    
    logVerification(claim, steps, result, confidence, metadata = {}) {
      return this.log({
        type: 'verify',
        claim,
        steps,
        confidence,
        verdict: result === 'match' ? 'VERIFIED' : result === 'mismatch' ? 'FLAGGED' : 'INCONCLUSIVE',
        metadata
      });
    },
    
    logConfidence(claim, confidence, reasoning, metadata = {}) {
      return this.log({
        type: 'confidence',
        claim,
        steps: [reasoning],
        confidence,
        verdict: confidence === 'VERIFIED' ? 'VERIFIED' : confidence === 'DERIVED' ? 'VERIFIED' : 'INCONCLUSIVE',
        metadata
      });
    },
    
    logCrosscheck(claim, steps, primaryResult, crosscheckResult, agreement, metadata = {}) {
      return this.log({
        type: 'crosscheck',
        claim,
        steps,
        confidence: agreement ? 'VERIFIED' : 'FLAGGED',
        verdict: agreement ? 'VERIFIED' : 'FLAGGED',
        metadata: { ...metadata, primaryResult, crosscheckResult, agreement }
      });
    }
  };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
logos-math computation log manager

Usage:
  math-log.js <command> [options]

Commands:
  view [n]              Show last n entries (default: 10)
  search <query>        Search by claim text, type, or confidence
  export [--format=fmt] Export full audit trail (json|md)
  stats                 Show summary statistics
  add <json>            Manually add an entry

Search options:
  --type=<type>         Filter by type (verify|confidence|crosscheck)
  --confidence=<level>  Filter by confidence level
  --limit=<n>          Limit results (default: 50)

Export options:
  --format=json         Export as JSON (default)
  --format=md          Export as Markdown
  --since=<date>       Filter entries since date (ISO 8601)
  --until=<date>       Filter entries until date (ISO 8601)

Add example:
  math-log.js add '{"type":"verify","claim":"2+2=4","steps":["2+2=4"],"confidence":"VERIFIED","verdict":"VERIFIED"}'

Logger API (for integration):
  const { createLogger } = require('./math-log.js');
  const logger = createLogger();
  logger.logVerification(claim, steps, 'match', 'VERIFIED');
  logger.logConfidence(claim, 'DERIVED', reasoning);
  logger.logCrosscheck(claim, steps, result1, result2, true);
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'view': {
      const n = parseInt(args[1]) || 10;
      cmdView(n);
      break;
    }
    
    case 'search': {
      const query = args[1] || '';
      const options = {};
      
      args.slice(2).forEach(arg => {
        if (arg.startsWith('--type=')) options.type = arg.split('=')[1];
        if (arg.startsWith('--confidence=')) options.confidence = arg.split('=')[1];
        if (arg.startsWith('--limit=')) options.limit = parseInt(arg.split('=')[1]);
      });
      
      cmdSearch(query, options);
      break;
    }
    
    case 'export': {
      const options = { format: 'json' };
      
      args.slice(1).forEach(arg => {
        if (arg.startsWith('--format=')) options.format = arg.split('=')[1];
        if (arg.startsWith('--since=')) options.since = arg.split('=')[1];
        if (arg.startsWith('--until=')) options.until = arg.split('=')[1];
      });
      
      cmdExport(options);
      break;
    }
    
    case 'stats': {
      cmdStats();
      break;
    }
    
    case 'add': {
      const jsonStr = args.slice(1).join(' ');
      if (!jsonStr) {
        console.error('Error: provide JSON entry to add');
        process.exit(1);
      }
      cmdAdd(jsonStr);
      break;
    }
    
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// Export for integration
module.exports = { createLogger, LOG_FILE, STORAGE_DIR };

// Run CLI if executed directly
if (require.main === module) {
  main();
}
