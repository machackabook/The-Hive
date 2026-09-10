import fs from 'fs';
import path from 'path';
import type { WebSocketServer, WebSocket } from 'ws';
import { emitGaiaContract, type GaiaContract } from './geometryContract';

export interface LedgerSheet {
  topics: number;
  votes: number;
  bridges: number;
  nodes: number;
}

const SNAPSHOT_PATH = process.env.GAIA_SNAPSHOT_PATH || path.join(process.cwd(), '.gaia-snapshot.json');

let lastContract: GaiaContract = emitGaiaContract({});
let lastPositions: { type: string; band: string; t: number; nodes: unknown[] } | null = null;
let lastLedger: LedgerSheet = { topics: 0, votes: 0, bridges: 0, nodes: 0 };
let lastPulse = 1;
let lastPulseAt = 0;
let unsignedRefused = 0;

function loadSnapshot() {
  try {
    if (!fs.existsSync(SNAPSHOT_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    if (raw.ledger) lastLedger = raw.ledger;
    if (Number.isFinite(Number(raw.lastPulse))) lastPulse = Number(raw.lastPulse);
    if (Number.isFinite(Number(raw.lastPulseAt))) lastPulseAt = Number(raw.lastPulseAt);
    if (raw.contract) lastContract = raw.contract;
    if (Number.isFinite(Number(raw.unsignedRefused))) unsignedRefused = Number(raw.unsignedRefused);
  } catch {
    /* ignore corrupt snapshot */
  }
}

function saveSnapshot() {
  try {
    const snap = {
      stage: 27,
      ledger: lastLedger,
      lastPulse,
      lastPulseAt,
      unsignedRefused,
      contract: lastContract,
      savedAt: Date.now(),
    };
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snap));
  } catch {
    /* disk may be read-only */
  }
}

loadSnapshot();

export function getLastGaiaContract(): GaiaContract {
  return lastContract;
}

export function getLastGaiaPositions() {
  return lastPositions;
}

export function getLastLedger(): LedgerSheet {
  return lastLedger;
}

export function getLastPulse(): number {
  return lastPulse;
}

export function getLastPulseAt(): number {
  return lastPulseAt;
}

export function getPulseAgeSeconds(): number {
  return lastPulseAt ? (Date.now() - lastPulseAt) / 1000 : 0;
}

export function getUnsignedRefused(): number {
  return unsignedRefused;
}

function frameToken(): string | undefined {
  return process.env.GAIA_PULSE_TOKEN || undefined;
}

export function authorizePulse(provided?: string): boolean {
  const need = frameToken();
  if (!need) return true;
  if (provided === need) return true;
  unsignedRefused += 1;
  saveSnapshot();
  return false;
}

export function stampLedger(partial: Partial<LedgerSheet>): LedgerSheet {
  lastLedger = {
    topics: Number(partial.topics ?? lastLedger.topics) || 0,
    votes: Number(partial.votes ?? lastLedger.votes) || 0,
    bridges: Number(partial.bridges ?? lastLedger.bridges) || 0,
    nodes: Number(partial.nodes ?? lastLedger.nodes) || 0,
  };
  saveSnapshot();
  return lastLedger;
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
  saveSnapshot();
  return lastContract;
}

export function broadcastGaiaPulse(wss: WebSocketServer, pulse: number, ledger?: Partial<LedgerSheet>): void {
  if (ledger) stampLedger(ledger);
  lastPulse = Number.isFinite(pulse) ? pulse : 1;
  lastPulseAt = Date.now();
  const frameObj = {
    type: 'gaia:pulse',
    pulse: lastPulse,
    token: frameToken(),
    ledger: lastLedger,
    lastPulseAt,
  };
  const frame = JSON.stringify(frameObj);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) client.send(frame);
  });
  fanOut(frameObj);
  saveSnapshot();
}

export function broadcastGaiaLedger(wss: WebSocketServer, ledger?: Partial<LedgerSheet>): LedgerSheet {
  stampLedger(ledger || {});
  const frameObj = {
    type: 'gaia:ledger',
    ledger: lastLedger,
    token: frameToken(),
    lastPulse,
    lastPulseAt,
  };
  const frame = JSON.stringify(frameObj);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) client.send(frame);
  });
  fanOut(frameObj);
  return lastLedger;
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
  stampLedger({ nodes: lastPositions.nodes.length });
  const frame = JSON.stringify(lastPositions);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(frame);
  });
  fanOut(lastPositions);
  return lastPositions;
}
