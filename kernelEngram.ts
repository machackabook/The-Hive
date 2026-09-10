/**
 * Stage 37–40 — compact kernel-seed engram for Drive / Hive persistence.
 * Visualizer writes the same shape to window.__GAIA_ENGRAM__.
 */
export const ENGRAM_STAGE = 40;
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
    theta: kernel.theta.slice(0, n),
    phi: kernel.phi.slice(0, n),
    hmac: kernel.hmac,
  };
}
