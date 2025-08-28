# Ready-to-Implement Animation Components (Part 2)

## 4. Animation Utilities (Continued)
**Location**: `src/utils/animations.ts`
```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Fade in from bottom animation
export const fadeInUp = (element: string | HTMLElement, delay = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'power2.out',
    }
  );
};

// Staggered fade in animation
export const staggerFadeIn = (elements: string | HTMLElement[], stagger = 0.1) => {
  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger,
      ease: 'power2.out',
    }
  );
};

// Parallax background animation
export const createParallax = (element: string | HTMLElement, speed = 0.5) => {
  return gsap.fromTo(
    element,
    {
      yPercent: -50,
    },
    {
      yPercent: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
};

// Text reveal animation with clip-path
export const textReveal = (element: string | HTMLElement, delay = 0) => {
  return gsap.fromTo(
    element,
    {
      clipPath: 'inset(100% 0 0 0)',
    },
    {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.2,
      delay,
      ease: 'power3.out',
    }
  );
};

// Image reveal with mask effect
export const imageReveal = (element: string | HTMLElement, direction = 'left') => {
  const clipPathStart = direction === 'left' 
    ? 'inset(0 100% 0 0)' 
    : 'inset(0 0 0 100%)';
  
  return gsap.fromTo(
    element,
    {
      clipPath: clipPathStart,
    },
    {
      clipPath: 'inset(0 0% 0 0%)',
      duration: 1.5,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    }
  );
};

// Smooth counter animation
export const animateCounter = (element: string | HTMLElement, endValue: number) => {
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: endValue,
    duration: 2,
    ease: 'power2.out',
    onUpdate: () => {
      if (typeof element === 'string') {
        const el = document.querySelector(element) as HTMLElement;
        if (el) el.textContent = Math.round(obj.value).toString();
      } else {
        element.textContent = Math.round(obj.value).toString();
      }
    },
  });
};

// Page transition animations
export const pageTransition = {
  slideIn: (element: string | HTMLElement) => {
    return gsap.fromTo(
      element,
      { x: '100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
  },
  slideOut: (element: string | HTMLElement) => {
    return gsap.to(
      element,
      { x: '-100%', opacity: 0, duration: 0.4, ease: 'power3.in' }
    );
  },
  fadeIn: (element: string | HTMLElement) => {
    return gsap.fromTo(
      element,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
  },
};

// Scroll progress indicator
export const createScrollProgress = (element: string | HTMLElement) => {
  return gsap.fromTo(
    element,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    }
  );
};

// Magnetic hover effect (for buttons/interactive elements)
export const createMagneticHover = (element: HTMLElement, strength = 0.3) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};
```

## 5. Updated Layout Integration
**Location**: Update `src/layouts/Layout.astro`
```astro
---
export interface Props {
  title: string;
  description?: string;
}

const { title, description = "Professional photography portfolio showcasing landscapes, portraits, artistic photography and event coverage." } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    
    <!-- Preconnect to Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={Astro.url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={Astro.url} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
  </head>
  <body class="font-sans text-gallery-900 bg-gallery-50">
    <!-- Smooth Scroll Provider wraps everything -->
    <SmoothScrollProvider client:load>
      <!-- Navigation -->
      <nav class="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="font-heading text-2xl font-semibold text-gallery-800 hover:text-gallery-600 transition-colors">
              Portfolio
            </a>
            
            <!-- Desktop Navigation -->
            <div class="hidden md:flex space-x-8">
              <a href="/galleries/landscapes" class="nav-link">Landscapes</a>
              <a href="/galleries/portraits" class="nav-link">Portraits</a>
              <a href="/galleries/artsy" class="nav-link">Artsy</a>
              <a href="/galleries/events" class="nav-link">Events</a>
              <a href="#contact" class="nav-link">Contact</a>
            </div>
            
            <!-- Mobile Menu Button -->
            <button id="mobile-menu-button" class="md:hidden text-gallery-800 hover:text-gallery-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          
          <!-- Mobile Navigation -->
          <div id="mobile-menu" class="md:hidden mt-4 pb-4 border-t border-gallery-200 hidden">
            <div class="flex flex-col space-y-3 pt-4">
              <a href="/galleries/landscapes" class="nav-link">Landscapes</a>
              <a href="/galleries/portraits" class="nav-link">Portraits</a>
              <a href="/galleries/artsy" class="nav-link">Artsy</a>
              <a href="/galleries/events" class="nav-link">Events</a>
              <a href="#contact" class="nav-link">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="min-h-screen">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-gallery-900 text-gallery-100 py-12">
        <div class="container mx-auto px-6 text-center">
          <h3 class="font-heading text-2xl font-semibold mb-4">Photography Portfolio</h3>
          <p class="text-gallery-400 mb-6">
            Capturing moments, creating memories
          </p>
          <div class="flex justify-center space-x-6 text-sm">
            <a href="#" class="hover:text-gallery-300 transition-colors">Instagram</a>
            <a href="#" class="hover:text-gallery-300 transition-colors">Facebook</a>
            <a href="#" class="hover:text-gallery-300 transition-colors">Email</a>
          </div>
        </div>
      </footer>
    </SmoothScrollProvider>

    <!-- Import React Components -->
    <script>
      import SmoothScrollProvider from '../components/SmoothScrollProvider.tsx';
    </script>

    <style>
      .nav-link {
        @apply text-gallery-700 hover:text-gallery-900 transition-colors duration-200 font-medium;
      }
      
      /* Smooth scroll for anchor links */
      html {
        scroll-behavior: smooth;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: theme('colors.gallery.100');
      }
      
      ::-webkit-scrollbar-thumb {
        background: theme('colors.gallery.400');
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: theme('colors.gallery.600');
      }
    </style>

    <script>
      // Mobile menu toggle
      document.addEventListener('DOMContentLoaded', () => {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        menuButton?.addEventListener('click', () => {
          mobileMenu?.classList.toggle('hidden');
        });
      });
    </script>
  </body>
</html>
```

## 6. Updated Gallery Page Example
**Location**: Update `src/pages/galleries/landscapes.astro`
```astro
---
import Layout from '../../layouts/Layout.astro';
import AnimatedGallery from '../../components/AnimatedGallery.tsx';

// Sample data structure - replace with real photos
const landscapeImages = [
  {
    src: '/images/landscapes/mountain-sunset.jpg',
    alt: 'Golden sunset over mountain peaks',
    title: 'Mountain Sunset',
    location: 'Rocky Mountains, Colorado',
    date: '2024-01-15',
    category: 'landscapes' as const,
  },
  {
    src: '/images/landscapes/ocean-waves.jpg',
    alt: 'Powerful ocean waves crashing on shore',
    title: 'Ocean Power',
    location: 'Big Sur, California',
    date: '2024-02-03',
    category: 'landscapes' as const,
  },
  // Add more images as needed...
];
---

<Layout 
  title="Landscape Photography | Portfolio" 
  description="Stunning landscape photography capturing nature's beauty - mountains, oceans, forests, and scenic vistas."
>
  <AnimatedGallery 
    images={landscapeImages} 
    category="landscapes"
    client:load
  />
</Layout>
```

## Implementation Steps Summary

1. **Install Dependencies**:
   ```bash
   npm install framer-motion @studio-freight/lenis gsap swiper
   npm install --save-dev @types/gsap
   ```

2. **Create Component Files**:
   - Create all the .tsx files in `src/components/`
   - Create the animations utility in `src/utils/`

3. **Update Existing Files**:
   - Update `src/layouts/Layout.astro` with smooth scrolling
   - Update gallery pages to use `AnimatedGallery` instead of `Gallery.astro`

4. **Test the Implementation**:
   - Run `npm run dev` to start development server
   - Test smooth scrolling throughout the site
   - Test photo grid animations
   - Test responsive behavior on mobile

5. **Add Real Photos**:
   - Replace placeholder images with real photography
   - Update image arrays in each gallery page
   - Test loading performance with real images

## Ready for Implementation!
All components are now ready to copy and paste into your project. The animations will provide:

- **Smooth scrolling** throughout the entire site
- **Staggered photo loading** animations
- **Hover effects** on images
- **Loading skeletons** while images load
- **Mobile-optimized** touch interactions
- **Lightbox functionality** for full-screen viewing
- **Page transitions** between gallery categories

Once you upload your real photos, we can fine-tune the animations and add more specific effects based on your photography style!