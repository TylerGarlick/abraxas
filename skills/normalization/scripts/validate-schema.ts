/**
 * validate-schema.ts
 * Validates a forecast JSON file against the UnifiedForecast schema.
 *
 * Usage:
 *   npx ts-node scripts/validate-schema.ts <path-to-forecast.json>
 *
 * Exit codes:
 *   0 - valid, no drift
 *   1 - drift detected, errors printed to stderr
 */

import * as fs from 'fs';

// ============================================================
// Types (mirrors avalanche/src/lib/types.ts)
// ============================================================

interface AvalancheProblem {
  type: string;
  likelihood: string;
  size: string;
  aspect?: string[];
  elevation?: string[];
  discussion: string;
}

interface UnifiedForecast {
  zone: string;
  zoneId: string;
  center: 'CAIC' | 'UAC';
  dangerRating: 1 | 2 | 3 | 4 | 5;
  dangerByAspect: Record<string, number>;
  dangerByElevation: Record<string, number>;
  avalancheProblems: AvalancheProblem[];
  forecastDiscussion: string;
  publishedAt: string;
  validDay: string;
}

// ============================================================
// Validation
// ============================================================

interface ValidationError {
  field: string;
  expected: string;
  received: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  timestamp: string;
}

function validateForecast(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const timestamp = new Date().toISOString();

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', expected: 'object', received: typeof data }],
      timestamp,
    };
  }

  const record = data as Record<string, unknown>;

  // Required string fields
  const stringFields = ['zone', 'zoneId', 'center', 'forecastDiscussion', 'publishedAt', 'validDay'];
  for (const field of stringFields) {
    if (record[field] === undefined || record[field] === null) {
      errors.push({ field, expected: 'string', received: 'undefined/null' });
    } else if (typeof record[field] !== 'string') {
      errors.push({ field, expected: 'string', received: typeof record[field] });
    }
  }

  // center must be CAIC or UAC
  if (record.center && !['CAIC', 'UAC'].includes(record.center as string)) {
    errors.push({ field: 'center', expected: 'CAIC or UAC', received: record.center as string });
  }

  // dangerRating must be 1-5
  if (record.dangerRating === undefined || record.dangerRating === null) {
    errors.push({ field: 'dangerRating', expected: '1|2|3|4|5', received: 'undefined/null' });
  } else if (![1, 2, 3, 4, 5].includes(Number(record.dangerRating))) {
    errors.push({ field: 'dangerRating', expected: '1|2|3|4|5', received: String(record.dangerRating) });
  }

  // dangerByAspect must be object
  if (record.dangerByAspect !== undefined && typeof record.dangerByAspect !== 'object') {
    errors.push({ field: 'dangerByAspect', expected: 'object', received: typeof record.dangerByAspect });
  }

  // dangerByElevation must be object
  if (record.dangerByElevation !== undefined && typeof record.dangerByElevation !== 'object') {
    errors.push({ field: 'dangerByElevation', expected: 'object', received: typeof record.dangerByElevation });
  }

  // avalancheProblems must be array
  if (!Array.isArray(record.avalancheProblems)) {
    errors.push({ field: 'avalancheProblems', expected: 'array', received: typeof record.avalancheProblems });
  } else {
    for (let i = 0; i < record.avalancheProblems.length; i++) {
      const problem = record.avalancheProblems[i] as Record<string, unknown>;
      const required = ['type', 'likelihood', 'size', 'discussion'];
      for (const field of required) {
        if (problem[field] === undefined || problem[field] === null) {
          errors.push({ field: `avalancheProblems[${i}].${field}`, expected: 'string', received: 'undefined/null' });
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, timestamp };
}

function printErrors(errors: ValidationError[], source: string): void {
  for (const err of errors) {
    const msg = `[${source}] Field "${err.field}" expected ${err.expected}, got: ${err.received}`;
    console.error(msg);
  }
}

// ============================================================
// CLI
// ============================================================

async function main(): Promise<void> {
  const [, , filePath] = process.argv;

  if (!filePath) {
    console.error('Usage: validate-schema.ts <path-to-forecast.json>');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  let valid = true;
  let totalErrors: ValidationError[] = [];

  // Handle both single forecast and array of forecasts
  const items = Array.isArray(data) ? data : [data];

  for (let i = 0; i < items.length; i++) {
    const result = validateForecast(items[i]);
    if (!result.valid) {
      valid = false;
      totalErrors = totalErrors.concat(
        result.errors.map((e) => ({ ...e, field: `${e.field} [index ${i}]` }))
      );
    }
  }

  if (valid) {
    console.log(`✓ Valid: ${items.length} forecast(s) passed schema validation.`);
    process.exit(0);
  } else {
    console.error(`✗ Drift detected: ${totalErrors.length} error(s) in ${items.length} forecast(s).`);
    printErrors(totalErrors, 'schema');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
