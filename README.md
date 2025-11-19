# Draw-and-Share: Anime Conversion Installation

An interactive installation where users draw on their mobile devices, swipe to send, and watch their drawings transform into anime-style art that moves around a large display screen.

## 🎨 Concept

1. **Draw** - Users create sketches on iPad/mobile devices
2. **Swipe** - Send drawings with an upward swipe gesture
3. **Transform** - AI converts sketches to anime-style art
4. **Animate** - Drawings move and float around the display screen

## ✨ Key Features

- 🎯 **Multi-user Support** - Multiple people can draw simultaneously
- 📱 **Touch-Optimized** - Built for iPad and mobile devices
- 🤖 **AI-Powered** - Converts sketches to anime style using ControlNet
- 🎬 **Animated Objects** - Drawings float, bounce, and move around screen
- ⏱️ **Smart Lifecycle** - Drawings display for 30-90 seconds with intelligent rotation
- 🏠 **Room-Based** - Multiple installations can run independently
- 🌐 **Web-Based** - No app installation required

## 🏗️ Architecture

```
Drawing Pads (Mobile) ←→ WebSocket Server ←→ Display Screen (Large Monitor)
                              ↓
                         AI Service (Replicate)
```

### Components

1. **Drawing Pad** - Vue 3 SPA for mobile/tablet
2. **Backend Server** - Node.js + Socket.io + AI integration
3. **Display Screen** - Vue 3 SPA with GSAP animations

## 🛠️ Tech Stack

**Frontend:**
- Vue 3 + Vite
- TypeScript
- TailwindCSS v4
- GSAP (animations)
- Socket.io-client

**Backend:**
- Node.js 20+
- Express
- Socket.io
- Replicate SDK (AI)

**AI:**
- Replicate API
- ControlNet Scribble model
- Anime-style conversion

## 📊 Lifecycle Management

**Configuration:**
- **Max Drawings:** 10 on screen simultaneously
- **Min Lifetime:** 30 seconds guaranteed
- **Max Lifetime:** 90 seconds maximum
- **Fade Duration:** 1 second smooth exit

**Behavior:**
- Every drawing gets at least 30 seconds of visibility
- No drawing stays longer than 90 seconds
- When screen is full (10 drawings), oldest eligible drawing is removed
- Fair rotation ensures everyone gets their moment

## 💰 Cost Estimate

**Monthly Costs:**
- Hosting: ~$6/month (Vercel + Railway)
- AI Processing: $0.50-$25/month (usage-based)
- **Total: $6.50-$31/month** depending on activity

## 📅 Development Timeline

- **Week 1-2:** MVP (basic drawing + display)
- **Week 3:** AI integration
- **Week 4:** Enhanced animations + lifecycle
- **Week 5:** Polish + deployment
- **Total:** ~5-6 weeks to production

## 📖 Documentation

See [DESIGN.md](./DESIGN.md) for complete technical proposal including:
- Detailed architecture
- Component specifications
- Implementation code examples
- Deployment strategy
- Performance considerations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev:pad      # Drawing Pad (port 5173)
npm run dev:display  # Display Screen (port 5174)
npm run dev:server   # Backend Server (port 3000)
```

## 🎯 Use Cases

- Art installations in galleries/museums
- Interactive exhibits at events
- Collaborative creative spaces
- Educational environments
- Entertainment venues

## 📝 License

MIT

---

**Status:** Design Complete ✅ | Ready to Build 🚀

