# Draw-and-Share: Anime Conversion Installation

## Detailed Technical Proposal

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technical Stack](#3-technical-stack)
4. [Component Details](#4-component-details)
5. [Data Flow](#5-data-flow)
6. [AI Conversion Strategy](#6-ai-conversion-strategy)
7. [Content Moderation & Safety](#7-content-moderation--safety)
8. [Animation System](#8-animation-system)
9. [Drawing Lifecycle Management](#9-drawing-lifecycle-management)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Cost Analysis](#11-cost-analysis)
12. [Development Phases](#12-development-phases)
13. [Technical Challenges & Solutions](#13-technical-challenges--solutions)
14. [Performance Considerations](#14-performance-considerations)

---

## 1. Project Overview

### Concept

An interactive installation where multiple users can:

1. Draw sketches on their mobile/tablet devices
2. Send drawings via swipe-up gesture
3. Watch their drawings transform into anime-style art on a large display
4. See anime objects animate and move around the screen

### Use Cases

- Art installations in galleries/museums
- Interactive exhibits at events
- Collaborative creative spaces
- Educational environments
- Entertainment venues

### Key Features

- ✅ Multi-user simultaneous drawing
- ✅ Touch-optimized interface (iPad/mobile)
- ✅ Real-time synchronization
- ✅ AI-powered anime style conversion
- ✅ Animated moving objects on display
- ✅ Smart duration management (30-90s per drawing)
- ✅ Room/session management
- ✅ No installation required (web-based)

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USERS (Mobile/Tablet)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Drawing  │  │ Drawing  │  │ Drawing  │  │ Drawing  │   │
│  │ Pad #1   │  │ Pad #2   │  │ Pad #3   │  │ Pad #N   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │ WebSocket
        ┌─────────────▼─────────────────────────┐
        │      BACKEND SERVER (Node.js)         │
        │  ┌─────────────────────────────────┐  │
        │  │   WebSocket Server (Socket.io)  │  │
        │  └─────────────────────────────────┘  │
        │  ┌─────────────────────────────────┐  │
        │  │   Session/Room Management       │  │
        │  └─────────────────────────────────┘  │
        │  ┌─────────────────────────────────┐  │
        │  │   AI Conversion Queue           │  │
        │  └─────────────────────────────────┘  │
        └───────────┬───────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │   AI Service          │
        │   (Replicate API)     │
        │   - ControlNet        │
        │   - Anime Models      │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────────────────────┐
        │    DISPLAY SCREEN (Large Monitor)     │
        │  ┌─────────────────────────────────┐  │
        │  │   Vue 3 Display App             │  │
        │  │   - Receive anime drawings      │  │
        │  │   - Animate objects (GSAP)      │  │
        │  │   - Manage screen layout        │  │
        │  │   - Duration management         │  │
        │  └─────────────────────────────────┘  │
        └───────────────────────────────────────┘
```

### Component Breakdown

**3 Main Applications:**

1. **Drawing Pad** (Vue 3 SPA)

   - Mobile/tablet web app
   - Canvas-based drawing
   - Touch gesture detection
   - WebSocket client

2. **Backend Server** (Node.js)

   - WebSocket server
   - Session management
   - AI conversion orchestration
   - Message routing

3. **Display Screen** (Vue 3 SPA)
   - Large screen web app
   - Receives anime drawings
   - Animation engine
   - Layout management
   - Duration-based lifecycle control

---

## 3. Technical Stack

### Frontend (Drawing Pad & Display)

```javascript
{
  "framework": "Vue 3",
  "buildTool": "Vite",
  "language": "TypeScript",
  "stateManagement": "Pinia",
  "styling": "TailwindCSS v4",
  "animation": "GSAP (GreenSock)",
  "websocket": "Socket.io-client",
  "utilities": "VueUse"
}
```

**Why Vue 3?**

- Composition API for clean reactive state
- Excellent performance
- Great TypeScript support
- Built-in transition system
- Smaller bundle size than React

**Why Vite?**

- Lightning-fast HMR (hot module reload)
- Optimized builds
- Native ES modules
- Great DX (developer experience)

**Why GSAP?**

- Industry-standard animation library
- Smooth 60fps animations
- Complex motion paths
- Timeline control
- Physics-based easing

### Backend

```javascript
{
  "runtime": "Node.js 20+",
  "framework": "Express",
  "websocket": "Socket.io",
  "language": "TypeScript",
  "aiClient": "Replicate SDK",
  "validation": "Zod",
  "logging": "Winston"
}
```

**Why Socket.io?**

- Reliable WebSocket with fallbacks
- Room/namespace support
- Automatic reconnection
- Event-based architecture
- Broadcasting capabilities

### AI Service

```javascript
{
  "provider": "Replicate",
  "model": "ControlNet Scribble",
  "alternative": "Stable Diffusion XL",
  "fallback": "TensorFlow.js (client-side)"
}
```

---

## 4. Component Details

### 4.1 Drawing Pad Application

#### File Structure

```
apps/drawing-pad/
├── src/
│   ├── components/
│   │   ├── DrawingCanvas.vue      # Main canvas component
│   │   ├── ColorPicker.vue        # Touch-friendly color selector
│   │   ├── ToolBar.vue            # Drawing tools (size, clear, undo)
│   │   ├── SwipeIndicator.vue     # Visual hint for swipe gesture
│   │   └── ConnectionStatus.vue   # WebSocket status
│   ├── composables/
│   │   ├── useCanvas.ts           # Canvas drawing logic
│   │   ├── useGestures.ts         # Touch/swipe detection
│   │   ├── useWebSocket.ts        # Socket.io connection
│   │   └── useDrawingState.ts     # Drawing state management
│   ├── stores/
│   │   └── drawingStore.ts        # Pinia store
│   ├── utils/
│   │   ├── canvasHelpers.ts       # Canvas utilities
│   │   └── imageCompression.ts    # Optimize before sending
│   ├── App.vue
│   └── main.ts
├── public/
│   └── manifest.json              # PWA manifest
├── index.html
├── vite.config.ts
└── package.json
```

#### Key Features

**A) Canvas Drawing System**

```typescript
// useCanvas.ts composable
export function useCanvas() {
  const canvas = ref<HTMLCanvasElement | null>(null);
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  const isDrawing = ref(false);
  const currentPath = ref<Point[]>([]);

  // Pointer events (unified touch/mouse/stylus)
  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault(); // Prevent scrolling
    isDrawing.value = true;
    const point = getCanvasPoint(e);
    currentPath.value = [point];
    ctx.value?.beginPath();
    ctx.value?.moveTo(point.x, point.y);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDrawing.value) return;
    const point = getCanvasPoint(e);
    currentPath.value.push(point);

    // Smooth line drawing
    ctx.value?.lineTo(point.x, point.y);
    ctx.value?.stroke();
  };

  const handlePointerUp = (e: PointerEvent) => {
    isDrawing.value = false;
    currentPath.value = [];
  };

  return {
    canvas,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
```

**B) Gesture Detection**

```typescript
// useGestures.ts
export function useGestures(onSwipeUp: () => void) {
  let startY = 0;
  let startTime = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].clientY;
    startTime = Date.now();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();

    const distance = startY - endY;
    const duration = endTime - startTime;
    const velocity = distance / duration;

    // Swipe up detection
    if (distance > 100 && velocity > 0.5) {
      onSwipeUp();
      // Haptic feedback if supported
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  return { handleTouchStart, handleTouchEnd };
}
```

**C) WebSocket Connection**

```typescript
// useWebSocket.ts
import { io, Socket } from "socket.io-client";

export function useWebSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const roomCode = ref("");

  const connect = (room: string) => {
    socket.value = io("https://your-server.com", {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.value.on("connect", () => {
      connected.value = true;
      socket.value?.emit("join-room", room);
    });

    socket.value.on("disconnect", () => {
      connected.value = false;
    });
  };

  const sendDrawing = async (canvas: HTMLCanvasElement) => {
    // Compress image before sending
    const blob = await canvasToBlob(canvas, 0.8);
    const base64 = await blobToBase64(blob);

    socket.value?.emit("new-drawing", {
      image: base64,
      timestamp: Date.now(),
      room: roomCode.value,
    });
  };

  return { connect, sendDrawing, connected };
}
```

**D) Mobile Optimizations**

```html
<!-- index.html -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-fullscreen" />
```

```css
/* Prevent touch behaviors */
body {
  touch-action: none;
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
}

canvas {
  touch-action: none;
}
```

---

### 4.2 Backend Server

#### File Structure

```
apps/server/
├── src/
│   ├── server.ts                  # Express + Socket.io setup
│   ├── socket/
│   │   ├── handlers.ts            # Socket event handlers
│   │   └── rooms.ts               # Room management
│   ├── services/
│   │   ├── aiService.ts           # Replicate API integration
│   │   └── queueService.ts        # AI conversion queue
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   └── utils/
│       ├── logger.ts              # Winston logger
│       └── validation.ts          # Input validation
├── .env.example
├── tsconfig.json
└── package.json
```

#### Key Features

**A) WebSocket Server**

```typescript
// server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 5e6, // 5MB max image size
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join room
  socket.on("join-room", (roomCode: string) => {
    socket.join(roomCode);
    socket.emit("joined-room", roomCode);
  });

  // Handle new drawing
  socket.on("new-drawing", async (data) => {
    const { image, room } = data;

    // Emit original to display immediately
    io.to(room).emit("drawing-received", {
      id: generateId(),
      original: image,
      status: "processing",
    });

    // Queue for AI conversion
    await queueAIConversion(image, room, socket);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(3000);
```

**B) AI Service Integration**

```typescript
// services/aiService.ts
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function convertToAnime(imageBase64: string) {
  try {
    const output = await replicate.run(
      "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
      {
        input: {
          image: imageBase64,
          prompt:
            "anime style, vibrant colors, clean lines, professional illustration",
          negative_prompt: "blurry, low quality, distorted",
          num_inference_steps: 20,
          guidance_scale: 7.5,
          num_outputs: 1,
        },
      }
    );

    return output[0]; // Returns URL to anime image
  } catch (error) {
    console.error("AI conversion failed:", error);
    throw error;
  }
}
```

**C) Queue Management**

```typescript
// services/queueService.ts
import PQueue from "p-queue";

// Limit concurrent AI requests
const queue = new PQueue({ concurrency: 3 });

export async function queueAIConversion(
  image: string,
  room: string,
  socket: Socket
) {
  const drawingId = generateId();

  queue.add(async () => {
    try {
      // Convert to anime
      const animeImageUrl = await convertToAnime(image);

      // Download and convert to base64
      const animeBase64 = await urlToBase64(animeImageUrl);

      // Emit to display
      io.to(room).emit("anime-ready", {
        id: drawingId,
        anime: animeBase64,
        status: "complete",
      });
    } catch (error) {
      io.to(room).emit("conversion-failed", {
        id: drawingId,
        error: "AI conversion failed",
      });
    }
  });
}
```

**D) Room Management**

```typescript
// socket/rooms.ts
interface Room {
  code: string;
  displayConnected: boolean;
  drawingPads: Set<string>;
  createdAt: Date;
}

const rooms = new Map<string, Room>();

export function createRoom(): string {
  const code = generateRoomCode(); // e.g., "ABC123"
  rooms.set(code, {
    code,
    displayConnected: false,
    drawingPads: new Set(),
    createdAt: new Date(),
  });
  return code;
}

export function joinRoom(
  roomCode: string,
  socketId: string,
  isDisplay: boolean
) {
  const room = rooms.get(roomCode);
  if (!room) throw new Error("Room not found");

  if (isDisplay) {
    room.displayConnected = true;
  } else {
    room.drawingPads.add(socketId);
  }
}
```

---

### 4.3 Display Screen Application

#### File Structure

```
apps/display-screen/
├── src/
│   ├── components/
│   │   ├── AnimatedDrawing.vue    # Single animated drawing
│   │   ├── DrawingCanvas.vue      # Canvas for rendering
│   │   ├── RoomCode.vue           # Display room code
│   │   └── StatusBar.vue          # Connection status
│   ├── composables/
│   │   ├── useWebSocket.ts        # Socket connection
│   │   ├── useAnimations.ts       # GSAP animations
│   │   └── useDrawingManager.ts   # Manage multiple drawings
│   ├── stores/
│   │   └── displayStore.ts        # Pinia store
│   ├── types/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── vite.config.ts
└── package.json
```

---

## 5. Data Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Drawing Creation                                   │
└─────────────────────────────────────────────────────────────┘

User draws on iPad
      ↓
Canvas captures pointer events
      ↓
Drawing stored in canvas element
      ↓
User swipes up
      ↓
Gesture detected
      ↓
Canvas converted to base64 image (compressed)


┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Transmission                                       │
└─────────────────────────────────────────────────────────────┘

WebSocket emit: 'new-drawing'
      ↓
{
  image: "data:image/png;base64,iVBORw0KG...",
  timestamp: 1699999999999,
  room: "ABC123"
}
      ↓
Server receives via Socket.io
      ↓
Validates image size/format


┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Immediate Display                                  │
└─────────────────────────────────────────────────────────────┘

Server broadcasts to display:
'drawing-received' event
      ↓
Display receives original sketch
      ↓
Shows "Converting to anime..." indicator
      ↓
(Optional: Show original sketch faintly)


┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: AI Conversion                                      │
└─────────────────────────────────────────────────────────────┘

Server adds to AI queue
      ↓
Queue processes (max 3 concurrent)
      ↓
Call Replicate API with ControlNet
      ↓
{
  model: "controlnet-scribble",
  input: {
    image: base64,
    prompt: "anime style...",
    steps: 20
  }
}
      ↓
Wait 5-15 seconds
      ↓
Receive anime image URL
      ↓
Download image
      ↓
Convert to base64


┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Anime Display & Lifecycle                          │
└─────────────────────────────────────────────────────────────┘

Server broadcasts: 'anime-ready'
      ↓
{
  id: "drawing-123",
  anime: "data:image/png;base64,...",
  status: "complete"
}
      ↓
Display receives anime image
      ↓
Create AnimatedDrawing object with lifecycle
      ↓
Position at bottom of screen
      ↓
GSAP animation starts:
  - Scale from 0 to 1
  - Slide up from bottom
  - Begin floating/bouncing
      ↓
Drawing moves around screen (30-90 seconds)
      ↓
Lifecycle manager handles removal:
  - After 90 seconds (MAX_LIFETIME), OR
  - When screen reaches 10 drawings (capacity), OR
  - Manual removal
      ↓
Fade out animation (1 second)
      ↓
Remove from DOM
```

### WebSocket Events

**Client → Server:**

```typescript
// Drawing Pad events
'join-room' → { room: string, type: 'pad' }
'new-drawing' → { image: string, room: string, timestamp: number }
'disconnect' → (automatic)

// Display Screen events
'join-room' → { room: string, type: 'display' }
```

**Server → Client:**

```typescript
// To Display Screen
'drawing-received' → { id: string, original: string, status: 'processing' }
'anime-ready' → { id: string, anime: string, status: 'complete' }
'conversion-failed' → { id: string, error: string }

// To Drawing Pad
'joined-room' → { room: string }
'drawing-sent' → { success: boolean }
```

---

## 6. AI Conversion Strategy

### Two Approaches: Local POC vs Cloud API

**For MVP, you can choose:**

| Approach      | Best For                    | Pros                                   | Cons                                    |
| ------------- | --------------------------- | -------------------------------------- | --------------------------------------- |
| **Local POC** | Development, demos, testing | Free, offline, fast setup              | Lower quality, requires local resources |
| **Cloud API** | Production, events, quality | Best quality, scalable, no local setup | Costs money, requires internet          |

---

### Option A: Local POC (Recommended for MVP)

**Perfect for:**

- ✅ Initial development and testing
- ✅ Offline demos and presentations
- ✅ Cost-free prototyping
- ✅ Quick UX validation
- ✅ Learning and experimentation

**Implementation Options:**

#### **1. Simple Image Filters (Fastest POC)**

Use CSS filters and canvas manipulation to create "anime-style" effect:

```typescript
// server/src/services/LocalAIService.ts

import sharp from "sharp";

class LocalAIService {
  /**
   * Simple anime-style filter using image processing
   * Fast, free, works offline
   */
  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    // Apply cartoon/anime-like effects
    const processed = await sharp(imageBuffer)
      // Increase saturation for vibrant colors
      .modulate({
        saturation: 1.5,
        brightness: 1.1,
      })
      // Sharpen edges (anime has clean lines)
      .sharpen({
        sigma: 2,
        m1: 0,
        m2: 3,
      })
      // Posterize to reduce colors (anime-like)
      .normalise()
      .toColorspace("srgb")
      .toBuffer();

    return processed;
  }
}

export default new LocalAIService();
```

**Pros:**

- ⚡ Instant processing (<100ms)
- 💰 Completely free
- 📦 No external dependencies
- 🔌 Works offline

**Cons:**

- ⚠️ Not true AI conversion
- ⚠️ Limited "anime" effect
- ⚠️ Just filters, not transformation

---

#### **2. Anime GAN (Better Quality)**

Use pre-trained AnimeGAN model locally:

```typescript
// server/src/services/AnimeGANService.ts

import * as tf from "@tensorflow/tfjs-node";
import sharp from "sharp";

class AnimeGANService {
  private model: tf.GraphModel | null = null;

  async loadModel() {
    // Load pre-trained AnimeGAN model
    this.model = await tf.loadGraphModel(
      "file://./models/animeganv2/model.json"
    );
    console.log("✅ AnimeGAN model loaded");
  }

  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    if (!this.model) {
      await this.loadModel();
    }

    // Preprocess image
    const image = sharp(imageBuffer);
    const { data, info } = await image
      .resize(512, 512, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert to tensor
    const tensor = tf.tensor3d(new Uint8Array(data), [
      info.height,
      info.width,
      info.channels,
    ]);

    // Normalize to [-1, 1]
    const normalized = tensor.toFloat().div(127.5).sub(1);
    const batched = normalized.expandDims(0);

    // Run inference
    const output = this.model!.predict(batched) as tf.Tensor;

    // Denormalize and convert back
    const denormalized = output.add(1).mul(127.5).clipByValue(0, 255);
    const result = (await denormalized.squeeze().array()) as number[][][];

    // Convert back to buffer
    const outputBuffer = Buffer.from(new Uint8Array(result.flat(2)));

    const finalImage = await sharp(outputBuffer, {
      raw: {
        width: 512,
        height: 512,
        channels: 3,
      },
    })
      .png()
      .toBuffer();

    // Cleanup
    tensor.dispose();
    normalized.dispose();
    batched.dispose();
    output.dispose();
    denormalized.dispose();

    return finalImage;
  }
}

export default new AnimeGANService();
```

**Setup:**

```bash
# Install dependencies
npm install @tensorflow/tfjs-node sharp

# Download AnimeGAN model (choose one style)
mkdir -p models/animeganv2
cd models/animeganv2

# Option 1: Hayao style (Miyazaki-like)
wget https://huggingface.co/spaces/akhaliq/AnimeGANv2/resolve/main/models/Hayao/generator_Hayao_weight.h5

# Option 2: Shinkai style (Makoto Shinkai-like)
wget https://huggingface.co/spaces/akhaliq/AnimeGANv2/resolve/main/models/Shinkai/generator_Shinkai_weight.h5

# Convert to TensorFlow.js format (if needed)
tensorflowjs_converter --input_format=keras \
  generator_Hayao_weight.h5 \
  ./
```

**Pros:**

- ✅ True AI anime conversion
- ✅ Good quality results
- ✅ Free (no API costs)
- ✅ Works offline
- ✅ Fast (~2-3 seconds on CPU, <1s on GPU)

**Cons:**

- ⚠️ Requires model download (~50MB)
- ⚠️ Needs TensorFlow.js setup
- ⚠️ Uses server CPU/GPU resources
- ⚠️ Not as good as cloud models

---

#### **3. Mock/Placeholder (Quickest Start)**

For initial UX testing, just add a border/badge:

```typescript
// server/src/services/MockAIService.ts

import sharp from "sharp";

class MockAIService {
  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    // Add "anime-style" border and badge
    const processed = await sharp(imageBuffer)
      .resize(512, 512, { fit: "contain", background: "#ffffff" })
      .extend({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        background: "#ff69b4",
      })
      .composite([
        {
          input: Buffer.from(
            '<svg width="100" height="30"><text x="10" y="20" font-family="Arial" font-size="16" fill="white">ANIME</text></svg>'
          ),
          top: 10,
          left: 10,
        },
      ])
      .png()
      .toBuffer();

    return processed;
  }
}

export default new MockAIService();
```

**Pros:**

- ⚡ Instant setup
- 💰 Free
- 🎯 Perfect for UX testing

**Cons:**

- ❌ Not real conversion
- ❌ Just for testing

---

### Option B: Cloud API (Production Quality)

**Model:** `jagilley/controlnet-scribble` on Replicate

**Why ControlNet Scribble?**

- ✅ Specifically designed for sketch-to-image conversion
- ✅ Excellent sketch structure preservation
- ✅ Proven reliability (38.3M runs on Replicate)
- ✅ Good cost/performance ratio ($0.005 per image)
- ✅ Fast processing (8-12 seconds)
- ✅ Works well with rough sketches and scribbles

> **📚 See [AI_MODEL_EXAMPLES.md](./AI_MODEL_EXAMPLES.md) for visual examples, live demos, and quality references**

**Replicate Implementation:**

```typescript
// server/src/services/ReplicateAIService.ts

import Replicate from "replicate";

class ReplicateAIService {
  private replicate: Replicate;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  async convertToAnime(imageBuffer: Buffer, prompt?: string): Promise<Buffer> {
    // Convert buffer to base64 data URL
    const base64Image = `data:image/png;base64,${imageBuffer.toString(
      "base64"
    )}`;

    const output = await this.replicate.run(
      "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
      {
        input: {
          image: base64Image,
          prompt:
            prompt ||
            "anime style, vibrant colors, clean lines, professional illustration",
          negative_prompt:
            "nsfw, nude, naked, sexual, explicit, inappropriate, blurry, low quality, distorted, ugly, bad anatomy",
          num_inference_steps: 20,
          guidance_scale: 7.5,
          disable_safety_checker: false,
        },
      }
    );

    // Replicate returns null if NSFW detected
    if (!output) {
      throw new Error("Content filtered by safety checker");
    }

    // Download the result
    const response = await fetch(output[0]);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export default new ReplicateAIService();
```

**Performance:**

- Average processing time: 8-12 seconds
- Cost: ~$0.005 per image
- Success rate: ~95%
- Resolution: 512x512

---

### Configurable Service Layer (Recommended)

**Switch between local and cloud easily:**

```typescript
// server/src/services/AIConversionService.ts

import LocalAIService from "./LocalAIService";
import AnimeGANService from "./AnimeGANService";
import ReplicateAIService from "./ReplicateAIService";
import MockAIService from "./MockAIService";

type AIProvider = "mock" | "local" | "animegan" | "replicate";

class AIConversionService {
  private provider: AIProvider;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || "mock";
    console.log(`🎨 AI Provider: ${this.provider}`);
  }

  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    switch (this.provider) {
      case "mock":
        return MockAIService.convertToAnime(imageBuffer);

      case "local":
        return LocalAIService.convertToAnime(imageBuffer);

      case "animegan":
        return AnimeGANService.convertToAnime(imageBuffer);

      case "replicate":
        return ReplicateAIService.convertToAnime(imageBuffer);

      default:
        throw new Error(`Unknown AI provider: ${this.provider}`);
    }
  }

  getProviderInfo() {
    const info = {
      mock: {
        name: "Mock (Testing)",
        cost: 0,
        speed: "instant",
        quality: "none",
      },
      local: {
        name: "Local Filters",
        cost: 0,
        speed: "<100ms",
        quality: "low",
      },
      animegan: {
        name: "AnimeGAN (Local)",
        cost: 0,
        speed: "2-3s",
        quality: "good",
      },
      replicate: {
        name: "ControlNet (Cloud)",
        cost: 0.005,
        speed: "8-12s",
        quality: "excellent",
      },
    };

    return info[this.provider];
  }
}

export default new AIConversionService();
```

**Environment Configuration:**

```bash
# .env

# AI Provider: mock | local | animegan | replicate
AI_PROVIDER=mock              # Start with mock for MVP
# AI_PROVIDER=animegan        # Upgrade to local AI
# AI_PROVIDER=replicate       # Production quality

# Only needed for Replicate
REPLICATE_API_TOKEN=your_token_here
```

**Usage in Server:**

```typescript
// server/src/routes/drawings.ts

import AIConversionService from "../services/AIConversionService";

socket.on("new-drawing", async (data) => {
  const { image, room } = data;

  // Convert base64 to buffer
  const imageBuffer = Buffer.from(image.split(",")[1], "base64");

  // Convert using configured provider
  const animeBuffer = await AIConversionService.convertToAnime(imageBuffer);

  // Convert back to base64
  const animeImage = `data:image/png;base64,${animeBuffer.toString("base64")}`;

  // Broadcast to display
  io.to(room).emit("anime-ready", {
    id: generateId(),
    anime: animeImage,
    provider: AIConversionService.getProviderInfo(),
  });
});
```

---

### No-Prompt Approach (Recommended)

**User Experience:** Users just draw and send - no text input required!

**Why no prompts?**

- ✅ **Faster workflow** - No typing on mobile
- ✅ **Simpler UX** - Just draw and swipe
- ✅ **More accessible** - No language barrier
- ✅ **Higher throughput** - More drawings per hour
- ✅ **Better for installation** - Minimal friction

**Implementation:** Use pre-configured prompts with optional rotation for variety (only applies to Replicate provider)

### Prompt Strategy

**Option A: Single Default Prompt (MVP)**

```typescript
const DEFAULT_PROMPT =
  "anime style, vibrant colors, clean lines, professional illustration, detailed, high quality, safe for work, family friendly";

const DEFAULT_NEGATIVE_PROMPT =
  "nsfw, nude, naked, sexual, explicit, inappropriate, adult content, revealing clothing, suggestive, blurry, low quality, distorted, ugly, bad anatomy, bad hands, longbody, lowres, worst quality";
```

**Option B: Random Prompt Rotation (Recommended)**

```typescript
const ANIME_PROMPTS = [
  {
    name: "classic",
    prompt:
      "anime style, vibrant colors, clean lines, professional illustration, detailed",
    weight: 35, // 35% chance
  },
  {
    name: "pastel",
    prompt:
      "anime style, pastel colors, soft lighting, gentle atmosphere, watercolor",
    weight: 15,
  },
  {
    name: "dynamic",
    prompt:
      "anime style, dynamic, energetic, vibrant colors, action pose, detailed",
    weight: 15,
  },
  {
    name: "kawaii",
    prompt: "anime style, cute, kawaii, colorful, cheerful, adorable",
    weight: 15,
  },
  {
    name: "professional",
    prompt:
      "anime style, highly detailed, professional illustration, vibrant, masterpiece",
    weight: 10,
  },
  {
    name: "chibi",
    prompt: "anime style, chibi, super deformed, cute, colorful, simple",
    weight: 10,
  },
];

function getRandomPrompt() {
  const totalWeight = ANIME_PROMPTS.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prompt of ANIME_PROMPTS) {
    random -= prompt.weight;
    if (random <= 0) {
      return prompt;
    }
  }

  return ANIME_PROMPTS[0];
}
```

**Benefits of rotation:**

- ✅ Visual variety keeps display interesting
- ✅ Different styles for different drawings
- ✅ Surprise element for users
- ✅ Configurable weights for preferred styles

### AI Conversion Configuration (Replicate only)

```typescript
{
  prompt: getRandomPrompt().prompt,  // Or DEFAULT_PROMPT for single mode
  negative_prompt: DEFAULT_NEGATIVE_PROMPT,
  num_inference_steps: 20,      // Balance speed/quality
  guidance_scale: 7.5,           // How closely to follow prompt
  controlnet_conditioning_scale: 1.0,
  num_outputs: 1,
  disable_safety_checker: false  // Keep safety checker enabled!
}
```

---

### Comparison: Local vs Cloud

| Feature         | Mock       | Local Filters       | AnimeGAN               | Replicate    |
| --------------- | ---------- | ------------------- | ---------------------- | ------------ |
| **Quality**     | None       | Low                 | Good                   | Excellent    |
| **Speed**       | Instant    | <100ms              | 2-3s                   | 8-12s        |
| **Cost**        | Free       | Free                | Free                   | $0.005/image |
| **Setup**       | None       | `npm install sharp` | Download model (~50MB) | API key      |
| **Internet**    | ❌ No      | ❌ No               | ❌ No                  | ✅ Yes       |
| **Server Load** | None       | Minimal             | Medium                 | None         |
| **Best For**    | UX testing | Quick demos         | Development            | Production   |

---

### Recommended Development Path

**Phase 1: MVP (Week 1)**

```bash
AI_PROVIDER=mock
```

- ✅ Test UX flow
- ✅ Validate drawing/display interaction
- ✅ No setup required
- ✅ Instant feedback

**Phase 2: Local Testing (Week 2)**

```bash
AI_PROVIDER=local
# or
AI_PROVIDER=animegan
```

- ✅ See actual image transformation
- ✅ Test with realistic processing time
- ✅ Still free
- ✅ Works offline

**Phase 3: Production (Week 3+)**

```bash
AI_PROVIDER=replicate
REPLICATE_API_TOKEN=your_token
```

- ✅ Best quality for demos/events
- ✅ Scalable
- ✅ Professional results
- ✅ Easy to switch back to local if needed

---

### Migration Strategy

**Easy switching between providers:**

```typescript
// No code changes needed - just update .env!

// Development
AI_PROVIDER = mock;

// Testing
AI_PROVIDER = animegan;

// Demo/Event
AI_PROVIDER = replicate;

// Cost-saving mode
AI_PROVIDER = local;
```

**All providers use the same interface:**

```typescript
const result = await AIConversionService.convertToAnime(imageBuffer);
// Works with any provider!
```

### Alternative Models

> **📚 See [AI_MODEL_ALTERNATIVES.md](./AI_MODEL_ALTERNATIVES.md) for detailed comparison of 6+ alternative models**

**Quick Alternatives:**

**Option 1: SDXL + ControlNet** (Better Quality)

```typescript
model: "stability-ai/sdxl";
// Higher resolution (1024x1024)
// Better quality, slightly slower
// 10-15 seconds, $0.007 per image
```

**Option 2: FLUX.1 Dev + ControlNet** (Best Quality)

```typescript
model: "black-forest-labs/flux-dev";
// State-of-the-art quality
// 12B parameters
// 15-25 seconds, $0.015 per image
```

**Option 3: Proteus V0.3** (Anime Specialist)

```typescript
model: "datacte/proteus-v0.3";
// Optimized for anime style
// SDXL-based (1024x1024)
// 10-15 seconds, $0.007 per image
```

### Model Selection Strategy

**For MVP:** Use ControlNet Scribble

- Best sketch accuracy
- Proven reliability
- Lowest cost
- Fast enough for real-time feel

**For Premium/Events:** Upgrade to FLUX or SDXL

- Better visual quality
- Higher resolution
- More impressive results
- Worth the extra cost for special occasions

**Implementation:**

```typescript
// Configurable model selection
const AI_CONFIG = {
  model: process.env.AI_MODEL || "controlnet-scribble",
  models: {
    "controlnet-scribble": {
      id: "jagilley/controlnet-scribble",
      cost: 0.005,
      speed: 10,
      quality: "good",
    },
    sdxl: {
      id: "stability-ai/sdxl",
      cost: 0.007,
      speed: 12,
      quality: "better",
    },
    "flux-dev": {
      id: "black-forest-labs/flux-dev",
      cost: 0.015,
      speed: 20,
      quality: "best",
    },
  },
};
```

---

## 7. Content Moderation & Safety

### Overview

**Critical for public installations:** Prevent NSFW/inappropriate content from appearing on display.

**Multi-layer defense strategy:**

1. ✅ **Prompt engineering** - Discourage NSFW in prompts
2. ✅ **Replicate safety checker** - Built-in NSFW detection (free)
3. ✅ **Output moderation** - Third-party NSFW detection
4. ✅ **Optional input moderation** - Check user sketches (extra safety)

### Layer 1: Prompt Engineering

**Safe prompts with NSFW prevention:**

```typescript
const DEFAULT_PROMPT =
  "anime style, vibrant colors, clean lines, professional illustration, detailed, high quality, safe for work, family friendly, appropriate, wholesome";

const DEFAULT_NEGATIVE_PROMPT =
  "nsfw, nude, naked, sexual, explicit, inappropriate, adult content, revealing clothing, suggestive, underwear, swimsuit, cleavage, provocative, blurry, low quality, distorted, ugly, bad anatomy, bad hands, longbody, lowres, worst quality";
```

**Effectiveness:** 🟡 Moderate - Helps reduce NSFW outputs but not foolproof

### Layer 2: Replicate Safety Checker

**Built-in NSFW detection (free):**

```typescript
async function convertToAnime(sketchImage: string) {
  const output = await replicate.run("jagilley/controlnet-scribble", {
    input: {
      image: sketchImage,
      prompt: DEFAULT_PROMPT,
      negative_prompt: DEFAULT_NEGATIVE_PROMPT,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      disable_safety_checker: false, // Keep enabled!
    },
  });

  // Replicate returns null if NSFW detected
  if (!output) {
    throw new Error("Content filtered by safety checker");
  }

  return output;
}
```

**How it works:**

- Replicate runs NSFW detection on AI output
- Returns `null` if NSFW content detected
- Free and automatic
- Based on industry-standard models

**Effectiveness:** 🟢 Good - Catches most NSFW AI outputs

### Layer 3: Third-Party NSFW Detection (Recommended)

**Sightengine API for output verification:**

```typescript
// server/src/services/ContentModerationService.ts

import axios from "axios";

interface ModerationResult {
  safe: boolean;
  reason?: string;
  confidence?: number;
  scores?: any;
}

class ContentModerationService {
  /**
   * Check image for NSFW content using Sightengine
   */
  async checkNSFW(imageUrl: string): Promise<ModerationResult> {
    try {
      const response = await axios.get(
        "https://api.sightengine.com/1.0/check.json",
        {
          params: {
            url: imageUrl,
            models: "nudity-2.0,offensive",
            api_user: process.env.SIGHTENGINE_USER,
            api_secret: process.env.SIGHTENGINE_SECRET,
          },
        }
      );

      const data = response.data;

      // Check various NSFW categories
      const nudityScore = Math.max(
        data.nudity.sexual_activity || 0,
        data.nudity.sexual_display || 0,
        data.nudity.erotica || 0
      );

      const offensiveScore = data.offensive?.prob || 0;

      const threshold = 0.5;
      const isNSFW = nudityScore > threshold || offensiveScore > threshold;

      return {
        safe: !isNSFW,
        reason: isNSFW
          ? nudityScore > threshold
            ? "nudity"
            : "offensive"
          : undefined,
        confidence: Math.max(nudityScore, offensiveScore),
        scores: {
          nudity: nudityScore,
          offensive: offensiveScore,
        },
      };
    } catch (error) {
      console.error("Moderation check failed:", error);
      // Fail-safe: if moderation fails, reject to be safe
      return {
        safe: false,
        reason: "moderation_error",
        confidence: 1.0,
      };
    }
  }
}

export default new ContentModerationService();
```

**Sightengine Features:**

- Industry-standard NSFW detection
- Multiple detection models (nudity, offensive, etc.)
- Detailed confidence scores
- Free tier: 2,000 checks/month
- Paid: $0.0005 per check

**Effectiveness:** 🟢 Excellent - Industry-leading accuracy

### Layer 4: Input Sketch Moderation (Optional)

**Check user drawings before AI conversion:**

```typescript
async function handleDrawingSubmit(imageData: string) {
  // Optional: Check input sketch (for extra safety)
  if (process.env.ENABLE_INPUT_MODERATION === "true") {
    const inputCheck = await moderationService.checkNSFW(imageData);

    if (!inputCheck.safe) {
      socket.emit("drawing:rejected", {
        reason: "inappropriate_content",
        message: "Drawing contains inappropriate content",
      });
      return;
    }
  }

  // Continue with AI conversion...
}
```

**When to use:**

- Schools and educational environments
- Family-friendly events
- Extra-cautious installations
- High-profile public spaces

**Effectiveness:** 🟢 Good - Catches explicit sketches before processing

### Complete Moderation Flow

```typescript
// server/src/services/AIConversionService.ts

import moderationService from "./ContentModerationService";
import replicate from "./ReplicateService";

async function processDrawing(imageData: string, socket: Socket) {
  try {
    // Step 1: Optional input moderation
    if (process.env.ENABLE_INPUT_MODERATION === "true") {
      const inputCheck = await moderationService.checkNSFW(imageData);

      if (!inputCheck.safe) {
        socket.emit("drawing:rejected", {
          reason: "input_filtered",
          message: "Please try drawing something else!",
        });

        // Log for admin review
        logModerationEvent("input_rejected", inputCheck);
        return null;
      }
    }

    // Step 2: AI conversion with safety checker
    let animeImage;
    try {
      animeImage = await replicate.convertToAnime(imageData, {
        prompt: getRandomPrompt().prompt,
        negative_prompt: DEFAULT_NEGATIVE_PROMPT,
        disable_safety_checker: false, // Keep enabled
      });
    } catch (error) {
      if (error.message.includes("safety checker")) {
        socket.emit("drawing:rejected", {
          reason: "ai_safety_filter",
          message: "Please try drawing something else!",
        });

        logModerationEvent("ai_safety_rejected", { error: error.message });
        return null;
      }
      throw error;
    }

    // Step 3: Output moderation (recommended)
    if (process.env.ENABLE_OUTPUT_MODERATION === "true") {
      const outputCheck = await moderationService.checkNSFW(animeImage);

      if (!outputCheck.safe) {
        socket.emit("drawing:rejected", {
          reason: "output_filtered",
          message: "Please try drawing something else!",
        });

        logModerationEvent("output_rejected", outputCheck);
        return null;
      }
    }

    // Step 4: All clear - broadcast to display!
    return animeImage;
  } catch (error) {
    console.error("Drawing processing failed:", error);
    socket.emit("drawing:error", {
      message: "Something went wrong. Please try again!",
    });
    return null;
  }
}
```

### Configuration

**Environment Variables:**

```bash
# Content Moderation
ENABLE_INPUT_MODERATION=false      # Check user sketches (optional)
ENABLE_OUTPUT_MODERATION=true      # Check AI outputs (recommended)

# Sightengine API
SIGHTENGINE_USER=your_user_id
SIGHTENGINE_SECRET=your_secret_key

# Moderation thresholds
NSFW_THRESHOLD=0.5                 # 0.0-1.0 (lower = stricter)
OFFENSIVE_THRESHOLD=0.5

# Fallback behavior
MODERATION_FAIL_SAFE=reject        # reject | allow
```

**Recommended Settings:**

| Environment             | Input Check | Output Check | Threshold |
| ----------------------- | ----------- | ------------ | --------- |
| **Public installation** | ❌ No       | ✅ Yes       | 0.5       |
| **School/Family event** | ✅ Yes      | ✅ Yes       | 0.4       |
| **Art gallery**         | ❌ No       | ✅ Yes       | 0.6       |
| **Private event**       | ❌ No       | ⚠️ Optional  | 0.7       |

### User Experience

**When content is rejected:**

```typescript
// drawing-pad/src/components/DrawingCanvas.vue

socket.on("drawing:rejected", (data) => {
  // Generic message - don't reveal specific reason
  showNotification({
    type: "info",
    title: "Drawing Not Accepted",
    message: "Please try drawing something else!",
    icon: "🎨",
    duration: 3000,
  });

  // Log reason for debugging (not shown to user)
  console.log("Rejection reason:", data.reason);

  // Allow user to try again immediately
  enableDrawing();
});
```

**Why generic messages?**

- ✅ Prevents users from gaming the system
- ✅ Maintains positive experience
- ✅ Avoids embarrassment
- ✅ Encourages trying again

### Admin Monitoring

**Moderation dashboard:**

```typescript
// server/src/routes/admin.ts

interface ModerationStats {
  total_submissions: number;
  successful: number;
  rejected_input: number;
  rejected_ai_safety: number;
  rejected_output: number;
  rejection_rate: number;
  common_reasons: { reason: string; count: number }[];
  recent_rejections: ModerationEvent[];
}

app.get("/admin/moderation-stats", authenticateAdmin, (req, res) => {
  const stats = getModerationStats();
  res.json(stats);
});

// Real-time moderation events
io.of("/admin").on("connection", (socket) => {
  socket.on("subscribe:moderation", () => {
    // Send real-time moderation events to admin
    moderationEmitter.on("event", (event) => {
      socket.emit("moderation:event", event);
    });
  });
});
```

**Admin can monitor:**

- ✅ Total submissions vs rejections
- ✅ Rejection rate over time
- ✅ Common rejection reasons
- ✅ Real-time moderation events
- ✅ Flagged content for review

### Cost Analysis

**Per Drawing:**

| Layer                      | Service     | Cost        | When           |
| -------------------------- | ----------- | ----------- | -------------- |
| Prompt engineering         | N/A         | Free        | Always         |
| Replicate safety           | Replicate   | Free        | Always         |
| Input check                | Sightengine | $0.0005     | Optional       |
| Output check               | Sightengine | $0.0005     | Recommended    |
| **Total moderation**       |             | **$0.0005** | **Standard**   |
| **Total with input check** |             | **$0.001**  | **Extra safe** |

**Monthly Cost (1000 drawings):**

| Configuration                  | Moderation Cost | AI Cost | Total     |
| ------------------------------ | --------------- | ------- | --------- |
| **Basic** (AI safety only)     | $0              | $5.00   | **$5.00** |
| **Standard** (+ output check)  | $0.50           | $5.00   | **$5.50** |
| **Extra Safe** (+ input check) | $1.00           | $5.00   | **$6.00** |

**Recommendation:** Use **Standard** configuration ($5.50/month for 1000 drawings)

### Alternative Services

**AWS Rekognition:**

- Cost: $0.001 per image (first 5,000 free/month)
- Excellent accuracy
- Requires AWS account and S3 storage

**Google Cloud Vision:**

- Cost: $1.50 per 1,000 images
- Safe Search detection
- Requires Google Cloud account

**Microsoft Azure Content Moderator:**

- Cost: $1.00 per 1,000 images
- Comprehensive moderation
- Requires Azure account

**Sightengine (Recommended):**

- Cost: $0.50 per 1,000 images
- Free tier: 2,000/month
- No cloud account needed
- Easiest integration

### Testing & Validation

**Test moderation before launch:**

```bash
# Test with known NSFW images
npm run test:moderation

# Test with edge cases
npm run test:moderation:edge-cases

# Validate thresholds
npm run test:moderation:thresholds
```

**Recommended testing:**

1. ✅ Test with obviously inappropriate content (should reject)
2. ✅ Test with borderline content (adjust thresholds)
3. ✅ Test with innocent content (should pass)
4. ✅ Test with abstract/ambiguous sketches
5. ✅ Monitor false positive rate

### Summary

**Recommended Configuration:**

```typescript
const MODERATION_CONFIG = {
  // Layers
  enableInputModeration: false, // Optional for extra safety
  enableAISafetyChecker: true, // Always enabled (free)
  enableOutputModeration: true, // Recommended

  // Service
  service: "sightengine", // Best balance of cost/quality

  // Thresholds
  nsfwThreshold: 0.5, // Adjust based on environment
  offensiveThreshold: 0.5,

  // Behavior
  failSafe: "reject", // Reject on moderation errors

  // Prompts
  useSafePrompts: true, // Include SFW keywords
  useStrongNegativePrompts: true, // Exclude NSFW keywords
};
```

**Expected Results:**

- ✅ 95%+ NSFW content blocked
- ✅ <5% false positive rate
- ✅ Minimal cost impact ($0.50/1000 drawings)
- ✅ Safe for public display
- ✅ Maintains good user experience

---

## 8. Animation System

### Animation Types

**1. Entry Animations**

```typescript
// Slide up from bottom (mimics swipe gesture)
gsap.from(drawing, {
  y: window.innerHeight + 200,
  scale: 0,
  rotation: -180,
  duration: 1.5,
  ease: "back.out(1.7)",
});
```

**2. Continuous Movement**

**A) Floating (Calm, Ambient)**

```typescript
gsap.to(drawing, {
  x: `+=${random(-100, 100)}`,
  y: `+=${random(-50, 50)}`,
  rotation: `+=${random(-15, 15)}`,
  duration: random(4, 6),
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});
```

**B) Bouncing (Playful, Energetic)**

```typescript
// Horizontal movement
gsap.to(drawing, {
  x: targetX,
  duration: 3,
  ease: "power1.inOut",
  onComplete: () => reverseDirection(),
});

// Vertical bounce
gsap.to(drawing, {
  y: groundLevel,
  duration: 0.5,
  ease: "bounce.out",
  repeat: -1,
});
```

**C) Orbital (Organized, Mesmerizing)**

```typescript
gsap.to(drawing, {
  motionPath: {
    path: createCirclePath(centerX, centerY, radius),
    alignOrigin: [0.5, 0.5],
  },
  duration: 10,
  ease: "none",
  repeat: -1,
});
```

**3. Exit Animations**

```typescript
// Fade out and scale down
gsap.to(drawing, {
  opacity: 0,
  scale: 0,
  duration: 1,
  ease: "power2.in",
  onComplete: () => removeDrawing(drawing.id),
});
```

---

## 9. Drawing Lifecycle Management

### Overview

The Drawing Lifecycle Management system ensures optimal display performance, prevents screen clutter, and provides fair visibility for all user drawings using a **Hybrid Duration Strategy**.

### Configuration

```typescript
const LIFECYCLE_CONFIG = {
  MAX_DRAWINGS: 10, // Maximum drawings on screen simultaneously
  MAX_LIFETIME: 90000, // 90 seconds - absolute maximum display time
  MIN_LIFETIME: 30000, // 30 seconds - guaranteed minimum display time
  FADE_OUT_DURATION: 1000, // 1 second fade-out animation
};
```

### Strategy: Hybrid Approach

Combines **capacity-based** and **time-based** removal for optimal results:

1. **Guaranteed Minimum Time**: Every drawing stays for at least 30 seconds
2. **Maximum Lifetime**: No drawing stays longer than 90 seconds
3. **Capacity Management**: When screen reaches 10 drawings, oldest eligible drawing is removed
4. **Fair Rotation**: Ensures everyone gets visibility while keeping content fresh

### Lifecycle States

```
┌─────────────────────────────────────────────────────────────┐
│                    Drawing Lifecycle                         │
└─────────────────────────────────────────────────────────────┘

[Created] → [Entry Animation] → [Active] → [Exit Animation] → [Removed]
              (1.5s)              (30-90s)      (1s)

Timeline:
─────────────────────────────────────────────────────────────
0s          1.5s                30s                    90s
│            │                   │                      │
Entry     Active              Eligible              Force
Start     Start               for Removal           Remove
```

### Behavior Scenarios

**Scenario A: Low Activity (< 10 drawings)**

```
Drawing 1: Appears → Stays 90s → Auto-removed (MAX_LIFETIME)
Drawing 2: Appears → Stays 90s → Auto-removed (MAX_LIFETIME)
Drawing 3: Appears → Stays 90s → Auto-removed (MAX_LIFETIME)

Result: All drawings get full 90 seconds of display time
```

**Scenario B: High Activity (> 10 drawings)**

```
Drawing 1: Appears → Stays 30s → New drawing arrives → Removed (capacity)
Drawing 2: Appears → Stays 35s → New drawing arrives → Removed (capacity)
Drawing 3: Appears → Stays 42s → New drawing arrives → Removed (capacity)

Result: Oldest drawings removed when new ones arrive, but minimum 30s guaranteed
```

**Scenario C: Burst Activity**

```
10 drawings already on screen (all < 30s old)
New drawing arrives
→ System waits until oldest drawing reaches 30s
→ Then removes it to make room

Result: Respects minimum lifetime even during bursts
```

### Implementation

```typescript
// composables/useDrawingManager.ts
import { ref } from "vue";
import gsap from "gsap";

interface TimedDrawing {
  id: string;
  image: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  animation: gsap.core.Tween | null;
  createdAt: number;
  timeoutId: number;
}

const LIFECYCLE_CONFIG = {
  MAX_DRAWINGS: 10,
  MAX_LIFETIME: 90000,
  MIN_LIFETIME: 30000,
  FADE_OUT_DURATION: 1000,
};

export function useDrawingManager() {
  const drawings = ref<TimedDrawing[]>([]);

  const addDrawing = (image: string) => {
    const id = generateId();

    const drawing: TimedDrawing = {
      id,
      image,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 100,
      rotation: 0,
      scale: 0,
      opacity: 1,
      animation: null,
      createdAt: Date.now(),
      timeoutId: 0,
    };

    drawings.value.push(drawing);

    // Start entry + continuous animation
    animateDrawing(drawing);

    // Set maximum lifetime timeout
    drawing.timeoutId = setTimeout(() => {
      removeDrawing(id, "timeout");
    }, LIFECYCLE_CONFIG.MAX_LIFETIME);

    // Check capacity and remove oldest eligible if needed
    if (drawings.value.length > LIFECYCLE_CONFIG.MAX_DRAWINGS) {
      removeOldestEligible();
    }

    console.log(`✅ Drawing ${id} added. Total: ${drawings.value.length}`);
  };

  const removeOldestEligible = () => {
    const now = Date.now();

    // Find drawings that have been on screen for at least MIN_LIFETIME
    const eligible = drawings.value
      .filter((d) => now - d.createdAt >= LIFECYCLE_CONFIG.MIN_LIFETIME)
      .sort((a, b) => a.createdAt - b.createdAt); // Oldest first

    if (eligible.length > 0) {
      const oldest = eligible[0];
      removeDrawing(oldest.id, "capacity");
    } else {
      console.warn("⚠️ Screen full but no eligible drawings to remove yet");
      // Could implement a queue here for pending drawings
    }
  };

  const removeDrawing = (
    id: string,
    reason: "timeout" | "capacity" | "manual"
  ) => {
    const index = drawings.value.findIndex((d) => d.id === id);
    if (index === -1) return;

    const drawing = drawings.value[index];
    const age = Date.now() - drawing.createdAt;

    console.log(
      `🗑️ Removing drawing ${id} (${reason}, age: ${(age / 1000).toFixed(1)}s)`
    );

    // Clear the max lifetime timeout
    clearTimeout(drawing.timeoutId);

    // Fade out animation
    gsap.to(drawing, {
      opacity: 0,
      scale: 0.5,
      y: drawing.y + 100,
      duration: LIFECYCLE_CONFIG.FADE_OUT_DURATION / 1000,
      ease: "power2.in",
      onComplete: () => {
        // Kill movement animation
        drawing.animation?.kill();

        // Remove from array
        const currentIndex = drawings.value.findIndex((d) => d.id === id);
        if (currentIndex !== -1) {
          drawings.value.splice(currentIndex, 1);
        }

        console.log(
          `✅ Drawing ${id} removed. Remaining: ${drawings.value.length}`
        );
      },
    });
  };

  const clearAll = () => {
    drawings.value.forEach((d) => {
      clearTimeout(d.timeoutId);
      d.animation?.kill();
    });
    drawings.value = [];
    console.log("🧹 All drawings cleared");
  };

  const getStats = () => {
    const now = Date.now();
    return {
      total: drawings.value.length,
      ages: drawings.value.map((d) => (now - d.createdAt) / 1000),
      oldest: Math.max(...drawings.value.map((d) => now - d.createdAt)) / 1000,
      newest: Math.min(...drawings.value.map((d) => now - d.createdAt)) / 1000,
    };
  };

  return {
    drawings,
    addDrawing,
    removeDrawing,
    clearAll,
    getStats,
  };
}
```

### Benefits

✅ **Prevents Screen Clutter**

- Maximum 10 drawings on screen at once
- Automatic removal of oldest content

✅ **Fair Visibility**

- Every drawing guaranteed 30 seconds minimum
- No drawing monopolizes screen (90s max)

✅ **Performance Optimization**

- Limited active animations (max 10)
- Smooth 60fps even with continuous activity

✅ **Adapts to Activity Level**

- Low activity: Drawings stay full 90 seconds
- High activity: Efficient rotation while respecting minimums

✅ **Predictable Behavior**

- Clear rules for when drawings appear/disappear
- No sudden removals before minimum time

### Visual Indicators (Optional Enhancement)

```vue
<!-- AnimatedDrawing.vue -->
<template>
  <div class="animated-drawing">
    <img :src="drawing.image" alt="Anime drawing" />

    <!-- Optional: Subtle progress indicator -->
    <div
      v-if="showLifetimeIndicator"
      class="lifetime-bar"
      :style="{ width: `${lifetimeProgress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  drawing: TimedDrawing;
  showLifetimeIndicator?: boolean;
}>();

const elapsed = ref(0);
let interval: number;

const lifetimeProgress = computed(() => {
  return (elapsed.value / LIFECYCLE_CONFIG.MAX_LIFETIME) * 100;
});

onMounted(() => {
  interval = setInterval(() => {
    elapsed.value = Date.now() - props.drawing.createdAt;
  }, 100);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.lifetime-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(to right, #4ade80, #fbbf24, #ef4444);
  transition: width 0.1s linear;
}
</style>
```

### Admin Controls (Optional)

```typescript
// Expose configuration for runtime adjustment
export const lifecycleConfig = reactive({
  MAX_DRAWINGS: 10,
  MAX_LIFETIME: 90000,
  MIN_LIFETIME: 30000,
  FADE_OUT_DURATION: 1000,
});

// Admin can adjust via UI or URL params
// e.g., ?maxDrawings=15&maxLifetime=120
```

---

## 10. Deployment Architecture

### Development Environment

```
Local Machine:
├── Drawing Pad:     http://localhost:5173
├── Display Screen:  http://localhost:5174
└── Server:          http://localhost:3000
```

### Production Deployment

**Option A: Single Server (Simple)**

```
┌─────────────────────────────────────┐
│   VPS (e.g., DigitalOcean Droplet)  │
│                                      │
│   ┌──────────────────────────────┐  │
│   │  Nginx (Reverse Proxy)       │  │
│   └──────────────────────────────┘  │
│              ↓                       │
│   ┌──────────────────────────────┐  │
│   │  Node.js Server (PM2)        │  │
│   │  - WebSocket (port 3000)     │  │
│   │  - Serves static files       │  │
│   └──────────────────────────────┘  │
│              ↓                       │
│   ┌──────────────────────────────┐  │
│   │  Static Files                │  │
│   │  - /pad → Drawing Pad SPA    │  │
│   │  - /display → Display SPA    │  │
│   └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Option B: Distributed (Scalable) - Recommended**

```
┌─────────────────┐      ┌─────────────────┐
│  Vercel/Netlify │      │  Vercel/Netlify │
│  Drawing Pad    │      │  Display Screen │
│  (Static SPA)   │      │  (Static SPA)   │
└────────┬────────┘      └────────┬────────┘
         │                        │
         └────────┬───────────────┘
                  │ WebSocket
         ┌────────▼────────┐
         │   Railway/Fly   │
         │   Node.js       │
         │   WebSocket     │
         │   Server        │
         └─────────────────┘
```

### Recommended Stack

**Frontend Hosting:** Vercel

- Free tier sufficient
- Automatic deployments from Git
- Global CDN
- Great performance

**Backend Hosting:** Railway or Fly.io

- WebSocket support
- Easy deployment
- Auto-scaling
- $5-10/month

**Domain Setup:**

```
pad.draw-and-share.com     → Drawing Pad (Vercel)
display.draw-and-share.com → Display Screen (Vercel)
api.draw-and-share.com     → Backend Server (Railway)
```

### Environment Variables

**Drawing Pad (.env)**

```bash
VITE_WS_URL=wss://api.draw-and-share.com
VITE_APP_NAME=Draw and Share
```

**Display Screen (.env)**

```bash
VITE_WS_URL=wss://api.draw-and-share.com
VITE_MAX_DRAWINGS=10
VITE_MAX_LIFETIME=90000
VITE_MIN_LIFETIME=30000
```

**Server (.env)**

```bash
NODE_ENV=production
PORT=3000
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
ALLOWED_ORIGINS=https://pad.draw-and-share.com,https://display.draw-and-share.com
MAX_IMAGE_SIZE=5242880  # 5MB
AI_QUEUE_CONCURRENCY=3
```

---

## 11. Cost Analysis

### Monthly Costs (Estimated)

**Hosting:**

```
Vercel (Frontend):        $0    (Free tier)
Railway (Backend):        $5    (Hobby plan)
Domain:                   $12/year ≈ $1/month
SSL Certificate:          $0    (Let's Encrypt)
─────────────────────────────
Subtotal:                 $6/month
```

**AI Processing (Replicate):**

```
Cost per image:           $0.005
Usage scenarios:

Light (100 drawings/month):   $0.50
Medium (500 drawings/month):  $2.50
Heavy (2000 drawings/month):  $10.00
Event (5000 drawings/month):  $25.00
```

**Content Moderation (Sightengine):**

```
Cost per check:           $0.0005
Free tier:                2,000 checks/month

Configuration options:
- Basic (AI safety only):     $0 (free, built-in)
- Standard (+ output check):  $0.0005 per drawing
- Extra Safe (+ input check): $0.001 per drawing

Usage scenarios (Standard config):

Light (100 drawings/month):   $0.05  (within free tier)
Medium (500 drawings/month):  $0.25  (within free tier)
Heavy (2000 drawings/month):  $1.00  (within free tier)
Event (5000 drawings/month):  $2.50  ($1.50 after free tier)

Usage scenarios (Extra Safe config):

Light (100 drawings/month):   $0.10  (within free tier)
Medium (500 drawings/month):  $0.50  (within free tier)
Heavy (2000 drawings/month):  $2.00  (within free tier)
Event (5000 drawings/month):  $5.00  ($3.00 after free tier)
```

**Total Monthly Cost:**

| Usage Level         | Hosting | AI     | Moderation (Standard) | Total      |
| ------------------- | ------- | ------ | --------------------- | ---------- |
| **Light** (100/mo)  | $6      | $0.50  | $0 (free tier)        | **$6.50**  |
| **Medium** (500/mo) | $6      | $2.50  | $0 (free tier)        | **$8.50**  |
| **Heavy** (2000/mo) | $6      | $10.00 | $0 (free tier)        | **$16.00** |
| **Event** (5000/mo) | $6      | $25.00 | $1.50                 | **$32.50** |

**With Extra Safe Moderation:**

| Usage Level         | Hosting | AI     | Moderation (Extra Safe) | Total      |
| ------------------- | ------- | ------ | ----------------------- | ---------- |
| **Light** (100/mo)  | $6      | $0.50  | $0 (free tier)          | **$6.50**  |
| **Medium** (500/mo) | $6      | $2.50  | $0 (free tier)          | **$8.50**  |
| **Heavy** (2000/mo) | $6      | $10.00 | $0 (free tier)          | **$16.00** |
| **Event** (5000/mo) | $6      | $25.00 | $3.00                   | **$34.00** |

**Key Insights:**

- ✅ Sightengine free tier (2,000/month) covers most use cases
- ✅ Moderation adds minimal cost even for heavy usage
- ✅ AI conversion is the primary cost driver
- ✅ Hosting costs are fixed and minimal

### Cost Optimization Strategies

**1. Caching**

```typescript
// Cache AI results for similar drawings
const cache = new Map<string, string>();

function getCacheKey(image: string): string {
  return crypto.createHash("md5").update(image).digest("hex");
}

async function convertWithCache(image: string) {
  const key = getCacheKey(image);
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await convertToAnime(image);
  cache.set(key, result);
  return result;
}
```

**2. Rate Limiting**

```typescript
// Limit drawings per user
const userLimits = new Map<string, number>();

function checkRateLimit(userId: string): boolean {
  const count = userLimits.get(userId) || 0;
  if (count >= 10) return false; // Max 10 per hour
  userLimits.set(userId, count + 1);
  return true;
}
```

---

## 12. Development Phases

### Phase 1: MVP (Week 1-2)

**Goal:** Basic working prototype

**Features:**

- ✅ Drawing Pad with canvas
- ✅ Basic touch drawing
- ✅ WebSocket connection
- ✅ Display Screen receives drawings
- ✅ Simple float animation
- ✅ Room codes
- ✅ Basic lifecycle management (max 10 drawings)

**Deliverables:**

- 3 apps running locally
- Basic functionality working
- No AI conversion yet (show original drawings)

---

### Phase 2: AI Integration (Week 3)

**Goal:** Add anime conversion

**Features:**

- ✅ Replicate API integration
- ✅ Queue system
- ✅ Loading states
- ✅ Error handling
- ✅ Show both original and anime versions

**Deliverables:**

- AI conversion working
- Proper error handling
- Queue management

---

### Phase 3: Enhanced Animations & Lifecycle (Week 4)

**Goal:** Make it visually impressive with smart management

**Features:**

- ✅ Multiple animation styles (float, bounce, orbit)
- ✅ Entry/exit animations
- ✅ Complete lifecycle management (30-90s duration)
- ✅ Smooth transitions
- ✅ Performance optimization

**Deliverables:**

- Beautiful animations
- Smooth 60fps performance
- Smart duration management
- Multiple animation modes

---

### Phase 4: Polish & Deploy (Week 5)

**Goal:** Production-ready

**Features:**

- ✅ PWA support
- ✅ Offline handling
- ✅ Better UI/UX
- ✅ Admin panel (optional)
- ✅ Analytics (optional)
- ✅ Lifecycle statistics dashboard

**Deliverables:**

- Deployed to production
- Documentation
- User guide

---

### Phase 5: Advanced Features (Optional)

**Goal:** Extra wow factor

**Features:**

- ⭐ AI object detection (smart animations)
- ⭐ Multi-room support
- ⭐ Drawing gallery/history
- ⭐ Social sharing
- ⭐ Custom animation paths
- ⭐ Sound effects
- ⭐ Collaborative drawing
- ⭐ Configurable lifecycle settings

---

## 13. Technical Challenges & Solutions

### Challenge 1: WebSocket Reliability

**Problem:** Connection drops, reconnection issues

**Solution:**

```typescript
// Automatic reconnection with exponential backoff
const socket = io(url, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

// Heartbeat to detect stale connections
setInterval(() => {
  socket.emit("ping");
}, 30000);

// Queue messages during disconnection
const messageQueue: Message[] = [];

socket.on("disconnect", () => {
  isConnected.value = false;
});

socket.on("connect", () => {
  isConnected.value = true;
  // Flush queue
  messageQueue.forEach((msg) => socket.emit(msg.event, msg.data));
  messageQueue.length = 0;
});
```

---

### Challenge 2: Large Image Transfer

**Problem:** 5MB images slow down WebSocket

**Solution:**

```typescript
// Compress before sending
async function compressImage(canvas: HTMLCanvasElement): Promise<string> {
  // Resize if too large
  const maxDimension = 1024;
  const scale = Math.min(
    1,
    maxDimension / Math.max(canvas.width, canvas.height)
  );

  const resized = document.createElement("canvas");
  resized.width = canvas.width * scale;
  resized.height = canvas.height * scale;

  const ctx = resized.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);

  // Convert to JPEG with quality 0.8
  return resized.toDataURL("image/jpeg", 0.8);
}
```

---

### Challenge 3: AI Processing Time

**Problem:** 10-15 second wait feels long

**Solution:**

```typescript
// Show original immediately, morph to anime
socket.on("drawing-received", ({ id, original }) => {
  // Show original with "processing" indicator
  addDrawing(original, "processing");
});

socket.on("anime-ready", ({ id, anime }) => {
  // Morph from original to anime
  gsap.to(drawingElement, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      updateImage(anime);
      gsap.to(drawingElement, { opacity: 1, duration: 0.3 });
    },
  });
});
```

---

### Challenge 4: Performance with Many Drawings

**Problem:** 20+ animated drawings cause lag

**Solution:**

```typescript
// Lifecycle management limits to 10 drawings max
const MAX_DRAWINGS = 10;

// Use object pooling
class DrawingPool {
  private pool: AnimatedDrawing[] = [];

  acquire(): AnimatedDrawing {
    return this.pool.pop() || createNewDrawing();
  }

  release(drawing: AnimatedDrawing) {
    drawing.animation?.kill();
    this.pool.push(drawing);
  }
}

// Pause off-screen animations
function checkVisibility(drawing: AnimatedDrawing) {
  const bounds = drawing.element.getBoundingClientRect();
  const isVisible = bounds.top < window.innerHeight && bounds.bottom > 0;

  if (isVisible) {
    drawing.animation?.resume();
  } else {
    drawing.animation?.pause();
  }
}
```

---

### Challenge 5: Lifecycle Edge Cases

**Problem:** What happens when 10 drawings arrive within 30 seconds?

**Solution:**

```typescript
// Queue pending drawings when screen is full
const pendingQueue: string[] = [];

const addDrawing = (image: string) => {
  if (drawings.value.length >= MAX_DRAWINGS) {
    const hasEligible = drawings.value.some(
      (d) => Date.now() - d.createdAt >= MIN_LIFETIME
    );

    if (!hasEligible) {
      // All drawings are too new, queue this one
      pendingQueue.push(image);
      console.log(`📥 Drawing queued. Queue size: ${pendingQueue.length}`);
      return;
    }
  }

  // Normal add logic...
};

// Process queue when drawings are removed
const removeDrawing = (id: string, reason: string) => {
  // ... removal logic ...

  // Check if we can add from queue
  if (pendingQueue.length > 0 && drawings.value.length < MAX_DRAWINGS) {
    const nextImage = pendingQueue.shift();
    addDrawing(nextImage!);
  }
};
```

---

## 14. Performance Considerations

### Frontend Optimization

**1. Code Splitting**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "pinia"],
          animation: ["gsap"],
          socket: ["socket.io-client"],
        },
      },
    },
  },
});
```

**2. Lazy Loading**

```typescript
// Only load GSAP plugins when needed
const MotionPathPlugin = () => import("gsap/MotionPathPlugin");

async function enableAdvancedAnimations() {
  const { MotionPathPlugin } = await import("gsap/MotionPathPlugin");
  gsap.registerPlugin(MotionPathPlugin);
}
```

**3. Image Optimization**

```typescript
// Use WebP when supported
function getOptimalFormat(): string {
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "image/webp"
    : "image/jpeg";
}
```

**4. GPU Acceleration**

```css
.animated-drawing {
  will-change: transform;
  transform: translateZ(0); /* Force GPU layer */
}
```

### Backend Optimization

**1. Connection Pooling**

```typescript
// Reuse HTTP connections for Replicate API
import { Agent } from "https";

const agent = new Agent({
  keepAlive: true,
  maxSockets: 10,
});

const replicate = new Replicate({
  auth: token,
  fetch: (url, options) => fetch(url, { ...options, agent }),
});
```

**2. Rate Limiting**

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## Summary

This proposal outlines a complete system for an interactive drawing-to-anime installation with:

✅ **3 Applications:**

- Touch-optimized drawing pad (Vue 3)
- Real-time WebSocket server (Node.js)
- Animated display screen (Vue 3 + GSAP)

✅ **Key Technologies:**

- Vue 3 + Vite + TypeScript
- Socket.io for real-time sync
- Replicate API for AI conversion
- GSAP for smooth animations
- TailwindCSS v4 for styling

✅ **Core Features:**

- Multi-user drawing
- Swipe-to-send gesture
- AI anime conversion
- Animated moving objects
- **Smart lifecycle management (30-90s per drawing)**
- Room-based sessions

✅ **Lifecycle Management:**

- Max 10 drawings on screen
- 30s minimum, 90s maximum display time
- Fair rotation and visibility
- Prevents clutter and maintains performance

✅ **Estimated Costs:**

- Hosting: ~$6/month
- AI: $0.50-$25/month (usage-based)
- Total: $6.50-$31/month

✅ **Timeline:**

- MVP: 2 weeks
- Full features: 5 weeks
- Production-ready: 6 weeks

---

## Next Steps

Ready to start building! The design document is complete with:

- ✅ Complete architecture
- ✅ Detailed component specifications
- ✅ **Hybrid lifecycle management strategy**
- ✅ Implementation code examples
- ✅ Deployment strategy
- ✅ Cost analysis
- ✅ Development phases

Shall we proceed with Phase 1 (MVP)?
