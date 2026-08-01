import crypto from "node:crypto";
import {
  mkdir,
  readFile,
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
const expectedEncodedLength = 93_300;
const expectedSha256 =
  "16be81ab3d912c919bb60b504d711fa09f5534b3cf7db2874843a4c12ca66a2a";

const chunkSpecs = [
  { name: "solucionline.pdf.b64.part-00", length: 12_000, sha256: "ef3c1f4e642a56f4d296b5eb03741ac3641aa12e5b3af6ed6994ac557162e4e4" },
  { name: "solucionline.pdf.b64.part-01", length: 12_000, sha256: "f740e58ff034c6e3ff824e9e89b9360b0e697b4ff59cb29b3d867cbb56db279d" },
  { name: "solucionline.pdf.b64.part-02", length: 12_000, sha256: "3819b10bc10ce32bce56c44d9f1de2e38e3c835ce85eb6c25ea93064347528c8" },
  { name: "solucionline.pdf.b64.part-03", length: 12_000, sha256: "ceaf377175a89a0a2f6f899f6f2160d9bb6b0c8fed2bdf7ea0cb271b0d310e5c" },
  { name: "solucionline.pdf.b64.part-04", length: 12_000, sha256: "82689074e6732603248d4d7f920fdca24cdad9ca914ef068a2e871deb52b549b" },
  { name: "solucionline.pdf.b64.part-05", length: 12_000, sha256: "1745a324a0c2928e0be0cac29953004fb6eadcfc3aad2baa8729ef772befda08" },
  { name: "solucionline.pdf.b64.part-06", length: 12_000, sha256: "9edd802cfff6e916b69901e9b09044ac17f046685653436e7ca014ae75fc3856" },
  { name: "solucionline.pdf.b64.tail-00", length: 3_100, sha256: "d8a7cc7cdb342c19cb2f6474654a83041e947cdf733c3cb7801fbcec7531a5e7" },
  { name: "solucionline.pdf.b64.tail-01-0", length: 775, sha256: "bf66af1522ded47d05166b7ec587b473f161ee694c03648decaba75abcf13041" },
  { name: "solucionline.pdf.b64.tail-01-1", length: 775, sha256: "32ec8762932e9269c8aad0c39ffd4eacfefd36684fcbd7a1db6e905e19114e51" },
  { name: "solucionline.pdf.b64.tail-01-2", length: 775, sha256: "346af587c227b7673ea2e8d9b26793f86aef26360492f67f92eddfdcf0ff0c31" },
  { name: "solucionline.pdf.b64.tail-01-3-0", length: 200, sha256: "b603f87733097e6431fc3d3f34e5fe3098ef2ba4a92cdc034d84c9ddc9643c02" },
  { name: "solucionline.pdf.b64.tail-01-3-1", length: 200, sha256: "aa452ff8e490dc67e1b20b96e6301f9de1e8fb10e047fc093da78f276223783b" },
  {
    name: "inline:jAgC-x50",
    content: "jAgC".repeat(50),
    length: 200,
    sha256: "ed49b28dc0067286539aa802b3b73bb5ad491856a1c77e34fda4e198d038b748",
  },
  { name: "solucionline.pdf.b64.tail-01-3-3", length: 175, sha256: "704b38a3d9198f1793c9322b04430c08541a32f04d36e0b8ecc62de3e7b6059b" },
  { name: "solucionline.pdf.b64.tail-02", length: 3_100, sha256: "54a3205637e672181b24a501e26b68b7999f415287b2c1789871b6dbffd800b3" },
];

function digest(payload) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

const encodedChunks = [];
const chunkDiagnostics = [];
for (const spec of chunkSpecs) {
  const raw = typeof spec.content === "string"
    ? spec.content
    : await readFile(path.join(sourceDirectory, spec.name), "utf8");
  const normalized = raw.replace(/\s+/g, "");
  const sha256 = digest(Buffer.from(normalized, "utf8"));
  const matches = normalized.length === spec.length && sha256 === spec.sha256;
  const diagnostic = {
    name: spec.name,
    length: normalized.length,
    expectedLength: spec.length,
    sha256,
    expectedSha256: spec.sha256,
    matches,
  };
  chunkDiagnostics.push(diagnostic);
  console.log(
    [
      "PDF_CHUNK",
      `NAME=${diagnostic.name}`,
      `LENGTH=${diagnostic.length}`,
      `EXPECTED_LENGTH=${diagnostic.expectedLength}`,
      `SHA256=${diagnostic.sha256}`,
      `EXPECTED_SHA256=${diagnostic.expectedSha256}`,
      `MATCH=${diagnostic.matches ? "YES" : "NO"}`,
    ].join(";"),
  );
  if (!matches) {
    throw new Error(`UI_M05P_FIXTURE_CHUNK_INVALID=${spec.name}`);
  }
  encodedChunks.push(normalized);
}

const encoded = encodedChunks.join("");
if (encoded.length !== expectedEncodedLength) {
  throw new Error(
    `UI_M05P_FIXTURE_ENCODED_LENGTH_INVALID=${encoded.length};EXPECTED=${expectedEncodedLength}`,
  );
}

const payload = Buffer.from(encoded, "base64");
const sha256 = digest(payload);
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
    schema: "forge.ui.m05p.real-pdf-fixture.v5",
    sourceFileName: "Solucionline_20260711_16_05.PDF",
    product: "Vida Mujer",
    insured: "Alejandra Moleres",
    pageCount: 2,
    byteLength: payload.length,
    sha256,
    encodedLength: encoded.length,
    chunkDiagnostics,
  }, null, 2)}\n`,
);

console.log("UI_M05P_REAL_PDF_ASSEMBLY=PASS");
console.log(`PDF_PATH=${outputPath}`);
console.log(`PDF_BYTES=${payload.length}`);
console.log(`PDF_SHA256=${sha256}`);
