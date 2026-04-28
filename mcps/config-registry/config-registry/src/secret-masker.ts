/**
 * Secret Masker - Protect sensitive configuration values
 * 
 * Masks secrets, tokens, keys, and passwords in config objects
 * to prevent accidental exposure via config.getAll() or logging.
 */

export interface MaskResult {
  config: unknown;
  maskedKeys: string[];
}

/**
 * Patterns that indicate sensitive values
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  /token/i,
  /secret/i,
  /key/i,
  /password/i,
  /passwd/i,
  /credential/i,
  /auth/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /bearer/i
];

/**
 * Check if a key name suggests sensitive data
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Check if a value looks like a secret (even if key name doesn't suggest it)
 */
function isSensitiveValue(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  // Check for common secret patterns
  const secretPatterns: RegExp[] = [
    /^[A-Za-z0-9+/=]{32,}$/,  // Base64-encoded data
    /^sk_[A-Za-z0-9]{20,}$/,  // OpenAI-style API keys
    /^ghp_[A-Za-z0-9]{36}$/,  // GitHub personal access tokens
    /^xox[baprs]-[A-Za-z0-9-]+$/,  // Slack tokens
    /[A-Za-z0-9]{40,}/,  // Long alphanumeric strings
  ];

  // Check if value matches any secret pattern
  if (secretPatterns.some(pattern => pattern.test(value))) {
    return true;
  }

  // Check if value looks like a path containing secrets
  if (value.includes('secret') || value.includes('token') || value.includes('key')) {
    // But only if it's not just a path description
    const pathSegments = value.split('/');
    return pathSegments.some(segment => isSensitiveKey(segment));
  }

  return false;
}

/**
 * Mask a value
 */
function maskValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return '[MASKED]';
  }
  if (typeof value === 'number') {
    return '[MASKED]';
  }
  if (typeof value === 'boolean') {
    return '[MASKED]';
  }
  return value;
}

/**
 * Deep clone an object
 */
function deepClone(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const cloned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    cloned[key] = deepClone(value);
  }
  return cloned;
}

/**
 * Mask sensitive values in a config object
 * 
 * @param config - The config object to mask
 * @param pathPrefix - Current path for tracking (used in recursion)
 * @param maskedKeys - Array to collect masked key paths (used in recursion)
 * @returns Masked config and list of masked key paths
 */
export function maskSecrets(
  config: unknown,
  pathPrefix: string = '',
  maskedKeys: string[] = []
): MaskResult {
  const cloned = deepClone(config);
  
  function maskRecursive(obj: unknown, currentPath: string): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        maskRecursive(item, `${currentPath}[${index}]`)
      );
    }

    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const keyPath = currentPath ? `${currentPath}.${key}` : key;
      
      // Check if key name suggests sensitive data
      if (isSensitiveKey(key)) {
        result[key] = maskValue(value);
        maskedKeys.push(keyPath);
      } 
      // Check if value looks like a secret
      else if (isSensitiveValue(value)) {
        result[key] = maskValue(value);
        maskedKeys.push(keyPath);
      }
      // Recurse into nested objects
      else if (typeof value === 'object' && value !== null) {
        result[key] = maskRecursive(value, keyPath);
      }
      // Keep non-sensitive values as-is
      else {
        result[key] = value;
      }
    }

    return result;
  }

  const maskedConfig = maskRecursive(cloned, pathPrefix);
  
  return {
    config: maskedConfig,
    maskedKeys
  };
}

/**
 * Check if a specific path should be masked
 */
export function shouldMask(path: string): boolean {
  const keys = path.split('.');
  return keys.some(key => isSensitiveKey(key));
}

/**
 * Mask a single value if its path suggests it's sensitive
 */
export function maskValueAtPath(value: unknown, path: string): unknown {
  if (shouldMask(path)) {
    return maskValue(value);
  }
  return value;
}
