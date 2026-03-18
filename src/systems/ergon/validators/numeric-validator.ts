/**
 * Numeric Validator
 * Validates numeric values and ranges
 */

import { BaseValidator, ValidationResult } from './base-validator.js';

export interface NumericValidationContext {
  min?: number;
  max?: number;
  allowNaN?: boolean;
  allowInfinity?: boolean;
  expectedRange?: { min: number; max: number };
}

export class NumericValidator extends BaseValidator {
  validate(data: unknown, context?: NumericValidationContext): ValidationResult {
    const ctx = context || {};
    const { min, max, allowNaN = false, allowInfinity = false, expectedRange } = ctx;

    // Check if numeric
    if (typeof data !== 'number') {
      // Could be a string that looks like a number
      if (typeof data === 'string') {
        const parsed = Number(data);
        if (!isNaN(parsed)) {
          return this.validate(parsed, context);
        }
      }
      return this.createResult(
        false,
        'Data is not a number',
        { type: typeof data }
      );
    }

    const errors: string[] = [];

    // Check NaN
    if (isNaN(data) && !allowNaN) {
      errors.push('Value is NaN');
    }

    // Check Infinity
    if (!isFinite(data) && !allowInfinity) {
      errors.push('Value is infinite');
    }

    // Check minimum
    if (min !== undefined && data < min) {
      errors.push(`Value ${data} is below minimum ${min}`);
    }

    // Check maximum
    if (max !== undefined && data > max) {
      errors.push(`Value ${data} is above maximum ${max}`);
    }

    // Check expected range
    if (expectedRange) {
      if (data < expectedRange.min || data > expectedRange.max) {
        errors.push(
          `Value ${data} outside expected range [${expectedRange.min}, ${expectedRange.max}]`
        );
      }
    }

    if (errors.length > 0) {
      return this.createResult(false, errors.join('; '), { value: data, errors });
    }

    // Additional checks for suspicious values
    const warnings: string[] = [];
    
    // Very round numbers might indicate placeholder/fake data
    if (data !== 0 && data !== 1 && data !== 10 && data !== 100) {
      if (Number.isInteger(data) && data > 1000 && data % 1000 === 0) {
        warnings.push('Suspiciously round number');
      }
    }

    return this.createResult(
      true,
      warnings.length > 0 ? `Valid with warnings: ${warnings.join('; ')}` : 'Valid number',
      { value: data, warnings: warnings.length > 0 ? warnings : undefined }
    );
  }
}