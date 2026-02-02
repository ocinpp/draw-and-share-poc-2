/**
 * SVG Filter Definitions for Texture Effects
 * These filters create special visual effects like metallic, paper, watercolor, etc.
 */

import type { TexturePatternType } from '../types/shapes';

export interface SvgFilterDefinition {
  id: string;
  type: TexturePatternType;
  filter: string; // SVG filter content
}

// Generate unique filter IDs
export function getFilterId(type: TexturePatternType, shapeId: string): string {
  return `filter-${type}-${shapeId}`;
}

// SVG filter definitions for each texture type
export const svgFilters: Record<TexturePatternType, (baseColor: string) => string> = {
  metallic: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur"/>
      <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" 
                          specularExponent="20" lighting-color="#ffffff" result="specular">
        <fePointLight x="-5000" y="-10000" z="20000"/>
      </feSpecularLighting>
      <feComposite in="specular" in2="SourceGraphic" operator="in" result="specular2"/>
      <feComposite in="SourceGraphic" in2="specular2" operator="arithmetic" 
                   k1="0" k2="1" k3="1" k4="0"/>
    </filter>
  `,

  paper: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${baseColor}" surfaceScale="2" result="light">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
      <feBlend in="SourceGraphic" in2="light" mode="multiply"/>
    </filter>
  `,

  watercolor: (baseColor: string) => `
    <filter id="FILTER_ID" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" 
                         xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="1.5" result="blur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.85"/>
      </feComponentTransfer>
    </filter>
  `,

  chalk: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="4" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" 
                         xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feComponentTransfer in="displaced">
        <feFuncA type="discrete" tableValues="0 0.3 0.6 0.8 1"/>
      </feComponentTransfer>
    </filter>
  `,

  wood: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.15" numOctaves="2" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="gray"/>
      <feBlend in="SourceGraphic" in2="gray" mode="overlay"/>
    </filter>
  `,

  marble: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" 
                         xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="0.5"/>
    </filter>
  `,

  fabric: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.15 0.15" numOctaves="2" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${baseColor}" surfaceScale="1" result="light">
        <feDistantLight azimuth="135" elevation="50"/>
      </feDiffuseLighting>
      <feBlend in="SourceGraphic" in2="light" mode="multiply"/>
    </filter>
  `,

  glitter: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" result="noise"/>
      <feComponentTransfer in="noise" result="spots">
        <feFuncR type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1"/>
        <feFuncG type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1"/>
        <feFuncB type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1"/>
      </feComponentTransfer>
      <feComposite in="spots" in2="SourceGraphic" operator="in" result="glitter"/>
      <feBlend in="SourceGraphic" in2="glitter" mode="screen"/>
    </filter>
  `,

  foil: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise"/>
      <feColorMatrix in="noise" type="hueRotate" values="0" result="hue">
        <animate attributeName="values" from="0" to="360" dur="10s" repeatCount="indefinite"/>
      </feColorMatrix>
      <feBlend in="SourceGraphic" in2="hue" mode="overlay"/>
      <feSpecularLighting surfaceScale="3" specularConstant="1" specularExponent="30" 
                          lighting-color="#ffffff" result="specular">
        <fePointLight x="-5000" y="-5000" z="10000"/>
      </feSpecularLighting>
      <feComposite in="specular" in2="SourceGraphic" operator="in" result="spec2"/>
      <feBlend in="SourceGraphic" in2="spec2" mode="screen"/>
    </filter>
  `,

  concrete: (baseColor: string) => `
    <filter id="FILTER_ID" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="4" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="gray"/>
      <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="blend"/>
      <feComponentTransfer in="blend">
        <feFuncR type="linear" slope="0.9" intercept="0.05"/>
        <feFuncG type="linear" slope="0.9" intercept="0.05"/>
        <feFuncB type="linear" slope="0.9" intercept="0.05"/>
      </feComponentTransfer>
    </filter>
  `,
};

// Generate filter SVG string with proper ID
export function generateFilterSvg(
  type: TexturePatternType,
  filterId: string,
  baseColor: string
): string {
  const filterTemplate = svgFilters[type](baseColor);
  return filterTemplate.replace(/FILTER_ID/g, filterId);
}

// Get all filter types
export const textureFilterTypes: TexturePatternType[] = Object.keys(svgFilters) as TexturePatternType[];

