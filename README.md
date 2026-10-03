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

## Under construction mode

While the site is being built, the public domain serves the static page in `construction/` instead of the Astro build. This is controlled by the repo variable `SITE_MODE`:

```sh
gh variable set SITE_MODE --body live          # publish the real site
gh variable set SITE_MODE --body construction  # back to the "being built" page
```

Then re-run the deploy (`gh workflow run deploy.yml`) or push to `main`.

In construction mode the real site is still built and published at an **unlisted path**, `https://roaninpodkin.com/<PREVIEW_PATH>/` (repo variable `PREVIEW_PATH`), so it can be checked on any device. Preview builds are `noindex` and have no sitemap. Internal links go through `href()` in `src/lib/url.ts` so they work under either base path.

## Adding photos from a phone

Photos live in the **Logbook** (`src/content/logbook/<album>/album.json` + images). To add some from the GitHub app:

1. Open the repo in the GitHub app → **Issues** → **New issue** → choose **Add photos**.
2. Change the title to the album name, e.g. `Photos: Thailand 2025`.
3. Attach photos in the body. A line of text directly under a photo becomes its caption. Optionally fill in Place / Date / Caption.
4. Submit. `.github/workflows/photos.yml` runs `scripts/photos-from-issue.mjs`, which downloads, resizes (max 2000 px, JPEG) and commits the images, comments on the issue, closes it, and redeploys.

A second issue with the same title adds to the same album. Only issues opened by the repository owner are processed.

## Old site

`old-site/` holds the archived WordPress site (content, HTML, images) and the DNS records needed to point the domain back at it. See `old-site/README.md`.

## Structure

- `src/pages/index.astro` – the home page, a single "dive" from surface to sea floor. Section stops are defined in `src/consts.ts` (`DIVE`); `DepthGauge.astro` is the nav.
- `src/content/stories/*.md` – stories; `chart` in the front matter places each island on the sea chart (`SeaChart.astro`).
- `src/content/copy.json` – all other site copy.
- `src/content/logbook/` – photo albums.
- `old-site/` – archive of the previous WordPress site and its DNS records.

## SEO

- Site metadata lives in `src/consts.ts`; per-page title/description via `BaseLayout` props.
- Canonical URLs, Open Graph/Twitter cards, and schema.org `Person` JSON-LD in `src/components/SEO.astro`.
- `sitemap-index.xml` (via `@astrojs/sitemap`) and `robots.txt` generated at build.
- Zero client JS by default, system font stack, compressed HTML, viewport prefetching.
