import React from 'react';
import TerminalPlayground from '../components/TerminalPlayground';

export default function Docs() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui', padding: 48 }}>
      <h1 style={{ color: '#f97316' }}>Abraxas Docs + Terminal Playground</h1>
      <TerminalPlayground />
      <section style={{ maxWidth: 900, lineHeight: 1.7, color: '#c2c2c2', marginTop: 28 }}>
        <h2 style={{ color: '#ef4444' }}>Minimal constitution</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#111', border: '1px solid #222', padding: 16, borderRadius: 12 }}>
{`Core laws:
- [UNKNOWN] is valid.
- No confabulation.
- No sycophancy.
- No Sol/Nox cross-contamination.
- User frame facts are [KNOWN].
- Reception before interpretation.
- [UNKNOWN] is valid.

Initial response:
[ABRAXAS INITIALIZED]
Mode: Simulation · based on constitution only`}
        </pre>
      </section>
    </main>
  );
}