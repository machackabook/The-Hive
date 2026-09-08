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
  | 'mobius';

export const GEOMETRIES: GeometryKind[] = [
  'torus',
  'infinity',
  'hamiltonian',
  'triangular',
  'helix',
  'mobius',
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
