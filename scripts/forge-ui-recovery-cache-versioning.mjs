import { readFile, writeFile } from 'node:fs/promises';

const appPath = new URL(
  '../docs/static-preview/forge-alive-material3/app.js',
  import.meta.url,
);
const recoveryPath = new URL(
  '../docs/static-preview/forge-alive-material3/forge-ui-recovery.css',
  import.meta.url,
);

const version = String(process.env.GITHUB_SHA || 'forge-ui-recovery-001').trim();
if (!version) throw new Error('FORGE_UI_RECOVERY_VERSION_REQUIRED');

await readFile(recoveryPath, 'utf8');
const source = await readFile(appPath, 'utf8');
const importPattern = /\.\/legacy-ui-retirement\.js(?:\?[^"']*)?/;
const expectedImport = `./legacy-ui-retirement.js?v=${version}`;

if (!importPattern.test(source)) {
  throw new Error('FORGE_UI_RECOVERY_LOADER_VERSIONING_FAILED');
}

const versioned = source.replace(importPattern, expectedImport);
if (versioned !== source) {
  await writeFile(appPath, versioned);
}
