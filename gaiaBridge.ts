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

function peerUrls(): string[] {
  const raw = process.env.GAIA_PEERS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
}

function fanOut(payload: unknown) {
  const token = frameToken();
  for (const url of peerUrls()) {
    fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { 'x-gaia-token': token } : {}),
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

export function broadcastGaiaContract(wss: WebSocketServer, partial: Partial<GaiaContract>): GaiaContract {
  lastContract = emitGaiaContract({ ...partial, token: frameToken() || partial.token });
  const frameObj = { type: 'gaia:targetState', ...lastContract };
  const frame = JSON.stringify(frameObj);
  wss.clients.forEach((client) => {
    if (client.readyState === 1 /* OPEN */) client.send(frame);
  });
  fanOut(frameObj);
  return lastContract;
}

export function broadcastGaiaPulse(wss: WebSocketServer, pulse: number): void {
  const frameObj = { type: 'gaia:pulse', pulse, token: frameToken() };
  const frame = JSON.stringify(frameObj);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) client.send(frame);
  });
  fanOut(frameObj);
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
  fanOut(lastPositions);
  return lastPositions;
}
