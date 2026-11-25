import React from 'react';
import PefImporter from '../components/PefImporter';

export default function PefImporterPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#fafafa', fontFamily:'system-ui, sans-serif', padding:48 }}>
      <h1 style={{ color:'#f97316' }}>PEF Importer</h1>
      <p style={{ color:'#a3a3a3' }}>Import a Portable Epistemic Frame for verification.</p>
      <PefImporter />
    </div>
  );
}
