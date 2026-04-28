/**
 * Config Client Library
 * 
 * Simple API for skills and MCPs to access configuration.
 * Provides caching with TTL and fallback defaults.
 * 
 * Usage:
 * ```typescript
 * import { ConfigClient } from './config-client'
 * 
 * const config = new ConfigClient()
 * const threshold = await config.get('Soter.RiskThreshold')
 * ```
 */

import { EventEmitter } from 'events';

export interface ConfigClientOptions {
  /** MCP server endpoint (for future HTTP support) */
  endpoint?: string;
  /** Cache TTL in milliseconds */
  cacheTTL?: number;
  /** Enable caching */
  enableCache?: boolean;
  /** Fallback defaults if MCP unavailable */
  defaults?: Record<string, unknown>;
}

export interface ConfigCacheEntry {
  value: unknown;
  timestamp: number;
  path: string;
}

export interface ConfigGetResult {
  value: unknown;
  path: string;
  fromCache: boolean;
  masked: boolean;
}

export interface ConfigValidateResult {
  valid: boolean;
  errors: string[];
  version?: number;
}

export interface ConfigReloadResult {
  success: boolean;
  error?: string;
  version?: number;
  timestamp?: string;
}

export class ConfigClient extends EventEmitter {
  private cache: Map<string, ConfigCacheEntry> = new Map();
  private cacheTTL: number;
  private enableCache: boolean;
  private defaults: Record<string, unknown>;
  private requestQueue: Array<() => void> = [];
  private processing: boolean = false;

  constructor(options: ConfigClientOptions = {}) {
    super();
    this.cacheTTL = options.cacheTTL ?? 30000; // 30 seconds default
    this.enableCache = options.enableCache ?? true;
    this.defaults = options.defaults ?? this.getDefaultDefaults();
  }

  /**
   * Get default fallback values
   */
  private getDefaultDefaults(): Record<string, unknown> {
    return {
      'Core.Name': 'Abraxas',
      'Core.Version': '1.0.0',
      'Core.Mode': 'sovereign',
      'Core.Timezone': 'MST',
      'Soter.Enabled': true,
      'Soter.RiskThreshold': 3,
      'Soter.PatternLibrary': 'default',
      'Soter.LedgerPath': '~/.abraxas/soter/safety-ledger.jsonl',
      'Soter.HumanReviewRequired': true,
      'Ethos.Enabled': true,
      'Ethos.DriftThreshold': 30,
      'Ethos.VoiceProfile': 'tyler-authentic',
      'Ethos.RestoreOnDrift': true,
      'Aletheia.Enabled': true,
      'Aletheia.LedgerPath': '~/.abraxas/aletheia/truth-ledger.jsonl',
      'Aletheia.ClaimVerification': 'strict',
      'Aletheia.CalibrationReviewDays': 90,
      'Ergon.Gate.Enabled': true,
      'Ergon.Gate.InterceptTools': true,
      'Ergon.Gate.LogAllRequests': true,
      'Ergon.Routing.DefaultTarget': 'main',
      'Ergon.Routing.FallbackTarget': 'fallback',
      'Infrastructure.Timeouts.MCPRequest': 30,
      'Infrastructure.Timeouts.ToolExecution': 300,
      'Infrastructure.Timeouts.Subagent': 900,
      'Infrastructure.Limits.MaxConcurrentSubagents': 10,
      'Infrastructure.Limits.MaxHeartbeatsPerDay': 48,
      'Infrastructure.Limits.MaxConfigGetsPerMinute': 100,
      'Logging.Level': 'info',
      'Logging.Format': 'json',
      'Logging.Output': 'file',
      'Logging.Path': '~/.abraxas/logs/abraxas.log'
    };
  }

  /**
   * Get a config value by dot-notation path
   * 
   * @param path - Dot-notation path (e.g., 'Soter.RiskThreshold')
   * @param useCache - Override default cache behavior
   * @returns Config value
   */
  async get(path: string, useCache?: boolean): Promise<unknown> {
    const shouldUseCache = useCache ?? this.enableCache;
    
    // Check cache first
    if (shouldUseCache) {
      const cached = this.getCached(path);
      if (cached !== undefined) {
        this.emit('cache-hit', { path, value: cached });
        return cached;
      }
      this.emit('cache-miss', { path });
    }

    // Fetch from MCP server
    try {
      const value = await this.fetchFromMCP(path);
      
      // Cache the result
      if (shouldUseCache) {
        this.setCache(path, value);
      }
      
      return value;
    } catch (error) {
      // Fall back to defaults
      const defaultValue = this.get_default(path);
      if (defaultValue !== undefined) {
        this.emit('fallback', { path, error, defaultValue });
        return defaultValue;
      }
      
      // No default available, rethrow error
      throw error;
    }
  }

  /**
   * Get a config section
   * 
   * @param section - Section name (e.g., 'Soter', 'Ethos')
   * @returns Section config object
   */
  async getSection(section: string): Promise<unknown> {
    return this.callMCP('config.getSection', { section });
  }

  /**
   * Get entire configuration (masked)
   * 
   * @returns Full config object with secrets masked
   */
  async getAll(): Promise<Record<string, unknown>> {
    const result = await this.callMCP('config.getAll', {});
    return result as Record<string, unknown>;
  }

  /**
   * Validate current configuration
   * 
   * @returns Validation result
   */
  async validate(): Promise<ConfigValidateResult> {
    const result = await this.callMCP('config.validate', {});
    return result as ConfigValidateResult;
  }

  /**
   * Force reload configuration from file
   * 
   * @returns Reload result
   */
  async reload(): Promise<ConfigReloadResult> {
    // Clear cache on reload
    this.cache.clear();
    this.emit('cache-cleared');
    
    const result = await this.callMCP('config.reload', {});
    return result as ConfigReloadResult;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache-cleared');
  }

  /**
   * Get cached value if not expired
   */
  private getCached(path: string): unknown {
    const entry = this.cache.get(path);
    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.cacheTTL) {
      this.cache.delete(path);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set cache entry
   */
  private setCache(path: string, value: unknown): void {
    this.cache.set(path, {
      value,
      timestamp: Date.now(),
      path
    });
  }

  /**
   * Get default value for a path
   */
  private get_default(path: string): unknown {
    return this.defaults[path];
  }

  /**
   * Fetch value from MCP server
   * 
   * This is a placeholder - in production, this would make an actual MCP call.
   * For now, it falls back to defaults immediately.
   */
  private async fetchFromMCP(path: string): Promise<unknown> {
    // Placeholder for actual MCP integration
    // In production, this would:
    // 1. Make MCP tool call to config-registry server
    // 2. Parse response
    // 3. Return value
    
    // For now, throw to trigger fallback
    throw new Error('MCP server not connected (using defaults)');
  }

  /**
   * Call MCP tool
   */
  private async callMCP(tool: string, args: Record<string, unknown>): Promise<unknown> {
    // Placeholder for actual MCP integration
    throw new Error(`MCP server not connected (tool: ${tool})`);
  }

  /**
   * Queue a request for batch processing
   */
  queueRequest(fn: () => void): void {
    this.requestQueue.push(fn);
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;
    
    try {
      // Process all queued requests
      while (this.requestQueue.length > 0) {
        const fn = this.requestQueue.shift();
        if (fn) {
          fn();
        }
      }
    } finally {
      this.processing = false;
    }
  }
}

/**
 * Create a config client instance
 */
export function createConfigClient(options?: ConfigClientOptions): ConfigClient {
  return new ConfigClient(options);
}

// Export singleton instance for convenience
export const config = new ConfigClient();
