/**
 * JSON Validator
 * Validates JSON format and structure
 */

import { BaseValidator, ValidationResult } from './base-validator.js';

export class JsonValidator extends BaseValidator {
  validate(data: unknown, context?: unknown): ValidationResult {
    if (typeof data !== 'string') {
      return this.createResult(
        false,
        'Data is not a string - cannot validate as JSON',
        { type: typeof data }
      );
    }

    const trimmed = data.trim();
    
    // Not JSON if doesn't start with { or [
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return this.createResult(
        true,
        'Data does not appear to be JSON (not an object or array)',
        { isJsonLikely: false }
      );
    }

    try {
      const parsed = JSON.parse(trimmed);
      
      // Check for empty objects/arrays
      if (Array.isArray(parsed) && parsed.length === 0) {
        return this.createResult(
          true,
          'Valid JSON - empty array',
          { type: 'array', length: 0 }
        );
      }

      if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) {
        return this.createResult(
          true,
          'Valid JSON - empty object',
          { type: 'object', keys: 0 }
        );
      }

      // Check for suspiciously large JSON
      const size = new Blob([trimmed]).size;
      if (size > 5000000) { // 5MB
        return this.createResult(
          true,
          `Valid JSON but very large (${(size / 1024 / 1024).toFixed(2)}MB)`,
          { type: Array.isArray(parsed) ? 'array' : 'object', size }
        );
      }

      return this.createResult(
        true,
        'Valid JSON',
        { 
          type: Array.isArray(parsed) ? 'array' : 'object',
          length: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
          size
        }
      );

    } catch (error) {
      return this.createResult(
        false,
        `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error: String(error) }
      );
    }
  }
}