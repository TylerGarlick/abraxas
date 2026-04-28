/**
 * Secret Masker Tests
 */

import { maskSecrets, shouldMask, maskValueAtPath } from '../src/secret-masker';

describe('maskSecrets', () => {
  it('should mask sensitive keys', () => {
    const config = {
      Database: {
        Host: 'localhost',
        Port: 5432,
        Password: 'secret123'
      }
    };

    const result = maskSecrets(config);
    
    expect(result.maskedKeys).toContain('Database.Password');
    expect((result.config as any).Database.Password).toBe('[MASKED]');
    expect((result.config as any).Database.Host).toBe('localhost');
  });

  it('should mask API keys', () => {
    const config = {
      Skills: {
        ImageGen: {
          ApiKey: 'sk_abcdef123456'
        }
      }
    };

    const result = maskSecrets(config);
    
    expect(result.maskedKeys).toContain('Skills.ImageGen.ApiKey');
    expect((result.config as any).Skills.ImageGen.ApiKey).toBe('[MASKED]');
  });

  it('should mask tokens', () => {
    const config = {
      Auth: {
        AccessToken: 'token123',
        RefreshToken: 'refresh456'
      }
    };

    const result = maskSecrets(config);
    
    // Auth key itself is not sensitive, but its children with Token in name are
    // The masker masks at the object level when it detects sensitive children
    expect((result.config as any).Auth.AccessToken).toBe('[MASKED]');
    expect((result.config as any).Auth.RefreshToken).toBe('[MASKED]');
  });

  it('should mask secrets in nested objects', () => {
    const config = {
      Core: { Name: 'Abraxas' },
      Skills: {
        SecretsManager: {
          MasterKey: 'super-secret-key'
        }
      }
    };

    const result = maskSecrets(config);
    
    // SecretsManager key triggers masking of the entire object
    expect((result.config as any).Skills.SecretsManager.MasterKey).toBe('[MASKED]');
    expect((result.config as any).Core.Name).toBe('Abraxas');
  });

  it('should handle arrays', () => {
    const config = {
      ApiKeys: ['key1', 'key2', 'key3']
    };

    const result = maskSecrets(config);
    
    // Array values should not be masked unless key name suggests it
    expect(result.maskedKeys).toContain('ApiKeys');
    expect(Array.isArray((result.config as any).ApiKeys)).toBe(true);
  });

  it('should not mask non-sensitive values', () => {
    const config = {
      Core: {
        Name: 'Abraxas',
        Version: '1.0.0',
        Mode: 'sovereign'
      }
    };

    const result = maskSecrets(config);
    
    expect(result.maskedKeys).toHaveLength(0);
    expect((result.config as any).Core.Name).toBe('Abraxas');
    expect((result.config as any).Core.Version).toBe('1.0.0');
  });

  it('should detect Base64-encoded secrets', () => {
    const config = {
      Secret: 'SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IGJhc2U2NCBzdHJpbmc='
    };

    const result = maskSecrets(config);
    
    expect(result.maskedKeys).toContain('Secret');
    expect((result.config as any).Secret).toBe('[MASKED]');
  });

  it('should detect long alphanumeric strings as potential secrets', () => {
    const config = {
      Token: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ'
    };

    const result = maskSecrets(config);
    
    expect(result.maskedKeys).toContain('Token');
    expect((result.config as any).Token).toBe('[MASKED]');
  });
});

describe('shouldMask', () => {
  it('should return true for sensitive key names', () => {
    expect(shouldMask('Password')).toBe(true);
    expect(shouldMask('ApiKey')).toBe(true);
    expect(shouldMask('SecretKey')).toBe(true);
    expect(shouldMask('AuthToken')).toBe(true);
    expect(shouldMask('Credential')).toBe(true);
  });

  it('should return false for non-sensitive key names', () => {
    expect(shouldMask('Name')).toBe(false);
    expect(shouldMask('Version')).toBe(false);
    expect(shouldMask('Enabled')).toBe(false);
    expect(shouldMask('Path')).toBe(false);
  });

  it('should return true for nested paths with sensitive keys', () => {
    expect(shouldMask('Database.Password')).toBe(true);
    expect(shouldMask('Skills.SecretsManager.Token')).toBe(true);
  });
});

describe('maskValueAtPath', () => {
  it('should mask value if path is sensitive', () => {
    const result = maskValueAtPath('my-secret-value', 'Auth.Token');
    expect(result).toBe('[MASKED]');
  });

  it('should not mask value if path is not sensitive', () => {
    const result = maskValueAtPath('regular-value', 'Core.Name');
    expect(result).toBe('regular-value');
  });

  it('should mask numbers and booleans on sensitive paths', () => {
    expect(maskValueAtPath(12345, 'Secret.Port')).toBe('[MASKED]');
    expect(maskValueAtPath(true, 'Auth.Enabled')).toBe('[MASKED]');
  });
});
