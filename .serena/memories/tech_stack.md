# Technology Stack

## Core Framework
- **Astro v5.13.4**: Modern static site generator with island architecture
- **React v19.1.1**: UI library for interactive components
- **TypeScript**: Full TypeScript support enabled

## Styling & Design
- **Tailwind CSS v3.4.17**: Utility-first CSS framework
- **Custom Theme**: Photography-focused color palette and typography
- **Google Fonts**: 
  - Playfair Display (headings) - elegant serif
  - Source Sans 3 (body text) - clean sans-serif
- **Responsive Design**: Mobile-first approach

## Build & Development
- **Astro Integrations**:
  - @astrojs/react v4.3.0
  - @astrojs/tailwind v6.0.2
- **Vite**: Underlying build tool (via Astro)
- **ESM**: ES modules throughout

## Hosting & Deployment
- **Netlify**: Static site hosting with automatic builds
- **GitHub**: Version control and deployment trigger
- **Domain**: Ready for custom domain configuration

## File Structure
- `.astro` files: Component files with frontmatter + template
- React components: For interactive features (planned)
- Static assets: Images in `/public/images/` directory

## Performance Features
- Static site generation
- Image lazy loading (implemented)
- CSS optimization via Tailwind
- Build-time optimization