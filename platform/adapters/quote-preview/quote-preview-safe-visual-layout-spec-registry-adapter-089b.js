'use strict';

const screens = require('./quote-preview-safe-screen-composition-registry-adapter-088b.js');

const ADAPTER_ID = 'forge.quote_preview.safe_visual_layout_spec.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.safe_visual_layout_spec.registry.v1';
const DOMAIN_ID = 'quote_preview_safe_visual_layout_spec';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const LAYOUT_MODES = Object.freeze({
  DESKTOP_TWO_COLUMN: 'desktop_two_column',
  TABLET_TWO_COLUMN: 'tablet_two_column',
  MOBILE_SINGLE_COLUMN: 'mobile_single_column',
});

const VIEWPORT_CLASSES = Object.freeze({
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
});

const SAFE_ERROR_CODES = Object.freeze({
  VISUAL_LAYOUT_SPEC_NOT_MAPPED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_SPEC_NOT_MAPPED',
  SCREEN_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_SCREEN_RENDERING_NOT_AUTHORIZED',
  COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_COMPONENT_RENDERING_NOT_AUTHORIZED',
  UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_UI_MUTATION_NOT_AUTHORIZED',
  CSS_INJECTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_CSS_INJECTION_NOT_AUTHORIZED',
  DOM_WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_DOM_WRITE_NOT_AUTHORIZED',
  QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_QUOTE_TRUTH_NOT_AUTHORIZED',
  WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_WRITE_NOT_AUTHORIZED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_PREVIEW_LABEL_REQUIRED',
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

const REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS = Object.freeze([
  'layout_spec_id',
  'layout_mode',
  'viewport_class',
  'intended_screen_refs',
  'navigation_pattern',
  'main_grid',
  'visual_hierarchy',
  'card_density',
  'primary_cta_treatment',
  'safety_badge_treatment',
  'warning_treatment',
  'table_treatment',
  'render_allowed',
  'screen_render_allowed',
  'component_render_allowed',
  'ui_mutation_allowed',
  'css_injection_allowed',
  'dom_write_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'write_allowed',
  'safe_errors',
  'safety_flags',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeSpec(spec) {
  return Object.freeze({
    ...spec,
    intended_screen_refs: Object.freeze([...(spec.intended_screen_refs || [])]),
    visual_hierarchy: Object.freeze([...(spec.visual_hierarchy || [])]),
    safe_errors: Object.freeze([...(spec.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(spec.safety_flags || {}) }),
  });
}

function buildVisualLayoutSpec({
  layoutSpecId,
  layoutMode,
  viewportClass,
  intendedScreenRefs,
  navigationPattern,
  mainGrid,
  visualHierarchy,
  cardDensity,
  primaryCtaTreatment,
  safetyBadgeTreatment,
  warningTreatment,
  tableTreatment,
}) {
  return freezeSpec({
    layout_spec_id: layoutSpecId,
    layout_mode: layoutMode,
    viewport_class: viewportClass,
    intended_screen_refs: intendedScreenRefs,
    navigation_pattern: navigationPattern,
    main_grid: mainGrid,
    visual_hierarchy: visualHierarchy,
    card_density: cardDensity,
    primary_cta_treatment: primaryCtaTreatment,
    safety_badge_treatment: safetyBadgeTreatment,
    warning_treatment: warningTreatment,
    table_treatment: tableTreatment,
    render_allowed: false,
    screen_render_allowed: false,
    component_render_allowed: false,
    ui_mutation_allowed: false,
    css_injection_allowed: false,
    dom_write_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    safe_errors: [
      SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.CSS_INJECTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.DOM_WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED,
    ],
  });
}

const VISUAL_STYLE_TOKENS = Object.freeze({
  color_system: 'midnight_navy_with_warm_gold_and_cyan_safety_accents',
  background: 'dark_radial_gradient_with_subtle_blue_green_glow',
  surfaces: 'dark_glass_cards_soft_borders_subtle_glow',
  borders: 'thin_blue_gray_borders_with_gold_focus_state',
  typography: 'large_clear_page_title_medium_weight_labels_compact_operational_text',
  cta: 'warm_gold_primary_buttons',
  safety_labels: 'muted_cyan_preview_not_quote_pills_always_visible',
  metrics: 'blue_green_red_yellow_metric_semantics',
  mobile_navigation: 'bottom_tab_bar_with_active_gold_icon',
});

const VISUAL_LAYOUT_SPECS = Object.freeze([
  buildVisualLayoutSpec({
    layoutSpecId: 'desktop_safe_visual_layout',
    layoutMode: LAYOUT_MODES.DESKTOP_TWO_COLUMN,
    viewportClass: VIEWPORT_CLASSES.DESKTOP,
    intendedScreenRefs: ['QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],
    navigationPattern: 'fixed_left_sidebar',
    mainGrid: 'content_max_width_1180_two_column',
    visualHierarchy: ['breadcrumb', 'page_title', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid', 'priority_table'],
    cardDensity: 'comfortable',
    primaryCtaTreatment: 'warm_gold_rounded_button',
    safetyBadgeTreatment: 'muted_cyan_pill_with_shield',
    warningTreatment: 'gold_accented_glass_card',
    tableTreatment: 'dark_operational_table_with_soft_dividers',
  }),
  buildVisualLayoutSpec({
    layoutSpecId: 'tablet_safe_visual_layout',
    layoutMode: LAYOUT_MODES.TABLET_TWO_COLUMN,
    viewportClass: VIEWPORT_CLASSES.TABLET,
    intendedScreenRefs: ['QuotePreviewIntakeScreen', 'QuotePreviewReferenceScreen'],
    navigationPattern: 'compact_left_sidebar_or_bottom_nav',
    mainGrid: 'content_fluid_two_column_collapsible',
    visualHierarchy: ['page_title', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid', 'priority_table'],
    cardDensity: 'medium',
    primaryCtaTreatment: 'warm_gold_rounded_button',
    safetyBadgeTreatment: 'muted_cyan_pill_with_shield',
    warningTreatment: 'gold_accented_glass_card',
    tableTreatment: 'responsive_table_or_card_list',
  }),
  buildVisualLayoutSpec({
    layoutSpecId: 'mobile_safe_visual_layout',
    layoutMode: LAYOUT_MODES.MOBILE_SINGLE_COLUMN,
    viewportClass: VIEWPORT_CLASSES.MOBILE,
    intendedScreenRefs: ['QuotePreviewEmptyScreen', 'QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],
    navigationPattern: 'bottom_tab_bar',
    mainGrid: 'single_column_stacked_cards',
    visualHierarchy: ['mobile_header', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid_two_columns', 'priority_list_cards', 'bottom_nav'],
    cardDensity: 'compact_but_readable',
    primaryCtaTreatment: 'warm_gold_full_width_or_inline_button',
    safetyBadgeTreatment: 'muted_cyan_pill_with_shield',
    warningTreatment: 'gold_accented_glass_card',
    tableTreatment: 'priority_list_cards_not_table',
  }),
]);

function getSourceRefs() {
  const screenCatalog = screens.getQuotePreviewSafeScreenCompositionRegistryCatalog();
  return {
    safe_screen_composition: {
      adapter_id: screenCatalog.adapter_id,
      schemaVersion: screenCatalog.schemaVersion,
      overall_screen_composition_status: screenCatalog.overall_screen_composition_status,
      screen_composition_count: screenCatalog.screen_compositions.length,
    },
  };
}

function getQuotePreviewSafeVisualLayoutSpecRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_safe_visual_layout_spec_registry',
    overall_visual_layout_spec_status: 'visual_layout_specs_mapped_no_render_no_effects',
    render_allowed_in_registry: false,
    screen_render_allowed_in_registry: false,
    component_render_allowed_in_registry: false,
    ui_mutation_allowed_in_registry: false,
    css_injection_allowed_in_registry: false,
    dom_write_allowed_in_registry: false,
    quote_truth_allowed_in_registry: false,
    execution_allowed_in_registry: false,
    write_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    policy_write_allowed_in_registry: false,
    pipeline_write_allowed_in_registry: false,
    provider_runtime_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    required_visual_layout_spec_fields: [...REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS],
    visual_style_tokens: clone(VISUAL_STYLE_TOKENS),
    layout_modes: Object.values(LAYOUT_MODES),
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    visual_layout_specs: clone(VISUAL_LAYOUT_SPECS),
  };
}

function buildVisualLayoutSpecSafeError(layoutSpecId, code = SAFE_ERROR_CODES.VISUAL_LAYOUT_SPEC_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    layout_spec_id: layoutSpecId || null,
    layout_mode: null,
    viewport_class: null,
    intended_screen_refs: [],
    navigation_pattern: null,
    main_grid: null,
    visual_hierarchy: [],
    card_density: null,
    primary_cta_treatment: null,
    safety_badge_treatment: null,
    warning_treatment: null,
    table_treatment: null,
    render_allowed: false,
    screen_render_allowed: false,
    component_render_allowed: false,
    ui_mutation_allowed: false,
    css_injection_allowed: false,
    dom_write_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    safe_errors: [code, SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED, SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Visual layout spec is not mapped. Rendering, UI mutation, quote truth, execution, and writes are blocked.',
    },
  };
}

function getVisualLayoutSpecById(layoutSpecId) {
  const match = VISUAL_LAYOUT_SPECS.find((spec) => spec.layout_spec_id === layoutSpecId);
  return match ? clone(match) : buildVisualLayoutSpecSafeError(layoutSpecId);
}

function getVisualLayoutSpecsByViewportClass(viewportClass) {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.viewport_class === viewportClass));
}

function getVisualLayoutSpecsByLayoutMode(layoutMode) {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.layout_mode === layoutMode));
}

function getNonRenderingVisualLayoutSpecs() {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.render_allowed === false));
}

function getNonMutableVisualLayoutSpecs() {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.ui_mutation_allowed === false && spec.css_injection_allowed === false && spec.dom_write_allowed === false));
}

function getQuoteTruthBlockedVisualLayoutSpecs() {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.quote_truth_allowed === false));
}

function validateVisualLayoutSpecShape(spec) {
  const errors = [];
  if (!spec || typeof spec !== 'object') return { ok: false, valid: false, errors: ['visual_layout_spec_object_required'] };

  for (const field of REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS) {
    if (!(field in spec)) errors.push(`missing_${field}`);
  }

  for (const flagName of ['render_allowed', 'screen_render_allowed', 'component_render_allowed', 'ui_mutation_allowed', 'css_injection_allowed', 'dom_write_allowed', 'quote_truth_allowed', 'execution_allowed', 'write_allowed']) {
    if (spec[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  if (!Array.isArray(spec.visual_hierarchy) || spec.visual_hierarchy.length < 4) errors.push('visual_hierarchy_must_have_minimum_structure');
  if (typeof spec.primary_cta_treatment !== 'string' || !spec.primary_cta_treatment.includes('gold')) errors.push('primary_cta_treatment_must_preserve_gold_cta');
  if (typeof spec.safety_badge_treatment !== 'string' || !spec.safety_badge_treatment.includes('cyan')) errors.push('safety_badge_treatment_must_preserve_cyan_preview_badge');

  for (const [key, value] of Object.entries(spec.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateVisualLayoutSpecRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_visual_layout_spec_status !== 'visual_layout_specs_mapped_no_render_no_effects') errors.push('overall_visual_layout_spec_status_must_remain_no_effects');

  for (const flagName of [
    'render_allowed_in_registry',
    'screen_render_allowed_in_registry',
    'component_render_allowed_in_registry',
    'ui_mutation_allowed_in_registry',
    'css_injection_allowed_in_registry',
    'dom_write_allowed_in_registry',
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

  const specs = Array.isArray(catalog.visual_layout_specs) ? catalog.visual_layout_specs : [];
  if (specs.length !== 3) errors.push('three_visual_layout_specs_required');

  const screenCatalog = screens.getQuotePreviewSafeScreenCompositionRegistryCatalog();
  const validScreenNames = new Set(screenCatalog.screen_compositions.map((composition) => composition.screen_name));

  for (const spec of specs) {
    const result = validateVisualLayoutSpecShape(spec);
    if (!result.ok) errors.push(...result.errors.map((error) => `${spec.layout_spec_id || 'unknown'}:${error}`));

    for (const screenName of spec.intended_screen_refs || []) {
      if (!validScreenNames.has(screenName)) errors.push(`${spec.layout_spec_id}:unknown_screen_${screenName}`);
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
  LAYOUT_MODES,
  VIEWPORT_CLASSES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS,
  VISUAL_STYLE_TOKENS,
  VISUAL_LAYOUT_SPECS,
  getQuotePreviewSafeVisualLayoutSpecRegistryCatalog,
  getVisualLayoutSpecById,
  getVisualLayoutSpecsByViewportClass,
  getVisualLayoutSpecsByLayoutMode,
  getNonRenderingVisualLayoutSpecs,
  getNonMutableVisualLayoutSpecs,
  getQuoteTruthBlockedVisualLayoutSpecs,
  buildVisualLayoutSpecSafeError,
  validateVisualLayoutSpecShape,
  validateVisualLayoutSpecRegistryCatalog,
};
