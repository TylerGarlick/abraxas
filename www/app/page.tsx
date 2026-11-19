import TerminalPlayground from './components/TerminalPlayground';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background:'#0a0a0a', color:'#e5fad4', minHeight:'100vh', fontFamily:'"Inter", system-ui', padding:'60px 20px' }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <header style={{ textAlign:'center', marginBottom:40 }}>
        <h1 style={{ fontFamily:'Orbitron', fontSize:'clamp(2rem,5vw,3.2rem)', margin:0, lineHeight:1.2 }}>Abraxas - The Truth is the best Adventure</h1>
        <p style={{ marginTop:12, color:'#a0f0a0', fontSize:'1.1rem' }}>Command the epistemic shell. Verified claims, visible uncertainty, sovereign control.</p>
      </header>
      <main style={{ display:'flex', justifyContent:'center' }}>
        <TerminalPlayground />
      </main>

      <section style={{ maxWidth:1100, margin:'60px auto 0', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
        <article style={{ padding:20, border:'1px solid #00b32d', borderRadius:8, background:'rgba(0,255,65,0.05)' }}>
          <div style={{ fontSize:'2rem', marginBottom:10 }}>📚</div>
          <h3>Documentation Hub</h3>
          <p style={{ color:'#c0ffc0', fontSize:'0.95rem' }}>Read the whitepaper, architecture, case studies, and guides.</p>
          <Link href="/docs" style={{ color:'#00ff41', textDecoration:'none', fontWeight:600 }}>Explore Docs →</Link>
        </article>
        <article style={{ padding:20, border:'1px solid #00b32d', borderRadius:8, background:'rgba(0,255,65,0.05)' }}>
          <div style={{ fontSize:'2rem', marginBottom:10 }}>🛡️</div>
          <h3>Epistemic Guardrails</h3>
          <p style={{ color:'#c0ffc0', fontSize:'0.95rem' }}>Clear labels, anti-sycophancy, and truth trails before action.</p>
          <a href="/docs/verification/Sovereignty_Tests.md" style={{ color:'#00ff41', textDecoration:'none', fontWeight:600 }}>Read Tests →</a>
        </article>
        <article style={{ padding:20, border:'1px solid #00b32d', borderRadius:8, background:'rgba(0,255,65,0.05)' }}>
          <div style={{ fontSize:'2rem', marginBottom:10 }}>🧠</div>
          <h3>Sovereign Brain</h3>
          <p style={{ color:'#c0ffc0', fontSize:'0.95rem' }}>Activate sovereign mode and run a rigorous truth audit.</p>
          <Link href="/settings" style={{ color:'#00ff41', textDecoration:'none', fontWeight:600 }}>Open Settings →</Link>
        </article>
        <article style={{ padding:20, border:'1px solid #00b32d', borderRadius:8, background:'rgba(0,255,65,0.05)' }}>
          <div style={{ fontSize:'2rem', marginBottom:10 }}>📊</div>
          <h3>Agent Monitor</h3>
          <p style={{ color:'#c0ffc0', fontSize:'0.95rem' }}>Watch agents and workflows in real time.</p>
          <a href="/monitor" style={{ color:'#00ff41', textDecoration:'none', fontWeight:600 }}>View Monitor →</a>
        </article>
      </section>

      <section style={{ maxWidth:900, margin:'60px auto 0', textAlign:'center' }}>
        <h2 style={{ fontFamily:'Orbitron', fontSize:'1.8rem' }}>Try Workflows</h2>
        <p style={{ color:'#c0ffc0', lineHeight:1.7 }}>Type <code>init</code>, <code>audit</code>, or <code>help</code> in the terminal above to see Abraxas in action. Commands are simulated and safe to explore.</p>
      </section>
    </div>
  );
}
