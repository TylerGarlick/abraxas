/**
 * Ergon - Tool Use Verification System
 * 
 * Main wrapper class that intercepts tool calls and provides verification
 */

import { 
  VerificationReport, 
  ToolResult, 
  InvocationContext,
  ErgonConfig,
  DEFAULT_ERGON_CONFIG,
  ErrorType,
  VerificationStatus
} from './types.js';
import { createAnomalyDetector, AnomalyDetector } from './anomaly-detector.js';
import { createValidatorEngine, ValidatorEngine } from './validator-engine.js';

export interface Tool<T = unknown> {
  name: string;
  invoke(input: unknown): Promise<ToolResult<T>>;
}

interface ToolRegistry {
  [toolName: string]: Tool;
}

interface VerificationLog {
  [invocationId: string]: VerificationReport;
}

export class ErgonWrapper {
  private toolRegistry: ToolRegistry = {};
  private verificationLog: VerificationLog = {};
  private config: ErgonConfig;
  private anomalyDetector: AnomalyDetector;
  private validatorEngine: ValidatorEngine;
  private invocationCount = 0;

  constructor(config: Partial<ErgonConfig> = {}) {
    this.config = { ...DEFAULT_ERGON_CONFIG, ...config };
    this.anomalyDetector = createAnomalyDetector();
    this.validatorEngine = createValidatorEngine();
  }

  /**
   * Register a tool with the Ergon wrapper
   */
  registerTool<T>(tool: Tool<T>): void {
    this.toolRegistry[tool.name] = tool as Tool;
  }

  /**
   * Unregister a tool
   */
  unregisterTool(toolName: string): boolean {
    return delete this.toolRegistry[toolName];
  }

  /**
   * Invoke a tool with full verification
   */
  async invoke<T>(
    toolName: string, 
    input: unknown,
    options: { expectedOutputType?: string; sessionId?: string } = {}
  ): Promise<{ result: ToolResult<T>; report: VerificationReport }> {
    const startTime = Date.now();
    const invocationId = `ergon_${++this.invocationCount}_${Date.now()}`;
    
    const context: InvocationContext = {
      toolName,
      input,
      expectedOutputType: options.expectedOutputType,
      timestamp: startTime,
      sessionId: options.sessionId
    };

    const tool = this.toolRegistry[toolName];
    if (!tool) {
      return this.createErrorResult(
        invocationId, 
        toolName, 
        startTime, 
        'EXPLICIT_ERROR',
        `Tool not found: ${toolName}`
      );
    }

    try {
      // Attempt to invoke the tool
      const result = await this.invokeWithTimeout(tool, input);
      const executionTimeMs = Date.now() - startTime;

      // Run verification
      const report = await this.verify(
        invocationId,
        toolName,
        context,
        result,
        executionTimeMs
      );

      this.verificationLog[invocationId] = report;

      return { result: result as ToolResult<T>, report };
    } catch (error) {
      return this.createErrorResult(
        invocationId,
        toolName,
        startTime,
        'EXPLICIT_ERROR',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Invoke tool with timeout
   */
  private async invokeWithTimeout<T>(
    tool: Tool, 
    input: unknown
  ): Promise<ToolResult<T>> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({
          success: false,
          error: 'Timeout exceeded'
        });
      }, this.config.timeoutMs);

      tool.invoke(input)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result as ToolResult<T>);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        });
    });
  }

  /**
   * Verify tool invocation result
   */
  private async verify<T>(
    invocationId: string,
    toolName: string,
    context: InvocationContext,
    result: ToolResult<T>,
    executionTimeMs: number
  ): Promise<VerificationReport> {
    const validationResults = [];
    const anomalies: VerificationReport['anomalies'] = [];
    const recommendations: string[] = [];

    // Determine base status
    let status: VerificationStatus = 'SUCCESS';
    let errorType: ErrorType | undefined;

    // 1. Check for explicit errors
    if (!result.success) {
      status = 'FAILED';
      errorType = 'EXPLICIT_ERROR';
      recommendations.push('Examine error message and tool documentation');
    }

    // 2. Run validators if enabled
    if (this.config.enableValidation) {
      const validation = await this.validatorEngine.validate(
        result,
        context
      );
      validationResults.push(...validation.results);

      if (!validation.valid) {
        status = status === 'SUCCESS' ? 'ANOMALOUS' : status;
        if (!errorType) errorType = 'FORMAT_ERROR';
        recommendations.push(...validation.recommendations);
      }
    }

    // 3. Run anomaly detection if enabled
    if (this.config.enableAnomalyDetection && result.success) {
      const anomalyResult = this.anomalyDetector.detect(
        result,
        context
      );
      if (anomalyResult.anomalies.length > 0) {
        anomalies.push(...anomalyResult.anomalies);
        status = 'ANOMALOUS';
        if (!errorType) errorType = 'ANOMALY';
        recommendations.push(...anomalyResult.recommendations);
      }
    }

    // 4. Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      status,
      validationResults,
      anomalies
    );

    return {
      invocationId,
      toolName,
      timestamp: Date.now(),
      status,
      errorType,
      inputValid: true, // Input validation could be added
      outputValid: result.success,
      validationResults,
      anomalies,
      confidenceScore,
      recommendations,
      executionTimeMs
    };
  }

  /**
   * Calculate confidence score based on verification results
   */
  private calculateConfidenceScore(
    status: VerificationStatus,
    validationResults: VerificationReport['validationResults'],
    anomalies: VerificationReport['anomalies']
  ): number {
    let score = 1.0;

    // Deduct for failures
    if (status === 'FAILED') score -= 0.8;
    else if (status === 'ANOMALOUS') score -= 0.4;

    // Deduct for failed validations
    const failedValidations = validationResults.filter(v => !v.passed && v.severity === 'error');
    score -= failedValidations.length * 0.15;

    // Deduct for warnings
    const warnings = validationResults.filter(v => !v.passed && v.severity === 'warning');
    score -= warnings.length * 0.05;

    // Deduct for anomalies
    score -= anomalies.length * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Create error result
   */
  private createErrorResult<T>(
    invocationId: string,
    toolName: string,
    startTime: number,
    errorType: ErrorType,
    errorMessage: string
  ): { result: ToolResult<T>; report: VerificationReport } {
    const executionTimeMs = Date.now() - startTime;
    
    const report: VerificationReport = {
      invocationId,
      toolName,
      timestamp: startTime,
      status: 'FAILED',
      errorType,
      inputValid: true,
      outputValid: false,
      validationResults: [{
        validator: 'system',
        passed: false,
        message: errorMessage,
        severity: 'error'
      }],
      anomalies: [],
      confidenceScore: 0.1,
      recommendations: ['Check tool implementation and input parameters'],
      executionTimeMs
    };

    this.verificationLog[invocationId] = report;

    return {
      result: { success: false, error: errorMessage },
      report
    };
  }

  /**
   * Get verification report for a specific invocation
   */
  getReport(invocationId: string): VerificationReport | undefined {
    return this.verificationLog[invocationId];
  }

  /**
   * Get all verification reports
   */
  getAllReports(): VerificationReport[] {
    return Object.values(this.verificationLog);
  }

  /**
   * Get recent verification reports
   */
  getRecentReports(count: number = 10): VerificationReport[] {
    return Object.values(this.verificationLog)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  /**
   * Get verification statistics
   */
  getStats(): {
    total: number;
    success: number;
    failed: number;
    anomalous: number;
    avgConfidence: number;
  } {
    const reports = Object.values(this.verificationLog);
    if (reports.length === 0) {
      return { total: 0, success: 0, failed: 0, anomalous: 0, avgConfidence: 0 };
    }

    const total = reports.length;
    const success = reports.filter(r => r.status === 'SUCCESS').length;
    const failed = reports.filter(r => r.status === 'FAILED').length;
    const anomalous = reports.filter(r => r.status === 'ANOMALOUS').length;
    const avgConfidence = reports.reduce((sum, r) => sum + r.confidenceScore, 0) / total;

    return { total, success, failed, anomalous, avgConfidence };
  }

  /**
   * Clear verification log
   */
  clearLog(): void {
    this.verificationLog = {};
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErgonConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function to create Ergon wrapper
 */
export function createErgonWrapper(config?: Partial<ErgonConfig>): ErgonWrapper {
  return new ErgonWrapper(config);
}