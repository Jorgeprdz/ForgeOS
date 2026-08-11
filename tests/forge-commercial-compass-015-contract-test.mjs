import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const paths = Object.freeze({
  index: 'docs/static-preview/forge-aura/index.html',
  home: 'docs/static-preview/forge-aura/home/home-module-015.js',
  homeAdapter: 'docs/static-preview/forge-aura/home/home-adapter-pages-v3-015.js',
  consumer: 'docs/static-preview/forge-aura/home/commercial-compass-consumer-015.js',
  pipeline: 'docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-015.js',
  workspace: 'docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js',
  cartera: 'docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js',
  goalRepo: 'advisor-os/forge-alive/smart-widgets/advisor-monthly-policy-goal-repository.mjs',
  goalMigration: 'supabase/migrations/20260801000400_smart_widget_monthly_policy_goals.sql',
  incomeCore: 'docs/static-preview/forge-aura/income/income-core.js',
});

const files = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await read(path)])));
let assertions = 0;
function ok(condition, message) {
  assertions += 1;
  assert.ok(condition, message);
}
function includes(source, value, message = `expected source to include ${value}`) {
  assertions += 1;
  assert.ok(source.includes(value), message);
}
function excludes(source, value, message = `expected source to exclude ${value}`) {
  assertions += 1;
  assert.ok(!source.includes(value), message);
}

// Production entrypoint must resolve all 015 boundaries.
includes(files.index, './home/home-module-015.js?v=forge-commercial-compass-015', 'Home 015 must be the productive route');
includes(files.index, './home/home-adapter-pages-v3-015.js?v=forge-commercial-compass-015', 'Home adapter 015 must be productive');
includes(files.index, './home/commercial-compass-consumer-015.js?v=forge-commercial-compass-015', 'Forecast/Alfred consumer 015 must be productive');
includes(files.index, './recomposition/pipeline-consumer-bridge-015.js?v=forge-commercial-compass-015', 'Pipeline 015 must be productive');
includes(files.index, './cartera/cartera-module-v12-015.js?v=forge-commercial-compass-015', 'Cartera 015 must be productive');
excludes(files.index, 'pipeline-consumer-bridge-014.js', 'Pipeline 014 observer bridge must not remain in productive import map');
excludes(files.index, 'cartera-module-v11-014.js', 'Cartera 014 characterData observer wrapper must not remain in productive import map');

// Commercial Compass visible product contract.
includes(files.home, 'META_GAP_OPORTUNIDAD_ACCION');
includes(files.home, 'Para poder decirte cómo vas, primero necesito saber qué quieres lograr.');
includes(files.home, 'Definir mis metas');
includes(files.home, 'Omitir por ahora');
includes(files.home, 'Meta anual de pólizas calculada desde tu meta mensual. Puedes editarla cuando quieras.');
includes(files.home, 'Escenario, no ingreso confirmado. Pipeline se mantiene separado del ingreso estimado actual.');
includes(files.home, 'Ingreso estimado actual');
includes(files.home, 'Escenario con Pipeline');
includes(files.home, 'Meta del mes');
includes(files.home, 'Todavía no hay suficiente historial confirmado para mostrar el ingreso anual.');
includes(files.home, 'newMutationObservers: 0', 'Home 015 must not add a MutationObserver');
excludes(files.home, 'new MutationObserver', 'Home 015 must use direct/bounded rendering, not a new observer');
excludes(files.home, 'new Observer(', 'Home 015 must not instantiate an Observer alias');

// Goal authority must be reused, append-only and advisor scoped.
includes(files.homeAdapter, 'createAdvisorMonthlyPolicyGoalRepository');
includes(files.homeAdapter, 'HOME_MONTHLY_GOALS_V2:', 'Existing goal payload prefix must remain backward compatible');
includes(files.homeAdapter, 'targetMonthlyIncomeMxn');
includes(files.homeAdapter, 'targetAnnualIncomeMxn');
includes(files.homeAdapter, 'targetAnnualPolicyCount');
includes(files.homeAdapter, 'annualPolicyCountDerived');
includes(files.homeAdapter, 'goalRepository.append', 'Goals must write through the existing append-only authority');
excludes(files.homeAdapter, 'create table', 'Home adapter must not create a parallel goal table');
excludes(files.homeAdapter, 'forge_set_monthly_policy_goal(', 'Home adapter must not bypass the repository with a direct goal RPC');
includes(files.goalRepo, 'MONTHLY_GOAL_CROSS_ADVISOR_REQUEST_BLOCKED');
includes(files.goalRepo, 'forge_set_monthly_policy_goal');
includes(files.goalMigration, 'ADVISOR_MONTHLY_POLICY_GOAL_APPEND_ONLY');
includes(files.goalMigration, 'advisor_id = auth.uid()');
includes(files.goalMigration, 'created_by = advisor_id');

// Confirmed production only: policy version confirmation -> POLICY_SOLD_CONFIRMED.
includes(files.homeAdapter, "eventType: 'POLICY_SOLD_CONFIRMED'");
includes(files.homeAdapter, "from('canonical_policies')");
includes(files.homeAdapter, "from('policy_versions')");
includes(files.homeAdapter, 'confirmed_at');
includes(files.homeAdapter, "sourceOwner: 'PRODUCTION_EVENTS'");
includes(files.homeAdapter, 'policyId: policy.policy_reference');
excludes(files.homeAdapter, 'QUOTE_PRESENTED', 'Quotes must not count as production');
excludes(files.homeAdapter, 'APPLICATION_SUBMITTED', 'Applications must not count as production');
excludes(files.homeAdapter, 'processPdf(', 'Unconfirmed PDF intake must not count as production');

// Income and Pipeline separation must come from Compensation, not Home formulas.
includes(files.homeAdapter, 'createIncomeAdapter');
includes(files.homeAdapter, 'projectIncomeReadModel');
includes(files.homeAdapter, "source: 'COMPENSATION_INTELLIGENCE'");
includes(files.homeAdapter, 'monthlyEstimatedIncomeMxn');
includes(files.homeAdapter, 'monthlyPipelineScenarioMxn');
includes(files.homeAdapter, 'monthlyCombinedScenarioMxn');
includes(files.homeAdapter, 'confirmed: false');
includes(files.homeAdapter, 'pipelineIsConfirmedIncome: false');
includes(files.homeAdapter, 'confirmedIncomeIncludesPipeline: false');
excludes(files.homeAdapter, 'initial + renewal + bonus', 'Home must not reimplement compensation arithmetic');
includes(files.incomeCore, 'pipelineScenario', 'Income owner must keep Pipeline as a scenario');
includes(files.incomeCore, 'combinedScenario', 'Income owner must own combined scenario projection');

// CC-11/CC-13: Forecast activity and Alfred are read-only consumers of existing authorities.
includes(files.consumer, 'ForgeAdvisorForecastRuntimeAcceptance?.getReadModel?.()', 'Consumer must read the existing Advisor Forecast read model');
includes(files.consumer, 'ADVISOR_FORECAST_ACTIVITY_REQUIREMENT');
includes(files.consumer, 'Necesito más historial para estimar cuánta actividad necesitas.');
includes(files.consumer, 'requirement?.status === \'READY\'');
includes(files.consumer, 'COMMERCIAL_COMPASS_015_READ_ONLY');
includes(files.consumer, 'pipelineEconomic', 'Pipeline must only be intercepted for explicit economic questions');
includes(files.consumer, "if (pipelineEconomic) return 'PIPELINE';");
includes(files.consumer, "return null;", 'Non-commercial Alfred queries must fall through to Command OS');
includes(files.consumer, 'No se crea ninguna tarea sin tu confirmación.');
includes(files.consumer, 'mutationObservers: 0');
excludes(files.consumer, 'new MutationObserver', 'Consumer must not add observer loops');
excludes(files.consumer, '.from(', 'Consumer must not read domain tables directly');
excludes(files.consumer, '.rpc(', 'Consumer must not call domain RPCs directly');
excludes(files.consumer, 'functions.invoke', 'Commercial answers must not depend on a generative provider');

// WA must be bounded and expose all required human goals without observer loops.
excludes(files.pipeline, 'new MutationObserver', 'Phase 015 Pipeline bridge must not instantiate MutationObserver');
excludes(files.pipeline, 'new Observer(', 'Phase 015 Pipeline bridge must not instantiate an Observer alias');
includes(files.pipeline, 'bodyMutationObserver: false');
includes(files.pipeline, 'conversationMutationObserver: false');
includes(files.pipeline, 'boundedReconciliation: true');
for (const goal of [
  'first_contact',
  'follow_up',
  'reactivation',
  'collection',
  'application_signature',
  'appointment_confirmation',
  'reschedule',
  'after_call',
  'custom',
]) includes(files.pipeline, `${goal}:`, `Missing WA goal ${goal}`);
includes(files.pipeline, '¿Qué necesitas lograr con este mensaje?');
includes(files.pipeline, 'Aprobar este texto');
includes(files.pipeline, 'Abrir WhatsApp');
includes(files.pipeline, '<strong>Objeción</strong>');
includes(files.pipeline, '<strong>Qué podría estar pasando</strong>');
includes(files.pipeline, '<strong>Cómo abordarla</strong>');
includes(files.pipeline, '<strong>Siguiente movimiento</strong>');
includes(files.pipeline, 'Preparar mensaje');

// Exact human approval remains owned by the existing workspace.
includes(files.workspace, 'function invalidateApproval', 'Workspace must centralize approval invalidation');
includes(files.workspace, 'state.approval = null', 'Editing or regenerating must clear exact approval');
includes(files.workspace, 'openButton.disabled = true', 'Approval invalidation must disable WhatsApp');
includes(files.workspace, "addEventListener('input'", 'Draft editing must have an explicit input handler');
includes(files.workspace, "invalidateApproval(state, 'El texto cambió. Requiere una nueva aprobación exacta.')", 'Draft editing must invalidate exact approval');
includes(files.workspace, 'windowRef.open', 'WhatsApp opening remains an explicit browser action');

// PDF mobile reachability + wording + instrumentation.
excludes(files.cartera, 'new MutationObserver', 'Cartera 015 wrapper must not instantiate MutationObserver');
excludes(files.cartera, 'new Observer(', 'Cartera 015 wrapper must not instantiate an Observer alias');
includes(files.cartera, 'min-height:0!important');
includes(files.cartera, 'overflow-y:auto!important');
includes(files.cartera, 'position:sticky!important;bottom:0!important');
includes(files.cartera, 'Guardar póliza');
includes(files.cartera, 'No encontramos información suficiente sobre las coberturas.');
includes(files.cartera, 'Puedes revisarlas en el documento o agregarlas manualmente.');
includes(files.cartera, '__FORGE_015_PDF_PERF__');
for (const mark of ['T0Meaning','T1Meaning','T2Meaning','T3Meaning','T4Meaning','T5Meaning','T6Meaning','T7Meaning']) includes(files.cartera, mark, `Missing PDF performance mark ${mark}`);

// Human-facing 015 modules must not introduce raw diagnostics labels as visible copy.
const forbiddenVisiblePhrases = [
  'Policy Workspace',
  'Person Workspace',
  'Información técnica',
  'contextos convergen',
  'clasificación candidata',
  'intención candidata',
  'confianza candidata',
  'Generado por IA',
];
for (const phrase of forbiddenVisiblePhrases) {
  const quoted = new RegExp(`(['\"\x60])[^\\n]{0,180}${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]{0,180}\\1`, 'i');
  ok(!quoted.test(files.home), `Home 015 visibly leaks banned phrase: ${phrase}`);
}

console.log(`FORGE_COMMERCIAL_COMPASS_015_CONTRACT=PASS assertions=${assertions}`);