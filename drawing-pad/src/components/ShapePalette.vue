<script setup lang="ts">
import { shapeList } from '../data/predefinedShapes';
import type { ShapeType } from '../types/shapes';

const emit = defineEmits<{
  (e: 'drag-start', type: ShapeType, event: PointerEvent): void;
}>();

function handlePointerDown(type: ShapeType, event: PointerEvent) {
  event.preventDefault();
  emit('drag-start', type, event);
}
</script>

<template>
  <div class="shape-palette">
    <div class="palette-label">Shapes</div>
    <div class="palette-items">
      <button
        v-for="shape in shapeList"
        :key="shape.type"
        class="palette-item"
        :title="shape.name"
        @pointerdown="handlePointerDown(shape.type, $event)"
      >
        <span class="shape-icon">{{ shape.icon }}</span>
        <span class="shape-name">{{ shape.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.shape-palette {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 50;
  max-width: 90vw;
}

.palette-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  text-align: center;
}

.palette-items {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.palette-items::-webkit-scrollbar {
  display: none;
}

.palette-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.15s ease;
  min-width: 64px;
  touch-action: none;
  user-select: none;
}

.palette-item:hover {
  background: #e8f4fd;
  border-color: #4a90d9;
  transform: translateY(-2px);
}

.palette-item:active {
  cursor: grabbing;
  transform: scale(0.95);
  background: #d4e9f7;
}

.shape-icon {
  font-size: 24px;
  line-height: 1;
}

.shape-name {
  font-size: 10px;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
}
</style>

