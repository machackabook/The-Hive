/**
 * Verbatim chat-kernel update(t) contract shared with gaia-visualizer.
 * Stage 80: live chat (2026-09-12 15:06 CDT) reconfirmed session paste hash beec41f1.
 * Living CHAT_KERNEL_SOURCE remains Stage 45 promotions (phi weave, uniform guards, reused lerp).
 * Runtime extras stay in evaluateChatKernel: klein, hopf, figure8, trefoil.
 * matchSessionPaste scans the pasted source for extra case labels instead of hardcoding false.
 * Klein / hopf / figure8 / trefoil still not in the session switch (paste has no those cases).
 */
export const CHAT_KERNEL_LERP = 0.05;
export const CHAT_KERNEL_THETA_BASE = 0.01;
export const CHAT_KERNEL_THETA_IDX = 0.002;
export const CHAT_KERNEL_PHI_WEAVE = 0.007;
export const CHAT_KERNEL_CHAT_GEOMETRIES = ['infinity', 'hamiltonian', 'triangular', 'torus'] as const;
export const CHAT_KERNEL_GEOMETRIES = ['torus', 'infinity', 'hamiltonian', 'triangular', 'klein', 'hopf', 'figure8', 'trefoil'] as const;
export const CHAT_KERNEL_SOURCE_HASH = '7cd81012';
export const CHAT_KERNEL_SESSION_HASH = 'beec41f1';
export const STAGE = 80;

export function fnv1a32Hex(source: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < source.length; i++) {
    h ^= source.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function hashChatKernelSource(source: string): string {
  return fnv1a32Hex(source);
}

function caseInSource(source: string, name: string): boolean {
  const re = new RegExp(`case\\s*['\"]${name}['\"]`);
  return re.test(source);
}

export function matchSessionPaste(source: string) {
  const hash = fnv1a32Hex(source);
  return {
    stage: STAGE,
    hash,
    expected: CHAT_KERNEL_SESSION_HASH,
    match: hash === CHAT_KERNEL_SESSION_HASH,
    kleinInSession: caseInSource(source, 'klein'),
    hopfInSession: caseInSource(source, 'hopf'),
    figure8InSession: caseInSource(source, 'figure8'),
    trefoilInSession: caseInSource(source, 'trefoil'),
  };
}

export function advanceChatKernelAngles(input: {
  theta?: number;
  phi?: number;
  idx?: number;
  gravityPull?: number;
  toroidalWeave?: number;
}): { theta: number; phi: number } {
  const theta = input.theta ?? 0;
  const phi = input.phi ?? 0;
  const idx = input.idx ?? 0;
  const gravityPull = input.gravityPull ?? 1;
  const toroidalWeave = input.toroidalWeave ?? 1;
  return {
    theta: theta + (CHAT_KERNEL_THETA_BASE + idx * CHAT_KERNEL_THETA_IDX) * gravityPull,
    phi: phi + CHAT_KERNEL_PHI_WEAVE * toroidalWeave,
  };
}

export function evaluateChatKernel(input: {
  theta: number;
  phi: number;
  t: number;
  idx: number;
  toroidalWeave?: number;
  geometry?: string;
}): { x: number; y: number; z: number; major: number; minor: number } {
  return evaluateChatKernelInto({} as { x: number; y: number; z: number; major: number; minor: number }, input);
}

export function evaluateChatKernelInto(
  out: { x: number; y: number; z: number; major: number; minor: number },
  input: {
    theta: number;
    phi: number;
    t: number;
    idx: number;
    toroidalWeave?: number;
    geometry?: string;
  },
): { x: number; y: number; z: number; major: number; minor: number } {
  const theta = input.theta;
  const phi = input.phi;
  const t = input.t;
  const idx = input.idx;
  const toroidalWeave = input.toroidalWeave ?? 1;
  const geometry = input.geometry ?? 'torus';
  const major = 10 + idx * 2;
  const minor = 3 + toroidalWeave * 2;
  let x = 0;
  let y = 0;
  let z = 0;

  switch (geometry) {
    case 'infinity': {
      const scale = major * 1.5;
      const denom = 1 + Math.pow(Math.sin(theta), 2);
      x = (scale * Math.cos(theta)) / denom;
      z = (scale * Math.sin(theta) * Math.cos(theta)) / denom;
      y = minor * Math.sin(phi) * Math.sin(t * 0.5 + idx);
      break;
    }
    case 'hamiltonian': {
      const hScale = major;
      x = hScale * Math.cos(theta * 3) * Math.cos(theta);
      z = hScale * Math.cos(theta * 3) * Math.sin(theta);
      y = hScale * Math.sin(theta * 3) + Math.sin(t) * 2;
      break;
    }
    case 'triangular': {
      const tAngle = Math.floor(theta / ((Math.PI * 2) / 3)) * ((Math.PI * 2) / 3);
      x = major * Math.cos(tAngle) + minor * Math.cos(theta * 5);
      z = major * Math.sin(tAngle) + minor * Math.sin(theta * 5);
      y = ((idx % 3) - 1) * major * 0.5 + Math.sin(t) * minor;
      break;
    }
    case 'klein': {
      const u = theta;
      const v = phi;
      const r = 4 + toroidalWeave;
      x = (r + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u) * 1.2;
      z = (r + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u) * 1.2;
      y = Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v) + Math.sin(t * 0.2 + idx) * 0.3;
      x *= major * 0.12;
      y *= major * 0.18;
      z *= major * 0.12;
      break;
    }
    case 'figure8': {
      const scale = major * 1.15;
      const denom = 1 + Math.sin(theta) * Math.sin(theta);
      const cx = (scale * Math.cos(theta)) / denom;
      const cz = (scale * Math.sin(theta) * Math.cos(theta)) / denom;
      const tube = minor * 0.35;
      x = cx + tube * Math.cos(phi);
      y = tube * Math.sin(phi) + Math.sin(t * 0.4) * 0.4;
      z = cz + tube * Math.sin(phi * 0.5);
      break;
    }
    case 'hopf': {
      const eta = theta;
      const xi = phi + t * 0.15;
      const r = Math.sin(eta);
      x = major * r * Math.cos(xi);
      z = major * r * Math.sin(xi);
      y = major * Math.cos(eta) * 0.65 + Math.sin(t * 0.4 + idx) * 0.4;
      break;
    }
    case 'trefoil': {
      // Matches GPU KERNEL_GEOMETRY_ID 7
      const u = theta;
      x = major * 0.35 * (Math.sin(u) + 2 * Math.sin(2 * u));
      z = major * 0.35 * (Math.cos(u) - 2 * Math.cos(2 * u));
      y = minor * 0.55 * Math.sin(3 * u) + Math.sin(t * 0.3 + idx) * 0.4;
      break;
    }
    case 'torus':
    default: {
      x = (major + minor * Math.cos(phi)) * Math.cos(theta);
      z = (major + minor * Math.cos(phi)) * Math.sin(theta);
      y = minor * Math.sin(phi) * Math.sin(t * 0.5 + idx);
      break;
    }
  }

  out.x = x;
  out.y = y;
  out.z = z;
  out.major = major;
  out.minor = minor;
  return out;
}

export function sampleFidelityOnHashMismatch(inboundHash?: string | null) {
  const expected = CHAT_KERNEL_SOURCE_HASH;
  const inbound = inboundHash == null ? '' : String(inboundHash);
  if (inbound && inbound === expected) {
    return { stage: STAGE, match: true, skipped: true, expected, inbound, sessionHash: CHAT_KERNEL_SESSION_HASH };
  }
  return {
    stage: STAGE,
    match: false,
    skipped: false,
    expected,
    inbound: inbound || null,
    sessionHash: CHAT_KERNEL_SESSION_HASH,
    reason: inbound ? 'sourceHash mismatch' : 'missing sourceHash',
    geometries: [...CHAT_KERNEL_CHAT_GEOMETRIES],
  };
}

export function confirmSessionKernel() {
  return {
    stage: STAGE,
    sessionHash: CHAT_KERNEL_SESSION_HASH,
    livingHash: CHAT_KERNEL_SOURCE_HASH,
    pinned: true,
    kleinInSession: false,
    hopfInSession: false,
    figure8InSession: false,
    trefoilInSession: false,
    geometries: [...CHAT_KERNEL_CHAT_GEOMETRIES],
    runtimeExtras: ['klein', 'hopf', 'figure8', 'trefoil'],
    note: 'Session paste 2026-09-12 15:06 CDT matches beec41f1. Klein/hopf/figure8/trefoil stay runtime-only. Stage 80 CPU evaluate matches GPU ids 12/13/8/7.',
  };
}
