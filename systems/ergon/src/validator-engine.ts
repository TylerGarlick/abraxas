/**
 * Ergon - Validator Engine
 * 
 * Validates tool outputs for format, type, and semantic correctness
 */

import { 
  ToolResult, 
  InvocationContext, 
  ValidationResult,
  ValidationResult as VR
} from './types.js';

interface ValidationResultSet {
  valid: boolean;
  results: VR[];
  recommendations: string[];
}

export interface Validator {
  name: string;
  validate(result: ToolResult, context: InvocationContext): ValidationResult[];
}

export class ValidatorEngine {
  private validators: Map<string, Validator> = new Map();

  constructor() {
    // Register default validators
    this.register(new JsonValidator());
    this.register(new NumericBoundsValidator());
    this.register(new EmptyResponseValidator());
    this.register(new FormatConsistencyValidator());
  }

  register(validator: Validator): void {
    this.validators.set(validator.name, validator);
  }

  unregister(name: string): boolean {
    return this.validators.delete(name);
  }

  async validate(
    result: ToolResult, 
    context: InvocationContext
  ): Promise<ValidationResultSet> {
    const allResults: VR[] = [];
    const recommendations: string[] = [];

    for (const [name, validator] of this.validators) {
      try {
        const results = validator.validate(result, context);
        allResults.push(...results);
      } catch (error) {
        allResults.push({
          validator: name,
          passed: false,
          message: `Validator error: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error'
        });
      }
    }

    const valid = !allResults.some(r => !r.passed && r.severity === 'error');

    // Collect recommendations from failed validations
    for (const r of allResults) {
      if (!r.passed && r.severity !== 'info') {
        recommendations.push(`[${r.validator}] ${r.message}`);
      }
    }

    return { valid, results: allResults, recommendations };
  }

  getValidatorNames(): string[] {
    return Array.from(this.validators.keys());
  }
}

// ============================================
// Built-in Validators
// ============================================

class JsonValidator implements Validator {
  name = 'json';

  validate(result: ToolResult, _context: InvocationContext): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Skip if tool returned error
    if (!result.success) {
      return results;
    }

    // Check if expected to be JSON
    const data = result.data;
    if (typeof data === 'string') {
      try {
        JSON.parse(data);
        results.push({
          validator: this.name,
          passed: true,
          message: 'Valid JSON string',
          severity: 'info'
        });
      } catch {
        results.push({
          validator: this.name,
          passed: false,
          message: 'String is not valid JSON but was expected to be',
          severity: 'warning'
        });
      }
    } else if (typeof data === 'object' && data !== null) {
      // Check if object can be serialized to JSON
      try {
        JSON.stringify(data);
        results.push({
          validator: this.name,
          passed: true,
          message: 'Object is JSON-serializable',
          severity: 'info'
        });
      } catch {
        results.push({
          validator: this.name,
          passed: false,
          message: 'Object contains non-serializable properties (circular references, functions, etc.)',
          severity: 'error'
        });
      }
    }

    return results;
  }
}

class NumericBoundsValidator implements Validator {
  name = 'numeric-bounds';

  validate(result: ToolResult, _context: InvocationContext): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!result.success || result.data === undefined) {
      return results;
    }

    // Check for numeric values that might be out of reasonable bounds
    const checkBounds = (value: unknown, path: string = ''): void => {
      if (typeof value === 'number') {
        // Check for common problematic values
        if (!Number.isFinite(value)) {
          results.push({
            validator: this.name,
            passed: false,
            message: `${path}: Non-finite number (${value})`,
            severity: 'error'
          });
        } else if (value > 1e15 || value < -1e15) {
          results.push({
            validator: this.name,
            passed: false,
            message: `${path}: Extremely large magnitude (${value})`,
            severity: 'warning'
          });
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => checkBounds(item, `${path}[${i}]`));
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value as Record<string, unknown>).forEach(
          ([key, val]) => checkBounds(val, path ? `${path}.${key}` : key)
        );
      }
    };

    checkBounds(result.data);

    return results;
  }
}

class EmptyResponseValidator implements Validator {
  name = 'empty-response';

  validate(result: ToolResult, _context: InvocationContext): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!result.success) {
      return results;
    }

    const data = result.data;

    // Check for empty responses
    if (data === null || data === undefined) {
      results.push({
        validator: this.name,
        passed: false,
        message: 'Response is null or undefined',
        severity: 'error',
        details: { data }
      });
    } else if (typeof data === 'string' && data.trim() === '') {
      results.push({
        validator: this.name,
        passed: false,
        message: 'Response is empty string',
        severity: 'warning'
      });
    } else if (Array.isArray(data) && data.length === 0) {
      results.push({
        validator: this.name,
        passed: false,
        message: 'Response is empty array',
        severity: 'warning'
      });
    } else if (typeof data === 'object' && Object.keys(data as object).length === 0) {
      results.push({
        validator: this.name,
        passed: false,
        message: 'Response is empty object',
        severity: 'warning'
      });
    }

    return results;
  }
}

class FormatConsistencyValidator implements Validator {
  name = 'format-consistency';

  // Track recent outputs for each tool to detect drift
  private recentOutputs: Map<string, unknown[]> = new Map();
  private maxHistory = 10;

  validate(result: ToolResult, context: InvocationContext): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!result.success || result.data === undefined) {
      return results;
    }

    const toolName = context.toolName;
    if (!this.recentOutputs.has(toolName)) {
      this.recentOutputs.set(toolName, []);
    }

    const history = this.recentOutputs.get(toolName)!;
    
    // Check type consistency with recent outputs
    if (history.length > 0) {
      const previousType = this.getTypeName(history[0]);
      const currentType = this.getTypeName(result.data);

      if (previousType !== currentType) {
        results.push({
          validator: this.name,
          passed: false,
          message: `Output type changed from ${previousType} to ${currentType}`,
          severity: 'warning',
          details: { previousType, currentType }
        });
      }
    }

    // Add to history
    history.push(result.data);
    if (history.length > this.maxHistory) {
      history.shift();
    }

    return results;
  }

  private getTypeName(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  clearHistory(toolName?: string): void {
    if (toolName) {
      this.recentOutputs.delete(toolName);
    } else {
      this.recentOutputs.clear();
    }
  }
}

/**
 * Factory function to create validator engine
 */
export function createValidatorEngine(): ValidatorEngine {
  return new ValidatorEngine();
}