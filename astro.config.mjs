// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Construction-mode deploys publish the real build under an unlisted sub-path
// (see .github/workflows/deploy.yml). Preview builds are noindexed and skip the sitemap.
const isPreview = process.env.PUBLIC_SITE_PREVIEW === '1';
const base = process.env.SITE_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://roaninpodkin.com',
  base,
  trailingSlash: 'ignore',
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    // Inline small stylesheets to avoid render-blocking requests.
    inlineStylesheets: 'auto',
    format: 'directory',
  },
  image: {
    responsiveStyles: true,
    layout: 'constrained',
  },
  integrations: isPreview ? [] : [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
