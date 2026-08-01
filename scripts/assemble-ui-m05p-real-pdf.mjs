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
const expectedEncodedLength = Math.ceil(expectedSize / 3) * 4;
const expectedSha256 =
  "16be81ab3d912c919bb60b504d711fa09f5534b3cf7db2874843a4c12ca66a2a";

const partNames = (await readdir(sourceDirectory))
  .filter((name) => name.startsWith("solucionline.pdf.b64.part-"))
  .sort();

if (partNames.length !== 8) {
  throw new Error(`UI_M05P_FIXTURE_PART_COUNT_INVALID=${partNames.length}`);
}

const encodedParts = [];
const rawPartLengths = [];
for (const name of partNames) {
  const raw = await readFile(path.join(sourceDirectory, name), "utf8");
  rawPartLengths.push(raw.length);
  encodedParts.push(raw.replace(/\s+/g, ""));
}

function digest(payload) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function validateEncoded(encoded) {
  if (encoded.length !== expectedEncodedLength) return null;
  const payload = Buffer.from(encoded, "base64");
  if (payload.length !== expectedSize) return null;
  const sha256 = digest(payload);
  if (sha256 !== expectedSha256) return null;
  if (payload.subarray(0, 5).toString("ascii") !== "%PDF-") return null;
  return { encoded, payload, sha256 };
}

const rawEncoded = encodedParts.join("");
let recovered = validateEncoded(rawEncoded);
let recovery = {
  mode: recovered ? "DIRECT" : "UNRESOLVED",
  removedEncodedCharacters: 0,
  deletionStart: null,
  boundaryIndex: null,
};

if (!recovered && rawEncoded.length > expectedEncodedLength) {
  const removeCount = rawEncoded.length - expectedEncodedLength;
  const boundaries = [];
  let cumulative = 0;
  for (let index = 0; index < encodedParts.length - 1; index += 1) {
    cumulative += encodedParts[index].length;
    boundaries.push({ index, offset: cumulative });
  }

  const attemptedStarts = new Set();
  for (const boundary of boundaries) {
    const minimum = Math.max(0, boundary.offset - removeCount - 96);
    const maximum = Math.min(
      rawEncoded.length - removeCount,
      boundary.offset + 96,
    );
    for (let start = minimum; start <= maximum; start += 1) {
      if (start % 4 !== 0 || attemptedStarts.has(start)) continue;
      attemptedStarts.add(start);
      const candidate =
        rawEncoded.slice(0, start)
        + rawEncoded.slice(start + removeCount);
      const exact = validateEncoded(candidate);
      if (!exact) continue;
      recovered = exact;
      recovery = {
        mode: "BOUNDARY_OVERLAP_REMOVED",
        removedEncodedCharacters: removeCount,
        deletionStart: start,
        boundaryIndex: boundary.index,
      };
      break;
    }
    if (recovered) break;
  }
}

if (!recovered) {
  const decoded = Buffer.from(rawEncoded, "base64");
  throw new Error(
    [
      "UI_M05P_FIXTURE_RECOVERY_FAILED",
      `ENCODED=${rawEncoded.length}`,
      `EXPECTED_ENCODED=${expectedEncodedLength}`,
      `BYTES=${decoded.length}`,
      `EXPECTED_BYTES=${expectedSize}`,
      `SHA256=${digest(decoded)}`,
    ].join(";"),
  );
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, recovered.payload);
await writeFile(
  `${outputPath}.metadata.json`,
  `${JSON.stringify({
    schema: "forge.ui.m05p.real-pdf-fixture.v1",
    sourceFileName: "Solucionline_20260711_16_05.PDF",
    product: "Vida Mujer",
    insured: "Alejandra Moleres",
    pageCount: 2,
    byteLength: recovered.payload.length,
    sha256: recovered.sha256,
    partNames,
    rawPartLengths,
    normalizedPartLengths: encodedParts.map((part) => part.length),
    rawEncodedLength: rawEncoded.length,
    recovery,
  }, null, 2)}\n`,
);

console.log("UI_M05P_REAL_PDF_ASSEMBLY=PASS");
console.log(`PDF_PATH=${outputPath}`);
console.log(`PDF_BYTES=${recovered.payload.length}`);
console.log(`PDF_SHA256=${recovered.sha256}`);
console.log(`PDF_RECOVERY_MODE=${recovery.mode}`);
console.log(`PDF_REMOVED_ENCODED_CHARACTERS=${recovery.removedEncodedCharacters}`);
