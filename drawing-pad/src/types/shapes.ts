/**
 * Shape Types and Interfaces for the Shape Editor
 */

// Available shape types
export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'hexagon'
  | 'diamond'
  | 'cloud'
  | 'arrow'
  | 'speechBubble';

// Basic pattern types
export type BasicPatternType =
  | 'solid'
  | 'stripes-h'
  | 'stripes-v'
  | 'stripes-d'
  | 'dots'
  | 'checkerboard'
  | 'crosshatch';

// Texture pattern types
export type TexturePatternType =
  | 'metallic'
  | 'paper'
  | 'watercolor'
  | 'chalk'
  | 'wood'
  | 'marble'
  | 'fabric'
  | 'glitter'
  | 'foil'
  | 'concrete';

// Combined pattern type
export type PatternType = BasicPatternType | TexturePatternType;

// Pattern category for UI grouping
export type PatternCategory = 'basic' | 'texture';

// Shape instance on the canvas
export interface Shape {
  id: string;
  type: ShapeType;
  x: number;           // Center X position
  y: number;           // Center Y position
  width: number;       // Bounding box width
  height: number;      // Bounding box height
  rotation: number;    // Rotation in degrees (0-360)
  fill: string;        // Base color (hex)
  pattern: PatternType;
  zIndex: number;      // Layer order
}

// Shape definition for the palette
export interface ShapeDefinition {
  type: ShapeType;
  name: string;
  icon: string;        // Emoji or icon identifier
  // SVG path data or render function
  path?: string;       // For path-based shapes
  // Some shapes use native SVG elements (rect, circle, ellipse)
  element?: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path';
  // For polygon shapes
  points?: string;
  // Default aspect ratio (width/height)
  aspectRatio?: number;
  // Whether to maintain aspect ratio on resize
  lockAspectRatio?: boolean;
}

// Pattern definition
export interface PatternDefinition {
  type: PatternType;
  name: string;
  category: PatternCategory;
  // Preview thumbnail (small SVG or emoji)
  preview: string;
  // Whether this pattern uses SVG filters
  usesFilter?: boolean;
  // Associated filter ID (for texture patterns)
  filterId?: string;
}

// History state for undo/redo
export interface HistoryState {
  shapes: Shape[];
  timestamp: number;
}

// Editor state
export interface EditorState {
  shapes: Shape[];
  selectedShapeId: string | null;
  history: HistoryState[];
  historyIndex: number;
}

// Transform handle types
export type HandleType =
  | 'nw' | 'n' | 'ne'  // Top handles
  | 'w' | 'e'          // Side handles
  | 'sw' | 's' | 'se'  // Bottom handles
  | 'rotate';          // Rotation handle

// Drag state for shape manipulation
export interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize' | 'rotate' | null;
  handle?: HandleType;
  startX: number;
  startY: number;
  startShapeX: number;
  startShapeY: number;
  startWidth: number;
  startHeight: number;
  startRotation: number;
}

// Default values
export const DEFAULT_SHAPE_SIZE = 100;
export const DEFAULT_FILL_COLOR = '#4A90D9';
export const DEFAULT_PATTERN: PatternType = 'solid';
export const MIN_SHAPE_SIZE = 20;
export const MAX_SHAPE_SIZE = 500;

// Generate unique ID for shapes
export function generateShapeId(): string {
  return `shape-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Create a new shape with defaults
export function createShape(
  type: ShapeType,
  x: number,
  y: number,
  zIndex: number,
  overrides?: Partial<Shape>
): Shape {
  return {
    id: generateShapeId(),
    type,
    x,
    y,
    width: DEFAULT_SHAPE_SIZE,
    height: DEFAULT_SHAPE_SIZE,
    rotation: 0,
    fill: DEFAULT_FILL_COLOR,
    pattern: DEFAULT_PATTERN,
    zIndex,
    ...overrides,
  };
}

