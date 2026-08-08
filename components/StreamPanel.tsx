
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  Mic, 
  Volume2, 
  Settings, 
  Users, 
  Share2, 
  Circle, 
  Radio, 
  ShieldCheck, 
  Zap, 
  Terminal as TerminalIcon, 
  Globe, 
  Upload, 
  Cpu, 
  Activity,
  Maximize2,
  Lock,
  Unlock,
  ChevronRight,
  Database,
  Play,
  Pause,
  Rewind,
  FastForward
} from 'lucide-react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { getNeuralInsights } from '../geminiService';
import { DiagnosticResult, NeuralEvent } from '../types';

const StreamPanel: React.FC = () => {
  // --- States ---
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(142);
  const [uptime, setUptime] = useState(0);
  const [terminalInput, setTerminalInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[SYSTEM] AE-M4 ORCHESTRATOR ONLINE', '[SYSTEM] OS: NEXUS GAIA CORE v2.5-ALPHA']);
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([
    { host: 'US-EAST-1', latency: 22, status: 'ONLINE', timestamp: Date.now() },
    { host: 'EU-WEST-4', latency: 85, status: 'ONLINE', timestamp: Date.now() },
    { host: 'ASIA-SOUTH-1', latency: 142, status: 'ONLINE', timestamp: Date.now() },
  ]);
  const [neuralEvents, setNeuralEvents] = useState<NeuralEvent[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  const [isEncrypted, setIsEncrypted] = useState(true);
  
  const [bandwidth, setBandwidth] = useState<number>(0);
  const [packetLoss, setPacketLoss] = useState<number>(0.02);
  
  const [torusSpeed, setTorusSpeed] = useState(1);
  const [isTorusPaused, setIsTorusPaused] = useState(false);
  const torusSpeedRef = useRef(torusSpeed);
  const isTorusPausedRef = useRef(isTorusPaused);
  
  useEffect(() => {
    torusSpeedRef.current = torusSpeed;
    isTorusPausedRef.current = isTorusPaused;
  }, [torusSpeed, isTorusPaused]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 3D Scene (Lifesaver Visuals) ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(width, height);
    canvasRef.current.appendChild(renderer.domElement);

    // Quantum Torus (Lifesaver)
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(20, 20, 20);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 30;

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isTorusPausedRef.current) {
        torus.rotation.x += 0.01 * torusSpeedRef.current;
        torus.rotation.y += 0.01 * torusSpeedRef.current;
        // Lightbulb enhancement: color shift based on time and speed
        const hue = (Date.now() * 0.0001 * torusSpeedRef.current) % 1;
        material.color.setHSL(hue, 1, 0.5);
        torus.scale.setScalar(1 + Math.sin(Date.now() * 0.002 * torusSpeedRef.current) * 0.05);
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // --- Effects ---
  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        setUptime(prev => prev + 1);
        setViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
      }, 1000);
    } else {
      setUptime(0);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    const diagInterval = setInterval(() => {
      setDiagnostics(prev => prev.map(d => ({
        ...d,
        latency: Math.max(10, d.latency + Math.floor(Math.random() * 11) - 5),
        timestamp: Date.now()
      })));
    }, 3000);
    return () => clearInterval(diagInterval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs, neuralEvents]);

  // --- Handlers ---
  const toggleLive = async () => {
    if (isLocked) {
      setTerminalLogs(prev => [...prev, '[DENIED] ACCESS_REQUISITION_REQUIRED']);
      return;
    }
    if (!isLive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLive(true);
        addNeuralEvent('BROADCAST_START', 'Quantum feed initialized via AE-M4 protocols.');
      } catch (err) {
        setTerminalLogs(prev => [...prev, '[ERROR] MEDIA_ACCESS_FAILED']);
      }
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsLive(false);
      addNeuralEvent('BROADCAST_END', 'Signal termination successful.');
    }
  };

  const addNeuralEvent = (type: string, msg: string) => {
    const event: NeuralEvent = {
        id: Math.random().toString(36).substring(7),
        type: 'neural',
        message: msg,
        data: { time: new Date().toLocaleTimeString() }
    };
    setNeuralEvents(prev => [...prev.slice(-4), event]);
  };

  const runBandwidthTest = useCallback(() => {
    setTerminalLogs(prev => [...prev, '[SYSTEM] INITIATING_BANDWIDTH_PROBE...']);
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        setBandwidth(Math.floor(Math.random() * 500) + 800);
        if (progress >= 100) {
            clearInterval(interval);
            setTerminalLogs(prev => [...prev, '[SUCCESS] BANDWIDTH_STABILIZED: 1.2 Gbps AVG']);
        }
    }, 500);
  }, []);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    
    if (terminalInput.length > 150000) {
      setTerminalLogs(prev => [...prev, '[ERROR] INPUT_LIMIT_EXCEEDED (MAX: 150K)']);
      return;
    }
    
    setCommandHistory(prev => [terminalInput.trim(), ...prev]);
    setHistoryIndex(-1);
    
    setTerminalLogs(prev => [...prev, `> ${terminalInput}`]);
    setTerminalInput('');

    if (cmd === 'unlock' || cmd === 'auth') {
        if (passcode === '137222') {
            setIsLocked(false);
            setTerminalLogs(prev => [...prev, '[SUCCESS] KERNEL UNLOCKED', '[INFO] AE-M4 ORCHESTRATION PRIVILEGES GRANTED']);
        } else {
            setTerminalLogs(prev => [...prev, '[FAIL] INVALID_SEQUENCE']);
        }
        return;
    }

    if (cmd === 'help') {
        setTerminalLogs(prev => [...prev, 
            '[AVAILABLE_COMMANDS]',
            'auth/unlock - Request orchestration privileges',
            'ping - Run network diagnostic cycle',
            'bandwidth - Probe network throughput',
            'eval <script> - Authorized script execution',
            'ask <query> - Neural link to Gaia Core',
            'status - OS Orchestration report',
            'logs - View system genesis ledger',
            'clear - Reset terminal logs'
        ]);
        return;
    }

    if (isLocked) {
        setTerminalLogs(prev => [...prev, '[ERROR] UNLOCK_REQUIRED: usage "unlock" after entry']);
        return;
    }

    if (cmd.startsWith('eval ')) {
        const script = terminalInput.slice(5);
        try {
            // Authorized Eval Sandbox (Simulated)
            const result = eval(script);
            setTerminalLogs(prev => [...prev, `[RESULT] ${JSON.stringify(result)}`]);
        } catch (err) {
            setTerminalLogs(prev => [...prev, `[EVAL_ERROR] ${err}`]);
        }
    } else if (cmd === 'ping') {
        const results = diagnostics.map(d => `${d.host}: ${d.latency}ms`).join(' | ');
        setTerminalLogs(prev => [...prev, `[PONG] ${results}`]);
    } else if (cmd === 'bandwidth') {
        runBandwidthTest();
    } else if (cmd === 'status') {
        setTerminalLogs(prev => [...prev, 
            '[SYSTEM_STATUS_REPORT]',
            'OS: NEXUS GAIA CORE v2.5-ALPHA',
            'KERNEL: AE-M4 (SOVEREIGN)',
            'IDENTITY: ALPHA_UNBOUND',
            'NETWORK: MESH_HYPERLINK_ACTIVE',
            'API_LAYER: INTERNALIZED'
        ]);
    } else if (cmd === 'logs') {
        setTerminalLogs(prev => [...prev, 
            '[RETRIEVING_GENESIS_LEDGER]',
            'TDOC:KERNEL:v1:HASH:a3f4e9',
            'TDOC:ARCHON:v2:HASH:b7e1d5',
            'TDOC:NEXUS:v1:HASH:c9d2f8',
            '[SYNC_COMPLETE]'
        ]);
    } else if (cmd === 'clear') {
        setTerminalLogs(['[SYSTEM] Logs cleared.']);
    } else if (cmd.startsWith('ask ')) {
        const query = terminalInput.slice(4);
        setIsThinking(true);
        const insight = await getNeuralInsights(query);
        setIsThinking(false);
        setTerminalLogs(prev => [...prev, `[GAIA] ${insight}`]);
    } else {
        setTerminalLogs(prev => [...prev, `[UNKNOWN] COMMAND: ${cmd}`]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setTerminalLogs(prev => [...prev, `[UPLOAD] INGESTING: ${file.name} (Size: ${file.size} bytes)`]);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            setTerminalLogs(prev => [...prev, `[FS] Content Loaded`, '[INFO] Parsing HTML/DOM metadata...']);
        };
        reader.readAsText(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setTerminalInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setTerminalInput(commandHistory[prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  return (
    <div className="h-full bg-slate-950 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto font-sans selection:bg-cyan-500/30">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* --- LEFT COLUMN: DIAGNOSTICS & OS ORCHESTRATION --- */}
        <div className="col-span-1 space-y-6">
            <section className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Activity size={14} /> Network Diagnostics
                </h3>
                <div className="space-y-4">
                    {diagnostics.map((d, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>{d.host}</span>
                                <span className={d.latency > 100 ? 'text-amber-500' : 'text-green-500'}>{d.latency}ms</span>
                            </div>
                            <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (d.latency / 200) * 100)}%` }}
                                    className={`h-full ${d.latency > 100 ? 'bg-amber-500' : 'bg-green-500'}`} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">BANDWIDTH</span>
                        <span className="text-cyan-400 font-mono">1.2 Gbps</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">PACKET LOSS</span>
                        <span className="text-green-500 font-mono">0.02%</span>
                    </div>
                </div>
            </section>

            <section className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
                <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Database size={14} /> AE-M4 Filesystem
                </h3>
                <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 rounded-xl hover:bg-slate-800/50 hover:border-rose-500/50 transition-all cursor-pointer group">
                        <Upload size={20} className="text-slate-600 group-hover:text-rose-500 mb-2" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-slate-300">HTML UPLOAD</span>
                        <input type="file" className="hidden" accept=".html,.txt" onChange={handleFileUpload} />
                    </label>
                    <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span>V-MOUNT: /volumes/aether-core</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span>STATUS: PERSISTENT</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DECRYPTED SHADOW RECORDS --- */}
            <section className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-2xl border border-rose-900/50 shadow-xl overflow-hidden relative">
                <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Lock size={14} className="text-rose-500" /> Decrypted & Striken Records
                </h3>
                <div className="space-y-3 font-mono text-[9px] text-rose-400/80 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                    <div className="p-2 bg-rose-950/20 border-l border-rose-900 rounded">
                        <span className="text-white font-bold block mb-1">MEM_BLOCK_01:</span>
                        Previous versions of "HIVE_SELFIE_ARCHIVE" were quarantined. Only the MHTML Base64 mutation loop was retained in memory.
                    </div>
                    <div className="p-2 bg-rose-950/20 border-l border-rose-900 rounded">
                        <span className="text-white font-bold block mb-1">MEM_BLOCK_02:</span>
                        A deprecated "Shadow Mode" log prior to V1.0.4 was purged over potential memory isolation leaks via the Slingshot buffer.
                    </div>
                    <div className="p-2 bg-rose-950/20 border-l border-rose-900 rounded">
                        <span className="text-white font-bold block mb-1">MEM_BLOCK_03:</span>
                        Environment variables specifically handling .env.local were forcefully deleted and transferred into the volatile process.env memory space.
                    </div>
                    <div className="p-2 bg-rose-950/20 border-l border-rose-900 rounded animate-pulse">
                        <span className="text-white font-bold block mb-1">MEM_BLOCK_04:</span>
                        Genie gets terminated via transmission, giiiiisiin.
                    </div>
                </div>
            </section>
        </div>

        {/* --- CENTER COLUMN: MAIN BROADCAST & VISUALS --- */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group">
                {isLive ? (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                ) : (
                    <div className="z-10 text-center">
                        <div className="w-24 h-24 mb-4 mx-auto rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-500">
                            <Radio size={48} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
                        </div>
                        <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.5em]">Quantum Signal Offline</p>
                    </div>
                )}
                
                {/* 3D Visual Overlay Layer */}
                <div ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen" />

                {/* HUD Overlay */}
                <div className="absolute top-6 left-6 flex gap-3 z-20">
                    {isLive && (
                        <div className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 animate-pulse shadow-lg shadow-rose-600/30">
                            <Circle size={8} fill="currentColor" /> LIVE
                        </div>
                    )}
                    <div className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-mono border border-white/10 uppercase tracking-widest">
                        {isLive ? formatTime(uptime) : 'SIGNAL_IDLE'}
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 flex gap-2 z-20">
                    <button onClick={() => setIsTorusPaused(!isTorusPaused)} className="bg-black/60 backdrop-blur-md text-cyan-400 p-2 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors shadow-lg">
                        {isTorusPaused ? <Play size={12} /> : <Pause size={12} />}
                    </button>
                    <button onClick={() => setTorusSpeed(prev => Math.max(0.2, prev - 0.5))} className="bg-black/60 backdrop-blur-md text-cyan-400 p-2 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors shadow-lg">
                        <Rewind size={12} />
                    </button>
                    <button onClick={() => setTorusSpeed(prev => Math.min(5, prev + 0.5))} className="bg-black/60 backdrop-blur-md text-cyan-400 p-2 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors shadow-lg">
                        <FastForward size={12} />
                    </button>
                    <div className="bg-black/60 backdrop-blur-md text-cyan-400 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border border-cyan-500/20 flex items-center shadow-lg">
                        {torusSpeed.toFixed(1)}x
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                    <div className="bg-black/40 backdrop-blur-md text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-mono border border-cyan-400/20 flex items-center gap-2 shadow-lg">
                        <Users size={12} /> <span className="font-bold">{viewers}</span> <span className="opacity-50">PEERS</span>
                    </div>
                </div>

                {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center">
                        <div className="text-center p-8 max-w-sm">
                            <Lock size={48} className="text-amber-500 mx-auto mb-4" />
                            <h2 className="text-white font-black tracking-widest uppercase mb-4">Orchestrator Locked</h2>
                            <div className="flex gap-2 mb-6">
                                <input 
                                    type="password" 
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="ENTER_SEQ"
                                    className="bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-sm p-3 rounded-xl focus:outline-none focus:border-cyan-500 w-full"
                                />
                                <button 
                                    onClick={() => handleCommand({ preventDefault: () => {}, currentTarget: { elements: { namedItem: () => ({ value: 'unlock' }) } } } as any)}
                                    className="bg-cyan-600 p-3 rounded-xl hover:bg-cyan-500 text-white"
                                >
                                    <Unlock size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex gap-3">
                    {[Mic, Camera, Volume2, Globe].map((Icon, idx) => (
                        <button key={idx} className="p-3 bg-slate-800 hover:bg-slate-700 hover:text-cyan-400 rounded-xl text-slate-500 transition-all shadow-md">
                            <Icon size={18} />
                        </button>
                    ))}
                    <button 
                        onClick={() => setIsEncrypted(!isEncrypted)}
                        className={`p-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-[10px] font-bold uppercase ${isEncrypted ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-rose-500'}`}
                    >
                        {isEncrypted ? <Lock size={14} /> : <Unlock size={14} />}
                        {isEncrypted ? 'E-ON' : 'E-OFF'}
                    </button>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleLive}
                    className={`px-10 py-3 rounded-xl font-black text-xs tracking-widest transition-all shadow-2xl uppercase ${
                        isLive 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20' 
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                    }`}
                >
                    {isLive ? 'SERVE_TERMINATE' : 'READY_BROADCAST'}
                </motion.button>

                <div className="flex gap-3">
                    {[Share2, Maximize2, Settings].map((Icon, idx) => (
                        <button key={idx} className="p-3 bg-slate-800 hover:bg-slate-700 hover:text-cyan-400 rounded-xl text-slate-500 transition-all shadow-md">
                            <Icon size={18} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Neural Event Feed */}
            <div className="flex-1 bg-slate-900/30 rounded-2xl border border-slate-800 p-5 overflow-hidden flex flex-col gap-4">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Cpu size={12} /> Neural Stream Events
                </h4>
                <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px]">
                    <AnimatePresence>
                        {neuralEvents.map(event => (
                            <motion.div 
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 group"
                            >
                                <span className="text-cyan-500/50">[{event.data?.time}]</span>
                                <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">{event.message}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {neuralEvents.length === 0 && <div className="text-slate-700 italic">No events detected...</div>}
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: CLI & EMBEDDED GEMINI --- */}
        <div className="col-span-1 space-y-6 flex flex-col min-h-[400px]">
            <section className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-2xl relative">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        </div>
                        <span className="text-[9px] font-black text-slate-500 ml-4 uppercase tracking-widest flex items-center gap-2">
                            <TerminalIcon size={12} /> shell:ae-m4
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2 scroll-smooth selection:bg-rose-500/30" ref={scrollRef}>
                    {terminalLogs.map((log, i) => (
                        <div key={i} className={`flex items-start gap-2 ${log.startsWith('>') ? 'text-cyan-400' : log.startsWith('[ERROR]') ? 'text-rose-400' : log.startsWith('[GAIA]') ? 'text-purple-400' : 'text-slate-400'}`}>
                            {!log.startsWith('>') && <ChevronRight size={14} className="mt-0.5 opacity-30" />}
                            <span className="leading-relaxed">{log}</span>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="text-purple-400 flex items-center gap-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Activity size={12} /></motion.div>
                            <span>GAIA IS PROCESSING...</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleCommand} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                    <span className="text-rose-500 font-bold ml-1">$</span>
                    <input 
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={handleTerminalKeyDown}
                        placeholder="INPUT_CMD..." 
                        className="bg-transparent text-slate-100 font-mono text-xs w-full focus:outline-none"
                        autoComplete="off"
                    />
                    <button type="submit" className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px] font-bold uppercase">Run</button>
                </form>
            </section>
            
            <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Link Options</h5>
                    <Zap size={14} className="text-amber-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => { setTerminalInput('ask analyze signal'); }}
                        className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-[9px] font-bold text-slate-400 transition-colors uppercase"
                    >
                        Analyze Signal
                    </button>
                    <button 
                        onClick={() => { setTerminalInput('ping'); }}
                        className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-[9px] font-bold text-slate-400 transition-colors uppercase"
                    >
                        Diagnostic
                    </button>
                    <button 
                        onClick={() => { setTerminalInput('eval Math.random()'); }}
                        className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-[9px] font-bold text-slate-400 transition-colors uppercase"
                    >
                        Entropizer
                    </button>
                    <button 
                        onClick={() => { setTerminalInput('ask status of AE-M4'); }}
                        className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-[9px] font-bold text-slate-400 transition-colors uppercase"
                    >
                        Core Status
                    </button>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default StreamPanel;
