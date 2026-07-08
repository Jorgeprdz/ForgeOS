'use strict';

const ux = require('./quote-preview-safe-ux-state-model-registry-adapter-086b.js');
const boundary = require('./quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');

const ADAPTER_ID = 'forge.quote_preview.safe_ux_component_contract.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.safe_ux_component_contract.registry.v1';
const DOMAIN_ID = 'quote_preview_safe_ux_component_contract';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const COMPONENT_KINDS = Object.freeze({
  LAYOUT_CONTAINER_CONTRACT: 'layout_container_contract',
  STATUS_CARD_CONTRACT: 'status_card_contract',
  EVIDENCE_PANEL_CONTRACT: 'evidence_panel_contract',
  WARNING_STACK_CONTRACT: 'warning_stack_contract',
  READ_ONLY_VALUE_TABLE_CONTRACT: 'read_only_value_table_contract',
  SAFE_ACTION_CONTRACT: 'safe_action_contract',
  HUMAN_REVIEW_CONTRACT: 'human_review_contract',
  BADGE_CONTRACT: 'badge_contract',
});

const SAFE_ERROR_CODES = Object.freeze({
  COMPONENT_CONTRACT_NOT_MAPPED: 'QUOTE_PREVIEW_COMPONENT_CONTRACT_NOT_MAPPED',
  COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_RENDERING_NOT_AUTHORIZED',
  UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_UI_MUTATION_NOT_AUTHORIZED',
  QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_QUOTE_TRUTH_NOT_AUTHORIZED',
  WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_WRITE_NOT_AUTHORIZED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_EXECUTION_NOT_AUTHORIZED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_COMPONENT_PREVIEW_LABEL_REQUIRED',
});

const DEFAULT_SAFETY_FLAGS = Object.freeze({
  crmWrite: false,
  pipelineWrite: false,
  policyWrite: false,
  quoteWrite: false,
  taskCreate: false,
  calendarCreate: false,
  messageSend: false,
  authReal: false,
  providerRuntime: false,
  secretAccess: false,
  browserPersistence: false,
  realEngineExecution: false,
  realEffectsAllowed: false,
  realEffectsEnabled: false,
  backendConnection: false,
  pdfRead: false,
  ocrExecution: false,
  parserExecution: false,
  calculatorExecution: false,
  banxicoCall: false,
  testExecution: false,
});

const REQUIRED_COMPONENT_CONTRACT_FIELDS = Object.freeze([
  'component_id',
  'component_name',
  'component_kind',
  'responsibility',
  'consumes_state_ids',
  'required_props',
  'allowed_actions',
  'blocked_actions',
  'render_allowed',
  'ui_mutation_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'write_allowed',
  'required_badges',
  'safe_errors',
  'safety_flags',
]);

const ALL_BLOCKED_ACTIONS = Object.freeze([
  'issue_quote',
  'send_quote',
  'write_quote',
  'write_crm',
  'write_policy',
  'write_pipeline',
  'connect_provider',
  'connect_backend',
  'run_parser',
  'run_calculator',
  'call_banxico',
  'read_pdf',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeContract(contract) {
  return Object.freeze({
    ...contract,
    consumes_state_ids: Object.freeze([...(contract.consumes_state_ids || [])]),
    required_props: Object.freeze([...(contract.required_props || [])]),
    allowed_actions: Object.freeze([...(contract.allowed_actions || [])]),
    blocked_actions: Object.freeze([...(contract.blocked_actions || [])]),
    required_badges: Object.freeze([...(contract.required_badges || [])]),
    safe_errors: Object.freeze([...(contract.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(contract.safety_flags || {}) }),
  });
}

function buildBaseContract({
  componentId,
  componentName,
  componentKind,
  responsibility,
  consumesStateIds,
  requiredProps,
  allowedActions,
  blockedActions = ALL_BLOCKED_ACTIONS,
  requiredBadges = ['preview', 'no_es_cotizacion'],
}) {
  return freezeContract({
    component_id: componentId,
    component_name: componentName,
    component_kind: componentKind,
    responsibility,
    consumes_state_ids: consumesStateIds,
    required_props: requiredProps,
    allowed_actions: allowedActions,
    blocked_actions: blockedActions,
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    required_badges: requiredBadges,
    safe_errors: [
      SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED,
    ],
  });
}

function getAllStateIds() {
  return ux.getQuotePreviewSafeUxStateModelRegistryCatalog().states.map((state) => state.state_id);
}

const allStateIds = getAllStateIds();

const COMPONENT_CONTRACTS = Object.freeze([
  buildBaseContract({
    componentId: 'quote_preview_shell',
    componentName: 'QuotePreviewShell',
    componentKind: COMPONENT_KINDS.LAYOUT_CONTAINER_CONTRACT,
    responsibility: 'Owns read-only composition slots and passes safe UX state to children.',
    consumesStateIds: allStateIds,
    requiredProps: ['state_id', 'badges', 'safe_actions', 'blocked_actions'],
    allowedActions: ['view_empty_state', 'view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_status_card',
    componentName: 'QuotePreviewStatusCard',
    componentKind: COMPONENT_KINDS.STATUS_CARD_CONTRACT,
    responsibility: 'Shows current state label, description, severity and required preview/not-quote badges.',
    consumesStateIds: allStateIds,
    requiredProps: ['display_label', 'description', 'state_kind', 'required_badges'],
    allowedActions: ['view_reference_preview'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_evidence_panel',
    componentName: 'QuotePreviewEvidencePanel',
    componentKind: COMPONENT_KINDS.EVIDENCE_PANEL_CONTRACT,
    responsibility: 'Shows evidence and provenance references without reading PDFs or executing parsers.',
    consumesStateIds: ['pdf_candidate_detected', 'file_hash_not_verified', 'source_trace_not_bound', 'preview_reference_available', 'ready_for_human_review'],
    requiredProps: ['evidence_refs', 'provenance_refs', 'source_trace_status', 'verification_status'],
    allowedActions: ['open_evidence_panel', 'open_provenance_panel'],
    blockedActions: ['read_pdf', 'run_parser', 'run_calculator', 'call_banxico', 'write_quote', 'issue_quote', 'send_quote'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_warning_stack',
    componentName: 'QuotePreviewWarningStack',
    componentKind: COMPONENT_KINDS.WARNING_STACK_CONTRACT,
    responsibility: 'Displays blocking and warning reasons in priority order.',
    consumesStateIds: ['file_hash_not_verified', 'source_trace_not_bound', 'parser_owner_decision_required', 'deterministic_inputs_not_verified', 'quote_truth_blocked'],
    requiredProps: ['safe_errors', 'blocked_actions', 'required_badges'],
    allowedActions: ['open_evidence_panel', 'open_provenance_panel'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_value_table',
    componentName: 'QuotePreviewValueTable',
    componentKind: COMPONENT_KINDS.READ_ONLY_VALUE_TABLE_CONTRACT,
    responsibility: 'Shows preview/reference values only when labeled as not verified and not quote.',
    consumesStateIds: ['preview_reference_available', 'ready_for_human_review', 'deterministic_inputs_not_verified', 'source_trace_not_bound'],
    requiredProps: ['rows', 'source_trace_status', 'verification_status', 'required_badges'],
    allowedActions: ['view_reference_preview', 'copy_preview_reference_summary'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_action_bar',
    componentName: 'QuotePreviewActionBar',
    componentKind: COMPONENT_KINDS.SAFE_ACTION_CONTRACT,
    responsibility: 'Exposes only safe read/review actions and blocks quote/provider/write actions.',
    consumesStateIds: allStateIds,
    requiredProps: ['allowed_actions', 'blocked_actions'],
    allowedActions: ['view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review', 'copy_preview_reference_summary'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_human_review_card',
    componentName: 'QuotePreviewHumanReviewCard',
    componentKind: COMPONENT_KINDS.HUMAN_REVIEW_CONTRACT,
    responsibility: 'Explains why human review is required and exposes review request as a non-effect action.',
    consumesStateIds: ['ready_for_human_review', 'parser_owner_decision_required', 'quote_truth_blocked'],
    requiredProps: ['review_reason', 'safe_errors', 'required_badges'],
    allowedActions: ['request_human_review', 'open_evidence_panel'],
    requiredBadges: ['preview', 'no_es_cotizacion', 'requiere_revision_humana'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_badges_bar',
    componentName: 'QuotePreviewBadgesBar',
    componentKind: COMPONENT_KINDS.BADGE_CONTRACT,
    responsibility: 'Shows preview/no-quote/no-verified badges required by state and boundary.',
    consumesStateIds: allStateIds,
    requiredProps: ['required_badges'],
    allowedActions: ['view_reference_preview'],
  }),
]);

function getSourceRefs() {
  const uxCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();
  const boundaryCatalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();
  return {
    safe_ux_state_model: {
      adapter_id: uxCatalog.adapter_id,
      schemaVersion: uxCatalog.schemaVersion,
      overall_ux_state_status: uxCatalog.overall_ux_state_status,
      state_count: uxCatalog.states.length,
    },
    preview_vs_quote_truth_boundary: {
      adapter_id: boundaryCatalog.adapter_id,
      schemaVersion: boundaryCatalog.schemaVersion,
      overall_boundary_status: boundaryCatalog.overall_boundary_status,
    },
  };
}

function getQuotePreviewSafeUxComponentContractRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_safe_ux_component_contract_registry',
    overall_component_contract_status: 'component_contracts_mapped_no_render_no_effects',
    component_rendering_allowed_in_registry: false,
    ui_mutation_allowed_in_registry: false,
    quote_truth_allowed_in_registry: false,
    execution_allowed_in_registry: false,
    write_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    policy_write_allowed_in_registry: false,
    pipeline_write_allowed_in_registry: false,
    provider_runtime_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    required_component_contract_fields: [...REQUIRED_COMPONENT_CONTRACT_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    component_contracts: clone(COMPONENT_CONTRACTS),
  };
}

function buildComponentContractSafeError(componentId, code = SAFE_ERROR_CODES.COMPONENT_CONTRACT_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    component_id: componentId || null,
    component_name: null,
    component_kind: null,
    responsibility: 'Unmapped component contract. No rendering or effects allowed.',
    consumes_state_ids: [],
    required_props: [],
    allowed_actions: [],
    blocked_actions: [...ALL_BLOCKED_ACTIONS],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    required_badges: ['no_es_cotizacion'],
    safe_errors: [code, SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED, SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Component contract is not mapped. Rendering, quote truth, execution, and writes are blocked.',
    },
  };
}

function getComponentContractById(componentId) {
  const match = COMPONENT_CONTRACTS.find((contract) => contract.component_id === componentId);
  return match ? clone(match) : buildComponentContractSafeError(componentId);
}

function getComponentContractByName(componentName) {
  const match = COMPONENT_CONTRACTS.find((contract) => contract.component_name === componentName);
  return match ? clone(match) : buildComponentContractSafeError(componentName);
}

function getComponentContractsByKind(componentKind) {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.component_kind === componentKind));
}

function getComponentContractsByStateId(stateId) {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.consumes_state_ids.includes(stateId)));
}

function getNonRenderingComponentContracts() {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.render_allowed === false));
}

function getNonWritableComponentContracts() {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.write_allowed === false));
}

function getQuoteTruthBlockedComponentContracts() {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.quote_truth_allowed === false));
}

function validateComponentContractShape(contract) {
  const errors = [];
  if (!contract || typeof contract !== 'object') return { ok: false, valid: false, errors: ['component_contract_object_required'] };

  for (const field of REQUIRED_COMPONENT_CONTRACT_FIELDS) {
    if (!(field in contract)) errors.push(`missing_${field}`);
  }

  if (contract.render_allowed !== false) errors.push('render_allowed_must_be_false');
  if (contract.ui_mutation_allowed !== false) errors.push('ui_mutation_allowed_must_be_false');
  if (contract.quote_truth_allowed !== false) errors.push('quote_truth_allowed_must_be_false');
  if (contract.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (contract.write_allowed !== false) errors.push('write_allowed_must_be_false');

  const badges = Array.isArray(contract.required_badges) ? contract.required_badges : [];
  if (!badges.includes('no_es_cotizacion')) errors.push('component_contract_must_include_no_es_cotizacion_badge');

  for (const [key, value] of Object.entries(contract.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateComponentContractRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_component_contract_status !== 'component_contracts_mapped_no_render_no_effects') errors.push('overall_component_contract_status_must_remain_no_effects');

  for (const flagName of [
    'component_rendering_allowed_in_registry',
    'ui_mutation_allowed_in_registry',
    'quote_truth_allowed_in_registry',
    'execution_allowed_in_registry',
    'write_allowed_in_registry',
    'quote_write_allowed_in_registry',
    'crm_write_allowed_in_registry',
    'policy_write_allowed_in_registry',
    'pipeline_write_allowed_in_registry',
    'provider_runtime_allowed_in_registry',
    'backend_connection_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const contracts = Array.isArray(catalog.component_contracts) ? catalog.component_contracts : [];
  if (contracts.length !== 8) errors.push('eight_component_contracts_required');

  for (const contract of contracts) {
    const result = validateComponentContractShape(contract);
    if (!result.ok) errors.push(...result.errors.map((error) => `${contract.component_id || 'unknown'}:${error}`));
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  COMPONENT_KINDS,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_COMPONENT_CONTRACT_FIELDS,
  COMPONENT_CONTRACTS,
  getQuotePreviewSafeUxComponentContractRegistryCatalog,
  getComponentContractById,
  getComponentContractByName,
  getComponentContractsByKind,
  getComponentContractsByStateId,
  getNonRenderingComponentContracts,
  getNonWritableComponentContracts,
  getQuoteTruthBlockedComponentContracts,
  buildComponentContractSafeError,
  validateComponentContractShape,
  validateComponentContractRegistryCatalog,
};
