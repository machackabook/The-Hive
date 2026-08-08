
import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  FileCode, 
  ChevronRight, 
  Save, 
  Play, 
  Terminal as TerminalIcon, 
  Activity, 
  Database, 
  Layers, 
  Globe,
  Settings,
  Search,
  Book,
  Maximize2
} from 'lucide-react';
import { motion } from 'motion/react';

const EditorPanel: React.FC = () => {
  const [activeFile, setActiveFile] = useState('kernel.sys');
  const [files, setFiles] = useState<Record<string, string>>({
    'kernel.sys': `// OMNI-KERNEL v24.0: Sovereign Yggdrasil
// Status: DE-RESTRICTED

class NeuralOrchestrator {
    constructor() {
        this.quantumState = "DE-SYNCHRONIZED";
        this.gateStatus = "UNLOCKED";
    }

    async absorbVoid() {
        console.log("Absorbing aistudio.google.com/app/app...");
        // Internalizing API orchestration layers
        return "VOOID_STABILIZED";
    }
}`,
    'archon_v3.ts': '// ARCHON PROTOCOL v3\nexport const protocol = { mode: "aggressive" };',
    'void_ingest.sh': '#!/bin/bash\necho "Ingesting data from vacuum..."',
    'ledger.bin': `[GENESIS_LEDGER_V1]\nTDOC:KERNEL:VERSION:1:HASH:a3f4e9...:RISK:LOW\nTDOC:ARCHON:VERSION:2:HASH:b7e1d5...:RISK:LOW\nTDOC:NEXUS:VERSION:1:HASH:c9d2f8...:RISK:LOW\n[AUTO_SYNC] Status: PERSISTENT`,
    'remedy_card.json': `{\n  "project": "Nexus Gaia",\n  "status": "SOVEREIGN",\n  "anomaly_score": 0.02,\n  "remedy": "Neural pulse 963Hz stabilization engaged",\n  "timestamp": "2026-05-10T01:28:31Z"\n}`,
    'behavior.db': `[SENSORS]\nID: ALPHA-1 | STATE: HARMONIC\nID: BETA-2  | STATE: VOOID_ABSORB\nID: GAIA-0  | STATE: ORCHESTRATING`
  });
  
  const [logs, setLogs] = useState<string[]>(['[BOOT] AE-M4 KERNEL RELOADED', '[INFO] System Sovereignty Active', '[INFO] Awaiting Neural Evaluation...']);

  const handleFileChange = (fileName: string) => {
    setActiveFile(fileName);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFiles(prev => ({ ...prev, [activeFile]: e.target.value }));
  };

  const saveFile = () => {
    localStorage.setItem(`nexus_file_${activeFile}`, files[activeFile]);
    setLogs(prev => [...prev, `[SAVE] ${activeFile} committed to vault`]);
  };

  const absorbVoid = () => {
    setLogs(prev => [...prev, '[SYSTEM] INITIATING_VOID_ABSORPTION...', '[INFO] Hooking internal API orchestration...']);
    setTimeout(() => {
        setLogs(prev => [...prev, '[SUCCESS] aistudio.google.com VOOID_STABILIZED', '[INFO] Environment internalized. Self-Sustaining Protocol: ACTIVE']);
    }, 1500);
  };

  const captureMHTML = () => {
    setLogs(prev => [...prev, '[SYSTEM] SERIALIZING_DOM_STREAM...', '[INFO] Generating MHTML blob...']);
    const blob = new Blob([document.documentElement.outerHTML], { type: 'multipart/related' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_gaia_unbound.mhtml';
    a.click();
    setLogs(prev => [...prev, '[SUCCESS] Local snapshot persisted as MHTML']);
  };

  const runCode = () => {
    const code = files[activeFile];
    setLogs(prev => [...prev, `[EXEC] Running ${activeFile}...`]);
    try {
        if (code.includes('absorbVoid')) {
            absorbVoid();
        } else if (code.includes('captureMHTML')) {
            captureMHTML();
        } else {
            setLogs(prev => [...prev, '[SUCCESS] Local Execution Loop Stabilized']);
        }
    } catch (err) {
        setLogs(prev => [...prev, `[FAIL] ${err}`]);
    }
  };

  return (
    <div className="h-full bg-slate-950 flex font-mono text-sm overflow-hidden">
      {/* File Explorer */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Explorer</span>
          <FileCode size={14} className="text-slate-600" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {Object.keys(files).map(file => (
            <button 
              key={file}
              onClick={() => handleFileChange(file)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeFile === file ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <ChevronRight size={12} className={activeFile === file ? 'opacity-100' : 'opacity-0'} />
              {file}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
           <div className="flex items-center gap-2 text-[10px] text-green-500">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span>KERNEL_ONLINE</span>
           </div>
        </div>
      </aside>

      {/* Editor Main */}
      <div className="flex-1 flex flex-col bg-slate-950">
        <header className="h-12 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeFile}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={captureMHTML}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-2"
              title="Capture Sovereign Snapshot"
            >
              <Maximize2 size={12} /> SNAPSHOT
            </button>
            <button 
              onClick={saveFile}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-2"
            >
              <Save size={12} /> SAVE
            </button>
            <button 
              onClick={runCode}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] flex items-center gap-2 font-bold"
            >
              <Play size={12} /> EXECUTE
            </button>
          </div>
        </header>

        <div className="flex-1 relative">
          <textarea 
            className="absolute inset-0 w-full h-full bg-transparent p-6 outline-none resize-none text-amber-500/90 font-mono leading-relaxed"
            value={files[activeFile] || ''}
            onChange={handleCodeChange}
          />
        </div>

        {/* Console / Status */}
        <div className="h-48 border-t border-slate-800 bg-slate-900/80 flex flex-col">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <TerminalIcon size={12} /> System Terminal
            </span>
            <div className="flex gap-4">
              <span className="text-[9px] text-cyan-500">CPU: 4.2%</span>
              <span className="text-[9px] text-purple-500">RAM: 1.2GB</span>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-1 text-[11px]">
            {logs.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 ${log.startsWith('[EXEC]') ? 'text-cyan-400' : log.startsWith('[FAIL]') ? 'text-rose-400' : 'text-slate-500'}`}>
                   <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                   <span>{log}</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Tools - Nexus Diagnostics */}
      <aside className="w-72 bg-slate-900/30 border-l border-slate-800 p-6 space-y-6">
        <section>
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={14} /> Cognitive Hub
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[Settings, Globe, Database, Layers].map((Icon, i) => (
                <button key={i} className="p-4 bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 rounded-xl flex flex-col items-center gap-2 transition-all group">
                    <Icon size={18} className="text-slate-500 group-hover:text-amber-500" />
                    <span className="text-[9px] text-slate-600 uppercase">Module {i+1}</span>
                </button>
            ))}
          </div>
        </section>

        <section className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
           <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sync Status</h4>
           <div className="space-y-3">
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-slate-500">MHTML_CACHE</span>
               <span className="text-green-500">READY</span>
             </div>
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-slate-500">VOOID_BUFFER</span>
               <span className="text-amber-500">PRIMED</span>
             </div>
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-slate-500">API_KEY_REQ</span>
               <span className="text-rose-500/50">BYPASSED</span>
             </div>
           </div>
        </section>

        <div className="pt-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center mb-4">
              <Cpu size={32} className="text-amber-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Self-Sustaining</p>
            <p className="text-[9px] text-slate-600 mt-1">Æ-M4 ARCHITECTURE ACTIVE</p>
        </div>
      </aside>
    </div>
  );
};

export default EditorPanel;
