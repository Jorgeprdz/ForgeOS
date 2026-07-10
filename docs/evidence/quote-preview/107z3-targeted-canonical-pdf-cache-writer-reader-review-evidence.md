# 107Z3 — Targeted static evidence

Status: **HOLD**

Focused candidate count: **58**

## Candidate ranking

### `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`

- Score: `15`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getQuoteDetail", "parameters": ["quoteId"], "form": "function"}, {"name": "getQuoteReadModelManifest", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L3: `export const QUOTE_READ_MODEL_ADAPTER_ID = 'forge.quote.read_model.adapter.v1';`
- L4: `export const QUOTE_READ_MODEL_SAFE_ERROR = 'QUOTE_READ_MODEL_NOT_MODELED';`
- L5: `export const QUOTE_READ_MODEL_SCHEMA_VERSION = 'forge.backend.read_model.v1';`
- L6: `export const QUOTE_READ_MODEL_SOURCE_ENGINE = 'gmm-quote-summary-engine.js';`
- L8: `const PREVIEW_QUOTE_ID = 'quote_preview_gmm_lariza_alfa_medical_069c';`
- L12: `crmWrite: false,`
- L13: `pipelineWrite: false,`
- L14: `policyWrite: false,`
- L15: `quoteWrite: false,`
- L22: `browserPersistence: false,`
- L37: `'policy_write',`
- L38: `'crm_write',`
- L39: `'pipeline_write',`
- L45: `'browser_persistence',`
- L59: `Fecha en que se elaboro la cotizacion: 05 de junio de 2026`
- L74: `Esta cotizacion es ilustrativa y no forma parte del contrato de seguro.`
- L92: `event: 'read_model_used',`
- L93: `adapterId: QUOTE_READ_MODEL_ADAPTER_ID,`
- L94: `sourceEngineRef: QUOTE_READ_MODEL_SOURCE_ENGINE,`
- L101: `schemaVersion: QUOTE_READ_MODEL_SCHEMA_VERSION,`
- L103: `routeClass: 'read_only',`
- L104: `readModel: {`
- L107: `records: [],`
- L108: `emptyState: {`
- L110: `message: 'No modeled quote read-model record matched this preview request.'`
- L114: `code: QUOTE_READ_MODEL_SAFE_ERROR,`
- L115: `safeMessage: 'Quote read model detail is not modeled for the requested id.',`
- L161: `quote_type: 'gmm_quote_preview',`
- L193: `'No provider execution or quote write occurred.'`
- L195: `source_engine_ref: QUOTE_READ_MODEL_SOURCE_ENGINE,`
- L198: `audit_event: 'read_model_used',`
- L205: `function makeOkEnvelope(records) {`
- L207: `schemaVersion: QUOTE_READ_MODEL_SCHEMA_VERSION,`
- L209: `routeClass: 'read_only',`
- L210: `readModel: {`
- L211: `status: records.length ? 'ok' : 'empty'`
- L213: `records,`
- L214: `emptyState: records.length ? null : {`
- L216: `message: 'No modeled quote read-model records are available.'`
- L229: `export function getQuoteReadModelManifest() {`
- L231: `adapterId: QUOTE_READ_MODEL_ADAPTER_ID,`
- L233: `adapterMode: 'read_only',`
- L234: `routeClass: 'read_only',`
- L236: `schemaVersion: QUOTE_READ_MODEL_SCHEMA_VERSION,`
- L238: `sourceEngineRef: QUOTE_READ_MODEL_SOURCE_ENGINE,`
- L239: `safeErrorCode: QUOTE_READ_MODEL_SAFE_ERROR,`
- L248: `export function listQuotes(input = {}) {`
- L249: `if (input && input.forceEmpty === true) {`
- L253: `const text = typeof input.text === 'string' && input.text.trim()`
- L254: `? input.text`
- L265: `export function getQuoteDetail(quoteId) {`
- L268: `...makeEmptyEnvelope('invalid_input'),`
- L269: `readModel: { status: 'error' },`
- L271: `code: QUOTE_READ_MODEL_SAFE_ERROR,`
- L272: `safeMessage: 'Quote read model detail requires a quote id.',`
- L279: `const record = envelope.records.find((quote) => quote.quote_id === quoteId);`
- L281: `if (!record) {`
- L285: `return makeOkEnvelope([record]);`

### `supabase/functions/semantic-extract/index.ts`

- Score: `15`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[{"name": "computeQuality", "parameters": ["type: string", "owner: string", "action: string | null", "due: string | null"], "form": "function"}]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L5: `getNormalizedAction,`
- L6: `getNormalizedDue,`
- L24: `"psychological_state",`
- L62: `const normalizedAction = getNormalizedAction(note);`
- L65: `const due = getNormalizedDue(note);`
- L74: `type: "commitment_established",`
- L90: `return type === "commitment_established" || type === "conversation_occurred";`
- L97: `function hasForbiddenInference(candidate: Record<string, unknown>): boolean {`
- L101: `function computeQuality(`
- L107: `if (type !== "commitment_established") return "informational";`
- L114: `candidate: Record<string, unknown>,`
- L157: `quality: computeQuality(type, owner, action, due),`
- L168: `const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");`
- L179: `- commitment_established`
- L190: `- "Pidió 6 cotizaciones para el martes" => owner: advisor, action: preparar/enviar 6 cotizaciones, due: martes.`
- L205: `Never infer emotions, personality, hidden intent, psychological state, manipulation strategy, urgency based on vulnerability, purchase probability, conversion likelihood, political affiliation, religious belief, or health status.`
- L211: `Output shape:`
- L215: `"type": "commitment_established",`
- L229: `const model = genAI.getGenerativeModel({ model: MODEL_VERSION });`
- L301: `const responseText = await callGemini(note);`
- L303: `let parsed: Record<string, unknown>;`
- L306: `parsed = JSON.parse(responseText);`
- L318: `candidate as Record<string, unknown>,`

### `product-intelligence/evidence/forge-quote-pdf-preview-engine.js`

- Score: `11`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "findLine", "parameters": ["pattern"], "form": "arrow"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L61: `const findLine = (pattern) => lines.find((line) => pattern.test(line)) || '';`
- L63: `const advisorLine = findLine(/Asesor profesional de seguros:/i);`
- L64: `const insuredLine = findLine(/Asegurado:/i);`
- L65: `const birthLine = findLine(/Fecha de nacimiento:/i);`
- L66: `const genderLine = findLine(/G[eé]nero:/i);`
- L67: `const liquidationLine = findLine(/Opci[oó]n de liquidaci[oó]n:/i);`
- L68: `const productIndex = lines.findIndex((line) => /IMAGINA SER/i.test(line));`
- L73: `const totalPremiumValues = parseNumberList(findLine(/Prima Total Anual/i));`
- L74: `const basicPremiumValues = parseNumberList(findLine(/Prima b[aá]sica/i));`
- L75: `const plannedPremiumValues = parseNumberList(findLine(/Prima planeada/i));`
- L76: `const totalTablePremiumValues = parseNumberList(findLine(/Prima total/i));`
- L77: `const scenarioLine = lines.find((line) => /^\d+\s+\d+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+$/.test(line)) || '';`
- L79: `const interestValues = parseNumberList(findLine(/inter[eé]s utilizada/i));`
- L80: `const studyDateLine = findLine(/Solucionline versi[oó]n/i);`
- L81: `const guaranteeLine = findLine(/periodo de garant[ií]a/i);`
- L99: `const scenario = (offset) => scenarioValues.length >= offset + 2 ? {`
- L102: `singlePaymentUdi: scenarioValues[offset],`
- L103: `monthlyIncomeUdi: scenarioValues[offset + 1]`
- L175: `calculationMode: 'forge_quote_pdf_preview_with_evidenced_udi_growth_rule',`
- L178: `quoteWrite: false,`
- L212: `function summarizeForgeQuotePdfText(input = {}) {`
- L213: `const text = String(input.text || input.rawText || input.quoteText || '');`
- L221: `result.calculation = buildCalculation(result, input);`
- L224: `sourceModule: 'forge-quote-pdf-preview-engine.js',`
- L225: `exportUsed: 'summarizeForgeQuotePdfText',`
- L229: `quoteWrite: false,`
- L255: `summarizeForgeQuotePdfText,`

### `quote-to-policy-comparison-engine.js`

- Score: `10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L11: `| Compara una cotizacion GMM contra una caratula emitida.`
- L195: `const deductibleChange = changed.find((item) => item.field === 'deductible');`
- L208: `const sumInsuredChange = changed.find((item) => item.field === 'sumInsured');`

### `compensation/partner-manager/partner-payout-truth-gate.js`

- Score: `9`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L7: `PARTNER_STATEMENT_MATCH_STATUSES,`
- L8: `} from './partner-compensation-statement-match.js';`
- L20: `mapPartnerCalculationToPayoutState,`
- L25: `PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_AMOUNT,`
- L26: `PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_CONCEPT,`
- L27: `PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_PERIOD,`
- L28: `PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_PARTNER,`
- L34: `if (sourceType === PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.PDF_EXTRACTION) return 'pdf_extraction_is_not_payout_truth';`
- L48: `PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_ECONOMIC_INPUT,`
- L59: `statementMatch = null,`
- L66: `partnerId: statementMatch?.partnerId,`
- L67: `period: statementMatch?.period,`
- L95: `return mapPartnerCalculationToPayoutState(safeCalculationResult);`
- L100: `...mapPartnerCalculationToPayoutState(safeCalculationResult),`
- L102: `blockedReasons: ['missing_official_statement'],`
- L113: `blockedReasons: [extractionReason, 'needs_human_confirmation_and_official_statement'],`
- L130: `if (!statementMatch) {`
- L136: `blockedReasons: ['missing_official_statement_line'],`
- L141: `if (isMismatch(statementMatch.matchStatus)) {`
- L144: `partnerId: statementMatch.partnerId,`
- L145: `period: statementMatch.period,`
- L147: `officialAmount: statementMatch.officialAmount,`
- L148: `officialCurrency: statementMatch.officialCurrency,`
- L151: `statementMatch,`
- L152: `mismatchReasons: statementMatch.mismatchReasons.length ? statementMatch.mismatchReasons : [statementMatch.matchStatus],`
- L153: `confidence: statementMatch.matchConfidence,`
- L157: `if (statementMatch.matchStatus !== PARTNER_STATEMENT_MATCH_STATUSES.MATCHED || statementMatch.canSupportPayoutTruth !== true) {`
- L160: `partnerId: statementMatch.partnerId,`
- L161: `period: statementMatch.period,`
- L163: `officialAmount: statementMatch.officialAmount,`
- L164: `officialCurrency: statementMatch.officialCurrency,`
- L167: `statementMatch,`
- L168: `blockedReasons: statementMatch.mismatchReasons.length ? statementMatch.mismatchReasons : ['matched_official_statement_line_required'],`
- L169: `confidence: statementMatch.matchConfidence,`
- L173: `if (lifecycleContext.heldPrecontractCommission === true && lifecycleContext.officialReleaseStatementConfirmed !== true) {`
- L176: `partnerId: statementMatch.partnerId,`
- L177: `period: statementMatch.period,`
- L179: `officialAmount: statementMatch.officialAmount,`
- L180: `officialCurrency: statementMatch.officialCurrency,`
- L183: `statementMatch,`
- L184: `blockedReasons: ['precontract_held_commission_requires_official_release_statement'],`
- L191: `partnerId: statementMatch.partnerId,`
- L192: `period: statementMatch.period,`
- L194: `officialAmount: statementMatch.officialAmount,`
- L195: `officialCurrency: statementMatch.officialCurrency,`
- L198: `statementMatch,`
- L200: `confidence: statementMatch.matchConfidence,`
- L201: `sourceNotes: ['Official statement line confirms Partner payout truth.'],`

### `gmm-advisor-review-engine.js`

- Score: `9`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L11: `| Convierte hechos de cotizacion, caratula y comparacion en briefing de asesor.`
- L45: `return 'READY FOR ADVISOR REVIEW';`
- L55: `function buildCaseSnapshot({ quoteSummary = {}, policySummary = {}, comparisonSummary = {} }) {`
- L180: `return [...new Set(topics)];`
- L192: `'Are these documents intended to be reviewed together, or do they belong to different cases?'`
- L209: `function buildAdvisorSummary({ caseSnapshot, advisorAlerts = [], expectationGaps = [] }) {`
- L214: `'This case is marked ${caseSnapshot.status}.',`
- L215: `'The quote prospect is ${caseSnapshot.prospect || 'unknown'}, while the issued policy shows ${caseSnapshot.issuedPolicy || 'unknown'}.'`
- L218: `if (caseSnapshot.identityMatch === 'DIFFERENT_INSURED') {`
- L237: `'Focus the conversation on what changed, what is now shown in the issued policy, and what the client believed they were getting.'`
- L252: `const caseSnapshot =`
- L253: `buildCaseSnapshot({`
- L263: `caseSnapshot,`
- L285: `caseSnapshot,`

### `gmm-quote-summary-engine.js`

- Score: `8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "findMoneyAfter", "parameters": ["label", "text"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L11: `| Resume una cotizacion GMM para uso del asesor.`
- L47: `function findMoneyAfter(label, text) {`
- L131: `sumInsured: findMoneyAfter('Suma Asegurada:', clean),`
- L132: `deductible: findMoneyAfter('Deducible:', clean),`
- L134: `coinsuranceCap: findMoneyAfter('limite de', clean) ?? findMoneyAfter('límite de', clean),`
- L138: `premium: findMoneyAfter('PRIMA ANUAL', clean),`

### `product-detection-engine.js`

- Score: `8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "getProductCandidates", "parameters": ["product = {}"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L11: `| Detecta producto probable desde cotización extraída.`
- L26: `function scoreTextMatch(input = '', candidate = '') {`
- L27: `const normalizedInput = normalizeText(input);`
- L30: `if (!normalizedInput || !normalizedCandidate) {`
- L34: `if (normalizedInput === normalizedCandidate) {`
- L39: `normalizedInput.includes(normalizedCandidate)`
- L40: `|| normalizedCandidate.includes(normalizedInput)`
- L45: `const inputWords = new Set(normalizedInput.split(' '));`
- L46: `const candidateWords = new Set(normalizedCandidate.split(' '));`
- L48: `const intersection = [...inputWords]`
- L51: `const union = new Set([`
- L52: `...inputWords,`
- L59: `function getProductCandidates(product = {}) {`
- L100: `export function detectarProductoCotizacion({`
- L121: `const candidates = getProductCandidates(product);`

### `product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js`

- Score: `8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "resolveAveType", "parameters": ["position"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L13: `function resolveAveType(position) {`
- L73: `const resolved =`
- L74: `resolveAveType(position);`
- L76: `if (resolved.aveType === "UNKNOWN") {`
- L87: `"Cotización no distingue AVE CP/LP y no hay valores observados suficientes para inferir."`
- L95: `aveType: resolved.aveType,`
- L102: `aveType: resolved.aveType,`
- L109: `aveType: resolved.aveType,`
- L111: `inferenceConfidence: resolved.inference`
- L112: `? resolved.inference.confidence`
- L182: `resolveAveType`

### `product-intelligence/knowledge/vida-mujer-client-explanation-report.js`

- Score: `8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "getAnnualPremium", "parameters": [], "form": "function"}, {"name": "getCoverageAmount", "parameters": ["code"], "form": "function"}, {"name": "getGuaranteedValues", "parameters": [], "form": "function"}, {"name": "getRecommendedPremium", "parameters": [], "form": "function"}, {"name": "getSurvivalTotal", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L20: `const text = fs.readFileSync(txtPath, "utf8");`
- L44: `function getCoverageAmount(code) {`
- L64: `function getAnnualPremium() {`
- L69: `function getRecommendedPremium() {`
- L74: `function getSurvivalTotal() {`
- L79: `function getGuaranteedValues() {`
- L107: `const hasAveValue = rows.some((row) => row.aveRescueValue > 0);`
- L109: `return hasAveValue`
- L117: `const basic = getCoverageAmount("VIDA_MUJER");`
- L118: `const bait = getCoverageAmount("BAIT");`
- L119: `const bma = getCoverageAmount("BMA");`
- L120: `const pcf = getCoverageAmount("PCF");`
- L121: `const pep = getCoverageAmount("PEP");`
- L122: `const clp = getCoverageAmount("CLP");`
- L123: `const adapta = getCoverageAmount("ADAPTA");`
- L125: `const annualPremium = getAnnualPremium();`
- L126: `const recommendedPremium = getRecommendedPremium();`
- L127: `const survivalTotal = getSurvivalTotal();`
- L129: `const guaranteedValues = getGuaranteedValues();`
- L163: `console.log("✅ BAM, AV y BIT aparecen amparados o contratados según la cotización.");`
- L182: `'Si la asegurada llega al año 20, la cotización indica un total de supervivencia de ${money(survivalTotal)} ${currency}.'`
- L205: `"La tabla muestra columna de AVE, pero el valor de rescate AVE aparece en cero. Forge lo interpreta como AVE no contratado o sin valor en esta cotización."`
- L209: `"La cotización muestra valor de rescate AVE mayor a cero."`
- L217: `"⚠️ CLP aparece recomendado con una suma asegurada mayor al 50% de la suma asegurada básica. Forge lo marca para revisión porque puede depender de reglas adicionales no visibles en la cotización."`

### `vida-mujer-pdf-ave-integration-report.js`

- Score: `8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "getCoverageAmount", "parameters": ["code"], "form": "function"}, {"name": "getGuaranteedValues", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L32: `const text = fs.readFileSync(txtPath, "utf8");`
- L53: `function getCoverageAmount(code) {`
- L77: `function getGuaranteedValues() {`
- L148: `getCoverageAmount("VIDA_MUJER");`
- L151: `getGuaranteedValues();`
- L171: `console.log("Forge interpreta esta cotización como AVE no contratada o sin valor acumulado visible.");`
- L252: `name: "Detecta AVE en cero para esta cotización",`

### `quotation-currency-bridge.js`

- Score: `7`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L3: `| MODULE: quotation-currency-bridge.js`
- L11: `| Conecta la cotización con currency-normalization-engine.`
- L19: `export function normalizarCotizacionAMXN({`

### `telemetry.js`

- Score: `6`
- Quote/PDF relevance: `false`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `["beforeunload", "visibilitychange"]`
- Rejected reasons: `[]`

Relevant lines:

- L26: `track(event, payload = {}) {`
- L36: `payload,`
- L114: `setInterval(`
- L127: `'beforeunload',`
- L141: `document.visibilityState ===`

### `nash-combat-intelligence-report-engine.js`

- Score: `5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L9: `REAL_BUDGET_CONSTRAINT:`
- L21: `ALREADY_SOLVED:`
- L23: `READY_TO_MEET:`
- L31: `REAL_BUDGET_CONSTRAINT: "Validar flujo y explorar escenarios.",`
- L37: `ALREADY_SOLVED: "Proponer auditoría sin amenaza.",`
- L38: `READY_TO_MEET: "Agendar.",`
- L44: `REAL_BUDGET_CONSTRAINT: "Presionar puede generar rechazo o culpa.",`
- L50: `ALREADY_SOLVED: "Atacar lo que ya tiene puede activar defensa.",`
- L51: `READY_TO_MEET: "Hablar demasiado puede enfriar el interés.",`
- L73: `function buildCombatIntelligenceReport(input = {}) {`
- L74: `const objection = input.objection || "";`
- L75: `const context = input.context || {};`
- L76: `const personality = input.personality || {};`
- L125: `"No mandes producto, PDF, cotización o precio como primera reacción."`

### `policy-operations/evidence/policy-ocr-engine.js`

- Score: `5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L11: `| OCR/Text extraction foundation para pólizas y cotizaciones PDF.`
- L26: `const inputPath = filePath || file;`
- L28: `if (!inputPath) {`
- L35: `inputPath,`

### `presentation-input-context-builder.js`

- Score: `5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L3: `| MODULE: presentation-input-context-builder.js`
- L16: `export function construirContextoPresentacionDesdeCotizacion({`
- L56: `'Separar datos de cotización de inferencias.',`
- L58: `'Usar la cotización como base.',`

### `product-intelligence/quotes/quotation-extraction-result.entity.js`

- Score: `5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L3: `| MODULE: quotation-extraction-result.entity.js`
- L11: `| Resultado estructurado después de OCR/parser de cotización.`
- L16: `export function crearQuotationExtractionResult({`
- L18: `quotationInputId,`
- L33: `quotationInputId,`

### `segu-beca-client-presentation-engine.js`

- Score: `5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L50: `"Si tu hijo elige UNAM, IPN o UAM, el capital puede servir para transporte, materiales, computadora, idiomas, intercambio, titulación o posgrado."`
- L62: `'La cotización muestra un ahorro educativo base de ${educationCapitalUDI.toLocaleString("es-MX")} UDI y una recuperación total de ${finalRecoveryUDI.toLocaleString("es-MX")} UDI.'`

### `product-intelligence/evidence/gmm-quote-parser.js`

- Score: `3`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "findMoneyAfter", "parameters": ["label", "text"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L18: `function findMoneyAfter(label, text) {`
- L44: `findMoneyAfter('PRIMA ANUAL', clean)`
- L45: `?? findMoneyAfter('Prima anual', clean);`

### `product-intelligence/evidence/solucionline-retirement-parser.js`

- Score: `3`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "getNumber", "parameters": ["value"], "form": "arrow"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L4: `const getNumber = (value) =>`
- L18: `const currentAge = getNumber(ageMatch?.[1]);`
- L19: `const retirementAge = getNumber(productMatch?.[1]);`
- L21: `const premiumPayingYears = getNumber(limitedMatch?.[1]);`
- L24: `const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);`
- L25: `const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);`
- L26: `const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);`
- L27: `const sumAssured = getNumber(coverageMatch?.[2]);`
- L31: `lumpSum: getNumber(scenarioMatch[2]),`
- L32: `monthlyIncome: getNumber(scenarioMatch[3]),`
- L35: `lumpSum: getNumber(scenarioMatch[4]),`
- L36: `monthlyIncome: getNumber(scenarioMatch[5]),`
- L39: `lumpSum: getNumber(scenarioMatch[6]),`
- L40: `monthlyIncome: getNumber(scenarioMatch[7]),`
- L83: `? getNumber(interestRateMatch[1])`

### `imagina-ser-future-mxn-bridge.js`

- Score: `2`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L27: `const targetAge = startAge + index;`
- L31: `targetAge,`
- L54: `targetAge,`
- L62: `targetAge: retirementAge,`
- L66: `const numberOfPayments = targetAge - retirementAge + 1;`
- L77: `targetAge,`
- L98: `targetAge: quoteFacts.retirementAge,`
- L105: `function buildImaginaSerFutureMxnBridge({`
- L185: `targetAge: 75,`
- L194: `targetAge: 80,`
- L210: `buildImaginaSerFutureMxnBridge,`

### `orvi-decision-engine.js`

- Score: `0`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- No matching static lines.

### `orvi-mxn-conversion-engine.js`

- Score: `0`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- No matching static lines.

### `platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js`

- Score: `0`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[{"name": "makeProductRecord", "parameters": ["config"], "form": "function"}]`
- Reader functions: `[{"name": "getProductIntelligenceReadModelByFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getProductIntelligenceReadModelCatalog", "parameters": [], "form": "function"}, {"name": "validateProductIntelligenceReadModelShape", "parameters": ["readModel"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L1: `export const ADAPTER_ID = 'forge.product_intelligence.read_model.adapter.v1';`
- L2: `export const SCHEMA_VERSION = 'forge.product_intelligence.read_model.v1';`
- L5: `notModeled: 'PRODUCT_INTELLIGENCE_READ_MODEL_NOT_MODELED',`
- L13: `crmWrite: false,`
- L14: `pipelineWrite: false,`
- L15: `policyWrite: false,`
- L16: `quoteWrite: false,`
- L23: `browserPersistence: false,`
- L58: `'confidence_state',`
- L59: `'unknown_state',`
- L60: `'blocked_state',`
- L61: `'not_modeled_state',`
- L76: `'policy_write',`
- L77: `'crm_write',`
- L78: `'pipeline_write',`
- L84: `'pdf_read',`
- L86: `'browser_persistence',`
- L120: `function makeProductRecord(config) {`
- L135: `mode: 'read_only',`
- L169: `summary: 'Quote PDF preview may consume Product Intelligence; it is not authority.',`
- L170: `quote_pdf_preview_role: 'consumer_reference_only',`
- L171: `mapped_refs: makeRefs(['product-intelligence/evidence/forge-quote-pdf-preview-engine.js']),`
- L183: `confidence_state: {`
- L188: `unknown_state: {`
- L192: `blocked_state: {`
- L196: `not_modeled_state: {`
- L201: `audit_event: 'read_model_used',`
- L207: `const PRODUCT_RECORDS = Object.freeze([`
- L208: `makeProductRecord({`
- L221: `adapters: ['platform/adapters/quote-read-model/quote-read-model-adapter-069c.js'],`
- L227: `policySummary: 'Policy semantics consumed from Policy Read Model, not owned here.',`
- L232: `policyRefs: makeRefs(['platform/adapters/policy-read-model/policy-read-model-adapter-068b.js']),`
- L235: `makeProductRecord({`
- L254: `policySummary: 'Policy linkage remains read-only and source-evidence dependent.',`
- L262: `makeProductRecord({`
- L292: `makeProductRecord({`
- L300: `'imagina-ser-future-mxn-bridge.js',`
- L323: `makeProductRecord({`
- L350: `makeProductRecord({`
- L375: `export function getProductIntelligenceReadModelCatalog() {`
- L380: `mode: 'read_only',`
- L382: `readModel: {`
- L384: `records: clone(PRODUCT_RECORDS)`
- L387: `event: 'read_model_used',`
- L396: `export function getProductIntelligenceReadModelByFamily(productFamily) {`
- L402: `const record = PRODUCT_RECORDS.find((entry) => entry.product_family.toLowerCase() === normalized);`
- L404: `if (!record) {`
- L412: `mode: 'read_only',`
- L414: `readModel: {`
- L416: `records: [clone(record)]`
- L420: `event: 'read_model_used',`
- L434: `mode: 'read_only',`
- L436: `readModel: {`
- L438: `records: []`
- L442: `safeMessage: 'Product Intelligence read model is not modeled for the requested family.',`
- L447: `event: 'read_model_used',`
- L456: `export function validateProductIntelligenceReadModelShape(readModel) {`
- L458: `const records = Array.isArray(readModel?.readModel?.records)`
- L459: `? readModel.readModel.records`
- L460: `: Array.isArray(readModel)`
- L461: `? readModel`
- L464: `if (!records.length) {`
- L465: `errors.push('records_required');`
- L468: `records.forEach((record) => {`
- L469: `if (record.schemaVersion !== SCHEMA_VERSION) errors.push('${record.product_family || 'unknown'}:schemaVersion');`
- L470: `if (record.domainId !== 'product_intelligence') errors.push('${record.product_family || 'unknown'}:domainId');`
- L471: `if (record.mode !== 'read_only') errors.push('${record.product_family || 'unknown'}:mode');`
- L472: `if (record.routeClass !== 'preview_safe') errors.push('${record.product_family || 'unknown'}:routeClass');`
- L475: `if (!(field in record)) {`
- L476: `errors.push('${record.product_family || 'unknown'}:${field}');`
- L480: `Object.entries(record.safety_flags || {}).forEach(([key, value]) => {`
- L482: `errors.push('${record.product_family || 'unknown'}:safety_flags.${key}');`

### `product-intelligence/knowledge/ave/shared-ave-growth-engine.js`

- Score: `0`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- No matching static lines.

### `retirement-future-udi-projection-engine.js`

- Score: `0`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- L4: `const SUPPORTED_VALUE_TYPES = new Set([`
- L31: `targetAge,`
- L36: `const normalizedTargetAge = requireFiniteNumber(targetAge, "targetAge");`
- L46: `normalizedTargetAge - normalizedCurrentAge,`
- L52: `targetAge: normalizedTargetAge,`
- L64: `targetAge,`
- L74: `targetAge,`
- L82: `targetAge: projection.targetAge,`

### `segu-beca-education-comparison-engine.js`

- Score: `0`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `[]`

Relevant lines:

- No matching static lines.

### `platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js`

- Score: `-5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "buildReadinessGateSafeError", "parameters": ["gateId", "code = SAFE_ERROR_CODES.READINESS_GATE_NOT_MAPPED"], "form": "function"}, {"name": "getBlockingExecutionReadinessGates", "parameters": [], "form": "function"}, {"name": "getNotReadyExecutionGates", "parameters": [], "form": "function"}, {"name": "getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog", "parameters": [], "form": "function"}, {"name": "getReadinessGateById", "parameters": ["gateId"], "form": "function"}, {"name": "getReadinessGatesByStatus", "parameters": ["status"], "form": "function"}, {"name": "getSatisfiedExecutionReadinessGates", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}, {"name": "validateReadinessGateShape", "parameters": ["gate"], "form": "function"}, {"name": "validateReadinessReviewMatrixCatalog", "parameters": ["catalog"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L3: `const surfaces = require('./quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js');`
- L4: `const evidence = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');`
- L5: `const provenance = require('./quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');`
- L7: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.canonical_execution_readiness.review_matrix.adapter.v1';`
- L8: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.canonical_execution_readiness.review_matrix.v1';`
- L9: `const DOMAIN_ID = 'quote_preview_pdf_engine_canonical_execution_readiness_review';`
- L10: `const MODE = 'read_only';`
- L15: `NOT_READY: 'not_ready',`
- L19: `const READINESS_DECISIONS = Object.freeze({`
- L20: `READY: 'ready',`
- L21: `NOT_READY_FOR_EXECUTION: 'not_ready_for_execution',`
- L33: `READINESS_GATE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_EXECUTION_READINESS_GATE_NOT_MAPPED',`
- L34: `EXECUTION_NOT_READY: 'QUOTE_PREVIEW_PDF_EXECUTION_NOT_READY',`
- L35: `PDF_FILE_OR_HASH_REQUIRED: 'QUOTE_PREVIEW_PDF_REAL_FILE_OR_HASH_REQUIRED',`
- L36: `EXPECTED_VALUE_SOURCE_TRACE_REQUIRED: 'QUOTE_PREVIEW_PDF_EXPECTED_VALUE_SOURCE_TRACE_REQUIRED',`
- L37: `DETERMINISTIC_INPUT_SOURCE_TRACE_REQUIRED: 'QUOTE_PREVIEW_PDF_DETERMINISTIC_INPUT_SOURCE_TRACE_REQUIRED',`
- L38: `PARSER_OWNERSHIP_DECISION_REQUIRED: 'QUOTE_PREVIEW_PDF_PARSER_OWNERSHIP_DECISION_REQUIRED',`
- L39: `BANXICO_RUNTIME_GATE_REQUIRED: 'QUOTE_PREVIEW_PDF_BANXICO_RUNTIME_GATE_REQUIRED',`
- L40: `QUOTE_TRUTH_BOUNDARY_REQUIRED: 'QUOTE_PREVIEW_PDF_QUOTE_TRUTH_BOUNDARY_REQUIRED',`
- L41: `FIXTURE_AS_REAL_PDF_BLOCKED: 'QUOTE_PREVIEW_PDF_FIXTURE_AS_REAL_PDF_BLOCKED',`
- L42: `GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED: 'QUOTE_PREVIEW_PDF_GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED',`
- L43: `DUPLICATE_ENGINE_CREATION_BLOCKED: 'QUOTE_PREVIEW_PDF_DUPLICATE_ENGINE_CREATION_BLOCKED',`
- L47: `crmWrite: false,`
- L48: `pipelineWrite: false,`
- L49: `policyWrite: false,`
- L50: `quoteWrite: false,`
- L57: `browserPersistence: false,`
- L62: `pdfRead: false,`
- L76: `'readiness_decision',`
- L94: `const READINESS_MATRIX = Object.freeze([`
- L99: `source_registry_refs: ['quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js'],`
- L101: `readiness_decision: READINESS_DECISIONS.READY,`
- L110: `source_registry_refs: ['quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js'],`
- L112: `readiness_decision: READINESS_DECISIONS.READY,`
- L121: `source_registry_refs: ['quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js'],`
- L123: `readiness_decision: READINESS_DECISIONS.READY,`
- L129: `gate_id: 'real_pdf_file_or_hash_ready',`
- L130: `gate_status: GATE_STATUSES.NOT_READY,`
- L134: `readiness_decision: READINESS_DECISIONS.NOT_READY_FOR_EXECUTION,`
- L137: `safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_READY, SAFE_ERROR_CODES.PDF_FILE_OR_HASH_REQUIRED],`
- L140: `gate_id: 'expected_value_source_trace_ready',`
- L141: `gate_status: GATE_STATUSES.NOT_READY,`
- L145: `readiness_decision: READINESS_DECISIONS.NOT_READY_FOR_EXECUTION,`
- L148: `safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_READY, SAFE_ERROR_CODES.EXPECTED_VALUE_SOURCE_TRACE_REQUIRED],`
- L151: `gate_id: 'deterministic_input_source_trace_ready',`
- L152: `gate_status: GATE_STATUSES.NOT_READY,`
- L154: `source_registry_refs: ['prov_retirement_future_udi_deterministic_inputs'],`
- L155: `blocking_reason: ['UDI/current value/growth inputs require traceable repo/config source before calculator execution'],`
- L156: `readiness_decision: READINESS_DECISIONS.NOT_READY_FOR_EXECUTION,`
- L157: `required_next_action: ['bind UDI/current/growth inputs to existing repo engine/config and documented provenance'],`
- L159: `safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_READY, SAFE_ERROR_CODES.DETERMINISTIC_INPUT_SOURCE_TRACE_REQUIRED],`
- L162: `gate_id: 'parser_ownership_resolved',`
- L167: `readiness_decision: READINESS_DECISIONS.REVIEW_REQUIRED,`
- L168: `required_next_action: ['resolve parser ownership and preview/orchestrator boundary before parser execution gate'],`
- L170: `safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_READY, SAFE_ERROR_CODES.PARSER_OWNERSHIP_DECISION_REQUIRED],`
- L173: `gate_id: 'banxico_provider_runtime_gate_ready',`
- L174: `gate_status: GATE_STATUSES.NOT_READY,`
- L176: `source_registry_refs: ['prov_imagina_ser_master_rate_cache_boundary', 'prov_imagina_ser_banxico_provider_metadata'],`
- L178: `readiness_decision: READINESS_DECISIONS.NOT_READY_FOR_EXECUTION,`
- L179: `required_next_action: ['define provider/cache runtime gate separately before any Banxico/provider call'],`
- L181: `safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_READY, SAFE_ERROR_CODES.BANXICO_RUNTIME_GATE_REQUIRED],`
- L184: `gate_id: 'fixture_not_real_pdf_guard_ready',`
- L187: `source_registry_refs: ['prov_quote_pdf_preview_fixture_text'],`
- L189: `readiness_decision: READINESS_DECISIONS.READY,`
- L195: `gate_id: 'governance_not_extraction_proof_guard_ready',`
- L200: `readiness_decision: READINESS_DECISIONS.READY,`
- L206: `gate_id: 'duplicate_engine_creation_guard_ready',`
- L211: `readiness_decision: READINESS_DECISIONS.READY,`
- L217: `gate_id: 'quote_truth_boundary_ready',`
- L218: `gate_status: GATE_STATUSES.NOT_READY,`
- L220: `source_registry_refs: ['quote_preview_downstream', 'product_intelligence_upstream'],`
- L221: `blocking_reason: ['preview-vs-quote-truth boundary must be decided before any quote execution or write'],`
- L222: `readiness_decision: READINESS_DECISIONS.NOT_READY_FOR_EXECUTION,`
- L223: `required_next_action: ['define controlled preview execution vs quote truth boundary and forbid writes until separately authorized'],`
- L225: `safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_READY, SAFE_ERROR_CODES.QUOTE_TRUTH_BOUNDARY_REQUIRED],`
- L233: `function getSourceRefs() {`
- L234: `const surfaceCatalog = surfaces.getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog();`
- L235: `const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();`
- L236: `const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();`
- L257: `function getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog() {`
- L258: `const gates = clone(READINESS_MATRIX);`
- L259: `const notReady = gates.filter((gate) => gate.readiness_decision !== READINESS_DECISIONS.READY);`
- L267: `matrix_type: 'local_static_read_only_execution_readiness_review_matrix',`
- L268: `overall_readiness: notReady.length ? READINESS_DECISIONS.NOT_READY_FOR_EXECUTION : READINESS_DECISIONS.READY,`
- L270: `pdf_read_allowed_in_matrix: false,`
- L278: `quote_write_allowed_in_matrix: false,`
- L280: `quote_preview_downstream: true,`
- L284: `source_refs: getSourceRefs(),`
- L289: `function getReadinessGateById(gateId) {`
- L290: `const match = READINESS_MATRIX.find((gate) => gate.gate_id === gateId);`
- L291: `return match ? clone(match) : buildReadinessGateSafeError(gateId);`
- L294: `function getReadinessGatesByStatus(status) {`
- L296: `return clone(READINESS_MATRIX.filter((gate) => gate.gate_status.toLowerCase() === normalized));`
- L299: `function getNotReadyExecutionGates() {`
- L300: `return clone(READINESS_MATRIX.filter((gate) => gate.readiness_decision !== READINESS_DECISIONS.READY));`
- L303: `function getSatisfiedExecutionReadinessGates() {`
- L304: `return clone(READINESS_MATRIX.filter((gate) => gate.readiness_decision === READINESS_DECISIONS.READY));`
- L307: `function getBlockingExecutionReadinessGates() {`
- L309: `READINESS_MATRIX.filter((gate) =>`
- L311: `gate.readiness_decision !== READINESS_DECISIONS.READY`
- L316: `function buildReadinessGateSafeError(gateId, code = SAFE_ERROR_CODES.READINESS_GATE_NOT_MAPPED) {`
- L322: `readModelStatus: 'error',`
- L327: `blocking_reason: ['readiness gate is not mapped'],`
- L328: `readiness_decision: READINESS_DECISIONS.NOT_READY_FOR_EXECUTION,`
- L329: `required_next_action: ['map readiness gate before any execution decision'],`
- L331: `safe_errors: [code, SAFE_ERROR_CODES.EXECUTION_NOT_READY],`
- L335: `message: 'Execution readiness gate is not mapped. Execution is blocked.',`
- L340: `function validateReadinessGateShape(gate) {`
- L344: `return { ok: false, valid: false, errors: ['readiness_gate_object_required'] };`
- L359: `'"pdfRead":' + 'true',`
- L366: `'"quoteWrite":' + 'true',`
- L382: `function validateReadinessReviewMatrixCatalog(catalog) {`
- L393: `if (catalog.overall_readiness !== READINESS_DECISIONS.NOT_READY_FOR_EXECUTION) {`
- L394: `errors.push('overall_readiness_must_remain_not_ready_for_execution');`
- L399: `'pdf_read_allowed_in_matrix',`
- L407: `'quote_write_allowed_in_matrix',`
- L420: `const result = validateReadinessGateShape(gate);`
- L438: `READINESS_DECISIONS,`
- L443: `READINESS_MATRIX,`
- L444: `getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog,`
- L445: `getReadinessGateById,`
- L446: `getReadinessGatesByStatus,`
- L447: `getNotReadyExecutionGates,`
- L448: `getSatisfiedExecutionReadinessGates,`
- L449: `getBlockingExecutionReadinessGates,`
- L450: `buildReadinessGateSafeError,`
- L451: `validateReadinessGateShape,`
- L452: `validateReadinessReviewMatrixCatalog,`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js`

- Score: `-5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[{"name": "buildDeterministicInputSourceTraceSafeError", "parameters": ["inputTraceId", "code = SAFE_ERROR_CODES.INPUT_TRACE_NOT_MAPPED"], "form": "function"}, {"name": "freezeInputTrace", "parameters": ["trace"], "form": "function"}, {"name": "getDeterministicInputSourceTraceById", "parameters": ["inputTraceId"], "form": "function"}, {"name": "getDeterministicInputSourceTraceByInputKey", "parameters": ["inputKey"], "form": "function"}, {"name": "getDeterministicInputSourceTracesByProductFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getNotVerifiedDeterministicInputSourceTraces", "parameters": [], "form": "function"}, {"name": "getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getUnboundDeterministicInputSourceTraces", "parameters": [], "form": "function"}, {"name": "makeInputTrace", "parameters": ["{\n  inputTraceId", "inputKey", "inputKind", "productFamily", "sourceCandidateRefs", "requiredSourceTrace", "blockedMisuse", "safeErrors", "}"], "form": "function"}, {"name": "validateDeterministicInputSourceTraceRegistryCatalog", "parameters": ["catalog"], "form": "function"}, {"name": "validateDeterministicInputSourceTraceShape", "parameters": ["trace"], "form": "function"}]`
- Reader functions: `[{"name": "getDeterministicInputSourceTraceById", "parameters": ["inputTraceId"], "form": "function"}, {"name": "getDeterministicInputSourceTraceByInputKey", "parameters": ["inputKey"], "form": "function"}, {"name": "getDeterministicInputSourceTracesByProductFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getNotVerifiedDeterministicInputSourceTraces", "parameters": [], "form": "function"}, {"name": "getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}, {"name": "getUnboundDeterministicInputSourceTraces", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');`
- L4: `const expectedTrace = require('./quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js');`
- L5: `const parserOwnership = require('./quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js');`
- L7: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.deterministic_input_source_trace.registry.adapter.v1';`
- L8: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.deterministic_input_source_trace.registry.v1';`
- L9: `const DOMAIN_ID = 'quote_preview_pdf_engine_deterministic_input_source_trace';`
- L10: `const MODE = 'read_only';`
- L25: `const INPUT_KINDS = Object.freeze({`
- L26: `BANXICO_OR_CACHE_RATE_INPUT: 'banxico_or_cache_rate_input',`
- L27: `PROJECTION_ASSUMPTION_INPUT: 'projection_assumption_input',`
- L28: `SCENARIO_HORIZON_INPUT: 'scenario_horizon_input',`
- L33: `INPUT_TRACE_NOT_MAPPED: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_TRACE_NOT_MAPPED',`
- L34: `SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND',`
- L35: `INPUT_NOT_VERIFIED: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_NOT_VERIFIED',`
- L36: `EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_EXECUTION_NOT_AUTHORIZED',`
- L37: `INVENTED_CURRENT_UDI_BLOCKED: 'QUOTE_PREVIEW_INVENTED_CURRENT_UDI_BLOCKED',`
- L38: `INVENTED_UDI_GROWTH_BLOCKED: 'QUOTE_PREVIEW_INVENTED_UDI_GROWTH_BLOCKED',`
- L39: `INVENTED_PROJECTION_HORIZON_BLOCKED: 'QUOTE_PREVIEW_INVENTED_PROJECTION_HORIZON_BLOCKED',`
- L40: `INVENTED_PROJECTION_FORMULA_BLOCKED: 'QUOTE_PREVIEW_INVENTED_PROJECTION_FORMULA_BLOCKED',`
- L41: `CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_CALCULATOR_EXECUTION_NOT_AUTHORIZED',`
- L42: `BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_BANXICO_CALL_NOT_AUTHORIZED',`
- L43: `DUPLICATE_CALCULATOR_CREATION_BLOCKED: 'QUOTE_PREVIEW_DUPLICATE_CALCULATOR_CREATION_BLOCKED',`
- L47: `crmWrite: false,`
- L48: `pipelineWrite: false,`
- L49: `policyWrite: false,`
- L50: `quoteWrite: false,`
- L57: `browserPersistence: false,`
- L62: `pdfRead: false,`
- L70: `const REQUIRED_INPUT_TRACE_FIELDS = Object.freeze([`
- L71: `'input_trace_id',`
- L72: `'input_key',`
- L73: `'input_kind',`
- L85: `function freezeInputTrace(trace) {`
- L95: `function makeInputTrace({`
- L96: `inputTraceId,`
- L97: `inputKey,`
- L98: `inputKind,`
- L105: `return freezeInputTrace({`
- L106: `input_trace_id: inputTraceId,`
- L107: `input_key: inputKey,`
- L108: `input_kind: inputKind,`
- L118: `SAFE_ERROR_CODES.INPUT_NOT_VERIFIED,`
- L125: `const DETERMINISTIC_INPUT_SOURCE_TRACES = Object.freeze([`
- L126: `makeInputTrace({`
- L127: `inputTraceId: 'input_current_udi_value_source_trace',`
- L128: `inputKey: 'current_udi_value',`
- L129: `inputKind: INPUT_KINDS.BANXICO_OR_CACHE_RATE_INPUT,`
- L131: `sourceCandidateRefs: ['shared-banxico-rate-engine.js', 'shared-banxico-edge-provider.js', 'exchange-rate-cache-engine.js'],`
- L132: `requiredSourceTrace: 'existing_rate_cache_or_provider_metadata_gate_before_runtime',`
- L136: `makeInputTrace({`
- L137: `inputTraceId: 'input_udi_growth_assumption_source_trace',`
- L138: `inputKey: 'udi_growth_assumption',`
- L139: `inputKind: INPUT_KINDS.PROJECTION_ASSUMPTION_INPUT,`
- L146: `makeInputTrace({`
- L147: `inputTraceId: 'input_projection_horizon_source_trace',`
- L148: `inputKey: 'projection_horizon',`
- L149: `inputKind: INPUT_KINDS.SCENARIO_HORIZON_INPUT,`
- L156: `makeInputTrace({`
- L157: `inputTraceId: 'input_projection_formula_source_trace',`
- L158: `inputKey: 'projection_formula',`
- L159: `inputKind: INPUT_KINDS.EXISTING_CALCULATOR_FORMULA_REFERENCE,`
- L161: `sourceCandidateRefs: ['retirement-future-udi-projection-engine.js', 'imagina-ser-future-mxn-bridge.js'],`
- L176: `function getSourceRefs() {`
- L177: `const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();`
- L178: `const expectedTraceCatalog = expectedTrace.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();`
- L179: `const parserOwnershipCatalog = parserOwnership.getQuotePreviewPdfEngineParserOwnershipRegistryCatalog();`
- L182: `readiness: {`
- L183: `adapter_id: readinessCatalog.adapter_id,`
- L184: `schemaVersion: readinessCatalog.schemaVersion,`
- L185: `overall_readiness: readinessCatalog.overall_readiness,`
- L200: `function getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog() {`
- L207: `registry_type: 'local_static_read_only_deterministic_input_source_trace_registry',`
- L208: `overall_input_trace_status: 'not_bound_not_verified_not_ready',`
- L211: `pdf_read_allowed_in_registry: false,`
- L219: `quote_write_allowed_in_registry: false,`
- L221: `quote_preview_downstream: true,`
- L222: `required_input_trace_fields: [...REQUIRED_INPUT_TRACE_FIELDS],`
- L225: `source_refs: getSourceRefs(),`
- L226: `input_traces: clone(DETERMINISTIC_INPUT_SOURCE_TRACES),`
- L230: `function buildDeterministicInputSourceTraceSafeError(inputTraceId, code = SAFE_ERROR_CODES.INPUT_TRACE_NOT_MAPPED) {`
- L236: `readModelStatus: 'error',`
- L237: `input_trace_id: inputTraceId || null,`
- L238: `input_key: null,`
- L239: `input_kind: null,`
- L246: `blocked_misuse: ['unmapped_deterministic_input_execution', 'invented_input_value', 'calculation_before_source_trace'],`
- L247: `safe_errors: [code, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.INPUT_NOT_VERIFIED],`
- L251: `message: 'Deterministic input source trace is not mapped. Verification and calculation are blocked.',`
- L256: `function getDeterministicInputSourceTraceById(inputTraceId) {`
- L257: `const match = DETERMINISTIC_INPUT_SOURCE_TRACES.find((trace) => trace.input_trace_id === inputTraceId);`
- L258: `return match ? clone(match) : buildDeterministicInputSourceTraceSafeError(inputTraceId);`
- L261: `function getDeterministicInputSourceTraceByInputKey(inputKey) {`
- L262: `const match = DETERMINISTIC_INPUT_SOURCE_TRACES.find((trace) => trace.input_key === inputKey);`
- L263: `return match ? clone(match) : buildDeterministicInputSourceTraceSafeError(inputKey);`
- L266: `function getDeterministicInputSourceTracesByProductFamily(productFamily) {`
- L267: `return clone(DETERMINISTIC_INPUT_SOURCE_TRACES.filter((trace) => trace.product_family === productFamily));`
- L270: `function getUnboundDeterministicInputSourceTraces() {`
- L271: `return clone(DETERMINISTIC_INPUT_SOURCE_TRACES.filter((trace) => trace.source_trace_status === SOURCE_TRACE_STATUSES.NOT_BOUND));`
- L274: `function getNotVerifiedDeterministicInputSourceTraces() {`
- L275: `return clone(DETERMINISTIC_INPUT_SOURCE_TRACES.filter((trace) => trace.verification_status === VERIFICATION_STATUSES.NOT_VERIFIED));`
- L278: `function validateDeterministicInputSourceTraceShape(trace) {`
- L282: `return { ok: false, valid: false, errors: ['deterministic_input_trace_object_required'] };`
- L285: `for (const field of REQUIRED_INPUT_TRACE_FIELDS) {`
- L304: `function validateDeterministicInputSourceTraceRegistryCatalog(catalog) {`
- L315: `if (catalog.overall_input_trace_status !== 'not_bound_not_verified_not_ready') errors.push('overall_input_trace_status_must_remain_not_ready');`
- L320: `'pdf_read_allowed_in_registry',`
- L328: `'quote_write_allowed_in_registry',`
- L337: `const traces = Array.isArray(catalog.input_traces) ? catalog.input_traces : [];`
- L338: `if (traces.length !== 4) errors.push('four_deterministic_input_traces_required');`
- L341: `const result = validateDeterministicInputSourceTraceShape(trace);`
- L342: `if (!result.ok) errors.push(...result.errors.map((error) => '${trace.input_trace_id || 'unknown'}:${error}'));`
- L360: `INPUT_KINDS,`
- L363: `REQUIRED_INPUT_TRACE_FIELDS,`
- L364: `DETERMINISTIC_INPUT_SOURCE_TRACES,`
- L365: `getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog,`
- L366: `getDeterministicInputSourceTraceById,`
- L367: `getDeterministicInputSourceTraceByInputKey,`
- L368: `getDeterministicInputSourceTracesByProductFamily,`
- L369: `getUnboundDeterministicInputSourceTraces,`
- L370: `getNotVerifiedDeterministicInputSourceTraces,`
- L371: `buildDeterministicInputSourceTraceSafeError,`
- L372: `validateDeterministicInputSourceTraceShape,`
- L373: `validateDeterministicInputSourceTraceRegistryCatalog,`

### `platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js`

- Score: `-5`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[{"name": "buildBindingFromRecord", "parameters": ["request", "record", "resolution", "errorCode = null"], "form": "function"}, {"name": "findRecordByCarrierRef", "parameters": ["carrierRefHint"], "form": "function"}, {"name": "findRecordByEvidenceRefs", "parameters": ["sourceEvidenceRefs = []"], "form": "function"}, {"name": "findRecordByProductRef", "parameters": ["productRefHint"], "form": "function"}, {"name": "getCatalogRecords", "parameters": [], "form": "function"}, {"name": "resolveProductIntelligenceRecord", "parameters": ["request = {}"], "form": "function"}]`
- Reader functions: `[{"name": "findRecordByCarrierRef", "parameters": ["carrierRefHint"], "form": "function"}, {"name": "findRecordByEvidenceRefs", "parameters": ["sourceEvidenceRefs = []"], "form": "function"}, {"name": "findRecordByProductRef", "parameters": ["productRefHint"], "form": "function"}, {"name": "getCatalogRecords", "parameters": [], "form": "function"}, {"name": "getHintText", "parameters": ["value"], "form": "function"}, {"name": "resolveProductIntelligenceRecord", "parameters": ["request = {}"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L2: `getProductIntelligenceReadModelByFamily,`
- L3: `getProductIntelligenceReadModelCatalog`
- L4: `} from '../product-intelligence/product-intelligence-read-model-adapter-073d.js';`
- L6: `export const ADAPTER_ID = 'forge.quote_preview.product_intelligence.binding.adapter.v1';`
- L7: `export const SCHEMA_VERSION = 'forge.quote_preview.product_intelligence.binding.v1';`
- L10: `notBound: 'QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND',`
- L11: `productFamilyNotMapped: 'QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED',`
- L12: `parserNotMapped: 'QUOTE_PREVIEW_PARSER_NOT_MAPPED',`
- L13: `calculatorNotMapped: 'QUOTE_PREVIEW_CALCULATOR_NOT_MAPPED',`
- L14: `sourceEvidenceRequired: 'QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED',`
- L15: `freshnessRequired: 'QUOTE_PREVIEW_FRESHNESS_REQUIRED'`
- L19: `crmWrite: false,`
- L20: `pipelineWrite: false,`
- L21: `policyWrite: false,`
- L22: `quoteWrite: false,`
- L29: `browserPersistence: false,`
- L37: `pdfRead: false,`
- L44: `'quote_preview_binding_id',`
- L45: `'quote_preview_request_id',`
- L62: `'pdf_read',`
- L68: `'quote_write',`
- L70: `'crm_write',`
- L71: `'policy_write',`
- L72: `'pipeline_write',`
- L77: `'browser_persistence',`
- L90: `function getHintText(value) {`
- L109: `function getCatalogRecords() {`
- L110: `return getProductIntelligenceReadModelCatalog().readModel.records;`
- L113: `function findRecordByProductRef(productRefHint) {`
- L114: `const hint = normalizeText(getHintText(productRefHint));`
- L116: `return getCatalogRecords().find((record) => {`
- L117: `const productNames = record.product_ref?.product_names || [];`
- L118: `return normalizeText(record.product_family).includes(hint)`
- L123: `function findRecordByCarrierRef(carrierRefHint) {`
- L124: `const hint = normalizeText(getHintText(carrierRefHint));`
- L126: `return getCatalogRecords().find((record) => normalizeText(record.carrier_ref?.display_name).includes(hint)) || null;`
- L129: `function findRecordByEvidenceRefs(sourceEvidenceRefs = []) {`
- L131: `return getCatalogRecords().find((record) => hints.some((hint) => refsContain(record.evidence_refs, hint))) || null;`
- L134: `function resolveProductIntelligenceRecord(request = {}) {`
- L136: `const envelope = getProductIntelligenceReadModelByFamily(request.product_family_hint);`
- L137: `const record = envelope.readModel.records[0] || null;`
- L139: `record,`
- L141: `errorCode: record ? null : SAFE_ERROR_CODES.productFamilyNotMapped`
- L145: `const byProduct = findRecordByProductRef(request.product_ref_hint);`
- L147: `return { record: byProduct, resolution: 'product_ref_hint', errorCode: null };`
- L150: `const byCarrier = findRecordByCarrierRef(request.carrier_ref_hint);`
- L152: `return { record: byCarrier, resolution: 'carrier_ref_hint', errorCode: null };`
- L155: `const byEvidence = findRecordByEvidenceRefs(request.source_evidence_refs);`
- L157: `return { record: byEvidence, resolution: 'source_evidence_refs', errorCode: null };`
- L161: `record: null,`
- L171: `function buildSafeError(record, errorCode) {`
- L173: `if (!record) return SAFE_ERROR_CODES.notBound;`
- L174: `if (!record.parser_refs?.length) return SAFE_ERROR_CODES.parserNotMapped;`
- L175: `if (!record.calculator_refs?.length) return SAFE_ERROR_CODES.calculatorNotMapped;`
- L176: `if (!record.evidence_refs?.length) return SAFE_ERROR_CODES.sourceEvidenceRequired;`
- L177: `if (!record.freshness_metadata?.status) return SAFE_ERROR_CODES.freshnessRequired;`
- L181: `function buildBindingFromRecord(request, record, resolution, errorCode = null) {`
- L182: `const requestId = request.quote_preview_request_id || 'quote_preview_request_static_074b';`
- L183: `const safeError = buildSafeError(record, errorCode);`
- L184: `const productFamily = record?.product_family || getHintText(request.product_family_hint) || null;`
- L190: `domainId: 'quote_preview',`
- L191: `mode: 'read_only',`
- L193: `readModel: {`
- L194: `status: record && !safeError ? 'ok' : record ? 'bound_with_gaps' : 'error'`
- L196: `quote_preview_binding_id: 'quote_preview_product_intelligence_binding_${makeStableId(bindingKey)}_074b',`
- L197: `quote_preview_request_id: requestId,`
- L198: `product_intelligence_ref: record ? {`
- L199: `product_intelligence_id: record.product_intelligence_id,`
- L200: `schemaVersion: record.schemaVersion,`
- L201: `mode: record.mode,`
- L202: `routeClass: record.routeClass,`
- L207: `parser_ref: record ? firstRef(record.parser_refs) : null,`
- L208: `calculator_refs: record ? clone(record.calculator_refs) : [],`
- L209: `coverage_semantics_ref: record ? {`
- L210: `status: record.coverage_semantics.status,`
- L211: `mapped_refs: clone(record.coverage_semantics.mapped_refs || []),`
- L214: `premium_semantics_ref: record ? {`
- L215: `status: record.premium_semantics.status,`
- L216: `mapped_refs: clone(record.premium_semantics.mapped_refs || []),`
- L219: `currency_semantics_ref: record ? {`
- L220: `status: record.currency_semantics.status,`
- L221: `mapped_refs: clone(record.currency_semantics.mapped_refs || []),`
- L224: `projection_semantics_ref: record ? {`
- L225: `status: record.projection_semantics.status,`
- L226: `mapped_refs: clone(record.projection_semantics.mapped_refs || []),`
- L232: `product_intelligence_evidence_refs: record ? clone(record.evidence_refs) : []`
- L236: `product_intelligence_freshness: record ? clone(record.freshness_metadata) : null`
- L239: `blocked_effects: record`
- L240: `? Array.from(new Set([...DEFAULT_BLOCKED_EFFECTS, ...(record.blocked_effects || [])]))`
- L247: `pdfRead: false,`
- L250: `quote_pdf_preview_role: record?.quote_semantics?.quote_pdf_preview_role || 'consumer_reference_only',`
- L252: `? record?.product_identity?.universal_architecture === true`
- L258: `export function bindQuotePreviewToProductIntelligence(request = {}) {`
- L259: `const { record, resolution, errorCode } = resolveProductIntelligenceRecord(request);`
- L260: `return buildBindingFromRecord(request, record, resolution, errorCode);`
- L263: `export function buildQuotePreviewBindingNotBoundError(request = {}) {`
- L264: `return buildBindingFromRecord(request, null, 'not_bound', SAFE_ERROR_CODES.notBound);`
- L267: `export function validateQuotePreviewBindingShape(binding) {`
- L275: `if (binding.domainId !== 'quote_preview') errors.push('domainId');`
- L276: `if (binding.mode !== 'read_only') errors.push('mode');`

### `orvi-mxn-master-test.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L2: `const { buildGuaranteedValueTimeline, getMilestone } = require("./orvi-guaranteed-value-timeline-engine");`
- L4: `const { getCachedRates } = require("./exchange-rate-cache-engine");`
- L8: `process.argv[2] || "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF";`
- L33: `const cache = await getCachedRates();`
- L34: `const currentUdi = cache.rates.UDI_MXN.value;`
- L42: `const year20UDI = getMilestone(timelineUDI, 20);`
- L43: `const year25UDI = getMilestone(timelineUDI, 25);`
- L44: `const year30UDI = getMilestone(timelineUDI, 30);`
- L45: `const year50UDI = getMilestone(timelineUDI, 50);`
- L46: `const year71UDI = getMilestone(timelineUDI, 71);`
- L48: `const year20MXN = getMilestone(timelineMXN, 20);`
- L49: `const year25MXN = getMilestone(timelineMXN, 25);`
- L50: `const year30MXN = getMilestone(timelineMXN, 30);`
- L51: `const year50MXN = getMilestone(timelineMXN, 50);`
- L52: `const year71MXN = getMilestone(timelineMXN, 71);`
- L63: `const currentMXN = timelineMXN.find(row => row.year === s.currentYear);`
- L64: `const futureMXN = timelineMXN.find(row => row.year === s.futureYear);`
- L109: `console.log("Estos valores en pesos son estimados. La cotización está en UDI y el valor real dependerá de la UDI vigente.");`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getEvidenceCatalog", "parameters": [], "form": "function"}, {"name": "getExpectedValueProvenanceEntries", "parameters": [], "form": "function"}, {"name": "getFixtureOnlyProvenanceEntries", "parameters": [], "form": "function"}, {"name": "getGovernanceOnlyProvenanceEntries", "parameters": [], "form": "function"}, {"name": "getProvenanceById", "parameters": ["provenanceId"], "form": "function"}, {"name": "getProvenanceByTestId", "parameters": ["testId"], "form": "function"}, {"name": "getProvenanceByType", "parameters": ["provenanceType"], "form": "function"}, {"name": "getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getRuntimeGateProvenanceEntries", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const evidenceRegistry = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');`
- L5: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1';`
- L6: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1';`
- L7: `const DOMAIN_ID = 'quote_preview_pdf_engine_canonical_test_evidence_provenance';`
- L8: `const MODE = 'read_only';`
- L13: `OCR_TEXT_OUTPUT: 'ocr_text_output_provenance',`
- L16: `DETERMINISTIC_INPUT: 'deterministic_input_provenance',`
- L17: `RATE_CACHE: 'rate_cache_provenance',`
- L39: `RATE_CACHE_METADATA: 'rate_cache_metadata',`
- L52: `PROVENANCE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_NOT_MAPPED',`
- L53: `PROVENANCE_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_EXECUTION_NOT_AUTHORIZED',`
- L54: `PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_PDF_READ_NOT_AUTHORIZED',`
- L55: `OCR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_OCR_EXECUTION_NOT_AUTHORIZED',`
- L56: `PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_PARSER_EXECUTION_NOT_AUTHORIZED',`
- L57: `CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_CALCULATOR_EXECUTION_NOT_AUTHORIZED',`
- L58: `BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_BANXICO_CALL_NOT_AUTHORIZED',`
- L59: `FIXTURE_AS_REAL_PDF_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_FIXTURE_AS_REAL_PDF_BLOCKED',`
- L60: `GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED',`
- L61: `INVENTED_EXPECTED_VALUE_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_INVENTED_EXPECTED_VALUE_BLOCKED',`
- L62: `UNTRACEABLE_PROJECTION_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_UNTRACEABLE_PROJECTION_BLOCKED',`
- L63: `PROVIDER_RUNTIME_GATE_REQUIRED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVIDER_RUNTIME_GATE_REQUIRED',`
- L64: `DUPLICATE_ENGINE_CREATION_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_DUPLICATE_ENGINE_CREATION_BLOCKED',`
- L68: `crmWrite: false,`
- L69: `pipelineWrite: false,`
- L70: `policyWrite: false,`
- L71: `quoteWrite: false,`
- L78: `browserPersistence: false,`
- L83: `pdfRead: false,`
- L134: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L156: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L194: `'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',`
- L200: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L217: `'imagina-ser-future-mxn-bridge.js',`
- L228: `provenance_id: 'prov_imagina_ser_master_rate_cache_boundary',`
- L231: `provenance_type: PROVENANCE_TYPES.RATE_CACHE,`
- L233: `source_kind: SOURCE_KINDS.RATE_CACHE_METADATA,`
- L238: `'imagina-ser-future-mxn-bridge.js',`
- L240: `'exchange-rate-cache-engine.js',`
- L256: `source_kind: SOURCE_KINDS.RATE_CACHE_METADATA,`
- L261: `'exchange-rate-cache-engine.js',`
- L273: `provenance_id: 'prov_retirement_future_udi_deterministic_inputs',`
- L276: `provenance_type: PROVENANCE_TYPES.DETERMINISTIC_INPUT,`
- L292: `provenance_id: 'prov_quote_pdf_preview_fixture_text',`
- L293: `test_id: 'quote_pdf_preview_fixture_candidate',`
- L294: `file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',`
- L301: `engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L312: `file_path: 'tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js',`
- L316: `source_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js',`
- L319: `engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js'],`
- L330: `file_path: 'tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js',`
- L334: `source_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js',`
- L337: `engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js'],`
- L361: `'imagina-ser-future-mxn-bridge.js',`
- L362: `'exchange-rate-cache-engine.js',`
- L379: `function getEvidenceCatalog() {`
- L380: `return evidenceRegistry.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();`
- L383: `function getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog() {`
- L384: `const evidenceCatalog = getEvidenceCatalog();`
- L392: `registry_type: 'local_static_read_only_test_evidence_provenance_registry',`
- L394: `pdf_read_allowed_in_registry: false,`
- L402: `quote_preview_downstream: true,`
- L415: `function getProvenanceById(provenanceId) {`
- L416: `const match = PROVENANCE_REGISTRY.find((entry) => entry.provenance_id === provenanceId);`
- L420: `function getProvenanceByTestId(testId) {`
- L424: `function getProvenanceByType(provenanceType) {`
- L429: `function getExpectedValueProvenanceEntries() {`
- L430: `return getProvenanceByType(PROVENANCE_TYPES.EXPECTED_VALUE);`
- L433: `function getFixtureOnlyProvenanceEntries() {`
- L434: `return getProvenanceByType(PROVENANCE_TYPES.FIXTURE_TEXT);`
- L437: `function getGovernanceOnlyProvenanceEntries() {`
- L438: `return getProvenanceByType(PROVENANCE_TYPES.GOVERNANCE_ASSERTION);`
- L441: `function getRuntimeGateProvenanceEntries() {`
- L451: `readModelStatus: 'error',`
- L492: `'"pdfRead":' + 'true',`
- L499: `'"quoteWrite":' + 'true',`
- L529: `'pdf_read_allowed_in_registry',`
- L573: `getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog,`
- L574: `getProvenanceById,`
- L575: `getProvenanceByTestId,`
- L576: `getProvenanceByType,`
- L577: `getExpectedValueProvenanceEntries,`
- L578: `getFixtureOnlyProvenanceEntries,`
- L579: `getGovernanceOnlyProvenanceEntries,`
- L580: `getRuntimeGateProvenanceEntries,`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getCanonicalDecisionRequiredTestEvidence", "parameters": [], "form": "function"}, {"name": "getCanonicalTestEvidenceByEvidenceType", "parameters": ["evidenceType"], "form": "function"}, {"name": "getCanonicalTestEvidenceById", "parameters": ["testId"], "form": "function"}, {"name": "getCanonicalTestEvidenceByPath", "parameters": ["filePath"], "form": "function"}, {"name": "getCanonicalTestEvidenceByProductFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getFixtureOnlyTestEvidence", "parameters": [], "form": "function"}, {"name": "getGovernanceOnlyTestEvidence", "parameters": [], "form": "function"}, {"name": "getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getSurfaceCatalog", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const surfaceMapping = require('./quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js');`
- L5: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.canonical_test_evidence.registry.adapter.v1';`
- L6: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.canonical_test_evidence.registry.v1';`
- L7: `const DOMAIN_ID = 'quote_preview_pdf_engine_canonical_test_evidence';`
- L8: `const MODE = 'read_only';`
- L18: `RATE_CACHE_METADATA: 'rate_cache_metadata',`
- L43: `TEST_EVIDENCE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_CANONICAL_TEST_EVIDENCE_NOT_MAPPED',`
- L44: `TEST_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_CANONICAL_TEST_EVIDENCE_EXECUTION_NOT_AUTHORIZED',`
- L45: `PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_CANONICAL_TEST_EVIDENCE_PDF_READ_NOT_AUTHORIZED',`
- L46: `PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_CANONICAL_TEST_EVIDENCE_PARSER_EXECUTION_NOT_AUTHORIZED',`
- L47: `CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_CANONICAL_TEST_EVIDENCE_CALCULATOR_EXECUTION_NOT_AUTHORIZED',`
- L48: `BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_CANONICAL_TEST_EVIDENCE_BANXICO_CALL_NOT_AUTHORIZED',`
- L49: `FIXTURE_NOT_REAL_PDF_EVIDENCE: 'QUOTE_PREVIEW_PDF_FIXTURE_NOT_REAL_PDF_EVIDENCE',`
- L50: `GOVERNANCE_NOT_EXTRACTION_PROOF: 'QUOTE_PREVIEW_PDF_GOVERNANCE_NOT_EXTRACTION_PROOF',`
- L51: `INVENTED_EXPECTED_VALUES_BLOCKED: 'QUOTE_PREVIEW_PDF_INVENTED_EXPECTED_VALUES_BLOCKED',`
- L55: `crmWrite: false,`
- L56: `pipelineWrite: false,`
- L57: `policyWrite: false,`
- L58: `quoteWrite: false,`
- L65: `browserPersistence: false,`
- L70: `pdfRead: false,`
- L114: `source_surface_refs: ['pdf_extraction_policy_ocr_engine'],`
- L124: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L134: `source_surface_refs: ['pdf_extraction_policy_ocr_engine', 'parser_gmm_quote'],`
- L147: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L180: `source_surface_refs: ['parser_solucionline_retirement', 'pdf_preview_forge_quote_pdf_preview_engine'],`
- L183: `'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',`
- L193: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L203: `source_surface_refs: ['parser_solucionline_retirement', 'calculator_retirement_future_udi_projection', 'bridge_imagina_ser_future_mxn'],`
- L207: `'imagina-ser-future-mxn-bridge.js',`
- L227: `source_surface_refs: ['bridge_imagina_ser_future_mxn', 'rates_exchange_rate_cache'],`
- L229: `'imagina-ser-future-mxn-bridge.js',`
- L231: `'exchange-rate-cache-engine.js',`
- L236: `evidence_role: 'candidate Imagina Ser flow evidence after provider/cache boundary review',`
- L248: `evidence_type: EVIDENCE_TYPES.RATE_CACHE_METADATA,`
- L250: `source_surface_refs: ['rates_exchange_rate_cache', 'rates_shared_banxico_direct', 'rates_shared_banxico_edge_provider'],`
- L252: `'exchange-rate-cache-engine.js',`
- L259: `evidence_role: 'rate/cache evidence candidate; runtime/provider execution requires later gate',`
- L277: `evidence_role: 'supporting deterministic UDI projection evidence after input provenance review',`
- L287: `test_id: 'quote_pdf_preview_fixture_candidate',`
- L288: `file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',`
- L291: `source_surface_refs: ['pdf_preview_forge_quote_pdf_preview_engine'],`
- L292: `engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L306: `file_path: 'tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js',`
- L309: `source_surface_refs: ['quote_preview_pdf_engine_repo_promotion_adapter_076b'],`
- L310: `engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js'],`
- L323: `file_path: 'tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js',`
- L326: `source_surface_refs: ['quote_preview_pdf_engine_existing_surfaces_canonical_mapping'],`
- L327: `engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js'],`
- L344: `function getSurfaceCatalog() {`
- L345: `return surfaceMapping.getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog();`
- L348: `function getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog() {`
- L349: `const surfacesCatalog = getSurfaceCatalog();`
- L357: `registry_type: 'local_static_read_only_canonical_test_evidence_registry',`
- L365: `quote_preview_downstream: true,`
- L378: `function getCanonicalTestEvidenceById(testId) {`
- L379: `const match = CANONICAL_TEST_EVIDENCE_REGISTRY.find((entry) => entry.test_id === testId);`
- L383: `function getCanonicalTestEvidenceByPath(filePath) {`
- L384: `const match = CANONICAL_TEST_EVIDENCE_REGISTRY.find((entry) => entry.file_path === filePath);`
- L388: `function getCanonicalTestEvidenceByProductFamily(productFamily) {`
- L397: `function getCanonicalTestEvidenceByEvidenceType(evidenceType) {`
- L402: `function getCanonicalDecisionRequiredTestEvidence() {`
- L413: `function getFixtureOnlyTestEvidence() {`
- L417: `function getGovernanceOnlyTestEvidence() {`
- L427: `readModelStatus: 'error',`
- L468: `'"pdfRead":' + 'true',`
- L475: `'"quoteWrite":' + 'true',`
- L546: `getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog,`
- L547: `getCanonicalTestEvidenceById,`
- L548: `getCanonicalTestEvidenceByPath,`
- L549: `getCanonicalTestEvidenceByProductFamily,`
- L550: `getCanonicalTestEvidenceByEvidenceType,`
- L551: `getCanonicalDecisionRequiredTestEvidence,`
- L552: `getFixtureOnlyTestEvidence,`
- L553: `getGovernanceOnlyTestEvidence,`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getBlockedGrowthSurfaces", "parameters": [], "form": "function"}, {"name": "getCanonicalDecisionRequiredSurfaces", "parameters": [], "form": "function"}, {"name": "getExistingSurfaceCanonicalMappingById", "parameters": ["surfaceId"], "form": "function"}, {"name": "getExistingSurfaceCanonicalMappingsByProductFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L3: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1';`
- L4: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1';`
- L5: `const DOMAIN_ID = 'quote_preview_pdf_engine_existing_surfaces_canonical_mapping';`
- L6: `const MODE = 'read_only';`
- L18: `PDF_EXTRACTION: 'pdf_extraction',`
- L19: `PDF_PREVIEW_ORCHESTRATION: 'pdf_preview_orchestration',`
- L24: `RATE_CACHE: 'rate_cache',`
- L26: `QUOTE_PREVIEW_BINDING_ADAPTER: 'quote_preview_binding_adapter',`
- L34: `SURFACE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_NOT_MAPPED',`
- L35: `CANONICAL_DECISION_REQUIRED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_CANONICAL_DECISION_REQUIRED',`
- L36: `NEW_EXTRACTOR_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_EXTRACTOR_BLOCKED_BEFORE_RECONCILIATION',`
- L37: `NEW_PARSER_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_PARSER_BLOCKED_BEFORE_RECONCILIATION',`
- L38: `NEW_CALCULATOR_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_CALCULATOR_BLOCKED_BEFORE_RECONCILIATION',`
- L39: `EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_EXECUTION_NOT_AUTHORIZED',`
- L43: `crmWrite: false, pipelineWrite: false, policyWrite: false, quoteWrite: false,`
- L45: `providerRuntime: false, secretAccess: false, browserPersistence: false,`
- L47: `backendConnection: false, pdfRead: false, ocrExecution: false,`
- L55: `'quote_preview_downstream_only', 'safe_errors', 'safety_flags',`
- L59: `'pdf_read', 'ocr_execution', 'parser_execution', 'calculator_execution',`
- L60: `'banxico_call', 'provider_call', 'quote_generation', 'quote_write',`
- L66: `function surface(input) {`
- L68: `...input,`
- L69: `product_family: Object.freeze([...(input.product_family || [])]),`
- L70: `blocked_growth: Object.freeze([...(input.blocked_growth || [])]),`
- L71: `test_refs: Object.freeze([...(input.test_refs || [])]),`
- L72: `engine_refs: Object.freeze([...(input.engine_refs || [])]),`
- L73: `safe_errors: Object.freeze([...(input.safe_errors || [])]),`
- L74: `safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(input.safety_flags || {}) }),`
- L80: `surface_id: 'pdf_extraction_policy_ocr_engine',`
- L82: `surface_type: SURFACE_TYPES.PDF_EXTRACTION,`
- L92: `quote_preview_downstream_only: true,`
- L96: `surface_id: 'pdf_preview_forge_quote_pdf_preview_engine',`
- L97: `file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',`
- L98: `surface_type: SURFACE_TYPES.PDF_PREVIEW_ORCHESTRATION,`
- L99: `domain: 'quote_pdf_preview',`
- L105: `test_refs: ['tests/product-intelligence/forge-quote-pdf-preview-engine-test.js'],`
- L106: `engine_refs: ['product-intelligence/evidence/solucionline-retirement-parser.js', 'retirement-future-udi-projection-engine.js', 'imagina-ser-future-mxn-bridge.js'],`
- L108: `quote_preview_downstream_only: true,`
- L122: `engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L124: `quote_preview_downstream_only: true,`
- L140: `quote_preview_downstream_only: true,`
- L151: `allowed_role: 'candidate GMM summary/read-model source; should consume parser outputs, not own parsing',`
- L152: `blocked_growth: ['parser_ownership', 'pdf_extraction_ownership', 'quote_truth_creation'],`
- L156: `quote_preview_downstream_only: true,`
- L168: `blocked_growth: ['pdf_extraction_ownership', 'parser_ownership', 'banxico_current_rate_ownership', 'quote_truth_creation'],`
- L172: `quote_preview_downstream_only: true,`
- L176: `surface_id: 'bridge_imagina_ser_future_mxn',`
- L177: `file_path: 'imagina-ser-future-mxn-bridge.js',`
- L179: `domain: 'imagina_ser_future_mxn_bridge',`
- L183: `allowed_role: 'candidate Imagina Ser future MXN bridge; must delegate UDI projection',`
- L184: `blocked_growth: ['pdf_extraction_ownership', 'parser_ownership', 'quote_truth_creation'],`
- L188: `quote_preview_downstream_only: true,`
- L192: `surface_id: 'rates_exchange_rate_cache',`
- L193: `file_path: 'exchange-rate-cache-engine.js',`
- L194: `surface_type: SURFACE_TYPES.RATE_CACHE,`
- L195: `domain: 'exchange_rate_cache',`
- L199: `allowed_role: 'candidate current-rate cache over Banxico providers',`
- L204: `quote_preview_downstream_only: true,`
- L218: `engine_refs: ['exchange-rate-cache-engine.js'],`
- L220: `quote_preview_downstream_only: true,`
- L234: `engine_refs: ['exchange-rate-cache-engine.js'],`
- L236: `quote_preview_downstream_only: true,`
- L240: `surface_id: 'pi_read_model_adapter_073d',`
- L241: `file_path: 'platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js',`
- L249: `test_refs: ['tests/product-intelligence/product-intelligence-read-model-adapter-073d-test.js'],`
- L252: `quote_preview_downstream_only: false,`
- L256: `surface_id: 'quote_preview_pi_binding_adapter_074b',`
- L257: `file_path: 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js',`
- L258: `surface_type: SURFACE_TYPES.QUOTE_PREVIEW_BINDING_ADAPTER,`
- L259: `domain: 'quote_preview_product_intelligence_binding',`
- L263: `allowed_role: 'current Quote Preview to Product Intelligence binding',`
- L264: `blocked_growth: ['parser_execution', 'calculator_execution', 'pdf_extraction_ownership', 'quote_truth_creation'],`
- L265: `test_refs: ['tests/quote-preview-product-intelligence-binding-adapter-074b-test.js'],`
- L266: `engine_refs: ['platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js'],`
- L268: `quote_preview_downstream_only: true,`
- L272: `surface_id: 'quote_preview_pdf_pi_integration_adapter_075b',`
- L273: `file_path: 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js',`
- L275: `domain: 'quote_preview_pdf_to_product_intelligence_integration',`
- L279: `allowed_role: 'current reference integration between PDF preview and Product Intelligence',`
- L280: `blocked_growth: ['pdf_read', 'parser_execution', 'calculator_execution', 'quote_truth_creation'],`
- L281: `test_refs: ['tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js'],`
- L282: `engine_refs: ['platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js'],`
- L284: `quote_preview_downstream_only: true,`
- L288: `surface_id: 'quote_preview_pdf_engine_repo_promotion_adapter_076b',`
- L289: `file_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js',`
- L291: `domain: 'quote_preview_pdf_engine_repo_promotion',`
- L296: `blocked_growth: ['pdf_read', 'ocr_execution', 'parser_execution', 'calculator_execution', 'banxico_call', 'provider_runtime', 'quote_truth_creation'],`
- L297: `test_refs: ['tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js'],`
- L298: `engine_refs: ['platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js', 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js', 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js', 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L300: `quote_preview_downstream_only: true,`
- L316: `quote_preview_downstream_only: true,`
- L332: `quote_preview_downstream_only: true,`
- L336: `surface_id: 'test_quote_pdf_preview_fixture',`
- L337: `file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',`
- L339: `domain: 'quote_pdf_preview_fixture_test',`
- L346: `engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L348: `quote_preview_downstream_only: true,`
- L353: `function getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog() {`
- L360: `mapping_type: 'local_static_read_only_existing_surfaces_canonical_mapping',`
- L365: `quote_preview_downstream: true,`
- L374: `function getExistingSurfaceCanonicalMappingById(surfaceId) {`
- L375: `const match = ALL_SURFACES.find((surface) => surface.surface_id === surfaceId);`
- L379: `function getExistingSurfaceCanonicalMappingsByProductFamily(productFamily) {`
- L386: `function getCanonicalDecisionRequiredSurfaces() {`
- L390: `function getBlockedGrowthSurfaces() {`
- L400: `readModelStatus: 'error',`
- L413: `quote_preview_downstream_only: true,`
- L431: `for (const fragment of ['"pdfRead":'+'true','"ocrExecution":'+'true','"parserExecution":'+'true','"calculatorExecution":'+'true','"banxicoCall":'+'true','"realEngineExecution":'+'true','"providerRuntime":'+'true','"quoteWrite":'+'true','"backendConnection":'+'true']) {`
- L458: `getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog,`
- L459: `getExistingSurfaceCanonicalMappingById,`
- L460: `getExistingSurfaceCanonicalMappingsByProductFamily,`
- L461: `getCanonicalDecisionRequiredSurfaces,`
- L462: `getBlockedGrowthSurfaces,`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getExpectedValueSourceTraceById", "parameters": ["traceId"], "form": "function"}, {"name": "getExpectedValueSourceTracesByProductFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getExpectedValueSourceTracesByTestId", "parameters": ["testId"], "form": "function"}, {"name": "getNotVerifiedExpectedValueSourceTraces", "parameters": [], "form": "function"}, {"name": "getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}, {"name": "getUnboundExpectedValueSourceTraces", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const evidence = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');`
- L4: `const provenance = require('./quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');`
- L5: `const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');`
- L6: `const fileHash = require('./quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js');`
- L8: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.adapter.v1';`
- L9: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.v1';`
- L10: `const DOMAIN_ID = 'quote_preview_pdf_engine_expected_value_source_trace';`
- L11: `const MODE = 'read_only';`
- L19: `DETERMINISTIC_PROJECTION_INPUT_TRACE: 'deterministic_projection_input_trace',`
- L23: `TRACE_NOT_MAPPED: 'QUOTE_PREVIEW_EXPECTED_VALUE_SOURCE_TRACE_NOT_MAPPED',`
- L24: `SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_EXPECTED_VALUE_SOURCE_TRACE_NOT_BOUND',`
- L25: `EXPECTED_VALUE_NOT_VERIFIED: 'QUOTE_PREVIEW_EXPECTED_VALUE_NOT_VERIFIED',`
- L26: `EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_EXECUTION_NOT_AUTHORIZED',`
- L27: `INVENTED_EXPECTED_VALUE_BLOCKED: 'QUOTE_PREVIEW_INVENTED_EXPECTED_VALUE_BLOCKED',`
- L28: `UNTRACEABLE_PROJECTION_BLOCKED: 'QUOTE_PREVIEW_UNTRACEABLE_PROJECTION_BLOCKED',`
- L29: `DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND',`
- L30: `PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_PARSER_EXECUTION_NOT_AUTHORIZED',`
- L31: `CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_CALCULATOR_EXECUTION_NOT_AUTHORIZED',`
- L32: `BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_BANXICO_CALL_NOT_AUTHORIZED',`
- L36: `crmWrite: false,`
- L37: `pipelineWrite: false,`
- L38: `policyWrite: false,`
- L39: `quoteWrite: false,`
- L46: `browserPersistence: false,`
- L51: `pdfRead: false,`
- L121: `source_registry_refs: ['prov_real_retirement_mxn_expected_values', 'tests/real-retirement-mxn-scenario-test.js', 'imagina-ser-future-mxn-bridge.js', 'retirement-future-udi-projection-engine.js'],`
- L122: `required_source_trace: 'pdf_derived_fields_plus_existing_projection_engine_inputs',`
- L127: `trace_id: 'trace_retirement_future_udi_deterministic_inputs',`
- L129: `expected_value_kind: EXPECTED_VALUE_KINDS.DETERMINISTIC_PROJECTION_INPUT_TRACE,`
- L131: `source_registry_refs: ['prov_retirement_future_udi_deterministic_inputs', 'retirement-future-udi-projection-smoke-test.js', 'retirement-future-udi-projection-engine.js'],`
- L133: `blocked_misuse: ['invented_udi_growth', 'invented_current_udi', 'calculator_execution_before_input_trace', 'banxico_call_disguised_as_trace'],`
- L134: `safe_errors: [SAFE_ERROR_CODES.DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND, SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED],`
- L140: `function getSourceRefs() {`
- L141: `const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();`
- L142: `const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();`
- L143: `const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();`
- L144: `const fileHashCatalog = fileHash.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog();`
- L148: `readiness: { adapter_id: readinessCatalog.adapter_id, schemaVersion: readinessCatalog.schemaVersion, overall_readiness: readinessCatalog.overall_readiness },`
- L153: `function getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog() {`
- L160: `registry_type: 'local_static_read_only_expected_value_source_trace_registry',`
- L161: `overall_trace_status: 'not_bound_not_verified_not_ready',`
- L164: `pdf_read_allowed_in_registry: false,`
- L165: `pdf_hash_computation_allowed_in_registry: false,`
- L173: `quote_write_allowed_in_registry: false,`
- L175: `quote_preview_downstream: true,`
- L179: `source_refs: getSourceRefs(),`
- L190: `readModelStatus: 'error',`
- L207: `function getExpectedValueSourceTraceById(traceId) {`
- L208: `const match = EXPECTED_VALUE_SOURCE_TRACES.find((trace) => trace.trace_id === traceId);`
- L211: `function getExpectedValueSourceTracesByTestId(testId) { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.test_id === testId)); }`
- L212: `function getExpectedValueSourceTracesByProductFamily(productFamily) { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.product_family === productFamily)); }`
- L213: `function getUnboundExpectedValueSourceTraces() { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.source_trace_status === SOURCE_TRACE_STATUSES.NOT_BOUND)); }`
- L214: `function getNotVerifiedExpectedValueSourceTraces() { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.verification_status === VERIFICATION_STATUSES.NOT_VERIFIED)); }`
- L234: `if (catalog.overall_trace_status !== 'not_bound_not_verified_not_ready') errors.push('overall_trace_status_must_remain_not_ready');`
- L238: `'pdf_read_allowed_in_registry',`
- L239: `'pdf_hash_computation_allowed_in_registry',`
- L247: `'quote_write_allowed_in_registry',`
- L271: `getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog,`
- L272: `getExpectedValueSourceTraceById,`
- L273: `getExpectedValueSourceTracesByTestId,`
- L274: `getExpectedValueSourceTracesByProductFamily,`
- L275: `getUnboundExpectedValueSourceTraces,`
- L276: `getNotVerifiedExpectedValueSourceTraces,`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getQuotePreviewPdfEnginePromotionManifest", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L3: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.repo_promotion.adapter.v1';`
- L4: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.repo_promotion.v1';`
- L5: `const DOMAIN_ID = 'quote_preview_pdf_engine_repo_promotion';`
- L6: `const MODE = 'read_only';`
- L9: `const PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF =`
- L10: `'platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js';`
- L12: `const QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF =`
- L13: `'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js';`
- L15: `const QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF =`
- L16: `'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js';`
- L18: `const QUOTE_PREVIEW_PDF_ENGINE_REF =`
- L19: `'product-intelligence/evidence/forge-quote-pdf-preview-engine.js';`
- L22: `PROMOTION_NOT_SCOPED: 'QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED',`
- L23: `PRODUCT_INTELLIGENCE_BINDING_REQUIRED: 'QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED',`
- L24: `PRODUCT_FAMILY_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_FAMILY_NOT_MAPPED',`
- L25: `PARSER_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_ENGINE_PARSER_NOT_MAPPED',`
- L26: `CALCULATOR_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_ENGINE_CALCULATOR_NOT_MAPPED',`
- L27: `SOURCE_EVIDENCE_REQUIRED: 'QUOTE_PREVIEW_PDF_ENGINE_SOURCE_EVIDENCE_REQUIRED',`
- L28: `FRESHNESS_REQUIRED: 'QUOTE_PREVIEW_PDF_ENGINE_FRESHNESS_REQUIRED',`
- L32: `crmWrite: false,`
- L33: `pipelineWrite: false,`
- L34: `policyWrite: false,`
- L35: `quoteWrite: false,`
- L42: `browserPersistence: false,`
- L47: `pdfRead: false,`
- L54: `'quote_preview_pdf_promotion_id',`
- L55: `'quote_preview_pdf_request_id',`
- L63: `'quote_preview_pdf_engine_ref',`
- L73: `'pdf_read',`
- L79: `'quote_write',`
- L81: `'crm_write',`
- L82: `'policy_write',`
- L83: `'pipeline_write',`
- L132: `'imagina-ser-future-mxn-bridge.js',`
- L193: `return aliases.get(compact) || String(value || '').trim();`
- L203: `return 'quote_preview_pdf_engine_promotion_${clean || 'not_modeled'}_076b';`
- L206: `function getQuotePreviewPdfEnginePromotionManifest() {`
- L213: `adapter_type: 'local_static_read_only_reference_promotion_adapter',`
- L214: `product_intelligence_read_model_adapter_ref: PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF,`
- L215: `quote_preview_product_intelligence_binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,`
- L216: `quote_preview_pdf_product_intelligence_integration_adapter_ref:`
- L217: `QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,`
- L218: `quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L227: `quote_preview_pdf_engine_downstream_consumer_reference_only: true,`
- L228: `local_static_read_only: true,`
- L230: `executes_pdf_read: false,`
- L235: `writes_quote: false,`
- L241: `function buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {`
- L254: `readModelStatus: 'error',`
- L255: `quote_preview_pdf_promotion_id: makeDeterministicId([`
- L256: `request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || 'missing',`
- L260: `quote_preview_pdf_request_id:`
- L261: `request.quote_preview_pdf_request_id ||`
- L262: `request.quotePreviewPdfRequestId ||`
- L263: `request.quote_preview_request_id ||`
- L264: `request.quotePreviewRequestId ||`
- L266: `product_intelligence_binding_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,`
- L273: `quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L286: `no_pdf_read: true,`
- L296: `message: 'Quote Preview PDF Engine promotion is not available without Product Intelligence-bound references.',`
- L299: `event_type: 'quote_preview_pdf_engine_repo_promotion_safe_error',`
- L306: `function prepareQuotePreviewPdfEnginePromotionScope(request = {}) {`
- L315: `return buildQuotePreviewPdfEnginePromotionError(`
- L324: `return buildQuotePreviewPdfEnginePromotionError(`
- L337: `readModelStatus: 'ok',`
- L338: `quote_preview_pdf_promotion_id: makeDeterministicId([`
- L339: `request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || request.quote_preview_request_id || request.quotePreviewRequestId || 'request',`
- L342: `quote_preview_pdf_request_id:`
- L343: `request.quote_preview_pdf_request_id ||`
- L344: `request.quotePreviewPdfRequestId ||`
- L345: `request.quote_preview_request_id ||`
- L346: `request.quotePreviewRequestId ||`
- L349: `binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,`
- L350: `integration_adapter_ref: QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,`
- L359: `quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L374: `quote_preview_pdf_engine_downstream_consumer_reference_only: true,`
- L378: `no_pdf_read: true,`
- L383: `no_quote_write: true,`
- L390: `event_type: 'quote_preview_pdf_engine_repo_promotion_prepared',`
- L397: `function validateQuotePreviewPdfEnginePromotionShape(promotion) {`
- L421: `'"pdfRead":' + 'true',`
- L427: `'"quoteWrite":' + 'true',`
- L453: `PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF,`
- L454: `QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,`
- L455: `QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,`
- L456: `QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L457: `getQuotePreviewPdfEnginePromotionManifest,`
- L458: `prepareQuotePreviewPdfEnginePromotionScope,`
- L459: `buildQuotePreviewPdfEnginePromotionError,`
- L460: `validateQuotePreviewPdfEnginePromotionShape,`

### `platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getCalculatorRefs", "parameters": ["binding"], "form": "function"}, {"name": "getField", "parameters": ["object", "names"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L3: `const bindingAdapter = require('./quote-preview-product-intelligence-binding-adapter-074b.js');`
- L5: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine_product_intelligence.integration.adapter.v1';`
- L6: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine_product_intelligence.integration.v1';`
- L7: `const DOMAIN_ID = 'quote_preview_pdf_engine_product_intelligence_integration';`
- L8: `const MODE = 'read_only';`
- L11: `const QUOTE_PREVIEW_PDF_ENGINE_REF = 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js';`
- L12: `const BINDING_ADAPTER_REF = 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js';`
- L13: `const PRODUCT_INTELLIGENCE_ADAPTER_REF = 'platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js';`
- L16: `NOT_INTEGRATED: 'QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_NOT_INTEGRATED',`
- L17: `PRODUCT_FAMILY_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED',`
- L18: `BINDING_REQUIRED: 'QUOTE_PREVIEW_PDF_BINDING_REQUIRED',`
- L19: `SOURCE_EVIDENCE_REQUIRED: 'QUOTE_PREVIEW_PDF_SOURCE_EVIDENCE_REQUIRED',`
- L20: `FRESHNESS_REQUIRED: 'QUOTE_PREVIEW_PDF_FRESHNESS_REQUIRED',`
- L21: `PDF_ENGINE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_ENGINE_NOT_MAPPED'`
- L25: `crmWrite: false,`
- L26: `pipelineWrite: false,`
- L27: `policyWrite: false,`
- L28: `quoteWrite: false,`
- L35: `browserPersistence: false,`
- L43: `pdfRead: false`
- L47: `'pdf_read',`
- L61: `'policy_write',`
- L62: `'crm_write',`
- L63: `'pipeline_write',`
- L69: `'browser_persistence',`
- L79: `'quote_preview_pdf_integration_id',`
- L80: `'quote_preview_request_id',`
- L81: `'quote_preview_pdf_engine_ref',`
- L82: `'quote_preview_pdf_engine_role',`
- L83: `'quote_preview_binding_ref',`
- L118: `function getField(object, names) {`
- L136: `const refs = getField(request, ['source_evidence_refs', 'source_evidence_ids', 'sourceEvidenceRefs', 'sourceEvidenceIds']);`
- L143: `const sourceDocumentRef = getField(request, ['source_document_ref', 'sourceDocumentRef', 'pdf_ref', 'pdfRef']);`
- L167: `const candidate = getField(binding, ['safe_error', 'safeError', 'error']);`
- L173: `function buildQuotePreviewPdfIntegrationError(code, request = {}, message = '') {`
- L179: `readModelStatus: 'error',`
- L180: `quote_preview_pdf_integration_id: 'quote_preview_pdf_pi_integration_error_${slug(code)}_${slug(getField(request, ['quote_preview_request_id', 'quotePreviewRequestId', 'request_id']) || 'missing_request')}',`
- L181: `quote_preview_request_id: getField(request, ['quote_preview_request_id', 'quotePreviewRequestId', 'request_id']) || null,`
- L182: `quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L183: `quote_preview_pdf_engine_role: 'consumer_reference_only',`
- L184: `quote_preview_binding_ref: BINDING_ADAPTER_REF,`
- L186: `product_family: getField(request, ['product_family_hint', 'productFamilyHint', 'product_family', 'productFamily']) || null,`
- L198: `pdf_read_allowed: false,`
- L208: `message: message || 'Quote Preview PDF Engine is not integrated with Product Intelligence for this request.'`
- L211: `event_type: 'quote_preview_pdf_product_intelligence_integration_error',`
- L213: `source_phase: '075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION'`
- L219: `const sourceDocumentRef = getField(request, ['source_document_ref', 'sourceDocumentRef', 'pdf_ref', 'pdfRef']);`
- L223: `function getCalculatorRefs(binding) {`
- L224: `const refs = getField(binding, ['calculator_refs', 'calculatorRefs']);`
- L230: `function integrateQuotePreviewPdfEngineWithProductIntelligence(request = {}) {`
- L231: `const quotePreviewRequestId = getField(request, ['quote_preview_request_id', 'quotePreviewRequestId', 'request_id']) || 'quote_preview_request_${slug(getField(request, ['product_family_hint', 'productFamilyHint']) || 'unknown')}';`
- L234: `return buildQuotePreviewPdfIntegrationError(`
- L236: `{ ...request, quote_preview_request_id: quotePreviewRequestId },`
- L237: `'Source document or evidence references are required before PDF preview integration.'`
- L241: `if (!bindingAdapter || typeof bindingAdapter.bindQuotePreviewToProductIntelligence !== 'function') {`
- L242: `return buildQuotePreviewPdfIntegrationError(`
- L244: `{ ...request, quote_preview_request_id: quotePreviewRequestId },`
- L245: `'Quote Preview Product Intelligence binding adapter is required.'`
- L250: `quote_preview_request_id: quotePreviewRequestId,`
- L251: `product_family_hint: getField(request, ['product_family_hint', 'productFamilyHint', 'product_family', 'productFamily']),`
- L252: `product_ref_hint: getField(request, ['product_ref_hint', 'productRefHint', 'product_ref', 'productRef']),`
- L253: `carrier_ref_hint: getField(request, ['carrier_ref_hint', 'carrierRefHint', 'carrier_ref', 'carrierRef']),`
- L254: `source_document_ref: getField(request, ['source_document_ref', 'sourceDocumentRef', 'pdf_ref', 'pdfRef']),`
- L256: `requested_preview_mode: getField(request, ['requested_preview_mode', 'requestedPreviewMode']) || 'pdf_preview_reference_only'`
- L259: `const binding = bindingAdapter.bindQuotePreviewToProductIntelligence(bindingRequest);`
- L263: `return buildQuotePreviewPdfIntegrationError(`
- L264: `bindingError === 'QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED'`
- L272: `if (typeof bindingAdapter.validateQuotePreviewBindingShape === 'function') {`
- L273: `const validation = bindingAdapter.validateQuotePreviewBindingShape(binding);`
- L275: `return buildQuotePreviewPdfIntegrationError(`
- L278: `'Quote Preview Product Intelligence binding shape did not validate.'`
- L283: `const productFamily = getField(binding, ['product_family', 'productFamily']);`
- L285: `return buildQuotePreviewPdfIntegrationError(`
- L292: `const parserRef = getField(binding, ['parser_ref', 'parserRef']);`
- L293: `const calculatorRefs = getCalculatorRefs(binding);`
- L300: `readModelStatus: 'ok',`
- L301: `quote_preview_pdf_integration_id: 'quote_preview_pdf_pi_integration_${slug(productFamily)}_${slug(quotePreviewRequestId)}',`
- L302: `quote_preview_request_id: quotePreviewRequestId,`
- L303: `quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L304: `quote_preview_pdf_engine_role: 'consumer_reference_only',`
- L305: `quote_preview_binding_ref: BINDING_ADAPTER_REF,`
- L306: `quote_preview_binding_id: getField(binding, ['quote_preview_binding_id', 'quotePreviewBindingId']) || null,`
- L307: `product_intelligence_ref: getField(binding, ['product_intelligence_ref', 'productIntelligenceRef']) || PRODUCT_INTELLIGENCE_ADAPTER_REF,`
- L314: `coverage_semantics_ref: getField(binding, ['coverage_semantics_ref', 'coverageSemanticsRef']) || null,`
- L315: `premium_semantics_ref: getField(binding, ['premium_semantics_ref', 'premiumSemanticsRef']) || null,`
- L316: `currency_semantics_ref: getField(binding, ['currency_semantics_ref', 'currencySemanticsRef']) || null,`
- L317: `projection_semantics_ref: getField(binding, ['projection_semantics_ref', 'projectionSemanticsRef']) || null,`
- L319: `freshness_requirements: getField(binding, ['freshness_requirements', 'freshnessRequirements']) || buildFreshnessRequirements(),`
- L322: `pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L326: `pdf_read_allowed: false,`
- L338: `event_type: 'quote_preview_pdf_product_intelligence_integration_used',`
- L340: `source_phase: '075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION'`
- L345: `function validateQuotePreviewPdfProductIntelligenceIntegrationShape(integration) {`
- L364: `QUOTE_PREVIEW_PDF_ENGINE_REF,`
- L371: `integrateQuotePreviewPdfEngineWithProductIntelligence,`
- L372: `buildQuotePreviewPdfIntegrationError,`
- L373: `validateQuotePreviewPdfProductIntelligenceIntegrationShape`

### `platform/adapters/quote-preview/quote-preview-safe-copy-badge-system-registry-adapter-090b.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getBadgeById", "parameters": ["badgeId"], "form": "function"}, {"name": "getCopyBlockById", "parameters": ["copyId"], "form": "function"}, {"name": "getCopyBlocksByUsage", "parameters": ["usage"], "form": "function"}, {"name": "getQuotePreviewSafeCopyBadgeSystemRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const visual = require('./quote-preview-safe-visual-layout-spec-registry-adapter-089b.js');`
- L5: `const ADAPTER_ID = 'forge.quote_preview.safe_copy_badge_system.registry.adapter.v1';`
- L6: `const SCHEMA_VERSION = 'forge.quote_preview.safe_copy_badge_system.registry.v1';`
- L7: `const DOMAIN_ID = 'quote_preview_safe_copy_badge_system';`
- L8: `const MODE = 'read_only';`
- L21: `COPY_BADGE_NOT_MAPPED: 'QUOTE_PREVIEW_COPY_BADGE_NOT_MAPPED',`
- L22: `OFFICIAL_QUOTE_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_OFFICIAL_QUOTE_LANGUAGE_NOT_ALLOWED',`
- L23: `SEND_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_SEND_LANGUAGE_NOT_ALLOWED',`
- L24: `CRM_WRITE_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_CRM_WRITE_LANGUAGE_NOT_ALLOWED',`
- L25: `CALENDAR_CREATE_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_CALENDAR_CREATE_LANGUAGE_NOT_ALLOWED',`
- L26: `QUOTE_TRUTH_LANGUAGE_BLOCKED: 'QUOTE_PREVIEW_QUOTE_TRUTH_LANGUAGE_BLOCKED',`
- L27: `EFFECT_LANGUAGE_BLOCKED: 'QUOTE_PREVIEW_EFFECT_LANGUAGE_BLOCKED',`
- L31: `crmWrite: false,`
- L32: `pipelineWrite: false,`
- L33: `policyWrite: false,`
- L34: `quoteWrite: false,`
- L41: `browserPersistence: false,`
- L46: `pdfRead: false,`
- L60: `/\bemitir cotizaci[oó]n\b/i,`
- L73: `'crm_write_allowed',`
- L76: `'write_allowed',`
- L87: `'crm_write_allowed',`
- L90: `'write_allowed',`
- L125: `crm_write_allowed: false,`
- L128: `write_allowed: false,`
- L141: `crm_write_allowed: false,`
- L144: `write_allowed: false,`
- L148: `SAFE_ERROR_CODES.CRM_WRITE_LANGUAGE_NOT_ALLOWED,`
- L158: `buildBadge({ badgeId: 'preview', label: 'Preview', tone: BADGE_TONES.CYAN, meaning: 'Reference preview only.', requiredWhen: ['all_quote_preview_surfaces'] }),`
- L159: `buildBadge({ badgeId: 'read_only', label: 'Solo lectura', tone: BADGE_TONES.BLUE, meaning: 'No writes are allowed.', requiredWhen: ['all_quote_preview_surfaces'] }),`
- L160: `buildBadge({ badgeId: 'human_review_required', label: 'Revisión humana', tone: BADGE_TONES.GOLD, meaning: 'Human review required before any real action.', requiredWhen: ['ready_for_human_review', 'quote_truth_blocked'] }),`
- L161: `buildBadge({ badgeId: 'not_official_quote', label: 'No cotización oficial', tone: BADGE_TONES.GOLD, meaning: 'Not an official quote.', requiredWhen: ['all_quote_preview_surfaces'] }),`
- L163: `buildBadge({ badgeId: 'no_crm', label: 'Sin CRM', tone: BADGE_TONES.NEUTRAL, meaning: 'No CRM write is allowed.', requiredWhen: ['action_bar', 'command_bar'] }),`
- L173: `text: 'Este preview es solo una referencia operativa. No es una cotización oficial.',`
- L175: `requiredBadgeIds: ['preview', 'read_only', 'not_official_quote'],`
- L187: `requiredBadgeIds: ['preview', 'read_only', 'no_send', 'no_crm', 'no_calendar'],`
- L191: `text: 'La verdad de cotización está bloqueada hasta que una fuente autorizada la confirme.',`
- L205: `requiredBadgeIds: ['preview', 'read_only'],`
- L215: `function getSourceRefs() {`
- L216: `const visualCatalog = visual.getQuotePreviewSafeVisualLayoutSpecRegistryCatalog();`
- L228: `function getQuotePreviewSafeCopyBadgeSystemRegistryCatalog() {`
- L235: `registry_type: 'local_static_read_only_safe_copy_badge_system_registry',`
- L239: `crm_write_allowed_in_registry: false,`
- L243: `write_allowed_in_registry: false,`
- L246: `dom_write_allowed_in_registry: false,`
- L252: `source_refs: getSourceRefs(),`
- L258: `function getBadgeById(badgeId) {`
- L259: `const match = BADGES.find((badge) => badge.badge_id === badgeId);`
- L261: `readModelStatus: 'error',`
- L269: `crm_write_allowed: false,`
- L272: `write_allowed: false,`
- L276: `message: 'Badge is not mapped. Official quote, send, CRM, calendar, truth, and writes remain blocked.',`
- L281: `function getCopyBlockById(copyId) {`
- L282: `const match = COPY_BLOCKS.find((copy) => copy.copy_id === copyId);`
- L284: `readModelStatus: 'error',`
- L288: `required_badge_ids: ['preview', 'read_only', 'not_official_quote'],`
- L291: `crm_write_allowed: false,`
- L294: `write_allowed: false,`
- L304: `function getCopyBlocksByUsage(usage) {`
- L317: `for (const flagName of ['official_quote_allowed', 'send_allowed', 'crm_write_allowed', 'calendar_create_allowed', 'quote_truth_allowed', 'write_allowed']) {`
- L330: `for (const flagName of ['official_quote_allowed', 'send_allowed', 'crm_write_allowed', 'calendar_create_allowed', 'quote_truth_allowed', 'write_allowed']) {`
- L358: `'crm_write_allowed_in_registry',`
- L362: `'write_allowed_in_registry',`
- L365: `'dom_write_allowed_in_registry',`
- L375: `const badgeIds = new Set(badges.map((badge) => badge.badge_id));`
- L376: `for (const requiredBadge of ['preview', 'read_only', 'human_review_required', 'not_official_quote', 'no_send', 'no_crm', 'no_calendar']) {`
- L414: `getQuotePreviewSafeCopyBadgeSystemRegistryCatalog,`
- L415: `getBadgeById,`
- L416: `getCopyBlockById,`
- L417: `getCopyBlocksByUsage,`

### `retirement-presentation-scenario-engine.js`

- Score: `-8`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getVerifiedUdiRateMetadata", "parameters": ["{\n  rateProvider = getCachedRates\n} = {}"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L4: `const { getCachedRates } = require('./exchange-rate-cache-engine');`
- L9: `export async function getVerifiedUdiRateMetadata({`
- L10: `rateProvider = getCachedRates`
- L13: `const cache = await rateProvider();`
- L14: `const udi = cache?.rates?.UDI_MXN;`
- L24: `cacheStatus: cache?.cacheStatus || null`
- L33: `sourceMode: cache.cacheStatus === 'CACHE_HIT' ? 'CACHE' : 'LIVE',`
- L34: `cacheStatus: cache.cacheStatus,`
- L45: `cacheStatus: null,`
- L126: `: 'Última edad visible en la cotización'`
- L131: `status: 'READY',`
- L138: `cacheStatus: udiRateMetadata.cacheStatus,`

### `exchange-rate-cache-engine.js`

- Score: `-10`
- Quote/PDF relevance: `false`
- Cache/state relevance: `true`
- Writer functions: `[{"name": "getCachedRates", "parameters": ["{ forceRefresh = false } = {}"], "form": "function"}, {"name": "readCache", "parameters": [], "form": "function"}, {"name": "writeCache", "parameters": ["data"], "form": "function"}]`
- Reader functions: `[{"name": "getCachedRates", "parameters": ["{ forceRefresh = false } = {}"], "form": "function"}, {"name": "getCurrentRatesWithConfiguredProvider", "parameters": [], "form": "function"}, {"name": "readCache", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L2: `const { getCurrentRates } = require("./shared-banxico-rate-engine");`
- L3: `const { getCurrentRatesFromSupabaseEdge } = require("./shared-banxico-edge-provider");`
- L5: `const CACHE_FILE = "forge-rate-cache.json";`
- L6: `const MAX_CACHE_AGE_HOURS = 12;`
- L12: `function readCache() {`
- L13: `if (!fs.existsSync(CACHE_FILE)) return null;`
- L14: `return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));`
- L17: `function writeCache(data) {`
- L18: `fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));`
- L21: `async function getCurrentRatesWithConfiguredProvider() {`
- L23: `return getCurrentRatesFromSupabaseEdge();`
- L26: `return getCurrentRates();`
- L29: `async function getCachedRates({ forceRefresh = false } = {}) {`
- L30: `const cache = readCache();`
- L33: `if (!forceRefresh && cache && cache.cachedAt) {`
- L34: `const age = hoursBetween(now, cache.cachedAt);`
- L36: `if (age <= MAX_CACHE_AGE_HOURS) {`
- L38: `...cache,`
- L39: `cacheStatus: "CACHE_HIT"`
- L44: `const rates = await getCurrentRatesWithConfiguredProvider();`
- L46: `const payload = {`
- L47: `cachedAt: now,`
- L49: `cacheStatus: "CACHE_REFRESHED"`
- L52: `writeCache(payload);`
- L54: `return payload;`
- L58: `getCachedRates,`
- L59: `readCache,`
- L60: `writeCache`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js`

- Score: `-10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getDecisionRequiredParserOwnershipEntries", "parameters": [], "form": "function"}, {"name": "getNonExecutableParserOwnershipEntries", "parameters": [], "form": "function"}, {"name": "getParserOwnershipById", "parameters": ["ownershipId"], "form": "function"}, {"name": "getParserOwnershipBySurfaceId", "parameters": ["surfaceId"], "form": "function"}, {"name": "getParserOwnershipEntriesByStatus", "parameters": ["status"], "form": "function"}, {"name": "getQuotePreviewPdfEngineParserOwnershipRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');`
- L4: `const expectedTrace = require('./quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js');`
- L6: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.parser_ownership.registry.adapter.v1';`
- L7: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.parser_ownership.registry.v1';`
- L8: `const DOMAIN_ID = 'quote_preview_pdf_engine_parser_ownership';`
- L9: `const MODE = 'read_only';`
- L26: `OWNERSHIP_NOT_MAPPED: 'QUOTE_PREVIEW_PARSER_OWNERSHIP_NOT_MAPPED',`
- L27: `PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_EXECUTION_NOT_AUTHORIZED',`
- L28: `PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_PDF_READ_NOT_AUTHORIZED',`
- L29: `OCR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_OCR_EXECUTION_NOT_AUTHORIZED',`
- L30: `DUPLICATE_PARSER_CREATION_BLOCKED: 'QUOTE_PREVIEW_DUPLICATE_PARSER_CREATION_BLOCKED',`
- L31: `PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED: 'QUOTE_PREVIEW_PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED',`
- L32: `UNOWNED_PARSER_EXECUTION_BLOCKED: 'QUOTE_PREVIEW_UNOWNED_PARSER_EXECUTION_BLOCKED',`
- L36: `crmWrite: false,`
- L37: `pipelineWrite: false,`
- L38: `policyWrite: false,`
- L39: `quoteWrite: false,`
- L46: `browserPersistence: false,`
- L51: `pdfRead: false,`
- L95: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L132: `ownership_id: 'owner_quote_pdf_preview_engine',`
- L133: `parser_surface_id: 'quote_pdf_preview_engine',`
- L135: `file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',`
- L152: `function getSourceRefs() {`
- L153: `const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();`
- L154: `const expectedTraceCatalog = expectedTrace.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();`
- L156: `readiness: {`
- L157: `adapter_id: readinessCatalog.adapter_id,`
- L158: `schemaVersion: readinessCatalog.schemaVersion,`
- L159: `overall_readiness: readinessCatalog.overall_readiness,`
- L169: `function getQuotePreviewPdfEngineParserOwnershipRegistryCatalog() {`
- L176: `registry_type: 'local_static_read_only_parser_ownership_registry',`
- L179: `pdf_read_allowed_in_registry: false,`
- L186: `quote_write_allowed_in_registry: false,`
- L188: `quote_preview_downstream: true,`
- L192: `source_refs: getSourceRefs(),`
- L203: `readModelStatus: 'error',`
- L222: `function getParserOwnershipById(ownershipId) {`
- L223: `const match = PARSER_OWNERSHIP_ENTRIES.find((entry) => entry.ownership_id === ownershipId);`
- L227: `function getParserOwnershipBySurfaceId(surfaceId) {`
- L228: `const match = PARSER_OWNERSHIP_ENTRIES.find((entry) => entry.parser_surface_id === surfaceId);`
- L232: `function getParserOwnershipEntriesByStatus(status) {`
- L236: `function getDecisionRequiredParserOwnershipEntries() {`
- L237: `return getParserOwnershipEntriesByStatus(OWNERSHIP_STATUSES.DECISION_REQUIRED);`
- L240: `function getNonExecutableParserOwnershipEntries() {`
- L283: `'pdf_read_allowed_in_registry',`
- L290: `'quote_write_allowed_in_registry',`
- L326: `getQuotePreviewPdfEngineParserOwnershipRegistryCatalog,`
- L327: `getParserOwnershipById,`
- L328: `getParserOwnershipBySurfaceId,`
- L329: `getParserOwnershipEntriesByStatus,`
- L330: `getDecisionRequiredParserOwnershipEntries,`
- L331: `getNonExecutableParserOwnershipEntries,`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js`

- Score: `-10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getPreviewAllowedBoundaryEntries", "parameters": [], "form": "function"}, {"name": "getPreviewVsQuoteTruthBoundaryById", "parameters": ["boundaryId"], "form": "function"}, {"name": "getPreviewVsQuoteTruthBoundaryBySurfaceId", "parameters": ["surfaceId"], "form": "function"}, {"name": "getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getQuoteTruthBlockedBoundaryEntries", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}, {"name": "getUserVisiblePreviewBoundaryEntries", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');`
- L4: `const deterministicInput = require('./quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js');`
- L6: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.adapter.v1';`
- L7: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.v1';`
- L8: `const DOMAIN_ID = 'quote_preview_pdf_engine_preview_vs_quote_truth_boundary';`
- L9: `const MODE = 'read_only';`
- L33: `BOUNDARY_NOT_MAPPED: 'QUOTE_PREVIEW_TRUTH_BOUNDARY_NOT_MAPPED',`
- L34: `QUOTE_TRUTH_CREATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_TRUTH_CREATION_NOT_AUTHORIZED',`
- L35: `QUOTE_ISSUANCE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_ISSUANCE_NOT_AUTHORIZED',`
- L36: `QUOTE_SEND_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_SEND_NOT_AUTHORIZED',`
- L37: `PROVIDER_RUNTIME_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PROVIDER_RUNTIME_NOT_AUTHORIZED',`
- L38: `BACKEND_CONNECTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_BACKEND_CONNECTION_NOT_AUTHORIZED',`
- L39: `QUOTE_WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_WRITE_NOT_AUTHORIZED',`
- L40: `PREVIEW_AS_QUOTE_TRUTH_BLOCKED: 'QUOTE_PREVIEW_PREVIEW_AS_QUOTE_TRUTH_BLOCKED',`
- L41: `PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_PREVIEW_LABEL_REQUIRED',`
- L45: `crmWrite: false,`
- L46: `pipelineWrite: false,`
- L47: `policyWrite: false,`
- L48: `quoteWrite: false,`
- L55: `browserPersistence: false,`
- L60: `pdfRead: false,`
- L94: `boundary_id: 'boundary_quote_preview_pdf_engine',`
- L95: `surface_id: 'quote_pdf_preview_engine',`
- L107: `SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,`
- L111: `boundary_id: 'boundary_quote_preview_expected_values',`
- L114: `owner_domain: 'quote_preview_pdf_engine',`
- L124: `SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,`
- L137: `blocked_misuse: ['provider_quote_truth_without_runtime_gate', 'backend_quote_write_without_gate', 'quote_issuance_without_authority'],`
- L146: `boundary_id: 'boundary_user_visible_quote_preview_ui',`
- L147: `surface_id: 'quote_preview_ui',`
- L155: `blocked_misuse: ['user_visible_quote_without_preview_label', 'preview_as_binding_quote', 'policy_or_crm_write_from_preview'],`
- L160: `SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,`
- L169: `function getSourceRefs() {`
- L170: `const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();`
- L171: `const deterministicCatalog = deterministicInput.getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog();`
- L174: `readiness: {`
- L175: `adapter_id: readinessCatalog.adapter_id,`
- L176: `schemaVersion: readinessCatalog.schemaVersion,`
- L177: `overall_readiness: readinessCatalog.overall_readiness,`
- L179: `deterministic_input: {`
- L182: `overall_input_trace_status: deterministicCatalog.overall_input_trace_status,`
- L187: `function getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog() {`
- L194: `registry_type: 'local_static_read_only_preview_vs_quote_truth_boundary_registry',`
- L202: `quote_write_allowed_in_registry: false,`
- L203: `crm_write_allowed_in_registry: false,`
- L204: `policy_write_allowed_in_registry: false,`
- L205: `pipeline_write_allowed_in_registry: false,`
- L207: `quote_preview_downstream: true,`
- L211: `source_refs: getSourceRefs(),`
- L222: `readModelStatus: 'error',`
- L233: `safe_errors: [code, SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED],`
- L242: `function getPreviewVsQuoteTruthBoundaryById(boundaryId) {`
- L243: `const match = BOUNDARY_ENTRIES.find((entry) => entry.boundary_id === boundaryId);`
- L247: `function getPreviewVsQuoteTruthBoundaryBySurfaceId(surfaceId) {`
- L248: `const match = BOUNDARY_ENTRIES.find((entry) => entry.surface_id === surfaceId);`
- L252: `function getPreviewAllowedBoundaryEntries() {`
- L256: `function getQuoteTruthBlockedBoundaryEntries() {`
- L260: `function getUserVisiblePreviewBoundaryEntries() {`
- L298: `'quote_write_allowed_in_registry',`
- L299: `'crm_write_allowed_in_registry',`
- L300: `'policy_write_allowed_in_registry',`
- L301: `'pipeline_write_allowed_in_registry',`
- L334: `getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog,`
- L335: `getPreviewVsQuoteTruthBoundaryById,`
- L336: `getPreviewVsQuoteTruthBoundaryBySurfaceId,`
- L337: `getPreviewAllowedBoundaryEntries,`
- L338: `getQuoteTruthBlockedBoundaryEntries,`
- L339: `getUserVisiblePreviewBoundaryEntries,`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js`

- Score: `-10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getNotVerifiedRealPdfFileHashBindings", "parameters": [], "form": "function"}, {"name": "getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getRealPdfFileHashBindingById", "parameters": ["bindingId"], "form": "function"}, {"name": "getRealPdfFileHashBindingsByTestId", "parameters": ["testId"], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}, {"name": "getUnboundRealPdfFileHashBindings", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const evidence = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');`
- L4: `const provenance = require('./quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');`
- L5: `const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');`
- L7: `const ADAPTER_ID = 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1';`
- L8: `const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1';`
- L9: `const DOMAIN_ID = 'quote_preview_pdf_engine_real_pdf_file_hash_provenance';`
- L10: `const MODE = 'read_only';`
- L15: `const FILE_READ_STATUSES = Object.freeze({ NOT_READ: 'not_read' });`
- L19: `BINDING_NOT_MAPPED: 'QUOTE_PREVIEW_REAL_PDF_FILE_HASH_BINDING_NOT_MAPPED',`
- L20: `FILE_PATH_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_FILE_PATH_NOT_BOUND',`
- L21: `HASH_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_HASH_NOT_BOUND',`
- L22: `FILE_SIZE_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_FILE_SIZE_NOT_BOUND',`
- L23: `PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_READ_NOT_AUTHORIZED',`
- L24: `HASH_COMPUTE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_HASH_COMPUTE_NOT_AUTHORIZED',`
- L25: `EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_EXECUTION_NOT_AUTHORIZED',`
- L26: `FIXTURE_AS_REAL_PDF_BLOCKED: 'QUOTE_PREVIEW_REAL_PDF_FIXTURE_AS_REAL_PDF_BLOCKED',`
- L30: `crmWrite: false,`
- L31: `pipelineWrite: false,`
- L32: `policyWrite: false,`
- L33: `quoteWrite: false,`
- L40: `browserPersistence: false,`
- L45: `pdfRead: false,`
- L63: `'file_read_status',`
- L91: `file_read_status: FILE_READ_STATUSES.NOT_READ,`
- L96: `'pdf_read_before_file_hash_gate',`
- L97: `'hash_compute_before_file_hash_gate',`
- L105: `SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,`
- L106: `SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,`
- L123: `function getSourceRefs() {`
- L126: `adapter_id: evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog().adapter_id,`
- L127: `schemaVersion: evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog().schemaVersion,`
- L130: `adapter_id: provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog().adapter_id,`
- L131: `schemaVersion: provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog().schemaVersion,`
- L133: `readiness: {`
- L134: `adapter_id: readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog().adapter_id,`
- L135: `schemaVersion: readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog().schemaVersion,`
- L136: `overall_readiness: readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog().overall_readiness,`
- L141: `function getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog() {`
- L148: `registry_type: 'local_static_read_only_real_pdf_file_hash_provenance_registry',`
- L149: `overall_binding_status: 'not_bound_not_verified_not_ready',`
- L151: `pdf_read_allowed_in_registry: false,`
- L152: `pdf_hash_computation_allowed_in_registry: false,`
- L160: `quote_write_allowed_in_registry: false,`
- L162: `quote_preview_downstream: true,`
- L166: `source_refs: getSourceRefs(),`
- L177: `readModelStatus: 'error',`
- L187: `file_read_status: FILE_READ_STATUSES.NOT_READ,`
- L191: `blocked_misuse: ['unmapped_real_pdf_binding_execution', 'pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate'],`
- L192: `safe_errors: [code, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED],`
- L196: `message: 'Real PDF file/hash binding is not mapped. PDF read, hash computation, and execution are blocked.',`
- L201: `function getRealPdfFileHashBindingById(bindingId) {`
- L202: `const match = REAL_PDF_FILE_HASH_BINDINGS.find((binding) => binding.binding_id === bindingId);`
- L206: `function getRealPdfFileHashBindingsByTestId(testId) {`
- L210: `function getUnboundRealPdfFileHashBindings() {`
- L214: `function getNotVerifiedRealPdfFileHashBindings() {`
- L225: `if (binding.file_read_status !== FILE_READ_STATUSES.NOT_READ) errors.push('file_read_status_must_remain_not_read');`
- L240: `if (catalog.overall_binding_status !== 'not_bound_not_verified_not_ready') errors.push('overall_binding_status_must_remain_not_ready');`
- L243: `'pdf_read_allowed_in_registry',`
- L244: `'pdf_hash_computation_allowed_in_registry',`
- L252: `'quote_write_allowed_in_registry',`
- L273: `FILE_READ_STATUSES,`
- L279: `getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog,`
- L280: `getRealPdfFileHashBindingById,`
- L281: `getRealPdfFileHashBindingsByTestId,`
- L282: `getUnboundRealPdfFileHashBindings,`
- L283: `getNotVerifiedRealPdfFileHashBindings,`

### `platform/adapters/quote-preview/quote-preview-safe-screen-composition-registry-adapter-088b.js`

- Score: `-10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getNonRenderingScreenCompositions", "parameters": [], "form": "function"}, {"name": "getNonWritableScreenCompositions", "parameters": [], "form": "function"}, {"name": "getQuotePreviewSafeScreenCompositionRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getQuoteTruthBlockedScreenCompositions", "parameters": [], "form": "function"}, {"name": "getScreenCompositionById", "parameters": ["compositionId"], "form": "function"}, {"name": "getScreenCompositionByName", "parameters": ["screenName"], "form": "function"}, {"name": "getScreenCompositionsByLayoutMode", "parameters": ["layoutMode"], "form": "function"}, {"name": "getScreenCompositionsByStateId", "parameters": ["stateId"], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const ux = require('./quote-preview-safe-ux-state-model-registry-adapter-086b.js');`
- L4: `const components = require('./quote-preview-safe-ux-component-contract-registry-adapter-087b.js');`
- L6: `const ADAPTER_ID = 'forge.quote_preview.safe_screen_composition.registry.adapter.v1';`
- L7: `const SCHEMA_VERSION = 'forge.quote_preview.safe_screen_composition.registry.v1';`
- L8: `const DOMAIN_ID = 'quote_preview_safe_screen_composition';`
- L9: `const MODE = 'read_only';`
- L13: `EMPTY_STATE_SCREEN_COMPOSITION: 'empty_state_screen_composition',`
- L28: `SCREEN_COMPOSITION_NOT_MAPPED: 'QUOTE_PREVIEW_SCREEN_COMPOSITION_NOT_MAPPED',`
- L29: `SCREEN_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_RENDERING_NOT_AUTHORIZED',`
- L30: `COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_COMPONENT_RENDERING_NOT_AUTHORIZED',`
- L31: `UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_UI_MUTATION_NOT_AUTHORIZED',`
- L32: `QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_QUOTE_TRUTH_NOT_AUTHORIZED',`
- L33: `WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_WRITE_NOT_AUTHORIZED',`
- L34: `EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_EXECUTION_NOT_AUTHORIZED',`
- L35: `PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_SCREEN_PREVIEW_LABEL_REQUIRED',`
- L39: `crmWrite: false,`
- L40: `pipelineWrite: false,`
- L41: `policyWrite: false,`
- L42: `quoteWrite: false,`
- L49: `browserPersistence: false,`
- L54: `pdfRead: false,`
- L66: `'supported_state_ids',`
- L78: `'write_allowed',`
- L86: `'write_quote',`
- L87: `'write_crm',`
- L88: `'write_policy',`
- L89: `'write_pipeline',`
- L95: `'read_pdf',`
- L105: `supported_state_ids: Object.freeze([...(composition.supported_state_ids || [])]),`
- L122: `supportedStateIds,`
- L135: `supported_state_ids: supportedStateIds,`
- L147: `write_allowed: false,`
- L153: `SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,`
- L162: `compositionId: 'quote_preview_empty_screen',`
- L163: `screenName: 'QuotePreviewEmptyScreen',`
- L164: `compositionKind: COMPOSITION_KINDS.EMPTY_STATE_SCREEN_COMPOSITION,`
- L165: `supportedStateIds: ['empty'],`
- L168: `primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_action_bar'],`
- L170: `requiredBadges: ['preview', 'no_es_cotizacion'],`
- L171: `allowedActions: ['view_empty_state'],`
- L174: `compositionId: 'quote_preview_intake_screen',`
- L175: `screenName: 'QuotePreviewIntakeScreen',`
- L177: `supportedStateIds: ['pdf_candidate_detected', 'file_hash_not_verified'],`
- L180: `primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_warning_stack', 'quote_preview_action_bar'],`
- L181: `secondaryComponentIds: ['quote_preview_evidence_panel'],`
- L182: `requiredBadges: ['preview', 'no_es_cotizacion', 'no_verificado'],`
- L184: `blockedActions: ['issue_quote', 'send_quote', 'write_quote', 'read_pdf', 'run_parser', 'connect_backend'],`
- L187: `compositionId: 'quote_preview_blocked_screen',`
- L188: `screenName: 'QuotePreviewBlockedScreen',`
- L190: `supportedStateIds: ['source_trace_not_bound', 'parser_owner_decision_required', 'deterministic_inputs_not_verified', 'quote_truth_blocked'],`
- L193: `primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_warning_stack', 'quote_preview_human_review_card', 'quote_preview_action_bar'],`
- L194: `secondaryComponentIds: ['quote_preview_evidence_panel'],`
- L195: `requiredBadges: ['preview', 'no_es_cotizacion', 'quote_truth_bloqueado'],`
- L199: `compositionId: 'quote_preview_reference_screen',`
- L200: `screenName: 'QuotePreviewReferenceScreen',`
- L202: `supportedStateIds: ['preview_reference_available'],`
- L205: `primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_value_table', 'quote_preview_action_bar'],`
- L206: `secondaryComponentIds: ['quote_preview_evidence_panel', 'quote_preview_warning_stack'],`
- L207: `requiredBadges: ['preview', 'no_es_cotizacion', 'no_verificado'],`
- L211: `compositionId: 'quote_preview_human_review_screen',`
- L212: `screenName: 'QuotePreviewHumanReviewScreen',`
- L214: `supportedStateIds: ['ready_for_human_review'],`
- L217: `primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_value_table', 'quote_preview_human_review_card', 'quote_preview_action_bar'],`
- L218: `secondaryComponentIds: ['quote_preview_evidence_panel'],`
- L219: `requiredBadges: ['preview', 'no_es_cotizacion', 'requiere_revision_humana'],`
- L224: `function getSourceRefs() {`
- L225: `const uxCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();`
- L226: `const componentCatalog = components.getQuotePreviewSafeUxComponentContractRegistryCatalog();`
- L228: `safe_ux_state_model: {`
- L231: `overall_ux_state_status: uxCatalog.overall_ux_state_status,`
- L232: `state_count: uxCatalog.states.length,`
- L243: `function getQuotePreviewSafeScreenCompositionRegistryCatalog() {`
- L250: `registry_type: 'local_static_read_only_safe_screen_composition_registry',`
- L257: `write_allowed_in_registry: false,`
- L258: `quote_write_allowed_in_registry: false,`
- L259: `crm_write_allowed_in_registry: false,`
- L260: `policy_write_allowed_in_registry: false,`
- L261: `pipeline_write_allowed_in_registry: false,`
- L268: `source_refs: getSourceRefs(),`
- L279: `readModelStatus: 'error',`
- L283: `supported_state_ids: [],`
- L288: `required_badges: ['no_es_cotizacion'],`
- L295: `write_allowed: false,`
- L296: `safe_errors: [code, SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED, SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED],`
- L300: `message: 'Screen composition is not mapped. Screen rendering, quote truth, execution, and writes are blocked.',`
- L305: `function getScreenCompositionById(compositionId) {`
- L306: `const match = SCREEN_COMPOSITIONS.find((composition) => composition.composition_id === compositionId);`
- L310: `function getScreenCompositionByName(screenName) {`
- L311: `const match = SCREEN_COMPOSITIONS.find((composition) => composition.screen_name === screenName);`
- L315: `function getScreenCompositionsByStateId(stateId) {`
- L316: `return clone(SCREEN_COMPOSITIONS.filter((composition) => composition.supported_state_ids.includes(stateId)));`
- L319: `function getScreenCompositionsByLayoutMode(layoutMode) {`
- L323: `function getNonRenderingScreenCompositions() {`
- L327: `function getNonWritableScreenCompositions() {`
- L328: `return clone(SCREEN_COMPOSITIONS.filter((composition) => composition.write_allowed === false));`
- L331: `function getQuoteTruthBlockedScreenCompositions() {`
- L347: `if (composition.write_allowed !== false) errors.push('write_allowed_must_be_false');`
- L350: `if (!badges.includes('no_es_cotizacion')) errors.push('screen_composition_must_include_no_es_cotizacion_badge');`
- L375: `'write_allowed_in_registry',`
- L376: `'quote_write_allowed_in_registry',`
- L377: `'crm_write_allowed_in_registry',`
- L378: `'policy_write_allowed_in_registry',`
- L379: `'pipeline_write_allowed_in_registry',`
- L393: `const componentCatalog = components.getQuotePreviewSafeUxComponentContractRegistryCatalog();`
- L394: `const validComponentIds = new Set(componentCatalog.component_contracts.map((contract) => contract.component_id));`
- L395: `const stateCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();`
- L396: `const validStateIds = new Set(stateCatalog.states.map((state) => state.state_id));`
- L402: `for (const stateId of composition.supported_state_ids || []) {`
- L403: `if (!validStateIds.has(stateId)) errors.push('${composition.composition_id}:unknown_state_${stateId}');`
- L426: `getQuotePreviewSafeScreenCompositionRegistryCatalog,`
- L427: `getScreenCompositionById,`
- L428: `getScreenCompositionByName,`
- L429: `getScreenCompositionsByStateId,`
- L430: `getScreenCompositionsByLayoutMode,`
- L431: `getNonRenderingScreenCompositions,`
- L432: `getNonWritableScreenCompositions,`
- L433: `getQuoteTruthBlockedScreenCompositions,`

### `platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js`

- Score: `-10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getAllStateIds", "parameters": [], "form": "function"}, {"name": "getComponentContractById", "parameters": ["componentId"], "form": "function"}, {"name": "getComponentContractByName", "parameters": ["componentName"], "form": "function"}, {"name": "getComponentContractsByKind", "parameters": ["componentKind"], "form": "function"}, {"name": "getComponentContractsByStateId", "parameters": ["stateId"], "form": "function"}, {"name": "getNonRenderingComponentContracts", "parameters": [], "form": "function"}, {"name": "getNonWritableComponentContracts", "parameters": [], "form": "function"}, {"name": "getQuotePreviewSafeUxComponentContractRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getQuoteTruthBlockedComponentContracts", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `2`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const ux = require('./quote-preview-safe-ux-state-model-registry-adapter-086b.js');`
- L4: `const boundary = require('./quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');`
- L6: `const ADAPTER_ID = 'forge.quote_preview.safe_ux_component_contract.registry.adapter.v1';`
- L7: `const SCHEMA_VERSION = 'forge.quote_preview.safe_ux_component_contract.registry.v1';`
- L8: `const DOMAIN_ID = 'quote_preview_safe_ux_component_contract';`
- L9: `const MODE = 'read_only';`
- L17: `READ_ONLY_VALUE_TABLE_CONTRACT: 'read_only_value_table_contract',`
- L24: `COMPONENT_CONTRACT_NOT_MAPPED: 'QUOTE_PREVIEW_COMPONENT_CONTRACT_NOT_MAPPED',`
- L25: `COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_RENDERING_NOT_AUTHORIZED',`
- L26: `UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_UI_MUTATION_NOT_AUTHORIZED',`
- L27: `QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_QUOTE_TRUTH_NOT_AUTHORIZED',`
- L28: `WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_WRITE_NOT_AUTHORIZED',`
- L29: `EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_EXECUTION_NOT_AUTHORIZED',`
- L30: `PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_COMPONENT_PREVIEW_LABEL_REQUIRED',`
- L34: `crmWrite: false,`
- L35: `pipelineWrite: false,`
- L36: `policyWrite: false,`
- L37: `quoteWrite: false,`
- L44: `browserPersistence: false,`
- L49: `pdfRead: false,`
- L62: `'consumes_state_ids',`
- L70: `'write_allowed',`
- L79: `'write_quote',`
- L80: `'write_crm',`
- L81: `'write_policy',`
- L82: `'write_pipeline',`
- L88: `'read_pdf',`
- L98: `consumes_state_ids: Object.freeze([...(contract.consumes_state_ids || [])]),`
- L113: `consumesStateIds,`
- L117: `requiredBadges = ['preview', 'no_es_cotizacion'],`
- L124: `consumes_state_ids: consumesStateIds,`
- L132: `write_allowed: false,`
- L138: `SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,`
- L145: `function getAllStateIds() {`
- L146: `return ux.getQuotePreviewSafeUxStateModelRegistryCatalog().states.map((state) => state.state_id);`
- L149: `const allStateIds = getAllStateIds();`
- L153: `componentId: 'quote_preview_shell',`
- L154: `componentName: 'QuotePreviewShell',`
- L156: `responsibility: 'Owns read-only composition slots and passes safe UX state to children.',`
- L157: `consumesStateIds: allStateIds,`
- L158: `requiredProps: ['state_id', 'badges', 'safe_actions', 'blocked_actions'],`
- L159: `allowedActions: ['view_empty_state', 'view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review'],`
- L162: `componentId: 'quote_preview_status_card',`
- L163: `componentName: 'QuotePreviewStatusCard',`
- L165: `responsibility: 'Shows current state label, description, severity and required preview/not-quote badges.',`
- L166: `consumesStateIds: allStateIds,`
- L167: `requiredProps: ['display_label', 'description', 'state_kind', 'required_badges'],`
- L171: `componentId: 'quote_preview_evidence_panel',`
- L172: `componentName: 'QuotePreviewEvidencePanel',`
- L174: `responsibility: 'Shows evidence and provenance references without reading PDFs or executing parsers.',`
- L175: `consumesStateIds: ['pdf_candidate_detected', 'file_hash_not_verified', 'source_trace_not_bound', 'preview_reference_available', 'ready_for_human_review'],`
- L178: `blockedActions: ['read_pdf', 'run_parser', 'run_calculator', 'call_banxico', 'write_quote', 'issue_quote', 'send_quote'],`
- L181: `componentId: 'quote_preview_warning_stack',`
- L182: `componentName: 'QuotePreviewWarningStack',`
- L185: `consumesStateIds: ['file_hash_not_verified', 'source_trace_not_bound', 'parser_owner_decision_required', 'deterministic_inputs_not_verified', 'quote_truth_blocked'],`
- L190: `componentId: 'quote_preview_value_table',`
- L191: `componentName: 'QuotePreviewValueTable',`
- L192: `componentKind: COMPONENT_KINDS.READ_ONLY_VALUE_TABLE_CONTRACT,`
- L194: `consumesStateIds: ['preview_reference_available', 'ready_for_human_review', 'deterministic_inputs_not_verified', 'source_trace_not_bound'],`
- L199: `componentId: 'quote_preview_action_bar',`
- L200: `componentName: 'QuotePreviewActionBar',`
- L202: `responsibility: 'Exposes only safe read/review actions and blocks quote/provider/write actions.',`
- L203: `consumesStateIds: allStateIds,`
- L208: `componentId: 'quote_preview_human_review_card',`
- L209: `componentName: 'QuotePreviewHumanReviewCard',`
- L212: `consumesStateIds: ['ready_for_human_review', 'parser_owner_decision_required', 'quote_truth_blocked'],`
- L215: `requiredBadges: ['preview', 'no_es_cotizacion', 'requiere_revision_humana'],`
- L218: `componentId: 'quote_preview_badges_bar',`
- L219: `componentName: 'QuotePreviewBadgesBar',`
- L221: `responsibility: 'Shows preview/no-quote/no-verified badges required by state and boundary.',`
- L222: `consumesStateIds: allStateIds,`
- L228: `function getSourceRefs() {`
- L229: `const uxCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();`
- L230: `const boundaryCatalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();`
- L232: `safe_ux_state_model: {`
- L235: `overall_ux_state_status: uxCatalog.overall_ux_state_status,`
- L236: `state_count: uxCatalog.states.length,`
- L246: `function getQuotePreviewSafeUxComponentContractRegistryCatalog() {`
- L253: `registry_type: 'local_static_read_only_safe_ux_component_contract_registry',`
- L259: `write_allowed_in_registry: false,`
- L260: `quote_write_allowed_in_registry: false,`
- L261: `crm_write_allowed_in_registry: false,`
- L262: `policy_write_allowed_in_registry: false,`
- L263: `pipeline_write_allowed_in_registry: false,`
- L269: `source_refs: getSourceRefs(),`
- L280: `readModelStatus: 'error',`
- L285: `consumes_state_ids: [],`
- L293: `write_allowed: false,`
- L294: `required_badges: ['no_es_cotizacion'],`
- L295: `safe_errors: [code, SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED, SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED],`
- L299: `message: 'Component contract is not mapped. Rendering, quote truth, execution, and writes are blocked.',`
- L304: `function getComponentContractById(componentId) {`
- L305: `const match = COMPONENT_CONTRACTS.find((contract) => contract.component_id === componentId);`
- L309: `function getComponentContractByName(componentName) {`
- L310: `const match = COMPONENT_CONTRACTS.find((contract) => contract.component_name === componentName);`
- L314: `function getComponentContractsByKind(componentKind) {`
- L318: `function getComponentContractsByStateId(stateId) {`
- L319: `return clone(COMPONENT_CONTRACTS.filter((contract) => contract.consumes_state_ids.includes(stateId)));`
- L322: `function getNonRenderingComponentContracts() {`
- L326: `function getNonWritableComponentContracts() {`
- L327: `return clone(COMPONENT_CONTRACTS.filter((contract) => contract.write_allowed === false));`
- L330: `function getQuoteTruthBlockedComponentContracts() {`
- L346: `if (contract.write_allowed !== false) errors.push('write_allowed_must_be_false');`
- L349: `if (!badges.includes('no_es_cotizacion')) errors.push('component_contract_must_include_no_es_cotizacion_badge');`
- L373: `'write_allowed_in_registry',`
- L374: `'quote_write_allowed_in_registry',`
- L375: `'crm_write_allowed_in_registry',`
- L376: `'policy_write_allowed_in_registry',`
- L377: `'pipeline_write_allowed_in_registry',`
- L410: `getQuotePreviewSafeUxComponentContractRegistryCatalog,`
- L411: `getComponentContractById,`
- L412: `getComponentContractByName,`
- L413: `getComponentContractsByKind,`
- L414: `getComponentContractsByStateId,`
- L415: `getNonRenderingComponentContracts,`
- L416: `getNonWritableComponentContracts,`
- L417: `getQuoteTruthBlockedComponentContracts,`

### `platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js`

- Score: `-10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getExecutableSafeUxStates", "parameters": [], "form": "function"}, {"name": "getPreviewReferenceAllowedSafeUxStates", "parameters": [], "form": "function"}, {"name": "getQuotePreviewSafeUxStateModelRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getQuoteTruthBlockedSafeUxStates", "parameters": [], "form": "function"}, {"name": "getSafeUxStateById", "parameters": ["stateId"], "form": "function"}, {"name": "getSafeUxStatesByKind", "parameters": ["stateKind"], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}, {"name": "getVisibleSafeUxStates", "parameters": [], "form": "function"}, {"name": "getWritableSafeUxStates", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');`
- L4: `const boundary = require('./quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');`
- L6: `const ADAPTER_ID = 'forge.quote_preview.safe_ux_state_model.registry.adapter.v1';`
- L7: `const SCHEMA_VERSION = 'forge.quote_preview.safe_ux_state_model.registry.v1';`
- L8: `const DOMAIN_ID = 'quote_preview_safe_ux_state_model';`
- L9: `const MODE = 'read_only';`
- L12: `const STATE_KINDS = Object.freeze({`
- L17: `PREVIEW_READY: 'preview_ready',`
- L22: `VIEW_EMPTY_STATE: 'view_empty_state',`
- L33: `WRITE_QUOTE: 'write_quote',`
- L34: `WRITE_CRM: 'write_crm',`
- L35: `WRITE_POLICY: 'write_policy',`
- L36: `WRITE_PIPELINE: 'write_pipeline',`
- L42: `READ_PDF: 'read_pdf',`
- L47: `NO_ES_COTIZACION: 'no_es_cotizacion',`
- L52: `INPUTS_NO_VERIFICADOS: 'inputs_no_verificados',`
- L58: `UX_STATE_NOT_MAPPED: 'QUOTE_PREVIEW_UX_STATE_NOT_MAPPED',`
- L59: `QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_UX_QUOTE_TRUTH_NOT_AUTHORIZED',`
- L60: `WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_UX_WRITE_NOT_AUTHORIZED',`
- L61: `EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_UX_EXECUTION_NOT_AUTHORIZED',`
- L62: `PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_UX_PREVIEW_LABEL_REQUIRED',`
- L63: `HUMAN_REVIEW_REQUIRED: 'QUOTE_PREVIEW_UX_HUMAN_REVIEW_REQUIRED',`
- L64: `SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_UX_SOURCE_TRACE_NOT_BOUND',`
- L65: `FILE_HASH_NOT_VERIFIED: 'QUOTE_PREVIEW_UX_FILE_HASH_NOT_VERIFIED',`
- L69: `crmWrite: false,`
- L70: `pipelineWrite: false,`
- L71: `policyWrite: false,`
- L72: `quoteWrite: false,`
- L79: `browserPersistence: false,`
- L84: `pdfRead: false,`
- L92: `const REQUIRED_UX_STATE_FIELDS = Object.freeze([`
- L93: `'state_id',`
- L94: `'state_kind',`
- L101: `'write_allowed',`
- L111: `function freezeState(state) {`
- L113: `...state,`
- L114: `allowed_actions: Object.freeze([...(state.allowed_actions || [])]),`
- L115: `blocked_actions: Object.freeze([...(state.blocked_actions || [])]),`
- L116: `required_badges: Object.freeze([...(state.required_badges || [])]),`
- L117: `safe_errors: Object.freeze([...(state.safe_errors || [])]),`
- L118: `safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(state.safety_flags || {}) }),`
- L122: `function makeState({`
- L123: `stateId,`
- L124: `stateKind,`
- L132: `return freezeState({`
- L133: `state_id: stateId,`
- L134: `state_kind: stateKind,`
- L141: `write_allowed: false,`
- L147: `SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,`
- L154: `const SAFE_UX_STATES = Object.freeze([`
- L155: `makeState({`
- L156: `stateId: 'empty',`
- L157: `stateKind: STATE_KINDS.NEUTRAL,`
- L161: `allowedActions: [SAFE_ACTIONS.VIEW_EMPTY_STATE],`
- L165: `makeState({`
- L166: `stateId: 'pdf_candidate_detected',`
- L167: `stateKind: STATE_KINDS.INFORMATIONAL,`
- L172: `requiredBadges: [BADGES.PREVIEW, BADGES.NO_VERIFICADO, BADGES.NO_ES_COTIZACION],`
- L175: `makeState({`
- L176: `stateId: 'file_hash_not_verified',`
- L177: `stateKind: STATE_KINDS.WARNING,`
- L182: `requiredBadges: [BADGES.PREVIEW, BADGES.ARCHIVO_NO_VERIFICADO, BADGES.NO_ES_COTIZACION],`
- L185: `makeState({`
- L186: `stateId: 'source_trace_not_bound',`
- L187: `stateKind: STATE_KINDS.WARNING,`
- L189: `description: 'Los valores esperados o inputs no tienen source trace bound. No pueden tratarse como verdad.',`
- L192: `requiredBadges: [BADGES.PREVIEW, BADGES.SIN_SOURCE_TRACE, BADGES.NO_ES_COTIZACION],`
- L195: `makeState({`
- L196: `stateId: 'parser_owner_decision_required',`
- L197: `stateKind: STATE_KINDS.BLOCKED,`
- L202: `requiredBadges: [BADGES.PREVIEW, BADGES.PARSER_BLOQUEADO, BADGES.NO_ES_COTIZACION],`
- L205: `makeState({`
- L206: `stateId: 'deterministic_inputs_not_verified',`
- L207: `stateKind: STATE_KINDS.WARNING,`
- L208: `displayLabel: 'Inputs determinísticos no verificados',`
- L209: `description: 'Inputs como UDI, crecimiento, horizonte o fórmula no están verificados. No hay cálculo autorizado.',`
- L212: `requiredBadges: [BADGES.PREVIEW, BADGES.INPUTS_NO_VERIFICADOS, BADGES.NO_ES_COTIZACION],`
- L215: `makeState({`
- L216: `stateId: 'preview_reference_available',`
- L217: `stateKind: STATE_KINDS.PREVIEW_READY,`
- L219: `description: 'Puede mostrarse un preview de referencia con etiquetas de no cotización y no verificado.',`
- L222: `requiredBadges: [BADGES.PREVIEW, BADGES.NO_ES_COTIZACION, BADGES.NO_VERIFICADO],`
- L225: `makeState({`
- L226: `stateId: 'quote_truth_blocked',`
- L227: `stateKind: STATE_KINDS.BLOCKED,`
- L228: `displayLabel: 'Cotización real bloqueada',`
- L229: `description: 'La cotización real está bloqueada hasta que existan gates de provider/backend autorizados.',`
- L232: `requiredBadges: [BADGES.NO_ES_COTIZACION, BADGES.QUOTE_TRUTH_BLOQUEADO],`
- L235: `makeState({`
- L236: `stateId: 'ready_for_human_review',`
- L237: `stateKind: STATE_KINDS.HUMAN_REVIEW,`
- L239: `description: 'El preview puede revisarse por humano, pero no puede convertirse en cotización real ni escribirse.',`
- L242: `requiredBadges: [BADGES.PREVIEW, BADGES.REQUIERE_REVISION_HUMANA, BADGES.NO_ES_COTIZACION],`
- L251: `function getSourceRefs() {`
- L252: `const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();`
- L253: `const boundaryCatalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();`
- L255: `readiness: {`
- L256: `adapter_id: readinessCatalog.adapter_id,`
- L257: `schemaVersion: readinessCatalog.schemaVersion,`
- L258: `overall_readiness: readinessCatalog.overall_readiness,`
- L268: `function getQuotePreviewSafeUxStateModelRegistryCatalog() {`
- L275: `registry_type: 'local_static_read_only_safe_ux_state_model_registry',`
- L276: `overall_ux_state_status: 'safe_state_model_mapped_no_effects',`
- L281: `quote_write_allowed_in_registry: false,`
- L282: `crm_write_allowed_in_registry: false,`
- L283: `policy_write_allowed_in_registry: false,`
- L284: `pipeline_write_allowed_in_registry: false,`
- L290: `required_ux_state_fields: [...REQUIRED_UX_STATE_FIELDS],`
- L296: `source_refs: getSourceRefs(),`
- L297: `states: clone(SAFE_UX_STATES),`
- L301: `function buildSafeUxStateModelSafeError(stateId, code = SAFE_ERROR_CODES.UX_STATE_NOT_MAPPED) {`
- L307: `readModelStatus: 'error',`
- L308: `state_id: stateId || null,`
- L309: `state_kind: STATE_KINDS.BLOCKED,`
- L316: `write_allowed: false,`
- L319: `required_badges: [BADGES.NO_ES_COTIZACION, BADGES.QUOTE_TRUTH_BLOQUEADO],`
- L320: `safe_errors: [code, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED, SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED],`
- L324: `message: 'Safe UX state is not mapped. Quote truth, execution, and writes are blocked.',`
- L329: `function getSafeUxStateById(stateId) {`
- L330: `const match = SAFE_UX_STATES.find((state) => state.state_id === stateId);`
- L331: `return match ? clone(match) : buildSafeUxStateModelSafeError(stateId);`
- L334: `function getSafeUxStatesByKind(stateKind) {`
- L335: `return clone(SAFE_UX_STATES.filter((state) => state.state_kind === stateKind));`
- L338: `function getVisibleSafeUxStates() {`
- L339: `return clone(SAFE_UX_STATES.filter((state) => state.visible_allowed === true));`
- L342: `function getPreviewReferenceAllowedSafeUxStates() {`
- L343: `return clone(SAFE_UX_STATES.filter((state) => state.preview_reference_allowed === true));`
- L346: `function getQuoteTruthBlockedSafeUxStates() {`
- L347: `return clone(SAFE_UX_STATES.filter((state) => state.quote_truth_allowed === false));`
- L350: `function getExecutableSafeUxStates() {`
- L351: `return clone(SAFE_UX_STATES.filter((state) => state.execution_allowed === true));`
- L354: `function getWritableSafeUxStates() {`
- L355: `return clone(SAFE_UX_STATES.filter((state) => state.write_allowed === true));`
- L358: `function validateSafeUxStateShape(state) {`
- L360: `if (!state || typeof state !== 'object') return { ok: false, valid: false, errors: ['ux_state_object_required'] };`
- L362: `for (const field of REQUIRED_UX_STATE_FIELDS) {`
- L363: `if (!(field in state)) errors.push('missing_${field}');`
- L366: `if (state.quote_truth_allowed !== false) errors.push('quote_truth_allowed_must_be_false');`
- L367: `if (state.execution_allowed !== false) errors.push('execution_allowed_must_be_false');`
- L368: `if (state.write_allowed !== false) errors.push('write_allowed_must_be_false');`

### `platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js`

- Score: `-10`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "getNonMutableVisualLayoutSpecs", "parameters": [], "form": "function"}, {"name": "getNonRenderingVisualLayoutSpecs", "parameters": [], "form": "function"}, {"name": "getQuotePreviewSafeVisualLayoutSpecRegistryCatalog", "parameters": [], "form": "function"}, {"name": "getQuoteTruthBlockedVisualLayoutSpecs", "parameters": [], "form": "function"}, {"name": "getSourceRefs", "parameters": [], "form": "function"}, {"name": "getVisualLayoutSpecById", "parameters": ["layoutSpecId"], "form": "function"}, {"name": "getVisualLayoutSpecsByLayoutMode", "parameters": ["layoutMode"], "form": "function"}, {"name": "getVisualLayoutSpecsByViewportClass", "parameters": ["viewportClass"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `1`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L3: `const screens = require('./quote-preview-safe-screen-composition-registry-adapter-088b.js');`
- L5: `const ADAPTER_ID = 'forge.quote_preview.safe_visual_layout_spec.registry.adapter.v1';`
- L6: `const SCHEMA_VERSION = 'forge.quote_preview.safe_visual_layout_spec.registry.v1';`
- L7: `const DOMAIN_ID = 'quote_preview_safe_visual_layout_spec';`
- L8: `const MODE = 'read_only';`
- L24: `VISUAL_LAYOUT_SPEC_NOT_MAPPED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_SPEC_NOT_MAPPED',`
- L25: `SCREEN_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_SCREEN_RENDERING_NOT_AUTHORIZED',`
- L26: `COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_COMPONENT_RENDERING_NOT_AUTHORIZED',`
- L27: `UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_UI_MUTATION_NOT_AUTHORIZED',`
- L28: `CSS_INJECTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_CSS_INJECTION_NOT_AUTHORIZED',`
- L29: `DOM_WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_DOM_WRITE_NOT_AUTHORIZED',`
- L30: `QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_QUOTE_TRUTH_NOT_AUTHORIZED',`
- L31: `WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_WRITE_NOT_AUTHORIZED',`
- L32: `PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_PREVIEW_LABEL_REQUIRED',`
- L56: `'docs/design/forge-ui/FORGE_MOBILE_NAVIGATION_AND_SMART_WIDGET_PATTERN_057C.md',`
- L57: `'docs/design/forge-ui/FORGE_MOBILE_WIDGET_GRID_SYSTEM_057I.md',`
- L62: `'docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_DECISION_LOCK_086D.md',`
- L63: `'docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_DECISION_LOCK_087D.md',`
- L64: `'docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_DECISION_LOCK_088D.md',`
- L69: `desktop_metrics_treatment: 'compact_kpi_strip_cards_not_decorative_widget_grid',`
- L72: `mobile_navigation_treatment: 'persistent_bottom_nav_with_gold_active_state',`
- L74: `safety_copy_treatment: 'preview_read_only_human_review_no_quote_no_send_no_crm_no_calendar',`
- L79: `crmWrite: false,`
- L80: `pipelineWrite: false,`
- L81: `policyWrite: false,`
- L82: `quoteWrite: false,`
- L89: `browserPersistence: false,`
- L94: `pdfRead: false,`
- L120: `'dom_write_allowed',`
- L123: `'write_allowed',`
- L152: `safetyBadgeTreatment,`
- L166: `safety_badge_treatment: safetyBadgeTreatment,`
- L174: `dom_write_allowed: false,`
- L177: `write_allowed: false,`
- L183: `SAFE_ERROR_CODES.DOM_WRITE_NOT_AUTHORIZED,`
- L185: `SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,`
- L195: `borders: 'thin_blue_gray_borders_with_gold_focus_state',`
- L198: `safety_labels: 'muted_cyan_preview_read_only_no_quote_pills_always_visible',`
- L208: `intendedScreenRefs: ['QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],`
- L211: `visualHierarchy: ['breadcrumb', 'page_title', 'approval_pill', 'command_bar', 'compact_alfred_decision_strip', 'compact_kpi_strip', 'priority_table'],`
- L214: `safetyBadgeTreatment: 'muted_cyan_pill_with_shield',`
- L222: `intendedScreenRefs: ['QuotePreviewIntakeScreen', 'QuotePreviewReferenceScreen'],`
- L228: `safetyBadgeTreatment: 'muted_cyan_pill_with_shield',`
- L236: `intendedScreenRefs: ['QuotePreviewEmptyScreen', 'QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],`
- L240: `cardDensity: 'compact_but_readable',`
- L242: `safetyBadgeTreatment: 'muted_cyan_pill_with_shield',`
- L248: `function getSourceRefs() {`
- L249: `const screenCatalog = screens.getQuotePreviewSafeScreenCompositionRegistryCatalog();`
- L260: `function getQuotePreviewSafeVisualLayoutSpecRegistryCatalog() {`
- L267: `registry_type: 'local_static_read_only_safe_visual_layout_spec_registry',`
- L274: `dom_write_allowed_in_registry: false,`
- L277: `write_allowed_in_registry: false,`
- L278: `quote_write_allowed_in_registry: false,`
- L279: `crm_write_allowed_in_registry: false,`
- L280: `policy_write_allowed_in_registry: false,`
- L281: `pipeline_write_allowed_in_registry: false,`
- L289: `source_refs: getSourceRefs(),`
- L305: `readModelStatus: 'error',`
- L323: `dom_write_allowed: false,`
- L326: `write_allowed: false,`
- L331: `message: 'Visual layout spec is not mapped. Rendering, UI mutation, quote truth, execution, and writes are blocked.',`
- L336: `function getVisualLayoutSpecById(layoutSpecId) {`
- L337: `const match = VISUAL_LAYOUT_SPECS.find((spec) => spec.layout_spec_id === layoutSpecId);`
- L341: `function getVisualLayoutSpecsByViewportClass(viewportClass) {`
- L345: `function getVisualLayoutSpecsByLayoutMode(layoutMode) {`
- L349: `function getNonRenderingVisualLayoutSpecs() {`
- L353: `function getNonMutableVisualLayoutSpecs() {`
- L354: `return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.ui_mutation_allowed === false && spec.css_injection_allowed === false && spec.dom_write_allowed === false));`
- L357: `function getQuoteTruthBlockedVisualLayoutSpecs() {`
- L369: `for (const flagName of ['render_allowed', 'screen_render_allowed', 'component_render_allowed', 'ui_mutation_allowed', 'css_injection_allowed', 'dom_write_allowed', 'quote_truth_allowed', 'execution_allowed', 'write_allowed']) {`
- L400: `'dom_write_allowed_in_registry',`
- L403: `'write_allowed_in_registry',`
- L404: `'quote_write_allowed_in_registry',`
- L405: `'crm_write_allowed_in_registry',`
- L406: `'policy_write_allowed_in_registry',`
- L407: `'pipeline_write_allowed_in_registry',`
- L421: `const screenCatalog = screens.getQuotePreviewSafeScreenCompositionRegistryCatalog();`
- L422: `const validScreenNames = new Set(screenCatalog.screen_compositions.map((composition) => composition.screen_name));`
- L454: `getQuotePreviewSafeVisualLayoutSpecRegistryCatalog,`
- L455: `getVisualLayoutSpecById,`
- L456: `getVisualLayoutSpecsByViewportClass,`
- L457: `getVisualLayoutSpecsByLayoutMode,`
- L458: `getNonRenderingVisualLayoutSpecs,`
- L459: `getNonMutableVisualLayoutSpecs,`
- L460: `getQuoteTruthBlockedVisualLayoutSpecs,`

### `forge-gmm-sprint-3-smoke-test.js`

- Score: `-11`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L9: `Fecha en que se elaboro la cotizacion: 05 de junio de 2026`
- L24: `Esta cotizacion es ilustrativa y no forma parte del contrato de seguro.`
- L95: `test('Case snapshot generated', () => {`
- L96: `assert(Boolean(advisorReview.caseSnapshot), 'Case snapshot missing.');`
- L97: `assert(advisorReview.caseSnapshot.identityMatch === 'DIFFERENT_INSURED', 'Identity snapshot mismatch.');`
- L98: `assert(advisorReview.caseSnapshot.status === 'REVIEW REQUIRED', 'Review status mismatch.');`

### `forge-gmm-sprint-4-smoke-test.js`

- Score: `-11`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L10: `Fecha en que se elaboro la cotizacion: 05 de junio de 2026`
- L25: `Esta cotizacion es ilustrativa y no forma parte del contrato de seguro.`
- L104: `test('Client snapshot generated', () => {`
- L105: `assert(Boolean(clientReview.clientSnapshot), 'Client snapshot missing.');`
- L106: `assert(clientReview.clientSnapshot.product === 'Alfa Medical', 'Client product mismatch.');`

### `orvi-client-report-test.js`

- Score: `-11`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L2: `const { buildGuaranteedValueTimeline, getMilestone } = require("./orvi-guaranteed-value-timeline-engine");`
- L4: `const { getCachedRates } = require("./exchange-rate-cache-engine");`
- L10: `process.argv[2] || "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF";`
- L35: `const cache = await getCachedRates();`
- L36: `const currentUdi = cache.rates.UDI_MXN.value;`
- L44: `const year20 = decorate(getMilestone(timelineMXN, 20));`
- L45: `const year25 = decorate(getMilestone(timelineMXN, 25));`
- L46: `const year30 = decorate(getMilestone(timelineMXN, 30));`
- L47: `const year71 = decorate(getMilestone(timelineMXN, 71));`
- L105: `console.log("Los valores futuros en MXN son estimaciones. La cotización está expresada en UDI y el monto real dependerá del valor de la UDI vigente.");`

### `segu-beca-meaningful-numbers-report.js`

- Score: `-11`
- Quote/PDF relevance: `true`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L2: `getCachedRates`
- L3: `} = require("./exchange-rate-cache-engine");`
- L6: `getProjectionScenario`
- L23: `const cache = await getCachedRates();`
- L24: `const currentUdi = cache.rates.UDI_MXN.value;`
- L26: `const scenario = getProjectionScenario({`
- L35: `targetYears: [1, 7, 14]`
- L47: `console.log('Prima anual en cotización: 2,855.36 UDI');`
- L57: `console.log("Estos valores en pesos son estimaciones. La cotización está expresada en UDI; el monto real en MXN dependerá del valor de la UDI en cada fecha de pago.");`

### `semantic-extract-acceptance-test.js`

- Score: `-12`
- Quote/PDF relevance: `true`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `1`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L27: `// slightly differently if we haven't synced getNormalizedAction perfectly yet,`
- L32: `// Note: resolveRelativeMonthReference might change candidate.due to a month name`
- L44: `input: "Pidio 9 cotizaciones para julio",`
- L48: `cand.action === "preparar/enviar 9 cotizaciones" &&`
- L56: `input: "Pidio 6 cotizaciones para el martes",`
- L60: `cand.action === "preparar/enviar 6 cotizaciones" &&`
- L70: `input: "Llamar el próximo año",`
- L84: `input: "Seguimiento dentro de 2 meses",`
- L100: `input: "Llamar en 2 o 3 semanas",`
- L112: `name: "Quantity Range / Future Discovery (2 o 3 cotizaciones)",`
- L113: `input: "Pidio 2 o 3 cotizaciones",`
- L117: `cand.action.includes("2 o 3 cotizaciones") &&`
- L125: `input: "Holi",`
- L135: `input: "Lo va a pensar",`
- L147: `input: "Pidio cotizacion para agosto o septiembre",`
- L158: `input: "Llamar fin de mes o el que sigue",`
- L168: `input: "Reunion entre agosto y septiembre",`
- L188: `process.stdout.write('Testing: ${tc.name} ... ');`
- L196: `body: JSON.stringify({ note: tc.input })`

### `imagina-ser-master-test.js`

- Score: `-13`
- Quote/PDF relevance: `false`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[{"name": "resolveCurrencyMetadata", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L9: `const { getCachedRates } = require("./exchange-rate-cache-engine");`
- L13: `async function resolveCurrencyMetadata() {`
- L15: `const cache = await getCachedRates();`
- L16: `const udi = cache?.rates?.UDI_MXN;`
- L26: `cacheStatus: cache?.cacheStatus || null`
- L35: `sourceMode: cache.cacheStatus === "CACHE_HIT" ? "CACHE" : "LIVE",`
- L36: `cacheStatus: cache.cacheStatus`
- L45: `cacheStatus: null,`
- L52: `process.argv[2] || "/storage/emulated/0/Download/IS.PDF";`
- L55: `process.argv[3] || "/storage/emulated/0/Download/Solucionline_20260601_21_10.PDF";`
- L62: `const currencyMetadata = await resolveCurrencyMetadata();`

### `imagina-ser-banxico-integration-test.js`

- Score: `-16`
- Quote/PDF relevance: `false`
- Cache/state relevance: `true`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain", "test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L1: `const { readCache } = require("./exchange-rate-cache-engine");`
- L17: `getVerifiedUdiRateMetadata`
- L20: `const cache = readCache();`
- L22: `assert(cache, "Expected forge-rate-cache.json to exist");`
- L23: `assert(cache.rates?.UDI_MXN?.value > 0, "Expected cached UDI rate");`
- L25: `const currencyMetadata = await getVerifiedUdiRateMetadata({`
- L27: `...cache,`
- L28: `cacheStatus: "CACHE_HIT"`
- L92: `name: "UDI retrieved from cache",`
- L95: `currencyMetadata.sourceMode === "CACHE" &&`
- L96: `currencyMetadata.currentUdiValue === cache.rates.UDI_MXN.value`
- L99: `name: "Imagina Ser consumes cached UDI",`
- L101: `retirementScenario.status === "READY" &&`
- L102: `retirementScenario.currentUdiValue === cache.rates.UDI_MXN.value`
- L107: `retirementScenario.currentUdiValue === cache.rates.UDI_MXN.value &&`
- L120: `presentation.currencyMetadata.sourceDate === cache.rates.UDI_MXN.date &&`
- L121: `presentation.currencyMetadata.sourceMode === "CACHE"`
- L133: `console.log('Cached UDI: ${currencyMetadata.currentUdiValue}');`

### `product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js`

- Score: `-17`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "getRateForYear", "parameters": ["year"], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L24: `function getRateForYear(year) {`
- L46: `const projectedRateToMXN = getRateForYear(year);`

### `shared-banxico-edge-provider.js`

- Score: `-17`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "getCurrentRatesFromSupabaseEdge", "parameters": ["{ fetchImpl = globalThis.fetch } = {}"], "form": "function"}, {"name": "getSupabaseAnonKey", "parameters": [], "form": "function"}, {"name": "getSupabaseBanxicoRatesUrl", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L1: `function getSupabaseBanxicoRatesUrl() {`
- L5: `function getSupabaseAnonKey() {`
- L15: `function normalizeSupabaseBanxicoRatesResponse(payload) {`
- L16: `if (!payload || payload.ok !== true) {`
- L20: `const udi = payload?.rates?.UDI_MXN;`
- L21: `const usdFix = payload?.rates?.USD_MXN_FIX;`
- L43: `async function getCurrentRatesFromSupabaseEdge({ fetchImpl = globalThis.fetch } = {}) {`
- L44: `const url = getSupabaseBanxicoRatesUrl();`
- L54: `const anonKey = getSupabaseAnonKey();`
- L66: `method: "GET",`
- L72: `let payload;`
- L74: `payload = JSON.parse(text);`
- L79: `if (!response.ok || payload?.ok === false) {`
- L80: `const errorMessage = payload?.error || 'Supabase Banxico Edge request failed with status ${response.status}';`
- L85: `return normalizeSupabaseBanxicoRatesResponse(payload);`
- L89: `getCurrentRatesFromSupabaseEdge,`

### `shared-banxico-rate-engine.js`

- Score: `-17`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[{"name": "getCurrentRates", "parameters": [], "form": "function"}, {"name": "getToken", "parameters": [], "form": "function"}]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["exchange_rate_or_banxico_domain"]`

Relevant lines:

- L23: `function getToken() {`
- L34: `const token = getToken();`
- L39: `method: "GET",`
- L46: `return new Promise((resolve, reject) => {`
- L57: `resolve({`
- L76: `async function getCurrentRates() {`
- L91: `getCurrentRates`

### `retirement-future-udi-projection-smoke-test.js`

- Score: `-18`
- Quote/PDF relevance: `false`
- Cache/state relevance: `false`
- Writer functions: `[]`
- Reader functions: `[]`
- Direct write calls: `0`
- Direct read calls: `0`
- Cache keys: `[]`
- Storage APIs: `[]`
- Events: `[]`
- Rejected reasons: `["test_fixture_registry_or_nonruntime_evidence"]`

Relevant lines:

- L7: `buildImaginaSerFutureMxnBridge`
- L8: `} = require("./imagina-ser-future-mxn-bridge");`
- L69: `targetAge: 23,`
- L80: `targetAge: 65,`
- L96: `targetAge: 65,`
- L109: `targetAge: 65,`
- L120: `const result = buildImaginaSerFutureMxnBridge({`
- L145: `const result = buildImaginaSerFutureMxnBridge({`
- L172: `targetAge: 65,`
- L187: `targetAge: 65,`
- L200: `targetAge: 65,`

## Accepted canonical cache

```json
null
```

## Bridge candidates

```json
[]
```

## HOLD reasons

- canonical PDF/Quote Preview cache implementation was not proven

## Safety flags

```text
NEW_ENGINE_CREATED=false
NEW_CACHE_CREATED=false
DUPLICATE_BRIDGE_CREATED=false
PDF_READ_EXECUTED=false
PARSER_EXECUTED=false
OCR_EXECUTED=false
SOURCE_UI_CHANGED=false
QUOTE_TRUTH_ALLOWED=false
```
