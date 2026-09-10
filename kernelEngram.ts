/**
 * Stage 37–44 — compact kernel-seed engram for Drive / Hive persistence.
 * Visualizer writes the same shape to window.__GAIA_ENGRAM__ and replays GET /api/gaia/engram.
 */
export const ENGRAM_STAGE = 44;
export const ENGRAM_SOURCE_HASH = 'beec41f1';

export type KernelEngram = {
  stage: number;
  sourceHash: string;
  at: number;
  count: number;
  theta: number[];
  phi: number[];
  hmac?: string;
};

export function compactEngram(kernel: {
  stage?: number;
  sourceHash?: string;
  theta?: number[];
  phi?: number[];
  count?: number;
  hmac?: string;
}, cap = 64): KernelEngram | null {
  if (!Array.isArray(kernel?.theta) || !Array.isArray(kernel?.phi)) return null;
  const n = Math.min(cap, kernel.theta.length, kernel.phi.length);
  return {
    stage: kernel.stage ?? ENGRAM_STAGE,
    sourceHash: kernel.sourceHash ?? ENGRAM_SOURCE_HASH,
    at: Date.now(),
    count: kernel.count ?? n,
    theta: kernel.theta.slice(0, n).map((v) => Number(v) || 0),
    phi: kernel.phi.slice(0, n).map((v) => Number(v) || 0),
    hmac: kernel.hmac,
  };
}

export function engramAsPendingKernel(engram: KernelEngram | null) {
  if (!engram || !Array.isArray(engram.theta) || !Array.isArray(engram.phi)) return null;
  return {
    stage: engram.stage ?? ENGRAM_STAGE,
    sourceHash: engram.sourceHash ?? ENGRAM_SOURCE_HASH,
    at: engram.at,
    count: engram.count ?? Math.min(engram.theta.length, engram.phi.length),
    theta: engram.theta,
    phi: engram.phi,
    hmac: engram.hmac,
  };
}
