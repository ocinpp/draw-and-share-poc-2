<script setup lang="ts">
import { ref, computed } from "vue";
import type { ShapeType, HandleType, PatternType } from "../types/shapes";
import { DEFAULT_SHAPE_SIZE } from "../types/shapes";
import { useShapeEditor } from "../composables/useShapeEditor";
import { getShapeDefinition } from "../data/predefinedShapes";
import { renderShapesToCanvas } from "../utils/renderShapes";
import ShapePalette from "./ShapePalette.vue";
import ShapeItem from "./ShapeItem.vue";
import PropertiesPanel from "./PropertiesPanel.vue";

// Shape editor state
const {
  shapes,
  sortedShapes,
  selectedShapeId,
  selectedShape,
  hasShapes,
  canUndo,
  canRedo,
  addShape,
  selectShape,
  deselectShape,
  moveShape,
  resizeShapeFromHandle,
  rotateShape,
  setShapeColor,
  setShapePattern,
  deleteSelectedShape,
  clearShapes,
  undo,
  redo,
  commitToHistory,
} = useShapeEditor();

// Refs
const canvasRef = ref<HTMLDivElement | null>(null);

// Drag state
const isDragging = ref(false);
const dragType = ref<"new" | "move" | "resize" | "rotate" | null>(null);
const dragShapeType = ref<ShapeType | null>(null);
const dragShapeId = ref<string | null>(null);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);

// Resize state
const resizeHandle = ref<HandleType | null>(null);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);

// Rotation state
const rotateStartAngle = ref(0);
const rotateStartRotation = ref(0);

// Ghost element for dragging new shapes
const ghostPosition = ref({ x: 0, y: 0, visible: false });

// Get ghost icon based on current drag shape type
const ghostIcon = computed(() => {
  if (!dragShapeType.value) return "";
  return getShapeDefinition(dragShapeType.value).icon;
});

// Handle drag start from palette
function handlePaletteDragStart(type: ShapeType, event: PointerEvent) {
  dragType.value = "new";
  dragShapeType.value = type;
  isDragging.value = true;

  ghostPosition.value = {
    x: event.clientX - DEFAULT_SHAPE_SIZE / 2,
    y: event.clientY - DEFAULT_SHAPE_SIZE / 2,
    visible: true,
  };

  // Capture pointer for tracking
  (event.target as HTMLElement).setPointerCapture(event.pointerId);

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
}

// Handle drag start from existing shape
function handleShapeDragStart(id: string, event: PointerEvent) {
  const shape = shapes.value.find((s) => s.id === id);
  if (!shape) return;

  dragType.value = "move";
  dragShapeId.value = id;
  isDragging.value = true;

  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  dragOffsetX.value = shape.x;
  dragOffsetY.value = shape.y;

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
}

// Handle resize start from shape handles
function handleResizeStart(
  id: string,
  handle: HandleType,
  event: PointerEvent,
) {
  const shape = shapes.value.find((s) => s.id === id);
  if (!shape) return;

  dragType.value = "resize";
  dragShapeId.value = id;
  resizeHandle.value = handle;
  isDragging.value = true;

  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  dragOffsetX.value = shape.x;
  dragOffsetY.value = shape.y;
  resizeStartWidth.value = shape.width;
  resizeStartHeight.value = shape.height;

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
}

// Handle rotation start from shape handles
function handleRotateStart(id: string, event: PointerEvent) {
  const shape = shapes.value.find((s) => s.id === id);
  if (!shape) return;

  dragType.value = "rotate";
  dragShapeId.value = id;
  isDragging.value = true;

  // Calculate initial angle from shape center to pointer
  const centerX = shape.x;
  const centerY = shape.y;
  rotateStartAngle.value =
    Math.atan2(event.clientY - centerY, event.clientX - centerX) *
    (180 / Math.PI);
  rotateStartRotation.value = shape.rotation;

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
}

// Calculate angle from shape center to pointer
function calculateAngle(
  shapeX: number,
  shapeY: number,
  pointerX: number,
  pointerY: number,
): number {
  return Math.atan2(pointerY - shapeY, pointerX - shapeX) * (180 / Math.PI);
}

// Handle pointer move during drag
function handlePointerMove(event: PointerEvent) {
  if (!isDragging.value) return;

  if (dragType.value === "new") {
    ghostPosition.value = {
      x: event.clientX - DEFAULT_SHAPE_SIZE / 2,
      y: event.clientY - DEFAULT_SHAPE_SIZE / 2,
      visible: true,
    };
  } else if (dragType.value === "move" && dragShapeId.value) {
    const deltaX = event.clientX - dragStartX.value;
    const deltaY = event.clientY - dragStartY.value;
    moveShape(
      dragShapeId.value,
      dragOffsetX.value + deltaX,
      dragOffsetY.value + deltaY,
    );
  } else if (
    dragType.value === "resize" &&
    dragShapeId.value &&
    resizeHandle.value
  ) {
    const deltaX = event.clientX - dragStartX.value;
    const deltaY = event.clientY - dragStartY.value;
    resizeShapeFromHandle(
      dragShapeId.value,
      resizeHandle.value,
      deltaX,
      deltaY,
      resizeStartWidth.value,
      resizeStartHeight.value,
      dragOffsetX.value,
      dragOffsetY.value,
    );
  } else if (dragType.value === "rotate" && dragShapeId.value) {
    const shape = shapes.value.find((s) => s.id === dragShapeId.value);
    if (shape) {
      const currentAngle = calculateAngle(
        shape.x,
        shape.y,
        event.clientX,
        event.clientY,
      );
      const deltaAngle = currentAngle - rotateStartAngle.value;
      const newRotation = rotateStartRotation.value + deltaAngle;
      rotateShape(dragShapeId.value, newRotation);
    }
  }
}

// Handle pointer up - end drag
function handlePointerUp(event: PointerEvent) {
  if (!isDragging.value) return;

  if (dragType.value === "new" && dragShapeType.value) {
    // Check if dropped on canvas area (not on palette)
    const canvasRect = canvasRef.value?.getBoundingClientRect();
    if (canvasRect && event.clientY < canvasRect.bottom - 150) {
      addShape(dragShapeType.value, event.clientX, event.clientY);
    }
  } else if (
    dragType.value === "move" ||
    dragType.value === "resize" ||
    dragType.value === "rotate"
  ) {
    // Commit to history after drag operations
    commitToHistory();
  }

  // Reset drag state
  isDragging.value = false;
  dragType.value = null;
  dragShapeType.value = null;
  dragShapeId.value = null;
  resizeHandle.value = null;
  ghostPosition.value.visible = false;

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", handlePointerUp);
}

// Handle canvas click to deselect
function handleCanvasClick(event: PointerEvent) {
  // Only deselect if clicking directly on canvas background
  if (event.target === canvasRef.value) {
    deselectShape();
  }
}

// Public methods exposed to parent
async function getImageData(): Promise<string | null> {
  if (!hasShapes.value || !canvasRef.value) return null;

  try {
    // Get canvas dimensions
    const rect = canvasRef.value.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    // Render shapes to canvas and get PNG data URL
    const dataUrl = await renderShapesToCanvas(shapes.value, width, height);
    return dataUrl;
  } catch (error) {
    console.error("Failed to render shapes:", error);
    return null;
  }
}

function clear() {
  clearShapes();
}

function isEmpty(): boolean {
  return !hasShapes.value;
}

// Properties panel handlers
function handleUpdateColor(color: string) {
  if (selectedShapeId.value) {
    setShapeColor(selectedShapeId.value, color);
  }
}

function handleUpdatePattern(pattern: PatternType) {
  if (selectedShapeId.value) {
    setShapePattern(selectedShapeId.value, pattern);
  }
}

function handleDeleteShape() {
  deleteSelectedShape();
}

// Expose methods to parent
defineExpose({
  getImageData,
  clear,
  isEmpty,
});
</script>

<template>
  <div ref="canvasRef" class="shape-canvas" @pointerdown="handleCanvasClick">
    <!-- Undo/Redo buttons -->
    <div class="history-buttons">
      <button
        class="history-btn"
        :disabled="!canUndo"
        @click.stop="undo"
        title="Undo"
      >
        ↩️
      </button>
      <button
        class="history-btn"
        :disabled="!canRedo"
        @click.stop="redo"
        title="Redo"
      >
        ↪️
      </button>
    </div>

    <!-- Empty state message -->
    <div v-if="!hasShapes && !isDragging" class="empty-message">
      <div class="icon">👆</div>
      <p>Drag shapes from below to start creating!</p>
    </div>

    <!-- Rendered shapes -->
    <ShapeItem
      v-for="shape in sortedShapes"
      :key="shape.id"
      :shape="shape"
      :is-selected="selectedShapeId === shape.id"
      @select="selectShape"
      @drag-start="handleShapeDragStart"
      @resize-start="handleResizeStart"
      @rotate-start="handleRotateStart"
    />

    <!-- Ghost shape while dragging from palette -->
    <div
      v-if="ghostPosition.visible && dragShapeType"
      class="ghost-shape"
      :style="{
        left: `${ghostPosition.x}px`,
        top: `${ghostPosition.y}px`,
      }"
    >
      <span class="ghost-icon">{{ ghostIcon }}</span>
    </div>

    <!-- Properties Panel (when shape is selected) -->
    <PropertiesPanel
      v-if="selectedShape"
      :shape="selectedShape"
      @update-color="handleUpdateColor"
      @update-pattern="handleUpdatePattern"
      @delete="handleDeleteShape"
    />

    <!-- Shape Palette -->
    <ShapePalette @drag-start="handlePaletteDragStart" />
  </div>
</template>

<style scoped>
.shape-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: white;
  overflow: hidden;
  touch-action: none;
}

.empty-message {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
  user-select: none;
  pointer-events: none;
}

.empty-message .icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-message p {
  font-size: 16px;
  margin: 0;
}

.ghost-shape {
  position: fixed;
  width: 100px;
  height: 100px;
  background: rgba(74, 144, 217, 0.3);
  border: 2px dashed #4a90d9;
  border-radius: 8px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ghost-icon {
  font-size: 32px;
  opacity: 0.7;
}

.history-buttons {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

.history-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.history-btn:hover:not(:disabled) {
  background: #f0f0f0;
  transform: scale(1.05);
}

.history-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.history-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
