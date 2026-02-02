<script setup lang="ts">
import type { HandleType } from "../types/shapes";

const props = defineProps<{
  width: number;
  height: number;
}>();

const emit = defineEmits<{
  (e: "resize-start", handle: HandleType, event: PointerEvent): void;
  (e: "rotate-start", event: PointerEvent): void;
}>();

// Handle positions relative to shape bounds
const handles: { type: HandleType; position: string }[] = [
  { type: "nw", position: "top-left" },
  { type: "n", position: "top-center" },
  { type: "ne", position: "top-right" },
  { type: "w", position: "middle-left" },
  { type: "e", position: "middle-right" },
  { type: "sw", position: "bottom-left" },
  { type: "s", position: "bottom-center" },
  { type: "se", position: "bottom-right" },
];

// Distance of rotation handle from top of shape
const ROTATION_HANDLE_DISTANCE = 30;

// Get cursor style for each handle
function getCursor(handle: HandleType): string {
  const cursors: Record<HandleType, string> = {
    nw: "nwse-resize",
    n: "ns-resize",
    ne: "nesw-resize",
    w: "ew-resize",
    e: "ew-resize",
    sw: "nesw-resize",
    s: "ns-resize",
    se: "nwse-resize",
    rotate: "grab",
  };
  return cursors[handle];
}

// Get position style for each handle
function getHandleStyle(handle: HandleType): Record<string, string> {
  const halfHandle = "6px"; // Half of handle size (12px)

  const positions: Record<HandleType, Record<string, string>> = {
    nw: { top: `-${halfHandle}`, left: `-${halfHandle}` },
    n: { top: `-${halfHandle}`, left: "50%", transform: "translateX(-50%)" },
    ne: { top: `-${halfHandle}`, right: `-${halfHandle}` },
    w: { top: "50%", left: `-${halfHandle}`, transform: "translateY(-50%)" },
    e: { top: "50%", right: `-${halfHandle}`, transform: "translateY(-50%)" },
    sw: { bottom: `-${halfHandle}`, left: `-${halfHandle}` },
    s: { bottom: `-${halfHandle}`, left: "50%", transform: "translateX(-50%)" },
    se: { bottom: `-${halfHandle}`, right: `-${halfHandle}` },
    rotate: { top: "-30px", left: "50%", transform: "translateX(-50%)" },
  };

  return {
    ...positions[handle],
    cursor: getCursor(handle),
  };
}

function handlePointerDown(handle: HandleType, event: PointerEvent) {
  event.stopPropagation();
  event.preventDefault();
  emit("resize-start", handle, event);
}

function handleRotatePointerDown(event: PointerEvent) {
  event.stopPropagation();
  event.preventDefault();
  emit("rotate-start", event);
}
</script>

<template>
  <div class="resize-handles">
    <!-- Rotation handle with connecting line -->
    <div class="rotation-container">
      <div class="rotation-line"></div>
      <div
        class="handle rotation-handle"
        @pointerdown="handleRotatePointerDown"
      >
        <span class="rotation-icon">↻</span>
      </div>
    </div>

    <!-- Corner and edge handles -->
    <div
      v-for="handle in handles"
      :key="handle.type"
      class="handle"
      :class="[
        `handle-${handle.type}`,
        handle.type.length === 2 ? 'corner' : 'edge',
      ]"
      :style="getHandleStyle(handle.type)"
      @pointerdown="handlePointerDown(handle.type, $event)"
    />
  </div>
</template>

<style scoped>
.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #4a90d9;
  border-radius: 2px;
  pointer-events: auto;
  touch-action: none;
  z-index: 10;
}

.handle.corner {
  border-radius: 2px;
}

.handle.edge {
  border-radius: 2px;
}

.handle:hover {
  background: #4a90d9;
  border-color: #2d6cb5;
}

.handle:active {
  background: #2d6cb5;
}

/* Rotation handle container */
.rotation-container {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.rotation-line {
  width: 2px;
  height: 20px;
  background: #4a90d9;
  pointer-events: none;
}

.rotation-handle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.rotation-handle:active {
  cursor: grabbing;
}

.rotation-icon {
  font-size: 12px;
  color: #4a90d9;
  font-weight: bold;
  user-select: none;
}

.rotation-handle:hover .rotation-icon {
  color: white;
}
</style>
