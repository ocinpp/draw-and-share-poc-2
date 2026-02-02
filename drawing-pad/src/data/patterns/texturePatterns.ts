/**
 * Texture Pattern Definitions
 * Special patterns that use SVG filters for realistic texture effects
 */

import type { PatternDefinition, TexturePatternType } from '../../types/shapes';

// Texture pattern metadata for UI
export const texturePatternDefinitions: Record<TexturePatternType, PatternDefinition> = {
  metallic: {
    type: 'metallic',
    name: 'Metallic',
    category: 'texture',
    preview: '🔩',
    usesFilter: true,
    filterId: 'metallic',
  },

  paper: {
    type: 'paper',
    name: 'Paper / Kraft',
    category: 'texture',
    preview: '📄',
    usesFilter: true,
    filterId: 'paper',
  },

  watercolor: {
    type: 'watercolor',
    name: 'Watercolor',
    category: 'texture',
    preview: '🎨',
    usesFilter: true,
    filterId: 'watercolor',
  },

  chalk: {
    type: 'chalk',
    name: 'Chalk / Crayon',
    category: 'texture',
    preview: '🖍️',
    usesFilter: true,
    filterId: 'chalk',
  },

  wood: {
    type: 'wood',
    name: 'Wood Grain',
    category: 'texture',
    preview: '🌲',
    usesFilter: true,
    filterId: 'wood',
  },

  marble: {
    type: 'marble',
    name: 'Marble',
    category: 'texture',
    preview: '💎',
    usesFilter: true,
    filterId: 'marble',
  },

  fabric: {
    type: 'fabric',
    name: 'Fabric / Linen',
    category: 'texture',
    preview: '👕',
    usesFilter: true,
    filterId: 'fabric',
  },

  glitter: {
    type: 'glitter',
    name: 'Glitter / Sparkle',
    category: 'texture',
    preview: '✨',
    usesFilter: true,
    filterId: 'glitter',
  },

  foil: {
    type: 'foil',
    name: 'Holographic Foil',
    category: 'texture',
    preview: '🌈',
    usesFilter: true,
    filterId: 'foil',
  },

  concrete: {
    type: 'concrete',
    name: 'Concrete / Stone',
    category: 'texture',
    preview: '🧱',
    usesFilter: true,
    filterId: 'concrete',
  },
};

// Get list of texture patterns
export const texturePatternList = Object.values(texturePatternDefinitions);

// Check if a pattern type is a texture pattern
export function isTexturePattern(type: string): type is TexturePatternType {
  return type in texturePatternDefinitions;
}

// Get texture pattern definition
export function getTexturePatternDefinition(type: TexturePatternType): PatternDefinition {
  return texturePatternDefinitions[type];
}

