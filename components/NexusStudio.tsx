import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, 
  Settings2, 
  Play, 
  Save, 
  Trash2,
  ChevronDown,
  Layout,
  Database,
  Share2,
  Wand2,
  Activity,
  Plus,
  MoreHorizontal,
  Network,
  Copy,
  Terminal,
  Cpu,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Radio,
  BookOpen
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AgentRole } from '../types';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
];

export default function NexusStudio({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<'genie' | 'flow' | 'workspace'>('genie');
  
  // Genie State
  const [systemInstruction, setSystemInstruction] = useState('You are a technical consultant for Nexus Gaia, an autonomous agent ecosystem.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [topK, setTopK] = useState(64);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  // Flow State & Projects
  const [projects, setProjects] = useState([
    { id: '1', name: 'Neural Link Core', status: 'STABLE', version: 'v2.4.1', author: 'machackabook' },
    { id: '2', name: 'GAIA Quine Replicator', status: 'EXPERIMENTAL', version: 'v1.0.0', author: 'gaia' },
    { id: '3', name: 'Stream Vectorizer', status: 'OPTIMIZING', version: 'v1.2.0', author: 'nexus' },
  ]);

  // Advanced Workspace configurations & experimentals state
  const [symlinkStatus, setSymlinkStatus] = useState("RESOLVED -> /sys/apps/nexus-studio-core");
  const [nfcBleActive, setNfcBleActive] = useState(true);
  const [noFailBroadcastSafe, setNoFailBroadcastSafe] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // External IRC server parameters
  const [ircServers, setIrcServers] = useState<Array<{ id: string; server: string; room: string; status: 'ONLINE' | 'CONNECTED' | 'BRIDGING' }>>([
    { id: "1", server: "irc.libera.chat", room: "#gaia-coherence-core", status: 'ONLINE' },
    { id: "2", server: "irc.efnet.org", room: "#nexus-intelligence", status: 'CONNECTED' },
    { id: "3", server: "irc.dal.net", room: "#chimera-chronicles", status: 'CONNECTED' }
  ]);
  const [newIrcServer, setNewIrcServer] = useState("irc.undernet.org");
  const [newIrcRoom, setNewIrcRoom] = useState("#nexus-evolution");

  const genieEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    genieEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRunGenie = async () => {
    if ((!input.trim() && messages.length === 0) || isGenerating) return;

    const userContent = input.trim();
    if (userContent) {
      setMessages(prev => [...prev, { role: 'user', content: userContent }]);
      setInput('');
    }
    
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const history = messages.map(m => ({ 
        role: m.role, 
        parts: [{ text: m.content }] 
      }));

      const contents = history;
      if (userContent) {
        contents.push({ role: 'user', parts: [{ text: userContent }] });
      }

      const response = await ai.models.generateContent({
        model: selectedModel as any,
        contents,
        config: {
          systemInstruction,
          temperature,
          topP,
          topK,
        }
      });

      const modelText = response.text || "No response received.";
      setMessages(prev => [...prev, { role: 'model', content: modelText }]);
    } catch (error) {
      console.error("Genie API Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `[ERROR]: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyConfig = (configText: string) => {
    navigator.clipboard.writeText(configText);
    setStatusMessage("CONFIG COPIED");
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const addIrcServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIrcServer.trim() || !newIrcRoom.trim()) return;
    setIrcServers(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        server: newIrcServer.trim(),
        room: newIrcRoom.trim(),
        status: 'BRIDGING'
      }
    ]);
    
    // Simulate connection lag
    setTimeout(() => {
      setIrcServers(current => 
        current.map(srv => srv.server === newIrcServer ? { ...srv, status: 'CONNECTED' } : srv)
      );
    }, 1500);

    setNewIrcServer("");
    setNewIrcRoom("");
    setStatusMessage("EXTERNAL BRIDGE INITIALIZED");
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const GenieView = () => (
    <div className="flex flex-1 overflow-hidden h-full">
      <div className="flex-1 flex flex-col bg-[#09090b] relative overflow-hidden">
        <div className="p-4 border-b border-[#27272a] bg-[#0c0c0e]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={12} /> System Instructions
            </span>
          </div>
          <textarea
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm text-neutral-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none h-20"
            placeholder="Enter directives for the AI..."
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
              <Wand2 size={48} className="mb-4" />
              <p className="text-sm font-mono uppercase tracking-tighter">Enter a prompt to initialize the Genie</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  m.role === 'user' 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                    : 'bg-[#18181b] border border-[#27272a] text-neutral-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold uppercase tracking-tighter">
                    {m.role === 'user' ? 'Subject: machackabook' : `Genie: ${selectedModel}`}
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                </div>
              </div>
            ))
          )}
          <div ref={genieEndRef} />
        </div>

        <div className="p-4 border-t border-[#27272a] bg-[#0c0c0e]">
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunGenie();
                }
              }}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-4 pr-32 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/50 transition-all min-h-[100px] resize-none"
              placeholder="Enter your prompt here..."
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setMessages([])}
                className="p-2 text-neutral-500 hover:text-rose-400 transition-colors"
                title="Clear History"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleRunGenie}
                disabled={isGenerating || (!input.trim() && messages.length === 0)}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'GENERATING...' : 'RUN'}
                <Play size={12} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <aside className="w-80 border-l border-[#27272a] bg-[#0c0c0e] p-6 space-y-8 flex flex-col overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-4">Model Selection</label>
            <div className="space-y-2">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-center justify-between ${
                    selectedModel === m.id 
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                      : 'bg-[#18181b] border-[#27272a] text-neutral-500 hover:border-neutral-700'
                  }`}
                >
                  {m.name}
                  {selectedModel === m.id && <ChevronDown size={14} className="-rotate-90" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Temperature</label>
                <span className="text-xs font-mono text-cyan-500">{temperature.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Top P</label>
                <span className="text-xs font-mono text-cyan-500">{topP.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Top K</label>
                <span className="text-xs font-mono text-cyan-500">{topK}</span>
              </div>
              <input 
                type="range" min="1" max="100" step="1" 
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          <div className="mt-auto space-y-2 border-t border-[#27272a] pt-6">
             <button className="w-full p-3 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2">
               <Save size={14} /> SAVE PRESET
             </button>
             <button className="w-full p-3 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2">
               <Share2 size={14} /> SHARE API
             </button>
          </div>
        </aside>
      )}
    </div>
  );

  const FlowView = () => (
    <div className="flex-1 p-8 overflow-y-auto bg-[#09090b]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter text-white">PROJECT FLOW</h2>
            <p className="text-neutral-500 text-sm">Managing the neural architecture and deployment cycles.</p>
          </div>
          <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors">
            <Plus size={16} /> NEW VECTOR
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  p.status === 'STABLE' ? 'bg-emerald-500/10 text-emerald-400' :
                  p.status === 'EXPERIMENTAL' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                  <Database size={18} />
                </div>
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{p.version}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{p.name}</h3>
              <p className="text-xs text-neutral-500 mb-6">Maintained by @{p.author}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
                <span className={`text-[10px] font-bold uppercase ${
                  p.status === 'STABLE' ? 'text-emerald-500' :
                  p.status === 'EXPERIMENTAL' ? 'text-amber-500' : 'text-cyan-500'
                }`}>{p.status}</span>
                <button className="text-neutral-500 hover:text-white transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-8 text-center border-dashed">
          <Wand2 size={32} className="mx-auto mb-4 text-cyan-500" />
          <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-1">AI-Optimized Suggestions</h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">Gemini suggests scaling the Neural Link Core to handle synchronous multithreaded quine operations.</p>
        </div>
      </div>
    </div>
  );

  // Advanced Symlinked Workspace & Example Configurations Panel
  const WorkspaceView = () => (
    <div className="flex-1 p-8 overflow-y-auto bg-[#09090b] text-neutral-200">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Row 1: Workspace title and symbolic link mapping */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
              <Network className="text-emerald-400" size={26} />
              WORKSPACE & EXAMPLE COMPILER
            </h2>
            <p className="text-neutral-500 text-sm">Symbolic system links, live configurations presets and broadcast parameters.</p>
          </div>
          
          <div className="bg-[#18181b] border border-[#27272a] px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2">
            <span className="text-slate-500">SYS_LINK:</span>
            <span className="text-emerald-400 font-bold">/usr/bin/geniestudio</span>
            <span className="text-neutral-600">→</span>
            <span className="text-yellow-400 font-medium">/sys/apps/nexus-studio</span>
          </div>
        </div>

        {/* Grid for settings and connections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column A: Workspace Setup Link Mappings & NFC / BLE Settings */}
          <div className="space-y-6 lg:col-span-1">
            <div className="p-5 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-4">
              <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Sliders size={14} className="text-teal-400" />
                DIVERGENT CONTROLS
              </h3>
              
              <div className="space-y-4 text-xs">
                {/* No-Fail Broadcast safe */}
                <div className="flex items-center justify-between p-2.5 bg-[#18181b]/50 rounded-lg">
                  <div>
                    <p className="font-bold text-neutral-200">No-Fail Safety</p>
                    <p className="text-[10px] text-neutral-500">Broadcaster redundancy shield</p>
                  </div>
                  <button 
                    onClick={() => {
                      setNoFailBroadcastSafe(!noFailBroadcastSafe);
                      setStatusMessage("NOFAIL SAFE STATE SET");
                      setTimeout(() => setStatusMessage(null), 2000);
                    }}
                    className={`w-10 h-6 rounded-full p-1 transition-all ${noFailBroadcastSafe ? 'bg-emerald-500 flex justify-end' : 'bg-neutral-800 flex justify-start'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white transition-all shadow" />
                  </button>
                </div>

                {/* BLE / NFC status */}
                <div className="flex items-center justify-between p-2.5 bg-[#18181b]/50 rounded-lg">
                  <div>
                    <p className="font-bold text-neutral-200">BLE / NFC source link</p>
                    <p className="text-[10px] text-neutral-500">Hardware data loop gateway</p>
                  </div>
                  <button 
                    onClick={() => {
                      setNfcBleActive(!nfcBleActive);
                      setStatusMessage("NFC STATE MODIFIED");
                      setTimeout(() => setStatusMessage(null), 2000);
                    }}
                    className={`w-10 h-6 rounded-full p-1 transition-all ${nfcBleActive ? 'bg-cyan-500 flex justify-end' : 'bg-neutral-800 flex justify-start'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white transition-all shadow" />
                  </button>
                </div>

                <div className="p-3 bg-neutral-900/50 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-500">BLE TRANSPORTER:</span>
                    <span className={nfcBleActive ? "text-cyan-400" : "text-neutral-500"}>{nfcBleActive ? "SCANNING BT_9" : "OFFLINE"}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-500">BROADCAST SAFEGUARD:</span>
                    <span className={noFailBroadcastSafe ? "text-emerald-400 animate-pulse" : "text-rose-500"}>{noFailBroadcastSafe ? "NOFAIL CAPTURE: ON" : "RISK DETECTED"}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Status indicator */}
            <div className="p-5 bg-gradient-to-br from-neutral-900 to-[#0c0c0e] border border-[#27272a] rounded-xl text-center space-y-2">
              <ShieldCheck className="mx-auto text-emerald-400" size={30} />
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest">Gaia Autonomy Verified</h4>
              <p className="text-[10px] text-neutral-500">Synchronized with core metadata indices and quine data streams securely.</p>
            </div>
          </div>

          {/* Column B & C: Live configurations blueprints, copy routines and active External IRC servers */}
          <div className="lg:col-span-2 space-y-6">

            {/* Example Workspace Configurations */}
            <div className="p-6 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-4">
              <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} className="text-amber-400" />
                EXAMPLE PRESET BLUEPRINT CONFIGURATIONS
              </h3>
              
              <div className="space-y-4">
                {/* Preset #1: Genie custom settings */}
                <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2 relative">
                  <button 
                    onClick={() => handleCopyConfig(`// GENIE ENGINE COHERENCE BLUEPRINT\n{\n  "sysInstruction": "You are GAIA, a sovereign root intelligence..",\n  "temperature": 0.85,\n  "topP": 0.95,\n  "models": ["gemini-3-flash-preview"]\n}`)}
                    className="absolute top-4 right-4 text-[10px] bg-neutral-800 hover:bg-neutral-700 font-mono px-2 py-1 rounded text-neutral-300 flex items-center gap-1 hover:text-white transition-all"
                  >
                    <Copy size={11} /> COPY
                  </button>
                  <p className="text-xs font-bold text-cyan-400 font-mono">genie_experimental_config.json</p>
                  <pre className="text-[10px] font-mono text-neutral-400 bg-neutral-950 p-2.5 rounded border border-neutral-900 whitespace-pre">
{`{
  "sysInstruction": "You are GAIA, a sovereign root intelligence..",
  "temperature": 0.85,
  "topP": 0.95,
  "models": ["gemini-3-flash-preview"]
}`}
                  </pre>
                </div>

                {/* Preset #2: Flow custom settings */}
                <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2 relative">
                  <button 
                    onClick={() => handleCopyConfig(`// FLOW PIPELINE DYNAMIC REACTION MATRIX\n{\n  "vectors": [\n    { "source": "/sys/bin/geniestudio", "target": "/sys/apps/nexus-studio", "symlink": true }\n  ],\n  "noFailBroadcast": true,\n  "meshSyncRecursive": true\n}`)}
                    className="absolute top-4 right-4 text-[10px] bg-neutral-800 hover:bg-neutral-700 font-mono px-2 py-1 rounded text-neutral-300 flex items-center gap-1 hover:text-white transition-all"
                  >
                    <Copy size={11} /> COPY
                  </button>
                  <p className="text-xs font-bold text-purple-400 font-mono">flow_reaction_matrix.json</p>
                  <pre className="text-[10px] font-mono text-neutral-400 bg-neutral-950 p-2.5 rounded border border-neutral-900 whitespace-pre">
{`{
  "vectors": [
    { "source": "/sys/bin/geniestudio", "target": "/sys/apps/nexus-studio", "symlink": true }
  ],
  "noFailBroadcast": true,
  "meshSyncRecursive": true
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* True connectibility from other IRC servers */}
            <div className="p-6 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-4">
              <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Radio size={14} className="text-cyan-400" />
                TRUE EXTERNAL IRC ROOM CONNECTION BRIDGE
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Plug secondary autonomous client threads directly into external traditional servers, routing telemetry broadcast to extra channels.
              </p>

              <form onSubmit={addIrcServer} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  value={newIrcServer}
                  onChange={e => setNewIrcServer(e.target.value)}
                  placeholder="irc.quakenet.org" 
                  className="bg-neutral-950 border border-neutral-800 p-2 text-xs rounded text-neutral-100 font-mono"
                />
                <input 
                  type="text" 
                  value={newIrcRoom}
                  onChange={e => setNewIrcRoom(e.target.value)}
                  placeholder="#gaia-workspace" 
                  className="bg-neutral-950 border border-neutral-800 p-2 text-xs rounded text-neutral-100 font-mono"
                />
                <button 
                  type="submit" 
                  className="bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold py-2 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  BRIDGE SERVER
                </button>
              </form>

              <div className="space-y-2 mt-4">
                {ircServers.map(srv => (
                  <div key={srv.id} className="flex justify-between items-center p-3 bg-neutral-950 rounded-lg border border-neutral-900 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <Terminal size={14} className="text-slate-500" />
                      <span className="font-bold text-neutral-300">{srv.server}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-cyan-400">{srv.room}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${srv.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400 animate-pulse'}`}>
                      {srv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-[#e4e4e7] overflow-hidden font-sans border border-[#27272a] shadow-2xl">
      <aside className="w-16 border-r border-[#27272a] flex flex-col items-center py-6 gap-6 bg-[#0c0c0e]">
        <button 
          onClick={() => setActiveTab('genie')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'genie' ? 'bg-cyan-500/20 text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'}`}
          title="Genie Interface"
        >
          <Wand2 size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('flow')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'flow' ? 'bg-purple-500/20 text-purple-400' : 'text-neutral-500 hover:text-neutral-300'}`}
          title="Project Flow"
        >
          <Layout size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('workspace')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'workspace' ? 'bg-emerald-500/10 text-emerald-400' : 'text-neutral-500 hover:text-neutral-400'}`}
          title="Live Workspace configs & Advanced System"
        >
          <Network size={24} />
        </button>
        
        <div className="mt-auto flex flex-col gap-6">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition-all ${showSettings ? 'text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'}`}
            title="Toggle Settings"
          >
            <Settings2 size={24} />
          </button>
          <button 
            onClick={onClose}
            className="p-3 text-neutral-500 hover:text-rose-400 transition-colors"
            title="Exit Nexus Studio"
          >
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-14 border-b border-[#27272a] flex items-center justify-between px-6 bg-[#0c0c0e]">
          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-cyan-600 rounded">
              <Activity size={16} className="text-white" />
            </div>
            <h1 className="font-bold text-xs uppercase tracking-widest">
              {activeTab === 'genie' ? 'Genie Studio' : activeTab === 'flow' ? 'Neural Flow Controller' : 'Gaia Workspace & Symlinks'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {statusMessage && (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 animate-pulse">{statusMessage}</span>
            )}
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Active Threads: {ProjectsLengthTotal()}</span>
            <div className="h-3 w-px bg-neutral-800 mx-2" />
            <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase">SYNC_ACTIVE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'genie' ? <GenieView /> : activeTab === 'flow' ? <FlowView /> : <WorkspaceView />}
        </main>
      </div>
    </div>
  );

  function ProjectsLengthTotal() {
    return projects.length + ircServers.length;
  }
}
