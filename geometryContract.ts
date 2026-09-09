/**
 * LLM → Gaia visualizer contract (band-137).
 * Keep this the single source of truth for targetState shape inside The-Hive.
 * Stage-17: chat-kernel source pinned in chatKernel.ts; TF still covers the full GeometryKind set.
 */
import { CHAT_KERNEL_LERP } from './chatKernel';

export type GeometryKind =
  | 'torus'
  | 'infinity'
  | 'hamiltonian'
  | 'triangular'
  | 'helix'
  | 'mobius'
  | 'lissajous'
  | 'klein'
  | 'hopf'
  | 'rose'
  | 'seifert'
  | 'blend'
  | 'trefoil'
  | 'stereo'
  | 'clifford'
  | 'enneper'
  | 'gyroid'
  | 'calabi'
  | 'figure8'
  | 'villarceau'
  | 'boy'
  | 'catenoid'
  | 'dini'
  | 'roman'
  | 'hyperbolic'
  | 'scherk'
  | 'knot'
  | 'pseudosphere'
  | 'cassini'
  | 'lorenz'
  | 'superformula';

export const GEOMETRIES: GeometryKind[] = [
  'torus',
  'infinity',
  'hamiltonian',
  'triangular',
  'helix',
  'mobius',
  'lissajous',
  'klein',
  'hopf',
  'rose',
  'seifert',
  'blend',
  'trefoil',
  'stereo',
  'clifford',
  'enneper',
  'gyroid',
  'calabi',
  'figure8',
  'villarceau',
  'boy',
  'catenoid',
  'dini',
  'roman',
  'hyperbolic',
  'scherk',
  'knot',
  'pseudosphere',
  'cassini',
  'lorenz',
  'superformula',
];

/** Chat-kernel + expansion geometries that stage-16 evaluates on GPU via transform-feedback. */
export const TF_CHAT_GEOMETRIES: GeometryKind[] = [...GEOMETRIES];

export interface WeaveState {
  gravityPull: number;
  toroidalWeave: number;
  lerp: number;
  blend: number;
}

export interface TargetState {
  geometry: GeometryKind;
}

export interface GaiaContract extends WeaveState, TargetState {
  token?: string;
}

export const DEFAULT_WEAVE: WeaveState = {
  gravityPull: 1,
  toroidalWeave: 1,
  lerp: CHAT_KERNEL_LERP,
  blend: 0.5,
};

export const DEFAULT_TARGET: TargetState = {
  geometry: 'torus',
};

export function parseTargetGeometry(raw: unknown): GeometryKind {
  const value = String(raw || '').toLowerCase() as GeometryKind;
  return GEOMETRIES.includes(value) ? value : 'torus';
}

export function emitGaiaContract(partial: Partial<GaiaContract>): GaiaContract {
  const num = (v: unknown, fallback: number) =>
    Number.isFinite(v as number) ? Number(v) : fallback;
  const contract: GaiaContract = {
    geometry: parseTargetGeometry(partial.geometry),
    gravityPull: num(partial.gravityPull, 1),
    toroidalWeave: num(partial.toroidalWeave, 1),
    lerp: num(partial.lerp, CHAT_KERNEL_LERP),
    blend: num(partial.blend, 0.5),
  };
  if (partial.token) contract.token = String(partial.token);
  return contract;
}

/** Browser-side helper: push a contract onto the visualizer bus. */
export function postGaiaContract(partial: Partial<GaiaContract>): GaiaContract {
  const contract = emitGaiaContract(partial);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gaia:targetState', { detail: contract }));
    try {
      const bc = new BroadcastChannel('gaia-weave');
      bc.postMessage({ type: 'gaia:targetState', ...contract });
      bc.close();
    } catch {
      /* ignore */
    }
  }
  return contract;
}
