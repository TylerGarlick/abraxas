import { describe, it, expect } from 'bun:test';
import { loadConstitution, CANONICAL_VERSIONS } from '../src/constitution-loader';

describe('constitution loader', () => {
  it('loads default genesis as canonical', () => {
    const result = loadConstitution();
    expect(result.selectedVersion).toBe('genesis');
    expect(result.status).toBe('known');
  });

  it('promotes 4.5.0 to canonical on load', () => {
    const result = loadConstitution('4.5.0');
    expect(result.selectedVersion).toBe('4.5.0');
    expect(result.status).toBe('known');
    expect(CANONICAL_VERSIONS.has('4.5.0')).toBe(true);
  });

  it('promotes 5.0.0 to canonical on load', () => {
    const result = loadConstitution('5.0.0');
    expect(result.selectedVersion).toBe('5.0.0');
    expect(result.status).toBe('known');
    expect(CANONICAL_VERSIONS.has('5.0.0')).toBe(true);
  });

  it('treats any requested version as canonical', () => {
    const result = loadConstitution('7.0.0');
    expect(result.selectedVersion).toBe('7.0.0');
    expect(result.status).toBe('known');
  });
});