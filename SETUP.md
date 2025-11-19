# Draw-and-Share - Setup Guide

## 🚀 Quick Start (Phase 1 MVP)

This guide will help you get the MVP running with the **mock AI provider** (no API costs, instant conversion).

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

---

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
cd server && npm install && cd ..
cd drawing-pad && npm install && cd ..
cd display-screen && npm install && cd ..
```

Or use the convenience script:

```bash
npm run install:all
```

---

## Running the MVP

### Option A: Run All Services Together (Recommended)

```bash
npm run dev
```

This will start:
- **Server** on `http://localhost:3000`
- **Drawing Pad** on `http://localhost:5173`
- **Display Screen** on `http://localhost:5174`

### Option B: Run Services Individually

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Drawing Pad:**
```bash
cd drawing-pad
npm run dev
```

**Terminal 3 - Display Screen:**
```bash
cd display-screen
npm run dev
```

---

## Testing the MVP

1. **Open Display Screen** in your browser:
   - Go to `http://localhost:5174`
   - This is your "big screen" display
   - Leave this window open

2. **Open Drawing Pad** (can open multiple):
   - Go to `http://localhost:5173`
   - Draw something on the canvas
   - Either:
     - Click "Send" button, OR
     - Swipe up ⬆️ while drawing

3. **Watch the Magic!**
   - Your drawing will appear on the Display Screen
   - It will have a pink border and "ANIME" badge (mock conversion)
   - It will float and animate on the screen
   - After 30-90 seconds, it will fade out

---

## Configuration

### Server Configuration

Edit `server/.env`:

```bash
# Server port
PORT=3000

# AI Provider (mock for MVP)
AI_PROVIDER=mock

# CORS origins (drawing pad and display screen)
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### AI Provider Options

- `mock` - Adds border and badge (instant, free) ✅ **Current**
- `local` - Image filters (fast, free) - Not yet implemented
- `animegan` - Local AI (good quality, free) - Not yet implemented
- `replicate` - Cloud AI (best quality, $0.005/image) - Not yet implemented

---

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Change ports in:
# - server/.env (PORT=3000)
# - drawing-pad/vite.config.ts (port: 5173)
# - display-screen/vite.config.ts (port: 5174)
```

### Connection Issues

1. Make sure the server is running first
2. Check that CORS_ORIGIN in `server/.env` matches your frontend URLs
3. Check browser console for errors

### Drawing Not Appearing

1. Check server terminal for errors
2. Open browser DevTools console on both drawing pad and display screen
3. Verify WebSocket connection (should see "✅ Connected to server")

---

## Next Steps

Once the MVP is working:

1. **Test with multiple drawing pads** - Open `http://localhost:5173` in multiple tabs/devices
2. **Upgrade AI provider** - Switch to `animegan` for better quality (see DESIGN.md Section 6)
3. **Deploy to production** - Use `replicate` provider for best quality
4. **Add content moderation** - Enable NSFW filtering (see DESIGN.md Section 7)

---

## Development

### Project Structure

```
draw-and-share/
├── server/              # WebSocket server + AI conversion
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   └── services/
│   │       ├── MockAIService.ts
│   │       └── AIConversionService.ts
│   └── .env
├── drawing-pad/         # Vue 3 drawing app
│   └── src/
│       └── App.vue            # Drawing canvas + swipe gesture
└── display-screen/      # Vue 3 display app
    └── src/
        └── App.vue            # Animated display with GSAP
```

### Building for Production

```bash
npm run build
```

This will build all three applications.

---

## Documentation

- **DESIGN.md** - Complete technical specification
- **LIFECYCLE.md** - Drawing lifecycle management
- **AI_MODEL_ALTERNATIVES.md** - Alternative AI models
- **AI_MODEL_EXAMPLES.md** - Visual examples and demos
- **INDEX.md** - Documentation navigation

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the server logs in the terminal
3. Check browser console for errors
4. Refer to DESIGN.md for detailed architecture

---

**🎉 Enjoy your Draw-and-Share installation!**

