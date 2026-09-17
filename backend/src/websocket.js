const { WebSocketServer, WebSocket } = require('ws');

let wss = null;
const clients = new Set();

function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const host = request.headers.host || 'localhost';
      const pathname = new URL(request.url, `http://${host}`).pathname;
      if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (e) {}
  });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    ws.isAlive = true;
    ws.role = 'unknown';

    // Heartbeat setup
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message.toString());
        handleMessage(ws, payload);
      } catch (err) {
        console.warn('[WebSocket Error] Invalid JSON message:', err.message);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('[WebSocket Error]', err.message);
      clients.delete(ws);
    });

    // Send welcome acknowledgment
    safeSend(ws, {
      type: 'CONNECTION_ACK',
      timestamp: Date.now(),
      clientCount: clients.size
    });
  });

  // Keep-alive heartbeat interval
  const pingInterval = setInterval(() => {
    clients.forEach((ws) => {
      if (!ws.isAlive) {
        clients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  console.log('📡 WebSocket Server initialized on /ws');
  return wss;
}

function safeSend(ws, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (e) {
      console.warn('[WebSocket Send Error]', e.message);
    }
  }
}

function broadcast(data, filterFn = null) {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      if (!filterFn || filterFn(ws)) {
        safeSend(ws, data);
      }
    }
  });
}

function handleMessage(senderWs, payload) {
  const { type, role, data } = payload;

  if (role) {
    senderWs.role = role;
  }

  switch (type) {
    case 'IDENTIFY':
      senderWs.role = payload.role || 'client';
      safeSend(senderWs, {
        type: 'IDENTIFIED',
        role: senderWs.role,
        timestamp: Date.now()
      });
      break;

    case 'VR_SESSION_START':
      // Caregiver starts VR session -> broadcast to elderly headset clients
      broadcast({
        type: 'VR_SESSION_START',
        memories: data?.memories || [],
        sessionId: data?.sessionId || `vr_session_${Date.now()}`,
        startedAt: Date.now(),
        senderRole: senderWs.role
      });
      break;

    case 'VR_TELEMETRY_UPDATE':
      // Headset reports telemetry -> broadcast to caregiver dashboard
      broadcast({
        type: 'VR_TELEMETRY_UPDATE',
        activeMemoryId: data?.activeMemoryId,
        activeMemoryTitle: data?.activeMemoryTitle,
        imageUrl: data?.imageUrl,
        userStatus: data?.userStatus,
        responseEvaluation: data?.responseEvaluation,
        responseTimeSeconds: data?.responseTimeSeconds,
        hintsDelivered: data?.hintsDelivered,
        attempts: data?.attempts,
        sessionProgress: data?.sessionProgress,
        timestamp: Date.now(),
        senderRole: senderWs.role
      });
      break;

    case 'VR_SESSION_COMPLETE':
      // Headset finishes session -> broadcast to caregiver dashboard
      broadcast({
        type: 'VR_SESSION_COMPLETE',
        sessionId: data?.sessionId,
        summary: data?.summary,
        timestamp: Date.now(),
        senderRole: senderWs.role
      });
      break;

    case 'VR_CONTROL_EVENT':
      // Caregiver pauses, skips, or sends gentle prompt
      broadcast({
        type: 'VR_CONTROL_EVENT',
        action: data?.action,
        payload: data,
        senderRole: senderWs.role
      });
      break;

    case 'PING':
      safeSend(senderWs, { type: 'PONG', timestamp: Date.now() });
      break;

    default:
      // Generic relay
      broadcast({
        type,
        data,
        timestamp: Date.now(),
        senderRole: senderWs.role
      });
      break;
  }
}

module.exports = {
  initWebSocketServer,
  broadcast,
  getClientsCount: () => clients.size
};
