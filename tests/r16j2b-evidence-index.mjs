import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";

const root =
  process.env.FORGE_R16J2B_EVIDENCE_ROOT ||
  "/storage/emulated/0/Download/R16J2B_STAGE_ALIGNMENT_EVIDENCE";

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function dimensions(buffer) {
  if (
    buffer.length < 24 ||
    buffer.toString("ascii", 1, 4) !== "PNG"
  ) {
    return null;
  }
  return `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`;
}

function categoryFor(path) {
  return relative(root, path).split("/")[0] || "uncategorized";
}

function resultFor(filename) {
  if (filename.includes("FAIL_BEFORE")) return "FAIL_BEFORE";
  if (filename.includes("PASS_AFTER")) return "PASS_AFTER";
  if (filename.includes("_PASS")) return "PASS";
  return "EVIDENCE";
}

function stateFor(filename) {
  const match = filename.match(/STATE_([A-F])_([^.]*)/);
  return match ? `STATE_${match[1]}_${match[2]}` : "ACCEPTED_QUOTE_STAGE";
}

const pngPaths = (await walk(root))
  .filter((path) => path.toLowerCase().endsWith(".png"))
  .sort();
const screenshots = [];
for (const path of pngPaths) {
  const data = await readFile(path);
  const info = await stat(path);
  const viewport = dimensions(data);
  if (!viewport || info.size === 0) {
    throw new Error(`Unreadable or zero-byte PNG: ${path}`);
  }
  const filename = basename(path);
  const result = resultFor(filename);
  screenshots.push({
    filename,
    path,
    category: categoryFor(path),
    scenario: stateFor(filename),
    entryPoint: "NUEVA_COTIZACION_ACCEPTED_QUOTE",
    prospectFixture: "TEST_SAFE_REDACTED",
    quoteFixture: "ORVI_SOLUCIONLINE_SYNTHETIC",
    product: "ORVI",
    viewport,
    deviceClass:
      Number(viewport.split("x")[0]) <= 640
        ? "MOBILE"
        : Number(viewport.split("x")[0]) <= 1180
          ? "TABLET"
          : "DESKTOP",
    browser: "Chromium",
    result,
    route: "/static-preview/forge-alive/?module=cotizaciones",
    timestamp: info.mtime.toISOString(),
    acceptanceGate:
      result === "FAIL_BEFORE"
        ? "KNOWN_ALIGNMENT_DEFECT"
        : "R16J2B_RESPONSIVE_ACCEPTANCE",
    description:
      result === "FAIL_BEFORE"
        ? "Accepted Quote stage before the R16J2B alignment correction."
        : "Accepted Quote stage or editor state after the R16J2B correction.",
    beforeOrAfter:
      result === "FAIL_BEFORE"
        ? "BEFORE"
        : result === "PASS_AFTER"
          ? "AFTER"
          : "SUPPORTING",
  });
}

const generatedAt = new Date().toISOString();
const index = {
  module: "R16J2B",
  root,
  generatedAt,
  screenshots,
};
await writeFile(
  join(root, "R16J2B_EVIDENCE_INDEX.json"),
  `${JSON.stringify(index, null, 2)}\n`,
);

const manifest = [
  "# R16J2B Evidence Manifest",
  "",
  `GENERATED_AT=${generatedAt}`,
  `EVIDENCE_ROOT=${root}`,
  `TOTAL_SCREENSHOTS=${screenshots.length}`,
  "",
  ...screenshots.flatMap((item) => [
    `FILE=${item.filename}`,
    `PATH=${item.path}`,
    `CATEGORY=${item.category}`,
    `SCENARIO=${item.scenario}`,
    `ENTRY_POINT=${item.entryPoint}`,
    `PROSPECT_FIXTURE=${item.prospectFixture}`,
    `QUOTE_FIXTURE=${item.quoteFixture}`,
    `PRODUCT=${item.product}`,
    `VIEWPORT=${item.viewport}`,
    `DEVICE_CLASS=${item.deviceClass}`,
    `BROWSER=${item.browser}`,
    `RESULT=${item.result}`,
    `ROUTE=${item.route}`,
    `TIMESTAMP=${item.timestamp}`,
    `GATE=${item.acceptanceGate}`,
    `DESCRIPTION=${item.description}`,
    `BEFORE_OR_AFTER=${item.beforeOrAfter}`,
    "",
  ]),
];
await writeFile(
  join(root, "R16J2B_EVIDENCE_MANIFEST.md"),
  `${manifest.join("\n")}\n`,
);

console.log(
  `PASS R16J2B evidence index ${JSON.stringify({
    screenshots: screenshots.length,
    failBefore: screenshots.filter(
      (item) => item.result === "FAIL_BEFORE",
    ).length,
    passAfter: screenshots.filter(
      (item) => item.result === "PASS_AFTER",
    ).length,
  })}`,
);
