// Content model. Every page reads from these collections, and the build fails
// if an entry is missing a required field or has a malformed value, so mistakes
// made in the admin are caught before they reach the live site.
//
// Each fact has one home:
//   publications — the citation record (authors, venue, status, DOI, BibTeX)
//   research     — the plain-language story and the metrics
//   projects     — non-paper work
// Research entries point at their publication instead of repeating it.

import { defineCollection, reference } from 'astro:content';
import { ICON_KEYS } from './lib/icons';
import { FONT_KEYS } from './lib/theme';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { readdirSync } from 'node:fs';

/**
 * glob() for a folder that may hold no entries yet (Upwork items are added
 * from the admin): an empty folder loads nothing instead of logging a warning.
 */
const optionalFolder = (base: string, pattern: string) => {
  let hasEntries = false;
  try {
    hasEntries = readdirSync(base).some((f) => /\.mdx?$/.test(f));
  } catch {
    hasEntries = false;
  }
  return hasEntries ? glob({ pattern, base }) : { name: 'empty-folder', load: async () => {} };
};

// The admin writes an empty string when an optional field is cleared.
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
const optionalText = z.preprocess(blankToUndefined, z.string().optional());
const optionalUrl = z.preprocess(blankToUndefined, z.url().optional());

// Site-relative path (e.g. /uploads/scan.png) or a full URL.
const optionalImage = z.preprocess(
  blankToUndefined,
  z.string().regex(/^(\/|https?:\/\/)/, 'Use a path starting with / or a full URL').optional(),
);

const metrics = z
  .array(z.object({ label: z.string(), value: z.string() }))
  .default([]);

const tags = z.array(z.string()).default([]);

/** Shared by research and publications so the two can be checked against each other. */
export const PAPER_STATUS = ['published', 'under-review', 'preprint', 'in-progress'] as const;

const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    slug: optionalText,
    /** One line shown under the title in the index. */
    subtitle: z.string(),
    /** The paragraph revealed when the entry is expanded in the index. */
    short_summary: z.string(),
    tags,
    status: z.enum(PAPER_STATUS),
    /** The paper this research produced; its venue, DOI and BibTeX come from there. */
    publication: reference('publications').optional(),
    thumbnail: optionalImage,
    metrics,
    /** Only for links not already on the linked publication. */
    links: z
      .object({ doi: optionalUrl, code: optionalUrl, pdf: optionalUrl })
      .default({}),
    featured: z.boolean().default(false),
    /** Key of the animated walkthrough component for this entry, if one exists. */
    walkthrough: optionalText,
    /** Lower numbers are listed first. */
    order: z.number().default(100),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: optionalText,
    one_liner: z.string(),
    tags,
    repo_url: optionalUrl,
    /** A live, working version people can try (e.g. a Hugging Face Space). */
    demo_url: optionalUrl,
    /** Line icon shown in the project list (src/lib/icons.ts). */
    icon: z.enum(ICON_KEYS).default('code'),
    thumbnail: optionalImage,
    metrics,
    /** Month the work was completed. */
    date: z.coerce.date(),
    order: z.number().default(100),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    /** Short id used in links (e.g. /publications/#hybridtransmedformer). */
    slug: optionalText,
    /** IEEE style, e.g. "A.-N. Khushbu, Z. Yang, and X. Zhang". */
    authors: z.string(),
    venue: z.string(),
    /** Short venue label for tags, e.g. "IARCE 2024". */
    venue_short: optionalText,
    type: z.enum(['conference', 'journal', 'preprint', 'thesis']),
    /** Year published, submitted (under review) or posted (preprint). */
    year: z.number().int().min(2000).max(2100),
    /** Exact date, when known (e.g. a preprint's posting date). */
    date: z.preprocess(blankToUndefined, z.coerce.date().optional()),
    status: z.enum(PAPER_STATUS),
    pages: optionalText,
    award: optionalText,
    keywords: tags,
    /** Shown on the publication list; leave empty until the text is final. */
    abstract: optionalText,
    doi: optionalText,
    /** Link to the paper when there is no DOI, e.g. a preprint server page. */
    url: optionalUrl,
    code_url: optionalUrl,
    /** A paper-specific contact address, shown only on this entry. */
    contact_email: z.preprocess(blankToUndefined, z.email().optional()),
    bibtex: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: optionalText,
    date: z.coerce.date(),
    excerpt: z.string(),
    cover: optionalImage,
    /** Describes the cover for screen readers; the title is used if empty. */
    cover_alt: optionalText,
    /** Images shown as a gallery (with a lightbox) after the post. */
    gallery: z
      .array(z.object({ src: z.string().regex(/^(\/|https?:\/\/)/), alt: z.string(), caption: optionalText }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

const upwork = defineCollection({
  loader: optionalFolder('./src/content/upwork', '**/*.{md,mdx}'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    skills: tags,
    year: z.number().int().optional(),
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

// Single-file entries edited as forms in the admin.
const site = defineCollection({
  loader: glob({ pattern: 'profile.yml', base: './src/content/site' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    /** University or organisation, shown above the name on the home page. */
    affiliation: optionalText,
    /** Markdown; **bold** is allowed. */
    bio: z.string(),
    photo: optionalImage,
    // "About" card on the home page; empty fields are hidden.
    /** Short role line under the name on the card; falls back to `role`. */
    card_role: optionalText,
    research_area: optionalText,
    methods: optionalText,
    location: optionalText,
    links: z.object({
      cv: optionalText,
      scholar: optionalUrl,
      orcid: optionalUrl,
      github: optionalUrl,
      linkedin: optionalUrl,
      email: z.email(),
      upwork: optionalUrl,
    }),
  }),
});

// Site appearance (src/lib/theme.ts); every field is optional so a missing
// value falls back to the built-in design.
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a colour like #a8482b');
const palette = z
  .object({
    bg: hex, surface: hex, surface_2: hex, border: hex, ink: hex, ink_2: hex,
    accent: hex, accent_ink: hex, accent_wash: hex,
  })
  .partial();
const appearance = defineCollection({
  loader: glob({ pattern: 'theme.yml', base: './src/content/site' }),
  schema: z.object({
    use_default: z.boolean().default(false),
    light: palette.optional(),
    dark: palette.optional(),
    hero: z
      .object({ day_top: hex, day_middle: hex, day_horizon: hex, night_top: hex, night_bottom: hex })
      .partial()
      .optional(),
    fonts: z
      .object({ heading: z.enum(FONT_KEYS), hero_name: z.enum(FONT_KEYS), body: z.enum(FONT_KEYS), labels: z.enum(FONT_KEYS) })
      .partial()
      .optional(),
    style: z
      .object({
        roundness: z.enum(['sharp', 'soft', 'round']),
        heading_weight: z.coerce.number().int().min(300).max(800),
        cards: z.enum(['filled', 'outlined']),
      })
      .partial()
      .optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** CV page only: path to the PDF, e.g. /cv/al-nahiyan-khushbu-cv.pdf */
    pdf: optionalImage,
  }),
});

export const collections = { research, projects, publications, blog, upwork, site, appearance, pages };
