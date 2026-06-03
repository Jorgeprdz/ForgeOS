const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SCHEMA_DIR = path.join(ROOT, "schemas");
const FIXTURE_DIR = path.join(ROOT, "fixtures");

function readJson(filePath) {
  try {
    return {
      ok: true,
      data: JSON.parse(fs.readFileSync(filePath, "utf8"))
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  const files = [];

  function walk(currentDir) {
    fs.readdirSync(currentDir, { withFileTypes: true }).forEach(entry => {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        return;
      }

      if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(fullPath);
      }
    });
  }

  walk(directory);
  return files.sort();
}

function relative(filePath) {
  return path.relative(ROOT, filePath);
}

function getSchemaFields(schema) {
  const properties = schema.properties || {};
  const required = Array.isArray(schema.required) ? schema.required : [];
  const requiredSet = new Set(required);
  const optional = Object.keys(properties).filter(field => !requiredSet.has(field));

  return {
    required,
    optional
  };
}

function getFixtureFields(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value).sort();
}

function findBestSchemaForFixture(fixtureName, schemas) {
  const normalizedFixture = fixtureName
    .replace(/\.json$/, "")
    .replace(/-demo$/, "")
    .replace(/-active$/, "")
    .replace(/-expired$/, "")
    .replace(/-reactivated$/, "")
    .replace(/-success$/, "")
    .replace(/-high$/, "")
    .replace(/-low$/, "")
    .replace(/-standard$/, "")
    .replace(/-light$/, "")
    .replace(/-strict$/, "")
    .replace(/-first-attempt$/, "")
    .replace(/-reentry$/, "")
    .replace(/-manager-change$/, "")
    .replace(/-office-change$/, "")
    .replace(/-full-demo$/, "");

  const orderedSchemas = schemas
    .slice()
    .sort((left, right) => right.baseName.length - left.baseName.length);

  const exact = orderedSchemas.find(schema => normalizedFixture === schema.baseName);
  if (exact) return exact;

  const evidenceAlias = orderedSchemas.find(schema => `${normalizedFixture}-evidence` === schema.baseName);
  if (evidenceAlias) return evidenceAlias;

  return orderedSchemas.find(schema => normalizedFixture.includes(schema.baseName) || schema.baseName.includes(normalizedFixture)) || null;
}

function printList(items, emptyLabel = "None") {
  if (!items.length) {
    console.log(`  ${emptyLabel}`);
    return;
  }

  items.forEach(item => console.log(`  - ${item}`));
}

function reportSchemas() {
  const schemaFiles = listJsonFiles(SCHEMA_DIR);
  const schemas = [];
  const warnings = [];

  console.log("1. Schemas Found\n");

  schemaFiles.forEach(filePath => {
    const parsed = readJson(filePath);
    const name = path.basename(filePath);

    if (!parsed.ok) {
      warnings.push(`${relative(filePath)} could not be parsed: ${parsed.error}`);
      console.log(`- ${relative(filePath)} (invalid JSON)`);
      return;
    }

    const fields = getSchemaFields(parsed.data);
    const baseName = name.replace(/\.schema\.json$/, "").replace(/\.json$/, "");
    schemas.push({
      filePath,
      name,
      baseName,
      schema: parsed.data,
      required: fields.required,
      optional: fields.optional
    });

    console.log(`- ${relative(filePath)}`);
    console.log(`  Title: ${parsed.data.title || "Untitled"}`);
    console.log(`  Required: ${fields.required.length}`);
    console.log(`  Optional: ${fields.optional.length}`);

    if (!fields.required.length) {
      warnings.push(`${relative(filePath)} has no required fields`);
    }
  });

  return {
    schemas,
    warnings
  };
}

function reportSchemaFields(schemas) {
  console.log("\n2. Required Fields\n");
  schemas.forEach(schema => {
    console.log(`${schema.name}`);
    printList(schema.required);
  });

  console.log("\n3. Optional Fields\n");
  schemas.forEach(schema => {
    console.log(`${schema.name}`);
    printList(schema.optional);
  });
}

function reportFixtures(schemas) {
  const fixtureFiles = listJsonFiles(FIXTURE_DIR);
  const fixtures = [];
  const warnings = [];

  console.log("\n4. Fixtures Found\n");

  fixtureFiles.forEach(filePath => {
    const parsed = readJson(filePath);
    const name = path.basename(filePath);

    if (!parsed.ok) {
      warnings.push(`${relative(filePath)} could not be parsed: ${parsed.error}`);
      console.log(`- ${relative(filePath)} (invalid JSON)`);
      return;
    }

    const fields = getFixtureFields(parsed.data);
    const schema = findBestSchemaForFixture(name, schemas);
    const missingFields = schema
      ? schema.required.filter(field => !Object.prototype.hasOwnProperty.call(parsed.data, field))
      : [];

    fixtures.push({
      filePath,
      name,
      data: parsed.data,
      fields,
      schema,
      missingFields
    });

    console.log(`- ${relative(filePath)}`);
    console.log(`  Fields: ${fields.length}`);
    console.log(`  Matched Schema: ${schema ? schema.name : "None"}`);

    if (!schema) {
      warnings.push(`${relative(filePath)} did not match a schema by filename`);
    }

    if (missingFields.length) {
      warnings.push(`${relative(filePath)} is missing required fields for ${schema.name}: ${missingFields.join(", ")}`);
    }
  });

  return {
    fixtures,
    warnings
  };
}

function reportFixtureFields(fixtures) {
  console.log("\n5. Fixture Fields Present\n");
  fixtures.forEach(fixture => {
    console.log(`${relative(fixture.filePath)}`);
    printList(fixture.fields);
  });

  console.log("\n6. Missing Fields\n");
  fixtures.forEach(fixture => {
    console.log(`${relative(fixture.filePath)}`);
    if (!fixture.schema) {
      console.log("  No matched schema");
      return;
    }
    printList(fixture.missingFields);
  });
}

function reportWarnings(warnings) {
  console.log("\n7. Warnings\n");
  printList(warnings, "No warnings");
}

function reportSummary({ schemas, fixtures, warnings }) {
  const fixturesWithMatchedSchema = fixtures.filter(fixture => fixture.schema).length;
  const fixturesWithMissingFields = fixtures.filter(fixture => fixture.missingFields.length > 0).length;

  console.log("\n8. Summary\n");
  console.log(`Schemas: ${schemas.length}`);
  console.log(`Fixtures: ${fixtures.length}`);
  console.log(`Fixtures With Matched Schema: ${fixturesWithMatchedSchema}`);
  console.log(`Fixtures With Missing Required Fields: ${fixturesWithMissingFields}`);
  console.log(`Warnings: ${warnings.length}`);
}

function run() {
  console.log("\nFORGE SCHEMA REPORTER v1.0\n");

  const schemaReport = reportSchemas();
  reportSchemaFields(schemaReport.schemas);

  const fixtureReport = reportFixtures(schemaReport.schemas);
  reportFixtureFields(fixtureReport.fixtures);

  const warnings = [
    ...schemaReport.warnings,
    ...fixtureReport.warnings
  ];

  reportWarnings(warnings);
  reportSummary({
    schemas: schemaReport.schemas,
    fixtures: fixtureReport.fixtures,
    warnings
  });
}

run();
