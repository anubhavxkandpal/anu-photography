# Task Completion Workflow

## Pre-Commit Checklist
1. **Build Test**: Always run `npm run build` to check for errors
2. **Visual Check**: Run `npm run dev` and verify changes in browser
3. **Code Review**: Ensure code follows project conventions
4. **File Organization**: Verify files are in correct directories

## Testing Commands
```bash
# Test production build locally
npm run build
npm run preview

# Check for TypeScript errors
npx astro check

# Verify development server
npm run dev
```

## Git Workflow
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Descriptive commit message

- Detail what was changed
- Why the change was made
- Any breaking changes"

# Deploy to production
git push origin main
```

## Deployment Verification
1. **Netlify Build**: Check Netlify dashboard for successful build
2. **Live Site**: Verify changes on https://admirable-treacle-731db9.netlify.app/
3. **Mobile Check**: Test responsive design on mobile devices
4. **Performance**: Ensure site loads quickly

## Common Issues & Solutions

### Build Errors
- **Tailwind Syntax**: Avoid slash opacity syntax (`text-white/80`)
- **TypeScript**: Use proper type annotations
- **Missing Imports**: Ensure all components are imported

### Image Issues
- **File Paths**: Use `/images/...` (absolute paths from public/)
- **Optimization**: Keep images under 2MB
- **Alt Tags**: Always include descriptive alt text

### Styling Issues
- **Responsive**: Test on mobile, tablet, desktop
- **Font Loading**: Ensure Google Fonts load properly
- **Color Consistency**: Use custom `gallery-*` color palette

## Quality Assurance
- [ ] Site builds without errors
- [ ] All pages load correctly
- [ ] Navigation works on all screen sizes
- [ ] Images display properly
- [ ] Typography renders correctly
- [ ] Mobile experience is smooth
- [ ] No console errors in browser

## Documentation Updates
When significant changes are made:
- Update `README.md` if user-facing features change
- Update `PROJECT_STATUS.md` for major milestones
- Consider updating this memory if workflow changes