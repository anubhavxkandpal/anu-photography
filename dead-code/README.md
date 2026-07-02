# Dead Code — Parked Components

Files moved here in July 2026 during a codebase cleanup. Nothing in `src/` imports any of them; they are kept for possible revival. If a file is still here after a few months and nobody has missed it, it can be deleted.

- [AnimatedGallery.tsx](AnimatedGallery.tsx) — older React grid gallery (superseded by `FilterableGallery`). Contains a bug: `onError` calls an undefined `handleImageLoad`.
- [Gallery.astro](Gallery.astro) + [Lightbox.astro](Lightbox.astro) — pre-React Astro/vanilla-JS gallery and lightbox pair. Superseded by `FilterableGallery` + `ImageLightbox`.
- [OptimizedImage.tsx](OptimizedImage.tsx) — responsive image wrapper whose `?w=&q=&f=` srcset params were never backed by an image server; effectively a no-op.
- [SmoothScrollProvider.tsx](SmoothScrollProvider.tsx) — React wrapper for Lenis. Was imported as a side-effect module in `Layout.astro`, which never actually initialized it. Lenis is now initialized directly in the `Layout.astro` script.
- [animations.ts](animations.ts) — GSAP/ScrollTrigger animation helper library, never imported by any live page. GSAP has been removed from dependencies; reinstall `gsap` if reviving.
- [galleries.astro](galleries.astro) — `/galleries` landing page. Only showed 4 of the 6 categories and nothing in the nav linked to it (the one link from `contact-success.astro` now points to `/explore`).
- [galleryMigration.ts](galleryMigration.ts) — note-to-self file documenting an already-completed component swap.

- [MasonryGallery.tsx](MasonryGallery.tsx) — its planned revival happened as a `layout="masonry"` mode inside `FilterableGallery` in July 2026, so it's now fully superseded.
