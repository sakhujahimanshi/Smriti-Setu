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
      console.log('⚡ [Caregiver Socket.IO] Connected to server:', socket.id);
      socket.emit('identify', 'caregiver');
      socket.emit('join:caregiver');
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ [Caregiver Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Caregiver Socket.IO] Connection error:', err.message);
    });
  }

  return socket;
}

export default getSocket;
