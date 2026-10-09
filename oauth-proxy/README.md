# oauth-proxy

The GitHub sign-in service for the site editor at
https://docalnahiyan.github.io/admin/. It runs as the Netlify site
`alnahiyan-admin` (base directory: `oauth-proxy`) and hosts nothing else;
visiting it redirects to the portfolio.

- `netlify/functions/oauth.mjs` handles `/auth` (start GitHub sign-in) and
  `/callback` (exchange the code, hand the token to the editor window).
- `public/index.html` is the redirect page.

Required Netlify environment variables (set in the Netlify dashboard, never
committed): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.

The GitHub OAuth app's callback URL must be
`https://alnahiyan-admin.netlify.app/callback`.
