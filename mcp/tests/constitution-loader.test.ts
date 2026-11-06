import { describe, it, expect } from 'bun:test';
import { loadConstitution } from '../src/constitution-loader';

describe('constitution loader', () => {
  it('loads canonical 4.5 only for current', () => {
    const result = loadConstitution('4.5.0');
    expect(result.selectedVersion).toBe('4.5.0');
    expect(result.status).toBe('known');
  });

  it('simulates next 5.0.0 without promotion', () => {
    const result = loadConstitution('5.0.0');
    expect(result.selectedVersion).toBe('4.5.0');
    expect(result.status).toBe('simulated');
    expect(result.notes.toLowerCase()).toContain('non-canonical');
  });
});
