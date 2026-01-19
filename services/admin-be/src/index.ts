import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'http';
dotenv.config();
import prisma from './config/database';
import { initializeWebSocketServer, closeWebSocketServer } from './websocket/server';
import { initCentralWebSocket, getCentralWSClient } from './websocket/central-client';
import { generalLimiter, authLimiter, sanitizeInput, securityLogger } from './middleware/security.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Security: HTTP security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Security: CORS with specific origins
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3006',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3006',
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',') || defaultOrigins).map(o => o.trim());
const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = allowedOrigins
      .map(normalizeOrigin)
      .includes(normalizedOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security: Rate limiting
app.use(generalLimiter);

// Security: Request body size limit (prevent DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security: Input sanitization and logging
app.use(sanitizeInput);
app.use(securityLogger);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TrackMed Backend API',
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    service: 'TrackMed Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      batch: '/api/batch',
      scan: '/api/scan',
      fraud: '/api/fraud',
      manufacturer: '/api/manufacturer',
      medicine: '/api/medicine',
      qrCode: '/api/qr-code',
      lifecycle: '/api/lifecycle',
      distributor: '/api/distributor',
      pharmacy: '/api/pharmacy',
      analytics: '/api/analytics',
      user: '/api/user',
      batchSearch: '/api/batch-search',
      inventory: '/api/inventory',
      auditTrail: '/api/audit-trail',
      shipment: '/api/shipment',
      report: '/api/report',
    },
  });
});

import authRoutes from './routes/auth.routes';
import batchRoutes from './routes/batch.routes';
import scanRoutes from './routes/scan.routes';
import fraudRoutes from './routes/fraud.routes';
import manufacturerRoutes from './routes/manufacturer.routes';
import medicineRoutes from './routes/medicine.routes';
import qrCodeRoutes from './routes/qr-code.routes';
import lifecycleRoutes from './routes/lifecycle.routes';
import distributorRoutes from './routes/distributor.routes';
import pharmacyRoutes from './routes/pharmacy.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';
import batchSearchRoutes from './routes/batch-search.routes';
import inventoryRoutes from './routes/inventory.routes';
import auditTrailRoutes from './routes/audit-trail.routes';
import shipmentRoutes from './routes/shipment.routes';
import reportRoutes from './routes/report.routes';
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';

app.use('/api/auth', authRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/qr-code', qrCodeRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/batch-search', batchSearchRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit-trail', auditTrailRoutes);
app.use('/api/shipment', shipmentRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected');

    const httpServer = app.listen(PORT, async () => {
      console.log(`TrackMed Backend API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoints: http://localhost:${PORT}/api`);
      console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
      console.log(`Solana RPC: ${process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899'} (localnet)`);
      console.log(`Program ID: 48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ`);

      // Initialize connection to central WebSocket server
      try {
        await initCentralWebSocket();
        console.log('[Central WS] Connected to WebSocket server');
      } catch (error) {
        console.error('[Central WS] Failed to connect:', error);
        // Server continues running, WS will auto-reconnect
      }
    });

    initializeWebSocketServer(httpServer);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  closeWebSocketServer();
  const centralWS = getCentralWSClient();
  if (centralWS) centralWS.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  closeWebSocketServer();
  const centralWS = getCentralWSClient();
  if (centralWS) centralWS.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
