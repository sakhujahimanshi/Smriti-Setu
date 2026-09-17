import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE || undefined, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 30,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ [Elderly Socket.IO] Connected to server:', socket.id);
      socket.emit('identify', 'elderly');
      socket.emit('join:elderly');
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ [Elderly Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Elderly Socket.IO] Connection error:', err.message);
    });
  }

  return socket;
}

export function emitActivityStart(activityName, activityType = 'game') {
  const s = getSocket();
  s.emit('elderly:activity-start', {
    activityName,
    activityType,
    startedAt: Date.now()
  });
}

export function emitTelemetry(data) {
  const s = getSocket();
  s.emit('elderly:telemetry', {
    ...data,
    timestamp: Date.now()
  });
}

export function emitSessionComplete(data) {
  const s = getSocket();
  s.emit('elderly:session-complete', {
    ...data,
    completedAt: Date.now()
  });
}

export default getSocket;
