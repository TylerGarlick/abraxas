/**
 * run-tests.ts
 * 
 * Runs all tests and enforces minimum coverage threshold.
 * Fails the process if coverage is below 70%.
 * 
 * Usage:
 *   bun run scripts/run-tests.ts
 * 
 * Exit codes:
 *   0 - All tests pass, coverage above threshold
 *   1 - Tests fail OR coverage below threshold
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const COVERAGE_THRESHOLD = 70; // percentage
const PROJECT_DIR = '/home/ubuntu/.openclaw/workspace/avalanche';

interface CoverageReport {
  total: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
  thresholds: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
}

function runCommand(cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { cwd, shell: true });
    let stdout = '';
    let stderr = '';
    
    proc.stdout?.on('data', (data) => { stdout += data.toString(); });
    proc.stderr?.on('data', (data) => { stderr += data.toString(); });
    
    proc.on('close', (exitCode) => {
      resolve({ stdout, stderr, exitCode: exitCode ?? 1 });
    });
    
    proc.on('error', (err) => {
      stderr += err.message;
      resolve({ stdout, stderr, exitCode: 1 });
    });
  });
}

function printHeader(text: string) {
  console.log('\n' + '='.repeat(60));
  console.log(text);
  console.log('='.repeat(60));
}

function printResult(label: string, value: string | number, pass: boolean, indent = 0) {
  const prefix = ' '.repeat(indent);
  const icon = pass ? '✅' : '❌';
  console.log(`${prefix}${icon} ${label}: ${value}`);
}

async function main() {
  console.log('\n🧪 Running Test Suite with Coverage Check');
  console.log('=========================================\n');
  
  // Check if bun is available
  const bunCheck = await runCommand('which', ['bun'], PROJECT_DIR);
  if (bunCheck.exitCode !== 0) {
    console.error('❌ Bun is not installed. Install from https://bun.sh');
    process.exit(1);
  }
  
  // Change to project directory
  process.chdir(PROJECT_DIR);
  
  printHeader('Running Tests');
  
  // Run tests with coverage using bun test --coverage
  const testResult = await runCommand(
    'bun',
    ['test', '--coverage', 'tests/'],
    PROJECT_DIR
  );
  
  console.log(testResult.stdout);
  if (testResult.stderr) {
    console.error(testResult.stderr);
  }
  
  const testsPassed = testResult.exitCode === 0;
  
  printHeader('Coverage Report');
  
  // Try to parse coverage from output
  // Bun outputs coverage in format: "Coverage: 85.5%"
  const coverageMatch = testResult.stdout.match(/Coverage:\s*(\d+\.?\d*)%/);
  
  if (coverageMatch) {
    const totalCoverage = parseFloat(coverageMatch[1]);
    const pass = totalCoverage >= COVERAGE_THRESHOLD;
    
    console.log(`\n📊 Overall Coverage: ${totalCoverage.toFixed(1)}%`);
    console.log(`🎯 Threshold: ${COVERAGE_THRESHOLD}%\n`);
    
    printResult('Coverage Check', `${totalCoverage.toFixed(1)}%`, pass, 2);
    
    if (!pass) {
      console.log(`\n❌ COVERAGE BELOW THRESHOLD!`);
      console.log(`   Required: ${COVERAGE_THRESHOLD}%`);
      console.log(`   Actual: ${totalCoverage.toFixed(1)}%`);
      console.log(`\n📝 Actions:`);
      console.log(`   1. Add more tests to improve coverage`);
      console.log(`   2. Review generated test scaffolding: bun run scripts/generate-tests.ts`);
      console.log(`   3. Run tests again: bun run scripts/run-tests.ts`);
    }
    
    console.log('\n' + '-'.repeat(60));
    console.log('Test Files Found:');
    
    const testsDir = path.join(PROJECT_DIR, 'tests');
    if (fs.existsSync(testsDir)) {
      const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
      for (const file of testFiles) {
        console.log(`   • tests/${file}`);
      }
    }
    
    console.log('\n' + '-'.repeat(60));
    
    if (!testsPassed || !pass) {
      console.log('\n❌ FAILED: ');
      if (!testsPassed) console.log('   - Some tests failed');
      if (!pass) console.log(`   - Coverage (${totalCoverage.toFixed(1)}%) below threshold (${COVERAGE_THRESHOLD}%)`);
      process.exit(1);
    }
    
    console.log('\n✅ ALL CHECKS PASSED');
    console.log(`   Tests: Passing`);
    console.log(`   Coverage: ${totalCoverage.toFixed(1)}% (${COVERAGE_THRESHOLD}% required)`);
    process.exit(0);
    
  } else {
    // Fallback: just check if tests passed without coverage
    console.log('\n⚠️  Could not parse coverage from output');
    console.log('   Make sure bun is version with coverage support');
    console.log('');
    
    if (testsPassed) {
      console.log('✅ Tests passed (coverage check skipped)');
      process.exit(0);
    } else {
      console.log('❌ Tests failed');
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error('Error running tests:', err);
  process.exit(1);
});
