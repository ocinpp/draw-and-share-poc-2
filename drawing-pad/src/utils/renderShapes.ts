/**
 * Shape Rendering Utility
 * Renders shapes to a canvas element for export as PNG
 */

import type { Shape } from "../types/shapes";
import { getShapeDefinition } from "../data/predefinedShapes";
import { generatePatternDefs, getShapeFilterId } from "../data/patterns";

/**
 * Generate complete SVG string for a single shape
 */
function generateShapeSvg(shape: Shape): string {
  const definition = getShapeDefinition(shape.type);
  const patternDefs = generatePatternDefs(shape.pattern, shape.id, shape.fill);
  const filterId = getShapeFilterId(shape.pattern, shape.id);

  // Determine fill value
  const fillValue =
    shape.pattern === "solid" ? shape.fill : patternDefs.fillReference;

  // Filter attribute for texture patterns (applied to shape element, not SVG)
  const filterAttr = filterId ? `filter="url(#${filterId})"` : "";

  // Generate shape element based on type
  let shapeElement: string;
  switch (definition.element) {
    case "rect":
      shapeElement = `<rect x="5" y="5" width="90" height="90" fill="${fillValue}" ${filterAttr} />`;
      break;
    case "ellipse":
      shapeElement = `<ellipse cx="50" cy="50" rx="45" ry="45" fill="${fillValue}" ${filterAttr} />`;
      break;
    case "polygon":
      shapeElement = `<polygon points="${definition.points}" fill="${fillValue}" ${filterAttr} />`;
      break;
    case "path":
      shapeElement = `<path d="${definition.path}" fill="${fillValue}" ${filterAttr} />`;
      break;
    default:
      shapeElement = `<rect x="5" y="5" width="90" height="90" fill="${fillValue}" ${filterAttr} />`;
  }

  // Create complete SVG with proper dimensions and transforms
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${shape.width}"
         height="${shape.height}"
         viewBox="0 0 100 100"
         preserveAspectRatio="none">
      <defs>${patternDefs.defs}</defs>
      ${shapeElement}
    </svg>
  `;

  return svg;
}

/**
 * Convert SVG string to an Image element
 */
function svgToImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Render all shapes to a canvas and return as data URL
 */
export async function renderShapesToCanvas(
  shapes: Shape[],
  width: number,
  height: number
): Promise<string> {
  // Create offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Fill with white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Sort shapes by z-index
  const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex);

  // Render each shape
  for (const shape of sortedShapes) {
    try {
      const svgString = generateShapeSvg(shape);
      const img = await svgToImage(svgString);

      // Save context state
      ctx.save();

      // Shape x,y is the center, calculate top-left corner
      const topLeftX = shape.x - shape.width / 2;
      const topLeftY = shape.y - shape.height / 2;

      // Apply rotation transform around shape center (shape.x, shape.y)
      ctx.translate(shape.x, shape.y);
      ctx.rotate((shape.rotation * Math.PI) / 180);
      ctx.translate(-shape.x, -shape.y);

      // Draw the shape at top-left position
      ctx.drawImage(img, topLeftX, topLeftY, shape.width, shape.height);

      // Restore context state
      ctx.restore();
    } catch (error) {
      console.error(`Failed to render shape ${shape.id}:`, error);
    }
  }

  // Return as PNG data URL
  return canvas.toDataURL("image/png");
}

