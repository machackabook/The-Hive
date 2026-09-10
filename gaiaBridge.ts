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

export interface PulseAuthRequest {
  token?: string;
  plusCode?: string;
  email?: string;
  ip?: string;
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
      stage: 28,
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
  return process.env.HEARTBEATSCAN_TOKEN || undefined;
}

function configuredPlusCode(): string | undefined {
  return process.env.HEARTBEATSCAN_PLUS_CODE || undefined;
}

function configuredEmails(): Set<string> {
  return new Set(
    (process.env.HEARTBEATSCAN_ALLOWED_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function configuredCidrs(): string[] {
  return (process.env.HEARTBEATSCAN_ALLOWED_CIDRS || '')
    .split(',')
    .map((cidr) => cidr.trim())
    .filter(Boolean);
}

function normalizeIp(ip?: string): string | undefined {
  if (!ip) return undefined;
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

function ipv4ToInt(ip: string): number | undefined {
  const parts = ip.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) return undefined;
  const nums = parts.map(Number);
  if (nums.some((part) => part < 0 || part > 255)) return undefined;
  return ((nums[0] << 24) >>> 0) + (nums[1] << 16) + (nums[2] << 8) + nums[3];
}

function ipMatchesCidr(ip: string, cidr: string): boolean {
  const [network, prefixText] = cidr.split('/');
  const ipInt = ipv4ToInt(ip);
  const networkInt = ipv4ToInt(network);
  const prefix = Number(prefixText);
  if (ipInt === undefined || networkInt === undefined || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return ip === cidr;
  }
  if (prefix === 0) return true;
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  return (ipInt & mask) === (networkInt & mask);
}

function networkAllowed(ip?: string): boolean {
  const cidrs = configuredCidrs();
  if (!cidrs.length) return false;
  const normalized = normalizeIp(ip);
  return !!normalized && cidrs.some((cidr) => ipMatchesCidr(normalized, cidr));
}

function emailAllowed(email?: string): boolean {
  const allowed = configuredEmails();
  if (!allowed.size) return false;
  return !!email && allowed.has(email.trim().toLowerCase());
}

export function authorizePulseRequest(request: PulseAuthRequest): boolean {
  const token = frameToken();
  const plusCode = configuredPlusCode();
  const emails = configuredEmails();
  const cidrs = configuredCidrs();

  // Fail closed whenever HeartbeatScan protection is configured incompletely.
  if (!token || !plusCode || !emails.size || !cidrs.length) {
    unsignedRefused += 1;
    saveSnapshot();
    return false;
  }

  if (request.token !== token) {
    unsignedRefused += 1;
    saveSnapshot();
    return false;
  }
  if (request.plusCode !== plusCode) {
    unsignedRefused += 1;
    saveSnapshot();
    return false;
  }
  if (!emailAllowed(request.email)) {
    unsignedRefused += 1;
    saveSnapshot();
    return false;
  }
  if (!networkAllowed(request.ip)) {
    unsignedRefused += 1;
    saveSnapshot();
    return false;
  }
  return true;
}

/**
 * Legacy token-only check retained for internal WebSocket message handling.
 * HTTP mutation endpoints should use authorizePulseRequest(), which applies
 * token + Plus Code + email + network gates.
 */
export function authorizePulse(provided?: string): boolean {
  const need = frameToken();
  if (!need || provided !== need) {
    unsignedRefused += 1;
    saveSnapshot();
    return false;
  }
  return true;
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
        ...(token ? { 'x-heartbeatscan-token': token } : {}),
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

export function broadcastGaiaContract(wss: WebSocketServer, partial: Partial<GaiaContract>): GaiaContract {
  // Never put the authentication credential into a broadcast frame.
  lastContract = emitGaiaContract({ ...partial, token: undefined });
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
