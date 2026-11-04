import React from 'react';
import PefImporter from '../components/PefImporter';

export default function ConsolePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui', padding: 48 }}>
      <h1 style={{ color: '#f97316' }}>Abraxas Console (Simulated)</h1>
      <p style={{ color: '#a3a3a3' }}>Terminal-first simulated Abraxas environment; all commands are illustrative only and PEF exports are generated.</p>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: 16, borderRadius: 12, border: '1px solid #222', color: '#a3e635' }}>
{`$ abx namespace show genesis
Namespace: have consensus_count and run CVP consensus-only via !abx:cvp.
$ abx help
See docs /docs for docs browser.`}
      </pre>
      <PefImporter />
    </main>
  );
}