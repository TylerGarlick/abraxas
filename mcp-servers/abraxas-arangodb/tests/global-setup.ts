/**
 * Global test setup - spins up ArangoDB for integration/E2E tests
 */

import { execSync, spawn } from 'child_process';

const ARANGO_CONTAINER_NAME = 'mcp-arangodb-test';

export default async function globalSetup() {
  const isCI = process.env.CI === 'true';
  
  // Only spin up docker for integration/e2e tests if not in CI with existing infra
  if (isCI) {
    console.log('CI detected, skipping docker setup');
    return;
  }
  
  console.log('Setting up test environment...');
  
  // Check if docker is available
  try {
    execSync('docker --version', { stdio: 'ignore' });
  } catch {
    console.log('Docker not available, skipping container setup');
    return;
  }
  
  // Stop any existing test container
  try {
    execSync(`docker stop ${ARANGO_CONTAINER_NAME}`, { stdio: 'ignore' });
    execSync(`docker rm ${ARANGO_CONTAINER_NAME}`, { stdio: 'ignore' });
  } catch {
    // Container might not exist, that's fine
  }
  
  // Start ArangoDB container
  console.log('Starting ArangoDB container...');
  
  const container = spawn('docker', [
    'run',
    '--name', ARANGO_CONTAINER_NAME,
    '-e', 'ARANGO_ROOT_PASSWORD=password',
    '-p', '8529:8529',
    '-d',
    'arangodb:latest',
  ]);
  
  // Wait for container to be ready
  await new Promise<void>((resolve, reject) => {
    let output = '';
    
    container.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    container.stderr?.on('data', (data) => {
      output += data.toString();
    });
    
    container.on('error', reject);
    container.on('close', (code) => {
      if (code !== 0) {
        console.log('Container startup output:', output);
        reject(new Error(`Container exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
  
  // Wait for ArangoDB to be healthy
  console.log('Waiting for ArangoDB to be healthy...');
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const result = execSync(
        'docker exec mcp-arangodb-test arangosh --server.password= --eval "return true"',
        { stdio: 'ignore' }
      );
      if (result.toString().includes('true')) {
        console.log('ArangoDB is ready!');
        return;
      }
    } catch {
      // Not ready yet
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('ArangoDB failed to become healthy within timeout');
}
