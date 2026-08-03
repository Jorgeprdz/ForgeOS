import { copyFile, mkdir, readFile } from "node:fs/promises";

const source = new URL(
  "../platform/shared-commercial-model/cartera-010b-contract-validator.js",
  import.meta.url,
);
const targetDirectory = new URL(
  "../docs/platform/shared-commercial-model/",
  import.meta.url,
);
const target = new URL(
  "../docs/platform/shared-commercial-model/cartera-010b-contract-validator.js",
  import.meta.url,
);

await mkdir(targetDirectory, { recursive: true });
await copyFile(source, target);

const [sourceContent, targetContent] = await Promise.all([
  readFile(source),
  readFile(target),
]);
if (!sourceContent.equals(targetContent)) {
  throw new Error("CARTERA_POLICY_ENTRY_VALIDATOR_PAGES_COPY_MISMATCH");
}

console.log("CARTERA_POLICY_ENTRY_VALIDATOR_PAGES_RUNTIME=READY");
