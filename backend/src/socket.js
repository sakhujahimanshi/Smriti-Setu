const { Server } = require('socket.io');

let io = null;

function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Auto-join based on role identification
    socket.on('identify', (role) => {
      socket.role = role;
      if (role === 'caregiver') {
        socket.join('room:caregiver');
        console.log(`[Socket.IO] ${socket.id} joined room:caregiver`);
      } else if (role === 'elderly' || role === 'vr') {
        socket.join('room:elderly');
        console.log(`[Socket.IO] ${socket.id} joined room:elderly`);
      }
      socket.emit('identified', { role, socketId: socket.id, timestamp: Date.now() });
    });

    socket.on('join:caregiver', () => {
      socket.role = 'caregiver';
      socket.join('room:caregiver');
      console.log(`[Socket.IO] ${socket.id} joined room:caregiver`);
    });

    socket.on('join:elderly', () => {
      socket.role = 'elderly';
      socket.join('room:elderly');
      console.log(`[Socket.IO] ${socket.id} joined room:elderly`);
    });

    // 1. Elderly Activity Start
    socket.on('elderly:activity-start', (data) => {
      console.log(`[Socket.IO] Elderly activity started:`, data?.activityName || data?.title);
      const payload = {
        ...data,
        timestamp: Date.now(),
        senderId: socket.id
      };
      io.to('room:caregiver').emit('caregiver:activity-started', payload);
      // Also broadcast to all in case rooms were bypassed
      io.emit('elderly:activity-started', payload);
    });

    // 2. High-Frequency Live Telemetry from Elderly / VR viewport
    socket.on('elderly:telemetry', (data) => {
      const payload = {
        ...data,
        timestamp: Date.now(),
        senderId: socket.id
      };
      io.to('room:caregiver').emit('caregiver:live-telemetry', payload);
      io.emit('caregiver:live-telemetry-broadcast', payload);
    });

    // 3. Elderly Session Complete
    socket.on('elderly:session-complete', (data) => {
      console.log(`[Socket.IO] Elderly session completed:`, data?.activityName || data?.memoryTitle);
      const payload = {
        ...data,
        timestamp: Date.now(),
        senderId: socket.id
      };
      io.to('room:caregiver').emit('caregiver:session-completed', payload);
      io.emit('caregiver:session-completed', payload);
      io.emit('caregiver:game-completed', payload);
      io.emit('caregiver:session-completed-broadcast', payload);
    });

    // 4. Caregiver Controls (Remote Pause, Skip, Force-Exit, or Gentle Voice Prompts)
    socket.on('caregiver:control', (data) => {
      console.log(`[Socket.IO] Caregiver control command:`, data?.action);
      io.to('room:elderly').emit('elderly:control', data);
      io.emit('elderly:control', data);
      io.emit('elderly:control-broadcast', data);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('⚡ Socket.IO real-time engine attached to HTTP server');
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return io;
}

function emitToCaregiver(event, payload) {
  if (io) {
    io.to('room:caregiver').emit(event, payload);
    io.emit(event, payload); // Guarantee delivery across dev connections
  }
}

function emitToElderly(event, payload) {
  if (io) {
    io.to('room:elderly').emit(event, payload);
    io.emit(event, payload);
  }
}

function emitToAll(event, payload) {
  if (io) {
    io.emit(event, payload);
  }
}

module.exports = {
  initSocketServer,
  getIO,
  emitToCaregiver,
  emitToElderly,
  emitToAll
};
