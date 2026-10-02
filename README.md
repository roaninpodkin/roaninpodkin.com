# roaninpodkin.com

Personal site built with [Astro](https://astro.build), TypeScript (strict), and Tailwind CSS v4. Hosted on GitHub Pages; DNS via Cloudflare.

## Develop

Open in **GitHub Codespaces** (Code → Codespaces → Create) — the dev container installs everything. Or locally with Node 22:

```sh
npm ci
npm run dev        # http://localhost:4321
```

| Command           | What it does                     |
| ----------------- | -------------------------------- |
| `npm run dev`     | Local dev server                 |
| `npm run build`   | Production build to `dist/`      |
| `npm run preview` | Serve the production build       |
| `npm run lint`    | ESLint (TS + Astro)              |
| `npm run format`  | Prettier (with Tailwind sorting) |
| `npm run check`   | Astro/TypeScript type check      |

## Deploy

Every push to `main` runs lint, type-check, and build, then deploys to GitHub Pages (`.github/workflows/deploy.yml`). Pull requests run the same checks without deploying.

## SEO

- Site metadata lives in `src/consts.ts`; per-page title/description via `BaseLayout` props.
- Canonical URLs, Open Graph/Twitter cards, and schema.org `Person` JSON-LD in `src/components/SEO.astro`.
- `sitemap-index.xml` (via `@astrojs/sitemap`) and `robots.txt` generated at build.
- Zero client JS by default, system font stack, compressed HTML, viewport prefetching.
