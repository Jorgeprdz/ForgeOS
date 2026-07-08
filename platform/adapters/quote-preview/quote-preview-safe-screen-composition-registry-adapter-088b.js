'use strict';

const ux = require('./quote-preview-safe-ux-state-model-registry-adapter-086b.js');
const components = require('./quote-preview-safe-ux-component-contract-registry-adapter-087b.js');

const ADAPTER_ID = 'forge.quote_preview.safe_screen_composition.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.safe_screen_composition.registry.v1';
const DOMAIN_ID = 'quote_preview_safe_screen_composition';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const COMPOSITION_KINDS = Object.freeze({
  EMPTY_STATE_SCREEN_COMPOSITION: 'empty_state_screen_composition',
  INTAKE_STATUS_SCREEN_COMPOSITION: 'intake_status_screen_composition',
  BLOCKED_WARNING_SCREEN_COMPOSITION: 'blocked_warning_screen_composition',
  REFERENCE_PREVIEW_SCREEN_COMPOSITION: 'reference_preview_screen_composition',
  HUMAN_REVIEW_SCREEN_COMPOSITION: 'human_review_screen_composition',
});

const LAYOUT_MODES = Object.freeze({
  DESKTOP_SINGLE_COLUMN: 'desktop_single_column',
  DESKTOP_TWO_COLUMN: 'desktop_two_column',
  TABLET_TWO_COLUMN: 'tablet_two_column',
  MOBILE_SINGLE_COLUMN: 'mobile_single_column',
});

const SAFE_ERROR_CODES = Object.freeze({
  SCREEN_COMPOSITION_NOT_MAPPED: 'QUOTE_PREVIEW_SCREEN_COMPOSITION_NOT_MAPPED',
  SCREEN_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_RENDERING_NOT_AUTHORIZED',
  COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_COMPONENT_RENDERING_NOT_AUTHORIZED',
  UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_UI_MUTATION_NOT_AUTHORIZED',
  QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_QUOTE_TRUTH_NOT_AUTHORIZED',
  WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_WRITE_NOT_AUTHORIZED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_SCREEN_EXECUTION_NOT_AUTHORIZED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_SCREEN_PREVIEW_LABEL_REQUIRED',
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

const REQUIRED_SCREEN_COMPOSITION_FIELDS = Object.freeze([
  'composition_id',
  'screen_name',
  'composition_kind',
  'supported_state_ids',
  'layout_mode_refs',
  'slot_order',
  'primary_component_ids',
  'secondary_component_ids',
  'required_badges',
  'allowed_actions',
  'blocked_actions',
  'render_allowed',
  'ui_mutation_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'write_allowed',
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

function freezeComposition(composition) {
  return Object.freeze({
    ...composition,
    supported_state_ids: Object.freeze([...(composition.supported_state_ids || [])]),
    layout_mode_refs: Object.freeze([...(composition.layout_mode_refs || [])]),
    slot_order: Object.freeze([...(composition.slot_order || [])]),
    primary_component_ids: Object.freeze([...(composition.primary_component_ids || [])]),
    secondary_component_ids: Object.freeze([...(composition.secondary_component_ids || [])]),
    required_badges: Object.freeze([...(composition.required_badges || [])]),
    allowed_actions: Object.freeze([...(composition.allowed_actions || [])]),
    blocked_actions: Object.freeze([...(composition.blocked_actions || [])]),
    safe_errors: Object.freeze([...(composition.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(composition.safety_flags || {}) }),
  });
}

function buildComposition({
  compositionId,
  screenName,
  compositionKind,
  supportedStateIds,
  layoutModeRefs,
  slotOrder,
  primaryComponentIds,
  secondaryComponentIds,
  requiredBadges,
  allowedActions,
  blockedActions = ALL_BLOCKED_ACTIONS,
}) {
  return freezeComposition({
    composition_id: compositionId,
    screen_name: screenName,
    composition_kind: compositionKind,
    supported_state_ids: supportedStateIds,
    layout_mode_refs: layoutModeRefs,
    slot_order: slotOrder,
    primary_component_ids: primaryComponentIds,
    secondary_component_ids: secondaryComponentIds,
    required_badges: requiredBadges,
    allowed_actions: allowedActions,
    blocked_actions: blockedActions,
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    safe_errors: [
      SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED,
    ],
  });
}

const SCREEN_COMPOSITIONS = Object.freeze([
  buildComposition({
    compositionId: 'quote_preview_empty_screen',
    screenName: 'QuotePreviewEmptyScreen',
    compositionKind: COMPOSITION_KINDS.EMPTY_STATE_SCREEN_COMPOSITION,
    supportedStateIds: ['empty'],
    layoutModeRefs: [LAYOUT_MODES.DESKTOP_SINGLE_COLUMN, LAYOUT_MODES.MOBILE_SINGLE_COLUMN],
    slotOrder: ['shell', 'status', 'badges', 'action_bar'],
    primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_action_bar'],
    secondaryComponentIds: [],
    requiredBadges: ['preview', 'no_es_cotizacion'],
    allowedActions: ['view_empty_state'],
  }),
  buildComposition({
    compositionId: 'quote_preview_intake_screen',
    screenName: 'QuotePreviewIntakeScreen',
    compositionKind: COMPOSITION_KINDS.INTAKE_STATUS_SCREEN_COMPOSITION,
    supportedStateIds: ['pdf_candidate_detected', 'file_hash_not_verified'],
    layoutModeRefs: [LAYOUT_MODES.DESKTOP_TWO_COLUMN, LAYOUT_MODES.TABLET_TWO_COLUMN, LAYOUT_MODES.MOBILE_SINGLE_COLUMN],
    slotOrder: ['shell', 'status', 'badges', 'warning_stack', 'evidence_panel', 'action_bar'],
    primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_warning_stack', 'quote_preview_action_bar'],
    secondaryComponentIds: ['quote_preview_evidence_panel'],
    requiredBadges: ['preview', 'no_es_cotizacion', 'no_verificado'],
    allowedActions: ['view_reference_preview', 'open_evidence_panel'],
    blockedActions: ['issue_quote', 'send_quote', 'write_quote', 'read_pdf', 'run_parser', 'connect_backend'],
  }),
  buildComposition({
    compositionId: 'quote_preview_blocked_screen',
    screenName: 'QuotePreviewBlockedScreen',
    compositionKind: COMPOSITION_KINDS.BLOCKED_WARNING_SCREEN_COMPOSITION,
    supportedStateIds: ['source_trace_not_bound', 'parser_owner_decision_required', 'deterministic_inputs_not_verified', 'quote_truth_blocked'],
    layoutModeRefs: [LAYOUT_MODES.DESKTOP_TWO_COLUMN, LAYOUT_MODES.MOBILE_SINGLE_COLUMN],
    slotOrder: ['shell', 'status', 'badges', 'warning_stack', 'evidence_panel', 'human_review_card', 'action_bar'],
    primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_warning_stack', 'quote_preview_human_review_card', 'quote_preview_action_bar'],
    secondaryComponentIds: ['quote_preview_evidence_panel'],
    requiredBadges: ['preview', 'no_es_cotizacion', 'quote_truth_bloqueado'],
    allowedActions: ['open_evidence_panel', 'open_provenance_panel', 'request_human_review'],
  }),
  buildComposition({
    compositionId: 'quote_preview_reference_screen',
    screenName: 'QuotePreviewReferenceScreen',
    compositionKind: COMPOSITION_KINDS.REFERENCE_PREVIEW_SCREEN_COMPOSITION,
    supportedStateIds: ['preview_reference_available'],
    layoutModeRefs: [LAYOUT_MODES.DESKTOP_TWO_COLUMN, LAYOUT_MODES.TABLET_TWO_COLUMN, LAYOUT_MODES.MOBILE_SINGLE_COLUMN],
    slotOrder: ['shell', 'status', 'badges', 'value_table', 'evidence_panel', 'warning_stack', 'action_bar'],
    primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_value_table', 'quote_preview_action_bar'],
    secondaryComponentIds: ['quote_preview_evidence_panel', 'quote_preview_warning_stack'],
    requiredBadges: ['preview', 'no_es_cotizacion', 'no_verificado'],
    allowedActions: ['view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'copy_preview_reference_summary'],
  }),
  buildComposition({
    compositionId: 'quote_preview_human_review_screen',
    screenName: 'QuotePreviewHumanReviewScreen',
    compositionKind: COMPOSITION_KINDS.HUMAN_REVIEW_SCREEN_COMPOSITION,
    supportedStateIds: ['ready_for_human_review'],
    layoutModeRefs: [LAYOUT_MODES.DESKTOP_TWO_COLUMN, LAYOUT_MODES.MOBILE_SINGLE_COLUMN],
    slotOrder: ['shell', 'status', 'badges', 'value_table', 'evidence_panel', 'human_review_card', 'action_bar'],
    primaryComponentIds: ['quote_preview_shell', 'quote_preview_status_card', 'quote_preview_badges_bar', 'quote_preview_value_table', 'quote_preview_human_review_card', 'quote_preview_action_bar'],
    secondaryComponentIds: ['quote_preview_evidence_panel'],
    requiredBadges: ['preview', 'no_es_cotizacion', 'requiere_revision_humana'],
    allowedActions: ['view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review', 'copy_preview_reference_summary'],
  }),
]);

function getSourceRefs() {
  const uxCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();
  const componentCatalog = components.getQuotePreviewSafeUxComponentContractRegistryCatalog();
  return {
    safe_ux_state_model: {
      adapter_id: uxCatalog.adapter_id,
      schemaVersion: uxCatalog.schemaVersion,
      overall_ux_state_status: uxCatalog.overall_ux_state_status,
      state_count: uxCatalog.states.length,
    },
    safe_ux_component_contract: {
      adapter_id: componentCatalog.adapter_id,
      schemaVersion: componentCatalog.schemaVersion,
      overall_component_contract_status: componentCatalog.overall_component_contract_status,
      component_contract_count: componentCatalog.component_contracts.length,
    },
  };
}

function getQuotePreviewSafeScreenCompositionRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_safe_screen_composition_registry',
    overall_screen_composition_status: 'screen_compositions_mapped_no_render_no_effects',
    screen_rendering_allowed_in_registry: false,
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
    required_screen_composition_fields: [...REQUIRED_SCREEN_COMPOSITION_FIELDS],
    layout_modes: Object.values(LAYOUT_MODES),
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    screen_compositions: clone(SCREEN_COMPOSITIONS),
  };
}

function buildScreenCompositionSafeError(compositionId, code = SAFE_ERROR_CODES.SCREEN_COMPOSITION_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    composition_id: compositionId || null,
    screen_name: null,
    composition_kind: null,
    supported_state_ids: [],
    layout_mode_refs: [],
    slot_order: [],
    primary_component_ids: [],
    secondary_component_ids: [],
    required_badges: ['no_es_cotizacion'],
    allowed_actions: [],
    blocked_actions: [...ALL_BLOCKED_ACTIONS],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    safe_errors: [code, SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED, SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Screen composition is not mapped. Screen rendering, quote truth, execution, and writes are blocked.',
    },
  };
}

function getScreenCompositionById(compositionId) {
  const match = SCREEN_COMPOSITIONS.find((composition) => composition.composition_id === compositionId);
  return match ? clone(match) : buildScreenCompositionSafeError(compositionId);
}

function getScreenCompositionByName(screenName) {
  const match = SCREEN_COMPOSITIONS.find((composition) => composition.screen_name === screenName);
  return match ? clone(match) : buildScreenCompositionSafeError(screenName);
}

function getScreenCompositionsByStateId(stateId) {
  return clone(SCREEN_COMPOSITIONS.filter((composition) => composition.supported_state_ids.includes(stateId)));
}

function getScreenCompositionsByLayoutMode(layoutMode) {
  return clone(SCREEN_COMPOSITIONS.filter((composition) => composition.layout_mode_refs.includes(layoutMode)));
}

function getNonRenderingScreenCompositions() {
  return clone(SCREEN_COMPOSITIONS.filter((composition) => composition.render_allowed === false));
}

function getNonWritableScreenCompositions() {
  return clone(SCREEN_COMPOSITIONS.filter((composition) => composition.write_allowed === false));
}

function getQuoteTruthBlockedScreenCompositions() {
  return clone(SCREEN_COMPOSITIONS.filter((composition) => composition.quote_truth_allowed === false));
}

function validateScreenCompositionShape(composition) {
  const errors = [];
  if (!composition || typeof composition !== 'object') return { ok: false, valid: false, errors: ['screen_composition_object_required'] };

  for (const field of REQUIRED_SCREEN_COMPOSITION_FIELDS) {
    if (!(field in composition)) errors.push(`missing_${field}`);
  }

  if (composition.render_allowed !== false) errors.push('render_allowed_must_be_false');
  if (composition.ui_mutation_allowed !== false) errors.push('ui_mutation_allowed_must_be_false');
  if (composition.quote_truth_allowed !== false) errors.push('quote_truth_allowed_must_be_false');
  if (composition.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (composition.write_allowed !== false) errors.push('write_allowed_must_be_false');

  const badges = Array.isArray(composition.required_badges) ? composition.required_badges : [];
  if (!badges.includes('no_es_cotizacion')) errors.push('screen_composition_must_include_no_es_cotizacion_badge');

  for (const [key, value] of Object.entries(composition.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateScreenCompositionRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_screen_composition_status !== 'screen_compositions_mapped_no_render_no_effects') errors.push('overall_screen_composition_status_must_remain_no_effects');

  for (const flagName of [
    'screen_rendering_allowed_in_registry',
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

  const compositions = Array.isArray(catalog.screen_compositions) ? catalog.screen_compositions : [];
  if (compositions.length !== 5) errors.push('five_screen_compositions_required');

  const componentCatalog = components.getQuotePreviewSafeUxComponentContractRegistryCatalog();
  const validComponentIds = new Set(componentCatalog.component_contracts.map((contract) => contract.component_id));
  const stateCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();
  const validStateIds = new Set(stateCatalog.states.map((state) => state.state_id));

  for (const composition of compositions) {
    const result = validateScreenCompositionShape(composition);
    if (!result.ok) errors.push(...result.errors.map((error) => `${composition.composition_id || 'unknown'}:${error}`));

    for (const stateId of composition.supported_state_ids || []) {
      if (!validStateIds.has(stateId)) errors.push(`${composition.composition_id}:unknown_state_${stateId}`);
    }

    for (const componentId of [...(composition.primary_component_ids || []), ...(composition.secondary_component_ids || [])]) {
      if (!validComponentIds.has(componentId)) errors.push(`${composition.composition_id}:unknown_component_${componentId}`);
    }
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  COMPOSITION_KINDS,
  LAYOUT_MODES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_SCREEN_COMPOSITION_FIELDS,
  SCREEN_COMPOSITIONS,
  getQuotePreviewSafeScreenCompositionRegistryCatalog,
  getScreenCompositionById,
  getScreenCompositionByName,
  getScreenCompositionsByStateId,
  getScreenCompositionsByLayoutMode,
  getNonRenderingScreenCompositions,
  getNonWritableScreenCompositions,
  getQuoteTruthBlockedScreenCompositions,
  buildScreenCompositionSafeError,
  validateScreenCompositionShape,
  validateScreenCompositionRegistryCatalog,
};
