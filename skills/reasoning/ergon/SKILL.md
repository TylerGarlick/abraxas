---
name: ergon
description: >
  Ergon — Tool-Use Verification. Use this skill to verify tool outputs (code execution, web fetches,
  calculations) before presenting results. Check for silent failures, format errors, anomalies. Provides
  verification feedback before presenting tool results. Commands: /ergon verify, /ergon status, /ergon history,
  /ergon config, /ergon anomalies.
---

# Ergon — Tool-Use Verification

Ergon (Greek: ἔργον, "work, deed, action") is the verification layer for all tool invocations. It ensures tool outputs are valid, detects silent failures, and provides verification metadata for downstream epistemic reasoning.

## Why Ergon?

Modern AI systems use tools extensively — code execution, web fetches, API calls, calculations. But tool failures are a blind spot:

- A web fetch might return 404 but the error is ignored
- Code might have runtime errors that aren't surfaced
- Calculations might overflow or underflow silently
- JSON might be malformed but the system continues

Ergon ensures tool use doesn't introduce silent failures into the epistemic pipeline.

- **Failure detection** — Catches explicit and silent failures
- **Format validation** — Ensures outputs match expected formats
- **Anomaly detection** — Flags statistical outliers and drift
- **Verification metadata** — Every tool use gets a verification report

## Use Cases

1. **Pre-output verification**: Check tool results before presenting to user
2. **Silent failure detection**: Find errors that didn't throw exceptions
3. **Format validation**: Ensure JSON/code/text outputs are well-formed
4. **Tool reliability tracking**: Which tools are most reliable over time?

## Storage Location

**`~/.abraxas/ergon/`**

```
~/.abraxas/ergon/
├── verifications.json    # Verification history
├── anomalies.json       # Detected anomalies
├── tool-stats/          # Per-tool reliability statistics
└── config.yaml          # Ergon configuration
```

## Command Suite

| Command | Description |
|:---|:---|
| `/ergon verify {tool} {output}` | Verify a tool output |
| `/ergon status` | Show last verification status |
| `/ergon history {limit}` | Show verification history |
| `/ergon config {key} {value}` | Configure validation rules |
| `/ergon anomalies {limit}` | Show detected anomalies |
| `/ergon tool-stats {tool}` | Show reliability stats for a tool |
| `/ergon clear {invocation_id}` | Clear verification record |

## Error Classification

| Category | Examples | Detection Method |
|:---|:---|:---|
| **EXPLICIT_ERROR** | Exceptions, HTTP 4xx/5xx | Direct exception handling |
| **FORMAT_ERROR** | Malformed JSON, wrong type | Schema validation |
| **SEMANTIC_ERROR** | Out-of-range values, contradictions | Bounds/semantic checks |
| **SILENT_FAILURE** | Empty responses, truncated data | Anomaly detection |
| **TIMEOUT** | No response within threshold | Timeout monitoring |
| **ANOMALY** | Statistical outliers, drift | ML-based detection |

## Verification Status

| Status | Meaning | Action |
|:---|:---|:---|
| **VERIFIED** | Output passed all checks | Safe to use |
| **WARNING** | Minor issues detected | Use with caution |
| **FAILED** | Explicit failure detected | Do not use |
| **ANOMALOUS** | Statistical anomaly detected | Investigate |
| **PENDING** | Verification in progress | Wait |

## Verification Report

Every tool invocation gets a report:

```json
{
  "invocation_id": "inv-1709999999",
  "tool_name": "exec",
  "timestamp": 1709999999,
  "status": "VERIFIED",
  "error_type": null,
  "validation_results": [
    {"check": "format", "result": "PASS"},
    {"check": "bounds", "result": "PASS"},
    {"check": "timeout", "result": "PASS"}
  ],
  "anomalies": [],
  "confidence_score": 0.95,
  "recommendations": []
}
```

## Usage Examples

### Code Execution Verification

```
User: Run this Python code

Code: print(1/0)

/ergon verify exec "ZeroDivisionError: division by zero"
→ Status: FAILED
→ Error Type: EXPLICIT_ERROR
→ Details: Runtime exception in code
→ Recommendation: Fix code before presenting
→ 
Output with verification:
[ERROR] Code execution failed [VERIFICATION: FAILED]
ZeroDivisionError: division by zero
```

### Web Fetch Verification

```
User: Fetch https://example.com

/ergon verify fetch "<html>...</html>"
→ Status: VERIFIED
→ Validation:
│ Format: PASS (valid HTML)
│ Status code: 200
│ Length: 15KB (normal)
→ Confidence: 0.95
→ 
Output with verification:
[VERIFIED] Successfully fetched example.com (200 OK)
Content length: 15KB
```

### Silent Failure Detection

```
User: Run this calculation

Calc: 0.1 + 0.2

Previous tool output: 0.30000000000000004

/ergon verify calc "0.30000000000000004"
→ Status: WARNING
→ Anomaly: Floating point precision artifact
→ Expected: 0.3
→ Actual: 0.30000000000000004
→ Recommendation: Format output appropriately
→ 
Output:
[WARNING] Calculation complete [VERIFICATION: WARNING]
Result: 0.3 (formatted from 0.30000000000000004)
```

### JSON Validation

```
User: Parse this JSON

JSON: {"name": "test", "value": 123}

Input: {"name": "test", "value": 123,

/ergon verify json-parser "SyntaxError: Unexpected end of JSON"
→ Status: FAILED
→ Error Type: FORMAT_ERROR
→ Details: Malformed JSON - missing closing brace
→ 
Output:
[ERROR] JSON parsing failed [VERIFICATION: FAILED]
SyntaxError: Unexpected end of JSON
```

### Timeout Detection

```
User: Fetch from slow API

/ergon verify fetch "<timeout>"
→ Status: FAILED
→ Error Type: TIMEOUT
→ Details: No response within 30s threshold
→ Recommendation: Retry with longer timeout or cache
```

### Anomaly Detection

```
User: Run aggregation on dataset

Output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 999]

/ergon verify exec "[1,2,3,4,5,6,7,8,9,999]"
→ Status: ANOMALOUS
→ Anomaly Detected: Statistical outlier
│ Value: 999
│ Expected range: [1, 18]
│ Z-score: 98.7
→ Recommendation: Verify this value is correct
→ 
Output:
[ANOMALOUS] Results include outlier [VERIFICATION: ANOMALOUS]
[1, 2, 3, 4, 5, 6, 7, 8, 9, 999] ⚠️
```

### Tool Statistics

```
/ergon tool-stats exec
→ Tool: exec
→ Total invocations: 500
│ Success: 450 (90%)
│ Warning: 30 (6%)
│ Failed: 20 (4%)
│
→ Failure breakdown:
│ EXPLICIT_ERROR: 15
│ FORMAT_ERROR: 3
│ TIMEOUT: 2
│
→ Average execution time: 2.3s
→ Most common failure: Syntax errors
```

## Configuration

```
/ergon config timeout 30
→ Set: default timeout = 30 seconds

/ergon config anomaly_threshold 3.0
→ Set: anomaly Z-score threshold = 3.0

/ergon config json_strict true
→ Set: strict JSON validation enabled
```

## Integration with Janus

Ergon verifies tool inputs before Janus labeling:

```
Tool Output → Ergon Verification → Janus Labeling → User
                ↓
           [VERIFIED] → Janus adds [KNOWN]
           [WARNING]  → Janus adds [INFERRED] with caveat
           [FAILED]  → Don't present to user
           [ANOMALOUS] → Janus adds [UNCERTAIN] with note
```

Combined labels:
- `[KNOWN] [VERIFIED]` — Tool worked, result reliable
- `[INFERRED] [VERIFIED]` — Tool worked, result derived
- `[UNKNOWN] [FAILED]` — Tool failed, no result
- `[UNCERTAIN] [ANOMALOUS]` — Tool result may be unreliable

## Implementation

Core components:

```typescript
interface Ergon {
  // Wrap tool invocation with verification
  verify<T>(toolName: string, input: any, output: T): VerificationReport;
  
  // Validation engines
  validateFormat(output: any, expected: Format): ValidationResult;
  validateBounds(output: number, expected: Range): ValidationResult;
  validateSchema(output: object, schema: JSONSchema): ValidationResult;
  
  // Anomaly detection
  detectAnomalies(output: any, context: Context): AnomalyResult;
  calculateZScore(value: number, dataset: number[]): number;
  
  // Error classification
  classifyError(error: any): ErrorType;
  
  // Reporting
  getReport(invocationId: string): VerificationReport;
  getToolStats(toolName: string): ToolStats;
}
```

See `references/ergon-architecture.md` for technical implementation details.