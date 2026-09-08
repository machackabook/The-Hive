import type { WebSocketServer, WebSocket } from 'ws';
import { emitGaiaContract, type GaiaContract } from './geometryContract';

let lastContract: GaiaContract = emitGaiaContract({});

export function getLastGaiaContract(): GaiaContract {
  return lastContract;
}

export function broadcastGaiaContract(wss: WebSocketServer, partial: Partial<GaiaContract>): GaiaContract {
  lastContract = emitGaiaContract(partial);
  const frame = JSON.stringify({ type: 'gaia:targetState', ...lastContract });
  wss.clients.forEach((client) => {
    if (client.readyState === 1 /* OPEN */) client.send(frame);
  });
  return lastContract;
}

export function broadcastGaiaPulse(wss: WebSocketServer, pulse: number): void {
  const frame = JSON.stringify({ type: 'gaia:pulse', pulse });
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) client.send(frame);
  });
}
