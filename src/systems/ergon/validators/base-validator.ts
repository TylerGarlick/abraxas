/**
 * Base validator interface
 */
export interface Validator {
  validate(data: unknown, context?: unknown): ValidationResult;
}

export interface ValidationResult {
  validator: string;
  passed: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

export abstract class BaseValidator implements Validator {
  abstract validate(data: unknown, context?: unknown): ValidationResult;

  protected createResult(
    passed: boolean,
    message?: string,
    details?: Record<string, unknown>
  ): ValidationResult {
    return {
      validator: this.constructor.name,
      passed,
      message,
      details
    };
  }
}