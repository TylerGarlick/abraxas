'use client';
import React, { useState } from 'react';

const demo = [
  { cmd: 'abx help', out: 'abx — Abraxas CLI (terminal-first workflows)' },
  { cmd: 'frame baseline', out: 'Frame updated: baseline' },
  { cmd: 'queue task-1 task-2', out: 'Queued 2 items.' },
];

export default function TerminalPlayground() {
  const [history, setHistory] = useState<string[]>(['$ abx help']);
  const [input, setInput] = useState('');
  const key = 'abraxas_terminal_history';

  React.useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setHistory(JSON.parse(raw));
  }, []);
  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(history));
  }, [history]);

  const submit = () => {
    if (!input.trim()) return;
    const match = demo.find((item) => item.cmd === input.trim());
    const output = match ? match.out : 'simulated: no matching command';
    setHistory((h) => h.concat(`$ ${input}`, output));
    setInput('');
  };

  const exportPef = () => {
    const payload = { frame: demo, output: 'SIMULATED_PEF', provenance: 'abx-web-playground', ts: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abraxas-simulated-pef.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ border: '1px solid #232323', background: '#050505', borderRadius: 12, padding: 16 }}>
      <div style={{ color: '#22c55e', fontSize: 14, marginBottom: 12 }}>● Abraxian Terminal (SIMULATED — not a live system)</div>
      <pre style={{ color: '#a3e635', lineHeight: 1.6, minHeight: 120, whiteSpace: 'pre-wrap', margin: '0 0 12px 0' }}>
        {history.join('\n')}
      </pre>
      <div style={{ color: '#737373', marginBottom: 8 }}>Enter simulated commands from the list. See capabilities below.</div>
      <input value={input} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: 10, width: '75%' }} placeholder="type `abx help`" onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <button style={{ marginLeft: 8, background: '#f97316', color: '#000', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }} onClick={submit}>Run</button>
      <button style={{ marginLeft: 8, background: '#fff', color: '#000', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }} onClick={exportPef}>Export simulated PEF</button>
    </div>
  );
}