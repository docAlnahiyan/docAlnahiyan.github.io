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
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
    /** IEEE style, e.g. "A. N. Khushbu, Z. Yang, and X. Zhang". */
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
    draft: z.boolean().default(false),
  }),
});

const upwork = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/upwork' }),
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
    /** Markdown; **bold** is allowed. */
    bio: z.string(),
    photo: optionalImage,
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

const pages = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** CV page only: path to the PDF, e.g. /cv/al-nahiyan-khushbu-cv.pdf */
    pdf: optionalImage,
  }),
});

export const collections = { research, projects, publications, blog, upwork, site, pages };
