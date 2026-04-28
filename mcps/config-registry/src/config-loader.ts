/**
 * Config Loader - YAML loading, validation, and caching
 * 
 * Handles loading SOVEREIGN_CONFIG.yaml, validating against Zod schemas,
 * and maintaining an in-memory cache with version tracking.
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { EventEmitter } from 'events';
import { SovereignConfig, ValidationResult, validateConfig } from './schema';

export interface ConfigLoadResult {
  success: boolean;
  config?: SovereignConfig;
  version: number;
  error?: string;
  timestamp: string;
}

export interface ConfigLoaderOptions {
  configPath: string;
  validateOnLoad?: boolean;
}

export class ConfigLoader extends EventEmitter {
  private configPath: string;
  private validateOnLoad: boolean;
  private cache: SovereignConfig | null = null;
  private version: number = 0;
  private lastLoadTime: string | null = null;
  private loadError: string | null = null;

  constructor(options: ConfigLoaderOptions) {
    super();
    this.configPath = options.configPath;
    this.validateOnLoad = options.validateOnLoad ?? true;
  }

  /**
   * Get current config version
   */
  getVersion(): number {
    return this.version;
  }

  /**
   * Get last successful load timestamp
   */
  getLastLoadTime(): string | null {
    return this.lastLoadTime;
  }

  /**
   * Check if config is loaded and valid
   */
  isReady(): boolean {
    return this.cache !== null && this.loadError === null;
  }

  /**
   * Get current cached config
   */
  getConfig(): SovereignConfig | null {
    return this.cache;
  }

  /**
   * Get current load error (if any)
   */
  getError(): string | null {
    return this.loadError;
  }

  /**
   * Load config from file
   */
  load(): ConfigLoadResult {
    const timestamp = new Date().toISOString();
    
    try {
      // Check file exists
      if (!fs.existsSync(this.configPath)) {
        const error = `Config file not found: ${this.configPath}`;
        this.loadError = error;
        this.emit('error', { error, timestamp });
        return { success: false, version: this.version, error, timestamp };
      }

      // Read file
      const fileContent = fs.readFileSync(this.configPath, 'utf8');
      
      // Parse YAML
      const parsed = yaml.load(fileContent) as unknown;
      
      // Validate if enabled
      if (this.validateOnLoad) {
        const validation = validateConfig(parsed);
        
        if (!validation.valid) {
          const error = `Config validation failed: ${validation.errors.join('; ')}`;
          this.loadError = error;
          this.emit('validation-error', { errors: validation.errors, timestamp });
          return { success: false, version: this.version, error, timestamp };
        }
        
        // Update cache with validated config
        this.cache = validation.config ?? null;
      } else {
        // Skip validation, just cast
        this.cache = parsed as SovereignConfig;
      }

      // Update state
      this.version++;
      this.lastLoadTime = timestamp;
      this.loadError = null;
      
      this.emit('load', { version: this.version, timestamp });
      
      return {
        success: true,
        config: this.cache ?? undefined,
        version: this.version,
        timestamp
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.loadError = errorMessage;
      this.emit('error', { error: errorMessage, timestamp });
      
      return {
        success: false,
        version: this.version,
        error: errorMessage,
        timestamp
      };
    }
  }

  /**
   * Reload config from file (alias for load)
   */
  reload(): ConfigLoadResult {
    return this.load();
  }

  /**
   * Get config value by dot-notation path
   * Example: 'Soter.RiskThreshold' -> 3
   */
  getValue(path: string): unknown {
    if (!this.cache) {
      throw new Error('Config not loaded');
    }

    const keys = path.split('.');
    let current: unknown = this.cache;

    for (const key of keys) {
      if (typeof current !== 'object' || current === null) {
        throw new Error(`Path not found: ${path} (stopped at ${key})`);
      }

      current = (current as Record<string, unknown>)[key];
      
      if (current === undefined) {
        throw new Error(`Path not found: ${path}`);
      }
    }

    return current;
  }

  /**
   * Get entire config section
   */
  getSection(section: string): unknown {
    return this.getValue(section);
  }

  /**
   * Get entire config object
   */
  getAll(): SovereignConfig | null {
    return this.cache;
  }
}

/**
 * Create a config loader instance
 */
export function createConfigLoader(options: ConfigLoaderOptions): ConfigLoader {
  return new ConfigLoader(options);
}
