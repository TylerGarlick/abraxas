/**
 * Ergon - Tool Use Verification System
 * 
 * Types and interfaces for the verification layer
 */

export type ErrorType = 
  | 'EXPLICIT_ERROR'
  | 'FORMAT_ERROR'
  | 'SEMANTIC_ERROR'
  | 'SILENT_FAILURE'
  | 'TIMEOUT'
  | 'ANOMALY'
  | 'UNKNOWN';

export type VerificationStatus = 
  | 'SUCCESS'
  | 'FAILED'
  | 'ANOMALOUS'
  | 'PENDING';

export interface ValidationResult {
  validator: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  details?: Record<string, unknown>;
}

export interface Anomaly {
  type: string;
  description: string;
  score: number; // 0-1 confidence
  details?: Record<string, unknown>;
}

export interface VerificationReport {
  invocationId: string;
  toolName: string;
  timestamp: number;
  status: VerificationStatus;
  errorType?: ErrorType;
  inputValid: boolean;
  outputValid: boolean;
  validationResults: ValidationResult[];
  anomalies: Anomaly[];
  confidenceScore: number;
  recommendations: string[];
  executionTimeMs: number;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface InvocationContext {
  toolName: string;
  input: unknown;
  expectedOutputType?: string;
  timestamp: number;
  sessionId?: string;
}

export interface ErgonConfig {
  enableAnomalyDetection: boolean;
  enableValidation: boolean;
  timeoutMs: number;
  strictMode: boolean;
  validators: string[];
}

// Default configuration
export const DEFAULT_ERGON_CONFIG: ErgonConfig = {
  enableAnomalyDetection: true,
  enableValidation: true,
  timeoutMs: 30000,
  strictMode: false,
  validators: ['json', 'numeric', 'format']
};