/** Stage 284 — Quine / panel sliders → weave bus. */
import { useEffect, useRef } from 'react';
import { emitPanelTelemetry, type PanelTelemetry } from '../panelWeaveBridge';

export function usePanelWeave(t: PanelTelemetry, enabled = true) {
  const last = useRef('');
  useEffect(() => {
    if (!enabled) return;
    const key = JSON.stringify({
      c: t.coherence,
      n: t.neuralEntropy,
      d: t.deviceTemp,
      g: t.gravityPull,
      w: t.toroidalWeave,
      b: t.blend,
    });
    if (key === last.current) return;
    last.current = key;
    emitPanelTelemetry(t);
  }, [enabled, t.coherence, t.neuralEntropy, t.deviceTemp, t.gravityPull, t.toroidalWeave, t.blend]);
}
