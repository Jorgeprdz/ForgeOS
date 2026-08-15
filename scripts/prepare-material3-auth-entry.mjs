import { copyFile, readFile, writeFile } from 'node:fs/promises';

// Historical filename and runtime path only. Material 3 design is not an authority.
// The productive login is governed exclusively by Forge Aura Light 2026 / ADR-024.
const indexPath = new URL('../docs/static-preview/forge-alive-material3/index.html', import.meta.url);
const runtimeRoot = new URL('../docs/static-preview/forge-alive-material3/', import.meta.url);

const canonicalAuthorities = [
  'forge-alive-auth-entry-067g17b1.css',
  'forge-alive-auth-entry-067g17b1.js',
  'forge-alive-public-config-067g17a1.js',
];

const authoritySources = await Promise.all(canonicalAuthorities.map(async (name) => {
  const source = await readFile(new URL(name, runtimeRoot), 'utf8');
  if (!source.trim()) throw new Error(`CANONICAL_AUTHORITY_EMPTY_${name}`);
  return [name, source];
}));
const authorityByName = new Map(authoritySources);
const authCss = authorityByName.get('forge-alive-auth-entry-067g17b1.css') || '';
const authJs = authorityByName.get('forge-alive-auth-entry-067g17b1.js') || '';

for (const prohibited of [
  '--forge-sys-',
  '#f5c75c',
  'rgba(7, 20, 44',
  'rgba(12, 33, 66',
]) {
  if (authCss.toLowerCase().includes(prohibited.toLowerCase())) {
    throw new Error(`AURA_LIGHT_LOGIN_PROHIBITED_VISUAL_SOURCE_${prohibited}`);
  }
}
for (const required of [
  'Forge Aura Light 2026',
  '--aura-brand: #6c3ce8',
  '--aura-canvas: #f7f8fc',
  '--aura-text-primary: #11152b',
]) {
  if (!authCss.includes(required)) throw new Error(`AURA_LIGHT_LOGIN_CSS_REQUIRED_${required}`);
}
for (const required of [
  "const DESIGN_AUTHORITY = 'FORGE_AURA_LIGHT_2026_V1'",
  'signInWithPassword',
  'material3DesignUsed: false',
]) {
  if (!authJs.includes(required)) throw new Error(`AURA_LIGHT_LOGIN_JS_REQUIRED_${required}`);
}

await copyFile(
  new URL('../advisor-os/contact-books/bulk-import-engine.js', import.meta.url),
  new URL('bulk-import-engine-pages.js', runtimeRoot),
);

let index = await readFile(indexPath, 'utf8');

for (const required of [
  'tokens.css?v=ui-m03-approved-001',
  'app.css?v=ui-m03-approved-004',
  'data-forge-application',
]) {
  if (!index.includes(required)) throw new Error(`CANONICAL_ENTRY_REQUIRED_${required}`);
}

index = index.replace(
  '<html lang="es-MX" data-forge-theme="dark">',
  '<html lang="es-MX" data-forge-theme="dark" data-forge-auth-boundary="resolving">',
);

const authStylesheet = '  <link rel="stylesheet" href="./forge-alive-auth-entry-067g17b1.css?v=aura-light-login-001" data-forge-auth-entry-styles="first-paint">';
if (!index.includes('data-forge-auth-entry-styles')) {
  index = index.replace(
    '  <link rel="stylesheet" href="./app.css?v=ui-m03-approved-004">',
    `  <link rel="stylesheet" href="./app.css?v=ui-m03-approved-004">\n${authStylesheet}`,
  );
}

const failClosed = `
  <style data-forge-auth-first-paint="FORGE_AUTH_FIRST_PAINT_FAIL_CLOSED_V1">
    html[data-forge-auth-boundary]:not([data-forge-auth-boundary="authenticated"]),
    html[data-forge-auth-boundary]:not([data-forge-auth-boundary="authenticated"]) body {
      min-height: 100%;
      margin: 0;
      background: #F7F8FC;
    }
    html:not([data-forge-auth-boundary="authenticated"]) [data-forge-module-viewport],
    html:not([data-forge-auth-boundary="authenticated"]) [data-forge-shell-controls],
    html:not([data-forge-auth-boundary="authenticated"]) [data-forge-alfred-sheet] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    [data-forge-early-auth-error] {
      box-sizing: border-box;
      max-width: 34rem;
      margin: 20vh auto 0;
      padding: 1rem 1.25rem;
      border: 1px solid #E1E4EC;
      border-radius: 1rem;
      color: #11152B;
      background: #FFFFFF;
      box-shadow: 0 10px 30px rgba(38,31,78,.10), 0 2px 8px rgba(38,31,78,.05);
      font: 600 1rem/1.45 Inter,system-ui,sans-serif;
      text-align: center;
    }
  </style>`;

if (!index.includes('data-forge-auth-first-paint')) {
  index = index.replace('</head>', `${failClosed}\n</head>`);
}

const authScripts = `
  <script type="module" src="./authenticated-route-guard.js?v=auth-first-paint-001"></script>
  <script type="module" src="./early-auth-bootstrap.js?v=aura-light-login-001"></script>`;

const appTag = /<script type="module" src="\.\/app\.js\?[^\"]+"><\/script>/;
if (!appTag.test(index)) throw new Error('CANONICAL_APP_ENTRY_MISSING');
if (!index.includes('early-auth-bootstrap.js')) {
  index = index.replace(appTag, `${authScripts}\n  $&`);
}

// Static fallback content remains only as an authenticated hydration skeleton.
index = index.replaceAll('Vista estática segura', 'Acceso protegido');
index = index.replaceAll('Solo lectura', 'Sesión requerida');
index = index.replace('Miércoles, 26 de julio', 'Cargando agenda actual…');
index = index.replace('Buenos días, Jorge', 'Bienvenido a ForgeOS');
index = index.replace('<span>JP</span>', '<span aria-hidden="true">—</span>');
index = index.replace(/[\t ]+\n/g, '\n');

for (const required of [
  'data-forge-auth-entry-styles="first-paint"',
  'authenticated-route-guard.js',
  'early-auth-bootstrap.js',
]) {
  if (!index.includes(required)) throw new Error(`CANONICAL_AUTH_ENTRY_REQUIRED_${required}`);
}

await writeFile(indexPath, index);
console.log('AUTH_FIRST_PAINT_FAIL_CLOSED=PASS');
console.log('AURA_LIGHT_LOGIN_FIRST_PAINT=PASS');
console.log('AURA_LIGHT_LOGIN_MATERIAL3_DESIGN=PROHIBITED');
console.log('CANONICAL_AUTHORITY=PASS');
console.log('BULK_ENGINE_PAGES_ASSET=STAGED');
