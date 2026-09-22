/**
 * LLM → Gaia visualizer contract (band-137).
 * Keep this the single source of truth for targetState shape inside The-Hive.
 * Stage-18: chat-kernel source + evaluateChatKernel pinned in chatKernel.ts.
 * Stage-46: every postGaiaContract dispatch carries STAGE + living sourceHash.
 * Stage-239: postGaiaContract also fans out through weaveEmitter (19-panels).
 */
import { CHAT_KERNEL_LERP, CHAT_KERNEL_SOURCE_HASH, STAGE } from './chatKernel';
import {
  emitBlend,
  emitGeometry,
  emitPulse,
  emitWeaveChange,
  type GeometryName,
} from './weaveEmitter';

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
  stage?: number;
  sourceHash?: string;
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

function asWeaveGeometry(kind: GeometryKind): GeometryName {
  switch (kind) {
    case 'infinity':
    case 'hamiltonian':
    case 'triangular':
    case 'torus':
    case 'klein':
    case 'hopf':
    case 'figure8':
    case 'trefoil':
    case 'blend':
      return kind;
    default:
      return 'torus';
  }
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
    stage: STAGE,
    sourceHash: CHAT_KERNEL_SOURCE_HASH,
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
    const weaveGeom = asWeaveGeometry(contract.geometry);
    emitGeometry(weaveGeom);
    emitBlend(contract.blend);
    emitPulse(contract.gravityPull, contract.token);
    emitWeaveChange({
      gravityPull: contract.gravityPull,
      toroidalWeave: contract.toroidalWeave,
      blend: contract.blend,
      geometry: weaveGeom,
    });
  }
  return contract;
}
