# Suggested Development Commands

## Essential Development Commands
```bash
# Install dependencies
npm install

# Start development server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Navigation
```bash
# Navigate to project root
cd /Users/anubhav/Documents/GitHub/Anu-photography

# View project structure
tree -I 'node_modules|.git|dist'

# List source files
ls -la src/
```

## Git & Deployment Commands
```bash
# Check git status
git status

# Stage and commit changes
git add .
git commit -m "Your commit message"

# Deploy to production (triggers Netlify build)
git push origin main

# View recent commits
git log --oneline -10
```

## File System Commands (macOS/Darwin)
```bash
# Search for files
find src/ -name "*.astro" -type f

# Search content in files
grep -r "className" src/

# View file contents
cat src/pages/index.astro

# Edit files
code . # Opens VS Code
```

## Development Workflow Commands
```bash
# Check for build errors locally before push
npm run build

# Run development server and view in browser
npm run dev
open http://localhost:4321

# View Netlify deployment status
# (Check Netlify dashboard in browser)
```

## System-Specific Notes
- System: macOS (Darwin)
- Package manager: npm (not yarn)
- Port: 4321 for development server
- Editor: VS Code (configured in .vscode/)

## Image Management Commands
```bash
# Create image directories
mkdir -p public/images/{landscapes,portraits,artsy,events}

# View image structure
ls -la public/images/

# Optimize images (when adding new photos)
# Use external tools like ImageOptim or tinypng.com
```