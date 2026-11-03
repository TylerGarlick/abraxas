import { describe, it, expect } from 'bun:test';
import { spawn } from 'node:child_process';

describe('abx cli', () => {
  it('help runs', async () => {
    const proc = spawn('bun', ['run', './cli/src/cli.ts', 'help'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    proc.stdout?.on('data', (d) => (out += String(d)));
    await new Promise((r) => proc.on('exit', r as any));
    expect(out).toContain('abx — Abraxas CLI');
  });
});
