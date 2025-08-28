import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Animation configurations
export const animationConfig = {
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },
  easing: {
    smooth: 'power2.out',
    bounce: 'elastic.out(1, 0.3)',
    sharp: 'power3.inOut',
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },
};

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
      duration: animationConfig.duration.normal,
      delay,
      ease: animationConfig.easing.smooth,
    }
  );
};

// Staggered fade in animation
export const staggerFadeIn = (elements: string | HTMLElement[], stagger = animationConfig.stagger.normal) => {
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
      duration: animationConfig.duration.normal,
      stagger,
      ease: animationConfig.easing.smooth,
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
      duration: animationConfig.duration.slow,
      delay,
      ease: animationConfig.easing.sharp,
    }
  );
};

// Image reveal with mask effect
export const imageReveal = (element: string | HTMLElement, direction: 'left' | 'right' = 'left') => {
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
      ease: animationConfig.easing.sharp,
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
    ease: animationConfig.easing.smooth,
    onUpdate: () => {
      const targetElement = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;
      
      if (targetElement) {
        targetElement.textContent = Math.round(obj.value).toString();
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
      { x: '0%', opacity: 1, duration: animationConfig.duration.normal, ease: animationConfig.easing.sharp }
    );
  },
  slideOut: (element: string | HTMLElement) => {
    return gsap.to(
      element,
      { x: '-100%', opacity: 0, duration: animationConfig.duration.fast, ease: animationConfig.easing.sharp }
    );
  },
  fadeIn: (element: string | HTMLElement) => {
    return gsap.fromTo(
      element,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: animationConfig.duration.fast, ease: animationConfig.easing.smooth }
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
      duration: animationConfig.duration.fast,
      ease: animationConfig.easing.smooth,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: animationConfig.easing.bounce,
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Hero section animation sequence
export const heroSequence = (elements: {
  title?: string | HTMLElement;
  subtitle?: string | HTMLElement;
  cta?: string | HTMLElement;
}) => {
  const tl = gsap.timeline();

  if (elements.title) {
    tl.fromTo(
      elements.title,
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: animationConfig.duration.slow, ease: animationConfig.easing.smooth }
    );
  }

  if (elements.subtitle) {
    tl.fromTo(
      elements.subtitle,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: animationConfig.duration.normal, ease: animationConfig.easing.smooth },
      '-=0.3'
    );
  }

  if (elements.cta) {
    tl.fromTo(
      elements.cta,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: animationConfig.duration.fast, ease: animationConfig.easing.bounce },
      '-=0.2'
    );
  }

  return tl;
};

// Reveal elements on scroll
export const revealOnScroll = (elements: string | HTMLElement[], options = {}) => {
  const defaultOptions = {
    trigger: elements,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
    stagger: animationConfig.stagger.normal,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.smooth,
      stagger: mergedOptions.stagger,
      scrollTrigger: mergedOptions,
    }
  );
};

// Loading animation for images
export const imageLoadAnimation = (element: string | HTMLElement) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(5px)',
    },
    {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.smooth,
    }
  );
};

// Utility to cleanup all ScrollTriggers
export const cleanupScrollTriggers = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};

// Utility to refresh ScrollTriggers (useful after layout changes)
export const refreshScrollTriggers = () => {
  ScrollTrigger.refresh();
};