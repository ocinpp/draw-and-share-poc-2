# 🎨 Replicate AI Setup Guide

This guide shows you how to enable **real AI-powered sketch-to-anime conversion** using Replicate.

## What is Replicate?

Replicate is a cloud platform that runs AI models. We use their **ControlNet Scribble** model to convert sketches into anime-style artwork.

- **Quality**: Excellent (real AI conversion)
- **Speed**: 8-12 seconds per image
- **Cost**: ~$0.005 per image (very affordable!)
- **Free Credits**: New accounts get free credits to start

## Setup Steps

### 1. Create a Replicate Account

1. Go to [replicate.com](https://replicate.com)
2. Sign up for a free account
3. You'll get free credits to start!

### 2. Get Your API Token

1. Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Click "Create token"
3. Copy your token (starts with `r8_...`)

### 3. Add Token to Your Server

Edit `server/.env`:

```bash
# Change AI_PROVIDER to replicate
AI_PROVIDER=replicate

# Add your token (uncomment and replace with your actual token)
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

### 4. Restart the Server

```bash
cd server
npm run dev
```

You should see:
```
✅ Replicate client initialized
🎨 AI Provider: replicate
```

## Testing

1. Draw something on the drawing pad
2. Tap "Done" → "Send"
3. Wait 8-12 seconds
4. Watch your sketch transform into anime art! ✨

## Cost Estimation

- **Per image**: ~$0.005 (half a cent)
- **100 images**: ~$0.50
- **1000 images**: ~$5.00

Very affordable for a party or event!

## Troubleshooting

### "Replicate API token not configured"

Make sure:
- You uncommented the `REPLICATE_API_TOKEN` line in `.env`
- Your token starts with `r8_`
- You restarted the server after adding the token

### "Rate limit exceeded"

You've used up your free credits. You can:
- Add a payment method to continue
- Switch back to `AI_PROVIDER=mock` for testing

### Slow conversion

This is normal! Real AI takes 8-12 seconds. The quality is worth it!

## Alternative Models

You can try different models by editing `server/src/services/ReplicateAIService.ts`:

**Current model** (ControlNet Scribble):
```typescript
"jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117"
```

**Alternative models**:
- `rossjillian/controlnet` - Another ControlNet variant
- `stability-ai/sdxl` - Higher quality but slower and more expensive

## Switching Back to Mock

To go back to the instant (but fake) conversion:

```bash
# In server/.env
AI_PROVIDER=mock
```

Restart the server and you're back to instant conversions!

---

## Questions?

- Replicate Docs: [replicate.com/docs](https://replicate.com/docs)
- ControlNet Model: [replicate.com/jagilley/controlnet-scribble](https://replicate.com/jagilley/controlnet-scribble)
- Pricing: [replicate.com/pricing](https://replicate.com/pricing)

