'use client';
import React, { useState, useEffect, useRef } from 'react';

const commands: Record<string, (args: string[], print: (s: string) => void) => void> = {
  help: (_args, print) => {
    print('ABRAXAS — Sovereign Epistemic Frame CLI');
    print('');
    print('Available commands:');
    print('  help         - Show this help');
    print('  about        - What is Abraxas?');
    print('  status       - System health');
    print('  init         - Initialize Sovereign Mind');
    print('  audit        - Epistemic audit');
    print('  monitor      - Agent monitor');
    print('  docs         - Documentation');
    print('  version      - Version info');
    print('  clear        - Clear terminal');
  },
  about: (_args, print) => {
    print('ABRAXAS is an epistemic coordination system for AI.');
    print('It enforces truth gates, tracks provenance, and');
    print('routes multi-agent workflows through sober,');
    print('human-auditable pipelines.');
  },
  status: (_args, print) => {
    print('SYSTEM STATUS: ONLINE');
    print('Model: beam:cloud');
    print('Sovereign Mind: ACTIVE');
    print('Agents: 0 (idle)');
    print('Golden Gate: PASS');
  },
  init: (_args, print) => {
    print('[G]Initializing Sovereign Mind...');
    print('# loading constitution-grade.json');
    print('# bootstrapping tools');
    print('# PEF gate ready');
    print('[A]Sovereign Brain online. Ready.');
  },
  audit: (_args, print) => {
    print('Running epistemic audit...');
    print('[G]Checking 47 claims');
    print('[G]Verified: 44, Pending: 3, Redacted: 0');
    print('Audit passed. Golden gate: PASS.');
  },
  monitor: (_args, print) => {
    print('Opening Agent Monitor...');
    if (typeof window !== 'undefined') window.location.href = '/monitor';
  },
  docs: (_args, print) => {
    print('Opening Documentation Hub...');
    if (typeof window !== 'undefined') window.location.href = '/docs';
  },
  version: (_args, print) => {
    print('Abraxas v4.0.0');
    print('Deprecated-Phases: None');
    print('Golden Gate: 90%+ coverage required');
  },
  clear: (_args, print) => {
    print('CLEAR');
  },
};

export default function TerminalPlayground() {
  const [history, setHistory] = useState<string[]>(['An interactive shell has been obtained. Type "help".', '', 'user@localhost:~$']);
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  const print = (text: string) => {
    setHistory((h) => [...h, text]);
  };

  const runCommand = (cmd: string) => {
    print(`user@localhost:~$ ${cmd}`);
    const tokens = cmd.trim().toLowerCase().split(/\s+/);
    const cmdName = tokens[0] || '';
    const args = tokens.slice(1);
    const handler = commands[cmdName];
    if (!handler) {
      print(`[R]Command not found: ${cmdName}[/]`);
      print('Type "help" for available commands.');
      return;
    }
    if (cmdName === 'clear') {
      setHistory([]);
      return;
    }
    handler(args, print);
  };

  const submit = () => {
    if (!input.trim()) return;
    runCommand(input);
    setInput('');
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const parseANSI = (text: string) => {
    return text
      .replace(/\[G\]/g, '<span class="ansi-g">')
      .replace(/\[R\]/g, '<span class="ansi-r">')
      .replace(/\[A\]/g, '<span class="ansi-a">')
      .replace(/\[\/\]/g, '</span>');
  };

  return (
    <div style={{ background: '#0a0a0a', color: '#00ff41', fontFamily: "'Fira Code', monospace", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '90%', maxWidth: '1000px', border: '1px solid #00b32d', borderRadius: 8, background: '#0c0c0c', boxShadow: '0 0 30px rgba(0,255,65,0.1)', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #00b32d' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff003c' }}></span>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffb000' }}></span>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#00ff41' }}></span>
          <span style={{ color: '#ccc', marginLeft: 20, fontSize: 14 }}>sovereign@abraxas:~</span>
        </div>
        <div ref={outputRef} style={{ padding: 20, flex: 1, overflowY: 'auto', fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {history.map((line, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: parseANSI(line) }} />
          ))}
        </div>
        <div style={{ padding: '12px 20px', background: '#111', borderTop: '1px solid #00b32d', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#00ff41' }}>user@localhost:~$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 16, flex: 1, outline: 'none', caretColor: '#00ff41' }}
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
