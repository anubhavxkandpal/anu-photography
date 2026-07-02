#!/usr/bin/env node

/**
 * Library Audit Tool for Anu Photography
 *
 * Helps curate the photo library: finds duplicate filenames across
 * categories, missing files, images that may be miscategorized, and
 * ranks each category's images (via Claude Vision) to surface
 * promote/demote/removal candidates against the current tier.
 *
 * This tool is read-only — it never edits the JSON data files or
 * deletes anything. It writes a markdown report and a JSON report
 * to scripts/curation/ for manual review.
 *
 * Usage:
 *   node scripts/audit-library.js                        Dry run: duplicates + missing files only
 *   node scripts/audit-library.js --yes                   Full audit, including API ranking pass
 *   node scripts/audit-library.js --yes --category events Audit a single category only
 *
 * Environment:
 *   ANTHROPIC_API_KEY - Required for the ranking pass (loaded from .env if present)
 */

import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const CATEGORIES = ['landscapes', 'wildlife', 'portraits', 'travel', 'artsy', 'events'];

const CATEGORY_INFO = {
  landscapes: 'Mountains, valleys, forests, and natural vistas',
  wildlife: 'Birds, animals, and creatures in their natural habitat',
  portraits: 'Human subjects, expressions, and stories',
  travel: 'Places, streets, and moments from journeys',
  artsy: 'Abstract, experimental, and artistic compositions',
  events: 'Celebrations, gatherings, and special occasions',
};

const BATCH_SIZE = 12;
const MAX_API_DIMENSION = 1024; // Downsized for the audit call, not for the site itself
const DELAY_BETWEEN_REQUESTS = 1000;
const MODEL = 'claude-sonnet-5';

const TOP_PROMOTE_PCT = 0.15;
const BOTTOM_DEMOTE_PCT = 0.25;
const BOTTOM_REMOVAL_PCT = 0.10;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Env / client setup
// ---------------------------------------------------------------------------

/** Minimal .env loader — no new dependency, only fills vars not already set. */
async function loadDotEnv() {
  const envPath = path.join(PROJECT_ROOT, '.env');
  try {
    const content = await fs.readFile(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env file — fine, ANTHROPIC_API_KEY may already be exported.
  }
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required for the ranking pass.');
    console.error('   Set it in .env or export it in your shell.');
    process.exit(1);
  }
  return new Anthropic({ apiKey });
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

async function loadCategoryData(category) {
  const jsonPath = path.join(PROJECT_ROOT, 'src/data', `${category}.json`);
  const content = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(content);
  return data.images.map((img) => ({ ...img, _category: category }));
}

async function loadAllImages(categories) {
  const all = [];
  for (const category of categories) {
    const images = await loadCategoryData(category);
    all.push(...images);
  }
  return all;
}

// ---------------------------------------------------------------------------
// Pass 1: duplicates + missing files (no API)
// ---------------------------------------------------------------------------

async function findDuplicatesAndMissing(allImages) {
  const byFilename = new Map();
  for (const img of allImages) {
    const filename = path.basename(img.src);
    if (!byFilename.has(filename)) byFilename.set(filename, []);
    byFilename.get(filename).push(img);
  }

  const duplicates = [];
  for (const [filename, entries] of byFilename) {
    const categories = new Set(entries.map((e) => e._category));
    if (categories.size > 1 || entries.length > 1) {
      duplicates.push({ filename, entries });
    }
  }

  const missing = [];
  for (const img of allImages) {
    const absolutePath = path.join(PROJECT_ROOT, 'public', img.src);
    try {
      await fs.access(absolutePath);
    } catch {
      missing.push(img);
    }
  }

  return { duplicates, missing };
}

// ---------------------------------------------------------------------------
// Pass 2: category-fit + ranking (API)
// ---------------------------------------------------------------------------

async function imageToApiBlock(src) {
  const absolutePath = path.join(PROJECT_ROOT, 'public', src);
  const ext = path.extname(absolutePath).toLowerCase();
  const buffer = await sharp(absolutePath)
    .resize(MAX_API_DIMENSION, MAX_API_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/jpeg',
      data: buffer.toString('base64'),
    },
  };
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/** Send one batch of images to Claude for category-fit + local ranking. */
async function auditBatch(client, category, batchImages) {
  const imageBlocks = [];
  for (const img of batchImages) {
    imageBlocks.push(await imageToApiBlock(img.src));
  }

  const categoryList = CATEGORIES.map((c) => `- ${c}: ${CATEGORY_INFO[c]}`).join('\n');

  const prompt = `You are auditing photographs for a photography portfolio. All ${batchImages.length} images below are currently filed under the category "${category}", shown in order (image 1 through image ${batchImages.length}).

The six possible categories are:
${categoryList}

Do two things:

1. MISCATEGORIZATION CHECK: Flag an image only if it clearly belongs in a different one of the six categories — most images should NOT be flagged. For each flagged image give its index, the suggested category, and a one-line reason.

2. RANKING: Rank all ${batchImages.length} images in this batch from strongest (1) to weakest (${batchImages.length}) based on overall photographic quality — composition, lighting, sharpness, emotional impact, and portfolio-worthiness. Give a one-line reason for the single strongest image and a one-line reason for the single weakest image in this batch.

Respond with strict JSON only, no markdown fences, in exactly this shape:
{
  "miscategorized": [ { "index": 3, "suggested_category": "wildlife", "reason": "one line" } ],
  "ranking": [2, 1, 5, 3, 4],
  "top_reason": "one line explaining the strongest image",
  "bottom_reason": "one line explaining the weakest image"
}
"ranking" must be a permutation of all indices 1 through ${batchImages.length}, best to worst.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [...imageBlocks, { type: 'text', text: prompt }],
      },
    ],
  });

  const result = extractJson(response.content[0].text);
  if (!result || !Array.isArray(result.ranking)) {
    console.error(`   ⚠️  Could not parse batch response for ${category}`);
    return null;
  }

  const rankingSrcs = result.ranking
    .map((i) => batchImages[i - 1])
    .filter(Boolean)
    .map((img) => img.src);

  const miscategorized = (result.miscategorized || [])
    .map((m) => {
      const img = batchImages[m.index - 1];
      if (!img) return null;
      return { src: img.src, suggestedCategory: m.suggested_category, reason: m.reason };
    })
    .filter(Boolean);

  const topSrc = rankingSrcs[0];
  const bottomSrc = rankingSrcs[rankingSrcs.length - 1];

  return {
    ranking: rankingSrcs,
    miscategorized,
    reasons: {
      ...(topSrc ? { [topSrc]: result.top_reason } : {}),
      ...(bottomSrc ? { [bottomSrc]: result.bottom_reason } : {}),
    },
  };
}

/** Rank the top/bottom "anchor" picks from each batch against each other, to approximate a category-wide order. */
async function finalRankingPass(client, category, anchorSrcs) {
  if (anchorSrcs.length <= 1) {
    return { ranking: anchorSrcs, reasons: {} };
  }

  const imageBlocks = [];
  for (const src of anchorSrcs) {
    imageBlocks.push(await imageToApiBlock(src));
  }

  const prompt = `These ${anchorSrcs.length} images are the top- and bottom-ranked photographs pulled from separate batches within the "${category}" category of a photography portfolio, each already locally ranked within its own batch. Rank all of them from strongest to weakest overall, so the batch rankings can be merged into one approximate category-wide order. Give a one-line reason for the single strongest and single weakest images overall.

Respond with strict JSON only, no markdown fences, in exactly this shape:
{
  "ranking": [2, 1, 3],
  "top_reason": "one line",
  "bottom_reason": "one line"
}
"ranking" must be a permutation of all indices 1 through ${anchorSrcs.length}, best to worst.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [...imageBlocks, { type: 'text', text: prompt }],
      },
    ],
  });

  const result = extractJson(response.content[0].text);
  if (!result || !Array.isArray(result.ranking)) {
    console.error(`   ⚠️  Could not parse final ranking pass for ${category}, falling back to batch order`);
    return { ranking: anchorSrcs, reasons: {} };
  }

  const rankingSrcs = result.ranking.map((i) => anchorSrcs[i - 1]).filter(Boolean);
  const topSrc = rankingSrcs[0];
  const bottomSrc = rankingSrcs[rankingSrcs.length - 1];

  return {
    ranking: rankingSrcs,
    reasons: {
      ...(topSrc ? { [topSrc]: result.top_reason } : {}),
      ...(bottomSrc ? { [bottomSrc]: result.bottom_reason } : {}),
    },
  };
}

/** Audit one category end-to-end: batch ranking, then merge into an approximate full ordering. */
async function auditCategory(client, category, images) {
  const batches = chunk(images, BATCH_SIZE);
  const batchResults = [];
  const miscategorized = [];
  const reasons = {};

  console.log(`\n📁 ${category}: ${images.length} images, ${batches.length} batch(es)`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`   [batch ${i + 1}/${batches.length}] auditing ${batches[i].length} images...`);
    const result = await auditBatch(client, category, batches[i]);
    if (result) {
      batchResults.push(result.ranking);
      miscategorized.push(...result.miscategorized);
      Object.assign(reasons, result.reasons);
    } else {
      // Fall back to original order for this batch so it still contributes to the merge.
      batchResults.push(batches[i].map((img) => img.src));
    }

    if (i < batches.length - 1) await sleep(DELAY_BETWEEN_REQUESTS);
  }

  // Build anchors: top 2 / bottom 2 of each batch (deduped for small batches).
  const anchorsPerBatch = batchResults.map((ranking) => {
    const anchorCount = Math.min(2, Math.floor(ranking.length / 2) || ranking.length);
    const top = ranking.slice(0, anchorCount);
    const bottom = ranking.slice(-anchorCount);
    return Array.from(new Set([...top, ...bottom]));
  });

  let mergedOrdering;

  if (batchResults.length === 1) {
    mergedOrdering = batchResults[0];
  } else {
    const allAnchors = anchorsPerBatch.flat();
    console.log(`   [final pass] merging ${batches.length} batches via ${allAnchors.length} anchor images...`);
    await sleep(DELAY_BETWEEN_REQUESTS);
    const finalPass = await finalRankingPass(client, category, allAnchors);
    Object.assign(reasons, finalPass.reasons);

    const anchorRank = new Map(finalPass.ranking.map((src, idx) => [src, idx]));

    // Score each batch by the average rank (in the final pass) of its anchor images.
    const batchScores = anchorsPerBatch.map((anchors, idx) => {
      const ranks = anchors.map((src) => anchorRank.get(src)).filter((r) => r !== undefined);
      const avg = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : idx;
      return { idx, avg };
    });
    batchScores.sort((a, b) => a.avg - b.avg);

    mergedOrdering = batchScores.flatMap(({ idx }) => batchResults[idx]);
  }

  return { mergedOrdering, miscategorized, reasons };
}

// ---------------------------------------------------------------------------
// Pass 3: derive flags from the merged ordering
// ---------------------------------------------------------------------------

function deriveFlags(category, images, mergedOrdering, reasons) {
  const bySrc = new Map(images.map((img) => [img.src, img]));
  const n = mergedOrdering.length;
  if (n === 0) return { promote: [], demote: [], removal: [] };

  const topCount = Math.max(1, Math.ceil(n * TOP_PROMOTE_PCT));
  const bottomDemoteCount = Math.max(1, Math.ceil(n * BOTTOM_DEMOTE_PCT));
  const bottomRemovalCount = Math.max(1, Math.ceil(n * BOTTOM_REMOVAL_PCT));

  const topSet = new Set(mergedOrdering.slice(0, topCount));
  const bottomDemoteSet = new Set(mergedOrdering.slice(n - bottomDemoteCount));
  const bottomRemovalSet = new Set(mergedOrdering.slice(n - bottomRemovalCount));

  const promote = [];
  const demote = [];
  const removal = [];

  for (const src of mergedOrdering) {
    const img = bySrc.get(src);
    if (!img) continue;

    if (topSet.has(src) && img.tier === 3) {
      promote.push({ img, reason: reasons[src] });
    }
    if (bottomDemoteSet.has(src) && img.tier === 1) {
      demote.push({ img, reason: reasons[src] });
    }
    if (bottomRemovalSet.has(src)) {
      removal.push({
        img,
        reason: reasons[src] || 'Ranked in the bottom 10% of its category; no specific note captured during batch review.',
      });
    }
  }

  return { promote, demote, removal };
}

// ---------------------------------------------------------------------------
// Report writing
// ---------------------------------------------------------------------------

function todayStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function relativeImageLink(src) {
  // src looks like /images/optimized/landscapes/foo.jpg
  return `../../public${src}`;
}

function mdImage(src) {
  return `![](${relativeImageLink(src)})`;
}

function buildMarkdown({ duplicates, missing, miscategorizedByCategory, promoteByCategory, demoteByCategory, removalByCategory }) {
  const lines = [];
  lines.push(`# Library Audit — ${todayStamp()}`, '');

  lines.push('## Duplicates', '');
  if (duplicates.length === 0) {
    lines.push('None found.', '');
  } else {
    for (const { filename, entries } of duplicates) {
      lines.push(`### ${filename}`, '');
      for (const entry of entries) {
        lines.push(`- ${mdImage(entry.src)} — category: \`${entry._category}\`, tier: ${entry.tier}, src: \`${entry.src}\``);
      }
      lines.push('');
    }
  }

  lines.push('## Missing files', '');
  if (missing.length === 0) {
    lines.push('None found.', '');
  } else {
    for (const img of missing) {
      lines.push(`- \`${img.src}\` — category: \`${img._category}\`, title: "${img.title}" (file not found on disk)`);
    }
    lines.push('');
  }

  lines.push('## Miscategorized', '');
  const allMiscategorized = Object.entries(miscategorizedByCategory).flatMap(([cat, list]) => list.map((m) => ({ ...m, category: cat })));
  if (allMiscategorized.length === 0) {
    lines.push('None found (or ranking pass not run — use `--yes`).', '');
  } else {
    for (const m of allMiscategorized) {
      lines.push(`- ${mdImage(m.src)}`);
      lines.push(`  Current category: \`${m.category}\` → Suggested: \`${m.suggestedCategory}\` — ${m.reason}`);
      lines.push('');
    }
  }

  lines.push('## Promote candidates (top ~15%, currently tier 3)', '');
  const allPromote = Object.entries(promoteByCategory).flatMap(([cat, list]) => list.map((p) => ({ ...p, category: cat })));
  if (allPromote.length === 0) {
    lines.push('None found (or ranking pass not run — use `--yes`).', '');
  } else {
    for (const p of allPromote) {
      lines.push(`- ${mdImage(p.img.src)}`);
      lines.push(`  Category: \`${p.category}\`, current tier: ${p.img.tier}, title: "${p.img.title}"${p.reason ? ` — ${p.reason}` : ''}`);
      lines.push('');
    }
  }

  lines.push('## Demote candidates (bottom ~25%, currently tier 1)', '');
  const allDemote = Object.entries(demoteByCategory).flatMap(([cat, list]) => list.map((d) => ({ ...d, category: cat })));
  if (allDemote.length === 0) {
    lines.push('None found (or ranking pass not run — use `--yes`).', '');
  } else {
    for (const d of allDemote) {
      lines.push(`- ${mdImage(d.img.src)}`);
      lines.push(`  Category: \`${d.category}\`, current tier: ${d.img.tier}, title: "${d.img.title}"${d.reason ? ` — ${d.reason}` : ''}`);
      lines.push('');
    }
  }

  lines.push('## Removal candidates (bottom ~10%)', '');
  const allRemoval = Object.entries(removalByCategory).flatMap(([cat, list]) => list.map((r) => ({ ...r, category: cat })));
  if (allRemoval.length === 0) {
    lines.push('None found (or ranking pass not run — use `--yes`).', '');
  } else {
    for (const r of allRemoval) {
      lines.push(`- ${mdImage(r.img.src)}`);
      lines.push(`  Category: \`${r.category}\`, current tier: ${r.img.tier}, title: "${r.img.title}" — ${r.reason}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function buildJsonReport({ duplicates, missing, miscategorizedByCategory, promoteByCategory, demoteByCategory, removalByCategory }) {
  const entries = [];

  for (const { entries: dupEntries } of duplicates) {
    for (const img of dupEntries) {
      entries.push({
        src: img.src,
        currentCategory: img._category,
        currentTier: img.tier,
        issue: 'duplicate',
        suggestion: null,
        reason: 'Filename appears more than once across the library.',
        accept: false,
      });
    }
  }

  for (const img of missing) {
    entries.push({
      src: img.src,
      currentCategory: img._category,
      currentTier: img.tier,
      issue: 'missing_file',
      suggestion: null,
      reason: 'File referenced in JSON but not found on disk.',
      accept: false,
    });
  }

  for (const [category, list] of Object.entries(miscategorizedByCategory)) {
    for (const m of list) {
      entries.push({
        src: m.src,
        currentCategory: category,
        currentTier: null,
        issue: 'miscategorized',
        suggestion: m.suggestedCategory,
        reason: m.reason,
        accept: false,
      });
    }
  }

  for (const [category, list] of Object.entries(promoteByCategory)) {
    for (const p of list) {
      entries.push({
        src: p.img.src,
        currentCategory: category,
        currentTier: p.img.tier,
        issue: 'promote_candidate',
        suggestion: 'tier 1 or 2',
        reason: p.reason || null,
        accept: false,
      });
    }
  }

  for (const [category, list] of Object.entries(demoteByCategory)) {
    for (const d of list) {
      entries.push({
        src: d.img.src,
        currentCategory: category,
        currentTier: d.img.tier,
        issue: 'demote_candidate',
        suggestion: 'tier 2 or 3',
        reason: d.reason || null,
        accept: false,
      });
    }
  }

  for (const [category, list] of Object.entries(removalByCategory)) {
    for (const r of list) {
      entries.push({
        src: r.img.src,
        currentCategory: category,
        currentTier: r.img.tier,
        issue: 'removal_candidate',
        suggestion: 'remove',
        reason: r.reason,
        accept: false,
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const yes = argv.includes('--yes');
  const help = argv.includes('--help');
  let category = null;
  const catIndex = argv.indexOf('--category');
  if (catIndex !== -1) {
    category = argv[catIndex + 1];
    if (!CATEGORIES.includes(category)) {
      console.error(`❌ Invalid category: ${category}`);
      console.error(`   Valid categories: ${CATEGORIES.join(', ')}`);
      process.exit(1);
    }
  }
  return { yes, help, category };
}

async function main() {
  console.log('\n🔎 Anu Photography - Library Audit\n');
  console.log('═'.repeat(50));

  const { yes, help, category } = parseArgs(process.argv.slice(2));

  if (help) {
    console.log(`
Usage:
  node scripts/audit-library.js                        Dry run: duplicates + missing files only
  node scripts/audit-library.js --yes                   Full audit, including API ranking pass
  node scripts/audit-library.js --yes --category events Audit a single category only

Options:
  --yes                Required to make API calls (cost guard)
  --category <name>    Audit only one category (${CATEGORIES.join(', ')})
  --help                Show this help message

Environment:
  ANTHROPIC_API_KEY    Your Anthropic API key (required with --yes)
`);
    return;
  }

  const categoriesToAudit = category ? [category] : CATEGORIES;
  const allImages = await loadAllImages(categoriesToAudit);

  console.log(`\n📊 Loaded ${allImages.length} images across ${categoriesToAudit.length} categor${categoriesToAudit.length === 1 ? 'y' : 'ies'}.`);

  console.log('\n🔍 Pass 1: duplicates + missing files (no API calls)...');
  const { duplicates, missing } = await findDuplicatesAndMissing(allImages);
  console.log(`   ${duplicates.length} duplicate filename group(s), ${missing.length} missing file(s).`);

  const estimatedBatches = categoriesToAudit.reduce((sum, cat) => {
    const count = allImages.filter((img) => img._category === cat).length;
    const batches = Math.ceil(count / BATCH_SIZE);
    // +1 for the final merge pass, only if more than one batch.
    return sum + batches + (batches > 1 ? 1 : 0);
  }, 0);

  console.log(`\n💰 Cost guard: ${allImages.length} images → an estimated ${estimatedBatches} API request(s) for the ranking pass.`);

  if (!yes) {
    console.log('\n⚠️  Skipping the category-fit + ranking pass (pass --yes to run it).');
  }

  let miscategorizedByCategory = {};
  let promoteByCategory = {};
  let demoteByCategory = {};
  let removalByCategory = {};

  if (yes) {
    await loadDotEnv();
    const client = getClient();

    console.log('\n🔍 Pass 2: category-fit + ranking (API)...');
    for (const cat of categoriesToAudit) {
      const images = allImages.filter((img) => img._category === cat);
      if (images.length === 0) continue;

      const { mergedOrdering, miscategorized, reasons } = await auditCategory(client, cat, images);
      miscategorizedByCategory[cat] = miscategorized;

      const { promote, demote, removal } = deriveFlags(cat, images, mergedOrdering, reasons);
      promoteByCategory[cat] = promote;
      demoteByCategory[cat] = demote;
      removalByCategory[cat] = removal;

      console.log(`   ${cat}: ${miscategorized.length} miscategorized, ${promote.length} promote, ${demote.length} demote, ${removal.length} removal candidate(s).`);
    }
  }

  const reportData = { duplicates, missing, miscategorizedByCategory, promoteByCategory, demoteByCategory, removalByCategory };

  const curationDir = path.join(PROJECT_ROOT, 'scripts/curation');
  await fs.mkdir(curationDir, { recursive: true });

  const stamp = todayStamp();
  const mdPath = path.join(curationDir, `audit-${stamp}.md`);
  const jsonPath = path.join(curationDir, `audit-${stamp}.json`);

  await fs.writeFile(mdPath, buildMarkdown(reportData));
  await fs.writeFile(jsonPath, JSON.stringify(buildJsonReport(reportData), null, 2));

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Audit written to:`);
  console.log(`   scripts/curation/audit-${stamp}.md`);
  console.log(`   scripts/curation/audit-${stamp}.json`);
  console.log();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
