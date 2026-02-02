<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// Emits
const emit = defineEmits<{
  (e: "drawing-ready", image: string): void;
}>();

// State
const canvas = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);

// Canvas context
let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d");
    resizeCanvas();
    setupCanvas();
  }
  window.addEventListener("resize", resizeCanvas);
});

onUnmounted(() => {
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
function startDrawing(e: PointerEvent) {
  isDrawing.value = true;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
}

function draw(e: PointerEvent) {
  if (!isDrawing.value || !ctx) return;

  ctx.beginPath();
  ctx.moveTo(lastX.value, lastY.value);
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();

  lastX.value = e.clientX;
  lastY.value = e.clientY;
}

function stopDrawing() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
}

function isCanvasEmpty(): boolean {
  if (!canvas.value || !ctx) return true;
  const pixelData = ctx.getImageData(
    0,
    0,
    canvas.value.width,
    canvas.value.height,
  );
  return !pixelData.data.some((channel) => channel !== 0);
}

// Public methods exposed to parent
async function getImageData(): Promise<string | null> {
  if (!canvas.value || isCanvasEmpty()) return null;
  return canvas.value.toDataURL("image/png");
}

function clear() {
  if (!ctx || !canvas.value) return;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
}

// Expose methods to parent
defineExpose({
  getImageData,
  clear,
  isCanvasEmpty,
});
</script>

<template>
  <canvas
    ref="canvas"
    class="draw-canvas"
    @pointerdown="startDrawing"
    @pointermove="draw"
    @pointerup="stopDrawing"
    @pointerleave="stopDrawing"
    @pointercancel="stopDrawing"
  />
</template>

<style scoped>
.draw-canvas {
  display: block;
  cursor: crosshair;
  background: white;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
}
</style>
