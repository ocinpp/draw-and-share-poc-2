/**
 * Basic Pattern Definitions
 * Simple geometric patterns using SVG pattern elements
 */

import type { PatternDefinition, BasicPatternType } from '../../types/shapes';

// Pattern size (used for tiling)
const PATTERN_SIZE = 20;

export interface BasicPatternSvg {
  type: BasicPatternType;
  width: number;
  height: number;
  content: string; // SVG content inside the pattern
}

// SVG pattern definitions
export const basicPatternSvgs: Record<BasicPatternType, BasicPatternSvg> = {
  solid: {
    type: 'solid',
    width: 10,
    height: 10,
    content: '<rect width="10" height="10" fill="currentColor"/>',
  },

  'stripes-h': {
    type: 'stripes-h',
    width: PATTERN_SIZE,
    height: PATTERN_SIZE,
    content: `
      <rect width="${PATTERN_SIZE}" height="${PATTERN_SIZE}" fill="currentColor"/>
      <rect width="${PATTERN_SIZE}" height="${PATTERN_SIZE / 2}" fill="rgba(255,255,255,0.3)"/>
    `,
  },

  'stripes-v': {
    type: 'stripes-v',
    width: PATTERN_SIZE,
    height: PATTERN_SIZE,
    content: `
      <rect width="${PATTERN_SIZE}" height="${PATTERN_SIZE}" fill="currentColor"/>
      <rect width="${PATTERN_SIZE / 2}" height="${PATTERN_SIZE}" fill="rgba(255,255,255,0.3)"/>
    `,
  },

  'stripes-d': {
    type: 'stripes-d',
    width: PATTERN_SIZE,
    height: PATTERN_SIZE,
    content: `
      <rect width="${PATTERN_SIZE}" height="${PATTERN_SIZE}" fill="currentColor"/>
      <path d="M0,0 L${PATTERN_SIZE},${PATTERN_SIZE} M-${PATTERN_SIZE / 4},${PATTERN_SIZE * 0.75} L${PATTERN_SIZE / 4},${PATTERN_SIZE * 1.25} M${PATTERN_SIZE * 0.75},-${PATTERN_SIZE / 4} L${PATTERN_SIZE * 1.25},${PATTERN_SIZE / 4}"
            stroke="rgba(255,255,255,0.3)" stroke-width="6" fill="none"/>
    `,
  },

  dots: {
    type: 'dots',
    width: PATTERN_SIZE,
    height: PATTERN_SIZE,
    content: `
      <rect width="${PATTERN_SIZE}" height="${PATTERN_SIZE}" fill="currentColor"/>
      <circle cx="${PATTERN_SIZE / 2}" cy="${PATTERN_SIZE / 2}" r="${PATTERN_SIZE / 5}" fill="rgba(255,255,255,0.4)"/>
    `,
  },

  checkerboard: {
    type: 'checkerboard',
    width: PATTERN_SIZE,
    height: PATTERN_SIZE,
    content: `
      <rect width="${PATTERN_SIZE}" height="${PATTERN_SIZE}" fill="currentColor"/>
      <rect width="${PATTERN_SIZE / 2}" height="${PATTERN_SIZE / 2}" fill="rgba(255,255,255,0.3)"/>
      <rect x="${PATTERN_SIZE / 2}" y="${PATTERN_SIZE / 2}" width="${PATTERN_SIZE / 2}" height="${PATTERN_SIZE / 2}" fill="rgba(255,255,255,0.3)"/>
    `,
  },

  crosshatch: {
    type: 'crosshatch',
    width: PATTERN_SIZE,
    height: PATTERN_SIZE,
    content: `
      <rect width="${PATTERN_SIZE}" height="${PATTERN_SIZE}" fill="currentColor"/>
      <path d="M0,0 L${PATTERN_SIZE},${PATTERN_SIZE} M${PATTERN_SIZE},0 L0,${PATTERN_SIZE}"
            stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none"/>
    `,
  },
};

// Pattern metadata for UI
export const basicPatternDefinitions: Record<BasicPatternType, PatternDefinition> = {
  solid: {
    type: 'solid',
    name: 'Solid',
    category: 'basic',
    preview: '⬛',
  },
  'stripes-h': {
    type: 'stripes-h',
    name: 'Horizontal Stripes',
    category: 'basic',
    preview: '🟰',
  },
  'stripes-v': {
    type: 'stripes-v',
    name: 'Vertical Stripes',
    category: 'basic',
    preview: '📊',
  },
  'stripes-d': {
    type: 'stripes-d',
    name: 'Diagonal Stripes',
    category: 'basic',
    preview: '📐',
  },
  dots: {
    type: 'dots',
    name: 'Polka Dots',
    category: 'basic',
    preview: '🔘',
  },
  checkerboard: {
    type: 'checkerboard',
    name: 'Checkerboard',
    category: 'basic',
    preview: '🏁',
  },
  crosshatch: {
    type: 'crosshatch',
    name: 'Crosshatch',
    category: 'basic',
    preview: '❌',
  },
};

// Generate SVG pattern element string
export function generateBasicPatternSvg(
  patternType: BasicPatternType,
  patternId: string,
  baseColor: string
): string {
  const pattern = basicPatternSvgs[patternType];

  // Replace currentColor with actual color
  const coloredContent = pattern.content.replace(/currentColor/g, baseColor);

  return `
    <pattern id="${patternId}" patternUnits="userSpaceOnUse"
             width="${pattern.width}" height="${pattern.height}">
      ${coloredContent}
    </pattern>
  `;
}

// Get list of basic patterns
export const basicPatternList = Object.values(basicPatternDefinitions);

