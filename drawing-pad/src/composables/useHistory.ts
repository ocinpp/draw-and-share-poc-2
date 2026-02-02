/**
 * History Composable
 * Manages undo/redo state for shape operations
 */

import { ref, computed } from "vue";
import type { Shape, HistoryState } from "../types/shapes";

// Maximum number of history states to keep
const MAX_HISTORY_SIZE = 50;

// Singleton state (shared across components)
const history = ref<HistoryState[]>([]);
const historyIndex = ref(-1);

// Debounce timer for batching rapid changes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

export function useHistory() {
  // Computed properties
  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);
  const currentState = computed(() => {
    if (historyIndex.value >= 0 && historyIndex.value < history.value.length) {
      return history.value[historyIndex.value];
    }
    return null;
  });

  // Deep clone shapes to avoid reference issues
  function cloneShapes(shapes: Shape[]): Shape[] {
    return JSON.parse(JSON.stringify(shapes));
  }

  // Save current state to history (with debouncing for rapid changes)
  function saveState(shapes: Shape[], immediate = false): void {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    const doSave = () => {
      // Remove any future states if we're not at the end
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1);
      }

      // Add new state
      const newState: HistoryState = {
        shapes: cloneShapes(shapes),
        timestamp: Date.now(),
      };

      history.value.push(newState);
      historyIndex.value = history.value.length - 1;

      // Trim history if it exceeds max size
      if (history.value.length > MAX_HISTORY_SIZE) {
        history.value = history.value.slice(-MAX_HISTORY_SIZE);
        historyIndex.value = history.value.length - 1;
      }
    };

    if (immediate) {
      doSave();
    } else {
      saveTimeout = setTimeout(doSave, DEBOUNCE_MS);
    }
  }

  // Undo to previous state
  function undo(): Shape[] | null {
    if (!canUndo.value) return null;

    historyIndex.value--;
    const state = history.value[historyIndex.value];
    return cloneShapes(state.shapes);
  }

  // Redo to next state
  function redo(): Shape[] | null {
    if (!canRedo.value) return null;

    historyIndex.value++;
    const state = history.value[historyIndex.value];
    return cloneShapes(state.shapes);
  }

  // Clear all history
  function clearHistory(): void {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    history.value = [];
    historyIndex.value = -1;
  }

  // Initialize history with initial state
  function initHistory(shapes: Shape[]): void {
    clearHistory();
    saveState(shapes, true);
  }

  // Get history info for debugging
  function getHistoryInfo(): { length: number; index: number } {
    return {
      length: history.value.length,
      index: historyIndex.value,
    };
  }

  return {
    // State
    canUndo,
    canRedo,
    currentState,

    // Actions
    saveState,
    undo,
    redo,
    clearHistory,
    initHistory,
    getHistoryInfo,
  };
}

