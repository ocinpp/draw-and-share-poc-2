/**
 * Shape Editor Composable
 * Manages shape state, selection, and operations
 */

import { ref, computed } from 'vue';
import type { Shape, ShapeType, HandleType } from '../types/shapes';
import { createShape, generateShapeId, MIN_SHAPE_SIZE, MAX_SHAPE_SIZE } from '../types/shapes';
import { getNextDefaultColor, resetColorIndex } from '../data/patterns';
import { getShapeDefinition } from '../data/predefinedShapes';
import { useHistory } from './useHistory';

// Singleton state (shared across components)
const shapes = ref<Shape[]>([]);
const selectedShapeId = ref<string | null>(null);

// History management
const {
  canUndo,
  canRedo,
  saveState,
  undo: historyUndo,
  redo: historyRedo,
  clearHistory,
  initHistory,
} = useHistory();

export function useShapeEditor() {
  // Computed
  const selectedShape = computed(() => {
    if (!selectedShapeId.value) return null;
    return shapes.value.find(s => s.id === selectedShapeId.value) ?? null;
  });

  const hasShapes = computed(() => shapes.value.length > 0);

  const sortedShapes = computed(() => {
    return [...shapes.value].sort((a, b) => a.zIndex - b.zIndex);
  });

  // Get next z-index
  function getNextZIndex(): number {
    if (shapes.value.length === 0) return 1;
    return Math.max(...shapes.value.map(s => s.zIndex)) + 1;
  }

  // Add a new shape
  function addShape(type: ShapeType, x: number, y: number): Shape {
    const shape = createShape(type, x, y, getNextZIndex(), {
      fill: getNextDefaultColor(),
    });
    shapes.value.push(shape);
    selectedShapeId.value = shape.id;
    saveState(shapes.value, true); // Save immediately for discrete actions
    return shape;
  }

  // Remove a shape
  function removeShape(id: string): void {
    const index = shapes.value.findIndex(s => s.id === id);
    if (index !== -1) {
      shapes.value.splice(index, 1);
      if (selectedShapeId.value === id) {
        selectedShapeId.value = null;
      }
      saveState(shapes.value, true); // Save immediately for discrete actions
    }
  }

  // Update a shape (with optional history save)
  function updateShape(id: string, updates: Partial<Shape>, saveToHistory = false): void {
    const shape = shapes.value.find(s => s.id === id);
    if (shape) {
      Object.assign(shape, updates);
      if (saveToHistory) {
        saveState(shapes.value);
      }
    }
  }

  // Select a shape
  function selectShape(id: string | null): void {
    selectedShapeId.value = id;

    // Bring selected shape to front
    if (id) {
      const shape = shapes.value.find(s => s.id === id);
      if (shape) {
        shape.zIndex = getNextZIndex();
      }
    }
  }

  // Deselect current shape
  function deselectShape(): void {
    selectedShapeId.value = null;
  }

  // Clear all shapes
  function clearShapes(): void {
    shapes.value = [];
    selectedShapeId.value = null;
    resetColorIndex();
    clearHistory();
  }

  // Delete selected shape
  function deleteSelectedShape(): void {
    if (selectedShapeId.value) {
      removeShape(selectedShapeId.value);
    }
  }

  // Undo last action
  function undo(): void {
    const previousShapes = historyUndo();
    if (previousShapes) {
      shapes.value = previousShapes;
      // Clear selection if the selected shape no longer exists
      if (selectedShapeId.value && !shapes.value.find(s => s.id === selectedShapeId.value)) {
        selectedShapeId.value = null;
      }
    }
  }

  // Redo last undone action
  function redo(): void {
    const nextShapes = historyRedo();
    if (nextShapes) {
      shapes.value = nextShapes;
      // Clear selection if the selected shape no longer exists
      if (selectedShapeId.value && !shapes.value.find(s => s.id === selectedShapeId.value)) {
        selectedShapeId.value = null;
      }
    }
  }

  // Save current state to history (for end of drag operations)
  function commitToHistory(): void {
    saveState(shapes.value, true);
  }

  // Move shape position
  function moveShape(id: string, x: number, y: number): void {
    updateShape(id, { x, y });
  }

  // Resize shape with constraints
  function resizeShape(id: string, width: number, height: number): void {
    // Clamp to min/max size
    const clampedWidth = Math.max(MIN_SHAPE_SIZE, Math.min(MAX_SHAPE_SIZE, width));
    const clampedHeight = Math.max(MIN_SHAPE_SIZE, Math.min(MAX_SHAPE_SIZE, height));
    updateShape(id, { width: clampedWidth, height: clampedHeight });
  }

  // Resize shape from a specific handle with aspect ratio support
  function resizeShapeFromHandle(
    id: string,
    handle: HandleType,
    deltaX: number,
    deltaY: number,
    startWidth: number,
    startHeight: number,
    startX: number,
    startY: number
  ): void {
    const shape = shapes.value.find(s => s.id === id);
    if (!shape) return;

    const definition = getShapeDefinition(shape.type);
    const lockAspect = definition.lockAspectRatio ?? false;
    const aspectRatio = startWidth / startHeight;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startX;
    let newY = startY;

    // Calculate new dimensions based on handle
    switch (handle) {
      case 'se': // Bottom-right
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'sw': // Bottom-left
        newWidth = startWidth - deltaX;
        newHeight = startHeight + deltaY;
        newX = startX + deltaX / 2;
        break;
      case 'ne': // Top-right
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
        newY = startY + deltaY / 2;
        break;
      case 'nw': // Top-left
        newWidth = startWidth - deltaX;
        newHeight = startHeight - deltaY;
        newX = startX + deltaX / 2;
        newY = startY + deltaY / 2;
        break;
      case 'e': // Right
        newWidth = startWidth + deltaX;
        break;
      case 'w': // Left
        newWidth = startWidth - deltaX;
        newX = startX + deltaX / 2;
        break;
      case 's': // Bottom
        newHeight = startHeight + deltaY;
        break;
      case 'n': // Top
        newHeight = startHeight - deltaY;
        newY = startY + deltaY / 2;
        break;
    }

    // Apply aspect ratio lock if needed
    if (lockAspect) {
      // For corner handles, use the larger dimension change
      if (['nw', 'ne', 'sw', 'se'].includes(handle)) {
        const widthChange = Math.abs(newWidth - startWidth);
        const heightChange = Math.abs(newHeight - startHeight);

        if (widthChange > heightChange) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      } else if (['e', 'w'].includes(handle)) {
        // Horizontal handles: adjust height
        newHeight = newWidth / aspectRatio;
      } else if (['n', 's'].includes(handle)) {
        // Vertical handles: adjust width
        newWidth = newHeight * aspectRatio;
      }
    }

    // Clamp dimensions
    newWidth = Math.max(MIN_SHAPE_SIZE, Math.min(MAX_SHAPE_SIZE, newWidth));
    newHeight = Math.max(MIN_SHAPE_SIZE, Math.min(MAX_SHAPE_SIZE, newHeight));

    // Update shape
    updateShape(id, {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
    });
  }

  // Rotate shape
  function rotateShape(id: string, rotation: number): void {
    // Normalize rotation to 0-360
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    updateShape(id, { rotation: normalizedRotation });
  }

  // Change shape color
  function setShapeColor(id: string, fill: string): void {
    updateShape(id, { fill }, true); // Save to history
  }

  // Change shape pattern
  function setShapePattern(id: string, pattern: Shape['pattern']): void {
    updateShape(id, { pattern }, true); // Save to history
  }

  // Get all shapes (for export)
  function getShapes(): Shape[] {
    return [...shapes.value];
  }

  // Duplicate a shape
  function duplicateShape(id: string): Shape | null {
    const original = shapes.value.find(s => s.id === id);
    if (!original) return null;

    const duplicate: Shape = {
      ...original,
      id: generateShapeId(),
      x: original.x + 20,
      y: original.y + 20,
      zIndex: getNextZIndex(),
    };

    shapes.value.push(duplicate);
    selectedShapeId.value = duplicate.id;
    return duplicate;
  }

  return {
    // State
    shapes,
    selectedShapeId,
    selectedShape,
    hasShapes,
    sortedShapes,
    canUndo,
    canRedo,

    // Actions
    addShape,
    removeShape,
    updateShape,
    selectShape,
    deselectShape,
    clearShapes,
    deleteSelectedShape,
    moveShape,
    resizeShape,
    resizeShapeFromHandle,
    rotateShape,
    setShapeColor,
    setShapePattern,
    getShapes,
    duplicateShape,
    undo,
    redo,
    commitToHistory,
  };
}

