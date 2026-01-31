<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { io, Socket } from "socket.io-client";
import gsap from "gsap";

const SERVER_URL = "http://localhost:3000";
const ROOM = "default-room";

// ===== DEV/TEST MODE =====
const DEV_MODE = true; // Set to false when using real server

// Placeholder images for testing (from picsum.photos)
const TEST_IMAGES = [
  "https://picsum.photos/seed/draw1/250/250",
  "https://picsum.photos/seed/draw2/250/250",
  "https://picsum.photos/seed/draw3/250/250",
  "https://picsum.photos/seed/draw4/250/250",
  "https://picsum.photos/seed/draw5/250/250",
  "https://picsum.photos/seed/draw6/250/250",
  "https://picsum.photos/seed/draw7/250/250",
  "https://picsum.photos/seed/draw8/250/250",
  "https://picsum.photos/seed/draw9/250/250",
  "https://picsum.photos/seed/draw10/250/250",
];

interface Drawing {
  id: string;
  anime: string;
  video?: string;
  isAnimating?: boolean;
  timestamp: number;
  initialX: number; // Fixed CSS left position
  initialY: number; // Fixed CSS top position
  x: number; // Current world position (for physics)
  y: number;
  vx: number; // velocity X for physics
  vy: number; // velocity Y for physics
  rotation: number;
  scale: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

// State
const socket = ref<Socket | null>(null);
const drawings = ref<Drawing[]>([]);
const MAX_DRAWINGS = 10;
const MIN_LIFETIME = 30000; // 30 seconds
const MAX_LIFETIME = 90000; // 90 seconds
const VIDEO_EXTRA_LIFETIME = 60000; // 60 seconds extra when video arrives

// Physics constants
const PHYSICS = {
  repulsionStrength: 800, // How strongly drawings push each other away
  friction: 0.92, // Velocity dampening (0-1, lower = more friction)
  wanderStrength: 0.3, // Random wandering force
  maxSpeed: 3, // Maximum velocity
  minDistance: 300, // Minimum distance before repulsion kicks in
  boundaryPadding: 50, // Padding from screen edges
  headerHeight: 200, // Space for header
  drawingSize: 250, // Size of drawing element
};

// ===== DEV MODE FUNCTIONS =====
let testImageIndex = 0;

function addTestDrawing() {
  const id = `test-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 11)}`;
  const imageUrl = TEST_IMAGES[testImageIndex % TEST_IMAGES.length];
  testImageIndex++;

  console.log("🧪 Adding test drawing:", id);
  addDrawing({
    id,
    anime: imageUrl,
    timestamp: Date.now(),
  });
}

function handleKeyPress(e: KeyboardEvent) {
  if (!DEV_MODE) return;

  switch (e.key.toLowerCase()) {
    case " ": // Spacebar - add one drawing
      e.preventDefault();
      addTestDrawing();
      break;
    case "f": // F - fill with 5 drawings
      for (let i = 0; i < 5; i++) {
        setTimeout(() => addTestDrawing(), i * 200);
      }
      break;
    case "c": // C - clear all drawings
      drawings.value.forEach((d) => removeDrawing(d.id));
      break;
  }
}

// Initialize socket connection and physics
onMounted(() => {
  startPhysicsSimulation();

  // DEV MODE: Add keyboard controls
  if (DEV_MODE) {
    window.addEventListener("keydown", handleKeyPress);
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧪 DEV MODE ENABLED                                       ║
║                                                            ║
║  Keyboard Controls:                                        ║
║  [SPACE] - Add one test drawing                           ║
║  [F]     - Fill with 5 drawings                           ║
║  [C]     - Clear all drawings                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  }

  // Connect to server (works in both modes)
  socket.value = io(SERVER_URL);

  socket.value.on("connect", () => {
    console.log("✅ Connected to server");
    socket.value?.emit("join-room", { room: ROOM, type: "display" });
  });

  socket.value.on("joined-room", (data) => {
    console.log("🖥️ Joined room:", data.room);
  });

  // Handle anime-ready (for 'anime' and 'both' modes)
  socket.value.on("anime-ready", (data) => {
    console.log("🎨 New anime drawing received:", data.id);
    addDrawing({ id: data.id, anime: data.anime, timestamp: data.timestamp });
  });

  // Handle drawing-ready (for 'video-only' mode - shows original sketch)
  socket.value.on("drawing-ready", (data) => {
    console.log("🖼️ Original drawing received (video-only mode):", data.id);
    addDrawing({
      id: data.id,
      anime: data.image, // Use original image in the anime field
      timestamp: data.timestamp,
      isProcessingVideo: true,
    });
  });

  socket.value.on("animation-processing", (data) => {
    console.log("🎬 Animation processing started:", data.id);
    const drawing = drawings.value.find((d) => d.id === data.id);
    if (drawing) {
      drawing.isAnimating = true;
    }
  });

  socket.value.on("video-ready", (data) => {
    console.log("🎬 Video ready:", data.id);
    const drawing = drawings.value.find((d) => d.id === data.id);
    if (drawing) {
      drawing.isAnimating = false;
      drawing.video = data.video;

      // Extend lifetime so video shows for at least VIDEO_EXTRA_LIFETIME
      if (drawing.timeoutId) {
        clearTimeout(drawing.timeoutId);
      }
      drawing.timeoutId = setTimeout(() => {
        removeDrawing(drawing.id);
      }, VIDEO_EXTRA_LIFETIME);
      console.log(
        `⏰ Extended lifetime by ${VIDEO_EXTRA_LIFETIME / 1000}s for:`,
        data.id
      );

      // Trigger crossfade animation
      nextTick(() => {
        animateVideoTransition(drawing);
      });
    }
  });

  socket.value.on("animation-failed", (data) => {
    console.log("❌ Animation failed:", data.id);
    const drawing = drawings.value.find((d) => d.id === data.id);
    if (drawing) {
      drawing.isAnimating = false;

      // If this was a video-only mode drawing without a timeout, set one now
      if (!drawing.timeoutId) {
        const lifetime =
          MIN_LIFETIME + Math.random() * (MAX_LIFETIME - MIN_LIFETIME);
        drawing.timeoutId = setTimeout(() => {
          removeDrawing(drawing.id);
        }, lifetime);
        console.log(
          `⏰ Animation failed, setting removal timeout: ${lifetime / 1000}s`
        );
      }
    }
  });
});

onUnmounted(() => {
  stopPhysicsSimulation();
  if (DEV_MODE) {
    window.removeEventListener("keydown", handleKeyPress);
  }
  socket.value?.disconnect();
});

function addDrawing(data: {
  id: string;
  anime: string;
  timestamp: number;
  isProcessingVideo?: boolean;
}) {
  // Remove oldest if at capacity
  if (drawings.value.length >= MAX_DRAWINGS) {
    const oldest = drawings.value[0];
    removeDrawing(oldest.id);
  }

  // Find non-overlapping position
  const DRAWING_SIZE = 250; // Size of drawing image
  const PADDING = 30; // Minimum space between drawings
  const position = findNonOverlappingPosition(DRAWING_SIZE, PADDING);

  // Limit rotation to ±5 degrees for subtle tilt
  const rotation = Math.random() * 10 - 5; // -5° to +5°
  const scale = 0;

  const drawing: Drawing = {
    id: data.id,
    anime: data.anime,
    timestamp: data.timestamp,
    initialX: position.x, // Fixed CSS position
    initialY: position.y,
    x: position.x, // Current world position (updated by physics)
    y: position.y,
    vx: 0, // Start with no velocity
    vy: 0,
    rotation, // This will be the target rotation for animation
    scale,
    isAnimating: data.isProcessingVideo || false, // Show loading indicator if processing video
  };

  drawings.value.push(drawing);

  // Wait for DOM to update before animating
  nextTick(() => {
    // Animate in (physics simulation handles floating)
    animateIn(drawing);
  });

  // Schedule removal - but NOT if we're waiting for video processing
  // (video-only mode: wait until video arrives before starting timeout)
  if (!data.isProcessingVideo) {
    const lifetime =
      MIN_LIFETIME + Math.random() * (MAX_LIFETIME - MIN_LIFETIME);
    drawing.timeoutId = setTimeout(() => {
      removeDrawing(drawing.id);
    }, lifetime);
  }
  // For video-only mode, timeout will be set when video-ready event arrives
}

function findNonOverlappingPosition(
  size: number,
  padding: number
): { x: number; y: number } {
  const maxAttempts = 50;
  const headerHeight = 200; // Space for header (increased to prevent overlap with rotated drawings)
  const margin = 50; // Margin from edges

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Random position within bounds
    const x = margin + Math.random() * (window.innerWidth - size - margin * 2);
    const y =
      headerHeight +
      margin +
      Math.random() * (window.innerHeight - size - headerHeight - margin * 2);

    // Check if this position overlaps with existing drawings
    const overlaps = drawings.value.some((existing) => {
      const dx = Math.abs(x - existing.x);
      const dy = Math.abs(y - existing.y);
      const minDistance = size + padding;

      return dx < minDistance && dy < minDistance;
    });

    if (!overlaps) {
      return { x, y };
    }
  }

  // If we couldn't find a non-overlapping position after max attempts,
  // return a random position anyway (fallback)
  return {
    x: margin + Math.random() * (window.innerWidth - size - margin * 2),
    y:
      headerHeight +
      margin +
      Math.random() * (window.innerHeight - size - headerHeight - margin * 2),
  };
}

function animateIn(drawing: Drawing) {
  const element = document.getElementById(drawing.id);
  if (!element) {
    console.error("❌ Element not found for animation:", drawing.id);
    return;
  }

  console.log("✨ Animating in:", drawing.id);
  gsap.fromTo(
    element,
    {
      scale: 0,
      rotation: 0, // Start with no rotation
      opacity: 0,
      y: -200, // Start from above
    },
    {
      scale: 1,
      rotation: drawing.rotation, // Animate to final rotation (-5° to +5°)
      opacity: 1,
      y: 0,
      duration: 1.5, // Longer duration so you can see it
      ease: "elastic.out(1, 0.5)", // More bouncy
      onComplete: () => {
        console.log("✅ Animation complete:", drawing.id);
      },
    }
  );
}

// Physics simulation - runs every frame via GSAP ticker
function updatePhysics() {
  const {
    repulsionStrength,
    friction,
    wanderStrength,
    maxSpeed,
    minDistance,
    boundaryPadding,
    headerHeight,
    drawingSize,
  } = PHYSICS;

  for (const drawing of drawings.value) {
    // Skip if drawing is being removed (scale animation in progress)
    const element = document.getElementById(drawing.id);
    if (!element) continue;

    // 1. Add gentle random wandering force
    drawing.vx += (Math.random() - 0.5) * wanderStrength;
    drawing.vy += (Math.random() - 0.5) * wanderStrength;

    // 2. Calculate repulsion from other drawings
    for (const other of drawings.value) {
      if (drawing.id === other.id) continue;

      const dx = drawing.x - other.x;
      const dy = drawing.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance && distance > 0) {
        // Repulsion force (inverse square - stronger when closer)
        const force = repulsionStrength / (distance * distance);
        drawing.vx += (dx / distance) * force;
        drawing.vy += (dy / distance) * force;
      }
    }

    // 3. Boundary repulsion (push away from edges)
    const minX = boundaryPadding;
    const maxX = window.innerWidth - drawingSize - boundaryPadding;
    const minY = headerHeight + boundaryPadding;
    const maxY = window.innerHeight - drawingSize - boundaryPadding;

    if (drawing.x < minX + 50) drawing.vx += 0.5;
    if (drawing.x > maxX - 50) drawing.vx -= 0.5;
    if (drawing.y < minY + 50) drawing.vy += 0.5;
    if (drawing.y > maxY - 50) drawing.vy -= 0.5;

    // 4. Apply friction
    drawing.vx *= friction;
    drawing.vy *= friction;

    // 5. Clamp velocity to max speed
    const speed = Math.sqrt(drawing.vx * drawing.vx + drawing.vy * drawing.vy);
    if (speed > maxSpeed) {
      drawing.vx = (drawing.vx / speed) * maxSpeed;
      drawing.vy = (drawing.vy / speed) * maxSpeed;
    }

    // 6. Update position
    drawing.x += drawing.vx;
    drawing.y += drawing.vy;

    // 7. Hard clamp to boundaries
    drawing.x = Math.max(minX, Math.min(maxX, drawing.x));
    drawing.y = Math.max(minY, Math.min(maxY, drawing.y));

    // 8. Update rotation based on velocity (subtle tilt in movement direction)
    const targetRotation = drawing.vx * 2; // Tilt based on horizontal velocity
    drawing.rotation += (targetRotation - drawing.rotation) * 0.05;

    // 9. Apply to DOM element using GSAP.set for performance
    // Transform is relative to the fixed initialX/Y position
    gsap.set(element, {
      x: drawing.x - drawing.initialX,
      y: drawing.y - drawing.initialY,
      rotation: drawing.rotation,
    });
  }
}

function startPhysicsSimulation() {
  console.log("🌊 Starting physics simulation");
  gsap.ticker.add(updatePhysics);
}

function stopPhysicsSimulation() {
  console.log("🛑 Stopping physics simulation");
  gsap.ticker.remove(updatePhysics);
}

function animateVideoTransition(drawing: Drawing) {
  const container = document.getElementById(drawing.id);
  if (!container) return;

  const img = container.querySelector(".drawing-image") as HTMLElement;
  const video = container.querySelector(".drawing-video") as HTMLVideoElement;

  if (!img || !video) return;

  console.log("🎬 Crossfading to video:", drawing.id);

  // Crossfade: fade out image, fade in video
  gsap.to(img, {
    opacity: 0,
    scale: 0.95,
    duration: 0.8,
    ease: "power2.inOut",
  });

  gsap.fromTo(
    video,
    { opacity: 0, scale: 1.05 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power2.inOut",
      onStart: () => {
        video.play().catch((e) => console.warn("Video autoplay blocked:", e));
      },
    }
  );
}

function removeDrawing(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    drawings.value = drawings.value.filter((d) => d.id !== id);
    return;
  }

  gsap.to(element, {
    scale: 0,
    opacity: 0,
    duration: 1,
    ease: "power2.in",
    onComplete: () => {
      drawings.value = drawings.value.filter((d) => d.id !== id);
    },
  });
}
</script>

<template>
  <div class="display-screen">
    <div class="header">
      <h1>🎨 Draw and Share</h1>
      <p>{{ drawings.length }} / {{ MAX_DRAWINGS }} drawings</p>
    </div>

    <div class="drawings-container">
      <div
        v-for="drawing in drawings"
        :key="drawing.id"
        :id="drawing.id"
        class="drawing"
        :class="{
          'has-video': drawing.video,
          'is-animating': drawing.isAnimating,
        }"
        :style="{
          left: `${drawing.initialX}px`,
          top: `${drawing.initialY}px`,
        }"
      >
        <!-- Static anime image -->
        <img
          :src="drawing.anime"
          alt="Anime drawing"
          class="drawing-image"
          :class="{ hidden: drawing.video }"
        />

        <!-- Video (when available) -->
        <video
          v-if="drawing.video"
          :src="drawing.video"
          class="drawing-video"
          loop
          muted
          playsinline
        />

        <!-- Loading indicator while animating -->
        <div v-if="drawing.isAnimating" class="animating-indicator">
          <div class="spinner"></div>
          <span>Animating...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.display-screen {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  overflow: hidden;
  position: relative;
}

.header {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  padding: 15px 30px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.header h1 {
  font-size: 32px;
  margin: 0;
  font-weight: bold;
}

.header p {
  font-size: 16px;
  margin: 5px 0 0 0;
  opacity: 0.9;
}

.drawings-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.drawing {
  position: absolute;
  transform-origin: center;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
  transition: filter 0.3s;
}

.drawing:hover {
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
  z-index: 100;
}

.drawing-image,
.drawing-video {
  width: 250px;
  height: 250px;
  object-fit: contain;
  border-radius: 12px;
  background: white;
  padding: 10px;
  position: absolute;
  top: 0;
  left: 0;
}

.drawing-image {
  z-index: 1;
}

.drawing-image.hidden {
  pointer-events: none;
}

.drawing-video {
  z-index: 2;
  opacity: 0;
}

.drawing.has-video .drawing-video {
  opacity: 1;
}

/* Loading indicator */
.animating-indicator {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 10;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Subtle glow for drawings being animated */
.drawing.is-animating {
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
  }
  50% {
    filter: drop-shadow(0 10px 30px rgba(99, 102, 241, 0.5));
  }
}
</style>
