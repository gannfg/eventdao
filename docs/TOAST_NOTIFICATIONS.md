# Custom Toast Notifications 🎉

## What's New

All those boring browser `alert()` popups have been replaced with beautiful custom toast notifications!

## Features

### 4 Toast Types

1. **Success** ✅ - Green toast for positive actions
   - Mission completed
   - Reward claimed
   - X account connected

2. **Error** ❌ - Red toast for errors
   - Failed to claim reward
   - Connection errors
   - Database errors

3. **Warning** ⚠️ - Orange toast for warnings
   - Wallet not connected
   - Action unavailable

4. **Info** ℹ️ - Blue toast for information
   - Opening external links
   - Instructions
   - General messages

## How It Works

### Using the Toast Hook

```typescript
import { useToast } from '@/hooks/useToast';

const { success, error, warning, info } = useToast();

// Show success toast
success('Mission completed! Claim your reward!');

// Show error toast
error('Failed to connect wallet');

// Show warning toast
warning('Please connect your wallet first');

// Show info toast
info('Opening Twitter...');

// Custom duration (default is 5000ms)
success('Reward claimed!', 7000); // Shows for 7 seconds
```

### Toast Features

- **Auto-dismiss** - Disappears after 5 seconds (customizable)
- **Manual close** - Click X button to close early
- **Smooth animations** - Slides in from right
- **Multiple toasts** - Can show multiple at once (stacks)
- **Mobile responsive** - Adapts to small screens
- **Colorful** - Different colors for different types

## Current Notifications

### Mission Actions

| Action | Toast Type | Message |
|--------|-----------|---------|
| Connect X Account | Info (blue) | "This feature will be available soon..." |
| Follow @Event_DAO | Info (blue) | "Opening X (Twitter)... Follow and auto-complete!" |
| Tweet About EventDAO | Info (blue) | "Opening tweet composer..." |
| Engage with Posts | Info (blue) | "Opening EventDAO posts..." |
| Retweet Updates | Info (blue) | "Opening EventDAO updates..." |
| Copy Referral Link | Success (green) | "Referral Link Copied! [link]" |
| Mission Completed | Success (green) | "Mission Completed! Click Claim Reward..." |
| Reward Claimed | Success (green) | "Claimed X EVT! New Balance: Y EVT" |
| Wallet Not Connected | Warning (orange) | "Please connect your wallet first" |
| Claim Failed | Error (red) | "Failed to claim reward: [error]" |

## Styling

Toasts use:
- **Glassmorphism** - Frosted glass effect with blur
- **Brand colors** - Matches EventDAO theme
- **Neon accents** - Lime green for success
- **Dark mode** - Fits dark background
- **Box shadows** - Subtle depth
- **Border glow** - Colorful borders

## Files Created

```
frontend/src/
├── components/
│   ├── Toast.tsx           ✨ Toast component
│   └── Toast.module.css    ✨ Toast styles
└── hooks/
    └── useToast.ts         ✨ Toast hook
```

## Customization

### Change Duration

```typescript
// Default 5 seconds
success('Quick message');

// Show for 10 seconds
success('Important message', 10000);

// Show for 3 seconds
info('Brief info', 3000);
```

### Change Colors

Edit `Toast.module.css`:

```css
.toast.success {
  background: rgba(76, 175, 80, 0.15); /* Change this */
  border-color: rgba(76, 175, 80, 0.4); /* And this */
  color: #4caf50; /* And this */
}
```

### Change Position

Edit `Toast.module.css`:

```css
.toast {
  /* Current: top right */
  top: 100px;
  right: 20px;
  
  /* Bottom right */
  /* bottom: 20px; */
  /* right: 20px; */
  
  /* Top center */
  /* top: 100px; */
  /* left: 50%; */
  /* transform: translateX(-50%); */
}
```

### Change Animation

Edit `Toast.module.css`:

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9); /* Slide from right */
    
    /* Slide from top */
    /* transform: translateY(-100%) scale(0.9); */
    
    /* Fade only */
    /* transform: scale(0.9); */
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

## Future Enhancements

### Add Icons
```typescript
// Instead of emoji, use React icons
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
```

### Add Progress Bar
```typescript
// Show time remaining
<div className={styles.progressBar}>
  <div className={styles.progressFill} style={{ animationDuration: `${duration}ms` }} />
</div>
```

### Add Sound Effects
```typescript
// Play sound on toast
const playSound = (type: string) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.play();
};
```

### Add Actions
```typescript
// Add buttons to toast
<Toast
  message="Mission completed!"
  actions={[
    { label: 'Claim Now', onClick: () => claimReward() },
    { label: 'Later', onClick: () => {} }
  ]}
/>
```

## Examples

### Success Examples

```typescript
// Reward claimed
success(`🎉 Claimed ${amount} EVT!\n\nNew Balance: ${balance} EVT\nLifetime Earned: ${total} EVT`);

// Mission completed
success(`✅ Mission Completed!\n\n${title} is done!\nClick "Claim Reward" to get your ${reward} EVT!`);

// X account connected
success('🔗 X Account Connected!\n\nYour X account has been linked successfully!');
```

### Info Examples

```typescript
// Opening external link
info('📱 Opening X (Twitter)...\n\nFollow @Event_DAO and the mission will auto-complete!');

// Instructions
info('💬 Opening tweet composer...\n\nPost your tweet and it will auto-complete!');

// Feature unavailable
info('🔗 X Account Connection\n\nThis feature will be available soon with OAuth integration.\n\nFor now, complete other missions to earn EVT!', 6000);
```

### Warning Examples

```typescript
// Not connected
warning('Please connect your wallet first');

// Action restricted
warning('You must complete the previous mission first');

// Daily limit reached
warning('Daily mission limit reached. Come back tomorrow!');
```

### Error Examples

```typescript
// Claim failed
error('Failed to claim reward: ' + errorMessage);

// Connection error
error('Database connection failed. Please try again.');

// Verification error
error('Could not verify mission completion. Please try again.');
```

## Mobile Behavior

On mobile:
- Toasts are **full width** (with margins)
- **Slightly smaller text** (13px)
- **Smaller icons** (20px)
- Still **fully functional**
- **Touch-friendly** close button

## Accessibility

- **High contrast** - Easy to read
- **Clear icons** - Visual indicators
- **Auto-dismiss** - Doesn't require action
- **Manual close** - Can dismiss early
- **Focus management** - Doesn't steal focus

## Testing

Test all toast types:

```typescript
// In browser console
import { useToast } from './hooks/useToast';
const { success, error, warning, info } = useToast();

success('Test success toast');
error('Test error toast');
warning('Test warning toast');
info('Test info toast');
```

## Summary

✅ No more ugly browser alerts!
✅ Beautiful custom toasts
✅ 4 different types (success, error, warning, info)
✅ Auto-dismiss after 5 seconds
✅ Fully responsive
✅ Easy to customize
✅ Ready to use

Now your app feels much more professional! 🎨✨

