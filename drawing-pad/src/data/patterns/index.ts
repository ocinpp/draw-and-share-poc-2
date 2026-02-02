/**
 * Pattern Registry
 * Combines all pattern definitions and provides unified access
 */

import type { PatternDefinition, PatternType, PatternCategory } from '../../types/shapes';
import { basicPatternDefinitions, basicPatternList, generateBasicPatternSvg } from './basicPatterns';
import { texturePatternDefinitions, texturePatternList, isTexturePattern } from './texturePatterns';
import { generateFilterSvg, getFilterId } from '../svgFilters';

// Combined pattern definitions
export const allPatternDefinitions: Record<PatternType, PatternDefinition> = {
  ...basicPatternDefinitions,
  ...texturePatternDefinitions,
};

// All patterns as array (for UI)
export const allPatternList: PatternDefinition[] = [
  ...basicPatternList,
  ...texturePatternList,
];

// Get patterns by category
export function getPatternsByCategory(category: PatternCategory): PatternDefinition[] {
  return allPatternList.filter(p => p.category === category);
}

// Get pattern definition by type
export function getPatternDefinition(type: PatternType): PatternDefinition {
  return allPatternDefinitions[type];
}

// Check if pattern uses SVG filter
export function patternUsesFilter(type: PatternType): boolean {
  return allPatternDefinitions[type]?.usesFilter ?? false;
}

// Generate SVG defs content for a shape's pattern
export function generatePatternDefs(
  patternType: PatternType,
  shapeId: string,
  baseColor: string
): { defs: string; fillReference: string } {
  const patternId = `pattern-${patternType}-${shapeId}`;
  
  if (isTexturePattern(patternType)) {
    // Texture patterns use filters
    const filterId = getFilterId(patternType, shapeId);
    const filterSvg = generateFilterSvg(patternType, filterId, baseColor);
    
    return {
      defs: filterSvg,
      fillReference: baseColor, // Fill with base color, filter applied separately
    };
  } else {
    // Basic patterns use pattern elements
    const patternSvg = generateBasicPatternSvg(patternType, patternId, baseColor);
    
    return {
      defs: patternSvg,
      fillReference: `url(#${patternId})`,
    };
  }
}

// Get filter ID for a shape (if using texture pattern)
export function getShapeFilterId(patternType: PatternType, shapeId: string): string | null {
  if (isTexturePattern(patternType)) {
    return getFilterId(patternType, shapeId);
  }
  return null;
}

// Color palette for quick selection
export const colorPalette: string[] = [
  // Row 1: Reds & Pinks
  '#FF6B6B', '#FF8E8E', '#FFB3B3', '#FF69B4', '#FF1493',
  // Row 2: Oranges & Yellows
  '#FFA500', '#FFD700', '#FFEB3B', '#FFF176', '#FFEE58',
  // Row 3: Greens
  '#4CAF50', '#8BC34A', '#CDDC39', '#00E676', '#69F0AE',
  // Row 4: Blues & Cyans
  '#2196F3', '#03A9F4', '#00BCD4', '#4DD0E1', '#80DEEA',
  // Row 5: Purples & Violets
  '#9C27B0', '#E040FB', '#7C4DFF', '#B388FF', '#EA80FC',
  // Row 6: Neutrals
  '#795548', '#9E9E9E', '#607D8B', '#37474F', '#263238',
  // Row 7: Black & White
  '#000000', '#424242', '#757575', '#BDBDBD', '#FFFFFF',
];

// Default colors for new shapes (rotating through these)
export const defaultShapeColors: string[] = [
  '#4A90D9', // Blue
  '#E74C3C', // Red
  '#2ECC71', // Green
  '#F39C12', // Orange
  '#9B59B6', // Purple
  '#1ABC9C', // Teal
  '#E91E63', // Pink
  '#00BCD4', // Cyan
];

// Get next default color (cycles through palette)
let colorIndex = 0;
export function getNextDefaultColor(): string {
  const color = defaultShapeColors[colorIndex % defaultShapeColors.length];
  colorIndex++;
  return color;
}

// Reset color index (e.g., when clearing canvas)
export function resetColorIndex(): void {
  colorIndex = 0;
}

// Re-export for convenience
export { basicPatternDefinitions, texturePatternDefinitions };
export { isTexturePattern } from './texturePatterns';
export { generateBasicPatternSvg } from './basicPatterns';
export { generateFilterSvg, getFilterId } from '../svgFilters';

