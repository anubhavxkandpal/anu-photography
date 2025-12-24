import { useEffect, useState } from 'react';

interface ParallaxHeroProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
}

export default function ParallaxHero({ imageSrc, title, subtitle }: ParallaxHeroProps) {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      // Fade out over first 60% of viewport scroll
      const opacity = Math.max(0, 1 - (scrollY / (windowHeight * 0.6)));
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Fixed Hero Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Content - fades on scroll */}
      <div className="h-screen relative z-0 flex items-center justify-center">
        <div
          className="text-center text-white transition-opacity duration-100"
          style={{ opacity: scrollOpacity }}
        >
          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-xl md:text-2xl font-light tracking-widest opacity-80">
              {subtitle}
            </p>
          )}
          <div className="mt-12 animate-bounce">
            <svg className="w-8 h-8 mx-auto opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
