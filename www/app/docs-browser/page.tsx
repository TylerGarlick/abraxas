'use client';
import React, { useState } from 'react';

const DOCS = [
  { title: 'Memory Graph Commands', text: 'documents /memory-graph-aim and graph K/U persistence (Set-of-Sets)', link: 'https://github.com/TylerGarlick/abraxas/blob/main/docs/memory-graph-aim-commands.md' },
  { title: 'Team Matrix', text: 'XP roles, skill bindings, gates, simulation matrix and run workflows.', link: 'https://github.com/TylerGarlick/abraxas/blob/main/docs/team-matrix.md' },
  { title: 'P2P Transport', text: 'libp2p named nodes, guarded scaffold and named routing.', link: 'https://github.com/TylerGarlick/abraxas/blob/main/P2P-Transport.md' },
  { title: 'CVP Verification', text: 'cross-model verification, truth-net anchoring, mm-cmv.', link: 'https://github.com/TylerGarlick/abraxas/blob/main/docs/verification/multimodal-verification.md' },
];

export default function DocsBrowser() {
  const [q, setQ] = useState('');
  const filtered = q.trim() ? DOCS.filter(d => `${d.title} ${d.text}`.toLowerCase().includes(q.toLowerCase())) : DOCS.slice(0, 8);

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui', padding: 48 }}>
      <h1 style={{ color: '#f97316' }}>Abraxas Docs Browser</h1>
      <p style={{ color: '#a3a3a3', maxWidth: 760 }}>Plain-text searchable docs index (links to the Abraxas GitHub docs).</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search docs..." style={{ width: '70%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: 10 }} />
      <button style={{ marginLeft: 8, background: '#f97316', color: '#000', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }} onClick={() => setQ('')}>Clear</button>
      <div style={{ marginTop: 16 }}>
        {filtered.map((doc) => (
          <div key={doc.title} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <a href={doc.link} style={{ color: '#fff', textDecoration: 'none' }}>
              <strong style={{ color: '#f97316' }}>{doc.title}</strong>
            </a>
            <p style={{ color: '#737373', margin: '8px 0 0', lineHeight: 1.5 }}>{doc.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}