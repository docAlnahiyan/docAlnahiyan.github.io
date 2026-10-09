// GitHub OAuth for the Decap CMS admin at https://docalnahiyan.github.io/admin/.
//
//   /auth      Decap opens this in a popup; it redirects to GitHub's consent
//              page with a one-time `state` value (also set as a cookie).
//   /callback  GitHub redirects here with a code. The code is exchanged for a
//              token, and the token is handed to the admin window using the
//              postMessage handshake Decap expects. It is posted ONLY to the
//              admin's origin, so no other page can receive it.
//
// Needs two environment variables on the Netlify site (never in the repo):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const ADMIN_ORIGIN = 'https://docalnahiyan.github.io';
const ALLOWED_SCOPES = new Set(['public_repo', 'repo']);
const STATE_COOKIE = 'decap_oauth_state';

// Static script for the callback page. It reads the message from a JSON
// block, so the script itself never changes and can be allowed by its hash.
const HANDOFF_SCRIPT = `
(() => {
  const { message, origin } = JSON.parse(document.getElementById('handoff').textContent);
  if (!window.opener) {
    document.getElementById('status').textContent =
      'Sign-in finished, but the editor window could not be found. Close this window and try again.';
    return;
  }
  window.addEventListener('message', function reply(e) {
    if (e.origin !== origin || e.data !== 'authorizing:github') return;
    window.removeEventListener('message', reply);
    window.opener.postMessage(message, origin);
  });
  window.opener.postMessage('authorizing:github', origin);
})();
`;
const SCRIPT_HASH = `sha256-${createHash('sha256').update(HANDOFF_SCRIPT).digest('base64')}`;

export const config = { path: ['/auth', '/callback'] };

export default async function handler(req) {
  const url = new URL(req.url);
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  if (url.pathname === '/auth') return startLogin(url);
  if (url.pathname === '/callback') return finishLogin(req, url);
  return new Response('Not found', { status: 404 });
}

function startLogin(url) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return handoffPage({ error: 'The sign-in service is not configured (missing client ID).' });

  const requested = url.searchParams.get('scope') ?? 'public_repo';
  const scope = ALLOWED_SCOPES.has(requested) ? requested : 'public_repo';
  const state = randomBytes(24).toString('base64url');

  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', clientId);
  github.searchParams.set('redirect_uri', `${url.origin}/callback`);
  github.searchParams.set('scope', scope);
  github.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: github.href,
      'Set-Cookie': `${STATE_COOKIE}=${state}; Path=/callback; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}

async function finishLogin(req, url) {
  const clearCookie = `${STATE_COOKIE}=; Path=/callback; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

  if (url.searchParams.get('error')) {
    return handoffPage({ error: url.searchParams.get('error_description') ?? 'GitHub sign-in was cancelled.' }, clearCookie);
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  const expected = readCookie(req.headers.get('cookie'), STATE_COOKIE) ?? '';
  if (!code || !safeEqual(state, expected)) {
    return handoffPage({ error: 'Sign-in could not be verified (state mismatch). Please try again.' }, clearCookie);
  }

  const { GITHUB_CLIENT_ID: clientId, GITHUB_CLIENT_SECRET: clientSecret } = process.env;
  if (!clientId || !clientSecret) {
    return handoffPage({ error: 'The sign-in service is not configured (missing client credentials).' }, clearCookie);
  }

  let token;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) {
      return handoffPage({ error: data.error_description ?? 'GitHub did not return a token.' }, clearCookie);
    }
    token = data.access_token;
  } catch {
    return handoffPage({ error: 'Could not reach GitHub to finish sign-in.' }, clearCookie);
  }

  return handoffPage({ token }, clearCookie);
}

/** The popup page that passes the result to the admin window, then closes. */
function handoffPage(result, setCookie) {
  const message = result.token
    ? `authorization:github:success:${JSON.stringify({ token: result.token, provider: 'github' })}`
    : `authorization:github:error:${JSON.stringify({ message: result.error })}`;
  // Escape "<" so the JSON can't end the <script> block early.
  const payload = JSON.stringify({ message, origin: ADMIN_ORIGIN }).replace(/</g, '\\u003c');
  const status = result.token ? 'Signed in. You can close this window.' : `Sign-in failed: ${escapeHtml(result.error)}`;

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing in…</title></head>
<body>
<p id="status">${status}</p>
<script type="application/json" id="handoff">${payload}</script>
<script>${HANDOFF_SCRIPT}</script>
</body>
</html>`;

  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': `default-src 'none'; script-src '${SCRIPT_HASH}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  };
  if (setCookie) headers['Set-Cookie'] = setCookie;
  return new Response(html, { status: result.token ? 200 : 400, headers });
}

function readCookie(header, name) {
  for (const part of (header ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
