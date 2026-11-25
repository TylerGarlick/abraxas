import React from 'react';
import TerminalPlayground from '../components/TerminalPlayground';
import PefImporter from '../components/PefImporter';

export default function ConsolePage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#e5fad4', fontFamily:'"Inter", system-ui', padding:'40px 20px' }}>
      <header style={{ textAlign:'center', marginBottom:32 }}>
        <h1 style={{ fontFamily:'Orbitron', fontSize:'clamp(2rem,5vw,3.2rem)', margin:0, lineHeight:1.2, color:'#00ff41' }}>Abraxas Console</h1>
        <p style={{ marginTop:12, color:'#a0f0a0', fontSize:'1.1rem' }}>Command the epistemic shell. Verified claims, visible uncertainty, sovereign control. (Simulated)</p>
      </header>
      <main style={{ display:'flex', justifyContent:'center' }}>
        <TerminalPlayground />
      </main>
      <section style={{ maxWidth:900, margin:'40px auto 0' }}>
        <PefImporter />
      </section>
    </div>
  );
}
