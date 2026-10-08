# Al-Nahiyan Khushbu — academic portfolio

Personal research site: research, publications, projects, blog, CV.
Built with [Astro](https://astro.build) as static HTML and deployed on Netlify.

## Run locally

Requires Node 22.12 or newer.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

## Layout

| Path | What it holds |
|---|---|
| `src/pages/` | One file per route |
| `src/layouts/BaseLayout.astro` | Page shell: SEO tags, theme script, nav, footer |
| `src/components/` | Small reusable pieces |
| `src/styles/global.css` | Design tokens (light and dark) and base styles |
| `src/site.ts` | Site name, default description, nav items |
| `design-reference/mockup.html` | The design this site follows |

## Deploy

Netlify builds from `main` using `netlify.toml`. The site URL used for
canonical links and the sitemap comes from Netlify's `URL` variable.

The previous React version of the site lives on the `old-react-site` branch.
