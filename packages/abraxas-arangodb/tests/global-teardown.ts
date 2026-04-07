/**
 * Global test teardown - cleans up test containers
 */

import { execSync } from 'child_process';

const ARANGO_CONTAINER_NAME = 'mcp-arangodb-test';

export default async function globalTeardown() {
  const isCI = process.env.CI === 'true';
  
  if (isCI) {
    return;
  }
  
  console.log('Cleaning up test environment...');
  
  try {
    execSync(`docker stop ${ARANGO_CONTAINER_NAME}`, { stdio: 'ignore' });
    execSync(`docker rm ${ARANGO_CONTAINER_NAME}`, { stdio: 'ignore' });
    console.log('Test container cleaned up');
  } catch {
    // Container might not exist
  }
}
