import React from 'react';

export default function SettingsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui', padding: 48 }}>
      <h1 style={{ color: '#f97316' }}>Abraxas Settings</h1>
      <p style={{ color: '#a3a3a3' }}>Load bare-minimum constitution and import NDJSON PEF to populate a local knowledge graph (zero KNOWNs baseline until a real .abraxas file is imported).</p>
    </main>
  );
}