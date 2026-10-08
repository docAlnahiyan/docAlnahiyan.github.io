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

## Editing content

All content lives in `src/content/` and is edited through the admin at
`/admin` (Decap CMS). Each save commits to `main`, and Netlify rebuilds the
site. Only GitHub accounts with write access to this repository can save.
Uploaded images go to `public/uploads/`.

To try the admin on your own computer without logging in:

```sh
npx decap-server@3.11.3   # terminal 1: local file proxy on :8081
npm run dev               # terminal 2: then open http://localhost:4321/admin/index.html
```

Local saves write files directly; nothing is committed until you commit.

If a save leaves content inconsistent (for example, a research entry whose
status disagrees with its publication), the build stops with a plain message
and the live site keeps its previous version until the content is fixed.

## Deploy

Netlify builds from `main` using `netlify.toml`. The site URL used for
canonical links and the sitemap comes from Netlify's `URL` variable.

The previous React version of the site lives on the `old-react-site` branch.
