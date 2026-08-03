import { readFile, writeFile } from 'node:fs/promises';

const appPath = new URL(
  '../docs/static-preview/forge-alive-material3/app.js',
  import.meta.url,
);
const recoveryPath = new URL(
  '../docs/static-preview/forge-alive-material3/forge-ui-recovery.css',
  import.meta.url,
);
const loaderPath = new URL(
  '../docs/static-preview/forge-alive-material3/forge-ui-recovery-loader.js',
  import.meta.url,
);

const version = String(process.env.GITHUB_SHA || 'forge-ui-recovery-001').trim();
if (!version) throw new Error('FORGE_UI_RECOVERY_VERSION_REQUIRED');

await Promise.all([
  readFile(recoveryPath, 'utf8'),
  readFile(loaderPath, 'utf8'),
]);

const source = await readFile(appPath, 'utf8');
const legacyPattern = /import ["']\.\/legacy-ui-retirement\.js(?:\?[^"']*)?["'];/;
const legacyImport = 'import "./legacy-ui-retirement.js?v=legacy-ui-retirement-001&rescue=white-screen-002";';
const loaderPattern = /import ["']\.\/forge-ui-recovery-loader\.js(?:\?[^"']*)?["'];\n?/;
const loaderImport = `import "./forge-ui-recovery-loader.js?v=${version}";\n`;

if (!legacyPattern.test(source)) {
  throw new Error('FORGE_UI_RECOVERY_LEGACY_IMPORT_REQUIRED');
}

let versioned = source.replace(legacyPattern, legacyImport);
if (loaderPattern.test(versioned)) {
  versioned = versioned.replace(loaderPattern, loaderImport);
} else {
  versioned = versioned.replace(legacyImport, `${legacyImport}\n${loaderImport.trimEnd()}`);
}

if (!versioned.includes(loaderImport.trim())) {
  throw new Error('FORGE_UI_RECOVERY_LOADER_VERSIONING_FAILED');
}
if (!versioned.includes('rescue=white-screen-002')) {
  throw new Error('FORGE_WHITE_SCREEN_RESCUE_VERSIONING_FAILED');
}

if (versioned !== source) {
  await writeFile(appPath, versioned);
}
