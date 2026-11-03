import { describe, it, expect } from 'bun:test';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';

describe('CLI commands', () => {
  const environmental = { ...process.env, HOME: process.env.HOME, ABX_STATE_FILE: '/tmp/scratchpad/cli-commands.json' };

  async function run(...args: string[]) {
    await fs.rm(environmental.ABX_STATE_FILE, { force: true });
    return new Promise<{ code: number; out: string }>((resolve) => {
      const p = spawn('bun', ['run', './cli/src/cli.ts', ...args], { env: environmental, stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      p.stdout?.on('data', (d) => (out += String(d)));
      p.on('exit', (code) => resolve({ code: code ?? 0, out }));
    });
  }

  it('team-matrix works', async () => {
    const f = '/tmp/scratchpad/cli-cmd-fixture.md';
    await fs.writeFile(f, '## Core Teams\n- **Dev**: abraxas/x\n', 'utf8');
    const r = await run('team-matrix', f);
    expect(r.code).toBe(0);
  });

  it('frame works', async () => {
    const r = await run('frame', 'Rationale ABC');
    expect(r.code).toBe(0);
  });

  it('frame-status works', async () => {
    const r = await run('frame-status');
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out)).toBeDefined();
  });

  it('queue works', async () => {
    const r = await run('queue', 'one', 'two');
    expect(r.code).toBe(0);
  });

  it('status works', async () => {
    const r = await run('status');
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out).progress).toBe('local-pending');
  });

  it('unknown command fails', async () => {
    const r = await run('unknown-wtf');
    expect(r.code).not.toBe(0);
  });
});
