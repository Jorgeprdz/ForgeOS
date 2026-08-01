import crypto from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDirectory = path.join(
  root,
  "tests/fixtures/ui-m05p-real-vida-mujer-pdf",
);
const outputPath = path.resolve(
  process.env.FORGE_M05P_PDF_PATH
    || "artifacts/ui-m05p/fixture/Solucionline_20260711_16_05.PDF",
);
const expectedSize = 69_973;
const expectedSha256 =
  "16be81ab3d912c919bb60b504d711fa09f5534b3cf7db2874843a4c12ca66a2a";

const partNames = (await readdir(sourceDirectory))
  .filter((name) => name.startsWith("solucionline.pdf.b64.part-"))
  .sort();

if (partNames.length !== 8) {
  throw new Error(`UI_M05P_FIXTURE_PART_COUNT_INVALID=${partNames.length}`);
}

const encodedParts = [];
for (const name of partNames) {
  encodedParts.push(
    (await readFile(path.join(sourceDirectory, name), "utf8")).trim(),
  );
}

const payload = Buffer.from(encodedParts.join(""), "base64");
const sha256 = crypto.createHash("sha256").update(payload).digest("hex");

if (payload.length !== expectedSize) {
  throw new Error(
    `UI_M05P_FIXTURE_SIZE_INVALID=${payload.length};EXPECTED=${expectedSize}`,
  );
}
if (sha256 !== expectedSha256) {
  throw new Error(
    `UI_M05P_FIXTURE_SHA_INVALID=${sha256};EXPECTED=${expectedSha256}`,
  );
}
if (payload.subarray(0, 5).toString("ascii") !== "%PDF-") {
  throw new Error("UI_M05P_FIXTURE_MAGIC_INVALID");
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, payload);
await writeFile(
  `${outputPath}.metadata.json`,
  `${JSON.stringify({
    schema: "forge.ui.m05p.real-pdf-fixture.v1",
    sourceFileName: "Solucionline_20260711_16_05.PDF",
    product: "Vida Mujer",
    insured: "Alejandra Moleres",
    pageCount: 2,
    byteLength: payload.length,
    sha256,
    partNames,
  }, null, 2)}\n`,
);

console.log("UI_M05P_REAL_PDF_ASSEMBLY=PASS");
console.log(`PDF_PATH=${outputPath}`);
console.log(`PDF_BYTES=${payload.length}`);
console.log(`PDF_SHA256=${sha256}`);
