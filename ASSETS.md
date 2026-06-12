# Asset Management Guide

> How images get from EPUBs into the app, and how to keep things tidy.

## The Pipeline (What Happens on `npm run build`)

1. **`tsx lib/generate-mappings.ts`** — Parses every EPUB in `public/books/` and generates `lib/chapter-mappings.ts` (spine index → chapter number mapping).
2. **`tsx scripts/extract-images.ts`** — Extracts images from each EPUB, converts them to WebP, and writes them to `public/images/books/{volume-id}/`.
3. **`next build`** — Static export to `out/`.
4. **`tsx scripts/clean-build.ts`** — Deletes original `.jpg`/`.png`/spacer files from `out/images/books/` to stay under Cloudflare Pages' 20k file limit.

## Extracted Image Directory

```
public/images/books/
  watanare-v1/
    cover.webp
    kuchie-001.webp
    p015.webp
    ...
  watanare-v2/
    cover.webp
    ...
```

Images are stored **flat** inside each volume directory. The old `item/image/` nesting from the EPUB internal structure is stripped.

## How to Update Images (When You Get a New EPUB)

1. **Place the new EPUB** in the correct directory:
   - `public/books/watanare/Volume 01.epub`
   - `public/books/watanare/Volume 02.epub`
   - etc.

2. **Run the extraction script** (or just `npm run build`):
   ```bash
   npm run extract-images
   ```

3. **Done.** The script will:
   - Wipe the old images for that volume
   - Extract the new ones
   - Convert them to WebP at 80% quality
   - Write them flat into `public/images/books/{volume-id}/`

## Cover Images

Cover images for the volume selector are **manually managed** in:

```
public/assets/watanare/covers/
  v1.jpg
  v2.jpg
  v3.jpg
  ...
```

These are **not** extracted from EPUBs. You must place them yourself. They are referenced by the `coverImage` field in `data/watanare.ts`.

## Homepage Slideshow Images

The homepage background slideshow uses images from:

```
public/assets/watanare/covers/
```

You can swap them out in `app/page.tsx` by editing the `DEFAULT_SLIDESHOW_IMAGES` array.

## Generated Files (Gitignored)

- `lib/chapter-mappings.ts` — Auto-generated from EPUBs
- `public/images/books/` — Auto-generated from EPUBs
- `out/` — Next.js static export

**Do not commit these.** They are rebuilt on every `npm run build`.

## Troubleshooting

| Problem | Solution |
|---|---|
| `Could not find EPUB for v1` | Check that the EPUB filename matches `Volume 01.epub`, `Volume 1.epub`, or `1.epub` inside `public/books/watanare/` |
| Old images still showing | The script now auto-cleans the volume directory before extraction. If you see ghosts, delete `public/images/books/{volume-id}/` manually and re-run |
| `sharp` conversion fails | The non-convertible file is written as-is. Check Node.js version and `sharp` installation |

## Scripts Reference

| Script | What it does |
|---|---|
| `npm run extract-images` | Runs only the image extraction step |
| `npm run build` | Full pipeline: mappings → images → next build → cleanup |
