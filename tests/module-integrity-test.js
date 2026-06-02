const modules = [
  '../product-detection-engine.js',
  '../presentation-input-pipeline.js',
  '../policy-detail-engine.js',
  '../policy-timeline-engine.js',
  '../policy-renewal-engine.js',
];

const results = [];

async function testImport(modulePath) {
  try {
    await import(modulePath);
    results.push({ modulePath, status: 'PASS' });
  } catch (error) {
    results.push({
      modulePath,
      status: 'FAIL',
      error: error.message,
    });
  }
}

console.log('\nFORGE MODULE INTEGRITY REPORT v0.1\n');

for (const modulePath of modules) {
  await testImport(modulePath);
}

for (const result of results) {
  if (result.status === 'PASS') {
    console.log(`✅ ${result.modulePath}`);
  } else {
    console.log(`❌ ${result.modulePath}`);
    console.log(`   ${result.error}`);
  }
}

const failed = results.filter((result) => result.status === 'FAIL');

console.log('\nResumen:');
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);

if (failed.length > 0) {
  process.exit(1);
}
