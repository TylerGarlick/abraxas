/**
 * generate-tests.ts
 * 
 * Auto-generates test scaffolding by analyzing source files.
 * Idempotent - safe to run multiple times (checks for existing tests).
 * 
 * Usage:
 *   bun run scripts/generate-tests.ts                    # Generate for all source files
 *   bun run scripts/generate-tests.ts src/lib/foo.ts     # Generate for specific file
 *   bun run scripts/generate-tests.ts --dry-run         # Preview without writing
 */

import { parseArgs } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_FILES = process.argv.filter(arg => 
  arg.endsWith('.ts') || arg.endsWith('.tsx')
);

// Known patterns for test generation
const API_PATTERNS = ['/api/', '-api.'];
const COMPONENT_PATTERNS = ['.tsx', 'useClient', 'use server'];

interface GeneratedTest {
  sourceFile: string;
  testPath: string;
  content: string;
  action: 'create' | 'skip' | 'update';
}

function findSourceFiles(dir: string, extensions: string[] = ['.ts', '.tsx']): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function getTestPath(sourcePath: string, baseDir: string): string {
  const relative = path.relative(baseDir, sourcePath);
  const testRelative = relative.replace(/\.(ts|tsx)$/, '.test.$1');
  return path.join(baseDir, 'tests', testRelative);
}

function analyzeSourceFile(filePath: string, content: string): { type: 'api' | 'component' | 'transform' | 'unknown'; exports: string[] } {
  const exports: string[] = [];
  
  // Extract exports
  const exportMatches = content.matchAll(/export\s+(?:function|const|async\s+function)\s+(\w+)/g);
  for (const match of exportMatches) {
    exports.push(match[1]);
  }
  
  // Also match default exports
  const defaultMatches = content.matchAll(/export\s+default\s+(\w+|function)/g);
  for (const match of defaultMatches) {
    exports.push(match[1]);
  }
  
  // Determine type
  if (API_PATTERNS.some(p => filePath.includes(p))) {
    return { type: 'api', exports };
  }
  if (COMPONENT_PATTERNS.some(p => content.includes(p) || filePath.endsWith('.tsx'))) {
    return { type: 'component', exports };
  }
  if (exports.length > 0) {
    return { type: 'transform', exports };
  }
  return { type: 'unknown', exports };
}

function generateTestContent(sourceFile: string, analysis: { type: string; exports: string[] }): string {
  const fileName = path.basename(sourceFile, path.extname(sourceFile));
  const lines: string[] = [];
  
  lines.push(`/**`);
  lines.push(` * Generated test scaffolding for ${path.basename(sourceFile)}`);
  lines.push(` *`);
  lines.push(` * TODO: Implement actual test logic following SKILL.md guidelines`);
  lines.push(` * - Happy path: 100% coverage required`);
  lines.push(` * - Error paths: at least 2 per API route`);
  lines.push(` * - Use descriptive test names (it('does X when Y'), not it('works'))`);
  lines.push(` */`);
  lines.push(``);
  
  if (analysis.type === 'api') {
    lines.push(`import { describe, it, expect } from 'bun:test';`);
    lines.push(`import { fetch } from 'bun';`);
    lines.push(``);
    lines.push(`const BASE_URL = process.env.APP_URL || 'http://localhost:3000';`);
    lines.push(``);
    lines.push(`describe('${fileName}', () => {`);
    
    if (analysis.exports.length > 0) {
      for (const exp of analysis.exports) {
        lines.push(`  describe('${exp}', () => {`);
        lines.push(`    it('returns correct status and body shape', async () => {`);
        lines.push(`      // TODO: Implement test`);
        lines.push(`      expect(true).toBe(true);`);
        lines.push(`    });`);
        lines.push(``);
        lines.push(`    it('handles invalid input with 400 error', async () => {`);
        lines.push(`      // TODO: Implement error case`);
        lines.push(`      expect(true).toBe(true);`);
        lines.push(`    });`);
        lines.push(``);
        lines.push(`    it('handles missing required parameters', async () => {`);
        lines.push(`      // TODO: Implement error case`);
        lines.push(`      expect(true).toBe(true);`);
        lines.push(`    });`);
        lines.push(`  });`);
        lines.push(`}`);
      }
    } else {
      lines.push(`  describe('GET request', () => {`);
      lines.push(`    it('returns 200 with correct body shape', async () => {`);
      lines.push(`      // TODO: Implement test`);
      lines.push(`      expect(true).toBe(true);`);
      lines.push(`    });`);
      lines.push(`  });`);
    }
    
    lines.push(`});`);
  } else if (analysis.type === 'component') {
    lines.push(`import { describe, it, expect } from 'bun:test';`);
    lines.push(`import { render, screen } from '@testing-library/react'; // or bun:test`);
    lines.push(``);
    lines.push(`describe('${fileName}', () => {`);
    lines.push(`  it('renders without crashing', () => {`);
    lines.push(`    // TODO: Implement test`);
    lines.push(`    expect(true).toBe(true);`);
    lines.push(`  });`);
    lines.push(``);
    lines.push(`  it('displays correct data when populated', () => {`);
    lines.push(`    // TODO: Implement test`);
    lines.push(`    expect(true).toBe(true);`);
    lines.push(`  });`);
    lines.push(``);
    lines.push(`  it('handles loading state', () => {`);
    lines.push(`    // TODO: Implement test`);
    lines.push(`    expect(true).toBe(true);`);
    lines.push(`  });`);
    lines.push(``);
    lines.push(`  it('handles error state', () => {`);
    lines.push(`    // TODO: Implement test`);
    lines.push(`    expect(true).toBe(true);`);
    lines.push(`  });`);
    lines.push(`});`);
  } else {
    lines.push(`import { describe, it, expect } from 'bun:test';`);
    lines.push(``);
    lines.push(`describe('${fileName}', () => {`);
    
    if (analysis.exports.length > 0) {
      for (const exp of analysis.exports) {
        lines.push(`  describe('${exp}', () => {`);
        lines.push(`    it('produces expected output for known input', () => {`);
        lines.push(`      // TODO: Implement test`);
        lines.push(`      expect(true).toBe(true);`);
        lines.push(`    });`);
        lines.push(`  });`);
    } else {
      lines.push(`  it('transforms data correctly', () => {`);
      lines.push(`    // TODO: Implement test`);
      lines.push(`    expect(true).toBe(true);`);
      lines.push(`  });`);
    }
    
    lines.push(`});`);
  }
  
  return lines.join('\n');
}

function generateTests(sourceFiles: string[], baseDir: string): GeneratedTest[] {
  const results: GeneratedTest[] = [];
  
  for (const sourceFile of sourceFiles) {
    // Skip test files themselves
    if (sourceFile.includes('.test.') || sourceFile.includes('.spec.')) {
      continue;
    }
    
    // Skip node_modules and .next
    if (sourceFile.includes('node_modules') || sourceFile.includes('.next')) {
      continue;
    }
    
    const content = fs.readFileSync(sourceFile, 'utf-8');
    const analysis = analyzeSourceFile(sourceFile, content);
    const testPath = getTestPath(sourceFile, baseDir);
    
    // Check if test already exists
    if (fs.existsSync(testPath)) {
      results.push({
        sourceFile,
        testPath,
        content: '',
        action: 'skip'
      });
      continue;
    }
    
    const testContent = generateTestContent(sourceFile, analysis);
    
    results.push({
      sourceFile,
      testPath,
      content: testContent,
      action: 'create'
    });
  }
  
  return results;
}

function main() {
  const workspaceDir = '/home/ubuntu/.openclaw/workspace/avalanche';
  
  console.log('🧪 Test Generation Tool');
  console.log('======================\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN - No files will be written\n');
  }
  
  // Determine source files to analyze
  let sourceFiles: string[];
  
  if (TARGET_FILES.length > 0) {
    sourceFiles = TARGET_FILES.map(f => path.resolve(workspaceDir, f));
  } else {
    sourceFiles = findSourceFiles(path.join(workspaceDir, 'src'));
  }
  
  console.log(`Analyzing ${sourceFiles.length} source file(s)...\n`);
  
  const results = generateTests(sourceFiles, workspaceDir);
  
  // Summary
  const toCreate = results.filter(r => r.action === 'create');
  const toSkip = results.filter(r => r.action === 'skip');
  
  if (toSkip.length > 0) {
    console.log(`📁 ${toSkip.length} test(s) already exist:`);
    for (const r of toSkip) {
      console.log(`   ⏭️  ${path.relative(workspaceDir, r.testPath)}`);
    }
    console.log('');
  }
  
  if (toCreate.length > 0) {
    console.log(`✨ ${toCreate.length} test(s) to generate:`);
    for (const r of toCreate) {
      console.log(`   📄 ${path.relative(workspaceDir, r.sourceFile)} → ${path.relative(workspaceDir, r.testPath)}`);
    }
    console.log('');
    
    if (!DRY_RUN) {
      // Ensure tests directory exists
      const testsDir = path.join(workspaceDir, 'tests');
      if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir, { recursive: true });
      }
      
      // Write test files
      for (const r of toCreate) {
        const testDir = path.dirname(r.testPath);
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        fs.writeFileSync(r.testPath, r.content);
        console.log(`✅ Created: ${path.relative(workspaceDir, r.testPath)}`);
      }
    } else {
      console.log('Generated content preview:');
      console.log('-'.repeat(50));
      for (const r of toCreate) {
        console.log(`\n### ${path.relative(workspaceDir, r.testPath)} ###\n`);
        console.log(r.content);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Done! ${toCreate.length} created, ${toSkip.length} skipped.`);
  console.log('\nNext steps:');
  console.log('  1. Review generated tests');
  console.log('  2. Implement actual test logic (replace TODO comments)');
  console.log('  3. Run: bun run scripts/run-tests.ts');
}

main();
