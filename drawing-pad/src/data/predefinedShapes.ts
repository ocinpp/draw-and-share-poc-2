/**
 * Predefined Shape Definitions
 * Contains SVG path data and metadata for all available shapes
 */

import type { ShapeDefinition, ShapeType } from '../types/shapes';

// SVG viewBox is 0 0 100 100 for all shapes
// Paths are designed to fit within this viewBox

export const shapeDefinitions: Record<ShapeType, ShapeDefinition> = {
  rectangle: {
    type: 'rectangle',
    name: 'Rectangle',
    icon: '⬛',
    element: 'rect',
    aspectRatio: 1,
    lockAspectRatio: false,
  },

  circle: {
    type: 'circle',
    name: 'Circle',
    icon: '⚪',
    element: 'ellipse',
    aspectRatio: 1,
    lockAspectRatio: true,
  },

  triangle: {
    type: 'triangle',
    name: 'Triangle',
    icon: '▲',
    element: 'polygon',
    points: '50,5 95,95 5,95',
    aspectRatio: 1,
    lockAspectRatio: false,
  },

  star: {
    type: 'star',
    name: 'Star',
    icon: '⭐',
    element: 'path',
    // 5-pointed star
    path: 'M50,5 L61,40 L98,40 L68,62 L79,97 L50,75 L21,97 L32,62 L2,40 L39,40 Z',
    aspectRatio: 1,
    lockAspectRatio: true,
  },

  heart: {
    type: 'heart',
    name: 'Heart',
    icon: '❤️',
    element: 'path',
    // Heart shape using bezier curves
    path: 'M50,88 C20,55 5,35 5,25 C5,10 20,5 35,5 C42,5 50,12 50,20 C50,12 58,5 65,5 C80,5 95,10 95,25 C95,35 80,55 50,88 Z',
    aspectRatio: 1,
    lockAspectRatio: true,
  },

  hexagon: {
    type: 'hexagon',
    name: 'Hexagon',
    icon: '⬡',
    element: 'polygon',
    // Regular hexagon
    points: '50,3 93,25 93,75 50,97 7,75 7,25',
    aspectRatio: 0.866, // sqrt(3)/2 for regular hexagon
    lockAspectRatio: true,
  },

  diamond: {
    type: 'diamond',
    name: 'Diamond',
    icon: '💎',
    element: 'polygon',
    points: '50,5 95,50 50,95 5,50',
    aspectRatio: 1,
    lockAspectRatio: false,
  },

  cloud: {
    type: 'cloud',
    name: 'Cloud',
    icon: '☁️',
    element: 'path',
    // Fluffy cloud shape
    path: 'M25,60 C10,60 5,50 10,40 C5,30 15,20 30,25 C35,10 55,10 65,20 C75,10 95,15 95,35 C100,45 95,55 80,55 C85,65 70,70 60,65 C50,75 30,70 25,60 Z',
    aspectRatio: 1.5,
    lockAspectRatio: false,
  },

  arrow: {
    type: 'arrow',
    name: 'Arrow',
    icon: '➡️',
    element: 'path',
    // Right-pointing arrow
    path: 'M5,40 L60,40 L60,20 L95,50 L60,80 L60,60 L5,60 Z',
    aspectRatio: 1.5,
    lockAspectRatio: false,
  },

  speechBubble: {
    type: 'speechBubble',
    name: 'Speech Bubble',
    icon: '💬',
    element: 'path',
    // Rounded speech bubble with tail
    path: 'M10,10 L90,10 Q95,10 95,15 L95,55 Q95,60 90,60 L35,60 L20,80 L25,60 L10,60 Q5,60 5,55 L5,15 Q5,10 10,10 Z',
    aspectRatio: 1.2,
    lockAspectRatio: false,
  },
};

// Get all shape definitions as an array (for palette)
export const shapeList: ShapeDefinition[] = Object.values(shapeDefinitions);

// Get shape definition by type
export function getShapeDefinition(type: ShapeType): ShapeDefinition {
  return shapeDefinitions[type];
}

// Render shape SVG path/element based on definition
export function getShapeSvgContent(
  definition: ShapeDefinition,
  fill: string,
  patternId?: string
): string {
  const fillValue = patternId ? `url(#${patternId})` : fill;
  
  switch (definition.element) {
    case 'rect':
      return `<rect x="5" y="5" width="90" height="90" fill="${fillValue}" />`;
    
    case 'ellipse':
      return `<ellipse cx="50" cy="50" rx="45" ry="45" fill="${fillValue}" />`;
    
    case 'polygon':
      return `<polygon points="${definition.points}" fill="${fillValue}" />`;
    
    case 'path':
      return `<path d="${definition.path}" fill="${fillValue}" />`;
    
    default:
      return `<rect x="5" y="5" width="90" height="90" fill="${fillValue}" />`;
  }
}

