/**
 * LLM → Gaia visualizer contract (band-137).
 * Keep this the single source of truth for targetState shape inside The-Hive.
 */
export type GeometryKind = 'torus' | 'infinity' | 'hamiltonian' | 'triangular';

export interface WeaveState {
  gravityPull: number;
  toroidalWeave: number;
}

export interface TargetState {
  geometry: GeometryKind;
}

export const DEFAULT_WEAVE: WeaveState = {
  gravityPull: 1,
  toroidalWeave: 1,
};

export const DEFAULT_TARGET: TargetState = {
  geometry: 'torus',
};

export function parseTargetGeometry(raw: unknown): GeometryKind {
  const value = String(raw || '').toLowerCase();
  if (value === 'infinity' || value === 'hamiltonian' || value === 'triangular' || value === 'torus') {
    return value;
  }
  return 'torus';
}
