/**
 * Code Validator
 * Validates code syntax and structure
 */

import { BaseValidator, ValidationResult } from './base-validator.js';

export interface CodeValidationContext {
  language?: 'javascript' | 'typescript' | 'python' | 'json' | 'bash' | 'html' | 'css';
  checkSyntax?: boolean;
  maxLines?: number;
}

export class CodeValidator extends BaseValidator {
  validate(data: unknown, context?: CodeValidationContext): ValidationResult {
    const ctx = context || {};
    const { language, checkSyntax = false, maxLines = 10000 } = ctx;

    if (typeof data !== 'string') {
      return this.createResult(
        false,
        'Data is not a string - cannot validate as code',
        { type: typeof data }
      );
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check line count
    const lines = data.split('\n');
    if (lines.length > maxLines) {
      warnings.push(`Code exceeds ${maxLines} lines (${lines.length} lines)`);
    }

    // Check for empty code
    if (data.trim().length === 0) {
      return this.createResult(
        false,
        'Code is empty',
        { lines: 0 }
      );
    }

    // Language-specific validation
    if (language) {
      switch (language) {
        case 'javascript':
        case 'typescript':
          this.validateJavaScript(data, errors, warnings);
          break;
        case 'python':
          this.validatePython(data, errors, warnings);
          break;
        case 'json':
          this.validateJson(data, errors, warnings);
          break;
        case 'bash':
          this.validateBash(data, errors, warnings);
          break;
        default:
          // Generic checks for unknown language
          if (data.includes('undefined') && !data.includes('typeof')) {
            warnings.push('Code contains "undefined" - may cause runtime errors');
          }
          if (data.includes('TODO') || data.includes('FIXME')) {
            warnings.push('Code contains TODO/FIXME comments');
          }
      }
    } else {
      // Auto-detect language
      const detectedLanguage = this.detectLanguage(data);
      if (detectedLanguage) {
        return this.validate(data, { ...ctx, language: detectedLanguage });
      }
    }

    // Common checks
    if (data.includes('eval(')) {
      warnings.push('Use of eval() is discouraged for security reasons');
    }
    if (data.includes('innerHTML') && !data.includes('textContent')) {
      warnings.push('Use of innerHTML without textContent may pose XSS risk');
    }

    if (errors.length > 0) {
      return this.createResult(false, errors.join('; '), { errors, warnings });
    }

    return this.createResult(
      true,
      warnings.length > 0 ? `Valid with warnings: ${warnings.join('; ')}` : 'Valid code',
      { language: language || this.detectLanguage(data), lines: lines.length, warnings }
    );
  }

  private detectLanguage(code: string): CodeValidationContext['language'] | null {
    const trimmed = code.trim();
    
    // TypeScript/JS indicators
    if (trimmed.includes(': string') || trimmed.includes(': number') || trimmed.includes('interface ')) {
      return 'typescript';
    }
    if (trimmed.includes('function ') || trimmed.includes('const ') || trimmed.includes('let ')) {
      return 'javascript';
    }
    
    // Python indicators
    if (trimmed.includes('def ') || trimmed.includes('import ') || trimmed.includes('print(')) {
      return 'python';
    }
    
    // JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }
    
    // Bash
    if (trimmed.startsWith('#!/bin/bash') || trimmed.startsWith('#!/bin/sh')) {
      return 'bash';
    }

    return null;
  }

  private validateJavaScript(code: string, errors: string[], warnings: string[]): void {
    // Check for common syntax issues
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for assignment in condition (likely typo)
      if (line.match(/if\s*\(\s*\w+\s*=\s*.+\)/)) {
        errors.push(`Line ${lineNum}: Assignment in condition (did you mean ==?)`);
      }
      
      // Check for missing semicolons (basic check)
      const trimmed = line.trim();
      if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') && !trimmed.endsWith(',') && !trimmed.endsWith('\\') &&
          !trimmed.startsWith('if') && !trimmed.startsWith('else') && 
          !trimmed.startsWith('for') && !trimmed.startsWith('while') &&
          !trimmed.startsWith('function') && !trimmed.startsWith('//') &&
          !trimmed.startsWith('/*') && !trimmed.startsWith('*') &&
          !trimmed.startsWith('*') && !trimmed.startsWith('import') &&
          !trimmed.startsWith('export') && !trimmed.startsWith('return')) {
        // This is a heuristic - could have false positives
      }
    }

    // Check for console.log in production-like code
    if (code.includes('console.log') && !code.includes('debug')) {
      warnings.push('console.log found - consider using proper logging');
    }
  }

  private validatePython(code: string, errors: string[], warnings: string[]): void {
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for tabs vs spaces (Python is sensitive)
      if (line.startsWith('\t')) {
        warnings.push(`Line ${lineNum}: Tab detected - use spaces for Python`);
      }
    }

    // Check for common Python issues
    if (code.includes('except:') && !code.includes('except Exception')) {
      warnings.push('Bare except clause found - specify exception type');
    }
    if (code.includes('== True') || code.includes('== False')) {
      warnings.push('Use "is" instead of "==" for boolean comparison');
    }
  }

  private validateJson(code: string, errors: string[], warnings: string[]): void {
    try {
      JSON.parse(code);
    } catch (error) {
      errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateBash(code: string, errors: string[], warnings: string[]): void {
    if (code.includes('rm -rf /')) {
      errors.push('Dangerous command: rm -rf /');
    }
    if (code.includes('> /dev/null') && !code.includes('2>')) {
      warnings.push('Redirecting stdout but not stderr - errors may be hidden');
    }
  }
}