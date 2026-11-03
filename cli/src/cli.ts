#!/usr/bin/env bun
import { parseTeamMatrix } from './team-matrix.ts';
import { readFileSync, writeFileSync } from 'node:fs';

type Frame = { facts: string[]; queue: string[] };
const STATE_FILE = process.env.ABX_STATE_FILE || '/tmp/scratchpad/abx-state.json';

function loadState(): Frame {
  try {
    const raw = readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(raw) as Frame;
  } catch {
    return { facts: [], queue: [] };
  }
}

function saveState(state: Frame): void {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function usage() {
  console.log(`
  A  B  R  A  X  A  S
  /\  /\  /\  /\  /\  /\  /\
 //  //  //  //  //  //  //
/  _/  _/  _/  _/  _/  _/  _/
`);
  console.log('abx — Abraxas CLI (terminal-first workflows)');
}

async function main() {
  const args = process.argv.slice(2);
  const [cmd, ...rest] = args;
  if (!cmd || cmd === 'help' || cmd === '--help') { usage(); return; }

  if (cmd === 'team-matrix') {
    const file = rest[0];
    if (!file) { console.error('usage: abx team-matrix <file>'); process.exit(2); }
    const fs = await import('node:fs/promises');
    const text = await fs.readFile(file, 'utf8');
    console.log(JSON.stringify(parseTeamMatrix(text), null, 2));
    return;
  }

  const state = loadState();
  if (cmd === 'frame') {
    state.facts.push(rest.join(' '));
    saveState(state);
    console.log('Frame updated:', state.facts.join(' | '));
    return;
  }

  if (cmd === 'frame-status') {
    console.log(JSON.stringify({ facts: state.facts }, null, 2));
    return;
  }

  if (cmd === 'queue') {
    if (rest.length === 0) { console.error('usage: abx queue <id> ...'); process.exit(2); }
    state.queue.push(...rest);
    saveState(state);
    console.log('queued', rest.length);
    return;
  }

  if (cmd === 'status') {
    console.log(JSON.stringify({ frame: { facts: state.facts }, queue: state.queue, progress: 'local-pending' }, null, 2));
    return;
  }

  console.error('unknown command: ' + cmd);
  process.exit(2);
}
void main();
