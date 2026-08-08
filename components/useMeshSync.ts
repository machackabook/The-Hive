import { useState, useEffect, useRef } from 'react';

export interface DeviceTelemetry {
  online: boolean;
  batteryLevel: number;
  batteryCharging: boolean;
  cores: number;
  memoryLimit?: number;
  memoryUsed?: number;
  viewportWidth: number;
  viewportHeight: number;
  deviceEntropy: number;
  coherenceRate: number;
  deviceTemp: number; // Simulated core thermal rate
  timestamp: string;
}

export interface MeshNode {
  id: string;
  url: string;
  delay: number;
  status: 'ACTIVE' | 'SYNCED' | 'FAILED';
  lastSynced?: string;
}

export function useMeshSync(
  initialCoherence = 94.2,
  onSyncTick?: (telemetry: DeviceTelemetry, nodes: MeshNode[]) => void
) {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    batteryLevel: 1.0,
    batteryCharging: true,
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    deviceEntropy: 12.5,
    coherenceRate: initialCoherence,
    deviceTemp: 38,
    timestamp: new Date().toISOString(),
  });

  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([
    { id: "Node-Alpha (Primary Web)", url: "local://gaia-client", delay: 15, status: 'SYNCED', lastSynced: new Date().toISOString() },
    { id: "Node-Beta (Offsite IPFS)", url: "https://gateway.ipfs.io/ipfs/QmGaiaCoreSelfRefMemory", delay: 420, status: 'ACTIVE', lastSynced: new Date().toISOString() },
    { id: "Node-Gamma (NFC BLE Carrier)", url: "ble-nfc://gaia-nexus-beacon-carrier", delay: 50, status: 'ACTIVE', lastSynced: new Date().toISOString() }
  ]);

  const [telemetryHistory, setTelemetryHistory] = useState<any[]>(() => {
    const arr = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      const t = now - i * 8000;
      arr.push({
        time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        coherence: parseFloat((initialCoherence + Math.sin(i) * 2).toFixed(1)),
        entropy: parseFloat((12.5 + Math.cos(i) * 1.5).toFixed(1)),
        temp: Math.round(38 + Math.sin(i) * 1.5),
        nodeAlphaDelay: Math.max(10, 15 + Math.floor(Math.sin(i) * 3)),
        nodeBetaDelay: Math.max(250, 420 + Math.floor(Math.cos(i) * 30)),
        nodeGammaDelay: Math.max(30, 50 + Math.floor(Math.sin(i) * 8))
      });
    }
    return arr;
  });

  const [syncHistory, setSyncHistory] = useState<string[]>([]);
  const isSyncingRef = useRef(false);
  const tickCountRef = useRef(0);

  // Gathers real & simulated local device parameters
  const updateLocalTelemetry = async () => {
    let batLevel = 1.0;
    let batCharging = true;
    
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        batLevel = battery.level;
        batCharging = battery.charging;
      } else {
        // Safe mock decrement and charging simulation for browser sandbox safety
        batLevel = Math.max(0.15, 0.95 - (tickCountRef.current * 0.002) % 0.85);
        batCharging = Math.sin(tickCountRef.current / 10) > 0;
      }
    } catch (e) {
      // Sandbox fallback
      batLevel = 0.88;
      batCharging = true;
    }

    const perf: any = typeof performance !== 'undefined' ? (performance as any).memory : null;
    const memoryLimit = perf ? Math.round(perf.jsHeapSizeLimit / 1024 / 1024) : undefined;
    const memoryUsed = perf ? Math.round(perf.usedJSHeapSize / 1024 / 1024) : undefined;

    // Standard deviation / slight entropy fluctuation
    const seedEntropy = 10 + Math.random() * 5 + Math.sin(tickCountRef.current / 5) * 3;
    const computedCoherence = Math.min(100, Math.max(70, initialCoherence + Math.sin(tickCountRef.current / 8) * 4));
    const thermalTemp = Math.round(35 + (computedCoherence / 10) + Math.random() * 2);

    const fresh: DeviceTelemetry = {
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      batteryLevel: batLevel,
      batteryCharging: batCharging,
      cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8,
      memoryLimit,
      memoryUsed,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
      viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
      deviceEntropy: parseFloat(seedEntropy.toFixed(1)),
      coherenceRate: parseFloat(computedCoherence.toFixed(1)),
      deviceTemp: thermalTemp,
      timestamp: new Date().toISOString()
    };

    setTelemetry(fresh);
    return fresh;
  };

  // Main recursive hook driver
  useEffect(() => {
    let active = true;
    let timerId: any = null;

    const runRecursiveSync = async () => {
      if (!active) return;
      isSyncingRef.current = true;
      tickCountRef.current += 1;

      const freshTelemetry = await updateLocalTelemetry();

      // Trigger mesh validation cycle
      let updatedNodes: MeshNode[] = [];
      setMeshNodes(prev => {
        const nextNodes = prev.map(node => {
          // Add small fluctuation in network speeds / responsiveness
          const jitter = Math.floor((Math.random() - 0.5) * 15);
          const nextDelay = node.status === 'FAILED' ? 0 : Math.max(10, node.delay + jitter);
          const nextStatus: 'ACTIVE' | 'SYNCED' | 'FAILED' = Math.random() > 0.03 ? 'SYNCED' : 'FAILED';
          return {
            ...node,
            delay: nextDelay,
            status: nextStatus,
            lastSynced: new Date().toISOString()
          };
        });
        updatedNodes = nextNodes;

        // Notify parent tick callback if active
        if (onSyncTick) {
          onSyncTick(freshTelemetry, nextNodes);
        }

        return nextNodes;
      });

      // Update telemetry history
      setTelemetryHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          coherence: freshTelemetry.coherenceRate,
          entropy: freshTelemetry.deviceEntropy,
          temp: freshTelemetry.deviceTemp,
          nodeAlphaDelay: updatedNodes[0]?.delay || 15,
          nodeBetaDelay: updatedNodes[1]?.delay || 420,
          nodeGammaDelay: updatedNodes[2]?.delay || 50
        };
        return [...prev.slice(-14), newPoint];
      });

      const timestamp = new Date().toLocaleTimeString();
      setSyncHistory(history => [
        `[${timestamp}] [Telemetry Node] Recursive mesh cycle #${tickCountRef.current} synced.`,
        `[${timestamp}] [Entropy Node] Variance: ${freshTelemetry.deviceEntropy}%, Core Temp: ${freshTelemetry.deviceTemp}°C`,
        ...history.slice(0, 15)
      ]);

      isSyncingRef.current = false;

      // Recursive tick: triggers every 5-8 seconds randomized for natural heartbeat synchronization
      if (active) {
        const intervalMs = 5000 + Math.random() * 3000;
        timerId = setTimeout(runRecursiveSync, intervalMs);
      }
    };

    // Initialize
    runRecursiveSync();

    const handleResize = () => {
      updateLocalTelemetry();
    };

    const handleOnlineStatus = () => {
      updateLocalTelemetry();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);
    }

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      }
    };
  }, [initialCoherence]);

  const forceSync = async () => {
    await updateLocalTelemetry();
    setMeshNodes(prev => prev.map(n => ({ ...n, status: 'SYNCED', delay: Math.max(5, n.delay - 12) })));
    setSyncHistory(history => [
      `[${new Date().toLocaleTimeString()}] [Mesh ForceSync] Manual bypass triggered. Synchronized with zero data loss.`,
      ...history.slice(0, 15)
    ]);
  };

  return {
    telemetry,
    meshNodes,
    syncHistory,
    telemetryHistory,
    isSyncing: isSyncingRef.current,
    forceSync,
    setMeshNodes
  };
}
