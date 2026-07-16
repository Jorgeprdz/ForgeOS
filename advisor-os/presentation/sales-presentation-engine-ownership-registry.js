const REQUIRED_FIELDS = Object.freeze([
  "engine_id",
  "domain_owner",
  "data_owner",
  "truth_ownership",
  "purpose",
  "input_contract",
  "output_contract",
  "public_api",
  "runtime_location",
  "current_consumers",
  "allowed_consumers",
  "forbidden_uses",
  "browser_ready",
  "server_ready",
  "assembly_status",
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}

const registry = [
  {
    engine_id: "QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER",
    domain_owner: "advisor-os/presentation",
    data_owner:
      "accepted-quote|calculation|product-intelligence|client-recommendation-rationale",
    truth_ownership: "CANONICAL_CONTEXT_COMPOSITION_ONLY",
    purpose:
      "compose canonical review-only presentation context while excluding private advisor motivation and financial invention",
    input_contract:
      "acceptedQuote|calculation|required; productIntelligence|clientRecommendationRationale|prospectContext|advisorNotes|clientObjective|optional",
    output_contract: "immutable canonical presentation context",
    public_api: [
      "QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT",
      "assertQuoteToSalesPresentationContextBoundary",
      "buildQuoteToSalesPresentationContext",
    ],
    runtime_location:
      "advisor-os/presentation/quote-to-sales-presentation-context-adapter.js",
    current_consumers: [],
    allowed_consumers: [
      "server-side presentation orchestration",
      "tests",
    ],
    forbidden_uses: [
      "invent facts",
      "alter values",
      "consume Advisor Reason Why",
      "consume manager coaching context",
      "expose private advisor motivation",
      "send",
      "export",
      "mount directly in static browser preview",
    ],
    browser_ready: false,
    server_ready: true,
    assembly_status: "SERVER_CONTRACT_REGISTERED_NOT_BROWSER_MOUNTED",
  },
  {
    engine_id: "CLIENT_RECOMMENDATION_RATIONALE_BOUNDARY",
    domain_owner: "advisor-os/presentation",
    data_owner: "client-solution-fit-rationale-only",
    truth_ownership: "NO_NEW_FACTS_VALIDATED_CLIENT_RATIONALE",
    purpose:
      "validate client solution-fit rationale while rejecting private advisor motivation and manager coaching context",
    input_contract:
      "clientObjective|documentedNeed|solutionFit|whyNow|recommendedAction|evidenceRefs|sourceOwners|freshness",
    output_contract:
      "immutable CLIENT_RECOMMENDATION_RATIONALE_PACKET",
    public_api: [
      "buildClientRecommendationRationaleBoundary",
    ],
    runtime_location:
      "docs/static-preview/quote-preview-live/forge-client-recommendation-rationale-boundary.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-browser-context-adapter.js",
    ],
    allowed_consumers: [
      "ForgeAcceptedQuoteBridge",
      "browser presentation context",
      "presentation prompt builder",
      "slide plan generator",
      "tests",
    ],
    forbidden_uses: [
      "consume Advisor Reason Why",
      "consume manager coaching context",
      "consume compensation or forecast context",
      "expose advisor notes",
      "invent client need",
      "invent product fit",
      "send",
      "export",
    ],
    browser_ready: true,
    server_ready: true,
    assembly_status: "DOMAIN_SEPARATION_BOUNDARY_REGISTERED",
  },
  {
    engine_id: "ACCEPTED_QUOTE_REVIEW_SNAPSHOT_BOUNDARY",
    domain_owner: "quote-preview-browser-runtime",
    data_owner: "accepted-quote-review-snapshot",
    truth_ownership: "SNAPSHOT_BOUNDARY_NOT_SOURCE_TRUTH",
    purpose: "hold immutable review-only accepted quote authority",
    input_contract:
      "acceptedQuote|calculation|required; productIntelligence|optional-without-invention",
    output_contract: "deeply immutable browser review snapshot",
    public_api: [
      "SNAPSHOT_TYPE",
      "createAcceptedQuoteReviewSnapshotBoundary",
    ],
    runtime_location:
      "docs/static-preview/quote-preview-live/forge-accepted-quote-review-snapshot.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-browser-context-adapter.js",
    ],
    allowed_consumers: [
      "ForgeAcceptedQuoteBridge",
      "presentation browser context adapter",
      "tests",
    ],
    forbidden_uses: [
      "retain raw PDF",
      "retain binary payload",
      "mutate quote",
      "invent Product Intelligence",
    ],
    browser_ready: true,
    server_ready: false,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "ACCEPTED_QUOTE_BRIDGE",
    domain_owner: "quote-preview-browser-runtime",
    data_owner: "orchestration-state-only",
    truth_ownership: "NO_INDEPENDENT_TRUTH",
    purpose: "orchestrate accepted quote to presentation review lifecycle",
    input_contract: "accepted quote snapshot and presentation engine contracts",
    output_contract: "ForgeAcceptedQuoteBridge public APIs",
    public_api: [
      "approveCurrentSalesPresentationReview",
      "authorizeCurrentSalesPresentationExport",
      "buildSalesPresentationCoreReviewBundle",
      "exportCurrentSalesPresentationToPrintPdf",
      "getAcceptedQuoteReviewSnapshot",
      "getCurrentSalesPresentationReviewState",
      "getSalesPresentationContextReviewPacket",
      "initAcceptedQuoteBridge",
      "revokeCurrentSalesPresentationApproval",
      "startSalesPresentationReviewSession",
      "updateSalesPresentationReviewSlide",
    ],
    runtime_location:
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    current_consumers: [],
    allowed_consumers: [
      "quote preview UI",
      "dynamic review UI",
      "tests",
    ],
    forbidden_uses: [
      "create financial facts",
      "create narrative truth",
      "bypass approval",
      "send",
      "CRM mutation",
    ],
    browser_ready: true,
    server_ready: false,
    assembly_status: "PUBLIC_BROWSER_ORCHESTRATOR_REGISTERED",
  },
  {
    engine_id: "BROWSER_PRESENTATION_CONTEXT_ADAPTER",
    domain_owner: "advisor-os/presentation",
    data_owner: "browser-context-projection",
    truth_ownership: "PROJECTION_OF_CANONICAL_AUTHORITIES",
    purpose: "adapt browser snapshot into presentation-ready context",
    input_contract: "accepted quote review snapshot",
    output_contract: "immutable browser presentation context",
    public_api: [
      "CONTEXT_PACKET_TYPE",
      "SNAPSHOT_TYPE",
      "buildSalesPresentationBrowserContext",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-browser-context-adapter.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-prompt-builder.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-review-packet-builder.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-slide-plan-generator.js",
    ],
    allowed_consumers: [
      "dedicated presentation prompt builder",
      "ForgeAcceptedQuoteBridge",
      "tests",
    ],
    forbidden_uses: [
      "raw document intake",
      "invent context",
      "reuse outreach prompt builder",
      "claim server canonical ownership",
    ],
    browser_ready: true,
    server_ready: false,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "DEDICATED_PRESENTATION_PROMPT_BUILDER",
    domain_owner: "advisor-os/presentation",
    data_owner: "prompt-organization-only",
    truth_ownership: "NO_NEW_FACTS",
    purpose:
      "organize supplied authoritative facts into a presentation prompt packet",
    input_contract: "complete browser presentation context",
    output_contract: "immutable dedicated presentation prompt packet",
    public_api: [
      "PROMPT_PACKET_TYPE",
      "buildSalesPresentationPromptReviewPacket",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-prompt-builder.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-review-packet-builder.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-slide-plan-generator.js",
    ],
    allowed_consumers: [
      "slide plan generator",
      "ForgeAcceptedQuoteBridge",
      "tests",
    ],
    forbidden_uses: [
      "outreach messaging",
      "invent facts",
      "send",
      "export",
    ],
    browser_ready: true,
    server_ready: true,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "SLIDE_PLAN_GENERATOR",
    domain_owner: "advisor-os/presentation",
    data_owner: "slide-structure-only",
    truth_ownership: "COPIES_FACTS_WITH_SOURCE_PATHS",
    purpose: "build deterministic factual slide plan",
    input_contract: "presentation prompt packet and authoritative context",
    output_contract: "immutable slide plan with source paths",
    public_api: [
      "SLIDE_PLAN_PACKET_TYPE",
      "buildSalesPresentationSlidePlanReviewPacket",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-slide-plan-generator.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-review-packet-builder.js",
    ],
    allowed_consumers: [
      "review packet builder",
      "ForgeAcceptedQuoteBridge",
      "tests",
    ],
    forbidden_uses: [
      "recalculate",
      "alter figures",
      "drop source paths",
      "export",
    ],
    browser_ready: true,
    server_ready: true,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "PRESENTATION_REVIEW_PACKET_BUILDER",
    domain_owner: "advisor-os/presentation",
    data_owner: "review-bundle-only",
    truth_ownership: "NO_NEW_FACTS",
    purpose:
      "assemble immutable review packet while approval, export, send and CRM gates remain closed",
    input_contract: "context|prompt-packet|slide-plan",
    output_contract: "immutable review packet",
    public_api: [
      "REVIEW_PACKET_TYPE",
      "buildSalesPresentationReviewPacket",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-review-packet-builder.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-review-state-store.js",
    ],
    allowed_consumers: [
      "review state store",
      "ForgeAcceptedQuoteBridge",
      "tests",
    ],
    forbidden_uses: [
      "approve",
      "authorize export",
      "send",
      "CRM mutation",
      "retain mutable review session state",
    ],
    browser_ready: true,
    server_ready: true,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "PRESENTATION_REVIEW_STATE_STORE",
    domain_owner: "advisor-os/presentation",
    data_owner: "review-session-state",
    truth_ownership: "FACTS_READ_ONLY_EDITABLE_COPY_FIELDS_ONLY",
    purpose: "store immutable review revisions and allowed content edits",
    input_contract: "presentation review packet",
    output_contract: "revision-bound immutable review state",
    public_api: [
      "REVIEW_PACKET_TYPE",
      "REVIEW_STATE_TYPE",
      "applySalesPresentationApprovalDecision",
      "applySalesPresentationExportAuthorization",
      "clearSalesPresentationReviewState",
      "getSalesPresentationReviewState",
      "initializeSalesPresentationReviewState",
      "revokeSalesPresentationApproval",
      "subscribeSalesPresentationReviewState",
      "updateSalesPresentationSlide",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-review-state-store.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-editable-preview.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-export-adapter.js",
      "docs/static-preview/quote-preview-live/forge-sales-presentation-human-approval-gate.js",
    ],
    allowed_consumers: [
      "editable preview",
      "human approval gate",
      "export adapter",
      "ForgeAcceptedQuoteBridge",
      "tests",
    ],
    forbidden_uses: [
      "edit facts",
      "retain raw documents",
      "preserve approval after edit",
      "preserve export authorization after edit",
    ],
    browser_ready: true,
    server_ready: false,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "EDITABLE_PRESENTATION_PREVIEW_AND_DYNAMIC_UI",
    domain_owner: "advisor-os/presentation",
    data_owner: "presentation-view-model-only",
    truth_ownership: "READ_ONLY_FACT_RENDERING",
    purpose:
      "mount dynamic review UI and expose title, purpose and notes edits",
    input_contract: "current presentation review state",
    output_contract: "DOM review surface and user edit events",
    public_api: [
      "bindSalesPresentationReviewUi",
      "buildSalesPresentationEditablePreviewModel",
      "closeSalesPresentationReviewUi",
      "openSalesPresentationReviewUi",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-editable-preview.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    ],
    allowed_consumers: [
      "quote preview browser UI",
      "ForgeAcceptedQuoteBridge",
      "tests",
    ],
    forbidden_uses: [
      "edit facts",
      "static HTML mutation",
      "enable CTA before readiness",
    ],
    browser_ready: true,
    server_ready: false,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "PRESENTATION_HUMAN_APPROVAL_GATE",
    domain_owner: "advisor-os/presentation",
    data_owner: "human-approval-decision",
    truth_ownership: "HUMAN_DECISION_AUTHORITY",
    purpose:
      "bind explicit identified human approval to an exact review revision",
    input_contract: "review state revision and identified human reviewer",
    output_contract: "immutable revision-bound approval decision",
    public_api: [
      "APPROVAL_DECISION_TYPE",
      "approveSalesPresentationReview",
      "buildSalesPresentationApprovalRevocation",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-human-approval-gate.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    ],
    allowed_consumers: [
      "export adapter",
      "ForgeAcceptedQuoteBridge",
      "tests",
    ],
    forbidden_uses: [
      "AI approval",
      "anonymous approval",
      "carry approval across revisions",
      "authorize export by itself",
    ],
    browser_ready: true,
    server_ready: true,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
  {
    engine_id: "PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
    domain_owner: "advisor-os/presentation",
    data_owner: "export-authorization-and-print-view",
    truth_ownership: "NO_NEW_FACTS",
    purpose:
      "authorize an approved exact revision and open browser Print/PDF flow",
    input_contract: "approved exact review revision",
    output_contract: "PRINT_PDF authorization and print-safe HTML",
    public_api: [
      "EXPORT_AUTHORIZATION_TYPE",
      "authorizeSalesPresentationExport",
      "buildSalesPresentationPrintableHtml",
      "printSalesPresentationToPdf",
    ],
    runtime_location:
      "advisor-os/presentation/browser/forge-sales-presentation-export-adapter.js",
    current_consumers: [
      "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    ],
    allowed_consumers: [
      "ForgeAcceptedQuoteBridge",
      "human reviewer UI",
      "tests",
    ],
    forbidden_uses: [
      "PPTX claim",
      "send",
      "CRM mutation",
      "export unapproved revision",
      "create approval decision",
    ],
    browser_ready: true,
    server_ready: false,
    assembly_status: "EXISTING_RUNTIME_EDGE_REGISTERED",
  },
];

const assemblyPlan = {
  assembly_id: "R16H1_PRESENTATION_EXISTING_RUNTIME_ASSEMBLY_PLAN",
  status: "VERIFIED_WIRING_WITH_CLIENT_RATIONALE_DOMAIN_BOUNDARY",
  registry_authority: "SOURCE_TRUTH_AND_MACHINE_READABLE_GOVERNANCE",
  runtime_assembly_authorized: false,
  new_runtime_connections_required: [],
  protected_decisions: [
    {
      overlap:
        "ADVISOR_REASON_WHY|CLIENT_RECOMMENDATION_RATIONALE_BOUNDARY",
      decision:
        "Advisor Reason Why remains private manager-os coaching signal; client rationale is a separate client solution-fit authority",
    },
    {
      overlap:
        "QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER|BROWSER_PRESENTATION_CONTEXT_ADAPTER",
      decision:
        "server canonical composition remains separate from browser projection; no browser import of manager-os adapter",
    },
    {
      overlap:
        "PRESENTATION_REVIEW_PACKET_BUILDER|PRESENTATION_REVIEW_STATE_STORE",
      decision:
        "review packet owns immutable initial bundle; state store owns revisioned session and allowed edits",
    },
    {
      overlap:
        "PRESENTATION_HUMAN_APPROVAL_GATE|PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
      decision:
        "human gate owns approval decision; export adapter owns downstream PRINT_PDF effect authorization",
    },
  ],
  existing_logical_edges: [
    "CLIENT_RECOMMENDATION_RATIONALE_BOUNDARY>BROWSER_PRESENTATION_CONTEXT_ADAPTER",
    "ACCEPTED_QUOTE_REVIEW_SNAPSHOT_BOUNDARY>BROWSER_PRESENTATION_CONTEXT_ADAPTER",
    "BROWSER_PRESENTATION_CONTEXT_ADAPTER>DEDICATED_PRESENTATION_PROMPT_BUILDER",
    "DEDICATED_PRESENTATION_PROMPT_BUILDER>SLIDE_PLAN_GENERATOR",
    "SLIDE_PLAN_GENERATOR>PRESENTATION_REVIEW_PACKET_BUILDER",
    "PRESENTATION_REVIEW_PACKET_BUILDER>PRESENTATION_REVIEW_STATE_STORE",
    "PRESENTATION_REVIEW_STATE_STORE>EDITABLE_PRESENTATION_PREVIEW_AND_DYNAMIC_UI",
    "PRESENTATION_REVIEW_STATE_STORE>PRESENTATION_HUMAN_APPROVAL_GATE",
    "PRESENTATION_HUMAN_APPROVAL_GATE>PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
    "ACCEPTED_QUOTE_BRIDGE>ALL_BROWSER_LIFECYCLE_ORCHESTRATION",
  ],
  next_verification: "R16J2_ADVISOR_OS_PRESENTATION_RUNTIME_RECONCILIATION",
};

export const PRESENTATION_ENGINE_OWNERSHIP_REQUIRED_FIELDS =
  REQUIRED_FIELDS;

export const PRESENTATION_ENGINE_OWNERSHIP_REGISTRY =
  deepFreeze(registry);

export const PRESENTATION_ENGINE_ASSEMBLY_PLAN =
  deepFreeze(assemblyPlan);

export function getPresentationEngineOwnershipRegistry() {
  return PRESENTATION_ENGINE_OWNERSHIP_REGISTRY;
}

export function getPresentationEngineOwnershipById(engineId) {
  return (
    PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.find(
      (record) => record.engine_id === engineId,
    ) || null
  );
}

export function assertPresentationEngineOwnershipRegistry() {
  if (
    PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.length !== 12
  ) {
    throw new Error(
      "Presentation ownership registry must contain exactly 12 engines",
    );
  }

  const ids = new Set();
  const locations = new Set();

  for (const record of PRESENTATION_ENGINE_OWNERSHIP_REGISTRY) {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in record)) {
        throw new Error(
          `Presentation ownership record ${record.engine_id || "UNKNOWN"} is missing ${field}`,
        );
      }
    }

    if (ids.has(record.engine_id)) {
      throw new Error(
        `Duplicate presentation engine id: ${record.engine_id}`,
      );
    }
    ids.add(record.engine_id);

    if (locations.has(record.runtime_location)) {
      throw new Error(
        `Duplicate presentation runtime location: ${record.runtime_location}`,
      );
    }
    locations.add(record.runtime_location);
  }

  return true;
}
