#!/usr/bin/env node

/**
 * Auto-Tag Images using Claude Vision API
 * 
 * This script analyzes photographs and suggests tags from our curated vocabulary.
 * It works on both new images (from optimization manifests) and existing images
 * in the gallery JSON files.
 * 
 * Usage:
 *   node scripts/auto-tag.js --existing                    # Tag all untagged images in JSON files
 *   node scripts/auto-tag.js --existing landscapes         # Tag only landscapes category
 *   node scripts/auto-tag.js --existing --force            # Re-tag all images (including already tagged)
 *   node scripts/auto-tag.js --new                         # Tag images from recent manifests
 *   node scripts/auto-tag.js --file <path>                 # Tag a single image (for testing)
 * 
 * Environment:
 *   ANTHROPIC_API_KEY - Required. Your Anthropic API key.
 * 
 * Output:
 *   Creates a suggestion file in scripts/tag-suggestions/
 *   Review and edit the suggestions, then run apply-tags.js to apply them.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Our curated tag vocabulary with descriptions for Claude
const TAG_VOCABULARY = {
  // Subject tags
  mountains: 'Mountain peaks, ranges, hills, elevated terrain',
  water: 'Rivers, lakes, waterfalls, oceans, streams, rain',
  forest: 'Trees, woods, jungles, vegetation, greenery',
  birds: 'Any bird species',
  dogs: 'Dogs, puppies, canines',
  monkeys: 'Monkeys, apes, primates',
  wildlife: 'General wildlife, animals in nature (use for animals not covered by specific tags)',
  architecture: 'Buildings, structures, bridges, urban design, interiors',
  temples: 'Religious structures, shrines, stupas, sacred buildings',
  streets: 'Street scenes, roads, urban life, city views',
  people: 'Human subjects, portraits, figures',
  
  // Style/mood tags
  candid: 'Unposed, spontaneous, natural moment captured',
  'golden-hour': 'Warm golden light, sunrise or sunset lighting',
  misty: 'Fog, mist, haze, atmospheric conditions',
  silhouette: 'Subject shown as dark shape against bright background',
  dramatic: 'High contrast, intense mood, powerful composition',
  serene: 'Calm, peaceful, tranquil mood',
  abstract: 'Non-representational, patterns, textures, artistic interpretation',
  
  // Location tags
  himalayas: 'Himalayan mountain region, high altitude India',
  urban: 'City environment, metropolitan area',
  rural: 'Countryside, village, non-urban setting',
};

const CATEGORIES = ['landscapes', 'wildlife', 'portraits', 'travel', 'artsy', 'events'];

// Rate limiting
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second between API calls
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Initialize Anthropic client
 */
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required');
    console.error('   Set it with: export ANTHROPIC_API_KEY=your-key-here');
    process.exit(1);
  }
  return new Anthropic({ apiKey });
}

/**
 * Read image file and convert to base64
 */
async function imageToBase64(imagePath) {
  const absolutePath = imagePath.startsWith('/') 
    ? imagePath 
    : path.join(PROJECT_ROOT, 'public', imagePath);
  
  try {
    const buffer = await fs.readFile(absolutePath);
    const base64 = buffer.toString('base64');
    
    // Determine media type
    const ext = path.extname(absolutePath).toLowerCase();
    const mediaType = ext === '.png' ? 'image/png' 
      : ext === '.webp' ? 'image/webp'
      : 'image/jpeg';
    
    return { base64, mediaType };
  } catch (error) {
    console.error(`   ⚠️  Could not read image: ${absolutePath}`);
    return null;
  }
}

/**
 * Analyze image with Claude Vision and get tag suggestions
 */
async function analyzeImage(client, imagePath, existingTags = []) {
  const imageData = await imageToBase64(imagePath);
  if (!imageData) return null;
  
  const tagList = Object.entries(TAG_VOCABULARY)
    .map(([tag, desc]) => `- ${tag}: ${desc}`)
    .join('\n');
  
  const existingNote = existingTags.length > 0 
    ? `\n\nThis image currently has these tags: ${existingTags.join(', ')}. You can confirm these or suggest changes.`
    : '';
  
  const prompt = `Analyze this photograph and identify which tags from the following vocabulary apply to it.

AVAILABLE TAGS:
${tagList}

INSTRUCTIONS:
1. Only suggest tags from the list above - do not invent new tags
2. Be selective - only include tags that clearly apply
3. For style/mood tags, only include if strongly present
4. Consider both the subject matter AND the photographic style
${existingNote}

Respond with a JSON object in this exact format:
{
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "confidence": {
    "tag1": "high",
    "tag2": "medium"
  },
  "reasoning": "Brief explanation of why these tags were chosen",
  "suggested_title": "A creative, evocative title for this photograph (2-5 words)",
  "suggested_alt": "Descriptive alt text for accessibility (one sentence)"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageData.mediaType,
                data: imageData.base64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });
    
    // Parse the response
    const text = response.content[0].text;
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('   ⚠️  Could not parse response as JSON');
      return null;
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Validate tags are from our vocabulary
    const validTags = result.suggested_tags.filter(tag => tag in TAG_VOCABULARY);
    if (validTags.length !== result.suggested_tags.length) {
      const invalid = result.suggested_tags.filter(tag => !(tag in TAG_VOCABULARY));
      console.log(`   ⚠️  Removed invalid tags: ${invalid.join(', ')}`);
    }
    
    return {
      ...result,
      suggested_tags: validTags,
    };
  } catch (error) {
    console.error(`   ❌ API error: ${error.message}`);
    return null;
  }
}

/**
 * Load existing images from JSON data files
 */
async function loadExistingImages(category = null) {
  const images = [];
  const categoriesToLoad = category ? [category] : CATEGORIES;
  
  for (const cat of categoriesToLoad) {
    const jsonPath = path.join(PROJECT_ROOT, 'src/data', `${cat}.json`);
    try {
      const content = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(content);
      
      for (const image of data.images) {
        images.push({
          ...image,
          _category: cat,
          _jsonPath: jsonPath,
        });
      }
    } catch (error) {
      console.log(`   ℹ️  No data file for ${cat}`);
    }
  }
  
  return images;
}

/**
 * Process existing images from JSON files
 */
async function processExisting(client, category = null, force = false) {
  console.log('\n📂 Loading existing images...');
  const images = await loadExistingImages(category);
  
  // Filter to untagged images unless force mode
  const toProcess = force 
    ? images 
    : images.filter(img => !img.tags || img.tags.length === 0);
  
  console.log(`   Found ${images.length} total images, ${toProcess.length} to process`);
  
  if (toProcess.length === 0) {
    console.log('   ✅ All images already have tags!');
    return;
  }
  
  const suggestions = [];
  let processed = 0;
  
  for (const image of toProcess) {
    processed++;
    console.log(`\n[${processed}/${toProcess.length}] Analyzing: ${image.src}`);
    
    const result = await analyzeImage(client, image.src, image.tags || []);
    
    if (result) {
      suggestions.push({
        src: image.src,
        category: image._category,
        current_tags: image.tags || [],
        current_title: image.title,
        current_alt: image.alt,
        ...result,
      });
      
      console.log(`   ✓ Suggested: ${result.suggested_tags.join(', ')}`);
    }
    
    // Rate limiting
    if (processed < toProcess.length) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }
  
  // Save suggestions
  await saveSuggestions(suggestions, category || 'all');
}

/**
 * Process a single image file (for testing)
 */
async function processSingleFile(client, filePath) {
  console.log(`\n🖼️  Analyzing: ${filePath}`);
  
  const result = await analyzeImage(client, filePath);
  
  if (result) {
    console.log('\n📋 Results:');
    console.log(`   Tags: ${result.suggested_tags.join(', ')}`);
    console.log(`   Title: ${result.suggested_title}`);
    console.log(`   Alt: ${result.suggested_alt}`);
    console.log(`   Reasoning: ${result.reasoning}`);
  }
}

/**
 * Save suggestions to a file for review
 */
async function saveSuggestions(suggestions, category) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${category}-${timestamp}.json`;
  const outputPath = path.join(PROJECT_ROOT, 'scripts/tag-suggestions', filename);
  
  const output = {
    generated_at: new Date().toISOString(),
    category: category,
    total_images: suggestions.length,
    instructions: 'Review and edit the suggestions below, then run: node scripts/apply-tags.js ' + filename,
    suggestions: suggestions,
  };
  
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Suggestions saved to: scripts/tag-suggestions/${filename}`);
  console.log(`   Review the file and run: node scripts/apply-tags.js ${filename}`);
}

/**
 * Main function
 */
async function main() {
  console.log('\n🏷️  Anu Photography - Auto-Tag Images\n');
  console.log('═'.repeat(50));
  
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Usage:
  node scripts/auto-tag.js --existing [category]   Tag images in JSON files
  node scripts/auto-tag.js --existing --force      Re-tag all images
  node scripts/auto-tag.js --file <path>           Tag a single image
  
Options:
  --force    Re-analyze images that already have tags
  --help     Show this help message

Environment:
  ANTHROPIC_API_KEY    Your Anthropic API key (required)
`);
    return;
  }
  
  const client = getClient();
  
  if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('❌ Please provide a file path after --file');
      process.exit(1);
    }
    await processSingleFile(client, filePath);
  } else if (args.includes('--existing')) {
    const force = args.includes('--force');
    const category = args.find(a => CATEGORIES.includes(a)) || null;
    await processExisting(client, category, force);
  } else {
    console.error('❌ Unknown command. Use --help for usage information.');
    process.exit(1);
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('Done!\n');
}

main().catch(console.error);
