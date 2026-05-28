# Ergon Architecture

## Overview

Ergon is the verification layer for all tool invocations in Abraxas. It ensures tool outputs are valid, detects silent failures, and provides verification metadata for downstream epistemic reasoning.

## Core Components

### 1. Instrument Wrapper

```typescript
interface ToolInvocation<T> {
  id: string;
  toolName: string;
  input: T;
  timestamp: number;
  timeout: number;
}

interface VerifiedTool<T> extends Tool<T> {
  invoke(input: T): Promise<VerifiedResult<T>>;
  getVerificationReport(): VerificationReport;
}

interface VerificationReport {
  invocationId: string;
  toolName: string;
  timestamp: number;
  status: 'VERIFIED' | 'WARNING' | 'FAILED' | 'ANOMALOUS' | 'PENDING';
  errorType?: ErrorType;
  validationResults: ValidationResult[];
  anomalies: Anomaly[];
  confidenceScore: number;
  recommendations: string[];
}
```

### 2. Validation Engine

```typescript
interface ValidationResult {
  check: string;
  result: 'PASS' | 'FAIL' | 'WARNING';
  details?: string;
}

class ValidationEngine {
  validateFormat(output: any, expected: Format): ValidationResult;
  validateBounds(output: number, expected: Range): ValidationResult;
  validateSchema(output: object, schema: JSONSchema): ValidationResult;
  validateJSON(output: string): ValidationResult;
  validateCode(output: string, language: string): ValidationResult;
}
```

### 3. Error Classifier

```typescript
type ErrorType = 
  | 'EXPLICIT_ERROR'
  | 'FORMAT_ERROR'
  | 'SEMANTIC_ERROR'
  | 'SILENT_FAILURE'
  | 'TIMEOUT'
  | 'ANOMALY';

function classifyError(error: any, output: any): ErrorType {
  if (error instanceof Error) {
    return 'EXPLICIT_ERROR';
  }
  if (isMalformedJSON(output)) {
    return 'FORMAT_ERROR';
  }
  if (isOutOfRange(output)) {
    return 'SEMANTIC_ERROR';
  }
  if (isEmpty(output)) {
    return 'SILENT_FAILURE';
  }
  if (isTimeout(output)) {
    return 'TIMEOUT';
  }
  return 'ANOMALY';
}
```

### 4. Anomaly Detector

```typescript
interface Anomaly {
  type: 'statistical' | 'timing' | 'content_drift';
  description: string;
  severity: 'low' | 'medium' | 'high';
  value?: number;
  expected?: number;
  zScore?: number;
}

class AnomalyDetector {
  detectStatistical(data: number[]): Anomaly[];
  detectTiming(responseTime: number, baseline: number): Anomaly | null;
  detectContentDrift(current: string, baseline: string): Anomaly | null;
  
  calculateZScore(value: number, dataset: number[]): number {
    const mean = dataset.reduce((a, b) => a + b) / dataset.length;
    const std = Math.sqrt(
      dataset.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / dataset.length
    );
    return (value - mean) / std;
  }
}
```

## Verification Pipeline

```
Tool Input → Ergon Wrapper → Validation → Anomaly Detection → Report
                                        ↓
                                   Error Classification
```

### Step-by-Step

1. **Instrument**: Wrap tool call with invocation tracking
2. **Execute**: Run tool with timeout monitoring
3. **Validate**: Check format, bounds, schema
4. **Classify**: Identify error type if failed
5. **Anomaly**: Detect statistical anomalies
6. **Report**: Generate verification metadata

## Error Categories

| Category | Detection | Example |
|:---|:---|:---|
| EXPLICIT_ERROR | Exception handling | `throw new Error()` |
| FORMAT_ERROR | JSON/text validation | Malformed JSON |
| SEMANTIC_ERROR | Bounds checking | `value > max` |
| SILENT_FAILURE | Empty/null checks | `""` response |
| TIMEOUT | Timeout monitoring | > 30s |
| ANOMALY | Z-score > 3 | Outlier value |

## Storage Schema

```json
{
  "verifications": {
    "inv-1709999999": {
      "id": "inv-1709999999",
      "toolName": "exec",
      "status": "VERIFIED",
      "timestamp": 1709999999,
      "validationResults": [
        {"check": "format", "result": "PASS"},
        {"check": "bounds", "result": "PASS"}
      ],
      "anomalies": [],
      "confidenceScore": 0.95
    }
  },
  "tool-stats": {
    "exec": {
      "total": 500,
      "success": 450,
      "warning": 30,
      "failed": 20,
      "avgTime": 2.3
    }
  }
}
```

## Configuration

```typescript
interface ErgonConfig {
  defaultTimeout: number;        // 30s
  anomalyThreshold: number;     // Z-score 3.0
  jsonStrict: boolean;           // false
  enableAnomalyDetection: boolean; // true
  maxRetries: number;            // 3
}
```

## Integration with Janus

```
Tool Output → Ergon Verification → Janus Labeling
    ↓
[VERIFIED]   → [KNOWN]
[WARNING]    → [INFERRED] with caveat
[FAILED]     → Don't present to user
[ANOMALOUS]  → [UNCERTAIN] with note
```

Combined labels:
- `[KNOWN] [VERIFIED]` — Tool worked, result reliable
- `[INFERRED] [WARNING]` — Minor issues, use with caution
- `[UNKNOWN] [FAILED]` — Tool failed completely
- `[UNCERTAIN] [ANOMALOUS]` — Anomaly detected

## Implementation Notes

1. **Performance**: Validation should add < 10ms overhead
2. **False positives**: Tune anomaly threshold to minimize
3. **Tool-specific**: May need custom validators per tool type
4. **Caching**: Cache validation results for repeated calls