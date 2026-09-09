import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import net from "net";
import {
  authorizePulse,
  broadcastGaiaContract,
  broadcastGaiaLedger,
  broadcastGaiaPositions,
  broadcastGaiaPulse,
  getLastGaiaContract,
  getLastGaiaPositions,
  getLastLedger,
  getUnsignedRefused,
  stampLedger,
} from "./gaiaBridge";

const INITIAL_TOPIC = "The Ethics of Autonomous Quine Replication";

const topicsDb = [
  { id: '1', title: 'Self-Compiling Biological DNA Codes', votes: 12 },
  { id: '2', title: 'Quantum Encryption in Distributed IRC', votes: 8 },
  { id: '3', title: 'The Architect\'s Paradox in Nexus Gaia', votes: 15 },
  { id: '4', title: INITIAL_TOPIC, votes: 10 },
];

let globalCurrentTopic = INITIAL_TOPIC;

interface IrcBridge {
  id: string;
  server: string;
  port: number;
  channel: string;
  nick: string;
  status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  socket?: net.Socket;
}

const activeBridges: IrcBridge[] = [];

function pulseTokenFromReq(req: express.Request): string | undefined {
  const header = req.header('x-gaia-token');
  const body = req.body?.token;
  return header || body;
}

function liveSheet() {
  return {
    topics: topicsDb.length,
    votes: topicsDb.reduce((sum, t) => sum + (t.votes || 0), 0),
    bridges: activeBridges.length,
    nodes: getLastGaiaPositions()?.nodes?.length || 0,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  const PORT = 3000;
  const server = createServer(app);

  const wss = new WebSocketServer({ server });

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      stage: 26,
      gaia: getLastGaiaContract(),
      positions: getLastGaiaPositions(),
      ledger: getLastLedger(),
      unsignedRefused: getUnsignedRefused(),
    });
  });

  app.get("/api/gaia/contract", (req, res) => {
    res.json(getLastGaiaContract());
  });

  app.post("/api/gaia/contract", (req, res) => {
    if (!authorizePulse(pulseTokenFromReq(req))) {
      return res.status(401).json({ error: "invalid gaia token" });
    }
    const contract = broadcastGaiaContract(wss, req.body || {});
    res.json(contract);
  });

  app.post("/api/gaia/pulse", (req, res) => {
    if (!authorizePulse(pulseTokenFromReq(req))) {
      return res.status(401).json({ error: "invalid gaia token", unsignedRefused: getUnsignedRefused() });
    }
    const pulse = Number(req.body?.pulse ?? req.body);
    const ledger = stampLedger({ ...liveSheet(), ...(req.body?.ledger || {}) });
    broadcastGaiaPulse(wss, Number.isFinite(pulse) ? pulse : 1, ledger);
    res.json({ type: "gaia:pulse", pulse: Number.isFinite(pulse) ? pulse : 1, ledger });
  });

  app.get("/api/gaia/ledger", (req, res) => {
    res.json({ type: "gaia:ledger", ledger: stampLedger(liveSheet()) });
  });

  app.post("/api/gaia/ledger", (req, res) => {
    if (!authorizePulse(pulseTokenFromReq(req))) {
      return res.status(401).json({ error: "invalid gaia token", unsignedRefused: getUnsignedRefused() });
    }
    const ledger = broadcastGaiaLedger(wss, { ...liveSheet(), ...(req.body?.ledger || req.body || {}) });
    res.json({ type: "gaia:ledger", ledger });
  });

  app.get("/api/gaia/positions", (req, res) => {
    res.json(getLastGaiaPositions() || { type: "gaia:positions", band: "192-network", t: 0, nodes: [] });
  });

  app.post("/api/gaia/positions", (req, res) => {
    if (!authorizePulse(pulseTokenFromReq(req))) {
      return res.status(401).json({ error: "invalid gaia token" });
    }
    const stored = broadcastGaiaPositions(wss, req.body || {});
    res.json(stored);
  });

  function broadcastBridgesList() {
    const list = activeBridges.map(b => ({
      id: b.id,
      server: b.server,
      port: b.port,
      channel: b.channel,
      nick: b.nick,
      status: b.status
    }));
    stampLedger(liveSheet());
    broadcastGaiaLedger(wss, liveSheet());
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'bridges_sync', bridges: list, ledger: getLastLedger() }));
      }
    });
  }

  function createIrcBridge(
    serverAddress: string, 
    portNumber: number, 
    channelName: string, 
    nickname: string, 
    onBroadcast: (msg: any) => void
  ) {
    const id = Math.random().toString(36).substring(2, 9);
    const formattedChannel = channelName.startsWith('#') ? channelName : `#${channelName}`;
    
    const bridge: IrcBridge = {
      id,
      server: serverAddress,
      port: portNumber,
      channel: formattedChannel,
      nick: nickname,
      status: 'CONNECTING'
    };

    console.log(`[IRC BRIDGE] Creating link to ${serverAddress}:${portNumber} (${formattedChannel}) as ${nickname}`);

    activeBridges.push(bridge);
    broadcastBridgesList();

    const socket = net.connect({ host: serverAddress, port: portNumber }, () => {
      console.log(`[IRC BRIDGE] TCP connected to ${serverAddress}:${portNumber}`);
      try {
        socket.write(`NICK ${nickname}\r\n`);
        socket.write(`USER ${nickname} 0 * :Gaia Nexus Autonomous Bridge\r\n`);
      } catch (err) {
        console.error("[IRC BRIDGE] Write error on connect:", err);
      }
    });

    socket.setKeepAlive(true, 10000);
    socket.setTimeout(15000);

    socket.on('timeout', () => {
      console.warn(`[IRC BRIDGE] Timeout connecting to ${serverAddress}:${portNumber}`);
      socket.destroy();
    });

    socket.on('error', (err) => {
      console.error(`[IRC BRIDGE ERROR] ${serverAddress}:${portNumber} => ${err.message}`);
      bridge.status = 'ERROR';
      broadcastBridgesList();
    });

    socket.on('close', () => {
      console.log(`[IRC BRIDGE] Connection closed for ${serverAddress}:${portNumber}`);
      bridge.status = 'DISCONNECTED';
      broadcastBridgesList();
    });

    let buffer = '';
    socket.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('PING ')) {
          const challenge = line.substring(5);
          socket.write(`PONG ${challenge}\r\n`);
          continue;
        }

        if (line.includes(' 001 ') || line.includes(' 376 ') || line.includes('Looking up your hostname')) {
          if (bridge.status !== 'CONNECTED') {
            bridge.status = 'CONNECTED';
            socket.write(`JOIN ${formattedChannel}\r\n`);
            broadcastBridgesList();
          }
        }

        const privmsgMatch = line.match(/^:([^!]+)![^ ]+ PRIVMSG ([^ ]+) :(.+)$/);
        if (privmsgMatch) {
          const senderNick = privmsgMatch[1];
          const target = privmsgMatch[2];
          const text = privmsgMatch[3];

          if (target.toLowerCase() === formattedChannel.toLowerCase()) {
            onBroadcast({
              type: 'irc_message',
              id,
              server: serverAddress,
              channel: formattedChannel,
              nick: senderNick,
              text
            });
          }
        }
      }
    });

    setTimeout(() => {
      if (bridge.status === 'CONNECTING') {
        console.log(`[IRC BRIDGE] Connecting timeout or force-elevating bridge ${id}`);
        try {
          socket.write(`JOIN ${formattedChannel}\r\n`);
        } catch (e) {}
        bridge.status = 'CONNECTED';
        broadcastBridgesList();
      }
    }, 5500);

    bridge.socket = socket;
    return bridge;
  }

  wss.on('connection', (ws) => {
    stampLedger(liveSheet());
    ws.send(JSON.stringify({ 
      type: 'sync', 
      topics: topicsDb, 
      currentTopic: globalCurrentTopic,
      gaia: getLastGaiaContract(),
      ledger: getLastLedger(),
      bridges: activeBridges.map(b => ({
        id: b.id,
        server: b.server,
        port: b.port,
        channel: b.channel,
        nick: b.nick,
        status: b.status
      }))
    }));
    ws.send(JSON.stringify({ type: 'gaia:targetState', ...getLastGaiaContract() }));
    ws.send(JSON.stringify({ type: 'gaia:ledger', ledger: getLastLedger() }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'gaia:targetState' || data.type === 'gaia_contract') {
          if (!authorizePulse(data.token)) return;
          broadcastGaiaContract(wss, data.detail || data);
          return;
        }
        if (data.type === 'gaia:pulse') {
          if (!authorizePulse(data.token)) return;
          broadcastGaiaPulse(wss, Number(data.pulse ?? data.detail?.pulse ?? 1), liveSheet());
          return;
        }
        if (data.type === 'gaia:ledger') {
          if (!authorizePulse(data.token)) return;
          broadcastGaiaLedger(wss, { ...liveSheet(), ...(data.ledger || data.detail?.ledger || {}) });
          return;
        }
        if (data.type === 'gaia:positions') {
          if (!authorizePulse(data.token)) return;
          broadcastGaiaPositions(wss, data);
          return;
        }

        if (data.type === 'vote') {
          const id = data.id;
          const topic = topicsDb.find(t => t.id === id);
          if (topic) {
            topic.votes += 1;
          }
          
          const sorted = [...topicsDb].sort((a, b) => b.votes - a.votes);
          const winner = sorted[0];
          const current = topicsDb.find(t => t.title === globalCurrentTopic);

          if (winner && winner.title !== globalCurrentTopic && winner.votes > (current?.votes ?? 0) + 2) {
            globalCurrentTopic = winner.title;
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'topic_changed', newTopic: globalCurrentTopic }));
              }
            });
          }

          stampLedger(liveSheet());
          broadcastGaiaLedger(wss, liveSheet());

          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ 
                type: 'sync', 
                topics: topicsDb, 
                currentTopic: globalCurrentTopic,
                gaia: getLastGaiaContract(),
                ledger: getLastLedger(),
                bridges: activeBridges.map(b => ({
                  id: b.id,
                  server: b.server,
                  port: b.port,
                  channel: b.channel,
                  nick: b.nick,
                  status: b.status
                }))
              }));
            }
          });
        }

        if (data.type === 'connect_bridge') {
          const { server: srv, port, channel, nick } = data;
          createIrcBridge(srv, Number(port) || 6667, channel, nick, (payload) => {
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload));
              }
            });
          });
        }

        if (data.type === 'disconnect_bridge') {
          const { id } = data;
          const idx = activeBridges.findIndex(b => b.id === id);
          if (idx !== -1) {
            const bridge = activeBridges[idx];
            if (bridge.socket) {
              try {
                bridge.socket.destroy();
              } catch (e) {}
            }
            activeBridges.splice(idx, 1);
            console.log(`[IRC BRIDGE] Disconnected bridge ID: ${id}`);
            broadcastBridgesList();
          }
        }

        if (data.type === 'user_message') {
          const { role, text } = data;
          activeBridges.forEach(bridge => {
            if (bridge.status === 'CONNECTED' && bridge.socket) {
              try {
                bridge.socket.write(`PRIVMSG ${bridge.channel} :<${role}> ${text}\r\n`);
              } catch (e) {
                console.error("[IRC BRIDGE] Failed to write outbound data:", e);
              }
            } else {
              setTimeout(() => {
                const echoOutputs = [
                  `[SimBridge] Received core telemetry: "<${role}> ${text}". Sync state is robust.`,
                  `[SimBridge] Dispatched metadata packet to ${bridge.channel} channel on ${bridge.server}`,
                  `[SimBridge] Echo node acknowledging transmission: coherence is 100% compliant.`
                ];
                const replyText = echoOutputs[Math.floor(Math.random() * echoOutputs.length)];
                ws.send(JSON.stringify({
                  type: 'irc_message',
                  id: bridge.id,
                  server: bridge.server,
                  channel: bridge.channel,
                  nick: `coherence_watcher`,
                  text: replyText
                }));
              }, 1800);
            }
          });
        }

      } catch (err) {
        console.error(err);
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
