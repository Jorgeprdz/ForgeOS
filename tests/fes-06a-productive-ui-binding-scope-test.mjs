import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const scopePath =
  "docs/architecture/source-truth/" +
  "FES_06A_PRODUCTIVE_UI_BINDING_SCOPE_001.md";
const inventoryPath =
  "docs/evidence/" +
  "FES_06A_PRODUCTIVE_UI_SURFACE_INVENTORY_001.md";

const scope =
  readFileSync(scopePath, "utf8");
const inventory =
  readFileSync(inventoryPath, "utf8");

function field(
  text,
  name,
) {
  const match =
    text.match(
      new RegExp(
        `^${name}=(.*)$`,
        "m",
      ),
    );

  assert.ok(
    match,
    `Missing field ${name}`,
  );

  return match[1].trim();
}

test("FES 06A locks the scope identifier", () => {
  assert.equal(
    field(
      scope,
      "FES_06A_PRODUCTIVE_UI_BINDING_SCOPE",
    ),
    "SCOPED",
  );
});

test("FES 06A keeps productive mutation disabled", () => {
  assert.equal(
    field(
      scope,
      "PRODUCTIVE_UI_MUTATION",
    ),
    "NO",
  );
});

test("FES 06A keeps Supabase mutation disabled", () => {
  assert.equal(
    field(
      scope,
      "SUPABASE_REMOTE_MUTATION",
    ),
    "NO",
  );
});

test("FES 06A keeps database migration disabled", () => {
  assert.equal(
    field(
      scope,
      "DATABASE_MIGRATION",
    ),
    "NO",
  );
});

test("FES 06A binds exactly four governed surfaces", () => {
  assert.deepEqual(
    field(scope, "SURFACES")
      .split(","),
    [
      "ACTIVITY",
      "PROSPECT_DETAIL",
      "PIPELINE_CARD",
      "MI_DIA",
    ],
  );
});

test("FES 06A binds read-only projection output", () => {
  assert.equal(
    field(
      scope,
      "BINDING_MODE",
    ),
    "READ_ONLY_PROJECTION_CONSUMER",
  );
});

test("FES 06A forbids UI event construction", () => {
  assert.equal(
    field(
      scope,
      "UI_CREATES_CANONICAL_EVENTS",
    ),
    "NO",
  );
});

test("FES 06A forbids UI ledger mutation", () => {
  assert.equal(
    field(
      scope,
      "UI_MUTATES_LEDGER",
    ),
    "NO",
  );
});

test("FES 06A forbids UI timeline mutation", () => {
  assert.equal(
    field(
      scope,
      "UI_MUTATES_TIMELINE",
    ),
    "NO",
  );
});

test("FES 06A forbids UI projection mutation", () => {
  assert.equal(
    field(
      scope,
      "UI_MUTATES_PROJECTIONS",
    ),
    "NO",
  );
});

test("FES 06A forbids UI external execution", () => {
  assert.equal(
    field(
      scope,
      "UI_EXECUTES_EXTERNAL_ACTIONS",
    ),
    "NO",
  );
});

test("FES 06A forbids UI truth inference", () => {
  assert.equal(
    field(
      scope,
      "UI_INFERS_BUSINESS_TRUTH",
    ),
    "NO",
  );
});

test("FES 06A forbids raw private content", () => {
  assert.equal(
    field(
      scope,
      "RAW_PRIVATE_CONTENT_RENDERING",
    ),
    "NO",
  );
});

test("FES 06A requires explicit loading state", () => {
  assert.match(
    field(
      scope,
      "REQUIRED_UI_STATES",
    ),
    /LOADING/,
  );
});

test("FES 06A requires explicit empty state", () => {
  assert.match(
    field(
      scope,
      "REQUIRED_UI_STATES",
    ),
    /EMPTY/,
  );
});

test("FES 06A requires explicit unavailable state", () => {
  assert.match(
    field(
      scope,
      "REQUIRED_UI_STATES",
    ),
    /UNAVAILABLE/,
  );
});

test("FES 06A requires explicit invalid state", () => {
  assert.match(
    field(
      scope,
      "REQUIRED_UI_STATES",
    ),
    /INVALID/,
  );
});

test("FES 06A records an actual tracked-file inventory", () => {
  assert.ok(
    Number(
      field(
        inventory,
        "TRACKED_FILES_SCANNED",
      ),
    ) > 0,
  );
});

test("FES 06A finds productive UI candidates", () => {
  assert.ok(
    Number(
      field(
        inventory,
        "PRODUCTIVE_UI_CANDIDATE_FILES",
      ),
    ) > 0,
  );
});

test("FES 06A inventory is explicitly non-authoritative", () => {
  assert.equal(
    field(
      inventory,
      "INVENTORY_AUTHORITY",
    ),
    "CANDIDATE_DISCOVERY_ONLY",
  );
});

test("FES 06A inventory excludes governed runtime files", () => {
  assert.equal(
    field(
      inventory,
      "EVENT_EVIDENCE_RUNTIME_EXCLUDED_FROM_UI_CANDIDATES",
    ),
    "YES",
  );
});

test("FES 06A requires implementation to use exact approved files", () => {
  assert.equal(
    field(
      scope,
      "IMPLEMENTATION_REQUIRES_APPROVED_BINDING_MANIFEST",
    ),
    "YES",
  );
});

test("FES 06A keeps FES 06 open", () => {
  assert.equal(
    field(
      scope,
      "FES_06_PRODUCTIVE_UI_BINDING",
    ),
    "OPEN",
  );
});

test("FES 06A points to implementation next", () => {
  assert.equal(
    field(
      scope,
      "NEXT",
    ),
    "FES_06B_PRODUCTIVE_UI_BINDING_IMPLEMENTATION",
  );
});
