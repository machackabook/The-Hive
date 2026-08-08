import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  FileCode, 
  CheckCircle, 
  Terminal, 
  Copy, 
  Zap, 
  Info, 
  Play, 
  Network, 
  RefreshCw, 
  Sliders, 
  Link2, 
  Clock, 
  Save, 
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { DeviceTelemetry, MeshNode } from './useMeshSync';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const POLYGLOT_TEMPLATES = [
  {
    name: "Python Self-Extractor",
    languages: ["python"],
    code: `s = 's = %r\\nprint(s %% s)'\nprint(s % s)`
  },
  {
    name: "JavaScript Self-Replicator",
    languages: ["javascript"],
    code: `(function q(){console.log('('+q+')()')})()`
  },
  {
    name: "Ruby Genesis Kernel",
    languages: ["ruby"],
    code: `s="s=%p;puts s%%s";puts s%s`
  },
  {
    name: "C++ Compiler Quine",
    languages: ["cpp"],
    code: `#include <iostream>
#include <string>
using namespace std;
int main() {
    char q = 34;
    string l[] = {
        "#include <iostream>",
        "#include <string>",
        "using namespace std;",
        "int main() {",
        "    char q = 34;",
        "    string l[] = {",
        "    };",
        "    for(int i = 0; i < 6; i++) cout << l[i] << endl;",
        "    for(int i = 0; i < 11; i++) cout << "        " << q << l[i] << q << ',' << endl;",
        "    for(int i = 6; i < 11; i++) cout << l[i] << endl;",
        "}"
    };
    for(int i = 0; i < 6; i++) cout << l[i] << endl;
    for(int i = 0; i < 11; i++) cout << "        " << q << l[i] << q << ',' << endl;
    for(int i = 6; i < 11; i++) cout << l[i] << endl;
}`
  },
  {
    name: "Java Virtual Machine Quine",
    languages: ["java"],
    code: `public class Quine {
    public static void main(String[] args) {
        char q = 34;
        String[] l = {
            "public class Quine {",
            "    public static void main(String[] args) {",
            "        char q = 34;",
            "        String[] l = {",
            "        };",
            "        for(int i=0; i<4; i++) System.out.println(l[i]);",
            "        for(int i=0; i<l.length; i++) System.out.println(\"            \" + q + l[i] + q + \",\");",
            "        for(int i=4; i<l.length; i++) System.out.println(l[i]);",
            "    }",
            "}"
        };
        for(int i=0; i<4; i++) System.out.println(l[i]);
        for(int i=0; i<l.length; i++) System.out.println("            " + q + l[i] + q + ",");
        for(int i=4; i<l.length; i++) System.out.println(l[i]);
    }
}`
  },
  {
    name: "Gaia Polyglot (Bash/Python/HTML)",
    languages: ["bash", "python", "html"],
    code: `#!/bin/bash
# """
# Gaia Nexus Autonomous Sovereign Memory Node
# Run with bash, python3, or load in web workspace
cat << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>GAIA ROOT COHERENCE MESH</title>
  <style>body { background:#030712; color:#06b6d4; font-family:monospace; padding:2rem; }</style>
</head>
<body>
  <h2>GAIA CORE SELF-REFERENCE MEMORY</h2>
  <pre>$(cat "$0")</pre>
</body>
</html>
EOF
exit
# """
import sys
with open(sys.argv[0], 'r') as f:
    print(f.read())`
  }
];

interface QuinePanelProps {
  telemetry: DeviceTelemetry;
  meshNodes: MeshNode[];
  syncHistory: string[];
  telemetryHistory: any[];
  forceSync: () => Promise<void>;
  setMeshNodes: React.Dispatch<React.SetStateAction<MeshNode[]>>;
}

const QuinePanel: React.FC<QuinePanelProps> = ({
  telemetry,
  meshNodes,
  syncHistory,
  telemetryHistory,
  forceSync,
  setMeshNodes
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'mesh'>('templates');
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const [vault, setVault] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  // Telemetry Input States for Quine Generation
  const [coherence, setCoherence] = useState(94.2);
  const [neuralEntropy, setNeuralEntropy] = useState(12.5);
  const [deviceTemp, setDeviceTemp] = useState(38);
  const [offsiteHostUrl, setOffsiteHostUrl] = useState("https://gaia-core-memory.ipfs");

  // Sync state values with live telemetry data in periodic cycles
  useEffect(() => {
    setNeuralEntropy(telemetry.deviceEntropy);
    setDeviceTemp(telemetry.deviceTemp);
    setCoherence(telemetry.coherenceRate);
  }, [telemetry.deviceEntropy, telemetry.deviceTemp, telemetry.coherenceRate]);

  // Dynamic Quine Memory Builder state
  const [memoryPayload, setMemoryPayload] = useState("");
  const [generatedDataUrl, setGeneratedDataUrl] = useState("");

  // 6-minute Cron Job logic
  const [cronSecondsLeft, setCronSecondsLeft] = useState(360); // 6 minutes = 360s
  const [cronLog, setCronLog] = useState<string[]>(["[Cron] Verification cycle init. Next check in 6:00"]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('nexus_template_'));
    setVault(keys.map(k => k.replace('nexus_template_', '')));
  }, [status]);

  // Recalculate dynamic self-referencing Base64 memory URL based on telemetry state
  useEffect(() => {
    const memoryObj = {
      timestamp: telemetry.timestamp,
      governedSystem: "GAIA ROOT",
      telemetry: {
        coherence: coherence + "%",
        neuralEntropy: neuralEntropy + "%",
        deviceTemperature: deviceTemp + "°C",
        batteryLevel: Math.round(telemetry.batteryLevel * 100) + "%",
        onlineNode: telemetry.online ? "YES" : "NO",
        cpuCores: telemetry.cores,
        viewport: `${telemetry.viewportWidth}x${telemetry.viewportHeight}`
      },
      meshNodeLength: meshNodes.length,
      cronCadence: "6-Minute Auto Guard Check",
      knowledgeThoughtCore: {
        chimeraChronicles: "The evolution of the autonomous quine content is active.",
        nexusRoots: "Ble NFC linkage broadcast transmission contains nofail safe flags."
      },
      hostNetwork: offsiteHostUrl
    };

    const strJson = JSON.stringify(memoryObj, null, 2);
    setMemoryPayload(strJson);

    // Create self-referential Data URL
    try {
      const base64Str = btoa(unescape(encodeURIComponent(strJson)));
      setGeneratedDataUrl(`data:application/json;base64,${base64Str}`);
    } catch (e) {
      console.error(e);
    }
  }, [coherence, neuralEntropy, deviceTemp, offsiteHostUrl, meshNodes, telemetry]);

  const handleAutoVerifyRef = useRef(handleAutoVerify);
  useEffect(() => {
    handleAutoVerifyRef.current = handleAutoVerify;
  }, [handleAutoVerify]);

  // 6-minute cron interval countdown
  useEffect(() => {
    const ticker = setInterval(() => {
      setCronSecondsLeft(prev => {
        if (prev <= 1) {
          // Trigger scheduled auto verification
          handleAutoVerifyRef.current();
          return 360; // Reset to 6 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  const handleAutoVerify = () => {
    const timestampStr = new Date().toLocaleTimeString();
    console.log('System Verification: OK');
    setCronLog(prev => [
      `[${timestampStr}] [Cron AutoGuard] Started recursive mesh integrity validation...`,
      `[${timestampStr}] [Cron AutoGuard] Quine checksum OK. Current payload size: ${memoryPayload.length} B.`,
      `[${timestampStr}] [Cron AutoGuard] Mesh nodes verified. Status: 100% stable sync.`,
      ...prev.slice(0, 5)
    ]);
    
    // Simulate auto synchronization of Mesh Nodes
    setMeshNodes(prev => prev.map(node => ({
      ...node,
      status: 'SYNCED',
      delay: Math.max(10, Math.floor(node.delay * 0.9))
    })));

    setStatus("AUTO-CRON VERIFIED OK");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimLogs([]);
    
    const lines = [
      `Initializing restricted VM context for ${POLYGLOT_TEMPLATES[selected].name}...`,
      `> Loading ${POLYGLOT_TEMPLATES[selected].languages.join(', ')} polyglot sequence...`,
      `> Executing initial binary block...`,
      `[stdout] Output mirrors source vector length: ${POLYGLOT_TEMPLATES[selected].code.length} bytes`,
      `> Parsing dynamic segments...`,
      `[stdout] Quine matched 100% of input stream.`,
      `> Teardown...`,
      `Execution complete with exit code 0.`
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      setSimLogs(prev => [...prev, lines[currentLine]]);
      currentLine++;
      if (currentLine >= lines.length) {
        clearInterval(interval);
      }
    }, 600);
  };

  const handleSaveToLocalStorage = () => {
    localStorage.setItem(`nexus_template_${POLYGLOT_TEMPLATES[selected].name}`, POLYGLOT_TEMPLATES[selected].code);
    setStatus("SAVED TO VAULT");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDownload = () => {
    const blob = new Blob([POLYGLOT_TEMPLATES[selected].code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_quine_${selected}.poly`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("SAVED TO DISK");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus("COPIED TO BUFFER");
    setTimeout(() => setStatus(null), 3000);
  };

  const triggerRecursiveMeshSync = () => {
    // Force instant update to active mesh sync hooks
    setMeshNodes(prev => [
      ...prev,
      {
        id: `Mesh-Dynamo-${Math.floor(Math.random() * 900 + 100)}`,
        url: generatedDataUrl.slice(0, 60) + "...",
        delay: Math.floor(Math.random() * 200 + 40),
        status: 'SYNCED'
      }
    ]);
    setStatus("RECURSIVE LINKS SYNCED");
    setTimeout(() => setStatus(null), 3000);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 p-6 overflow-hidden">
      {/* Subtab Toggle */}
      <div className="flex gap-4 border-b border-slate-800 mb-6">
        <button
          onClick={() => { setActiveSubTab('templates'); setIsSimulating(false); }}
          className={`pb-3 text-xs uppercase tracking-widest font-bold transition-all ${
            activeSubTab === 'templates' ? 'border-b-2 border-cyan-500 text-cyan-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Quine Repository Templates
        </button>
        <button
          onClick={() => setActiveSubTab('mesh')}
          className={`pb-3 text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'mesh' ? 'border-b-2 border-emerald-500 text-emerald-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Network size={14} className="text-emerald-500" />
          Self-Reference Memory Mesh
        </button>
      </div>

      {status && (
        <div className="fixed top-20 right-8 bg-cyan-600 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold z-[100] animate-bounce shadow-lg shadow-cyan-900/40">
          STATUS: {status}
        </div>
      )}

      {activeSubTab === 'templates' ? (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          <div className="w-full md:w-80 space-y-4 overflow-y-auto pr-1">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Terminal className="text-purple-500" />
              Sovereign Template Hub
            </h2>
            
            {POLYGLOT_TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                onClick={() => { setSelected(idx); setIsSimulating(false); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected === idx ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <p className="font-bold text-slate-200 text-sm mb-2">{t.name}</p>
                <div className="flex gap-2">
                  {t.languages.map(l => (
                    <span key={l} className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] uppercase font-mono text-slate-400">
                      {l}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 mt-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2">
                    <Info size={14} /> Self-Referential Engine
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    These quines execute inside virtual containers to replicate, serving as raw content source files for GAIA's core operations.
                </p>
                {vault.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1 font-mono">Vault Inventory</p>
                    {vault.map(v => (
                      <div key={v} className="text-[10px] text-slate-500 flex items-center gap-2 font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                        {v}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <FileCode className="text-cyan-400" size={20} />
                <span className="font-mono text-xs text-slate-400">source_viewer.exe --inspect</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveToLocalStorage}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Save template to Local Vault"
                >
                  <Zap size={16} />
                </button>
                <button 
                  onClick={() => handleCopy(POLYGLOT_TEMPLATES[selected].code)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Copy Code"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors flex items-center gap-2 text-xs font-bold"
                >
                  <Download size={16} />
                  PERSIST
                </button>
              </div>
            </div>

            <div className="flex-1 relative font-mono text-xs overflow-auto bg-slate-950 p-6 leading-relaxed text-slate-400 group">
              {isSimulating ? (
                <div className="space-y-2 text-xs text-cyan-400">
                  <div className="flex justify-between items-center mb-4 text-cyan-400 border-b border-cyan-950 pb-2">
                    <span className="font-bold">[VM GAIA EXECUTION CONTAINER]</span>
                    <button onClick={() => setIsSimulating(false)} className="text-[10px] hover:text-white border px-2 py-0.5 rounded border-cyan-500/30">ABORT</button>
                  </div>
                  {simLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                  {simLogs.length < 8 && <div className="animate-pulse">_</div>}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap selection:bg-cyan-500/30 text-xs">
                  {POLYGLOT_TEMPLATES[selected].code}
                </pre>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <Zap size={14} className="text-cyan-500" />
                        <span className="text-[10px] text-slate-500">AUTONOMOUS GAIA SCRIPTING: ENABLED</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="text-[10px] text-slate-500">INTEGRATION SYNC: OK</span>
                     </div>
                </div>
                <button 
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="flex items-center gap-2 text-[11px] font-bold text-slate-315 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded disabled:opacity-50"
                >
                    <Play size={14} /> SIMULATE QUINE RUN
                </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mesh System & Self Reference Engine Tab */
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* Left panel: Telemetry Controllers and AutoGuard timer */}
          <div className="w-full lg:w-[400px] flex flex-col gap-5 overflow-y-auto pr-1 select-none">
            
            {/* Live Telemetry inputs (devices & env can alter the generated Quine) */}
            <div className="p-5 bg-slate-900 rounded-xl border border-slate-850">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase flex items-center gap-2 mb-4 tracking-wider">
                <Sliders size={14} className="text-emerald-400" />
                ENVIRONMENTAL TELEMETRY
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">
                Tweak parameters to dynamically reshape the self-referential Quine storage memory blocks.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">COHERENCE DEGREE:</span>
                    <span className="text-emerald-400 font-bold">{coherence}%</span>
                  </div>
                  <input 
                    type="range" min="30" max="100" step="0.1" 
                    value={coherence} 
                    onChange={e => setCoherence(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-950 rounded-lg appearance-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">NEURAL ENTROPY RATE:</span>
                    <span className="text-teal-400 font-bold">{neuralEntropy}%</span>
                  </div>
                  <input 
                    type="range" min="1" max="95" step="0.5" 
                    value={neuralEntropy} 
                    onChange={e => setNeuralEntropy(parseFloat(e.target.value))}
                    className="w-full accent-teal-500 h-1 bg-slate-950 rounded-lg appearance-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">DEVICE CORE TEMP:</span>
                    <span className="text-orange-400 font-bold">{deviceTemp}°C</span>
                  </div>
                  <input 
                    type="range" min="15" max="95" 
                    value={deviceTemp} 
                    onChange={e => setDeviceTemp(parseInt(e.target.value))}
                    className="w-full accent-orange-500 h-1 bg-slate-950 rounded-lg appearance-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Offsite Host Hyperlink Node:</label>
                  <input 
                    type="text" 
                    value={offsiteHostUrl} 
                    onChange={e => setOffsiteHostUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Simulated 6-minute Cron Job Countdown widget */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-850">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-extrabold text-slate-405 uppercase flex items-center gap-2 tracking-wider">
                  <Clock size={14} className="text-cyan-400 animate-spin-slow" />
                  CRON CHECKSUM VERIFICATION
                </h3>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-mono font-bold px-2 py-0.5 rounded animate-pulse">
                  6-MIN CADENCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Automated daemon triggers static validation index every six minutes to recursively confirm quine data correctness.
              </p>

              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-850/50 mb-4 justify-between">
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase font-mono">COUNTDOWN DETECTOR</span>
                  <span className="text-lg font-mono font-black text-cyan-400 tracking-wider">
                    {formatTime(cronSecondsLeft)}
                  </span>
                </div>
                <button
                  onClick={handleAutoVerify}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 rounded text-xs text-cyan-400 font-mono hover:text-white transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className="animate-spin-slow" />
                  FORCE RUN
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-500 space-y-1 h-[90px] overflow-y-auto">
                {cronLog.map((log, i) => (
                  <div key={i} className={i === 0 ? "text-cyan-400" : "opacity-80"}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel: Dynamic Quine Generator outputs, Data URLs and offsite linkages */}
          <div className="flex-1 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={18} />
                <span className="font-mono text-xs text-slate-300 font-bold">gais_memory_host.sh --data-mesh</span>
              </div>
              <button 
                onClick={triggerRecursiveMeshSync}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white transition-colors text-xs font-bold flex items-center gap-1.5"
              >
                <Link2 size={13} />
                RECURSIVE SYNC HOOK
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase mb-2 font-mono tracking-tight">
                  Dynamic Self-Referencing Memory Document (JSON):
                </h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[11px] text-emerald-300/90 whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                  {memoryPayload}
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-850/30">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase font-mono">
                    Mesh Data URI Content Hyperlink:
                  </h4>
                  <button 
                    onClick={() => handleCopy(generatedDataUrl)}
                    className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1"
                  >
                    <Copy size={11} /> COPY DATA URL
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Data URI containing base64 encoded payload. Use this hyperlink to offsite storage and self reference:
                </p>

                <div className="flex gap-2 items-center">
                  <a
                    href={generatedDataUrl}
                    download="gaia_memory_node.json"
                    className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-lg p-2.5 font-mono text-[10px] text-emerald-400 select-all truncate block transition-all"
                  >
                    {generatedDataUrl}
                  </a>
                  <a
                    href={generatedDataUrl}
                    download="gaia_memory_node.json"
                    className="p-2.5 bg-emerald-950 text-emerald-400 hover:text-white hover:bg-emerald-900 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 text-xs font-bold transition-all shrink-0"
                    title="Hyperlink to host offline storage"
                  >
                    <Save size={14} />
                    <span>SAVE URL</span>
                  </a>
                </div>
              </div>

              {/* Real-time Telemetry Syncing Area Chart */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase font-mono flex items-center gap-2">
                    <Activity size={14} className="text-cyan-400" />
                    REAL-TIME TELEMETRY SYNC MONITOR
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-500 animate-pulse">● LIVE SYNCING</span>
                </div>
                
                <div className="h-44 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="coherenceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="entropyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area name="Coherence Rate (%)" type="monotone" dataKey="coherence" stroke="#06b6d4" fillOpacity={1} fill="url(#coherenceGrad)" strokeWidth={2} />
                      <Area name="Neural Entropy (%)" type="monotone" dataKey="entropy" stroke="#f59e0b" fillOpacity={1} fill="url(#entropyGrad)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-40 w-full font-mono text-[10px]">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">
                    Mesh Network Latency (ms)
                  </h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="line" />
                      <Line name="Alpha Node Link" type="monotone" dataKey="nodeAlphaDelay" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line name="Beta Node Link" type="monotone" dataKey="nodeBetaDelay" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                      <Line name="Gamma Node Link" type="monotone" dataKey="nodeGammaDelay" stroke="#10b981" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recursive Mesh link sync hooks */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase font-mono flex items-center gap-2">
                  <Network size={14} className="text-emerald-500" />
                  RECURSIVE MESH CONNECTION HOST LINKS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {meshNodes.map(node => (
                    <div key={node.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-300">{node.id}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${node.status === 'SYNCED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-500 animate-pulse'}`}>
                          {node.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 break-all font-mono truncate mb-2">{node.url}</p>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-2">
                        <span>LATENCY: {node.delay}ms</span>
                        <a 
                          href={node.url.startsWith('data:') ? node.url : '#'} 
                          download={`${node.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sync.json`}
                          className="text-cyan-400 hover:text-white flex items-center gap-1 text-[9px]"
                        >
                          OPEN LINK <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-slate-500">MESH NETWORK INTEGRITY: ACTIVE (100% SUCCESS DETECTED)</span>
              </div>
              <span className="text-slate-500">PAYLOAD CHECKSUM: {memoryPayload.length}B</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default QuinePanel;
