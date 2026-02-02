<script setup lang="ts">
import { computed } from "vue";
import type { Shape, PatternType } from "../types/shapes";
import { colorPalette, allPatternList } from "../data/patterns";

const props = defineProps<{
  shape: Shape;
}>();

const emit = defineEmits<{
  (e: "update-color", color: string): void;
  (e: "update-pattern", pattern: PatternType): void;
  (e: "delete"): void;
}>();

// Group patterns by category
const basicPatterns = computed(() =>
  allPatternList.filter((p) => p.category === "basic"),
);
const texturePatterns = computed(() =>
  allPatternList.filter((p) => p.category === "texture"),
);

function handleColorClick(color: string) {
  emit("update-color", color);
}

function handlePatternClick(pattern: PatternType) {
  emit("update-pattern", pattern);
}

function handleDelete() {
  emit("delete");
}
</script>

<template>
  <div class="properties-panel">
    <!-- Header with delete button -->
    <div class="panel-header">
      <span class="panel-title">Properties</span>
      <button class="delete-btn" @click="handleDelete" title="Delete shape">
        🗑️
      </button>
    </div>

    <!-- Color Section -->
    <div class="section">
      <div class="section-title">Color</div>
      <div class="color-grid">
        <button
          v-for="color in colorPalette"
          :key="color"
          class="color-swatch"
          :class="{ selected: shape.fill === color }"
          :style="{ backgroundColor: color }"
          @click="handleColorClick(color)"
          :title="color"
        />
      </div>
    </div>

    <!-- Pattern Section -->
    <div class="section">
      <div class="section-title">Pattern</div>

      <!-- Basic Patterns -->
      <div class="pattern-group">
        <div class="group-label">Basic</div>
        <div class="pattern-grid">
          <button
            v-for="pattern in basicPatterns"
            :key="pattern.type"
            class="pattern-btn"
            :class="{ selected: shape.pattern === pattern.type }"
            @click="handlePatternClick(pattern.type)"
            :title="pattern.name"
          >
            {{ pattern.preview }}
          </button>
        </div>
      </div>

      <!-- Texture Patterns -->
      <div class="pattern-group">
        <div class="group-label">Textures</div>
        <div class="pattern-grid">
          <button
            v-for="pattern in texturePatterns"
            :key="pattern.type"
            class="pattern-btn"
            :class="{ selected: shape.pattern === pattern.type }"
            @click="handlePatternClick(pattern.type)"
            :title="pattern.name"
          >
            {{ pattern.preview }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  position: absolute;
  top: 60px;
  right: 10px;
  width: 260px;
  max-height: calc(100% - 180px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  z-index: 100;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.delete-btn {
  background: #fee;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #fcc;
}

.section {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition:
    transform 0.15s,
    border-color 0.15s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.selected {
  border-color: #333;
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px #333;
}

.pattern-group {
  margin-bottom: 10px;
}

.pattern-group:last-child {
  margin-bottom: 0;
}

.group-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.pattern-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.15s,
    border-color 0.15s;
}

.pattern-btn:hover {
  transform: scale(1.1);
  border-color: #aaa;
}

.pattern-btn.selected {
  border-color: #4a90d9;
  background: #e8f4fd;
}
</style>
