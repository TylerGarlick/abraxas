/**
 * Config Loader Tests
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ConfigLoader } from '../src/config-loader';
import { validateConfig } from '../src/schema';

const TEST_CONFIG_PATH = path.join(__dirname, 'test-config.yaml');

describe('ConfigLoader', () => {
  let loader: ConfigLoader;

  beforeEach(() => {
    // Create test config file
    const testConfig = {
      Core: {
        Name: 'TestAbraxas',
        Version: '1.0.0',
        Mode: 'simulation' as const,
        Timezone: 'UTC'
      },
      Soter: {
        Enabled: true,
        RiskThreshold: 3,
        PatternLibrary: 'default' as const,
        LedgerPath: '~/.abraxas/soter/test-ledger.jsonl',
        HumanReviewRequired: true
      },
      Ethos: {
        Enabled: true,
        DriftThreshold: 30,
        VoiceProfile: 'test-profile',
        RestoreOnDrift: true
      },
      Aletheia: {
        Enabled: true,
        LedgerPath: '~/.abraxas/aletheia/test-ledger.jsonl',
        ClaimVerification: 'strict' as const,
        CalibrationReviewDays: 90
      },
      Ergon: {
        Gate: {
          Enabled: true,
          InterceptTools: true,
          LogAllRequests: true
        },
        Routing: {
          DefaultTarget: 'main',
          FallbackTarget: 'fallback'
        }
      },
      Infrastructure: {
        Paths: {
          Workspace: '/tmp/test-workspace',
          Projects: '/tmp/test-projects',
          Skills: '/tmp/test-skills',
          Mcps: '/tmp/test-mcps'
        },
        Timeouts: {
          MCPRequest: 30,
          ToolExecution: 300,
          Subagent: 900
        },
        Limits: {
          MaxConcurrentSubagents: 5,
          MaxHeartbeatsPerDay: 24,
          MaxConfigGetsPerMinute: 50
        }
      },
      Logging: {
        Level: 'debug' as const,
        Format: 'json' as const,
        Output: 'stdout' as const,
        Path: '/tmp/test.log'
      }
    };

    fs.writeFileSync(TEST_CONFIG_PATH, yaml.dump(testConfig));
    loader = new ConfigLoader({ configPath: TEST_CONFIG_PATH });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_PATH)) {
      fs.unlinkSync(TEST_CONFIG_PATH);
    }
  });

  describe('load()', () => {
    it('should load valid config successfully', () => {
      const result = loader.load();
      
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.version).toBe(1);
      expect(loader.isReady()).toBe(true);
    });

    it('should fail when config file does not exist', () => {
      const badLoader = new ConfigLoader({ configPath: '/nonexistent/path.yaml' });
      
      // Add error handler to prevent unhandled error
      const errorHandler = jest.fn();
      badLoader.on('error', errorHandler);
      
      const result = badLoader.load();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should fail validation with invalid config', () => {
      // Write invalid config
      fs.writeFileSync(TEST_CONFIG_PATH, yaml.dump({ Invalid: 'config' }));
      const badLoader = new ConfigLoader({ configPath: TEST_CONFIG_PATH });
      const result = badLoader.load();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation failed');
    });
  });

  describe('getValue()', () => {
    beforeEach(() => {
      loader.load();
    });

    it('should get nested value by dot-notation path', () => {
      const value = loader.getValue('Soter.RiskThreshold');
      expect(value).toBe(3);
    });

    it('should get deeply nested value', () => {
      const value = loader.getValue('Infrastructure.Timeouts.MCPRequest');
      expect(value).toBe(30);
    });

    it('should throw error for invalid path', () => {
      expect(() => loader.getValue('Nonexistent.Key')).toThrow('Path not found');
    });
  });

  describe('getSection()', () => {
    beforeEach(() => {
      loader.load();
    });

    it('should get entire section', () => {
      const section = loader.getSection('Soter');
      expect(section).toBeDefined();
      expect((section as any).Enabled).toBe(true);
      expect((section as any).RiskThreshold).toBe(3);
    });
  });

  describe('reload()', () => {
    it('should reload config and increment version', () => {
      loader.load();
      expect(loader.getVersion()).toBe(1);

      // Modify config file
      const testConfig = {
        Core: { Name: 'Updated', Version: '2.0.0', Mode: 'sovereign', Timezone: 'MST' },
        Soter: { Enabled: true, RiskThreshold: 4, PatternLibrary: 'strict', LedgerPath: '~/.test', HumanReviewRequired: true },
        Ethos: { Enabled: true, DriftThreshold: 50, VoiceProfile: 'new', RestoreOnDrift: false },
        Aletheia: { Enabled: true, LedgerPath: '~/.test', ClaimVerification: 'relaxed', CalibrationReviewDays: 60 },
        Ergon: { Gate: { Enabled: true, InterceptTools: false, LogAllRequests: false }, Routing: { DefaultTarget: 'alt', FallbackTarget: 'backup' } },
        Infrastructure: { Paths: { Workspace: '/tmp', Projects: '/tmp', Skills: '/tmp', Mcps: '/tmp' }, Timeouts: { MCPRequest: 10, ToolExecution: 100, Subagent: 500 }, Limits: { MaxConcurrentSubagents: 3, MaxHeartbeatsPerDay: 12, MaxConfigGetsPerMinute: 25 } },
        Logging: { Level: 'info', Format: 'text', Output: 'file', Path: '/tmp/test2.log' }
      };
      fs.writeFileSync(TEST_CONFIG_PATH, yaml.dump(testConfig));

      const result = loader.reload();
      expect(result.success).toBe(true);
      expect(loader.getVersion()).toBe(2);
      expect(loader.getValue('Soter.RiskThreshold')).toBe(4);
    });
  });

  describe('events', () => {
    it('should emit load event', () => {
      const loadHandler = jest.fn();
      loader.on('load', loadHandler);
      loader.load();
      expect(loadHandler).toHaveBeenCalled();
    });

    it('should emit error event on failure', () => {
      const errorHandler = jest.fn();
      const badLoader = new ConfigLoader({ configPath: '/nonexistent.yaml' });
      badLoader.on('error', errorHandler);
      badLoader.load();
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});

describe('validateConfig', () => {
  it('should validate correct config', () => {
    const config = {
      Core: { Name: 'Test', Version: '1.0.0', Mode: 'sovereign', Timezone: 'UTC' },
      Soter: { Enabled: true, RiskThreshold: 3, PatternLibrary: 'default', LedgerPath: '~/.test', HumanReviewRequired: true },
      Ethos: { Enabled: true, DriftThreshold: 30, VoiceProfile: 'test', RestoreOnDrift: true },
      Aletheia: { Enabled: true, LedgerPath: '~/.test', ClaimVerification: 'strict', CalibrationReviewDays: 90 },
      Ergon: { Gate: { Enabled: true, InterceptTools: true, LogAllRequests: true }, Routing: { DefaultTarget: 'main', FallbackTarget: 'fallback' } },
      Infrastructure: { Paths: { Workspace: '/tmp', Projects: '/tmp', Skills: '/tmp', Mcps: '/tmp' }, Timeouts: { MCPRequest: 30, ToolExecution: 300, Subagent: 900 }, Limits: { MaxConcurrentSubagents: 10, MaxHeartbeatsPerDay: 48, MaxConfigGetsPerMinute: 100 } },
      Logging: { Level: 'info', Format: 'json', Output: 'file', Path: '/tmp.log' }
    };

    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid config', () => {
    const config = { Invalid: 'config' };
    const result = validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject out-of-range RiskThreshold', () => {
    const config = {
      Core: { Name: 'Test', Version: '1.0.0', Mode: 'sovereign', Timezone: 'UTC' },
      Soter: { Enabled: true, RiskThreshold: 10, PatternLibrary: 'default', LedgerPath: '~/.test', HumanReviewRequired: true },
      Ethos: { Enabled: true, DriftThreshold: 30, VoiceProfile: 'test', RestoreOnDrift: true },
      Aletheia: { Enabled: true, LedgerPath: '~/.test', ClaimVerification: 'strict', CalibrationReviewDays: 90 },
      Ergon: { Gate: { Enabled: true, InterceptTools: true, LogAllRequests: true }, Routing: { DefaultTarget: 'main', FallbackTarget: 'fallback' } },
      Infrastructure: { Paths: { Workspace: '/tmp', Projects: '/tmp', Skills: '/tmp', Mcps: '/tmp' }, Timeouts: { MCPRequest: 30, ToolExecution: 300, Subagent: 900 }, Limits: { MaxConcurrentSubagents: 10, MaxHeartbeatsPerDay: 48, MaxConfigGetsPerMinute: 100 } },
      Logging: { Level: 'info', Format: 'json', Output: 'file', Path: '/tmp.log' }
    };

    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Soter.RiskThreshold'))).toBe(true);
  });
});
