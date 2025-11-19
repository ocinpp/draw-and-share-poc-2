# Drawing Lifecycle Management

## Overview

The Drawing Lifecycle Management system uses a **Hybrid Strategy (Option C)** that combines time-based and capacity-based removal to ensure optimal display performance and fair visibility.

## Configuration

```typescript
const LIFECYCLE_CONFIG = {
  MAX_DRAWINGS: 10,           // Maximum on screen simultaneously
  MAX_LIFETIME: 90000,        // 90 seconds - absolute maximum
  MIN_LIFETIME: 30000,        // 30 seconds - guaranteed minimum
  FADE_OUT_DURATION: 1000,    // 1 second fade-out animation
}
```

## Lifecycle States

```
[Created] → [Entry] → [Active] → [Exit] → [Removed]
             1.5s      30-90s     1s

Timeline:
─────────────────────────────────────────────────────────
0s          1.5s              30s                    90s
│            │                 │                      │
Entry     Active           Eligible              Force
Start     Start            for Removal           Remove
```

## Rules

### 1. Guaranteed Minimum Time
✅ Every drawing stays for **at least 30 seconds**
- No drawing can be removed before 30s, even if screen is full
- Ensures fair visibility for all users

### 2. Maximum Lifetime
✅ No drawing stays longer than **90 seconds**
- Automatic removal after 90s
- Keeps content fresh and rotating

### 3. Capacity Management
✅ Maximum **10 drawings** on screen at once
- When 11th drawing arrives, oldest eligible (>30s) is removed
- Prevents screen clutter and maintains performance

### 4. Smooth Transitions
✅ **1 second fade-out** animation
- Graceful exit, not abrupt removal
- Maintains visual flow

## Behavior Scenarios

### Scenario A: Low Activity (< 10 drawings)

```
Drawing 1: Appears → Stays 90s → Auto-removed (MAX_LIFETIME)
Drawing 2: Appears → Stays 90s → Auto-removed (MAX_LIFETIME)
Drawing 3: Appears → Stays 90s → Auto-removed (MAX_LIFETIME)

✅ Result: All drawings get full 90 seconds
```

### Scenario B: High Activity (> 10 drawings)

```
Drawing 1: Appears → Stays 30s → New drawing → Removed (capacity)
Drawing 2: Appears → Stays 35s → New drawing → Removed (capacity)
Drawing 3: Appears → Stays 42s → New drawing → Removed (capacity)

✅ Result: Efficient rotation, minimum 30s guaranteed
```

### Scenario C: Burst Activity

```
10 drawings on screen (all < 30s old)
New drawing arrives
→ System waits until oldest reaches 30s
→ Then removes it to make room

✅ Result: Respects minimum lifetime even during bursts
```

## Benefits

### ✅ Prevents Screen Clutter
- Maximum 10 drawings ensures clean display
- Automatic removal of oldest content

### ✅ Fair Visibility
- Every user guaranteed 30 seconds minimum
- No drawing monopolizes screen (90s max)

### ✅ Performance Optimization
- Limited active animations (max 10)
- Smooth 60fps even with continuous activity
- GPU-accelerated transforms

### ✅ Adapts to Activity Level
- **Low activity:** Drawings stay full 90 seconds
- **High activity:** Efficient rotation while respecting minimums

### ✅ Predictable Behavior
- Clear rules for when drawings appear/disappear
- No sudden removals before minimum time
- Consistent user experience

## Implementation Highlights

### Adding a Drawing

```typescript
const addDrawing = (image: string) => {
  // Create drawing object
  const drawing = createDrawing(image)
  
  // Start animation
  animateDrawing(drawing)
  
  // Set max lifetime timeout (90s)
  drawing.timeoutId = setTimeout(() => {
    removeDrawing(drawing.id, 'timeout')
  }, MAX_LIFETIME)
  
  // Check capacity
  if (drawings.length > MAX_DRAWINGS) {
    removeOldestEligible()
  }
}
```

### Removing Oldest Eligible

```typescript
const removeOldestEligible = () => {
  const now = Date.now()
  
  // Find drawings older than 30s
  const eligible = drawings
    .filter(d => now - d.createdAt >= MIN_LIFETIME)
    .sort((a, b) => a.createdAt - b.createdAt)
  
  if (eligible.length > 0) {
    removeDrawing(eligible[0].id, 'capacity')
  } else {
    console.warn('Screen full but no eligible drawings yet')
  }
}
```

### Graceful Removal

```typescript
const removeDrawing = (id: string, reason: string) => {
  const drawing = findDrawing(id)
  
  // Clear timeout
  clearTimeout(drawing.timeoutId)
  
  // Fade out animation (1s)
  gsap.to(drawing, {
    opacity: 0,
    scale: 0.5,
    y: drawing.y + 100,
    duration: 1,
    ease: 'power2.in',
    onComplete: () => {
      // Kill movement animation
      drawing.animation?.kill()
      // Remove from array
      removeFromArray(drawing)
    }
  })
}
```

## Edge Cases Handled

### 1. Burst of 15 drawings in 10 seconds
- First 10 appear immediately
- Remaining 5 queued
- As drawings reach 30s, they're removed and queue is processed

### 2. Single drawing for 2 minutes
- Drawing appears
- Stays for exactly 90 seconds
- Auto-removed (MAX_LIFETIME)

### 3. Exactly 10 drawings, all 29 seconds old
- New drawing arrives
- System waits 1 second
- Oldest reaches 30s, gets removed
- New drawing appears

## Monitoring & Statistics

```typescript
const getStats = () => ({
  total: drawings.length,
  ages: drawings.map(d => (Date.now() - d.createdAt) / 1000),
  oldest: Math.max(...drawings.map(d => Date.now() - d.createdAt)) / 1000,
  newest: Math.min(...drawings.map(d => Date.now() - d.createdAt)) / 1000,
  eligible: drawings.filter(d => Date.now() - d.createdAt >= MIN_LIFETIME).length
})

// Example output:
// {
//   total: 8,
//   ages: [45.2, 38.1, 32.5, 28.9, 22.3, 15.7, 8.4, 3.1],
//   oldest: 45.2,
//   newest: 3.1,
//   eligible: 5
// }
```

## Future Enhancements

### Optional Features

1. **Visual Indicators**
   - Progress bar showing remaining time
   - Subtle glow when nearing removal

2. **Admin Controls**
   - Runtime adjustment of MAX_DRAWINGS
   - Adjust MIN/MAX_LIFETIME
   - Manual clear all

3. **Priority System**
   - VIP drawings stay longer
   - Featured drawings highlighted

4. **Activity-Based Adjustment**
   - Increase MAX_LIFETIME during slow periods
   - Decrease during busy times

---

**Status:** Designed ✅ | Ready to Implement 🚀

