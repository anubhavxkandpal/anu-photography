# Animation Setup Implementation Guide

## Installation Commands (Run These First)
```bash
cd /Users/anubhav/Documents/GitHub/Anu-photography

# Install all animation libraries at once
npm install framer-motion @studio-freight/lenis gsap swiper

# Additional types for TypeScript support
npm install --save-dev @types/gsap
```

## Component Files to Create

### 1. AnimatedGallery Component (React)
**File**: `src/components/AnimatedGallery.tsx`
- Uses Framer Motion for grid animations
- Staggered photo loading effects
- Hover animations for each image
- Integration with existing Gallery.astro

### 2. SmoothScroll Provider
**File**: `src/components/SmoothScrollProvider.tsx`
- Lenis smooth scrolling implementation
- Wraps entire site for consistent smooth scrolling
- Mobile-optimized settings

### 3. Image Lightbox Component
**File**: `src/components/ImageLightbox.tsx`
- Swiper.js integration for photo navigation
- Full-screen image viewing
- Touch/swipe support for mobile
- Keyboard navigation support

### 4. Animation Utilities
**File**: `src/utils/animations.ts`
- GSAP animation presets
- Common animation configurations
- Scroll-triggered animation helpers

## Astro Integration Points

### Layout.astro Updates
```astro
---
// Add smooth scrolling provider
---
<SmoothScrollProvider client:load>
  <!-- existing layout content -->
</SmoothScrollProvider>
```

### Gallery Page Updates
```astro
---
// Replace static Gallery.astro with AnimatedGallery.tsx
---
<AnimatedGallery images={landscapeImages} client:visible />
```

## Animation Configurations

### Framer Motion Settings
- **Stagger Duration**: 0.1s between photos
- **Hover Scale**: 1.05x with shadow
- **Page Transitions**: 0.3s fade + slide
- **Loading States**: Skeleton → fade in

### GSAP Timeline Settings
- **Hero Text**: Slide up from bottom
- **Category Headers**: Fade + scale
- **Image Reveals**: Clip-path animations
- **Scroll Triggers**: 10% into viewport

### Lenis Smooth Scroll
- **Duration**: 1.2s for smooth momentum
- **Easing**: Custom cubic-bezier
- **Touch Multiplier**: 2.0 for mobile
- **Wheel Multiplier**: 1.5 for desktop

### Swiper Configuration
- **Effect**: 'fade' for main lightbox
- **Speed**: 400ms transition
- **Loop**: true for continuous browsing
- **Pagination**: Custom dot indicators

## Performance Optimizations
- Lazy load animation libraries
- Use CSS transforms for GPU acceleration
- Debounce scroll events
- Preload only visible images in lightbox

## Mobile Considerations
- Touch-friendly animations
- Reduced motion for accessibility
- Battery-efficient animations
- Smaller animation distances on mobile

## Implementation Order
1. **Install libraries** (run npm install commands)
2. **Create SmoothScrollProvider** (site-wide smooth scrolling)
3. **Create AnimatedGallery** (photo grid with animations)  
4. **Update Layout.astro** (wrap with smooth scroll provider)
5. **Update gallery pages** (use animated components)
6. **Add lightbox component** (full-screen photo viewing)
7. **Fine-tune animations** (timing, easing, performance)

## Testing Checklist
- [ ] Smooth scrolling works on all pages
- [ ] Photo grid animates on page load
- [ ] Hover effects work on desktop
- [ ] Touch interactions work on mobile
- [ ] Lightbox opens/closes smoothly
- [ ] Page transitions between galleries
- [ ] Performance remains good on mobile
- [ ] Accessibility (reduced motion preference)

## Next Steps After Photo Upload
When real photos are uploaded:
1. Update image arrays in gallery pages
2. Test animations with real content
3. Optimize image loading with animations
4. Adjust animation timings based on image sizes
5. Add category-specific animation variations