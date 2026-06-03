const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function runNodeTest(fileName, env = {}) {
  const result = spawnSync(process.execPath, [fileName], {
    cwd: ROOT,
    env: {
      ...process.env,
      ...env
    },
    encoding: "utf8"
  });

  return {
    pass: result.status === 0,
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error || null
  };
}

function validateSchemas() {
  const schemaDir = path.join(ROOT, "schemas");
  const errors = [];

  if (!fs.existsSync(schemaDir)) {
    return {
      pass: false,
      errors: ["schemas/ directory is missing"]
    };
  }

  const files = fs.readdirSync(schemaDir).filter(file => file.endsWith(".json"));

  if (!files.length) {
    errors.push("schemas/ has no JSON schema files");
  }

  files.forEach(file => {
    try {
      JSON.parse(fs.readFileSync(path.join(schemaDir, file), "utf8"));
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
  });

  return {
    pass: errors.length === 0,
    errors
  };
}

function validateRequiredFile(label, relativePath) {
  return {
    label,
    pass: exists(relativePath),
    errors: exists(relativePath) ? [] : [`${relativePath} is missing`]
  };
}

function resultFromNode(label, fileName, env = {}) {
  if (!exists(fileName)) {
    return {
      label,
      pass: false,
      errors: [`${fileName} is missing`]
    };
  }

  const result = runNodeTest(fileName, env);
  const errors = [];

  if (result.error) {
    errors.push(result.error.message);
  }

  if (!result.pass) {
    errors.push(`${fileName} exited with status ${result.status}`);
    const output = `${result.stderr}\n${result.stdout}`.trim();
    if (output) {
      errors.push(output.split("\n").slice(-8).join("\n"));
    }
  }

  return {
    label,
    pass: result.pass,
    errors
  };
}

function findNashMasterTest() {
  if (exists("nash-master-acceptance-test.js")) {
    return "nash-master-acceptance-test.js";
  }

  if (exists("nash-master-intelligence-master-test.js")) {
    return "nash-master-intelligence-master-test.js";
  }

  return null;
}

function printResult(result) {
  console.log(`${result.pass ? "✅" : "❌"} ${result.label}`);

  if (!result.pass) {
    result.errors.forEach(error => {
      console.log(`   ${error}`);
    });
  }
}

function run() {
  console.log("\nFORGE MASTER ACCEPTANCE TEST v1.0\n");

  const schemaValidation = validateSchemas();
  const nashTest = findNashMasterTest();

  const results = [
    {
      label: "Schemas",
      pass: schemaValidation.pass,
      errors: schemaValidation.errors
    },
    resultFromNode("Fixtures", "fixture-validation-test.js"),
    nashTest
      ? resultFromNode("NASH", nashTest)
      : {
          label: "NASH",
          pass: false,
          errors: [
            "No NASH master test found. Expected nash-master-acceptance-test.js or nash-master-intelligence-master-test.js"
          ]
        },
    resultFromNode("Relationship", "relationship-master-acceptance-test.js"),
    resultFromNode("Forge AI Connector", "forge-ai-connector-master-test.js", {
      OPENAI_API_KEY: ""
    }),
    validateRequiredFile("Build Tree", "FORGE_MASTER_BUILD_TREE.md"),
    validateRequiredFile("AGENTS", "AGENTS.md")
  ];

  results.forEach(printResult);

  const pass = results.filter(result => result.pass).length;
  const fail = results.length - pass;

  console.log("\nResumen:");
  console.log(`Total: ${results.length}`);
  console.log(`Pass: ${pass}`);
  console.log(`Fail: ${fail}`);

  if (fail === 0) {
    console.log("\n✅ FORGE FOUNDATION READY");
    return;
  }

  console.log("\n❌ FORGE FOUNDATION NEEDS REVIEW");
  process.exit(1);
}

run();
