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
const expectedPartFingerprints = [
  { length: 11664, sha256: "d5850b6bee32605d493a4f9e9eb1691cb01e07732dbbb55644de5caa4995d92f" },
  { length: 11664, sha256: "33b7363a4493f9e1b4c72ae4f704b28039092f9cb5bc8cee96aaae70bf2457b0" },
  { length: 11664, sha256: "b7dd00ee807c3cbc0d7f0cb1cbbf62f2a161cd5aec95a01141f536701962a2bb" },
  { length: 11664, sha256: "78e238b92918ae570f76f83d0a99ff1722eec7482b3acd7f5f67604a45aaa12a" },
  { length: 11664, sha256: "a18df6aab6ed27ec5a3b4539ee105d617ea97ae37f10d6ae07bde100406acb18" },
  { length: 11664, sha256: "3a8da3fb6320927fa5676b8b0a9a93d92eea950909b91f7149df63e00ea5e726" },
  { length: 11664, sha256: "fbdd8eb348776a0a537a6481963d0df4bd1ca8242afb5137ecfd6768c89fccc0" },
  { length: 11652, sha256: "092dcb433e3f5187d39d9e69669064bb61b3fe30b779fe62e5db200d2bf63aeb" },
];

const partNames = (await readdir(sourceDirectory))
  .filter((name) => name.startsWith("solucionline.pdf.b64.part-"))
  .sort();

if (partNames.length !== 8) {
  throw new Error(`UI_M05P_FIXTURE_PART_COUNT_INVALID=${partNames.length}`);
}

function digest(payload) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

const encodedParts = [];
const rawPartLengths = [];
const partDiagnostics = [];
for (let index = 0; index < partNames.length; index += 1) {
  const name = partNames[index];
  const raw = await readFile(path.join(sourceDirectory, name), "utf8");
  const normalized = raw.replace(/\s+/g, "");
  const expected = expectedPartFingerprints[index];
  const actualSha256 = digest(Buffer.from(normalized, "utf8"));
  rawPartLengths.push(raw.length);
  encodedParts.push(normalized);
  partDiagnostics.push({
    index,
    name,
    rawLength: raw.length,
    normalizedLength: normalized.length,
    actualSha256,
    expectedLength: expected.length,
    expectedSha256: expected.sha256,
    matches: normalized.length === expected.length
      && actualSha256 === expected.sha256,
  });
}

for (const diagnostic of partDiagnostics) {
  console.log(
    [
      `PDF_PART_${String(diagnostic.index).padStart(2, "0")}`,
      `NAME=${diagnostic.name}`,
      `RAW=${diagnostic.rawLength}`,
      `NORMALIZED=${diagnostic.normalizedLength}`,
      `EXPECTED=${diagnostic.expectedLength}`,
      `SHA256=${diagnostic.actualSha256}`,
      `EXPECTED_SHA256=${diagnostic.expectedSha256}`,
      `MATCH=${diagnostic.matches ? "YES" : "NO"}`,
    ].join(";"),
  );
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
      `BAD_PARTS=${partDiagnostics.filter((part) => !part.matches).map((part) => part.index).join(",")}`,
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
    partDiagnostics,
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
