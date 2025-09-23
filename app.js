const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { handleOfflineSync, addSyncMetadata } = require('./middleware/offlineSyncMiddleware');
const pushService = require('./services/pushService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const reliefRoutes = require('./routes/reliefRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

const app = express();
const server = http.createServer(app);

// WebSocket server for real-time notifications
const wss = new WebSocket.Server({ server, path: '/ws' });

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'auth' && data.userId) {
        // Register user connection for push notifications
        pushService.registerConnection(data.userId, ws);
        
        ws.send(JSON.stringify({
          type: 'auth_success',
          message: 'Connection registered for notifications'
        }));
      }
      
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  skip: (req) => {
    // Skip rate limiting for emergency endpoints
    return req.path.includes('/emergency/');
  }
});
app.use('/api', limiter);

// Offline sync middleware
app.use('/api', handleOfflineSync);
app.use('/api', addSyncMetadata);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/centers', reliefRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check with connectivity status
app.get('/api/health', async (req, res) => {
  const syncService = require('./services/syncService');
  const isOnline = await syncService.checkConnectivity();
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      connectivity: isOnline ? 'online' : 'offline',
      websocket: wss.clients.size + ' connections'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = { app, server, wss };