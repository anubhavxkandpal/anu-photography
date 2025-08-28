# Animation Libraries and Effects for Photography Portfolio

## Animation Libraries to Install

### 1. Framer Motion (React Animations)
```bash
npm install framer-motion
```
**Use Cases:**
- Page transitions between gallery categories
- Staggered photo grid animations (photos appear one by one)
- Smooth hover effects on images
- Modal/lightbox entrance/exit animations
- Loading state animations

**Example Effects:**
- Photos fade in with scale effect as they load
- Smooth transitions when switching between portrait/landscape/artsy galleries
- Hover animations that lift photos with shadow effects

### 2. GSAP (Professional Animations)
```bash
npm install gsap
```
**Use Cases:**
- Complex timeline animations
- Parallax scrolling effects on hero images
- Text animations (photographer name, category titles)
- Advanced image reveal animations
- Scroll-triggered animations

**Example Effects:**
- Hero text slides in from different directions
- Photos reveal with mask/clip-path animations
- Smooth parallax on background images
- Professional page load sequences

### 3. Lenis (Smooth Scrolling)
```bash
npm install @studio-freight/lenis
```
**Use Cases:**
- Buttery smooth scrolling throughout site
- Enhanced user experience on long gallery pages
- Better control over scroll behavior
- Mobile-optimized smooth scrolling

**Example Effects:**
- Smooth momentum scrolling like high-end portfolio sites
- Custom scroll speed for different sections
- Smooth anchor link navigation

### 4. Swiper.js (Image Carousels)
```bash
npm install swiper
```
**Use Cases:**
- Full-screen image galleries
- Touch/swipe navigation on mobile
- Thumbnail navigation
- Before/after comparison sliders

**Example Effects:**
- Instagram-style photo swiping
- Lightbox with swipe navigation
- Featured work carousel on homepage
- Mobile-first gallery navigation

## Animation Effects Catalog

### Page Transitions
- **Fade Between Pages**: Smooth opacity transitions when navigating galleries
- **Slide Transitions**: Pages slide in from left/right
- **Scale Transitions**: New page scales in from center

### Photo Grid Animations
- **Stagger Load**: Photos appear one by one in sequence
- **Masonry Reveal**: Photos fade in as they position in masonry layout
- **Scroll Reveal**: Photos animate in as user scrolls down
- **Hover Effects**: Scale, shadow, overlay text on hover

### Individual Photo Effects
- **Lazy Load Fade**: Images fade in as they load
- **Parallax Images**: Background images move slower than foreground
- **Ken Burns Effect**: Subtle zoom/pan on static images
- **Image Masks**: Creative reveal animations with shapes

### Navigation Animations
- **Mobile Menu**: Smooth slide/fade navigation menu
- **Breadcrumb Animations**: Animated category navigation
- **Gallery Switching**: Smooth transitions between photo categories
- **Scroll Progress**: Visual scroll indicator

### Lightbox/Modal Animations
- **Zoom In**: Photo expands from thumbnail to full screen
- **Backdrop Blur**: Background blurs when lightbox opens
- **Swipe Transitions**: Smooth photo switching in lightbox
- **Close Animations**: Smooth return to grid position

### Loading States
- **Skeleton Screens**: Placeholder animations while photos load
- **Progress Indicators**: Loading bars for image galleries
- **Spinner Replacements**: Custom loading animations

### Text Animations
- **Type Writer**: Text appears letter by letter
- **Fade Up**: Text slides up with fade effect
- **Split Text**: Words/letters animate independently
- **Parallax Text**: Text moves at different speeds

### Background Effects
- **Gradient Animations**: Subtle color transitions
- **Particle Effects**: Floating elements for atmosphere
- **Geometric Shapes**: Animated background elements
- **Video Backgrounds**: Subtle motion backgrounds

### Scroll-Based Animations
- **Reveal on Scroll**: Elements appear as they enter viewport
- **Progress Bars**: Visual scroll progress indicators
- **Sticky Elements**: Navigation that follows scroll
- **Scroll Snap**: Smooth section-to-section scrolling

## Implementation Strategy

### Phase 1: Core Setup
1. Install Framer Motion for React component animations
2. Add Lenis for smooth scrolling foundation
3. Implement basic photo grid stagger animations

### Phase 2: Advanced Effects
1. Add GSAP for complex timeline animations
2. Implement Swiper for mobile gallery navigation
3. Create custom lightbox with smooth transitions

### Phase 3: Polish
1. Add loading states and skeleton screens
2. Implement scroll-based reveal animations
3. Fine-tune all timings and easing curves

## Integration with Astro
- Use React components with Framer Motion for interactive elements
- GSAP can be used directly in Astro components
- Lenis should be initialized in the main layout
- Swiper works great with Astro's component architecture

## Performance Considerations
- Lazy load animation libraries to avoid blocking initial page load
- Use CSS transforms instead of changing layout properties
- Debounce scroll events for smooth performance
- Optimize animations for mobile devices

## Best Practices for Photography Sites
- Keep animations subtle and elegant - photos are the star
- Use animations to guide user attention, not distract
- Ensure animations enhance the viewing experience
- Test on mobile devices for touch interactions
- Consider users who prefer reduced motion (accessibility)