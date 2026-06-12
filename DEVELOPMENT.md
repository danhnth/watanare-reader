# Development, Build & Deploy Guide

> How to set up, develop, build, and deploy the Watanare Reader project.

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (bundled with Node.js)
- **Git**

---

## 1. Project Setup

### Clone & Install

```bash
cd novels-reader-main-reference
npm install
```

### Environment Variables

The app requires Supabase credentials for authentication, comments, and guestbook features.

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in your Supabase project URL and anon key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

> For detailed Supabase schema setup (tables, auth, storage), see [`SUPABASE_MIGRATION_GUIDE.md`](./SUPABASE_MIGRATION_GUIDE.md).

### Add EPUB Source Files

The reader parses EPUB files at **build time**. Place your Watanare EPUBs in:

```
public/books/watanare/
```

The build script looks for filenames matching the `volumeNumber` defined in `data/watanare.ts` (e.g. `Volume 01.epub`).

---

## 2. Development

Start the Next.js dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Key Notes for Development

- **Static Export**: `next.config.ts` sets `output: 'export'`. There is no server-side runtime; every route must be statically renderable.
- **Tailwind v4**: Styling is configured via `@theme` in `app/globals.css`. There is no `tailwind.config.js`.
- **Reader Images**: Chapter HTML uses raw `<img>` tags (not `next/image`) because content is injected as a string. The EPUB parser handles path rewriting and lazy loading.

---

## 3. Build

Run the full production build:

```bash
npm run build
```

This executes the following steps in order:

1. **`tsx scripts/generate-mappings.ts`**
   - Parses every EPUB in `public/books/watanare/`
   - Generates `lib/chapter-mappings.ts` with volume/chapter metadata

2. **`tsx scripts/extract-images.ts`**
   - Extracts images from EPUBs
   - Converts them to WebP (quality 80) via `sharp`
   - Writes to `public/images/books/`

3. **`next build`**
   - Static export to `out/`
   - `generateStaticParams` pre-renders every chapter of every volume

4. **`tsx scripts/clean-build.ts`**
   - Deletes original `.jpg`/`.png`/spacer files from `out/images/books/`
   - Ensures the final output stays under Cloudflare Pages' 20,000 file limit

### Generated Artifacts

The following files are created during the build and are **gitignored**:

- `lib/chapter-mappings.ts`
- `public/images/books/`
- `out/`

Do not commit them.

---

## 4. Deploy

The project is configured for **Cloudflare Pages** via `wrangler.toml`:

```toml
name = "watanare-reader"
pages_build_output_dir = "out"
```

### Option A: Wrangler CLI

If you have the Cloudflare CLI installed:

```bash
npx wrangler pages deploy out
```

### Option B: Git Integration

Connect your GitHub repository in the Cloudflare Dashboard and point it to the `novels-reader-main-reference/` directory. Cloudflare Pages will run `npm run build` automatically on every push.

### Environment Variables on Cloudflare

Make sure to add your Supabase environment variables in the Cloudflare Pages dashboard under **Settings > Environment variables** so the build process can access them:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## 5. Linting

```bash
npm run lint
```

Runs ESLint with the flat config (`eslint.config.mjs`), extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

---

## Troubleshooting

| Issue | Cause / Fix |
|-------|-------------|
| Build fails with "Missing EPUBs" | Ensure `public/books/watanare/` contains EPUB files matching the volume metadata in `data/watanare.ts`. |
| `out/` is too large for Cloudflare | The `clean-build.ts` script should strip raw images. If still too large, reduce the number of EPUBs or lower WebP quality in `scripts/extract-images.ts`. |
| Supabase errors at runtime | Verify `.env.local` is populated and the Supabase schema is fully set up (see `SUPABASE_MIGRATION_GUIDE.md`). |

---

## Project Structure Reference

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages and layout |
| `data/watanare.ts` | Hardcoded volume metadata |
| `lib/epub-parser.ts` | Core EPUB parsing engine |
| `lib/watanare-volumes.ts` | Volume data accessor (preferred) |
| `public/books/watanare/` | Source EPUB files |
| `scripts/` | Build-time utilities (gitignored but essential) |
| `out/` | Static export output (gitignored) |
