import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const root = path.resolve("artifacts/ui-m05p");
const screenshotDirectory = path.join(root, "screenshots");
const sourcePageDirectory = path.join(root, "source-pages");
const stateDirectory = path.join(root, "states");
const expectedProjects = [
  "mobile-390x844",
  "tablet-portrait-800x1280",
  "tablet-landscape-1280x800",
  "desktop-1440x900",
  "desktop-wide-1920x1080",
];

await mkdir(root, { recursive: true });

async function files(directory, extension) {
  try {
    return (await readdir(directory))
      .filter((name) => name.endsWith(extension))
      .sort();
  } catch {
    return [];
  }
}

async function pngValid(filePath) {
  const file = await readFile(filePath);
  const size = (await stat(filePath)).size;
  return size > 5_000
    && file.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
}

const screenshotNames = await files(screenshotDirectory, ".png");
const sourcePageNames = await files(sourcePageDirectory, ".png");
const stateNames = await files(stateDirectory, ".json");
const states = [];
for (const name of stateNames) {
  states.push(JSON.parse(await readFile(path.join(stateDirectory, name), "utf8")));
}

const screenshotIntegrity = {};
for (const name of screenshotNames) {
  screenshotIntegrity[name] = await pngValid(path.join(screenshotDirectory, name));
}
const sourcePageIntegrity = {};
for (const name of sourcePageNames) {
  sourcePageIntegrity[name] = await pngValid(path.join(sourcePageDirectory, name));
}

const failures = [];
if (screenshotNames.length !== 10) {
  failures.push(`SCREENSHOT_COUNT=${screenshotNames.length};EXPECTED=10`);
}
if (sourcePageNames.length !== 2) {
  failures.push(`SOURCE_PAGE_COUNT=${sourcePageNames.length};EXPECTED=2`);
}
if (stateNames.length !== 5) {
  failures.push(`STATE_COUNT=${stateNames.length};EXPECTED=5`);
}
if (Object.values(screenshotIntegrity).some((valid) => !valid)) {
  failures.push("SCREENSHOT_INTEGRITY=FAIL");
}
if (Object.values(sourcePageIntegrity).some((valid) => !valid)) {
  failures.push("SOURCE_PAGE_INTEGRITY=FAIL");
}

for (const project of expectedProjects) {
  const state = states.find((item) => item.project === project);
  if (!state) {
    failures.push(`${project}:STATE_MISSING`);
    continue;
  }
  if (state.blockedVisible || state.publicConfigNoticeVisible) {
    failures.push(`${project}:PUBLIC_CONFIG_BLOCKED`);
  }
  if (state.authRuntimeErrorVisible) {
    failures.push(`${project}:AUTH_RUNTIME_ERROR`);
  }
  if (state.settlement !== "ready") {
    failures.push(`${project}:QUOTE_${String(state.settlement).toUpperCase()}`);
  }
  if (!state.printableCardVisible) {
    failures.push(`${project}:PRINTABLE_CARD_MISSING`);
  }
  for (const action of ["preview", "download", "history"]) {
    if (!state.actionVisibility?.[action]) {
      failures.push(`${project}:${action.toUpperCase()}_ICON_MISSING`);
    }
    if (state.actions?.[action] !== "pass") {
      failures.push(`${project}:${action.toUpperCase()}_ACTION_FAIL`);
    }
  }
  if (state.status !== "PASS") {
    failures.push(`${project}:STATE_NOT_PASS`);
  }
}

const summary = {
  schema: "forge.ui.m05p.real-vida-mujer-acceptance.v1",
  generatedAt: new Date().toISOString(),
  targetMode: process.env.FORGE_M05P_TARGET_MODE || "unknown",
  targetUrl: process.env.FORGE_M05P_TARGET_URL || null,
  fixture: {
    fileName: "Solucionline_20260711_16_05.PDF",
    product: "Vida Mujer",
    insured: "Alejandra Moleres",
    pageCount: 2,
    byteLength: 69_973,
    sha256:
      "16be81ab3d912c919bb60b504d711fa09f5534b3cf7db2874843a4c12ca66a2a",
  },
  screenshotCount: screenshotNames.length,
  sourcePageCount: sourcePageNames.length,
  stateCount: stateNames.length,
  screenshotNames,
  sourcePageNames,
  screenshotIntegrity,
  sourcePageIntegrity,
  states,
  failures: [...new Set(failures)],
  status: failures.length ? "FAIL" : "PASS",
};

await writeFile(
  path.join(root, "acceptance-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(`UI_M05P_ACCEPTANCE=${summary.status}`);
console.log(`SCREENSHOTS=${summary.screenshotCount}`);
console.log(`SOURCE_PAGES=${summary.sourcePageCount}`);
for (const failure of summary.failures) console.log(`FAILURE=${failure}`);

if (process.env.FORGE_M05P_ENFORCE === "true" && summary.status !== "PASS") {
  process.exitCode = 1;
}
