import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);

const read = async (relative) =>
  readFile(new URL(relative, root), "utf8");

const parser = await read(
  "docs/static-preview/quote-preview-live/" +
  "forge-pdf-browser-parser.js",
);
const loader = await read(
  "docs/static-preview/forge-alive/" +
  "forge-alive-runtime-lazy-loader-r16j1c1.js",
);
const page = await read(
  "docs/static-preview/forge-alive/index.html",
);
const packageJson = JSON.parse(
  await read(
    "docs/static-preview/quote-preview-live/" +
    "forge-pdfjs-4.10.38.package.json",
  ),
);

const pdfModuleUrl = new URL(
  "docs/static-preview/quote-preview-live/" +
  "forge-pdfjs-4.10.38.js",
  root,
);
const workerUrl = new URL(
  "docs/static-preview/quote-preview-live/" +
  "forge-pdfjs-worker-4.10.38.js",
  root,
);
const licenseUrl = new URL(
  "docs/static-preview/quote-preview-live/" +
  "forge-pdfjs-4.10.38.LICENSE",
  root,
);

for (const url of [pdfModuleUrl, workerUrl, licenseUrl]) {
  const metadata = await stat(url);
  assert.ok(metadata.isFile());
  assert.ok(metadata.size > 0);
}

assert.equal(packageJson.name, "pdfjs-dist");
assert.equal(packageJson.version, "4.10.38");
assert.equal(packageJson.license, "Apache-2.0");

for (const token of [
  'PDFJS_VENDOR_VERSION_107Z15P2_R11E = "4.10.38"',
  "PDFJS_LOCAL_MODULE_URL_107Z15P2_R11E",
  "PDFJS_LOCAL_WORKER_URL_107Z15P2_R11E",
  'source: "LOCAL_VENDOR"',
  "remoteRuntimeDependency: false",
  '"forge:pdfjs-runtime-ready"',
  "withPdfTimeoutR16J1C1",
]) {
  assert.ok(parser.includes(token), `missing ${token}`);
}

assert.ok(
  !parser.includes("disableWorker: true"),
  "local worker must keep PDF parsing off the main thread",
);

for (const forbidden of [
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@",
  "https://unpkg.com/pdfjs-dist@",
  "PDFJS_CDN_VERSION_107Z15P2_R11E",
]) {
  assert.ok(
    !parser.includes(forbidden),
    `remote runtime token remains: ${forbidden}`,
  );
}

assert.ok(
  loader.includes(
    "forge-pdf-browser-parser.js" +
      "?v=r16j1c1-nonblocking-route-20260716-1",
  ),
);
assert.ok(
  loader.includes(
    '"R16J1C1_RUNTIME_LAZY_03C1_PARSER_FIRST"',
  ),
);
assert.match(
  page,
  /forge-alive-runtime-lazy-loader-r16j1c1\.js\?v=r16j1c1-nonblocking-route-20260716-1/,
);

console.log(
  "PASS R16J1C1 03B1 local PDF.js runtime contract",
  {
    pdfJsVersion: "4.10.38",
    runtimeSource: "LOCAL_VENDOR",
    remoteRuntimeDependency: false,
    modulePresent: true,
    workerPresent: true,
    licensePresent: true,
    realPdfGate: "PENDING_03C",
  },
);
