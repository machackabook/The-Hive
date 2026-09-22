/** Stage 240 panel → visualizer weave bus (item 19-panels). Dual-dispatch gaia-weave + gaia:targetState. */
export type GeometryName =
  | 'infinity'
  | 'hamiltonian'
  | 'triangular'
  | 'torus'
  | 'klein'
  | 'hopf'
  | 'figure8'
  | 'trefoil'
  | 'blend';

export type WeaveChange = {
  gravityPull?: number;
  toroidalWeave?: number;
  blend?: number;
  geometry?: GeometryName;
};

export type PulsePayload = {
  topics?: number;
  votes?: number;
  bridges?: number;
};

const CHANNEL = 'gaia-weave';
const TARGET_CHANNEL = 'gaia:targetState';

function dispatch(type: string, detail: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const payload = { type, ...detail, ts: Date.now() };
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: payload }));
  window.dispatchEvent(new CustomEvent(TARGET_CHANNEL, { detail: payload }));
  try {
    window.parent?.postMessage({ channel: CHANNEL, ...payload }, '*');
    window.parent?.postMessage({ channel: TARGET_CHANNEL, ...payload }, '*');
  } catch {
    /* framed preview may reject */
  }
}

export function emitGeometry(geometry: GeometryName) {
  dispatch('geometry', { geometry });
}

export function emitBlend(blend: number) {
  dispatch('blend', { blend });
}

export function emitPulse(gravityPull: number, token?: string, extra: PulsePayload = {}) {
  dispatch('pulse', { gravityPull, token: token ?? null, ...extra });
}

export function emitLedger(ledger: PulsePayload) {
  dispatch('ledger', { ...ledger });
}

export function emitWeaveChange(change: WeaveChange) {
  dispatch('weave', { ...change });
}

export function subscribeWeave(handler: (event: { type: string } & Record<string, unknown>) => void) {
  if (typeof window === 'undefined') return () => {};
  const onEvent = (e: Event) => {
    const ce = e as CustomEvent;
    if (ce.detail) handler(ce.detail);
  };
  const onMessage = (e: MessageEvent) => {
    if (e.data?.channel === CHANNEL || e.data?.channel === TARGET_CHANNEL) handler(e.data);
  };
  window.addEventListener(CHANNEL, onEvent as EventListener);
  window.addEventListener(TARGET_CHANNEL, onEvent as EventListener);
  window.addEventListener('message', onMessage);
  return () => {
    window.removeEventListener(CHANNEL, onEvent as EventListener);
    window.removeEventListener(TARGET_CHANNEL, onEvent as EventListener);
    window.removeEventListener('message', onMessage);
  };
}
