import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  LogIn, 
  Loader2, 
  Save, 
  Share2, 
  Palette, 
  Plus, 
  Sparkles, 
  ExternalLink,
  RotateCw,
  FolderLock,
  Brush,
  Eraser,
  Type,
  Maximize2
} from 'lucide-react';
import { collection, doc, setDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase';

export default function UploadPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVisual, setActiveVisual] = useState<string | null>(null);
  const [activeVisualId, setActiveVisualId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive & Auth States
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveStatus, setDriveSaveStatus] = useState<string | null>(null);

  // Interactive HTML5 Canvas Editor States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editorMode, setEditorMode] = useState<'line' | 'marker' | 'text' | 'view'>('view');
  const [brushColor, setBrushColor] = useState('#06b6d4'); // Gaia Teal
  const [canvasFilter, setCanvasFilter] = useState<'normal' | 'cyber-cyan' | 'monochrome' | 'neon-edges'>('normal');
  const [textToWrite, setTextToWrite] = useState('GAIA PROTOCOL ACTIVE');
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchVisuals(currentUser.uid);
        // Recover token if cached in session or storage
        const cached = localStorage.getItem('gaia_drive_token');
        if (cached) {
          setAccessToken(cached);
        }
      } else {
        setVisuals([]);
        setAccessToken(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const fetchVisuals = async (userId: string) => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'visuals'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedVisuals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = fetchedVisuals.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVisuals(sorted);
      if (sorted.length > 0 && !activeVisual) {
        setActiveVisual(sorted[0].url);
        setActiveVisualId(sorted[0].id);
      }
    } catch (error) {
      handleFirestoreError(error, 'get', 'visuals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure Google Drive scope is appended safely
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        localStorage.setItem('gaia_drive_token', credential.accessToken);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // Re-draw and apply filters to standard drawing on target canvas
  useEffect(() => {
    if (!activeVisual) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set reasonable canvas size matching visual proportion
      const containerWidth = Math.min(800, window.innerWidth - 480);
      const aspect = img.height / img.width;
      canvas.width = containerWidth;
      canvas.height = containerWidth * aspect;

      // Draw base
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply Filter Overlays
      if (canvasFilter === 'cyber-cyan') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Boost blue & cyan tones
          data[i] = data[i] * 0.4; // Red dim
          data[i + 1] = Math.min(255, data[i + 1] * 1.2 + 20); // Green up
          data[i + 2] = Math.min(255, data[i + 2] * 1.5 + 40); // Blue surge
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (canvasFilter === 'monochrome') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Luma conversion
          const avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (canvasFilter === 'neon-edges') {
        // High contrast matrix style conversion
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const luma = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
          if (luma > 120) {
            data[i] = 6;      // Green/Cyan neon channels
            data[i + 1] = 182;
            data[i + 2] = 212;
          } else {
            data[i] = 15;     // Deep slate background block
            data[i + 1] = 23;
            data[i + 2] = 42;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    };
    img.src = activeVisual;
  }, [activeVisual, canvasFilter]);

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800; // Constrain size for base64 storage limits
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No context');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG
        };
        img.onerror = () => reject('Image load failed');
        if (e.target?.result) img.src = e.target.result as string;
      };
      reader.onerror = () => reject('File read failed');
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const dataUri = await processImage(file);
      const newVisualId = Math.random().toString(36).substr(2, 10);
      const payload = {
        userId: user.uid,
        name: file.name,
        url: dataUri,
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'visuals', newVisualId), payload);
      setVisuals([{ id: newVisualId, ...payload }, ...visuals]);
      setActiveVisual(payload.url);
      setActiveVisualId(newVisualId);
      setCanvasFilter('normal');
    } catch (error) {
      try {
        handleFirestoreError(error, 'create', 'visuals');
      } catch (err) {}
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm("Disconnect this neural image log permanently?")) return;
    try {
      await deleteDoc(doc(db, 'visuals', id));
      const nextVisuals = visuals.filter(v => v.id !== id);
      setVisuals(nextVisuals);
      if (activeVisualId === id) {
        setActiveVisual(nextVisuals[0]?.url || null);
        setActiveVisualId(nextVisuals[0]?.id || null);
      }
    } catch (error) {
      try {
        handleFirestoreError(error, 'delete', `visuals/${id}`);
      } catch (err) {}
    }
  };

  // Canvas drawing handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editorMode === 'view') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawing.current = true;
    startPos.current = { x, y };

    if (editorMode === 'text') {
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillStyle = brushColor;
      ctx.fillText(textToWrite, x, y);
      isDrawing.current = false;
    } else if (editorMode === 'marker') {
      // Glow marker circle
      ctx.shadowColor = brushColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = brushColor;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset
      isDrawing.current = false;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || editorMode !== 'line') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startPos.current.x, startPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    startPos.current = { x, y };
  };

  const handleCanvasMouseUp = () => {
    isDrawing.current = false;
  };

  // SAVE AS NEW / WITHIN MESH
  const handleSaveWithin = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !user || !activeVisualId) return;

    setIsUploading(true);
    setDriveSaveStatus("WRITING TO CENTRAL DB...");
    try {
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      const updatedId = Math.random().toString(36).substr(2, 10);
      const payload = {
        userId: user.uid,
        name: `Annotated_${Date.now().toString().slice(-4)}.jpg`,
        url: dataUri,
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'visuals', updatedId), payload);
      setVisuals([payload, ...visuals]);
      setActiveVisual(payload.url);
      setActiveVisualId(updatedId);
      
      setDriveSaveStatus("MESH STATE COMMITTED.");
      setTimeout(() => setDriveSaveStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setDriveSaveStatus("WRITE FAULT.");
      setTimeout(() => setDriveSaveStatus(null), 3005);
    } finally {
      setIsUploading(false);
    }
  };

  // GOOGLE DRIVE EXPORT FLOW
  const handleExportToGoogleDrive = async () => {
    if (!accessToken) {
      setDriveSaveStatus("GOOGLE DRIVE AUTHORIZATION PENDING...");
      // Trigger login to refresh/force oauth parameters
      await handleLogin();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setDriveSaveStatus("CANVAS ELEMENT NOT MOUNTED.");
      return;
    }

    const confirmed = window.confirm("Save this active canvas telemetry visual layer to your Google Drive Google Workspace vault?");
    if (!confirmed) return;

    setIsSavingToDrive(true);
    setDriveSaveStatus("STAGING DRIVE MULTIPART TRANSFER...");

    try {
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64Data = rawDataUrl.replace(/^data:image\/jpeg;base64,/, "");
      
      const metadata = {
        name: `gaia_${Date.now()}.jpeg`, 
        mimeType: 'image/jpeg'
      };

      const boundary = 'gaia_drive_multipart_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const body = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: image/jpeg\r\n' +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        base64Data +
        closeDelim;

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Google Upload Status ${res.status}: ${text}`);
      }

      setDriveSaveStatus("GAIA VECTOR PERSISTED ON GOOGLE DRIVE!");
      setTimeout(() => setDriveSaveStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setDriveSaveStatus(`DRIVE COM_FAIL: ${err.message}`);
      setTimeout(() => setDriveSaveStatus(null), 6000);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-950 p-8 text-center text-slate-300">
        <UploadCloud size={64} className="mb-6 text-cyan-500 opacity-50" />
        <h2 className="mb-2 text-2xl font-bold text-white">Visual Artifacts & Telemetry Canvas</h2>
        <p className="mb-8 max-w-md text-sm text-slate-400">
          Neural secure authorization node active. Authenticate via Google Auth to load active canvas pipelines, mount Google Drive storage, and synchronize quine meshes.
        </p>
        <button 
          onClick={handleLogin}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-3 font-bold text-white transition-colors hover:bg-cyan-500 shadow-xl shadow-cyan-950/20"
        >
          <LogIn size={18} />
          AUTHENTICATE & ENABLE GOOGLE DRIVE
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden font-sans">
      
      {/* Upload sidebar & list log */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/40 p-6 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-200 tracking-tight">VISUAL ARCHIVE</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">ID: {user.email?.split('@')[0]}</p>
          </div>
          {accessToken ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
              <FolderLock size={10} /> DRIVE LINKED
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              + AUTHLINK DRIVE
            </button>
          )}
        </div>

        <input 
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-slate-700 bg-slate-800/20 rounded-xl hover:bg-slate-800 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400 disabled:opacity-50 group mb-6"
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} className="group-hover:-translate-y-0.5 transition-transform text-cyan-500" />}
          <span className="text-xs font-bold font-mono tracking-tight">{isUploading ? 'UPLOADING...' : 'INITIATE FILE STREAM'}</span>
        </button>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Sync Ledger</div>
          {isLoading ? (
            <div className="flex justify-center p-4"><Loader2 size={16} className="text-slate-600 animate-spin" /></div>
          ) : visuals.length === 0 ? (
            <div className="text-center p-6 text-[10px] text-slate-600 border border-slate-800 rounded bg-slate-900/50">NO TELEMETRY ART FOUND</div>
          ) : (
            visuals.map((visual) => (
              <div 
                key={visual.id} 
                onClick={() => {
                  setActiveVisual(visual.url);
                  setActiveVisualId(visual.id);
                  setCanvasFilter('normal');
                }}
                className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  activeVisualId === visual.id ? 'bg-cyan-900/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'bg-slate-800/10 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="w-10 h-10 bg-slate-950 rounded flex items-center justify-center overflow-hidden shrink-0 border border-slate-800">
                  <img src={visual.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="thumb" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold truncate ${activeVisualId === visual.id ? 'text-cyan-400 font-extrabold' : 'text-slate-300'}`}>{visual.name}</p>
                  <p className="text-[9px] text-slate-500 mt-1">{new Date(visual.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, visual.id)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors bg-slate-950/20 rounded opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-950/20"
                  title="Wipe Artifact"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Interactive Canvas Visualization Frame */}
      <div className="flex-1 flex flex-col bg-slate-950">
        
        {/* Visualizer header & control options */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/20 shrink-0 font-mono text-[11px]">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-bold uppercase flex items-center gap-2">
              <Palette size={14} className="text-cyan-400 animate-pulse" />
              INTEGRATED CANVAS STAGE
            </span>
          </div>

          {driveSaveStatus && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800/50 px-3 py-1 rounded animate-pulse">
              [SYSTEM: {driveSaveStatus}]
            </span>
          )}

          <div className="flex items-center gap-2">
            {activeVisual && (
              <>
                <button 
                  onClick={handleSaveWithin}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded transition-all flex items-center gap-1.5"
                  title="Commit canvas changes inside Firestore database log"
                >
                  <Save size={12} />
                  <span>SAVE WITHIN</span>
                </button>

                <button 
                  onClick={handleExportToGoogleDrive}
                  disabled={isSavingToDrive}
                  className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 px-3 py-1.5 rounded transition-all flex items-center gap-1.5"
                  title="Direct secure upload to your connected Google Drive storage"
                >
                  {isSavingToDrive ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12} />}
                  <span>EXPORT DRIVE</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Interactive Drawing Canvas Workspace */}
        <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
          
          <div className="flex-1 flex items-center justify-center bg-slate-950 border border-slate-900/60 rounded-2xl relative overflow-auto shadow-inner">
            {activeVisual ? (
              <div className="relative p-2 border border-slate-800/80 rounded bg-slate-900/10 backdrop-blur shadow-2xl">
                
                {/* HTML Canvas */}
                <canvas 
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className={`max-w-full rounded bg-slate-950 ${editorMode !== 'view' ? 'cursor-crosshair border border-dashed border-cyan-500/40' : 'cursor-default border border-slate-900'}`}
                />

                <div className="absolute bottom-4 left-4 z-20 font-mono text-[9px] text-cyan-400/80 bg-slate-950/70 border border-cyan-500/20 rounded px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  <span>CANVAS TELEMETRY LOOP: SUCCESS</span>
                </div>
              </div>
            ) : (
              <div className="text-center font-mono opacity-20 select-none">
                <ImageIcon size={64} className="mx-auto mb-4 text-slate-500" />
                <p className="text-xs text-slate-400 tracking-widest uppercase">STREAM CLOSED. FILE REQUIRED.</p>
              </div>
            )}
          </div>

          {/* Annotation controls sidebar if image is selected */}
          {activeVisual && (
            <div className="w-full md:w-64 bg-slate-900/20 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between font-mono shrink-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">TELEMETRY FILTER</h3>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {[
                      { key: 'normal', label: 'Raw Lens' },
                      { key: 'cyber-cyan', label: 'Cyan boost' },
                      { key: 'monochrome', label: 'Mono Grey' },
                      { key: 'neon-edges', label: 'Neon Edges' }
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setCanvasFilter(f.key as any)}
                        className={`p-2 rounded text-left border transition-all ${canvasFilter === f.key ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400' : 'bg-slate-950 border-slate-900 hover:border-slate-800'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">ANNOTATION TOOLKIT</h3>
                  <div className="space-y-1.5 text-[10px]">
                    {[
                      { id: 'view', label: 'View Inspect Mode', icon: Maximize2 },
                      { id: 'line', label: 'Draw Telemetry Link', icon: Brush },
                      { id: 'marker', label: 'Place Neural Pin', icon: Sparkles },
                      { id: 'text', label: 'Apply Text Overlay', icon: Type }
                    ].map(tool => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => setEditorMode(tool.id as any)}
                          className={`w-full p-2.5 rounded text-left border flex items-center gap-2 transition-all ${editorMode === tool.id ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400' : 'bg-slate-950 border-slate-900 hover:border-slate-800'}`}
                        >
                          <Icon size={12} />
                          <span>{tool.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {editorMode === 'text' && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">CUSTOM OVERLAY</h3>
                    <input 
                      type="text"
                      value={textToWrite}
                      onChange={e => setTextToWrite(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
                      placeholder="Text payload"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">NODE SIGNAL COLOR</h3>
                  <div className="flex gap-2">
                    {[
                      '#06b6d4', // Cyan
                      '#10b981', // Emerald
                      '#f59e0b', // Amber
                      '#ef4444', // Rose
                      '#a855f7'  // Purple
                    ].map(c => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        className={`w-5 h-5 rounded-full transition-all border ${brushColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4 mt-4 text-[9px] text-slate-500 leading-relaxed">
                Click on the visual stage canvas directly to draw connection signals, map telemetry nodes, or paste digital overlay text vectors.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
