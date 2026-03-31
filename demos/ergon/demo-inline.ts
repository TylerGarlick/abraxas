/**
 * Ergon Demo - Tool Use Verification System
 * 
 * Demonstrates how Ergon wraps tool invocations with verification
 * Run with: npx tsx systems/ergon/demo-inline.ts
 */

// ============================================
// Ergon Core Types (Simplified for demo)
// ============================================

type ErrorType = 'EXPLICIT_ERROR' | 'FORMAT_ERROR' | 'SEMANTIC_ERROR' | 'SILENT_FAILURE' | 'TIMEOUT' | 'ANOMALY' | 'UNKNOWN';
type VerificationStatus = 'SUCCESS' | 'FAILED' | 'ANOMALOUS' | 'PENDING';

interface ValidationResult {
  validator: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface Anomaly {
  type: string;
  description: string;
  score: number;
}

interface VerificationReport {
  invocationId: string;
  toolName: string;
  timestamp: number;
  status: VerificationStatus;
  errorType?: ErrorType;
  validationResults: ValidationResult[];
  anomalies: Anomaly[];
  confidenceScore: number;
  recommendations: string[];
  executionTimeMs: number;
}

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface Tool {
  name: string;
  invoke(input: unknown): Promise<ToolResult>;
}

// ============================================
// Simple Ergon Implementation (Demo)
// ============================================

class SimpleErgon {
  private toolRegistry: Map<string, Tool> = new Map();
  private reports: VerificationReport[] = [];
  private invocationCount = 0;

  registerTool<T extends Tool>(tool: T): void {
    this.toolRegistry.set(tool.name, tool);
  }

  async invoke<T>(toolName: string, input: unknown): Promise<{ result: ToolResult; report: VerificationReport }> {
    const startTime = Date.now();
    const invocationId = `ergon_${++this.invocationCount}_${Date.now()}`;
    
    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      const report: VerificationReport = {
        invocationId,
        toolName,
        timestamp: startTime,
        status: 'FAILED',
        errorType: 'EXPLICIT_ERROR',
        validationResults: [],
        anomalies: [],
        confidenceScore: 0,
        recommendations: [`Tool not found: ${toolName}`],
        executionTimeMs: Date.now() - startTime
      };
      this.reports.push(report);
      return { result: { success: false, error: 'Tool not found' }, report };
    }

    let result: ToolResult;
    try {
      result = await tool.invoke(input);
    } catch (error) {
      result = { success: false, error: String(error) };
    }

    const executionTimeMs = Date.now() - startTime;
    
    // Run validation
    const validationResults = this.validateResult(result, toolName);
    const anomalies = this.detectAnomalies(result, toolName);
    
    // Determine status
    let status: VerificationStatus = 'SUCCESS';
    let errorType: ErrorType | undefined;
    
    if (!result.success) {
      status = 'FAILED';
      errorType = 'EXPLICIT_ERROR';
    } else if (anomalies.length > 0) {
      status = 'ANOMALOUS';
      errorType = 'ANOMALY';
    }

    // Calculate confidence
    let confidence = 1.0;
    if (status === 'FAILED') confidence -= 0.7;
    else if (status === 'ANOMALOUS') confidence -= 0.4;
    confidence -= validationResults.filter(v => !v.passed).length * 0.1;
    confidence -= anomalies.length * 0.1;
    confidence = Math.max(0, Math.min(1, confidence));

    const report: VerificationReport = {
      invocationId,
      toolName,
      timestamp: startTime,
      status,
      errorType,
      validationResults,
      anomalies,
      confidenceScore: confidence,
      recommendations: this.generateRecommendations(status, validationResults, anomalies),
      executionTimeMs
    };

    this.reports.push(report);
    return { result, report };
  }

  private validateResult(result: ToolResult, toolName: string): ValidationResult[] {
    const validations: ValidationResult[] = [];
    
    // Check if successful but has no data
    if (result.success && result.data === undefined) {
      validations.push({
        validator: 'data-check',
        passed: false,
        message: 'Tool succeeded but returned no data',
        severity: 'warning'
      });
    }

    // Check for JSON parse issues if string
    if (typeof result.data === 'string' && result.data.startsWith('{')) {
      try {
        JSON.parse(result.data);
        validations.push({
          validator: 'json-parse',
          passed: true,
          message: 'Valid JSON string',
          severity: 'info'
        });
      } catch {
        validations.push({
          validator: 'json-parse',
          passed: false,
          message: 'Invalid JSON string',
          severity: 'error'
        });
      }
    }

    return validations;
  }

  private detectAnomalies(result: ToolResult, toolName: string): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const data = result.data;

    // Check for suspiciously round numbers
    if (typeof data === 'object' && data !== null) {
      const checkNumbers = (obj: unknown, path: string = ''): void => {
        if (typeof obj === 'number' && obj > 100 && obj % 100 === 0) {
          anomalies.push({
            type: 'SUSPICIOUS_NUMBER',
            description: `Found suspiciously round number at ${path}: ${obj}`,
            score: 0.3
          });
        } else if (Array.isArray(obj)) {
          obj.forEach((item, i) => checkNumbers(item, `${path}[${i}]`));
        } else if (typeof obj === 'object' && obj !== null) {
          Object.entries(obj as Record<string, unknown>).forEach(
            ([key, val]) => checkNumbers(val, path ? `${path}.${key}` : key)
          );
        }
      };
      checkNumbers(data);
    }

    // Check for placeholder text
    if (typeof data === 'string' && /\[TODO\]|TBD|placeholder/i.test(data)) {
      anomalies.push({
        type: 'PLACEHOLDER',
        description: 'Output contains placeholder text',
        score: 0.8
      });
    }

    return anomalies;
  }

  private generateRecommendations(
    status: VerificationStatus, 
    validations: ValidationResult[], 
    anomalies: Anomaly[]
  ): string[] {
    const recs: string[] = [];
    
    if (status === 'FAILED') {
      recs.push('Check tool implementation and error handling');
    }
    if (validations.some(v => !v.passed)) {
      recs.push('Review validation failures in the report');
    }
    if (anomalies.length > 0) {
      recs.push('Investigate detected anomalies');
    }
    
    return recs;
  }

  getStats() {
    const reports = this.reports;
    return {
      total: reports.length,
      success: reports.filter(r => r.status === 'SUCCESS').length,
      failed: reports.filter(r => r.status === 'FAILED').length,
      anomalous: reports.filter(r => r.status === 'ANOMALOUS').length,
      avgConfidence: reports.reduce((sum, r) => sum + r.confidenceScore, 0) / (reports.length || 1)
    };
  }
}

// ============================================
// Demo Tools
// ============================================

const webFetchTool: Tool = {
  name: 'web_fetch',
  async invoke(input: unknown): Promise<ToolResult> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const url = (input as { url: string }).url;
    if (url?.includes('error')) {
      return { success: false, error: 'Network error' };
    }
    return {
      success: true,
      data: JSON.stringify({ status: 200, content: '<html>Sample</html>' })
    };
  }
};

const codeExecTool: Tool = {
  name: 'code_exec',
  async invoke(input: unknown): Promise<ToolResult> {
    await new Promise(resolve => setTimeout(resolve, 30));
    const code = (input as { code: string }).code;
    if (code?.includes('throw')) {
      return { success: false, error: 'Runtime error' };
    }
    return { success: true, data: { result: 42 } };
  }
};

const failingTool: Tool = {
  name: 'failing_tool',
  async invoke(input: unknown): Promise<ToolResult> {
    const shouldFail = (input as { shouldFail: boolean })?.shouldFail;
    if (shouldFail) {
      return { success: false, error: 'Intentional failure' };
    }
    return { success: true, data: 'OK' };
  }
};

const suspiciousTool: Tool = {
  name: 'suspicious_output',
  async invoke(): Promise<ToolResult> {
    return {
      success: true,
      data: { count: 1000, total: 5000, average: 100 }
    };
  }
};

// ============================================
// Run Demo
// ============================================

async function runDemo() {
  console.log('='.repeat(60));
  console.log('ERGON - Tool Use Verification System Demo');
  console.log('='.repeat(60));
  console.log();

  const ergon = new SimpleErgon();
  
  ergon.registerTool(webFetchTool);
  ergon.registerTool(codeExecTool);
  ergon.registerTool(failingTool);
  ergon.registerTool(suspiciousTool);

  // Demo 1: Successful web fetch
  console.log('📡 Demo 1: Successful Web Fetch');
  console.log('-'.repeat(40));
  const r1 = await ergon.invoke('web_fetch', { url: 'https://example.com' });
  console.log('Status:', r1.report.status);
  console.log('Confidence:', r1.report.confidenceScore.toFixed(2));
  console.log();

  // Demo 2: Tool failure
  console.log('❌ Demo 2: Tool Failure');
  console.log('-'.repeat(40));
  const r2 = await ergon.invoke('failing_tool', { shouldFail: true });
  console.log('Status:', r2.report.status);
  console.log('Error:', r2.report.errorType);
  console.log('Confidence:', r2.report.confidenceScore.toFixed(2));
  console.log('Recommendations:', r2.report.recommendations);
  console.log();

  // Demo 3: Code execution
  console.log('⚡ Demo 3: Code Execution');
  console.log('-'.repeat(40));
  const r3 = await ergon.invoke('code_exec', { code: 'const x = 1;' });
  console.log('Status:', r3.report.status);
  console.log('Confidence:', r3.report.confidenceScore.toFixed(2));
  console.log();

  // Demo 4: Anomaly detection
  console.log('🔍 Demo 4: Anomaly Detection (Suspicious Numbers)');
  console.log('-'.repeat(40));
  const r4 = await ergon.invoke('suspicious_output', {});
  console.log('Status:', r4.report.status);
  console.log('Confidence:', r4.report.confidenceScore.toFixed(2));
  console.log('Anomalies:');
  r4.report.anomalies.forEach(a => console.log(`  - ${a.type}: ${a.description}`));
  console.log();

  // Stats
  console.log('📊 Statistics');
  console.log('-'.repeat(40));
  const stats = ergon.getStats();
  console.log('Total:', stats.total);
  console.log('Success:', stats.success);
  console.log('Failed:', stats.failed);
  console.log('Anomalous:', stats.anomalous);
  console.log('Avg Confidence:', stats.avgConfidence.toFixed(2));

  console.log();
  console.log('='.repeat(60));
  console.log('Demo Complete!');
}

runDemo().catch(console.error);