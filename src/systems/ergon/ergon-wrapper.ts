/**
 * Ergon - Tool Use Verification System
 * Core wrapper class
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ErrorType,
  VerificationStatus,
  VerificationReport,
  VerificationConfig,
  InvocationContext,
  ToolResult,
  ValidationResult,
  Anomaly
} from './types.js';

import { JsonValidator } from './validators/json-validator.js';
import { NumericValidator } from './validators/numeric-validator.js';
import { CodeValidator } from './validators/code-validator.js';

export class ErgonWrapper {
  private toolRegistry: Map<string, Function> = new Map();
  private verificationLog: VerificationReport[] = [];
  private config: VerificationConfig = {
    enabled: true,
    strictMode: false,
    timeout: 30000,
    validators: ['json', 'numeric', 'code'],
    anomalyDetection: true
  };

  private jsonValidator = new JsonValidator();
  private numericValidator = new NumericValidator();
  private codeValidator = new CodeValidator();

  constructor(config?: Partial<VerificationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Register a tool with Ergon
   */
  registerTool(name: string, toolFn: Function): void {
    this.toolRegistry.set(name, toolFn);
  }

  /**
   * Invoke a tool with verification
   */
  async invoke<TInput, TOutput>(
    toolName: string,
    input: TInput,
    context?: Partial<InvocationContext>
  ): Promise<ToolResult<TOutput> & { verification: VerificationReport }> {
    const invocationId = uuidv4();
    const startTime = Date.now();

    const ctx: InvocationContext = {
      toolName,
      input,
      timeout: this.config.timeout,
      ...context
    };

    let toolResult: ToolResult<TOutput>;
    let status: VerificationStatus = 'PENDING';
    let errorType: ErrorType | undefined;
    const validationResults: ValidationResult[] = [];
    const anomalies: Anomaly[] = [];

    try {
      // Execute the tool
      const toolFn = this.toolRegistry.get(toolName);
      if (!toolFn) {
        throw new Error(`Tool not registered: ${toolName}`);
      }

      const result = await this.executeWithTimeout(toolFn, input, ctx.timeout!);
      toolResult = {
        success: true,
        data: result as TOutput,
        timestamp: startTime,
        durationMs: Date.now() - startTime
      };

      // Run validations
      const validations = await this.runValidations(toolResult, ctx);
      validationResults.push(...validations);

      // Check for anomalies if enabled
      if (this.config.anomalyDetection) {
        const detectedAnomalies = await this.detectAnomalies(toolResult, ctx);
        anomalies.push(...detectedAnomalies);
      }

      // Determine overall status
      const failedValidations = validationResults.filter(v => !v.passed);
      if (failedValidations.length > 0) {
        status = this.config.strictMode ? 'FAILED' : 'ANOMALOUS';
        errorType = 'FORMAT_ERROR';
      } else if (anomalies.some(a => a.severity === 'high')) {
        status = 'ANOMALOUS';
        errorType = 'ANOMALY';
      } else if (anomalies.length > 0) {
        status = 'ANOMALOUS';
      } else {
        status = 'SUCCESS';
      }

    } catch (error) {
      toolResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: startTime,
        durationMs: Date.now() - startTime
      };
      status = 'FAILED';
      errorType = 'EXPLICIT_ERROR';
    }

    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(validationResults, anomalies);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      validationResults,
      anomalies,
      status
    );

    // Build verification report
    const report: VerificationReport = {
      invocationId,
      toolName,
      timestamp: startTime,
      status,
      errorType,
      validationResults,
      anomalies,
      confidenceScore,
      recommendations,
      durationMs: Date.now() - startTime
    };

    // Store in log
    this.verificationLog.push(report);

    return {
      ...toolResult,
      verification: report
    };
  }

  /**
   * Execute tool with timeout
   */
  private async executeWithTimeout<T>(
    toolFn: Function,
    input: T,
    timeout: number
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Tool invocation timed out after ${timeout}ms`));
      }, timeout);

      Promise.resolve(toolFn(input))
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /**
   * Run validation checks
   */
  private async runValidations(
    result: ToolResult<unknown>,
    context: InvocationContext
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // JSON validation if output looks like JSON
    if (result.data && typeof result.data === 'string') {
      const jsonResult = this.jsonValidator.validate(result.data);
      results.push(jsonResult);
    }

    // Numeric validation
    if (result.data && typeof result.data === 'number') {
      const numericResult = this.numericValidator.validate(result.data, context);
      results.push(numericResult);
    }

    // Code validation
    if (result.data && typeof result.data === 'string') {
      const codeResult = this.codeValidator.validate(result.data);
      results.push(codeResult);
    }

    return results;
  }

  /**
   * Detect anomalies in tool output
   */
  private async detectAnomalies(
    result: ToolResult<unknown>,
    context: InvocationContext
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Check for empty responses
    if (result.data === null || result.data === undefined) {
      anomalies.push({
        type: 'EMPTY_RESPONSE',
        severity: 'medium',
        description: 'Tool returned null or undefined',
        score: 0.6
      });
    }

    // Check for unusually large responses
    if (result.data && typeof result.data === 'string' && result.data.length > 1000000) {
      anomalies.push({
        type: 'LARGE_RESPONSE',
        severity: 'low',
        description: 'Response exceeds 1MB',
        score: 0.3
      });
    }

    // Check for suspiciously short responses
    if (result.data && typeof result.data === 'string' && result.data.length < 2 && !result.success) {
      anomalies.push({
        type: 'TRUNCATED_RESPONSE',
        severity: 'medium',
        description: 'Response suspiciously short',
        score: 0.5
      });
    }

    return anomalies;
  }

  /**
   * Calculate confidence score based on validations and anomalies
   */
  private calculateConfidence(
    validations: ValidationResult[],
    anomalies: Anomaly[]
  ): number {
    let score = 1.0;

    // Penalize failed validations
    const failedCount = validations.filter(v => !v.passed).length;
    score -= failedCount * 0.2;

    // Penalize anomalies by severity
    for (const anomaly of anomalies) {
      if (anomaly.severity === 'high') score -= 0.3;
      else if (anomaly.severity === 'medium') score -= 0.15;
      else score -= 0.05;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(
    validations: ValidationResult[],
    anomalies: Anomaly[],
    status: VerificationStatus
  ): string[] {
    const recommendations: string[] = [];

    if (status === 'FAILED') {
      recommendations.push('Tool invocation failed - check error details');
    }

    const failedValidations = validations.filter(v => !v.passed);
    for (const validation of failedValidations) {
      recommendations.push(`Validation failed: ${validation.message}`);
    }

    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
    if (highSeverityAnomalies.length > 0) {
      recommendations.push('High-severity anomalies detected - review recommended');
    }

    if (recommendations.length === 0) {
      recommendations.push('Tool verification passed');
    }

    return recommendations;
  }

  /**
   * Get verification report for last invocation
   */
  getLastReport(): VerificationReport | undefined {
    return this.verificationLog[this.verificationLog.length - 1];
  }

  /**
   * Get verification history
   */
  getHistory(limit: number = 10): VerificationReport[] {
    return this.verificationLog.slice(-limit);
  }

  /**
   * Get reports for specific tool
   */
  getReportsByTool(toolName: string, limit?: number): VerificationReport[] {
    const reports = this.verificationLog.filter(r => r.toolName === toolName);
    return limit ? reports.slice(-limit) : reports;
  }

  /**
   * Clear verification log
   */
  clearLog(): void {
    this.verificationLog = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VerificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): VerificationConfig {
    return { ...this.config };
  }
}

export default ErgonWrapper;