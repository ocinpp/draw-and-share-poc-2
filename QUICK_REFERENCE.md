# Quick Reference Guide

## 📊 Lifecycle Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| `MAX_DRAWINGS` | **10** | Maximum drawings on screen simultaneously |
| `MIN_LIFETIME` | **30s** | Guaranteed minimum display time |
| `MAX_LIFETIME` | **90s** | Absolute maximum display time |
| `FADE_OUT_DURATION` | **1s** | Exit animation duration |

## 🎯 Key Rules

### ✅ DO
- Every drawing gets **minimum 30 seconds**
- Remove oldest when screen is full (10 drawings)
- Auto-remove after **90 seconds maximum**
- Smooth 1-second fade-out animation

### ❌ DON'T
- Never remove drawings before 30 seconds
- Never exceed 10 drawings on screen
- Never keep drawings longer than 90 seconds
- Never remove abruptly (always animate)

## 🔄 Lifecycle States

```
Created → Entry (1.5s) → Active (30-90s) → Exit (1s) → Removed
```

### State Details

| State | Duration | Can Remove? | Description |
|-------|----------|-------------|-------------|
| **Entry** | 1.5s | ❌ No | Slide up animation |
| **Protected** | 0-30s | ❌ No | Guaranteed display time |
| **Eligible** | 30-90s | ✅ Yes | Can remove if screen full |
| **Expired** | 90s+ | ✅ Force | Auto-remove |
| **Exit** | 1s | - | Fade out animation |

## 📈 Activity Scenarios

### Low Activity (< 10 drawings)
```
Each drawing: 90 seconds display time
Removal: MAX_LIFETIME timeout only
```

### High Activity (> 10 drawings)
```
Each drawing: 30-90 seconds (varies)
Removal: Capacity-based + timeout
```

### Burst Activity (10+ in < 30s)
```
First 10: Display immediately
Rest: Queue until space available
```

## 🎨 Animation Types

| Type | Style | Duration | Repeat |
|------|-------|----------|--------|
| **Entry** | Slide up + scale | 1.5s | Once |
| **Float** | Gentle drift | 4-6s | Infinite |
| **Bounce** | Physics-based | 3s | Infinite |
| **Orbit** | Circular path | 10s | Infinite |
| **Exit** | Fade + shrink | 1s | Once |

## 🔌 WebSocket Events

### Drawing Pad → Server
```typescript
'join-room'    → { room: string, type: 'pad' }
'new-drawing'  → { image: string, room: string, timestamp: number }
```

### Server → Display Screen
```typescript
'drawing-received' → { id: string, original: string, status: 'processing' }
'anime-ready'      → { id: string, anime: string, status: 'complete' }
'conversion-failed' → { id: string, error: string }
```

## 💰 Cost Breakdown

### Hosting (Monthly)
- Vercel (Frontend): **$0** (Free tier)
- Railway (Backend): **$5** (Hobby plan)
- Domain: **$1** (~$12/year)
- **Total: $6/month**

### AI Processing (Per Image)
- ControlNet conversion: **$0.005**
- Average processing: **8-12 seconds**

### Usage Examples
| Drawings/Month | AI Cost | Total Cost |
|----------------|---------|------------|
| 100 | $0.50 | $6.50 |
| 500 | $2.50 | $8.50 |
| 2,000 | $10.00 | $16.00 |
| 5,000 | $25.00 | $31.00 |

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Development
npm run dev:pad      # Drawing Pad (localhost:5173)
npm run dev:display  # Display Screen (localhost:5174)
npm run dev:server   # Backend Server (localhost:3000)

# Build
npm run build:pad
npm run build:display
npm run build:server

# Deploy
npm run deploy
```

## 🔧 Environment Variables

### Drawing Pad (.env)
```bash
VITE_WS_URL=wss://api.draw-and-share.com
VITE_APP_NAME=Draw and Share
```

### Display Screen (.env)
```bash
VITE_WS_URL=wss://api.draw-and-share.com
VITE_MAX_DRAWINGS=10
VITE_MAX_LIFETIME=90000
VITE_MIN_LIFETIME=30000
```

### Server (.env)
```bash
NODE_ENV=production
PORT=3000
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
ALLOWED_ORIGINS=https://pad.draw-and-share.com,https://display.draw-and-share.com
MAX_IMAGE_SIZE=5242880
AI_QUEUE_CONCURRENCY=3
```

## 📱 Supported Devices

### Drawing Pad
- ✅ iPad (all models)
- ✅ iPhone (iOS 14+)
- ✅ Android tablets
- ✅ Android phones
- ✅ Desktop browsers (for testing)

### Display Screen
- ✅ Large monitors (1920x1080+)
- ✅ TVs with browser
- ✅ Projectors
- ✅ Any modern browser

## 🎯 Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Animation FPS | 60 | 60 |
| Max Drawings | 10 | 10 |
| Entry Animation | 1.5s | 1.5s |
| AI Conversion | < 15s | 8-12s |
| WebSocket Latency | < 100ms | ~50ms |

## 📚 Documentation

- [DESIGN.md](./DESIGN.md) - Complete technical proposal
- [LIFECYCLE.md](./LIFECYCLE.md) - Detailed lifecycle management
- [README.md](./README.md) - Project overview

---

**Last Updated:** 2025-11-14
**Status:** Design Complete ✅ | Ready to Build 🚀

