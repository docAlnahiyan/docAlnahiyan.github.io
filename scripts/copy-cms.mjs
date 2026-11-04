// Copies the Sveltia CMS bundle (the admin app at /admin) from node_modules
// into public/admin/cms/, so the admin is served from this site instead of a
// third-party CDN. Runs before `astro dev` and `astro build` (package.json).
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
// The package doesn't export package.json, so find its folder from the main entry.
let pkgDir = dirname(require.resolve('@sveltia/cms'));
while (!existsSync(join(pkgDir, 'package.json'))) pkgDir = dirname(pkgDir);
const outDir = new URL('../public/admin/cms/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });
copyFileSync(join(pkgDir, 'dist/sveltia-cms.js'), join(outDir, 'sveltia-cms.js'));
console.log('Copied Sveltia CMS to public/admin/cms/');
