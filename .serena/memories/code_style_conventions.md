# Code Style & Conventions

## File Organization
- **Components**: `src/components/` - Reusable Astro components
- **Layouts**: `src/layouts/` - Page templates
- **Pages**: `src/pages/` - Route-based pages (Astro's file-based routing)
- **Static Assets**: `public/` - Images, favicon, etc.

## Naming Conventions
- **Files**: PascalCase for components (`Gallery.astro`, `Layout.astro`)
- **Pages**: kebab-case for routes (`galleries/landscapes.astro`)
- **Variables**: camelCase (`featuredImages`, `landscapeImages`)
- **CSS Classes**: Tailwind utility classes

## Astro Component Structure
```astro
---
// Frontmatter (TypeScript)
import Layout from '../layouts/Layout.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!-- Template (HTML + components) -->
<Layout title={title} description={description}>
  <main>
    <!-- Content -->
  </main>
</Layout>

<style>
  /* Component-scoped styles if needed */
</style>

<script>
  // Client-side JavaScript if needed
</script>
```

## TypeScript Usage
- Full TypeScript support in frontmatter
- Interface definitions for component props
- Type annotations for complex data structures
- `astro.config.mjs` uses JSDoc comments for types

## CSS/Styling Conventions
- **Utility-First**: Tailwind CSS classes preferred
- **Custom Classes**: Only when Tailwind is insufficient
- **Color Palette**: Use custom `gallery-*` colors for consistency
- **Typography**: 
  - `font-heading` for titles (Playfair Display)
  - `font-sans` for body text (Source Sans 3)

## Component Props Pattern
```typescript
// Image data structure
interface ImageData {
  src: string;
  alt: string;
  title: string;
  location?: string;
  date?: string;
  category: 'landscapes' | 'portraits' | 'artsy' | 'events';
}
```

## HTML Semantic Structure
- Proper semantic HTML5 elements
- Accessibility attributes (alt tags, aria-labels)
- SEO-friendly meta tags
- Mobile-first responsive design

## Build Considerations
- Static site generation (no client-side JavaScript unless needed)
- Image optimization via proper sizing and formats
- CSS is automatically optimized by Tailwind
- ESBuild handles TypeScript compilation