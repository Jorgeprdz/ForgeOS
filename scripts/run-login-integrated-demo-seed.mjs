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

const unsupportedMetadata =
  'metadata: { data_class: DATA_CLASS, scenario: spec.scenario || "DEMO" },';
const canonicalMetadata = [
  "metadata: {",
  '          observation_code: spec.scenario || "DEMO",',
  '          confirmation_actor_type: spec.confirmed ? "ADVISOR" : "SYSTEM",',
  "        },",
].join("\n");

const strictGatewayPush = [
  "const result = await gateway.pushMutation(mutation);",
  '    assert.ok(["ACKNOWLEDGED", "IDEMPOTENT_REPLAY"].includes(result.status));',
].join("\n    ");
const canonicalRemotePush = [
  "const response = await api.rpc(\"forge_fes02_append_activity_event\", {",
  "      p_mutation: mutation,",
  "    });",
  "    assert.ifError(response.error);",
  "    const result = Array.isArray(response.data)",
  "      ? response.data[0]",
  "      : response.data;",
  "    assert.ok(result && [\"ACKNOWLEDGED\", \"IDEMPOTENT_REPLAY\"].includes(result.status));",
].join("\n    ");

const source = await readFile(sourcePath, "utf8");
assert.equal(
  source.split(unsupportedMetadata).length - 1,
  1,
  "DEMO_SEED_EVIDENCE_METADATA_ADAPTER_SOURCE_DRIFT",
);
assert.equal(
  source.split(strictGatewayPush).length - 1,
  1,
  "DEMO_SEED_FES_REMOTE_RECEIPT_ADAPTER_SOURCE_DRIFT",
);

const runtime = source
  .replace(unsupportedMetadata, canonicalMetadata)
  .replace(strictGatewayPush, canonicalRemotePush);

assert.doesNotMatch(runtime, /metadata:\s*\{\s*data_class:/);
assert.match(runtime, /observation_code:\s*spec\.scenario/);
assert.match(runtime, /confirmation_actor_type:/);
assert.match(runtime, /forge_fes02_append_activity_event/);
assert.doesNotMatch(runtime, /gateway\.pushMutation\(mutation\)/);

try {
  await writeFile(runtimePath, runtime, { flag: "wx", mode: 0o600 });
  await import(`${pathToFileURL(runtimePath).href}?v=canonical-fes-remote-002`);
} finally {
  await rm(runtimePath, { force: true });
}
