import React from 'react';

export default function Docs() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui', padding: 48 }}>
      <h1 style={{ color: '#f97316' }}>Abraxas Docs</h1>
      <p style={{ maxWidth: 760, color: '#a3a3a3', lineHeight: 1.6 }}>
        Quick start: load the constitution, use `!abx:honest`, keep claims labeled `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, and gate feature changes with `PASS; THEN MERGE`.
      </p>
      <h2 style={{ color: '#ef4444' }}>Core commands</h2>
      <ul style={{ color: '#d4d4d4', lineHeight: 1.9 }}>
        <li>`/frame` — set baseline</li>
        <li>`/check` — fact-check with labels</li>
        <li>`/honest` — force labeled output</li>
        <li>`/agon` — adversarial debate</li>
        <li>`/cvp` — consensus gating</li>
        <li>`/guardrail` — final veto</li>
      </ul>
      <p style={{ color: '#737373', marginTop: 24 }}>Abraxas · Sovereign Brain</p>
    </main>
  );
}