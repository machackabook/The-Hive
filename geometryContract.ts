/**
 * LLM → Gaia visualizer contract (band-137).
 * Keep this the single source of truth for targetState shape inside The-Hive.
 */
export type GeometryKind =
  | 'torus'
  | 'infinity'
  | 'hamiltonian'
  | 'triangular'
  | 'helix'
  | 'mobius'
  | 'lissajous'
  | 'klein';

export const GEOMETRIES: GeometryKind[] = [
  'torus',
  'infinity',
  'hamiltonian',
  'triangular',
  'helix',
  'mobius',
  'lissajous',
  'klein',
];

export interface WeaveState {
  gravityPull: number;
  toroidalWeave: number;
  lerp: number;
}

export interface TargetState {
  geometry: GeometryKind;
}

export interface GaiaContract extends WeaveState, TargetState {}

export const DEFAULT_WEAVE: WeaveState = {
  gravityPull: 1,
  toroidalWeave: 1,
  lerp: 0.05,
};

export const DEFAULT_TARGET: TargetState = {
  geometry: 'torus',
};

export function parseTargetGeometry(raw: unknown): GeometryKind {
  const value = String(raw || '').toLowerCase() as GeometryKind;
  return GEOMETRIES.includes(value) ? value : 'torus';
}

export function emitGaiaContract(partial: Partial<GaiaContract>): GaiaContract {
  return {
    geometry: parseTargetGeometry(partial.geometry),
    gravityPull: Number.isFinite(partial.gravityPull as number) ? Number(partial.gravityPull) : 1,
    toroidalWeave: Number.isFinite(partial.toroidalWeave as number) ? Number(partial.toroidalWeave) : 1,
    lerp: Number.isFinite(partial.lerp as number) ? Number(partial.lerp) : 0.05,
  };
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
