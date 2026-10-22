
"use client";
import React, { useEffect, useState } from 'react';
import { abraxasData } from '@/data/abraxas';

export default function AbraxasDashboard() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen p-8 relative">
      <div className="crt-overlay" />
      <div className="scanline" />

      {/* Header */}
      <header className="flex justify-between items-end mb-12 border-b-2 border-[#00ff41] pb-4">
        <div>
          <h1 className="text-4xl font-bold crt-glow uppercase tracking-tighter">
            Sovereign Brain <span className="text-sm align-top opacity-70">v{abraxasData.system.version}</span>
          </h1>
          <p className="text-xs opacity-60">EPISTEMIC FRAME VISUALIZATION SYSTEM // NODE: {abraxasData.system.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono crt-glow">{time}</div>
          <div className="text-xs opacity-60">SYS_TIME: LOCAL_UTC</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* System Status */}
        <section className="glass-panel p-6 rounded-sm relative overflow-hidden">
          <h2 className="text-xl font-bold mb-4 crt-glow flex items-center">
            <span className="w-3 h-3 bg-[#00ff41] mr-2 animate-pulse rounded-full" />
            SYSTEM STATUS
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">CORE_ENGINE:</span>
              <span>{abraxasData.system.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">BACKEND:</span>
              <span>{abraxasData.system.backend}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">VERSION:</span>
              <span>{abraxasData.system.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">UPTIME:</span>
              <span>{abraxasData.system.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">CPU_LOAD:</span>
              <span className="crt-amber-glow">{abraxasData.system.load}</span>
            </div>
            <div className="mt-4 p-2 bg-[#00ff41]/10 border border-[#00ff41]/30 text-center text-xs">
              STATUS: {abraxasData.system.status}
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="glass-panel p-6 rounded-sm">
          <h2 className="text-xl font-bold mb-4 crt-glow flex items-center">
            <span className="w-3 h-3 bg-[#ffb000] mr-2 animate-bounce rounded-full" />
            CONFIGURATION
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">CONFIG_VER:</span>
              <span>{abraxasData.config.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">OP_MODE:</span>
              <span className="crt-amber-glow">{abraxasData.config.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">HARDENING:</span>
              <span>{abraxasData.config.hardening}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">LAST_SYNC:</span>
              <span className="text-[10px]">{abraxasData.config.lastLoadTime}</span>
            </div>
            <div className="mt-4 p-2 border border-[#ffb000]/30 text-center text-xs text-[#ffb000]">
              REGISTRY_SYNCED // NO_ERRORS
            </div>
          </div>
        </section>

        {/* Stored Data */}
        <section className="glass-panel p-6 rounded-sm col-span-1 md:col-span-1">
          <h2 className="text-xl font-bold mb-4 crt-glow flex items-center">
            <span className="w-3 h-3 bg-[#00ff41] mr-2 animate-ping rounded-full" />
            DATA STORE
          </h2>
          <div className="font-mono text-sm">
            <div className="flex justify-between mb-4 border-b border-[#00ff41]/30 pb-2">
              <span className="opacity-60">BACKEND:</span>
              <span>{abraxasData.storage.backend}</span>
            </div>
            <div className="flex justify-between mb-4 border-b border-[#00ff41]/30 pb-2">
              <span className="opacity-60">COLLECTIONS:</span>
              <span>{abraxasData.storage.totalCollections}</span>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#00ff41]/30">
              {abraxasData.storage.collections.map((col, i) => (
                <div key={i} className="flex items-center text-[11px] opacity-80 hover:opacity-100 cursor-default">
                  <span className="mr-2 opacity-40">&gt;</span>
                  <span>{col}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Footer Console */}
      <footer className="mt-12 glass-panel p-4 rounded-sm font-mono text-xs">
        <div className="flex items-center opacity-60 mb-2">
          <span className="mr-2">TERMINAL_OUTPUT:</span>
          <span className="animate-pulse">_</span>
        </div>
        <div className="space-y-1">
          <p>[OK] Initializing Epistemic Frame...</p>
          <p>[OK] Mapping Sovereign Nodes...</p>
          <p>[OK] Establishing Truth Anchors...</p>
          <p className="crt-amber-glow">[WARN] Minor drift detected in node_04. Recalibrating...</p>
          <p className="text-white">[INFO] Visualization system active. Ready for query.</p>
        </div>
      </footer>
    </main>
  );
}
