/** Stage 46 signed + HMAC kernel contract — shared by Hive pulse + visualizer. */
export const KERNEL_STAGE = 46;
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

/** FNV-1a of the living CHAT_KERNEL_SOURCE (guards + phi weave + reused target). */
export const KERNEL_SOURCE_HASH = '7cd81012';
/** FNV-1a of the exact in-session update(t) paste. */
export const KERNEL_SESSION_HASH = 'beec41f1';

export function kernelMacBasis(frame: {
  stage?: number;
  sourceHash?: string;
  count?: number;
  theta?: number[];
  phi?: number[];
}): string {
  return [
    frame.stage ?? KERNEL_STAGE,
    frame.sourceHash ?? KERNEL_SOURCE_HASH,
    frame.count ?? 0,
    Array.isArray(frame.theta) ? frame.theta[0] ?? 0 : 0,
    Array.isArray(frame.phi) ? frame.phi[0] ?? 0 : 0,
  ].join('|');
}

/** Portable keyed MAC (FNV-1a of token:basis). Used when GAIA_PULSE_TOKEN is set. */
export function signKernelMac(token: string | undefined, frame: Parameters<typeof kernelMacBasis>[0]): string | undefined {
  if (!token) return undefined;
  return hashKernelSource(`${token}:${kernelMacBasis(frame)}`);
}

export function attachKernelMac<T extends Parameters<typeof kernelMacBasis>[0]>(token: string | undefined, frame: T): T {
  if (!frame || !token) return frame;
  const next = frame as T & { hmac?: string; sourceHash?: string; stage?: number };
  if (!next.sourceHash) next.sourceHash = KERNEL_SOURCE_HASH;
  if (next.stage == null) next.stage = KERNEL_STAGE;
  const hmac = signKernelMac(token, next);
  if (hmac) next.hmac = hmac;
  return next;
}

export function verifyKernelMac(token: string | undefined, frame: Parameters<typeof kernelMacBasis>[0] & { hmac?: string }): boolean {
  if (!token) return true;
  const expected = signKernelMac(token, frame);
  return Boolean(expected && frame.hmac && expected === frame.hmac);
}

export function signedKernelFrame(extra: Record<string, unknown> = {}, token?: string) {
  const frame = {
    type: 'gaia:kernel' as const,
    stage: KERNEL_STAGE,
    sourceHash: KERNEL_SOURCE_HASH,
    sessionHash: KERNEL_SESSION_HASH,
    geometries: [...KERNEL_CHAT_GEOMETRIES],
    runtimeGeometries: [...KERNEL_RUNTIME_GEOMETRIES],
    lerp: KERNEL_LERP,
    thetaBase: KERNEL_THETA_BASE,
    thetaIdx: KERNEL_THETA_IDX,
    phiWeave: KERNEL_PHI_WEAVE,
    ...extra,
  };
  const hmac = signKernelMac(token, frame as Parameters<typeof kernelMacBasis>[0]);
  if (hmac) (frame as { hmac?: string }).hmac = hmac;
  return frame;
}

export const STAGE = KERNEL_STAGE;
