/**
 * Stage 19 — NexusStudio / Quine / editor weave changes must call this.
 * Keeps the chat-kernel contract (lerp 0.05, gravity, weave, blend, geometry)
 * on the same bus the visualizer already listens to.
 * Stage 25 — emitPulse stamps gravity via gaia:pulse so the visualizer HUD can show lastPulse.
 */
import { postGaiaContract, type GaiaContract, type GeometryKind } from './geometryContract';

let last: GaiaContract | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function lastContract(): GaiaContract | null {
  return last;
}

export function emitWeaveChange(
  partial: Partial<GaiaContract>,
  opts: { debounceMs?: number } = {}
): GaiaContract {
  const debounceMs = opts.debounceMs ?? 40;
  const run = () => {
    last = postGaiaContract(partial);
    return last;
  };
  if (debounceMs <= 0) return run();
  if (timer) clearTimeout(timer);
  timer = setTimeout(run, debounceMs);
  last = { ...(last || postGaiaContract({})), ...partial } as GaiaContract;
  return last;
}

export function emitGeometry(geometry: GeometryKind) {
  return emitWeaveChange({ geometry }, { debounceMs: 0 });
}

export function emitGravity(gravityPull: number) {
  return emitWeaveChange({ gravityPull });
}

export function emitToroidalWeave(toroidalWeave: number) {
  return emitWeaveChange({ toroidalWeave });
}

export function emitBlend(blend: number) {
  return emitWeaveChange({ blend });
}

export function emitPulse(pulse: number, token?: string) {
  const detail = { pulse, token };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gaia:pulse', { detail }));
    try {
      const bc = new BroadcastChannel('gaia-weave');
      bc.postMessage({ type: 'gaia:pulse', pulse, token });
      bc.close();
    } catch {
      /* BroadcastChannel unavailable */
    }
  }
  return emitGravity(pulse);
}
