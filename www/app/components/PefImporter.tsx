'use client';
import React, { useState } from 'react';

const seeded = { format: 'pef', exportedBy: 'Tyler Garlick', source: 'Abraxas Cloud', entries: [{ id: 'claim-1', label: '[KNOWN]', state: 'UNVERIFIED' }], createdAt: new Date().toISOString() };

export default function PefImporter() {
  const [text, setText] = useState(JSON.stringify(seeded, null, 2));
  const [status, setStatus] = useState('idle');
  const [parsed, setParsed] = useState<any>(null);

  const importNow = () => {
    try {
      const obj = JSON.parse(text);
      localStorage.setItem('abraxas_imported_pef', JSON.stringify(obj));
      setParsed(obj);
      setStatus(`Imported ${Array.isArray(obj.entries) ? obj.entries.length : 0} entries (${obj.source || 'unknown source'})`);
    } catch (e) {
      setStatus('Invalid JSON — paste full PEF export.');
    }
  };

  return (
    <div style={{ background: '#050505', border: '1px solid #232323', borderRadius: 12, padding: 16, marginTop: 16 }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', height: 180, background: '#111', color: '#a3e635', border: '1px solid #333', borderRadius: 8, padding: 12, fontFamily: 'monospace' }} />
      <button style={{ marginTop: 8, background: '#f97316', color: '#000', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }} onClick={importNow}>Import PEF</button>
      <p style={{ color: '#737373', marginTop: 8 }}>Status: {status}</p>
      {parsed && <pre style={{ whiteSpace: 'pre-wrap', color: '#c2c2c2', marginTop: 8, background: '#111', padding: 12, borderRadius: 8 }}>{JSON.stringify(parsed.entries ? parsed.entries : parsed, null, 2)}</pre>}
      <p style={{ color: '#737373' }}>PEF export parser is simulated on this browser — no backend call.</p>
    </div>
  );
}