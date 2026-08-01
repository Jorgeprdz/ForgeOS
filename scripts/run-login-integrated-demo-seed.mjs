import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const sourcePath = fileURLToPath(
  new URL("./seed-login-integrated-demo-tenants.mjs", import.meta.url),
);
const runtimePath = join(
  dirname(sourcePath),
  `.seed-login-integrated-demo-runtime-${process.pid}.mjs`,
);

const unsupported =
  'metadata: { data_class: DATA_CLASS, scenario: spec.scenario || "DEMO" },';
const canonical = [
  "metadata: {",
  '          observation_code: spec.scenario || "DEMO",',
  '          confirmation_actor_type: spec.confirmed ? "ADVISOR" : "SYSTEM",',
  "        },",
].join("\n");

const source = await readFile(sourcePath, "utf8");
const occurrences = source.split(unsupported).length - 1;
assert.equal(
  occurrences,
  1,
  "DEMO_SEED_EVIDENCE_METADATA_ADAPTER_SOURCE_DRIFT",
);
const runtime = source.replace(unsupported, canonical);
assert.doesNotMatch(runtime, /metadata:\s*\{\s*data_class:/);
assert.match(runtime, /observation_code:\s*spec\.scenario/);
assert.match(runtime, /confirmation_actor_type:/);

try {
  await writeFile(runtimePath, runtime, { flag: "wx", mode: 0o600 });
  await import(`${pathToFileURL(runtimePath).href}?v=canonical-fes-metadata-001`);
} finally {
  await rm(runtimePath, { force: true });
}
