# Anu Photography Portfolio - Setup & Development Notes

## Project Overview
Photography portfolio website built with Astro, featuring:
- **Categories**: Landscapes, Artsy, Portraits, Event Photography
- **Goals**: Portfolio showcase + client acquisition + print sales
- **Tech Stack**: Astro + React + Tailwind CSS + Stripe + Cloudinary

## Design Inspiration
Based on two reference sites:
1. **George Wheelhouse** (georgewheelhouse.com/galleries/landscapes):
   - Clean masonry/grid layout with varying image sizes
   - Blur-to-sharp progressive loading
   - Full-screen slideshow capability
   - Strong print sales focus with multiple formats
   - Environmental consciousness messaging

2. **Mickey Shannon** (mickeyshannon.com/gallery/new-limited-edition-releases-fine-art-prints/):
   - Grid layout with consistent thumbnails
   - "New Release" badges for marketing
   - Location-based metadata prominent
   - Promotional banners integration

## Current Todo List
- [x] Navigate to parent GitHub directory
- [x] Create new Astro project 'Anu-photography'
- [x] Research image storage solutions (decided on Cloudinary later, GitHub 100GB limit acceptable for now)
- [x] Plan e-commerce integration (Stripe Checkout recommended)
- [ ] **IN PROGRESS**: Set up basic project structure with photography categories
- [ ] Create gallery components with masonry layout
- [ ] Add lightbox functionality  
- [ ] Add placeholder images for all categories
- [ ] Style components to match example sites

## Next Implementation Steps

### 1. Project Structure Setup
```
src/
  pages/
    index.astro (homepage)
    galleries/
      landscapes.astro
      artsy.astro
      portraits.astro
      events.astro
    prints/[slug].astro (individual image pages)
    about.astro
    contact.astro
  components/
    Gallery.astro (main gallery grid)
    ImageCard.astro (individual image cards)
    Lightbox.jsx (React component for full-screen view)
    Navigation.astro
    Footer.astro
  content/
    images/ (placeholder images initially)
    config.ts (content collections)
  layouts/
    Layout.astro (base layout)
```

### 2. Dependencies Already Installed
- @astrojs/react
- @astrojs/tailwind  
- tailwindcss
- react & react-dom
- TypeScript support

### 3. Configuration Needed
- Update astro.config.mjs to include React and Tailwind
- Set up Tailwind config for photography-specific styling
- Configure content collections for image metadata

### 4. Key Features to Build

#### Gallery System
- Masonry layout (like George Wheelhouse)
- Category filtering
- Progressive image loading with blur effect
- Responsive design

#### Lightbox/Slideshow
- Full-screen viewing
- Navigation between images
- Image metadata display
- Social sharing capabilities

#### Print Sales Integration (Later Phase)
- Stripe Checkout integration
- Product variants (Canvas, Metal, Acrylic, Fine Art Paper)
- Size options and pricing
- Shipping calculations

#### Image Storage Strategy
- **Phase 1**: Local placeholder images in /public/images/
- **Phase 2**: Migrate to Cloudinary for optimization
- **Categories structure**: 
  ```
  /public/images/
    landscapes/
    artsy/
    portraits/
    events/
  ```

### 5. Styling Approach
- Tailwind CSS for rapid development
- Custom components for gallery layouts
- Photography-focused color scheme (minimal, clean)
- Mobile-first responsive design

## Key Design Elements to Implement
1. **Progressive Image Loading**: Blur placeholder → sharp image
2. **Masonry Grid**: Variable image sizes maintaining aspect ratios
3. **Hover Effects**: Subtle animations and metadata overlays
4. **Print Sales CTAs**: "Available as prints" messaging
5. **Professional Branding**: Clean, minimal aesthetic

## Technical Considerations
- Image optimization critical for performance
- SEO optimization for client discovery
- Fast loading times (Core Web Vitals)
- Accessibility (alt tags, keyboard navigation)
- Mobile experience priority

## Content Structure
Each image will have metadata:
- Title
- Category (landscapes/artsy/portraits/events)
- Location (where applicable)
- Date taken
- Available print formats/sizes
- Price information
- Technical details (camera, settings)

## Immediate Next Actions When Resumed
1. Configure astro.config.mjs for React + Tailwind
2. Set up Tailwind config
3. Create basic Layout.astro
4. Build placeholder gallery structure
5. Add sample images to test layout
6. Implement basic masonry grid

## Reference Commands
```bash
cd /Users/anubhav/Documents/GitHub/Anu-photography
npm run dev  # Start development server
npm run build  # Build for production
```

## Notes for Continuation
- User wants placeholder images first, will add real photos later
- 100GB GitHub limit is sufficient for now
- Cloudinary integration can be added later for optimization
- Focus on core gallery functionality before e-commerce features
- Mimic the visual design patterns from the two reference sites