<script setup lang="ts">
import { computed } from "vue";
import type { Shape, HandleType } from "../types/shapes";
import { getShapeDefinition } from "../data/predefinedShapes";
import { generatePatternDefs, getShapeFilterId } from "../data/patterns";
import ResizeHandles from "./ResizeHandles.vue";

const props = defineProps<{
  shape: Shape;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "drag-start", id: string, event: PointerEvent): void;
  (
    e: "resize-start",
    id: string,
    handle: HandleType,
    event: PointerEvent,
  ): void;
  (e: "rotate-start", id: string, event: PointerEvent): void;
}>();

const definition = computed(() => getShapeDefinition(props.shape.type));

// Generate unique IDs for this shape's patterns/filters
const patternId = computed(
  () => `pattern-${props.shape.pattern}-${props.shape.id}`,
);
const filterId = computed(() =>
  getShapeFilterId(props.shape.pattern, props.shape.id),
);

// Generate pattern/filter defs
const patternDefs = computed(() => {
  return generatePatternDefs(
    props.shape.pattern,
    props.shape.id,
    props.shape.fill,
  );
});

// Determine fill value
const fillValue = computed(() => {
  if (props.shape.pattern === "solid") {
    return props.shape.fill;
  }
  return patternDefs.value.fillReference;
});

// Transform style
const transformStyle = computed(() => {
  const { x, y, width, height, rotation } = props.shape;
  return {
    transform: `translate(${x - width / 2}px, ${y - height / 2}px) rotate(${rotation}deg)`,
    width: `${width}px`,
    height: `${height}px`,
  };
});

function handlePointerDown(event: PointerEvent) {
  event.stopPropagation();
  emit("select", props.shape.id);
  emit("drag-start", props.shape.id, event);
}

function handleResizeStart(handle: HandleType, event: PointerEvent) {
  emit("resize-start", props.shape.id, handle, event);
}

function handleRotateStart(event: PointerEvent) {
  emit("rotate-start", props.shape.id, event);
}

// Generate SVG content based on shape type
function getShapeSvgElement(): string {
  const def = definition.value;
  const fill = fillValue.value;
  const filterAttr = filterId.value ? `filter="url(#${filterId.value})"` : "";

  switch (def.element) {
    case "rect":
      return `<rect x="5" y="5" width="90" height="90" fill="${fill}" ${filterAttr} />`;
    case "ellipse":
      return `<ellipse cx="50" cy="50" rx="45" ry="45" fill="${fill}" ${filterAttr} />`;
    case "polygon":
      return `<polygon points="${def.points}" fill="${fill}" ${filterAttr} />`;
    case "path":
      return `<path d="${def.path}" fill="${fill}" ${filterAttr} />`;
    default:
      return `<rect x="5" y="5" width="90" height="90" fill="${fill}" ${filterAttr} />`;
  }
}
</script>

<template>
  <div
    class="shape-item"
    :class="{ selected: isSelected }"
    :style="transformStyle"
    @pointerdown="handlePointerDown"
  >
    <svg class="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <!-- Pattern/Filter definitions -->
      <defs v-html="patternDefs.defs"></defs>

      <!-- Shape element -->
      <g v-html="getShapeSvgElement()"></g>
    </svg>

    <!-- Resize handles (only when selected) -->
    <ResizeHandles
      v-if="isSelected"
      :width="shape.width"
      :height="shape.height"
      @resize-start="handleResizeStart"
      @rotate-start="handleRotateStart"
    />
  </div>
</template>

<style scoped>
.shape-item {
  position: absolute;
  cursor: move;
  touch-action: none;
  user-select: none;
  transform-origin: center center;
}

.shape-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.shape-item.selected {
  outline: 2px dashed #4a90d9;
  outline-offset: 4px;
}

.shape-item:hover:not(.selected) {
  outline: 2px dashed rgba(74, 144, 217, 0.5);
  outline-offset: 4px;
}
</style>
