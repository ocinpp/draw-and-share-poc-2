# Drawing Pad

A Vue 3 drawing application that allows users to create artwork through freehand drawing or by constructing scenes with predefined shapes. Part of the draw-and-share system.

## Features

### Drawing Modes

- **Draw Mode** - Freehand drawing with customizable brush size and colors
- **Shape Mode** - Drag and drop predefined shapes to construct drawings

### Shape Editor

The shape editor provides a rich set of tools for creating compositions:

#### Shapes (10 types)

- Rectangle, Circle, Triangle, Star, Heart
- Hexagon, Diamond, Cloud, Arrow, Speech Bubble

#### Patterns

**Basic Patterns (7)**

- Solid, Horizontal Stripes, Vertical Stripes, Diagonal Stripes
- Polka Dots, Checkerboard, Crosshatch

**Texture Patterns (10)**

- Metallic, Paper, Watercolor, Chalk, Wood
- Marble, Fabric, Glitter, Holographic Foil, Concrete

#### Manipulation

- Drag to move shapes
- Resize with 8 corner/edge handles
- Rotate using the rotation handle above shapes
- Aspect ratio locking for specific shapes (circle, star, heart)

#### Properties Panel

- 35-color palette
- Pattern selector with basic and texture options
- Delete button for removing shapes

#### History

- Undo/Redo support (up to 50 states)
- Keyboard shortcuts available

### Export

- Renders shapes to PNG for sending to the display screen
- Integrates with Socket.io for real-time communication

## Tech Stack

- Vue 3 with Composition API (`<script setup>`)
- TypeScript
- Vite
- Tailwind CSS v4
- Socket.io Client

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── DrawCanvas.vue      # Freehand drawing canvas
│   ├── ShapeCanvas.vue     # Shape editor canvas
│   ├── ShapeItem.vue       # Individual shape component
│   ├── ShapePalette.vue    # Shape selection palette
│   ├── PropertiesPanel.vue # Shape properties editor
│   └── ResizeHandles.vue   # Resize/rotate handles
├── composables/
│   ├── useShapeEditor.ts   # Shape state management
│   └── useHistory.ts       # Undo/redo history
├── data/
│   ├── predefinedShapes.ts # Shape definitions
│   ├── svgFilters.ts       # SVG filter definitions
│   └── patterns/           # Pattern definitions
├── types/
│   └── shapes.ts           # TypeScript interfaces
├── utils/
│   └── renderShapes.ts     # Shape to PNG export
└── App.vue                 # Main application
```
