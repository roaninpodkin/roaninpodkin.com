import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stories = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/stories' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      place: z.string(),
      dateLabel: z.string(),
      date: z.coerce.date(),
      excerpt: z.string(),
      order: z.number(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      /** Where the island sits on the sea chart (1000 × 640 viewBox). */
      chart: z.object({
        x: z.number(),
        y: z.number(),
        r: z.number(),
        seed: z.number(),
        kind: z.enum(['island', 'atoll', 'peak']).default('island'),
        labelAt: z.enum(['r', 'l', 't', 'b']).default('r'),
      }),
    }),
});

const photo = z.object({
  kind: z.literal('image').default('image'),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

const logbook = defineCollection({
  loader: glob({ pattern: '*/album.json', base: './src/content/logbook' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      place: z.string().optional(),
      /** Display date, e.g. "Aug 2026". */
      date: z.string().optional(),
      /** Sortable date, YYYY-MM-DD. */
      sortDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      caption: z.string().optional(),
      photos: z.array(
        z.discriminatedUnion('kind', [
          photo.extend({ kind: z.literal('image'), src: image() }),
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
