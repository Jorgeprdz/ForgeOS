import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { File } from 'node:buffer';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    out[key] = argv[i + 1];
    i += 1;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const family = String(args.family || '').trim();
const fixture = String(args.fixture || '').trim();
const pdfName = String(args.name || `${family}.pdf`);
const outDir = String(args.out || 'tmp/quote-real-pdf-audit');
if (!family || !fixture) throw new Error('Usage: --family <orvi|segubeca|vida_mujer> --fixture <base64-file> [--name file.pdf]');

const EXPECTED = Object.freeze({
  orvi: {
    source: {
      product: 'ORVI 99-20 PAGOS UDIS', insured: 'VICTOR MENDEZ REYES', age: 37,
      currency: 'UDI', sumAssured: 135000, baseAnnualPremium: 3042.20,
      totalAnnualPremium: 4295.04, paymentYears: 20, coverageYears: 64,
    },
    material: { dashboardType: 'orvi', heroIntent: 'Protección', sections: ['guaranteed_recovery'] },
  },
  segubeca: {
    source: {
      product: 'SeguBeca 18', insured: 'hijoo hijoo', contractor: 'Juan Perez', childAge: 4,
      currency: 'UDI', educationGoal: 30000, totalAnnualPremium: 2524.19,
      withRecommended: 3080.09, paymentYears: 14, monthlyDelivery: 637, accumulatedDelivery: 30588,
    },
    material: { dashboardType: 'segubeca', heroIntent: 'Meta educativa', sections: ['participants', 'contribution', 'payout', 'protection'] },
  },
  vida_mujer: {
    source: {
      product: 'Vida Mujer', insured: 'Alejandra Moleres', age: 33,
      currency: 'UDI', sumAssured: 50000, totalAnnualPremium: 3061.82,
      withRecommended: 3890.21, paymentYears: 20, survivalTotal: 57500,
      endowments: [2500, 2500, 2500, 2500, 2500, 2500, 2500, 40000],
    },
    material: { dashboardType: 'vida_mujer', heroIntent: 'Suma asegurada', sections: ['scheduled_endowments', 'women_health_benefits'] },
  },
});
if (!EXPECTED[family]) throw new Error(`Unknown family: ${family}`);

function clone(value) {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value));
}
function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function finite(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function dig(obj, ...paths) {
  for (const p of paths) {
    const value = p.split('.').reduce((acc, key) => acc?.[key], obj);
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return null;
}
function moneyValue(value) {
  if (value && typeof value === 'object') return finite(value.value ?? value.udi ?? value.mxn ?? value.amountUdi ?? value.amountMxn);
  return finite(value);
}
function sectionKinds(snapshot) {
  return (snapshot?.dashboard?.model?.sections || []).map((entry) => entry?.kind || entry?.key || entry?.layoutRole).filter(Boolean);
}
function blockKinds(viewModel) {
  return (viewModel?.benefitBlocks || []).map((entry) => entry?.type || entry?.kind || entry?.key).filter(Boolean);
}
function materialHero(snapshot) {
  const hero = snapshot?.dashboard?.model?.hero;
  if (hero) return { label: hero.label ?? null, value: hero.value ?? null, secondaryValue: hero.secondaryValue ?? null };
  const protection = snapshot?.dashboard?.model?.sections?.find((entry) => entry?.kind === 'protection');
  return protection ? { label: protection.title ?? 'Protección', value: protection.items?.[0]?.value ?? null } : null;
}
function auraHero(viewModel) {
  const facts = viewModel?.contractual || [];
  const selected = facts.find((fact) => fact.id === 'annual_premium') || facts.find((fact) => fact.id === 'sum_assured') || facts[0] || null;
  return selected ? { label: selected.label, value: selected.display ?? selected.value, id: selected.id } : null;
}
function approx(actual, expected, tolerance = 0.02) {
  const a = moneyValue(actual);
  const e = Number(expected);
  return a !== null && Number.isFinite(e) && Math.abs(a - e) <= tolerance;
}
function containsText(actual, expected) {
  return normalize(actual).includes(normalize(expected));
}

fs.mkdirSync(outDir, { recursive: true });
const encoded = fs.readFileSync(fixture, 'utf8').replace(/\s+/g, '');
const bytes = Buffer.from(encoded, 'base64');
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
const file = new File([bytes], pdfName, { type: 'application/pdf' });

const parser = await import('../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js');
const accepted = await import('../docs/static-preview/quote-runtime/forge-accepted-quote-adapter.js');
const summaryEngine = await import('../docs/static-preview/quote-runtime/quote-benefit-summary-engine.js');
const presenter = await import('../docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js');

let packet = null;
let calculation = null;
let materialCalculation = null;
let materialSnapshot = null;
let auraResult = null;
let auraRuntimeError = null;
let vidaMujerEnrichment = null;

packet = await parser.parsePdfFileToAcceptedQuotePacket(file);
packet = accepted.validatePacket(packet);
calculation = await Promise.race([
  accepted.calculateAcceptedQuote(packet),
  new Promise((_, reject) => setTimeout(() => reject(new Error('AUDIT_CALCULATION_TIMEOUT_20000MS')), 20000)),
]);
materialCalculation = calculation;
if (family === 'vida_mujer') {
  const handoff = await import('../docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-handoff-m05e009.js');
  const enriched = handoff.enrichVidaMujerCalculation(packet, calculation);
  vidaMujerEnrichment = {
    beforeFamily: calculation?.productFamily ?? calculation?.product_family ?? null,
    beforeProductIntelligence: calculation?.productIntelligence ?? calculation?.product_intelligence ?? null,
    afterFamily: enriched?.productFamily ?? enriched?.product_family ?? null,
    afterProductIntelligenceSchema: enriched?.productIntelligence?.schema?.id ?? null,
  };
  materialCalculation = enriched;
}
materialSnapshot = presenter.createQuoteResultSnapshot({
  packet,
  calculation: materialCalculation,
  buildBenefitSummary: summaryEngine.buildQuoteBenefitSummary,
});

try {
  const auraModule = await import('../docs/static-preview/forge-aura/quotes/quotes-adapter.js');
  const auraAdapter = auraModule.createQuotesProductiveAdapter();
  auraResult = await auraAdapter.loadFile(file);
} catch (error) {
  auraRuntimeError = { name: error?.name || 'Error', message: error?.message || String(error), stack: String(error?.stack || '').split('\n').slice(0, 8) };
}

const source = EXPECTED[family].source;
const checks = [];
function check(id, ok, actual, expected, note = null) {
  checks.push({ id, ok: Boolean(ok), actual: clone(actual), expected: clone(expected), note });
}

check('product_identity', containsText(dig(packet, 'product', 'productName', 'nativeResult.product'), source.product), dig(packet, 'product', 'productName', 'nativeResult.product'), source.product);
check('currency', normalize(dig(packet, 'currency', 'nativeResult.currency', 'productIntelligence.identity.currency')) === normalize(source.currency), dig(packet, 'currency', 'nativeResult.currency', 'productIntelligence.identity.currency'), source.currency);
check('material_dashboard_type', materialSnapshot?.dashboard?.type === EXPECTED[family].material.dashboardType, materialSnapshot?.dashboard?.type, EXPECTED[family].material.dashboardType);

if (source.sumAssured) {
  const sum = dig(materialSnapshot, 'mandatory.sumAssured.value', 'mandatory.sumAssured.evidence.value', 'productIntelligence.protection_summary.basic_sum_assured.value', 'calculation.nativeResult.sumAssured', 'calculation.sumAssured');
  check('sum_assured', approx(sum, source.sumAssured, 1), sum, source.sumAssured);
}
if (source.educationGoal) {
  const hero = materialHero(materialSnapshot);
  check('education_goal_hero', containsText(hero?.label, 'Meta educativa') && String(hero?.value || '').includes('30,000'), hero, 'Meta educativa = 30,000 UDI');
}
if (source.totalAnnualPremium) {
  const total = dig(packet, 'nativeResult.totalAnnualPremium', 'nativeResult.annualPremium', 'annualPremium', 'productIntelligence.premium_structure.total_annual_premium.value', 'product_intelligence.premium_structure.total_annual_premium.value');
  check('total_annual_premium_source', approx(total, source.totalAnnualPremium, 1), total, source.totalAnnualPremium, 'Source PDF total annual premium; distinguishes basic coverage premium when applicable.');
}
if (family === 'orvi') {
  check('orvi_product_intelligence', dig(materialSnapshot, 'productIntelligence.schema.id') === 'forge.product_intelligence.orvi', dig(materialSnapshot, 'productIntelligence.schema.id'), 'forge.product_intelligence.orvi');
  const kinds = sectionKinds(materialSnapshot);
  check('orvi_recovery_sections', kinds.includes('guaranteed_recovery'), kinds, 'contains guaranteed_recovery');
}
if (family === 'segubeca') {
  const kinds = sectionKinds(materialSnapshot);
  for (const required of EXPECTED.segubeca.material.sections) check(`segubeca_section_${required}`, kinds.includes(required), kinds, required);
}
if (family === 'vida_mujer') {
  const kinds = sectionKinds(materialSnapshot);
  for (const required of EXPECTED.vida_mujer.material.sections) check(`vida_mujer_section_${required}`, kinds.includes(required), kinds, required);
  check('vida_mujer_enrichment_pi', vidaMujerEnrichment?.afterProductIntelligenceSchema === 'forge.product_intelligence.vida_mujer', vidaMujerEnrichment, 'forge.product_intelligence.vida_mujer');
}

const auraViewModel = auraResult?.viewModel ?? null;
const materialHeroValue = materialHero(materialSnapshot);
const auraHeroValue = auraHero(auraViewModel);
const semanticComparison = {
  materialDashboardType: materialSnapshot?.dashboard?.type ?? null,
  materialHero: materialHeroValue,
  materialSections: sectionKinds(materialSnapshot),
  materialMandatory: clone(materialSnapshot?.mandatory),
  auraFamily: auraViewModel?.family ?? null,
  auraHeroByCurrentModuleRule: auraHeroValue,
  auraBenefitBlockTypes: blockKinds(auraViewModel),
  auraHasProductIntelligence: auraViewModel?.hasProductIntelligence ?? null,
  auraIntelligenceProjection: clone(auraViewModel?.intelligence),
  heroMismatch: Boolean(materialHeroValue && auraHeroValue && normalize(materialHeroValue.label) !== normalize(auraHeroValue.label)),
};

const report = {
  auditVersion: 'FORGE_REAL_PDF_PRODUCT_INTELLIGENCE_AUDIT_008',
  family,
  pdf: { name: pdfName, bytes: bytes.length, sha256 },
  expectedSourceTruth: EXPECTED[family],
  checks,
  verdict: checks.every((entry) => entry.ok) ? 'SOURCE_AND_MATERIAL_CONTRACT_PASS' : 'SOURCE_OR_MATERIAL_CONTRACT_MISMATCH',
  packet: clone(packet),
  calculation: clone(calculation),
  vidaMujerEnrichment: clone(vidaMujerEnrichment),
  material3: clone(materialSnapshot),
  aura: auraResult ? { packet: clone(auraResult.packet), calculation: clone(auraResult.calculation), viewModel: clone(auraResult.viewModel) } : null,
  auraRuntimeError,
  semanticComparison,
};

const jsonPath = path.join(outDir, `${family}.json`);
const mdPath = path.join(outDir, `${family}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const failed = checks.filter((entry) => !entry.ok);
const md = `# ${family} real PDF audit\n\n` +
  `- PDF: \`${pdfName}\`\n` +
  `- SHA-256: \`${sha256}\`\n` +
  `- Verdict: **${report.verdict}**\n` +
  `- Material 3 dashboard: **${semanticComparison.materialDashboardType || 'n/a'}**\n` +
  `- Material 3 hero: **${materialHeroValue?.label || 'n/a'}** — ${materialHeroValue?.value || 'n/a'}\n` +
  `- Aura current hero rule: **${auraHeroValue?.label || 'n/a'}** — ${auraHeroValue?.value || 'n/a'}\n` +
  `- Aura Product Intelligence: **${String(semanticComparison.auraHasProductIntelligence)}**\n` +
  `- Material sections: ${semanticComparison.materialSections.join(', ') || 'n/a'}\n` +
  `- Aura benefit blocks: ${semanticComparison.auraBenefitBlockTypes.join(', ') || 'n/a'}\n` +
  `- Contract checks: ${checks.length - failed.length}/${checks.length} pass\n` +
  (failed.length ? `\n## Mismatches\n${failed.map((entry) => `- **${entry.id}**: actual=${JSON.stringify(entry.actual)} expected=${JSON.stringify(entry.expected)}`).join('\n')}\n` : '') +
  (auraRuntimeError ? `\n## Aura runtime diagnostic\n- ${auraRuntimeError.message}\n` : '');
fs.writeFileSync(mdPath, md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);

console.log(JSON.stringify({
  family,
  verdict: report.verdict,
  checks: checks.map(({ id, ok }) => ({ id, ok })),
  semanticComparison,
  auraRuntimeError,
  report: jsonPath,
}, null, 2));
