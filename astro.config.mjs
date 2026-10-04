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
    defaultStrategy: 'hover',
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
  // Old WordPress URLs that Google still lists; send visitors to the closest new page.
  redirects: {
    '/author/roanin/': '/about/',
    '/category/uncategorized/': '/stories/',
    '/proof/': '/stories/',
    '/demos/': '/now/',
    '/days-with-roanin-episode-1/': '/stories/side-quests/',
    '/perceived-influence-to-the-real-thing/': '/stories/side-quests/',
    '/hiked-a-14er-with-jason-amato/': '/stories/side-quests/',
    '/sdr-in-a-room-of-contractors/': '/stories/side-quests/',
    '/seven-icp-demos-that-workshop/': '/stories/side-quests/',
    '/retire-by-30-is-on-my-wall/': '/about/',
    '/owners-buy-trust/': '/stories/side-quests/',
    '/airport-tape-at-night/': '/stories/side-quests/',
    '/the-magic-berry-i-just-lived/': '/stories/side-quests/',
    '/phone-proof-at-denver-airport/': '/stories/side-quests/',
    '/feed/': '/',
  },
  integrations: isPreview
    ? []
    : [
        sitemap({
          // Mark every page as updated at this build so crawlers re-fetch it.
          serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
        }),
      ],
  vite: {
    plugins: [tailwindcss()],
  },
});
