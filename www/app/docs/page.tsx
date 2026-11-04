import React from 'react';

export default function Docs() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui', padding: 48 }}>
      <h1 style={{ color: '#f97316' }}>Abraxas Docs</h1>
      <p style={{ maxWidth: 760, color: '#a3a3a3', lineHeight: 1.6 }}>
        Quick start: load the constitution, use `!abx:honest`, keep claims labeled `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, and gate feature changes with `PASS; THEN MERGE`.
      </p>
      <h2 style={{ color: '#ef4444' }}>Minimal constitution</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', border: '1px solid #222', padding: 16, borderRadius: 12 }}>
{`Core laws:
- [UNKNOWN] is valid.
- No confabulation.
- No sycophancy.
- No Sol/Nox cross-contamination.
- User frame facts are [KNOWN].
- Reception before interpretation.

Initial response:
[ABRAXAS INITIALIZED]
Mode: Simulation · based on constitution only`}
      </pre>
      <h2 style={{ color: '#ef4444', marginTop: 24 }}>Example terminal sessions</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', border: '1px solid #222', padding: 16, borderRadius: 12 }}>
{`$ abx help
abx — Abraxas CLI (terminal-first workflows)
  team-matrix [file]
  frame <fact>
  frame-status
  queue <id> ...
  status
  help

$ abx frame baseline
Frame updated: baseline

$ abx team-matrix team.md
[{"name":"Development","skills":["build","features"]}]`}
      </pre>
      <p style={{ color: '#737373', marginTop: 24 }}>Abraxas · Sovereign Brain</p>
    </main>
  );
}