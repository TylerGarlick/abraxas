/**
 * Ergon - Tool Use Verification System
 * TypeScript type definitions
 */

export type ErrorType = 
  | 'EXPLICIT_ERROR'
  | 'FORMAT_ERROR'
  | 'SEMANTIC_ERROR'
  | 'SILENT_FAILURE'
  | 'TIMEOUT'
  | 'ANOMALY';

export type VerificationStatus = 
  | 'SUCCESS'
  | 'FAILED'
  | 'ANOMALOUS'
  | 'PENDING';

export type ValidationResult = {
  validator: string;
  passed: boolean;
  message?: string;
  details?: Record<string, unknown>;
};

export type Anomaly = {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  score: number;
};

export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: ErrorType;
  timestamp: number;
  durationMs: number;
}

export interface VerificationReport {
  invocationId: string;
  toolName: string;
  timestamp: number;
  status: VerificationStatus;
  errorType?: ErrorType;
  validationResults: ValidationResult[];
  anomalies: Anomaly[];
  confidenceScore: number;
  recommendations: string[];
  durationMs: number;
}

export interface InvocationContext {
  toolName: string;
  input: unknown;
  expectedOutputType?: string;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface Tool<T> {
  name: string;
  invoke(input: T): Promise<ToolResult<T>>;
}

export interface VerifiedTool<T> extends Tool<T> {
  invoke(input: T): Promise<ToolResult<T> & { verification: VerificationReport }>;
  getVerificationReport(): VerificationReport;
}

export interface VerificationConfig {
  enabled: boolean;
  strictMode: boolean;
  timeout: number;
  validators: string[];
  anomalyDetection: boolean;
}

export interface VerificationLog {
  add(report: VerificationReport): void;
  getRecent(limit: number): VerificationReport[];
  getByTool(toolName: string, limit?: number): VerificationReport[];
  clear(): void;
}