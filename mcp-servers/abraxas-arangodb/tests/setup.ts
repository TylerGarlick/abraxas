/**
 * Test setup file
 */

// Set test environment variables
process.env.ARANGO_HOST = 'http://localhost:8529';
process.env.ARANGO_PASSWORD = 'password';
process.env.NODE_ENV = 'test';

// Increase test timeout
jest.setTimeout(30000);

// Mock console.error to reduce noise during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});
