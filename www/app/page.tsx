import Link from 'next/link';

const fontLink = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Cinzel+Decorative:wght@700&display=swap';

export default function Home() {
  return (
    <>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontLink} rel="stylesheet" />
      </head>
      <div style={{ background:'#0b0613', color:'#f3ecff', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>
        <header style={{ textAlign:'center', padding:'80px 20px 40px' }}>
          <h1 style={{ fontFamily:'"Cinzel Decorative", serif', fontSize:'clamp(2.6rem,7vw,4.6rem)', margin:0, color:'#ff8a3d', textShadow:'0 0 24px rgba(255,138,61,0.35)' }}>Abraxas</h1>
          <p style={{ fontFamily:'"Playfair Display", serif', fontSize:'1.6rem', margin:'12px 0', color:'#d8c4ff' }}>The Sovereign Mind</p>
          <p style={{ margin:'8px 0 28px', fontSize:'1.15rem', color:'#b8a8d8' }}>Truth is the best adventure.</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="https://github.com/TylerGarlick/abraxas" target="_blank" rel="noreferrer" style={{ background:'#ff8a3d', color:'#0b0613', padding:'14px 28px', borderRadius:8, fontWeight:700, textDecoration:'none' }}>View on GitHub</a>
            <a href="https://github.com/TylerGarlick/abraxas/tree/main/docs" target="_blank" rel="noreferrer" style={{ border:'1px solid #9b6bff', color:'#d8c4ff', padding:'14px 28px', borderRadius:8, fontWeight:600, textDecoration:'none' }}>Read the Docs</a>
            <a href="/abraxas/console/" style={{ border:'1px solid #ff8a3d', color:'#ff8a3d', padding:'14px 28px', borderRadius:8, fontWeight:600, textDecoration:'none' }}>Open Console</a>
          </div>
        </header>

        <main style={{ maxWidth:1080, margin:'0 auto', padding:'0 20px' }}>
          <section style={{ marginBottom:64 }}>
            <h2 style={{ fontFamily:'"Playfair Display", serif', color:'#9b6bff', fontSize:'2rem', marginBottom:16 }}>Why Abraxas — why you can trust the output</h2>
            <p style={{ lineHeight:1.7, color:'#d8c4ff' }}>LLMs are fluent; fluency is not truth. Abraxas treats the model as a component and the human as Sovereign, anchoring every claim to a verifiable frame.</p>
            <ul style={{ lineHeight:1.8, color:'#f3ecff' }}>
              <li><strong>Portable truth</strong> across models — no re-reasoning when you switch.</li>
              <li><strong>Calibrated confidence</strong> on every claim — no guess dressed as fact.</li>
              <li><strong>Mandatory provenance</strong> — every belief carries its evidence chain.</li>
              <li><strong>Local-first, sovereign</strong> — your epistemic state, under your keys.</li>
              <li><strong>Deterministic verification</strong> — LLM-as-component, not LLM-as-system.</li>
            </ul>
          </section>

          <section style={{ marginBottom:64, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24 }}>
            <div style={{ border:'1px solid #3a2a5e', borderRadius:12, padding:24, background:'rgba(155,107,255,0.05)' }}>
              <h3 style={{ color:'#9b6bff', marginTop:0 }}>For Builders</h3>
              <p style={{ color:'#d8c4ff', lineHeight:1.6 }}>MCP + PEF artefacts, provenance chains, portable epistemic state, no hallucinations-as-authority. Audit outputs before they ship.</p>
            </div>
            <div style={{ border:'1px solid #3a2a5e', borderRadius:12, padding:24, background:'rgba(255,138,61,0.05)' }}>
              <h3 style={{ color:'#ff8a3d', marginTop:0 }}>For Truth-Seekers</h3>
              <p style={{ color:'#d8c4ff', lineHeight:1.6 }}>Own your epistemic state. Stop re-reasoning. Keep a local, sovereign ledger whose claims you can verify.</p>
            </div>
          </section>

          <section style={{ marginBottom:64 }}>
            <h2 style={{ fontFamily:'"Playfair Display", serif', color:'#9b6bff', fontSize:'2rem', marginBottom:16 }}>How it works (high level)</h2>
            <p style={{ lineHeight:1.7, color:'#d8c4ff' }}>Abraxas keeps a Portable Epistemic Frame (PEF): fragments and claims live in a local flat-file store, are anchored with confidence intervals and provenance, and travel with you across models. The LLM provides fluency; the Sovereign Brain provides truth.</p>
          </section>

          <section style={{ marginBottom:64 }}>
            <h2 style={{ fontFamily:'"Playfair Display", serif', color:'#9b6bff', fontSize:'2rem', marginBottom:16 }}>Example output — a PEF artefact</h2>
            <p style={{ color:'#d8c4ff', marginBottom:12 }}>A synthetic, illustrative PEF claim (representative shape):</p>
            <pre style={{ background:'#130a24', border:'1px solid #3a2a5e', borderRadius:8, padding:16, overflow:'auto', fontSize:13, color:'#e9ddff' }}>{`{
  "id": "claim:pef-demo-001",
  "statement": "Truth is portable across models when anchored in a shared ledger.",
  "confidence": { "value": 0.87, "interval": [0.82, 0.91] },
  "provenance": ["docs/philosophy/zero-trust-mandate.md", "research/reports/*"],
  "status": "verified",
  "localFirst": true
}`}</pre>
          </section>

          <section style={{ marginBottom:64 }}>
            <h2 style={{ fontFamily:'"Playfair Display", serif', color:'#ff8a3d', fontSize:'2rem', marginBottom:16 }}>The Alchemical Story</h2>
            <p style={{ lineHeight:1.7, color:'#d8c4ff' }}>Abraxas takes its name from the gnostic/alchemical tradition — the symbol of completeness and transmutation. Raw, unverified AI output is the ore; Abraxas is the crucible. Fire (reasoning) and ledger (evidence) transmute guesswork into anchored truth. Truth is the best adventure because a verified truth, carried by you, is the richest thing you can own.</p>
          </section>
        </main>

        <footer style={{ marginTop:80, padding:'40px 20px', textAlign:'center', borderTop:'1px solid #3a2a5e', color:'#8b7fb0', fontSize:14 }}>
          <p><a href="https://github.com/TylerGarlick/abraxas" target="_blank" rel="noreferrer" style={{ color:'#ff8a3d', textDecoration:'none' }}>GitHub Repository</a> · <a href="https://github.com/TylerGarlick/abraxas/tree/main/docs" target="_blank" rel="noreferrer" style={{ color:'#9b6bff', textDecoration:'none' }}>Docs</a> · <a href="mailto:support@hebros.us" style={{ color:'#d8c4ff', textDecoration:'none' }}>support@hebros.us</a></p>
          <p style={{ fontSize:12, marginTop:8 }}>Released under the project license.</p>
        </footer>
      </div>
    </>
  );
}
