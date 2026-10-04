import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stories = defineCollection({
  // One folder per story: src/content/stories/<slug>/index.md
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/stories',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      place: z.string(),
      dateLabel: z.string(),
      date: z.coerce.date(),
      excerpt: z.string(),
      /** Show the excerpt under the title in the reader and on the story page. */
      showExcerpt: z.boolean().default(true),
      /** Position in the chain. Side quests sit outside the chain. */
      order: z.number(),
      quest: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      /** Where the island sits on the sea chart (1000 × 620 viewBox). */
      chart: z.object({
        x: z.number(),
        y: z.number(),
        r: z.number(),
        seed: z.number(),
        kind: z.enum(['island', 'quests']).default('island'),
        labelAt: z.enum(['r', 'l', 't', 'b']).default('r'),
      }),
    }),
});

const logbook = defineCollection({
  loader: glob({ pattern: '*/album.json', base: './src/content/logbook' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      place: z.string().optional(),
      /** [latitude, longitude] for the world map pin. */
      coords: z.tuple([z.number(), z.number()]).optional(),
      /** Display date, e.g. "Aug 2026". */
      date: z.string().optional(),
      /** Sortable date, YYYY-MM-DD. */
      sortDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      caption: z.string().optional(),
      photos: z.array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('image'),
            src: image(),
            alt: z.string().optional(),
            caption: z.string().optional(),
          }),
          z.object({
            kind: z.literal('video'),
            /** Public path, e.g. /logbook/<album>/clip.mp4 */
            src: z.string(),
            poster: image().optional(),
            caption: z.string().optional(),
          }),
        ]),
      ),
    }),
});

export const collections = { stories, logbook };
