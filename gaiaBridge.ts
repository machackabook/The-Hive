import type { WebSocketServer, WebSocket } from 'ws';
import { emitGaiaContract, type GaiaContract } from './geometryContract';

let lastContract: GaiaContract = emitGaiaContract({});
let lastPositions: { type: string; band: string; t: number; nodes: unknown[] } | null = null;

export function getLastGaiaContract(): GaiaContract {
  return lastContract;
}

export function getLastGaiaPositions() {
  return lastPositions;
}

function frameToken(): string | undefined {
  return process.env.GAIA_PULSE_TOKEN || undefined;
}

export function authorizePulse(provided?: string): boolean {
  const need = frameToken();
  if (!need) return true;
  return provided === need;
}

export function broadcastGaiaContract(wss: WebSocketServer, partial: Partial<GaiaContract>): GaiaContract {
  lastContract = emitGaiaContract({ ...partial, token: frameToken() || partial.token });
  const frame = JSON.stringify({ type: 'gaia:targetState', ...lastContract });
  wss.clients.forEach((client) => {
    if (client.readyState === 1 /* OPEN */) client.send(frame);
  });
  return lastContract;
}

export function broadcastGaiaPulse(wss: WebSocketServer, pulse: number): void {
  const frame = JSON.stringify({ type: 'gaia:pulse', pulse, token: frameToken() });
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) client.send(frame);
  });
}

export function broadcastGaiaPositions(
  wss: WebSocketServer,
  payload: { t?: number; nodes?: unknown[]; band?: string }
) {
  lastPositions = {
    type: 'gaia:positions',
    band: payload.band || '192-network',
    t: Number(payload.t) || Date.now() / 1000,
    nodes: Array.isArray(payload.nodes) ? payload.nodes : [],
  };
  const frame = JSON.stringify(lastPositions);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(frame);
  });
  return lastPositions;
}
