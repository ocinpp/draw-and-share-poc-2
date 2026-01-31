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
app.get('/health', (_req, res) => {
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
    const conversionMode = AIConversionService.getConversionMode();
    console.log(`🎨 New drawing received in room: ${room} (mode: ${conversionMode})`);

    try {
      // Send acknowledgment to drawing pad
      socket.emit('drawing-sent', { success: true });

      // Generate unique drawing ID
      const drawingId = `drawing-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Convert base64 to buffer
      const base64Data = image.split(',')[1];
      console.log(`📦 Incoming image - prefix: ${image.substring(0, 30)}, base64 length: ${base64Data?.length || 0}`);
      const imageBuffer = Buffer.from(base64Data, 'base64');
      console.log(`📦 Image buffer size: ${imageBuffer.length} bytes`);

      // Handle based on conversion mode
      if (conversionMode === 'video-only') {
        // VIDEO-ONLY MODE: Show original sketch, then convert directly to video
        console.log(`🎬 Video-only mode: Showing original and generating video...`);

        // Send original drawing immediately to display
        io.to(room).emit('drawing-ready', {
          id: drawingId,
          image: image, // Original sketch
          isOriginal: true,
          status: 'processing-video',
          timestamp,
        });

        // Generate video from original sketch
        if (AIConversionService.isAnimationAvailable()) {
          io.to(room).emit('animation-processing', {
            id: drawingId,
            status: 'animating',
          });

          try {
            const videoUrl = await AIConversionService.animateImage(imageBuffer);

            io.to(room).emit('video-ready', {
              id: drawingId,
              video: videoUrl,
              status: 'complete',
              provider: AIConversionService.getVideoProviderInfo(),
              timestamp,
            });

            console.log(`✅ Video animation complete: ${drawingId}`);
          } catch (animationError) {
            console.error('❌ Animation error:', animationError);
            io.to(room).emit('animation-failed', {
              id: drawingId,
              error: 'Failed to animate drawing',
              timestamp,
            });
          }
        } else {
          console.warn('⚠️ Animation not available - video-only mode requires Replicate provider');
        }

      } else if (conversionMode === 'anime') {
        // ANIME MODE: Convert sketch to anime image only (no video)
        console.log(`🎨 Anime mode: Converting sketch to anime...`);

        io.to(room).emit('drawing-received', {
          id: drawingId,
          original: image,
          status: 'processing',
          timestamp,
        });

        const animeBuffer = await AIConversionService.convertToAnime(imageBuffer);
        const animeImage = `data:image/png;base64,${animeBuffer.toString('base64')}`;

        io.to(room).emit('anime-ready', {
          id: drawingId,
          anime: animeImage,
          status: 'complete',
          provider: AIConversionService.getProviderInfo(),
          timestamp,
        });

        console.log(`✅ Anime conversion complete: ${drawingId}`);

      } else if (conversionMode === 'both') {
        // BOTH MODE: Convert to anime first, then animate to video
        console.log(`🎨 Both mode: Converting to anime, then video...`);

        io.to(room).emit('drawing-received', {
          id: drawingId,
          original: image,
          status: 'processing',
          timestamp,
        });

        // First: Convert to anime
        const animeBuffer = await AIConversionService.convertToAnime(imageBuffer);
        const animeImage = `data:image/png;base64,${animeBuffer.toString('base64')}`;

        io.to(room).emit('anime-ready', {
          id: drawingId,
          anime: animeImage,
          status: 'complete',
          provider: AIConversionService.getProviderInfo(),
          timestamp,
        });

        console.log(`✅ Anime conversion complete: ${drawingId}`);

        // Second: Generate video from anime image
        if (AIConversionService.isAnimationAvailable()) {
          console.log(`🎬 Starting video animation for: ${drawingId}`);

          io.to(room).emit('animation-processing', {
            id: drawingId,
            status: 'animating',
          });

          try {
            const videoUrl = await AIConversionService.animateImage(animeBuffer);

            io.to(room).emit('video-ready', {
              id: drawingId,
              video: videoUrl,
              status: 'complete',
              provider: AIConversionService.getVideoProviderInfo(),
              timestamp,
            });

            console.log(`✅ Video animation complete: ${drawingId}`);
          } catch (animationError) {
            console.error('❌ Animation error:', animationError);
            io.to(room).emit('animation-failed', {
              id: drawingId,
              error: 'Failed to animate drawing',
              timestamp,
            });
          }
        }
      }

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

