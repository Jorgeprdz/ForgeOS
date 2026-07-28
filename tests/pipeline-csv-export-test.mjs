import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const csv = require("../advisor-os/sales-pipeline/pipeline-csv-export.js");

const rows = [
  {
    id: "b",
    fullName: "María Peña",
    phone: "+525500000002",
    initialContext: "private",
    objection: "private",
  },
  {
    id: "a",
    fullName: 'José, "Peña"\nSegundo',
    email: "=WEBSERVICE(\"bad\")",
    source: "Referido",
    productsOfInterest: ["Vida", "Ahorro"],
  },
];

test("Pipeline CSV is deterministic UTF-8 BOM and RFC 4180", () => {
  const output = csv.serialize(rows);
  assert.equal(output.charCodeAt(0), 0xfeff);
  assert.match(output, /\r\n/);
  assert.ok(output.indexOf('"a","José, ""Peña""\nSegundo"') < output.indexOf('"b","María Peña"'));
  assert.match(output, /"'=WEBSERVICE\(""bad""\)"/);
  assert.match(output, /"Vida; Ahorro"/);
  assert.equal(csv.serialize(rows), output);
});

test("Pipeline CSV includes all rows independently of visual filters", () => {
  const output = csv.serialize(rows);
  assert.equal(output.split("\r\n").filter(Boolean).length, 3);
});

test("Pipeline CSV excludes private and unauthorized fields", () => {
  const output = csv.serialize(rows);
  assert.doesNotMatch(output, /initialContext|objection|private/);
});

test("Pipeline CSV neutralizes every spreadsheet formula prefix", () => {
  for (const prefix of ["=", "+", "-", "@", "\t", "\r"]) {
    assert.equal(csv.neutralize(`${prefix}payload`), `'${prefix}payload`);
  }
  assert.equal(csv.neutralize("normal"), "normal");
});

test("Pipeline CSV filename uses the governed date", () => {
  assert.equal(csv.filename(new Date("2026-07-28T12:00:00Z")), "forge-pipeline-2026-07-28.csv");
});
