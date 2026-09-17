const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./db');
const seedData = require('./seed');
const { initWebSocketServer } = require('./websocket');
const { initSocketServer } = require('./socket');

// Import routes
const profileRoutes = require('./routes/profile');
const familyRoutes = require('./routes/family');
const routinesRoutes = require('./routes/routines');
const remindersRoutes = require('./routes/reminders');
const sessionsRoutes = require('./routes/sessions');
const metricsRoutes = require('./routes/metrics');
const systemRoutes = require('./routes/system');
const aiProxyRoutes = require('./routes/aiProxy');
const memoriesRoutes = require('./routes/memories');
const vrRoutes = require('./routes/vr');
const caregiverRoutes = require('./routes/caregiver');
const gamesRoutes = require('./routes/games');
const assessmentRoutes = require('./routes/assessment');

const app = express();
const server = http.createServer(app);
const PRIMARY_PORT = parseInt(process.env.PORT, 10) || 5050;
const FALLBACK_PORT = 5055;

// Initialize WebSocket server and Socket.IO server attached to HTTP server
initWebSocketServer(server);
const io = initSocketServer(server);
app.set('io', io);

// Enable CORS for frontend applications and mobile devices on local Wi-Fi
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Smriti Setu Backend API',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/profile', profileRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/routines', routinesRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ai', aiProxyRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/vr', vrRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/assessment', assessmentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

function attemptListen(port) {
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve({ server, port });
    });
    server.once('error', (err) => {
      reject(err);
    });
  });
}

// Start server with port fallback if AirPlay or system occupies port 5000
async function startServer() {
  try {
    await connectDB();
    await seedData();

    let runningPort = PRIMARY_PORT;
    try {
      await attemptListen(PRIMARY_PORT);
      runningPort = PRIMARY_PORT;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Port Notice] Port ${PRIMARY_PORT} is in use (e.g. macOS AirPlay). Binding to fallback port ${FALLBACK_PORT}...`);
        await attemptListen(FALLBACK_PORT);
        runningPort = FALLBACK_PORT;
      } else {
        throw err;
      }
    }

    console.log(`====================================================`);
    console.log(`🌿 SMRITI SETU (স্মৃতি সেতু) BACKEND RUNNING`);
    console.log(`📡 Local:   http://localhost:${runningPort}`);
    console.log(`📡 Network: http://0.0.0.0:${runningPort}`);
    console.log(`====================================================`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
