import React from 'react';

export default function Home() {
  return (
    <main style={{ background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 48px', borderBottom: '1px solid #222' }}>
        <div style={{ fontWeight: 700, color: '#f97316' }}>ABRAXAS</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
          <a href="#features" style={{ color: '#fafafa', textDecoration: 'none' }}> Features</a>
          <a href="#docs" style={{ color: '#fafafa', textDecoration: 'none' }}>Docs</a>
          <a href="#contact" style={{ color: '#fafafa', textDecoration: 'none' }}>Contact</a>
        </div>
      </nav>
      <section style={{ textAlign: 'center', padding: '96px 24px' }}>
        <h1 style={{ fontSize: 56, margin: 0, lineHeight: 1.08, background: 'linear-gradient(90deg,#f97316,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Abraxas Sovereign Brain
        </h1>
        <p style={{ maxWidth: 760, margin: '24px auto 0', color: '#a3a3a3', fontSize: 18, lineHeight: 1.6 }}>
          Sovereign epistemic AI. Clear labels, transparent uncertainty, grounded truth trails, and simulation-safe tools for development, operations, and knowledge work.
        </p>
      </section>
      <section id="features" style={{ padding: '24px 48px 48px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {['Epistemic labels', 'Anti-sycophancy', 'Sovereign mode', 'Memory graph', 'ABQ/Abl logic', 'CVP gates'].map((title) => (
          <div key={title} style={{ background: '#111', border: '1px solid #232323', borderRadius: 18, padding: 24 }}>
            <h3 style={{ margin: 0, color: '#f97316' }}>{title}</h3>
            <p style={{ color: '#9e9e9e', lineHeight: 1.6 }}>Abraxas ships with transparent, auditable reasoning surfaces and safe runtime behavior.</p>
          </div>
        ))}
      </section>
      <section id="docs" style={{ padding: '48px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ margin: 0, color: '#ef4444' }}>Try Abraxas</h2>
        <ul style={{ color: '#a3a3a3', lineHeight: 1.9 }}>
          <li>Move from vague output to labeled claims and explicit unknowns.</li>
          <li>Use /honest framing and constitution constraints as defaults.</li>
          <li>Build reproducible tests + provenance before merge.</li>
        </ul>
      </section>
      <footer id="contact" style={{ padding: 24, color: '#525252', borderTop: '1px solid #1f1f1f', textAlign: 'center', fontSize: 14 }}>
        Abraxas · Sovereign Brain
      </footer>
    </main>
  );
}