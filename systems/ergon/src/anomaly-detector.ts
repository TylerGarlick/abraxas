/**
 * Ergon - Anomaly Detection System
 * 
 * Detects subtle failures and anomalies that don't throw exceptions
 */

import { ToolResult, InvocationContext, Anomaly } from './types.js';

interface AnomalyResult {
  anomalies: Anomaly[];
  recommendations: string[];
}

export interface AnomalyDetector {
  detect(result: ToolResult, context: InvocationContext): AnomalyResult;
  train(historicalData: Array<{ result: ToolResult; context: InvocationContext }>): void;
  reset(): void;
}

export class DefaultAnomalyDetector implements AnomalyDetector {
  // Track historical data for statistical analysis
  private responseTimeHistory: Map<string, number[]> = new Map();
  private outputSizeHistory: Map<string, number[]> = new Map();
  private maxHistorySize = 100;

  // Thresholds (can be tuned)
  private readonly timingThresholdStdDevs = 3;
  private readonly sizeThresholdStdDevs = 3;

  detect(result: ToolResult, context: InvocationContext): AnomalyResult {
    const anomalies: Anomaly[] = [];
    const recommendations: string[] = [];
    const toolName = context.toolName;

    // 1. Detect response time anomalies
    if (context.timestamp && result.metadata?.executionTimeMs) {
      const timingAnomalies = this.detectTimingAnomalies(
        toolName,
        result.metadata.executionTimeMs as number
      );
      anomalies.push(...timingAnomalies.anomalies);
      recommendations.push(...timingAnomalies.recommendations);
    }

    // 2. Detect output size anomalies
    const outputSize = this.estimateOutputSize(result.data);
    if (outputSize > 0) {
      const sizeAnomalies = this.detectSizeAnomalies(toolName, outputSize);
      anomalies.push(...sizeAnomalies.anomalies);
      recommendations.push(...sizeAnomalies.recommendations);

      // Track for future comparisons
      this.trackOutputSize(toolName, outputSize);
    }

    // 3. Detect content anomalies
    const contentAnomalies = this.detectContentAnomalies(result, context);
    anomalies.push(...contentAnomalies.anomalies);
    recommendations.push(...contentAnomalies.recommendations);

    // 4. Detect structural anomalies
    const structuralAnomalies = this.detectStructuralAnomalies(result, context);
    anomalies.push(...structuralAnomalies.anomalies);
    recommendations.push(...structuralAnomalies.recommendations);

    return { anomalies, recommendations };
  }

  /**
   * Detect timing anomalies using statistical analysis
   */
  private detectTimingAnomalies(
    toolName: string, 
    executionTimeMs: number
  ): AnomalyResult {
    const anomalies: Anomaly[] = [];
    const recommendations: string[] = [];

    const history = this.responseTimeHistory.get(toolName) || [];
    
    if (history.length >= 5) {
      const stats = this.calculateStats(history);
      const zScore = (executionTimeMs - stats.mean) / stats.stdDev;

      if (Math.abs(zScore) > this.timingThresholdStdDevs) {
        if (zScore > 0) {
          anomalies.push({
            type: 'SLOW_RESPONSE',
            description: `Response time (${executionTimeMs}ms) is ${zScore.toFixed(1)}σ above average (${stats.mean.toFixed(0)}ms)`,
            score: Math.min(1, Math.abs(zScore) / 5),
            details: { executionTimeMs, mean: stats.mean, stdDev: stats.stdDev, zScore }
          });
          recommendations.push('Consider optimizing the tool or checking for resource contention');
        } else {
          anomalies.push({
            type: 'FAST_RESPONSE',
            description: `Response time (${executionTimeMs}ms) is unusually fast (${Math.abs(zScore).toFixed(1)}σ below average)`,
            score: Math.min(1, Math.abs(zScore) / 5),
            details: { executionTimeMs, mean: stats.mean, stdDev: stats.stdDev, zScore }
          });
          recommendations.push('Verify the tool is returning complete results');
        }
      }
    }

    // Track this timing
    this.responseTimeHistory.get(toolName)?.push(executionTimeMs);

    return { anomalies, recommendations };
  }

  /**
   * Detect output size anomalies
   */
  private detectSizeAnomalies(
    toolName: string, 
    outputSize: number
  ): AnomalyResult {
    const anomalies: Anomaly[] = [];
    const recommendations: string[] = [];

    const history = this.outputSizeHistory.get(toolName) || [];
    
    if (history.length >= 5) {
      const stats = this.calculateStats(history);
      const zScore = (outputSize - stats.mean) / stats.stdDev;

      if (Math.abs(zScore) > this.sizeThresholdStdDevs) {
        if (zScore > 0) {
          anomalies.push({
            type: 'LARGE_OUTPUT',
            description: `Output size (${outputSize}) is ${zScore.toFixed(1)}σ above average (${stats.mean.toFixed(0)})`,
            score: Math.min(1, Math.abs(zScore) / 5),
            details: { outputSize, mean: stats.mean, stdDev: stats.stdDev, zScore }
          });
        } else {
          anomalies.push({
            type: 'SMALL_OUTPUT',
            description: `Output size (${outputSize}) is unusually small (${Math.abs(zScore).toFixed(1)}σ below average)`,
            score: Math.min(1, Math.abs(zScore) / 5),
            details: { outputSize, mean: stats.mean, stdDev: stats.stdDev, zScore }
          });
          recommendations.push('Verify the output is complete');
        }
      }
    }

    return { anomalies, recommendations };
  }

  /**
   * Detect content-level anomalies
   */
  private detectContentAnomalies(
    result: ToolResult,
    context: InvocationContext
  ): AnomalyResult {
    const anomalies: Anomaly[] = [];
    const recommendations: string[] = [];
    const data = result.data;

    if (!result.success || data === undefined || data === null) {
      return { anomalies, recommendations };
    }

    // Check for suspicious patterns in text
    if (typeof data === 'string') {
      // Check for truncated output indicators
      const truncatedPatterns = [
        /\[truncated\]$/i,
        /\.\.\.$/,
        /\[continued\]$/i,
        /\(partial\)$/i
      ];

      for (const pattern of truncatedPatterns) {
        if (pattern.test(data)) {
          anomalies.push({
            type: 'POTENTIALLY_TRUNCATED',
            description: 'Output appears to be truncated',
            score: 0.8,
            details: { matchedPattern: pattern.source }
          });
          recommendations.push('Request complete output or check tool truncation settings');
        }
      }

      // Check for placeholder text
      const placeholderPatterns = [
        /\[TODO\]/i,
        /\[PLACEHOLDER\]/i,
        /TBD/i,
        /^placeholder$/i,
        /lorem ipsum/i
      ];

      for (const pattern of placeholderPatterns) {
        if (pattern.test(data)) {
          anomalies.push({
            type: 'PLACEHOLDER_CONTENT',
            description: 'Output contains placeholder text',
            score: 0.9,
            details: { matchedPattern: pattern.source }
          });
          recommendations.push('Replace placeholder content with actual data');
        }
      }

      // Check for error message patterns that might be hidden
      if (data.toLowerCase().includes('error') && result.success) {
        anomalies.push({
          type: 'HIDDEN_ERROR',
          description: 'Output mentions "error" but was marked as successful',
          score: 0.5,
          details: { sample: data.substring(0, 100) }
        });
      }
    }

    // Check for suspiciously perfect/round numbers in data
    if (typeof data === 'object' && data !== null) {
      const suspiciousNumbers = this.findSuspiciousNumbers(data);
      if (suspiciousNumbers.length > 0) {
        anomalies.push({
          type: 'SUSPICIOUS_NUMBERS',
          description: `Found ${suspiciousNumbers.length} suspiciously round/perfect numbers`,
          score: 0.3,
          details: { examples: suspiciousNumbers.slice(0, 5) }
        });
      }
    }

    return { anomalies, recommendations };
  }

  /**
   * Detect structural anomalies in output
   */
  private detectStructuralAnomalies(
    result: ToolResult,
    context: InvocationContext
  ): AnomalyResult {
    const anomalies: Anomaly[] = [];
    const recommendations: string[] = [];
    const data = result.data;

    if (!result.success || data === undefined) {
      return { anomalies, recommendations };
    }

    // Check for expected output type mismatch
    if (context.expectedOutputType && data) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (context.expectedOutputType !== actualType && 
          !(context.expectedOutputType === 'object' && actualType === 'object')) {
        anomalies.push({
          type: 'TYPE_MISMATCH',
          description: `Expected ${context.expectedOutputType}, got ${actualType}`,
          score: 0.7,
          details: { expected: context.expectedOutputType, actual: actualType }
        });
        recommendations.push('Verify tool returns expected data type');
      }
    }

    return { anomalies, recommendations };
  }

  /**
   * Calculate basic statistics
   */
  private calculateStats(values: number[]): { mean: number; stdDev: number; median: number } {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)];

    return { mean, stdDev, median };
  }

  /**
   * Estimate output size
   */
  private estimateOutputSize(data: unknown): number {
    if (data === null || data === undefined) return 0;
    if (typeof data === 'string') return data.length;
    if (typeof data === 'number' || typeof data === 'boolean') return 1;
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object') return Object.keys(data).length;
    return 0;
  }

  /**
   * Track output size for a tool
   */
  private trackOutputSize(toolName: string, size: number): void {
    if (!this.outputSizeHistory.has(toolName)) {
      this.outputSizeHistory.set(toolName, []);
    }
    const history = this.outputSizeHistory.get(toolName)!;
    history.push(size);
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Find suspiciously round or "perfect" numbers
   */
  private findSuspiciousNumbers(obj: unknown, path: string = ''): string[] {
    const suspicious: string[] = [];
    
    const check = (value: unknown, currentPath: string): void => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        // Check for round numbers (multiples of 100, 1000, etc.)
        if (value > 100 && value % 100 === 0) {
          suspicious.push(`${currentPath}: ${value}`);
        }
        // Check for "perfect" powers
        else if (value > 0) {
          const sqrt = Math.sqrt(value);
          if (Number.isInteger(sqrt) && sqrt > 1) {
            suspicious.push(`${currentPath}: ${value} (perfect square)`);
          }
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => check(item, `${currentPath}[${i}]`));
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value as Record<string, unknown>).forEach(
          ([key, val]) => check(val, currentPath ? `${currentPath}.${key}` : key)
        );
      }
    };

    check(obj, path);
    return suspicious;
  }

  train(_historicalData: Array<{ result: ToolResult; context: InvocationContext }>): void {
    // Could be extended to use ML-based training
    // For now, this is a no-op - we collect data on-the-fly
  }

  reset(): void {
    this.responseTimeHistory.clear();
    this.outputSizeHistory.clear();
  }
}

/**
 * Factory function to create anomaly detector
 */
export function createAnomalyDetector(): AnomalyDetector {
  return new DefaultAnomalyDetector();
}