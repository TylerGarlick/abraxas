/**
 * Unit tests for logger
 */

import { logger, LogLevel } from '../../src/logger';

describe('Logger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
  
  describe('debug', () => {
    it('should not log at INFO level (default)', () => {
      // At INFO level, debug messages are suppressed
      logger.debug('test message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('info', () => {
    it('should log info messages', () => {
      logger.info('test message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('INFO');
    });
  });
  
  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('test message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('WARN');
    });
  });
  
  describe('error', () => {
    it('should log error messages', () => {
      logger.error('test message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('ERROR');
    });
    
    it('should include error object if provided', () => {
      const error = new Error('test error');
      logger.error('operation failed', { error: error.message });
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('operation failed');
    });
  });
  
  it('should include ISO timestamp', () => {
    logger.info('test');
    const output = consoleErrorSpy.mock.calls[0][0];
    // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
    expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
