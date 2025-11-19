<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { io, Socket } from "socket.io-client";
import gsap from "gsap";

const SERVER_URL = "http://localhost:3000";
const ROOM = "default-room";

interface Drawing {
  id: string;
  anime: string;
  timestamp: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// State
const socket = ref<Socket | null>(null);
const drawings = ref<Drawing[]>([]);
const MAX_DRAWINGS = 10;
const MIN_LIFETIME = 30000; // 30 seconds
const MAX_LIFETIME = 90000; // 90 seconds

// Initialize socket connection
onMounted(() => {
  socket.value = io(SERVER_URL);

  socket.value.on("connect", () => {
    console.log("✅ Connected to server");
    socket.value?.emit("join-room", { room: ROOM, type: "display" });
  });

  socket.value.on("joined-room", (data) => {
    console.log("🖥️ Joined room:", data.room);
  });

  socket.value.on("anime-ready", (data) => {
    console.log("🎨 New anime drawing received:", data.id);
    addDrawing(data);
  });
});

onUnmounted(() => {
  socket.value?.disconnect();
});

function addDrawing(data: { id: string; anime: string; timestamp: number }) {
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
    x: position.x,
    y: position.y,
    rotation, // This will be the target rotation for animation
    scale,
  };

  drawings.value.push(drawing);

  // Wait for DOM to update before animating
  nextTick(() => {
    // Animate in
    animateIn(drawing);

    // Animate floating (with collision avoidance)
    animateFloat(drawing);
  });

  // Schedule removal
  const lifetime = MIN_LIFETIME + Math.random() * (MAX_LIFETIME - MIN_LIFETIME);
  setTimeout(() => {
    removeDrawing(drawing.id);
  }, lifetime);
}

function findNonOverlappingPosition(
  size: number,
  padding: number
): { x: number; y: number } {
  const maxAttempts = 50;
  const headerHeight = 100; // Space for header
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

function animateFloat(drawing: Drawing) {
  const element = document.getElementById(drawing.id);
  if (!element) {
    console.error("❌ Element not found for float animation:", drawing.id);
    return;
  }

  console.log("🌊 Starting float animation:", drawing.id);
  // More visible floating animation
  gsap.to(element, {
    x: `+=${Math.random() * 80 - 40}`, // Increased range for visibility
    y: `+=${Math.random() * 80 - 40}`, // Increased range for visibility
    rotation: `+=${Math.random() * 30 - 15}`, // More rotation
    duration: 3, // Faster so you can see it sooner
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
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
        :style="{
          left: `${drawing.x}px`,
          top: `${drawing.y}px`,
        }"
      >
        <img :src="drawing.anime" alt="Anime drawing" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.display-screen {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  position: relative;
}

.header {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px 30px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
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

.drawing img {
  width: 250px;
  height: 250px;
  object-fit: contain;
  border-radius: 12px;
  background: white;
  padding: 10px;
}
</style>
