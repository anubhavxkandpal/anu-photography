# Image Curation System — Plan & Task Specs

Written July 2026. This documents the planned workflow for sorting, categorizing, rating, and ordering gallery images, plus ready-to-paste task specs for an AI model to build the tooling. Nothing here is built yet.

## Why

- **Duplicates across categories.** Some images were added to two categories when the right one wasn't obvious (e.g. `A7400955.jpg` existed in both landscapes and travel until removed). Each photo should live in exactly one category.
- **Miscategorized images.** Some images sit in the wrong gallery (e.g. dog portraits used as the wildlife hero).
- **Tier drift.** The `tier` field (1 = featured, 2 = great, 3 = good) controls display order, but assignments are stale. Visitors only see the first few images when they scroll — **the top of every gallery must be the strongest work.**
- **Weak images.** Some photos shouldn't be on the site at all.
- **New images waiting.** There's a backlog to add, and the intake process should categorize/tag/rate in one pass instead of the current multi-step dance.

## How it works today

- Content database: `src/data/{category}.json` — six files, each `{ category: {...}, images: [...] }`. Every image has `src`, `alt`, `title`, `location`, `date`, `category`, `tier` (1–3), `width`, `height`, optional `tags`.
- Display order: tier ascending, then date descending (see `sortGalleryImages` in `src/data/types.ts`).
- Intake pipeline: drop photos in `public/images/staging/{category}/` → `npm run optimize:{category}` (Sharp, max 2000px, ~500KB) → `npm run auto-tag` (Claude vision suggests tags → review file in `scripts/tag-suggestions/`) → `npm run apply-tags` → manually add entries to the JSON.
- Existing precedent: `scripts/auto-tag.js` already sends images to the Claude API and follows the **machine suggests → human approves → script applies** pattern. The curation system extends that same pattern.

## What the model can and cannot judge

Vision models (use `claude-sonnet-5`) are reliable for: composition, exposure problems, subject strength, category fit, near-duplicate detection, and comparative ranking within a batch ("rank these 20") — which maps directly to tiers.

They are NOT reliable for: pixel-level sharpness/focus, noise/grain (they see a downscaled image), and they have generic aesthetic taste that undervalues unconventional personal work.

**Rule: the model triages, the photographer decides.** Every output is a suggestion file that a human reviews before anything is applied. Ask the model for comparative judgments within a category batch, not absolute scores — models are far more consistent at ranking than scoring.

## The two tools to build

### Tool 1: Library audit (`scripts/audit-library.js`)

Reviews the ~250 existing images and flags only *exceptions*, so the human reviews a short list instead of everything:

- **Duplicates**: same or near-identical file in two categories (start cheap: identical filenames across category folders; then let the model compare suspiciously similar images).
- **Miscategorized**: image whose content clearly belongs in a different category.
- **Tier disagreements**: within each category, the model ranks all images; images whose model-rank strongly disagrees with their current tier get flagged (both "underrated — promote toward tier 1" and "overrated — demote").
- **Removal candidates**: images the model ranks at the very bottom of their category.

Output: `scripts/curation/audit-YYYY-MM-DD.md` — a human-reviewable markdown report, one section per issue type, each entry showing the image path (as a markdown image link so it previews), current category/tier, the suggestion, and a one-line reason. Plus a machine-readable `audit-YYYY-MM-DD.json` with the same content for the apply step.

### Tool 2: Curated intake (`scripts/curate-new.js`)

Replaces the tag-only step for new images. For each optimized image in a batch (from the newest manifest in `scripts/manifests/`, same mechanism as `auto-tag.js --new`), one API call returns structured JSON:

- `category` — one of the six
- `tier` — 1/2/3, judged *relative to the existing images in that category* (include a few reference images from each tier in the prompt for calibration)
- `tags` — from the curated vocabulary in `src/data/types.ts`
- `title` and `alt` — short, human-sounding, no filename-based titles like "Landscape A7400955"
- `location` guess if evident (else empty), `quality_note` — one line, e.g. "strong silhouette, clean composition" or "horizon tilted, busy background"

Output: same two-file pattern (`scripts/curation/intake-<date>.md` + `.json`).

### Tool 3: Apply (`scripts/apply-curation.js`)

Reads a reviewed `.json` from `scripts/curation/` (the human edits/deletes lines they disagree with in the markdown, then mirrors accepted items in the json — or simpler: the json has an `accept: true/false` field per item defaulting to false, human flips the ones they agree with). Then:

- Moves/updates entries between category JSON files (and moves the optimized file to the right category folder when the category changes)
- Updates tiers
- Removes rejected images (JSON entry + `git rm` the file — never plain delete)
- Adds new intake entries with all fields populated

Run `npm run build` after every apply as a sanity check.

## Human workflow once built

1. `node scripts/audit-library.js` (once, then occasionally) — get the exceptions report
2. Open the `.md`, look at each flagged image, flip `accept` on the ones you agree with in the `.json`
3. `node scripts/apply-curation.js scripts/curation/audit-<date>.json`
4. For new photos: staging → `npm run optimize:{category}` → `node scripts/curate-new.js` → review → apply
5. Commit, push, verify on Netlify

Cost note: ~250 images through Sonnet vision is roughly one API call each with a small image — expect a few dollars, not tens. `ANTHROPIC_API_KEY` must be set in `.env` (same as auto-tag).

---

## TASK SPEC A — build the audit tool (paste this to the executing model)

**Project:** Astro 5 photography portfolio. Gallery content in `src/data/{landscapes,wildlife,portraits,travel,artsy,events}.json` (shape documented in `src/data/types.ts`: images have `src`, `alt`, `title`, `location`, `date`, `category`, `tier` 1–3, `width`, `height`, `tags`). Images live in `public/images/optimized/{category}/`. `scripts/auto-tag.js` is the reference for calling the Claude API with images (Anthropic SDK is installed, `ANTHROPIC_API_KEY` in `.env`); reuse its image-loading/API patterns. Use model `claude-sonnet-5`.

**Build `scripts/audit-library.js`** (ESM, like the other scripts) that:

1. Loads all six JSON files.
2. **Duplicate pass (no API):** flags identical filenames appearing in more than one category folder, and entries whose `src` file is missing on disk.
3. **Category-fit + ranking pass (API):** for each category, send images in batches (~10–15 per request, resized down if needed to stay under request limits) and ask the model to (a) flag any image that clearly belongs in a different one of the six categories, with the suggested category and a one-line reason, and (b) rank the batch from strongest to weakest with a one-line reason for the top and bottom entries. Merge batch rankings into an approximate category-wide ordering (e.g. run a final ranking pass over each batch's top and bottom picks).
4. **Derive flags:** tier disagreements = images in the top ~15% of the model ordering that are tier 3 ("promote candidate") or bottom ~25% that are tier 1 ("demote candidate"); removal candidates = bottom ~10% of each category with a negative quality note.
5. **Write two outputs** to `scripts/curation/` (create the dir): `audit-YYYY-MM-DD.md` — sections for Duplicates, Missing files, Miscategorized, Promote, Demote, Removal candidates; each entry shows the image inline (`![](../../public/images/optimized/...)` relative link), current category/tier, suggestion, reason. And `audit-YYYY-MM-DD.json` — array of `{src, currentCategory, currentTier, issue, suggestion, reason, accept: false}`.
6. **Cost guard:** print image count and estimated request count, and require a `--yes` flag before making API calls. Support `--category landscapes` to audit one category only.
7. Add npm script `"audit-library": "node scripts/audit-library.js"`. Do NOT modify any JSON data files or delete anything — this tool only reports.

**Verify:** run `node scripts/audit-library.js --category events --yes` (smallest category, 15 images) end-to-end; confirm both output files are written and the markdown previews images correctly in VS Code. Commit as `feat: library audit tool for image curation` with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

## TASK SPEC B — build the apply tool (run after A is reviewed)

**Build `scripts/apply-curation.js`** taking a path to a reviewed audit/intake `.json`. For every entry with `accept: true`:

- `miscategorized` → move the image file to the suggested category folder (`git mv`), move the JSON entry to that category's file, update its `src` and `category` fields
- `promote`/`demote` → update `tier`
- `removal` → remove the JSON entry and `git rm` the image file (never plain `rm`)
- `duplicate` → keep the copy in the suggested category, remove the other (JSON entry + `git rm`)
- `intake` entries (from the future curate-new tool) → append the full entry to the right category JSON

Print a summary of every change made; skip (with a warning) entries whose files/JSON records can't be found; run nothing destructive for `accept: false`. Add npm script `"apply-curation"`. Verify with `npm run build` afterward. Commit as `feat: apply tool for reviewed curation decisions`.

---

## TASK SPEC C — build the curated intake tool (optional, after A+B work)

**Build `scripts/curate-new.js`**: like `auto-tag.js --new` it reads the newest manifest(s) in `scripts/manifests/`, but for each image one API call returns structured JSON: `category`, `tier` (calibrated by including 2 example images from each tier of the target category in the prompt), `tags` (validated against `ALL_TAGS` in `src/data/types.ts`), `title` + `alt` (human-sounding, never filename-derived), `location` (empty if not evident), `quality_note`. Writes `scripts/curation/intake-YYYY-MM-DD.{md,json}` in the same format as the audit tool, with `issue: "intake"` and `accept: false`, consumable by `apply-curation.js`. Same `--yes` cost guard. Commit as `feat: curated intake tool for new images`.
