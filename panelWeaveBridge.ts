/** Stage 277/284 — thin panel → weaveEmitter adapter. */
import {
  emitBlend,
  emitGeometry,
  emitLedger,
  emitPulse,
  emitWeaveChange,
  type GeometryName,
} from './weaveEmitter';

export type PanelTelemetry = {
  coherence?: number;
  neuralEntropy?: number;
  deviceTemp?: number;
  gravityPull?: number;
  toroidalWeave?: number;
  blend?: number;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Map environmental sliders onto gravity / weave / blend. */
export function emitPanelTelemetry(t: PanelTelemetry) {
  const gravityPull =
    t.gravityPull ??
    (t.coherence != null ? clamp(t.coherence / 80, 0.25, 2.4) : undefined);
  const toroidalWeave =
    t.toroidalWeave ??
    (t.neuralEntropy != null ? clamp(t.neuralEntropy / 10, 0.2, 3) : undefined);
  const blend = t.blend ?? (t.deviceTemp != null ? clamp((t.deviceTemp - 20) / 40, 0, 1) : undefined);

  if (gravityPull != null) emitPulse(gravityPull);
  emitWeaveChange({
    ...(gravityPull != null ? { gravityPull } : {}),
    ...(toroidalWeave != null ? { toroidalWeave } : {}),
    ...(blend != null ? { blend } : {}),
  });
  if (blend != null) emitBlend(blend);
}

export function emitPanelGeometry(geometry: GeometryName) {
  emitGeometry(geometry);
}

export function emitPanelLedger(topics = 1, votes = 0, bridges = 1) {
  emitLedger({ topics, votes, bridges });
}
