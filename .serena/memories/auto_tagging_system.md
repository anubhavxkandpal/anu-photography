# AI Auto-Tagging System

## Overview
Automated image tagging using Claude Vision API. Analyzes photographs and suggests tags from the curated vocabulary, plus generates title and alt text suggestions.

## Date Implemented
November 2025

## Scripts

### `scripts/auto-tag.js`
Analyzes images and generates tag suggestions.

**Usage:**
```bash
# Tag all untagged images in JSON files
npm run auto-tag:existing
node scripts/auto-tag.js --existing

# Tag only a specific category
node scripts/auto-tag.js --existing landscapes

# Re-tag all images (including already tagged)
npm run auto-tag:force
node scripts/auto-tag.js --existing --force

# Test with a single image
node scripts/auto-tag.js --file /images/optimized/landscapes/photo.jpg
```

**Output:**
- Creates `scripts/tag-suggestions/[category]-[timestamp].json`
- Contains suggested tags, titles, alt text, and reasoning

### `scripts/apply-tags.js`
Applies reviewed suggestions to the gallery JSON files.

**Usage:**
```bash
# Preview changes (dry run)
node scripts/apply-tags.js suggestions-file.json --dry-run

# Apply only tags (keep existing titles)
node scripts/apply-tags.js suggestions-file.json --tags-only

# Apply all changes
node scripts/apply-tags.js suggestions-file.json
```

**Features:**
- Creates automatic backups before modifying files
- Shows detailed change summary
- Dry-run mode for previewing

## Workflow

1. **Run auto-tag**: `npm run auto-tag:existing`
2. **Review suggestions**: Open `scripts/tag-suggestions/[file].json` in editor
3. **Edit as needed**: Remove incorrect tags, fix titles
4. **Apply changes**: `node scripts/apply-tags.js [file].json`

## Setup

1. Install dependencies: `npm install`
2. Set API key: `export ANTHROPIC_API_KEY=your-key`
3. (Or create `.env` file with the key)

## Tag Vocabulary

The script uses the curated tags from `src/data/types.ts`:

**Subject:** mountains, water, forest, birds, dogs, monkeys, wildlife, architecture, temples, streets, people

**Style:** candid, golden-hour, misty, silhouette, dramatic, serene, abstract

**Location:** himalayas, urban, rural

Claude is instructed to ONLY suggest tags from this list.

## Cost Estimate

- Uses Claude Sonnet for analysis
- ~$0.003 per image (approximate)
- 100 images ≈ $0.30

## Files Created

- `scripts/auto-tag.js` - Main analysis script
- `scripts/apply-tags.js` - Apply suggestions script
- `scripts/tag-suggestions/` - Directory for suggestion files
- `scripts/backups/` - Automatic backups before changes
- `.env.example` - Template for API key

## npm Scripts Added

```json
"auto-tag": "node scripts/auto-tag.js",
"auto-tag:existing": "node scripts/auto-tag.js --existing",
"auto-tag:force": "node scripts/auto-tag.js --existing --force",
"apply-tags": "node scripts/apply-tags.js"
```

## Dependencies Added

- `@anthropic-ai/sdk` - Anthropic API client

## Future Enhancements

1. **Batch multiple images per API call** - Reduce overhead
2. **Simple web UI for review** - Better than editing JSON
3. **Category suggestions** - Also suggest which gallery an image belongs to
4. **Integration with optimization** - Auto-tag during `npm run optimize`
5. **Confidence thresholds** - Auto-apply high-confidence tags, flag low-confidence for review
