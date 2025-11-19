<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";
const ROOM = "default-room";

// State
const canvas = ref<HTMLCanvasElement | null>(null);
const socket = ref<Socket | null>(null);
const isDrawing = ref(false);
const isSending = ref(false);
const lastX = ref(0);
const lastY = ref(0);
const swipeStartY = ref(0);
const showSuccess = ref(false);
const showPreview = ref(false);
const previewImage = ref("");

// Canvas context
let ctx: CanvasRenderingContext2D | null = null;

// Initialize socket connection
onMounted(() => {
  // Connect to server
  socket.value = io(SERVER_URL);

  socket.value.on("connect", () => {
    console.log("✅ Connected to server");
    socket.value?.emit("join-room", { room: ROOM, type: "pad" });
  });

  socket.value.on("joined-room", (data) => {
    console.log("📱 Joined room:", data.room);
  });

  socket.value.on("drawing-sent", (data) => {
    isSending.value = false;
    if (data.success) {
      showPreview.value = false;
      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
        clearCanvas();
      }, 2500);
    }
  });

  // Setup canvas
  if (canvas.value) {
    ctx = canvas.value.getContext("2d");
    resizeCanvas();
    setupCanvas();
  }

  window.addEventListener("resize", resizeCanvas);
});

onUnmounted(() => {
  socket.value?.disconnect();
  window.removeEventListener("resize", resizeCanvas);
});

function resizeCanvas() {
  if (!canvas.value) return;
  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
  setupCanvas();
}

function setupCanvas() {
  if (!ctx) return;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

// Drawing functions
function startDrawing(e: MouseEvent | TouchEvent) {
  isDrawing.value = true;
  const pos = getPosition(e);
  lastX.value = pos.x;
  lastY.value = pos.y;
  swipeStartY.value = pos.y;
}

function draw(e: MouseEvent | TouchEvent) {
  if (!isDrawing.value || !ctx) return;

  const pos = getPosition(e);

  ctx.beginPath();
  ctx.moveTo(lastX.value, lastY.value);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX.value = pos.x;
  lastY.value = pos.y;
}

function stopDrawing(e: MouseEvent | TouchEvent) {
  if (!isDrawing.value) return;
  isDrawing.value = false;
}

function getPosition(e: MouseEvent | TouchEvent): { x: number; y: number } {
  if (e instanceof TouchEvent) {
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }
  return {
    x: e.clientX,
    y: e.clientY,
  };
}

function showPreviewDialog() {
  if (!canvas.value) return;

  // Check if canvas is empty
  if (isCanvasEmpty()) {
    return;
  }

  previewImage.value = canvas.value.toDataURL("image/png");
  showPreview.value = true;
}

function isCanvasEmpty(): boolean {
  if (!canvas.value || !ctx) return true;

  const pixelData = ctx.getImageData(
    0,
    0,
    canvas.value.width,
    canvas.value.height
  );
  return !pixelData.data.some((channel) => channel !== 0);
}

function handlePreviewSwipe(e: TouchEvent) {
  const touch = e.touches[0] || e.changedTouches[0];

  if (e.type === "touchstart") {
    swipeStartY.value = touch.clientY;
  } else if (e.type === "touchend") {
    const swipeDistance = swipeStartY.value - touch.clientY;

    // Swipe up to send (>100px upward)
    if (swipeDistance > 100) {
      sendDrawing();
    }
  }
}

function sendDrawing() {
  if (!socket.value || isSending.value) return;

  isSending.value = true;

  socket.value.emit("new-drawing", {
    image: previewImage.value,
    room: ROOM,
    timestamp: Date.now(),
  });
}

function cancelPreview() {
  showPreview.value = false;
  previewImage.value = "";
}

function clearCanvas() {
  if (!ctx || !canvas.value) return;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  showPreview.value = false;
  previewImage.value = "";
}
</script>

<template>
  <div class="drawing-pad">
    <canvas
      ref="canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart.prevent="startDrawing"
      @touchmove.prevent="draw"
      @touchend.prevent="stopDrawing"
    />

    <div class="controls">
      <button @click="clearCanvas" class="btn-clear">Clear</button>
      <button @click="showPreviewDialog" class="btn-done">Done</button>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccess" class="success-overlay">
      <div class="success-message">
        <div class="success-icon">🎉</div>
        <h2>Congratulations!</h2>
        <p>Your artwork is on its way to the big screen!</p>
        <div class="success-animation">
          <div class="confetti">🎊</div>
          <div class="confetti">✨</div>
          <div class="confetti">🌟</div>
          <div class="confetti">💫</div>
          <div class="confetti">⭐</div>
        </div>
      </div>
    </div>

    <div class="instructions">Draw your artwork, then tap "Done"</div>

    <!-- Preview Dialog -->
    <div v-if="showPreview" class="preview-overlay">
      <div class="preview-dialog">
        <div class="preview-header">
          <h2>Ready to send?</h2>
          <p>Swipe up ⬆️ or tap the Send button</p>
        </div>

        <div
          class="preview-image-container"
          @touchstart="handlePreviewSwipe"
          @touchend="handlePreviewSwipe"
        >
          <img :src="previewImage" alt="Preview" class="preview-image" />
          <div class="swipe-indicator">
            <div class="swipe-arrow">⬆️</div>
            <div class="swipe-text">Swipe up to send</div>
          </div>
        </div>

        <div class="preview-actions">
          <button @click="cancelPreview" class="btn-cancel">
            ← Back to Edit
          </button>
          <button
            @click="sendDrawing"
            :disabled="isSending"
            class="btn-send-preview"
          >
            {{ isSending ? "Sending..." : "Send ⬆️" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.drawing-pad {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
  touch-action: none;
}

canvas {
  display: block;
  cursor: crosshair;
  background: white;
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear {
  background: #ff6b6b;
  color: white;
}

.btn-clear:hover {
  background: #ff5252;
}

.btn-done {
  background: #4caf50;
  color: white;
}

.btn-done:hover {
  background: #45a049;
}

/* Success Message */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCenter 0.3s ease-out;
}

.success-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.success-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: rotate 0.6s ease-in-out;
}

.success-message h2 {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: bold;
}

.success-message p {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

.success-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  font-size: 30px;
  animation: confettiFall 2s ease-out forwards;
}

.confetti:nth-child(1) {
  left: 10%;
  animation-delay: 0s;
}

.confetti:nth-child(2) {
  left: 30%;
  animation-delay: 0.2s;
}

.confetti:nth-child(3) {
  left: 50%;
  animation-delay: 0.1s;
}

.confetti:nth-child(4) {
  left: 70%;
  animation-delay: 0.3s;
}

.confetti:nth-child(5) {
  left: 90%;
  animation-delay: 0.15s;
}

@keyframes successPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg) scale(0);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes confettiFall {
  0% {
    top: -10%;
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    top: 110%;
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

.instructions {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 10;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes fadeInCenter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Preview Dialog */
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCenter 0.2s ease-out;
}

.preview-dialog {
  width: 90%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: scaleIn 0.3s ease-out;
}

.preview-header {
  text-align: center;
}

.preview-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.preview-header p {
  margin: 5px 0 0 0;
  font-size: 16px;
  color: #666;
}

.preview-image-container {
  position: relative;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  touch-action: pan-y;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.swipe-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  animation: bounce 2s infinite;
}

.swipe-arrow {
  font-size: 32px;
  margin-bottom: 5px;
}

.swipe-text {
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-cancel {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #ff6b6b;
  background: white;
  color: #ff6b6b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-cancel:hover {
  background: #ff6b6b;
  color: white;
}

.btn-send-preview {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #4caf50;
  background: #4caf50;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-send-preview:hover:not(:disabled) {
  background: #45a049;
  border-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-send-preview:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
