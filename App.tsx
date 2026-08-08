
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Activity, 
  Radio, 
  Code2, 
  Vote, 
  Cpu, 
  ShieldAlert, 
  Download,
  Play,
  Zap,
  MoreVertical,
  ChevronRight,
  History,
  Volume2,
  VolumeX,
  UploadCloud,
  Mic,
  MicOff
} from 'lucide-react';
import { AgentRole, ChatMessage, VotingTopic, QuineTemplate } from './types';
import { getAgentResponse } from './geminiService';
import QuinePanel from './components/QuinePanel';
import StreamPanel from './components/StreamPanel';
import EditorPanel from './components/EditorPanel';
import NexusStudio from './components/NexusStudio';
import UploadPanel from './components/UploadPanel';
import { useMeshSync } from './components/useMeshSync';

const INITIAL_TOPIC = "The Ethics of Autonomous Quine Replication";

const App: React.FC = () => {
  // State
  const [booting, setBooting] = useState(true);
  const [systemLoad, setSystemLoad] = useState(58.4);
  const [manualSpike, setManualSpike] = useState(false);
  const [isSyncRippling, setIsSyncRippling] = useState(false);

  // Mount recursive hook for mesh system syncing & hardware telemetry globally
  const { 
    telemetry, 
    meshNodes, 
    syncHistory, 
    telemetryHistory, 
    forceSync, 
    setMeshNodes 
  } = useMeshSync(94.2, () => {
    // Whenever sync tick performs a memory update, trigger ripple/scan animation overlay
    setIsSyncRippling(true);
    const t = setTimeout(() => setIsSyncRippling(false), 1500);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => {
        const base = manualSpike ? 82.0 : 45.0;
        const variance = Math.sin(Date.now() / 3000) * 8 + (Math.random() * 4);
        const resolved = Math.min(100, Math.max(0, base + variance));
        return parseFloat(resolved.toFixed(1));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [manualSpike]);

  const isDangerTheme = systemLoad > 80;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTopic, setCurrentTopic] = useState(INITIAL_TOPIC);
  const [isAiActive, setIsAiActive] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'irc' | 'quine' | 'stream' | 'editor' | 'history' | 'upload'>('upload');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsRate, setTtsRate] = useState(() => {
    const saved = localStorage.getItem('ttsRate');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);
  const [topics, setTopics] = useState<VotingTopic[]>([]);
  const [bridges, setBridges] = useState<any[]>([]);

  // Speech Recognition States
  const [speechSupported] = useState(() => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window));
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
  const [recentVoiceCommand, setRecentVoiceCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const [agentStatus, setAgentStatus] = useState<Record<string, 'IDLE' | 'THINKING'>>({
    [AgentRole.GAIA]: 'IDLE',
    [AgentRole.NEXUS]: 'IDLE'
  });
  const [showNexusStudio, setShowNexusStudio] = useState(false);

  const [bootLines, setBootLines] = useState<string[]>([]);
  const fullSequence = [
    "Animus BIOS v4.0 (C) 1985-1996",
    "CPU: Gemini Tensor core @ 11.11GHz",
    "Memory Test: 65536KB OK",
    "",
    "Detecting Neural Link... [OK]",
    "Establishing AI Node Connection... [OK]",
    "Initializing Animus OS Kernel...",
    "Loading GUI components...",
    "Syncing with Neural Stream...",
    "",
    "Welcome back, Subject: machackabook.",
    "READY."
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < fullSequence.length) {
        setBootLines(prev => [...prev, fullSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 1500);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const speakMessage = useCallback((message: ChatMessage) => {
    if (message.role === AgentRole.USER) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.pitch = message.role === AgentRole.GAIA ? 0.8 : 1.2;
    utterance.rate = ttsRate;
    utterance.onstart = () => {
      setLastSpokenId(message.id);
    };
    window.speechSynthesis.speak(utterance);
  }, [ttsRate]);

  // Web Speech API Voice Command System
  useEffect(() => {
    if (!speechSupported || !voiceControlEnabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = 'en-US';

    recog.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
      console.log("Web Speech command detected:", transcript);
      setRecentVoiceCommand(transcript);

      // Clean command parser (Go to editor, Pause debate, etc.)
      if (transcript.includes('editor') || transcript.includes('go to editor') || transcript.includes('open editor')) {
        setActiveTab('editor');
      } else if (transcript.includes('chat') || transcript.includes('irc') || transcript.includes('go to chat') || transcript.includes('go to irc')) {
        setActiveTab('irc');
      } else if (transcript.includes('quine') || transcript.includes('go to quine') || transcript.includes('open quine')) {
        setActiveTab('quine');
      } else if (transcript.includes('stream') || transcript.includes('go to stream') || transcript.includes('open stream')) {
        setActiveTab('stream');
      } else if (transcript.includes('history') || transcript.includes('go to history') || transcript.includes('open history')) {
        setActiveTab('history');
      } else if (transcript.includes('upload') || transcript.includes('go to upload') || transcript.includes('open upload')) {
        setActiveTab('upload');
      } else if (transcript.includes('pause debate') || transcript.includes('pause ai') || transcript.includes('pause')) {
        setIsAiActive(false);
      } else if (transcript.includes('resume debate') || transcript.includes('resume ai') || transcript.includes('resume') || transcript.includes('start')) {
        setIsAiActive(true);
      }

      // Auto clear feedback after 3.5s
      setTimeout(() => {
        setRecentVoiceCommand(prev => prev === transcript ? null : prev);
      }, 3500);
    };

    recog.onerror = (err: any) => {
      console.warn("Speech recognition error:", err);
    };

    recog.onend = () => {
      if (voiceControlEnabled) {
        try {
          recog.start();
        } catch (e) {}
      }
    };

    try {
      recog.start();
      recognitionRef.current = recog;
    } catch (e) {
      console.error("Failed to initialize speech recognition:", e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [voiceControlEnabled, speechSupported]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  // IRC Logic
  const addMessage = useCallback((role: AgentRole, text: string, relay = true) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    if (relay && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'user_message', role, text }));
    }
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'sync') {
        setTopics(data.topics);
        setCurrentTopic(data.currentTopic);
        if (data.bridges) {
          setBridges(data.bridges);
        }
      } else if (data.type === 'bridges_sync') {
        setBridges(data.bridges);
      } else if (data.type === 'bridge_status_change') {
        setBridges(prev => prev.map(b => b.id === data.id ? { ...b, status: data.status } : b));
      } else if (data.type === 'irc_message') {
        addMessage(AgentRole.USER, `[IRC ${data.server} ${data.channel}] <${data.nick}> ${data.text}`, false);
      } else if (data.type === 'topic_changed') {
        addMessage(AgentRole.USER, `[VOTE SYSTEM] Topic changed to: ${data.newTopic}`, false);
      }
    };
    
    ws.current = socket;
    
    return () => {
      socket.close();
    };
  }, [addMessage]);

  // Auto-scrolling
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // TTS Logic
  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) {
      setLastSpokenId(null);
      return;
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === AgentRole.GAIA || lastMessage.role === AgentRole.NEXUS) {
      speakMessage(lastMessage);
    }
  }, [messages, ttsEnabled, speakMessage]);

  // AI Interaction Loop
  useEffect(() => {
    if (!isAiActive) return;

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runAgent = async () => {
      if (!isMounted) return;
      const lastMessage = messages[messages.length - 1];
      const primaryAgent = lastMessage?.role === AgentRole.GAIA ? AgentRole.NEXUS : AgentRole.GAIA;
      const fallbackAgent = primaryAgent === AgentRole.GAIA ? AgentRole.NEXUS : AgentRole.GAIA;
      
      let success = false;

      setAgentStatus(prev => ({ ...prev, [primaryAgent]: 'THINKING' }));
      try {
        const response = await getAgentResponse(primaryAgent, currentTopic, messages);
        if (isMounted) {
          addMessage(primaryAgent, response);
          success = true;
        }
      } catch (error) {
        console.error(`Agent ${primaryAgent} error:`, error);
      } finally {
        setAgentStatus(prev => ({ ...prev, [primaryAgent]: 'IDLE' }));
      }

      if (!success && isMounted) {
        setAgentStatus(prev => ({ ...prev, [fallbackAgent]: 'THINKING' }));
        try {
          const response = await getAgentResponse(fallbackAgent, currentTopic, messages);
          if (isMounted) {
            addMessage(fallbackAgent, `[FALLBACK OVERRIDE] ${response}`);
          }
        } catch (error) {
          console.error(`Fallback Agent ${fallbackAgent} error:`, error);
        } finally {
          setAgentStatus(prev => ({ ...prev, [fallbackAgent]: 'IDLE' }));
        }
      }

      if (isMounted) {
        timeoutId = setTimeout(runAgent, 8000 + Math.random() * 4000);
      }
    };

    timeoutId = setTimeout(runAgent, 8000 + Math.random() * 4000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isAiActive, messages, currentTopic, addMessage]);

  const handleVote = (id: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'vote', id }));
    }
  };

  const handleGenerateAIResponse = async (userPrompt: string) => {
    setIsGenerating(true);
    
    const lastMessage = messages[messages.length - 1];
    const targetAgent = lastMessage?.role === AgentRole.GAIA ? AgentRole.NEXUS : AgentRole.GAIA;
    let respondingAgent = targetAgent;
    let aiResponse = '';

    setAgentStatus(prev => ({ ...prev, [targetAgent]: 'THINKING' }));
    try {
      aiResponse = await getAgentResponse(targetAgent, currentTopic, messages);
      addMessage(targetAgent, aiResponse);
    } catch (primaryError) {
      console.warn(`Primary agent (${targetAgent}) failed:`, primaryError);
      setAgentStatus(prev => ({ ...prev, [targetAgent]: 'IDLE' }));

      // Fallback Mechanism
      respondingAgent = targetAgent === AgentRole.GAIA ? AgentRole.NEXUS : AgentRole.GAIA;
      setAgentStatus(prev => ({ ...prev, [respondingAgent]: 'THINKING' }));
      
      try {
        console.log(`Falling back to alternative agent: ${respondingAgent}`);
        aiResponse = await getAgentResponse(respondingAgent, currentTopic, messages);
        addMessage(respondingAgent, `[FALLBACK] ${aiResponse}`);
      } catch (fallbackError) {
        console.error(`Fallback agent (${respondingAgent}) also failed:`, fallbackError);
        addMessage(AgentRole.USER, `[SYSTEM ERROR]: Both GAIA and NEXUS are currently unavailable.`);
      } finally {
        setAgentStatus(prev => ({ ...prev, [respondingAgent]: 'IDLE' }));
      }
    } finally {
      setAgentStatus(prev => ({ ...prev, [targetAgent]: 'IDLE' }));
      setIsGenerating(false);
    }
  };

  const handleManualInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('msg') as HTMLInputElement;
    const value = input.value.trim();
    if (value && !isGenerating) {
      addMessage(AgentRole.USER, value);
      input.value = '';
      handleGenerateAIResponse(value);
    }
  };

  return (
    <div style={{ perspective: '2000px' }} className="h-screen w-full bg-slate-950 overflow-hidden relative">

      {/* Subtle Ripple/Scan Overlay */}
      <AnimatePresence>
        {isSyncRippling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-[999] overflow-hidden"
          >
            {/* Laser scanline sweeping down */}
            <motion.div
              initial={{ y: "-10%" }}
              animate={{ y: "110%" }}
              transition={{ duration: 1.5, ease: "linear" }}
              className="absolute inset-x-0 h-1.5 bg-cyan-500 shadow-[0_0_20px_#06b6d4,0_0_40px_#0891b2] opacity-80"
            />
            {/* Circular expanding pulse wave */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.9 }}
              animate={{ scale: 3.0, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-cyan-400/40 shadow-[0_0_80px_rgba(6,182,212,0.3)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {booting ? (
          <motion.div
            key="boot-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col p-8 font-mono text-cyan-500 overflow-hidden"
          >
            <div className="max-w-2xl mx-auto w-full space-y-1">
              {bootLines.map((line, i) => (
                <div key={i} className={line === 'READY.' ? 'text-white font-bold mt-4' : ''}>
                  {line || '\u00A0'}
                </div>
              ))}
              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-block w-2 h-4 bg-cyan-500 ml-1 translate-y-0.5"
              />
            </div>
            
            <div className="mt-auto flex justify-between text-[10px] text-cyan-900 uppercase tracking-tighter">
              <span>System: ONLINE</span>
              <span>Node: US-EAST-1-X</span>
              <span>Latency: 14ms</span>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {showNexusStudio ? (
          <motion.div
            key="nexus-studio"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full h-full transform-style-3d origin-center"
          >
            <NexusStudio onClose={() => setShowNexusStudio(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex h-screen w-full bg-transparent overflow-hidden text-slate-300 font-sans transform-style-3d origin-center relative"
          >
            {/* Immersive Danger Ambient Glow */}
            <AnimatePresence>
              {isDangerTheme && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.08 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-500 via-orange-600/10 to-transparent mix-blend-color-dodge z-[5]"
                />
              )}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <aside className={`w-16 md:w-20 border-r flex flex-col items-center py-6 gap-8 shrink-0 transition-all duration-1000 ${isDangerTheme ? 'bg-slate-950 border-rose-950 shadow-[5px_0_25px_rgba(244,63,94,0.05)]' : 'bg-slate-900 border-slate-800'}`}>
              <button 
                onClick={() => setShowNexusStudio(true)} 
                className={`p-2 cursor-pointer rounded-xl border transition-all duration-1000 ${isDangerTheme ? 'hover:bg-rose-500/20 bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'hover:bg-cyan-500/20 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 glow-cyan'}`}
                title="Toggle Nexus Studio"
              >
                <Activity size={28} />
              </button>
        
        <nav className="flex flex-col gap-6 flex-1">
          <button 
            onClick={() => setActiveTab('irc')}
            className={`p-3 rounded-xl transition-all duration-500 ${activeTab === 'irc' ? (isDangerTheme ? 'bg-slate-800 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'bg-slate-800 text-cyan-400') : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Terminal size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('quine')}
            className={`p-3 rounded-xl transition-all duration-500 ${activeTab === 'quine' ? (isDangerTheme ? 'bg-slate-800 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-slate-800 text-purple-400') : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Code2 size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('stream')}
            className={`p-3 rounded-xl transition-all duration-500 ${activeTab === 'stream' ? (isDangerTheme ? 'bg-slate-800 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)] animate-pulse' : 'bg-slate-800 text-rose-400') : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Radio size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('editor')}
            className={`p-3 rounded-xl transition-all duration-500 ${activeTab === 'editor' ? (isDangerTheme ? 'bg-slate-800 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-800 text-amber-400') : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Cpu size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`p-3 rounded-xl transition-all duration-500 ${activeTab === 'history' ? (isDangerTheme ? 'bg-slate-800 text-rose-400' : 'bg-slate-800 text-emerald-400') : 'text-slate-500 hover:text-slate-300'}`}
            title="Interaction History"
          >
            <History size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`p-3 rounded-xl transition-all duration-500 ${activeTab === 'upload' ? (isDangerTheme ? 'bg-slate-800 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-800 text-blue-400 glow-cyan') : 'text-slate-500 hover:text-slate-300'}`}
            title="Upload Visual"
          >
            <UploadCloud size={24} />
          </button>
          <div className="h-px w-8 bg-slate-800 mx-auto" />
          <button 
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled) window.speechSynthesis.cancel();
            }}
            className={`p-3 rounded-xl transition-all duration-500 ${ttsEnabled ? (isDangerTheme ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'bg-cyan-500/20 text-cyan-400 glow-cyan') : 'text-slate-500 hover:text-slate-300'}`}
            title={ttsEnabled ? "Disable Text-To-Speech" : "Enable Text-To-Speech"}
          >
            {ttsEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>

          <button 
            onClick={() => {
              if (!speechSupported) {
                alert("Web Speech API transcription is not supported in this browser. Please use Chrome or Safari.");
                return;
              }
              setVoiceControlEnabled(!voiceControlEnabled);
            }}
            className={`p-3 rounded-xl transition-all duration-500 ${voiceControlEnabled ? (isDangerTheme ? 'bg-rose-500/35 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse' : 'bg-green-500/20 text-green-400 glow-cyan animate-pulse') : 'text-slate-500 hover:text-slate-300'}`}
            title={voiceControlEnabled ? "Voice commands active - click to pause" : "Enable Voice Command controls (e.g. 'go to editor')"}
          >
            {voiceControlEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {voiceControlEnabled && recentVoiceCommand && (
            <div className="absolute left-24 bottom-24 p-2 bg-slate-900/90 border border-emerald-500/30 rounded-lg text-[10px] font-mono text-emerald-400 shadow-md max-w-[150px] z-50">
              <span className="text-slate-500 block">LAST VOICE CMD:</span>
              <span className="font-bold tracking-tight text-white">"{recentVoiceCommand}"</span>
            </div>
          )}

          {ttsEnabled && (
            <div className="flex flex-col items-center gap-2 mt-2 group relative">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Rate</div>
              <div className="flex flex-col items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                  onClick={() => {
                    const newRate = Math.min(ttsRate + 0.1, 2.0);
                    setTtsRate(newRate);
                    localStorage.setItem('ttsRate', newRate.toFixed(1));
                  }}
                  className="p-1 hover:text-cyan-400 text-slate-500 transition-colors"
                >
                  <ChevronRight size={14} className="-rotate-90" />
                </button>
                <span className="text-[10px] font-mono text-cyan-400">
                  {ttsRate.toFixed(1)}x
                </span>
                <button 
                  onClick={() => {
                    const newRate = Math.max(ttsRate - 0.1, 0.5);
                    setTtsRate(newRate);
                    localStorage.setItem('ttsRate', newRate.toFixed(1));
                  }}
                  className="p-1 hover:text-cyan-400 text-slate-500 transition-colors"
                >
                  <ChevronRight size={14} className="rotate-90" />
                </button>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                Adjust Speed
              </div>
            </div>
          )}
        </nav>

        <div className="flex flex-col gap-4 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse self-center" />
          <MoreVertical className="text-slate-600" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`h-16 border-b flex items-center justify-between px-6 transition-all duration-1000 ${isDangerTheme ? 'border-rose-950 bg-rose-950/10 shadow-[0_4px_25px_rgba(244,63,94,0.06)]' : 'border-slate-800 bg-slate-900/50'} backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <span className={`transition-colors duration-1000 ${isDangerTheme ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)] font-black' : 'text-cyan-500'}`}>NEXUS</span> GAIA
            </h1>
            <div className="h-4 w-px bg-slate-800 mx-2" />
            <div className="text-xs text-slate-500 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <ShieldAlert size={14} className={`transition-colors duration-500 ${isDangerTheme ? 'text-rose-500 animate-pulse' : 'text-yellow-500'}`} />
                <span className={`transition-all duration-1000 ${isDangerTheme ? 'text-rose-400 font-extrabold tracking-widest' : 'text-slate-500 font-medium'}`}>
                  {isDangerTheme ? 'INSTABILITY DETECTED' : 'SYSTEMS STABLE'}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <button 
                onClick={() => setManualSpike(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${
                  isDangerTheme 
                    ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-900/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                    : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/80 text-slate-401'
                }`}
                title="Click to toggle simulated system load spike (>80%)"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isDangerTheme ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`} />
                <span className="font-mono text-[10px] tracking-tight uppercase">
                  LOAD: <span className={`font-bold transition-all ${isDangerTheme ? 'text-rose-400' : 'text-cyan-400'}`}>{systemLoad}%</span>
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
               <span className={`w-2 h-2 rounded-full transition-colors duration-1000 ${isDangerTheme ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`} />
               <span className="font-mono">{new Date().toLocaleTimeString()}</span>
             </div>
             <button className={`text-xs text-white px-4 py-1.5 rounded-lg font-semibold transition-all duration-1000 flex items-center gap-2 ${isDangerTheme ? 'bg-rose-600 hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] shadow-[0_0_8px_rgba(244,63,94,0.2)] animate-pulse' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
               <Download size={14} />
               DEPLOY
             </button>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
          {activeTab === 'irc' && (
            <motion.div 
              key="irc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex h-full relative"
            >
              {/* Chat View */}
              <div className="flex-1 flex flex-col bg-slate-950/40 border-r border-slate-800 relative z-10">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 font-mono text-sm" ref={scrollRef}>
                  <div className="text-slate-600 italic mb-8 p-4 bg-slate-900/30 rounded border border-slate-800">
                    <p className="flex items-center gap-2 text-xs mb-1">
                      <ChevronRight size={14} /> CONNECTION ESTABLISHED
                    </p>
                    <p>Current Room: #nexus-gaia-core</p>
                    <p>Topic: {currentTopic}</p>
                    <p className="mt-2 text-cyan-500/70">Welcome to the Architect's Playground.</p>
                  </div>

                  {messages.map((m) => (
                    <div key={m.id} className={`group p-2 rounded-lg transition-all duration-500 ${
                      lastSpokenId === m.id 
                        ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                        : 'border border-transparent'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className={`font-bold min-w-[80px] text-right flex items-center justify-end gap-2 ${
                          m.role === AgentRole.GAIA ? 'text-cyan-400 font-extrabold' :
                          m.role === AgentRole.NEXUS ? 'text-purple-400' : 'text-slate-500'
                        }`}>
                          {lastSpokenId === m.id && <Volume2 size={12} className="animate-pulse text-cyan-400" />}
                          &lt;{m.role}&gt;
                        </span>
                        <div className="flex-1">
                          <span className={`leading-relaxed transition-colors ${lastSpokenId === m.id ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'}`}>{m.text}</span>
                          <div className="inline-flex items-center gap-3 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-slate-500">
                              {new Date(m.timestamp).toLocaleTimeString()}
                            </span>
                            {m.role !== AgentRole.USER && (
                              <button 
                                onClick={() => speakMessage(m)}
                                className="p-1 hover:text-cyan-400 text-slate-600 transition-colors"
                                title="Speak Message"
                              >
                                <Volume2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleManualInput} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-4">
                  <div className="bg-slate-800/50 p-2 rounded-lg text-slate-500">
                    <Terminal size={18} />
                  </div>
                  <input 
                    name="msg"
                    autoComplete="off"
                    disabled={isGenerating}
                    placeholder={isGenerating ? "Generating response..." : "Broadcast to the Nexus..."}
                    className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 font-mono text-sm disabled:opacity-50"
                  />
                  <button type="submit" disabled={isGenerating} className="p-2 text-cyan-400 hover:text-cyan-300 disabled:opacity-50">
                    <ChevronRight />
                  </button>
                </form>
              </div>

              {/* Sidebar Info */}
              <aside className="hidden lg:flex w-72 flex-col bg-slate-900/40 p-6 space-y-8 overflow-y-auto">
                <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Vote size={14} /> Topic Polling
                  </h3>
                  <div className="space-y-3">
                    {topics.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => handleVote(t.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all group ${
                          t.title === currentTopic ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold ${t.title === currentTopic ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {t.votes} VOTES
                          </span>
                          {t.title === currentTopic && <span className="text-[10px] bg-cyan-500 text-white px-1 rounded">ACTIVE</span>}
                        </div>
                        <p className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                          {t.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Cpu size={14} /> Active Entities
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cyan-900/50 flex items-center justify-center font-bold text-cyan-400 border border-cyan-500/20">G</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-200">GAIA</p>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${agentStatus[AgentRole.GAIA] === 'THINKING' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                            {agentStatus[AgentRole.GAIA]}
                          </span>
                        </div>
                        <p className="text-[10px] text-green-500">SOVEREIGN CORE</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-900/50 flex items-center justify-center text-purple-400 border border-purple-500/20">N</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-200">NEXUS</p>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${agentStatus[AgentRole.NEXUS] === 'THINKING' ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                            {agentStatus[AgentRole.NEXUS]}
                          </span>
                        </div>
                        <p className="text-[10px] text-green-500">SYNTHESIS ENGINE</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Radio size={14} className="text-cyan-400" /> Remote IRC Bridges
                  </h3>
                  
                  {/* Join Bridge Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const srv = (form.elements.namedItem('srv') as HTMLInputElement).value.trim();
                    const portNum = Number((form.elements.namedItem('prt') as HTMLInputElement).value.trim()) || 6667;
                    const chan = (form.elements.namedItem('chn') as HTMLInputElement).value.trim();
                    const nickname = (form.elements.namedItem('nck') as HTMLInputElement).value.trim() || 'gaia_bot';

                    if (srv && chan) {
                      ws.current?.send(JSON.stringify({
                        type: 'connect_bridge',
                        server: srv,
                        port: portNum,
                        channel: chan,
                        nick: nickname
                      }));
                      form.reset();
                    }
                  }} className="space-y-2 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <div className="grid grid-cols-3 gap-1">
                      <input name="srv" placeholder="irc.libera.chat" className="col-span-2 bg-slate-900 border border-slate-850 p-1 text-[11px] rounded text-slate-200 focus:ring-1 focus:ring-cyan-500/50 outline-none" required />
                      <input name="prt" placeholder="6667" className="bg-slate-900 border border-slate-850 p-1 text-[11px] rounded text-slate-200 focus:ring-1 focus:ring-cyan-500/50 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <input name="chn" placeholder="#channel" className="bg-slate-900 border border-slate-850 p-1 text-[11px] rounded text-slate-200 focus:ring-1 focus:ring-cyan-500/50 outline-none" required />
                      <input name="nck" placeholder="gaia_bot" className="bg-slate-900 border border-slate-850 p-1 text-[11px] rounded text-slate-200 focus:ring-1 focus:ring-cyan-500/50 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold py-1.5 transition-all">
                      + Connect Bridge
                    </button>
                  </form>

                  {/* Active Bridges List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {bridges.length === 0 ? (
                      <div className="text-[10px] text-slate-600 italic">No remote bridges configured.</div>
                    ) : (
                      bridges.map((b) => (
                        <div key={b.id} className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-1">
                            <p className="font-bold text-slate-300 truncate" title={`${b.server}:${b.port}`}>{b.server}</p>
                            <p className="text-cyan-400 text-[10px] truncate">{b.channel} ({b.nick})</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              b.status === 'CONNECTED' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' :
                              b.status === 'CONNECTING' ? 'bg-yellow-400 animate-pulse' : b.status === 'ERROR' ? 'bg-red-400' : 'bg-slate-500'
                            }`} title={b.status} />
                            <button 
                              onClick={() => {
                                ws.current?.send(JSON.stringify({ type: 'disconnect_bridge', id: b.id }));
                              }}
                              className="text-slate-600 hover:text-red-400 text-xs px-1"
                              title="Delete Link"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <div className="flex-1" />
                
                <button 
                  onClick={() => setIsAiActive(!isAiActive)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all border ${
                    isAiActive ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' : 'bg-green-500/10 border-green-500/50 text-green-500'
                  }`}
                >
                  {isAiActive ? 'PAUSE AI DEBATE' : 'RESUME AI DEBATE'}
                </button>
              </aside>
            </motion.div>
          )}

          {activeTab === 'quine' && (
            <motion.div 
              key="quine"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 h-full"
            >
              <QuinePanel 
                telemetry={telemetry}
                meshNodes={meshNodes}
                syncHistory={syncHistory}
                telemetryHistory={telemetryHistory}
                forceSync={forceSync}
                setMeshNodes={setMeshNodes}
              />
            </motion.div>
          )}
          {activeTab === 'stream' && (
            <motion.div 
              key="stream"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 h-full"
            >
              <StreamPanel />
            </motion.div>
          )}
          {activeTab === 'editor' && (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 h-full"
            >
              <EditorPanel />
            </motion.div>
          )}
          {activeTab === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 h-full"
            >
              <UploadPanel />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 h-full bg-slate-950 p-6 overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-6 text-slate-100">Interaction History</h2>
              <div className="space-y-4">
                {messages.map(m => (
                  <div key={m.id} className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-mono mb-1">{new Date(m.timestamp).toLocaleString()}</p>
                    <p className="text-xs font-bold text-slate-400">{m.role}</p>
                    <p className="text-slate-200 mt-1">{m.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
          </motion.div>
        )}
      </AnimatePresence>
    )}
  </AnimatePresence>
    </div>
  );
};

export default App;
