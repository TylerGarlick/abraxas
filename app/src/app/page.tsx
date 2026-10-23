"use client";
import React, { useEffect, useState } from 'react';
import { abraxasData } from '@/data/abraxas';

export default function AbraxasDashboard() {
  const [time, setTime] = useState("");
  const [settings, setSettings] = useState({ ...abraxasData });
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showDataExplorer, setShowDataExplorer] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [explorerData, setExplorerData] = useState<Record<string, any[]>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importingClaims, setImportingClaims] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveSettings = (newSettings: any) => {
    setSettings(newSettings);
    setShowControlPanel(false);
  };

  const handleOpenCollection = (col: string) => {
    setSelectedCollection(col);
    // Mock data for the explorer
    setExplorerData({
      [col]: [
        { id: "001", timestamp: new Date().toISOString(), content: "Example data for " + col, confidence: 0.92, status: "VERIFIED" },
        { id: "002", timestamp: new Date().toISOString(), content: "Secondary entry for " + col, confidence: 0.78, status: "PENDING" },
        { id: "003", timestamp: new Date().toISOString(), content: "Anomalous signal detected in " + col, confidence: 0.45, status: "UNKNOWN" },
      ]
    });
  };

  const handleStartImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setImportingClaims([
        { id: 'pef_001', claim: 'The Sovereign Brain architecture allows for local epistemic verification.', confidence: 0.98, status: 'pending' },
        { id: 'pef_002', claim: 'P2P context sharing reduces reliance on centralized LLM providers.', confidence: 0.85, status: 'pending' },
        { id: 'pef_003', claim: 'Epistemic collapse is inevitable without a formal gating mechanism.', confidence: 0.72, status: 'pending' },
        { id: 'pef_004', claim: 'All truths are provisional and subject to falsification.', confidence: 0.99, status: 'pending' },
      ]);
      setIsImporting(false);
    }, 1500);
  };

  const updateClaimStatus = (id: string, status: 'accepted' | 'rejected') => {
    setImportingClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleCommitImport = () => {
    const accepted = importingClaims.filter(c => c.status === 'accepted');
    console.log('Committing to frame:', accepted);
    setShowImportModal(false);
    setImportingClaims([]);
  };

  const filteredData = selectedCollection 
    ? explorerData[selectedCollection]?.filter((item: any) => 
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.id.includes(searchQuery)
      ) || [] 
    : [];

  return (
    <main className="min-h-screen p-8 relative text-[#00ff41]">
      <div className="crt-overlay" />
      <div className="scanline" />

      {/* Header */}
      <header className="flex justify-between items-end mb-12 border-b-4 border-[#fcee0a] pb-4">
        <div className="relative">
          <h1 className="text-5xl font-black cp-yellow-glow uppercase tracking-tighter italic">
            Sovereign <span className="glitch-text">Brain</span> <span className="text-sm align-top opacity-70 not-italic font-mono">v{settings.system.version}</span>
          </h1>
          <p className="text-xs opacity-60 font-mono">EPISTEMIC FRAME VISUALIZATION SYSTEM // NODE: {settings.system.name}</p>
        </div>
        <div className="text-right font-mono">
          <div className="text-3xl font-bold cp-yellow-glow">{time}</div>
          <div className="text-xs opacity-60 uppercase">Sys_Time: Local_UTC</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* System Status */}
        <section className="glass-panel p-6 relative overflow-hidden group hover:border-[#00fbff] transition-colors">
          <h2 className="text-xl font-bold mb-4 crt-glow flex items-center uppercase tracking-widest">
            <span className="w-3 h-3 bg-[#00ff41] mr-2 animate-pulse rounded-full" />
            System Status
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">CORE_ENGINE:</span>
              <span className="text-white">{settings.system.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">BACKEND:</span>
              <span className="text-white">{settings.system.backend}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">VERSION:</span>
              <span className="text-white">{settings.system.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">UPTIME:</span>
              <span className="text-white">{settings.system.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">CPU_LOAD:</span>
              <span className="crt-amber-glow">{settings.system.load}</span>
            </div>
            <div className="mt-4 p-2 bg-[#00ff41]/10 border border-[#00ff41]/30 text-center text-xs uppercase font-bold">
              Status: {settings.system.status}
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="glass-panel p-6 relative group hover:border-[#ff00ff] transition-colors">
          <h2 className="text-xl font-bold mb-4 crt-glow flex items-center uppercase tracking-widest">
            <span className="w-3 h-3 bg-[#ffb000] mr-2 animate-bounce rounded-full" />
            Configuration
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">CONFIG_VER:</span>
              <span className="text-white">{settings.config.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">OP_MODE:</span>
              <span className="crt-amber-glow">{settings.config.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">HARDENING:</span>
              <span className="text-white">{settings.config.hardening}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">LAST_SYNC:</span>
              <span className="text-[10px]">{settings.config.lastLoadTime}</span>
            </div>
            <div className="mt-4 p-2 border border-[#ffb000]/30 text-center text-xs text-[#ffb000] font-bold uppercase">
              Registry_Synced // No_Errors
            </div>
          </div>
        </section>

        {/* Data Store */}
        <section className="glass-panel p-6 relative group hover:border-[#fcee0a] transition-colors">
          <h2 className="text-xl font-bold mb-4 crt-glow flex items-center uppercase tracking-widest">
            <span className="w-3 h-3 bg-[#00ff41] mr-2 animate-ping rounded-full" />
            Data Store
          </h2>
          <div className="font-mono text-sm">
            <div className="flex justify-between mb-4 border-b border-[#00ff41]/30 pb-2">
              <span className="opacity-60">BACKEND:</span>
              <span className="text-white">{settings.storage.backend}</span>
            </div>
            <div className="flex justify-between mb-4 border-b border-[#00ff41]/30 pb-2">
              <span className="opacity-60">COLLECTIONS:</span>
              <span className="text-white">{settings.storage.totalCollections}</span>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#00ff41]/30">
              {settings.storage.collections.map((col: string, i: number) => (
                <div key={i} className="flex items-center text-[11px] opacity-80 hover:opacity-100 cursor-default">
                  <span className="mr-2 opacity-40">&gt;</span>
                  <span>{col}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex gap-4">
        <button 
          onClick={() => setShowControlPanel(true)}
          className="cp-panel px-6 py-2 font-bold uppercase italic hover:bg-[#fcee0a] hover:text-black transition-all active:scale-95"
        >
          Open Control Panel
        </button>
        <button 
          onClick={() => setShowDataExplorer(true)}
          className="cp-panel px-6 py-2 font-bold uppercase italic hover:bg-[#fcee0a] hover:text-black transition-all active:scale-95"
        >
          Data Explorer
        </button>
        <button 
          onClick={() => setShowImportModal(true)}
          className="cp-panel px-6 py-2 font-bold uppercase italic hover:bg-[#fcee0a] hover:text-black transition-all active:scale-95"
        >
          Import PEF
        </button>
      </div>

      {/* Footer Console */}
      <footer className="mt-12 glass-panel p-4 rounded-sm font-mono text-xs">
        <div className="flex items-center opacity-60 mb-2">
          <span className="mr-2 uppercase">Terminal_Output:</span>
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

      {/* Control Panel Modal */}
      {showControlPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="cp-panel p-8 w-full max-w-md relative">
            <h2 className="text-2xl font-black cp-yellow-glow uppercase mb-6 italic">System Control Panel</h2>
            <div className="space-y-4 font-mono text-sm">
              <div>
                <label className="block opacity-60 mb-1">SYSTEM_NAME</label>
                <input 
                  className="w-full bg-black border border-[#fcee0a] p-2 text-[#fcee0a] outline-none"
                  value={settings.system.name}
                  onChange={(e) => setSettings({...settings, system: {...settings.system, name: e.target.value}})}
                />
              </div>
              <div>
                <label className="block opacity-60 mb-1">SYSTEM_VERSION</label>
                <input 
                  className="w-full bg-black border border-[#fcee0a] p-2 text-[#fcee0a] outline-none"
                  value={settings.system.version}
                  onChange={(e) => setSettings({...settings, system: {...settings.system, version: e.target.value}})}
                />
              </div>
              <div>
                <label className="block opacity-60 mb-1">OP_MODE</label>
                <select 
                  className="w-full bg-black border border-[#fcee0a] p-2 text-[#fcee0a] outline-none"
                  value={settings.config.mode}
                  onChange={(e) => setSettings({...settings, config: {...settings.config, mode: e.target.value}})}
                >
                  <option value="SOVEREIGN">SOVEREIGN</option>
                  <option value="LABORATORY">LABORATORY</option>
                  <option value="AUDIT">AUDIT</option>
                </select>
              </div>
              <div>
                <label className="block opacity-60 mb-1">HARDENING_STATUS</label>
                <select 
                  className="w-full bg-black border border-[#fcee0a] p-2 text-[#fcee0a] outline-none"
                  value={settings.config.hardening}
                  onChange={(e) => setSettings({...settings, config: {...settings.config, hardening: e.target.value}})}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                  <option value="STRESS_TEST">STRESS_TEST</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => handleSaveSettings(settings)}
                className="flex-1 bg-[#fcee0a] text-black font-bold uppercase py-2 hover:bg-white transition-colors"
              >
                Commit Changes
              </button>
              <button 
                onClick={() => setShowControlPanel(false)}
                className="px-4 py-2 border border-[#fcee0a] text-[#fcee0a] font-bold uppercase hover:bg-[#fcee0a]/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import PEF Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="cp-panel p-8 w-full max-w-3xl h-[80vh] relative flex flex-col">
            <h2 className="text-2xl font-black cp-yellow-glow uppercase mb-2 italic">Epistemic Gate // PEF Import</h2>
            <p className="text-xs opacity-60 mb-6 font-mono">VERIFY AND FILTER EXTERNAL CLAIMS BEFORE INTEGRATION INTO SOVEREIGN FRAME</p>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono text-sm">
              {!isImporting && importingClaims.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <p className="opacity-40 italic">NO PEF LOADED. INITIALIZE IMPORT SEQUENCE...</p>
                  <button 
                    onClick={handleStartImport}
                    className="px-6 py-2 border border-[#fcee0a] text-[#fcee0a] font-bold uppercase hover:bg-[#fcee0a] hover:text-black transition-all"
                  >
                    Initialize Import
                  </button>
                </div>
              ) : isImporting ? (
                <div className="h-full flex items-center justify-center text-center opacity-60 animate-pulse font-bold uppercase tracking-widest">
                  Fetching PEF Data Stream...
                </div>
              ) : (
                importingClaims.map((c: any, i: number) => (
                  <div key={i} className="p-4 border border-[#fcee0a]/20 bg-black/40 flex justify-between items-start gap-4 hover:border-[#fcee0a]/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] opacity-40">ID: {c.id}</span>
                        <span className="text-[10px] text-cyan-400">CONF: {c.confidence}</span>
                        <span className={`text-[10px] font-bold uppercase ${c.status === 'accepted' ? 'text-green-400' : c.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-white opacity-90">{c.claim}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateClaimStatus(c.id, 'accepted')}
                        className={`px-3 py-1 text-xs font-bold uppercase border transition-colors ${c.status === 'accepted' ? 'bg-green-400 text-black border-green-400' : 'border-green-400 text-green-400 hover:bg-green-400/20'}`}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => updateClaimStatus(c.id, 'rejected')}
                        className={`px-3 py-1 text-xs font-bold uppercase border transition-colors ${c.status === 'rejected' ? 'bg-red-400 text-black border-red-400' : 'border-red-400 text-red-400 hover:bg-red-400/20'}`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-[#fcee0a] text-[#fcee0a] text-xs font-bold uppercase hover:bg-[#fcee0a]/20 transition-colors"
              >
                Abort
              </button>
              {importingClaims.length > 0 && !isImporting && (
                <button 
                  onClick={handleCommitImport}
                  className="flex-1 bg-[#fcee0a] text-black font-bold uppercase py-2 hover:bg-white transition-colors text-xs"
                >
                  Commit to Sovereign Frame
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Explorer Modal */}
      {showDataExplorer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="cp-panel p-8 w-full max-w-4xl h-[80vh] relative flex flex-col">
            <h2 className="text-2xl font-black cp-yellow-glow uppercase mb-6 italic">Data Explorer</h2>
            <div className="flex gap-6 h-full overflow-hidden">
              {/* Sidebar: Collections */}
              <div className="w-1/3 border-r border-[#fcee0a]/30 pr-4 flex flex-col">
                <div className="mb-4">
                  <input 
                    placeholder="SEARCH_COLLECTIONS..." 
                    className="w-full bg-black border border-[#fcee0a] p-2 text-xs text-[#fcee0a] outline-none uppercase font-mono"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
                  {settings.storage.collections
                    .filter(col => col.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((col: string, i: number) => (
                      <div 
                        key={i} 
                        onClick={() => handleOpenCollection(col)}
                        className={`p-2 cursor-pointer transition-colors ${selectedCollection === col ? 'bg-[#fcee0a] text-black font-bold' : 'hover:bg-[#fcee0a]/20 text-[#fcee0a]'}`}
                      >
                        {col}
                      </div>
                    ))}
                </div>
              </div>

              {/* Main Content: JSON Viewer */}
              <div className="w-2/3 flex flex-col">
                {selectedCollection ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-[#fcee0a] uppercase tracking-widest">{selectedCollection} // VIEW</span>
                      <span className="text-[10px] opacity-60">{filteredData.length} RECORDS FOUND</span>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-black/50 p-4 font-mono text-xs border border-[#fcee0a]/20">
                      {filteredData.length > 0 ? (
                        filteredData.map((item: any, i: number) => (
                          <div key={i} className="mb-4 p-2 border border-[#fcee0a]/10 hover:border-[#fcee0a]/40 transition-colors">
                            <div className="flex justify-between text-[#fcee0a] mb-1">
                              <span className="font-bold">ID: {item.id}</span>
                              <span className="text-[10px]">{item.timestamp}</span>
                            </div>
                            <div className="text-white opacity-80 mb-1">{item.content}</div>
                            <div className="flex gap-4 text-[10px]">
                              <span className="text-cyan-400">CONF: {item.confidence}</span>
                              <span className={`font-bold ${item.status === 'VERIFIED' ? 'text-green-400' : 'text-amber-400'}`}>{item.status}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center opacity-40 mt-10 italic">NO RECORDS MATCHING QUERY...</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-center opacity-40 italic font-mono text-sm">
                    SELECT A COLLECTION TO EXPLORE THE DATA STREAM
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowDataExplorer(false)}
              className="absolute bottom-4 right-4 px-4 py-1 border border-[#fcee0a] text-[#fcee0a] text-xs font-bold uppercase hover:bg-[#fcee0a] hover:text-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
