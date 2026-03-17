/**
 * Ergon Demo - Tool Use Verification System
 * 
 * Demonstrates how Ergon wraps tool invocations with verification
 */

import { ErgonWrapper, Tool } from './ergon-wrapper.js';

// ============================================
// Demo Tools
// ============================================

/**
 * Demo tool that simulates a web fetch
 */
const webFetchTool: Tool<{ url: string }> = {
  name: 'web_fetch',
  async invoke(input: { url: string }): Promise<{ success: boolean; data?: string; error?: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (input.url.includes('error')) {
      throw new Error('Network error: Failed to fetch');
    }
    
    return {
      success: true,
      data: JSON.stringify({
        status: 200,
        content: '<html><body>Sample content</body></html>',
        url: input.url
      })
    };
  }
};

/**
 * Demo tool that simulates code execution
 */
const codeExecTool: Tool<{ code: string }> = {
  name: 'code_exec',
  async invoke(input: { code: string }): Promise<{ success: boolean; data?: unknown; error?: string }> {
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // This is a safe demo - never eval in production!
    if (input.code.includes('throw')) {
      throw new Error('Runtime error');
    }
    
    return {
      success: true,
      data: { result: 42, stdout: 'Execution complete' }
    };
  }
};

/**
 * Demo tool that returns an error
 */
const failingTool: Tool<{ shouldFail: boolean }> = {
  name: 'failing_tool',
  async invoke(input: { shouldFail: boolean }): Promise<{ success: boolean; data?: unknown; error?: string }> {
    if (input.shouldFail) {
      return { success: false, error: 'Intentional failure for testing' };
    }
    return { success: true, data: 'Success!' };
  }
};

/**
 * Demo tool that returns suspicious output
 */
const suspiciousTool: Tool = {
  name: 'suspicious_output',
  async invoke(): Promise<{ success: boolean; data?: unknown; error?: string }> {
    // Returns suspiciously perfect/round numbers
    return {
      success: true,
      data: {
        count: 1000,
        total: 5000,
        average: 100
      }
    };
  }
};

// ============================================
// Demo Execution
// ============================================

async function runDemo() {
  console.log('='.repeat(60));
  console.log('ERGON - Tool Use Verification System Demo');
  console.log('='.repeat(60));
  console.log();

  // Create Ergon wrapper with default config
  const ergon = new ErgonWrapper();

  // Register demo tools
  ergon.registerTool(webFetchTool);
  ergon.registerTool(codeExecTool);
  ergon.registerTool(failingTool);
  ergon.registerTool(suspiciousTool);

  // Demo 1: Successful web fetch
  console.log('📡 Demo 1: Successful Web Fetch');
  console.log('-'.repeat(40));
  const result1 = await ergon.invoke('web_fetch', { url: 'https://example.com' });
  console.log('Status:', result1.report.status);
  console.log('Confidence:', result1.report.confidenceScore.toFixed(2));
  console.log('Validations:', result1.report.validationResults.length);
  console.log('Anomalies:', result1.report.anomalies.length);
  console.log();

  // Demo 2: Tool with error
  console.log('❌ Demo 2: Tool That Fails');
  console.log('-'.repeat(40));
  const result2 = await ergon.invoke('failing_tool', { shouldFail: true });
  console.log('Status:', result2.report.status);
  console.log('Error Type:', result2.report.errorType);
  console.log('Confidence:', result2.report.confidenceScore.toFixed(2));
  console.log('Recommendations:', result2.report.recommendations);
  console.log();

  // Demo 3: Successful code execution
  console.log('⚡ Demo 3: Successful Code Execution');
  console.log('-'.repeat(40));
  const result3 = await ergon.invoke('code_exec', { code: 'const x = 42;' });
  console.log('Status:', result3.report.status);
  console.log('Confidence:', result3.report.confidenceScore.toFixed(2));
  console.log('Validation Results:');
  result3.report.validationResults.forEach(v => {
    console.log(`  - [${v.passed ? '✓' : '✗'}] ${v.validator}: ${v.message}`);
  });
  console.log();

  // Demo 4: Suspicious output (anomaly detection)
  console.log('🔍 Demo 4: Suspicious Output (Anomaly Detection)');
  console.log('-'.repeat(40));
  const result4 = await ergon.invoke('suspicious_output', {});
  console.log('Status:', result4.report.status);
  console.log('Confidence:', result4.report.confidenceScore.toFixed(2));
  if (result4.report.anomalies.length > 0) {
    console.log('Detected Anomalies:');
    result4.report.anomalies.forEach(a => {
      console.log(`  - ${a.type}: ${a.description} (score: ${a.score.toFixed(2)})`);
    });
  }
  console.log();

  // Demo 5: Stats overview
  console.log('📊 Demo 5: Verification Statistics');
  console.log('-'.repeat(40));
  const stats = ergon.getStats();
  console.log('Total Invocations:', stats.total);
  console.log('Successful:', stats.success);
  console.log('Failed:', stats.failed);
  console.log('Anomalous:', stats.anomalous);
  console.log('Average Confidence:', stats.avgConfidence.toFixed(2));
  console.log();

  // Demo 6: Recent reports
  console.log('📋 Demo 6: Recent Verification Reports');
  console.log('-'.repeat(40));
  const reports = ergon.getRecentReports(3);
  for (const report of reports) {
    console.log(`[${report.invocationId}] ${report.toolName}: ${report.status}`);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Demo Complete!');
  console.log('='.repeat(60));
}

// Run demo if executed directly
runDemo().catch(console.error);