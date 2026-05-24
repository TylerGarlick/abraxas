#!/usr/bin/env npx ts-node

/**
 * validate-story.ts
 * 
 * Validates a story file against the decomposition skill schema.
 * Run: npx ts-node scripts/validate-story.ts <story-file>
 */

import * as fs from 'fs';
import * as path from 'path';

const REQUIRED_FIELDS = ['type', 'effort', 'priority', 'acceptance criteria', 'verification'];
const VALID_TYPES = ['feature', 'bugfix', 'chore', 'spike'];
const VALID_EFFORTS = ['XS', 'S', 'M', 'L', 'XL'];
const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const BDD_PATTERN = /^Given\s+.+\s+When\s+.+\s+Then\s+.+$/i;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function extractField(content: string, fieldName: string): string | null {
  const patterns = [
    new RegExp(`-\\s*\\*\\*${fieldName}:\\*\\*\\s*(.+)`, 'i'),
    new RegExp(`-${fieldName}:\\s*(.+)`, 'i'),
    new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+)`, 'i'),
    new RegExp(`${fieldName}:\\s*(.+)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function extractAcceptanceCriteria(content: string): string[] {
  const acSection = content.match(/Acceptance Criteria:?\n([\s\S]*?)(?=\n-|\n\*\*|\nVerification|$)/i);
  if (!acSection) return [];

  const lines = acSection[1].split('\n');
  const criteria: string[] = [];

  for (const line of lines) {
    const match = line.match(/AC\d*:\s*(.+)/i) || line.match(/^\d+\.\s*AC\d*:?\s*(.+)/i);
    if (match) {
      criteria.push(match[1].trim());
    }
  }

  return criteria;
}

function validateField(fieldName: string, value: string | null, validValues?: string[]): string | null {
  if (!value) {
    return `Missing required field: ${fieldName}`;
  }

  if (validValues && !validValues.includes(value)) {
    return `Invalid ${fieldName}: "${value}". Must be one of: ${validValues.join(', ')}`;
  }

  return null;
}

function validateBDDFormat(ac: string): string | null {
  if (!BDD_PATTERN.test(ac)) {
    return `AC does not follow Given/When/Then format: "${ac.substring(0, 50)}..."`;
  }
  return null;
}

function validateStory(filePath: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };

  if (!fs.existsSync(filePath)) {
    result.valid = false;
    result.errors.push(`File not found: ${filePath}`);
    return result;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Check for title
  const titleMatch = content.match(/^##\s+Story:\s*(.+)$/m);
  if (!titleMatch) {
    result.warnings.push('No story title found (expected: ## Story: [title])');
  }

  // Validate each required field
  for (const field of REQUIRED_FIELDS) {
    const value = extractField(content, field);
    let validValues: string[] | undefined;

    if (field === 'type') validValues = VALID_TYPES;
    if (field === 'effort') validValues = VALID_EFFORTS;
    if (field === 'priority') validValues = VALID_PRIORITIES;

    const error = validateField(field, value, validValues);
    if (error) {
      result.valid = false;
      result.errors.push(error);
    }
  }

  // Validate acceptance criteria format
  const acs = extractAcceptanceCriteria(content);
  if (acs.length === 0) {
    result.valid = false;
    result.errors.push('No acceptance criteria found. Each story must have at least one AC.');
  } else {
    for (const ac of acs) {
      const bddError = validateBDDFormat(ac);
      if (bddError) {
        result.valid = false;
        result.errors.push(bddError);
      }
    }
  }

  return result;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx ts-node scripts/validate-story.ts <story-file>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  const result = validateStory(filePath);

  console.log(`\n📋 Validating: ${path.basename(filePath)}\n`);

  if (result.valid) {
    console.log('✅ Story is valid!\n');
  } else {
    console.log('❌ Validation failed:\n');
    for (const error of result.errors) {
      console.log(`   • ${error}`);
    }
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const warning of result.warnings) {
      console.log(`   • ${warning}`);
    }
    console.log('');
  }

  process.exit(result.valid ? 0 : 1);
}

main();
