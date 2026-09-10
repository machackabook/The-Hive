/** Stage 32 signed kernel contract — shared by Hive pulse + visualizer. */
export const KERNEL_STAGE = 32;
export const KERNEL_CHAT_GEOMETRIES = ['infinity', 'hamiltonian', 'triangular', 'torus'] as const;
export const KERNEL_RUNTIME_GEOMETRIES = ['torus', 'infinity', 'hamiltonian', 'triangular', 'klein'] as const;
export const KERNEL_LERP = 0.05;
export const KERNEL_THETA_BASE = 0.01;
export const KERNEL_THETA_IDX = 0.002;
export const KERNEL_PHI_WEAVE = 0.007;

export function hashKernelSource(src: string): string {
  let h = 2166136261;
  const s = String(src || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8);
}

/** FNV-1a of the session update(t) paste (CHAT_KERNEL_SOURCE). */
export const KERNEL_SOURCE_HASH = 'beec41f1';

export function signedKernelFrame(extra: Record<string, unknown> = {}) {
  return {
    type: 'gaia:kernel' as const,
    stage: KERNEL_STAGE,
    sourceHash: KERNEL_SOURCE_HASH,
    geometries: [...KERNEL_CHAT_GEOMETRIES],
    runtimeGeometries: [...KERNEL_RUNTIME_GEOMETRIES],
    lerp: KERNEL_LERP,
    thetaBase: KERNEL_THETA_BASE,
    thetaIdx: KERNEL_THETA_IDX,
    phiWeave: KERNEL_PHI_WEAVE,
    ...extra,
  };
}

export const STAGE = KERNEL_STAGE;
