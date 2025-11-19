import dotenv from 'dotenv';

// Load environment variables FIRST before importing any services
dotenv.config();

// Debug: Check if env vars are loaded
console.log('🔍 Debug - AI_PROVIDER:', process.env.AI_PROVIDER);
console.log('🔍 Debug - REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN ? 'SET' : 'NOT SET');

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import AIConversionService from './services/AIConversionService.js';

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    aiProvider: AIConversionService.getProviderInfo(),
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join room
  socket.on('join-room', (data: { room: string; type: 'pad' | 'display' }) => {
    const { room, type } = data;
    socket.join(room);
    console.log(`📱 ${type} joined room: ${room} (${socket.id})`);

    socket.emit('joined-room', { room });
  });

  // Handle new drawing from drawing pad
  socket.on('new-drawing', async (data: { image: string; room: string; timestamp: number }) => {
    const { image, room, timestamp } = data;
    console.log(`🎨 New drawing received in room: ${room}`);

    try {
      // Send acknowledgment to drawing pad
      socket.emit('drawing-sent', { success: true });

      // Notify display that drawing is being processed
      const drawingId = `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      io.to(room).emit('drawing-received', {
        id: drawingId,
        original: image,
        status: 'processing',
        timestamp,
      });

      // Convert base64 to buffer
      const base64Data = image.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Convert to anime using configured AI provider
      const animeBuffer = await AIConversionService.convertToAnime(imageBuffer);

      // Convert back to base64
      const animeImage = `data:image/png;base64,${animeBuffer.toString('base64')}`;

      // Send converted image to display
      io.to(room).emit('anime-ready', {
        id: drawingId,
        anime: animeImage,
        status: 'complete',
        provider: AIConversionService.getProviderInfo(),
        timestamp,
      });

      console.log(`✅ Drawing converted and sent: ${drawingId}`);
    } catch (error) {
      console.error('❌ Error processing drawing:', error);

      socket.emit('drawing-sent', { success: false, error: 'Conversion failed' });
      io.to(room).emit('conversion-failed', {
        error: 'Failed to convert drawing',
        timestamp,
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎨 Draw-and-Share Server                                ║
║                                                            ║
║   Server running on: http://localhost:${PORT}                ║
║   AI Provider: ${AIConversionService.getProviderInfo().name.padEnd(42)} ║
║                                                            ║
║   Ready to accept connections! 🚀                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

