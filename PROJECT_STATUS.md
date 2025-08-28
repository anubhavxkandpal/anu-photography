# Anu Photography Portfolio - Project Documentation

## 🌐 Live Site
**URL**: https://admirable-treacle-731db9.netlify.app/
**GitHub**: https://github.com/anubhavxkandpal/anu-photography

## 🛠️ Tech Stack
- **Framework**: Astro v4
- **UI Library**: React 
- **Styling**: Tailwind CSS
- **Hosting**: Netlify (auto-deploy from GitHub)
- **Domain**: Ready for custom domain setup

## ✅ What We Built

### 1. Project Structure
```
src/
├── layouts/
│   └── Layout.astro              # Base layout with nav/footer
├── components/
│   └── Gallery.astro             # Reusable gallery grid component
└── pages/
    ├── index.astro               # Homepage with hero section
    └── galleries/                # Photography categories
        ├── landscapes.astro      # Nature & landscapes
        ├── portraits.astro       # People & headshots
        ├── artsy.astro          # Creative & experimental
        └── events.astro         # Weddings & celebrations
```

### 2. Features Implemented
- **✅ Professional Homepage**
  - Hero section with branding
  - Photography collection previews
  - Services showcase
  - Call-to-action sections

- **✅ Responsive Navigation** 
  - Desktop and mobile menus
  - Sticky header
  - Clean footer with contact info

- **✅ Gallery System**
  - Masonry layout for photos
  - Category-based organization
  - Hover effects and transitions
  - Ready for real images

- **✅ Professional Design**
  - Photography-focused color scheme
  - Mobile-first responsive design
  - Clean typography and spacing
  - Professional branding

### 3. Technical Setup
- **✅ Build Configuration**
  - Astro + React integration
  - Tailwind CSS with custom theme
  - Optimized for production builds

- **✅ Deployment Pipeline**
  - GitHub repository connected
  - Automatic Netlify deployments
  - Build errors resolved (ESBuild fixes)

## 📸 Adding Your Photos

### Option 1: Simple File Upload (Recommended for Start)
1. **Create image directories:**
   ```
   public/images/
   ├── landscapes/
   ├── portraits/ 
   ├── artsy/
   └── events/
   ```

2. **Add your photos** to the appropriate folders:
   - Use web-optimized formats (JPG, PNG, WebP)
   - Recommended max width: 1920px
   - Keep file sizes under 2MB each

3. **Update the gallery arrays** in each category file:
   ```javascript
   // In src/pages/galleries/landscapes.astro
   const landscapeImages = [
     {
       src: '/images/landscapes/mountain-sunset.jpg',
       alt: 'Mountain sunset with golden light',
       title: 'Mountain Sunset',
       location: 'Rocky Mountains, Colorado',
       date: '2024-08-15',
       category: 'landscapes'
     },
     // Add more images...
   ];
   ```

### Option 2: Cloud Storage (Future Enhancement)
- **Cloudinary integration** planned for image optimization
- Automatic resizing and format conversion
- Better performance for large galleries

## 🚀 Next Steps

### Immediate (Content Phase)
1. **Upload Photos**: Add your best work to `/public/images/` folders
2. **Update Content**: Replace placeholder text with your descriptions
3. **Custom Domain**: Purchase domain and connect to Netlify

### Future Enhancements
1. **About Page**: Create photographer bio and story
2. **Contact Page**: Add booking form and contact details
3. **Lightbox**: Full-screen image viewing
4. **Print Sales**: Stripe integration for selling prints
5. **Blog**: Optional photography blog/tips section

## 🔧 Development Commands
```bash
cd /Users/anubhav/Documents/GitHub/Anu-photography

# Development
npm run dev          # Start local server (localhost:4321)
npm run build        # Build for production
npm run preview      # Preview built site

# Deployment (automatic via GitHub)
git add .
git commit -m "Add new photos"
git push origin main  # Auto-deploys to Netlify
```

## 📝 File Locations

### Key Files to Edit:
- `src/pages/index.astro` - Homepage content
- `src/pages/galleries/*.astro` - Gallery pages with image arrays
- `src/layouts/Layout.astro` - Navigation links and footer
- `public/images/` - Your photography files

### Configuration Files:
- `astro.config.mjs` - Framework settings
- `tailwind.config.mjs` - Styling theme
- `package.json` - Dependencies

## 🎯 Current Status: Production MVP ✅

The foundation is complete and live! You can now:
1. Add your photos to make it truly yours
2. Set up a custom domain for professional branding
3. Share with potential clients

**The website is ready for real-world use!** 🎉