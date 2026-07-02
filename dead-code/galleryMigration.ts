// Gallery Migration Helper
// This file contains the updated imports for gallery pages

// For artsy.astro - replace line 3:
// OLD: import AnimatedGallery from '../../components/AnimatedGallery.tsx';
// NEW: import MasonryGallery from '../../components/MasonryGallery.tsx';

// For artsy.astro - find and replace in the template (near bottom):
// OLD: <AnimatedGallery images={artsyImages} category="Creative & Artistic" client:load />
// NEW: <MasonryGallery images={artsyImages} category="Creative & Artistic" client:load />

// For events.astro - replace line 3:
// OLD: import AnimatedGallery from '../../components/AnimatedGallery.tsx';  
// NEW: import MasonryGallery from '../../components/MasonryGallery.tsx';

// For events.astro - find and replace in the template:
// OLD: <AnimatedGallery images={eventImages} category="Events & Celebrations" client:load />
// NEW: <MasonryGallery images={eventImages} category="Events & Celebrations" client:load />

export const migrationInstructions = {
  files: [
    'src/pages/galleries/artsy.astro',
    'src/pages/galleries/events.astro'
  ],
  replacements: [
    {
      old: "import AnimatedGallery from '../../components/AnimatedGallery.tsx';",
      new: "import MasonryGallery from '../../components/MasonryGallery.tsx';"
    },
    {
      old: "<AnimatedGallery",
      new: "<MasonryGallery"
    }
  ]
};
