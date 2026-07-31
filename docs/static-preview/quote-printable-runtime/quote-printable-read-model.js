const ACCEPTED_QUOTE_SNAPSHOT_TYPE =
  "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT";
const QUOTE_PRINTABLE_READ_MODEL_TYPE =
  "FORGE_QUOTE_PRINTABLE_READ_MODEL";
const CONTRACT_VERSION = "QPD01_READ_MODEL_V1";

const FORBIDDEN_KEY_TOKENS = new Set([
  "arraybuffer",
  "base64",
  "binary",
  "blob",
  "dataurl",
  "file",
  "pdfbytes",
  "rawpdf",
]);

function isRecord(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function normalizedKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function assertAllowedKey(key, path) {
  if (FORBIDDEN_KEY_TOKENS.has(normalizedKey(key))) {
    throw new TypeError(
      `Forbidden raw document key at ${path}.${String(key)}`,
    );
  }
}

function cloneJsonSafe(value, path = "root", seen = new WeakSet()) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Non-finite number at ${path}`);
    }
    return value;
  }

  if (typeof value === "undefined") {
    throw new TypeError(`Undefined value at ${path}`);
  }

  if (
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    throw new TypeError(`Non-JSON value at ${path}`);
  }

  if (
    typeof ArrayBuffer !== "undefined" &&
    (value instanceof ArrayBuffer || ArrayBuffer.isView?.(value))
  ) {
    throw new TypeError(`Binary value at ${path}`);
  }

  if (seen.has(value)) {
    throw new TypeError(`Circular value at ${path}`);
  }
  seen.add(value);

  if (Array.isArray(value)) {
    const output = value.map((item, index) =>
      cloneJsonSafe(item, `${path}[${index}]`, seen),
    );
    seen.delete(value);
    return output;
  }

  if (!isRecord(value)) {
    throw new TypeError(`Non-plain object at ${path}`);
  }

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    assertAllowedKey(key, path);
    output[key] = cloneJsonSafe(item, `${path}.${key}`, seen);
  }

  seen.delete(value);
  return output;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return value;
  }

  seen.add(value);
  for (const item of Object.values(value)) {
    deepFreeze(item, seen);
  }
  return Object.freeze(value);
}

function hash(value) {
  let output = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index);
    output = Math.imul(output, 0x01000193);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
}

function hasValue(value) {
  return (
    value !== null &&
    typeof value !== "undefined" &&
    (typeof value !== "string" || value.trim().length > 0) &&
    (!Array.isArray(value) || value.length > 0)
  );
}

function readPath(root, path) {
  if (!path) return root;
  return String(path)
    .split(".")
    .reduce(
      (value, segment) =>
        value === null || typeof value === "undefined"
          ? undefined
          : value[segment],
      root,
    );
}

function candidate(root, path, authority) {
  return Object.freeze({ root, path, authority });
}

function normalizeSelectedValue(value) {
  if (
    isRecord(value) &&
    Object.prototype.hasOwnProperty.call(value, "truth_status") &&
    value.truth_status !== "source_provided"
  ) {
    return {
      available: false,
      value: null,
      truthStatus: String(value.truth_status || "unknown"),
      unit: value.currency || value.unit || null,
    };
  }

  if (
    isRecord(value) &&
    Object.prototype.hasOwnProperty.call(value, "value")
  ) {
    return {
      available: hasValue(value.value),
      value: hasValue(value.value)
        ? cloneJsonSafe(value.value)
        : null,
      truthStatus: value.truth_status || null,
      unit: value.currency || value.unit || null,
    };
  }

  return {
    available: hasValue(value),
    value: hasValue(value) ? cloneJsonSafe(value) : null,
    truthStatus: null,
    unit: null,
  };
}

function selectField(roots, definition) {
  for (const source of definition.candidates) {
    const value = readPath(roots[source.root], source.path);
    const normalized = normalizeSelectedValue(value);
    if (!normalized.available) continue;

    return deepFreeze({
      id: definition.id,
      label: definition.label,
      status: "CONFIRMED",
      classification: definition.classification || "FACT",
      value: normalized.value,
      unit: normalized.unit,
      truthStatus: normalized.truthStatus,
      sourcePath: `${source.root}.${source.path}`,
      authority: source.authority,
      editable: false,
      required: definition.required === true,
    });
  }

  return deepFreeze({
    id: definition.id,
    label: definition.label,
    status: "UNAVAILABLE",
    classification: definition.classification || "FACT",
    value: null,
    unit: null,
    truthStatus: "unknown",
    sourcePath: null,
    authority: null,
    editable: false,
    required: definition.required === true,
  });
}

function field(id, label, candidates, options = {}) {
  return Object.freeze({
    id,
    label,
    candidates: Object.freeze(candidates),
    classification: options.classification || "FACT",
    required: options.required === true,
  });
}

const AUTHORITIES = Object.freeze({
  QUOTE: "ACCEPTED_QUOTE_SOURCE",
  CALCULATION: "ACCEPTED_QUOTE_CALCULATION",
  PRODUCT: "PRODUCT_INTELLIGENCE",
});

const FIELD_DEFINITIONS = Object.freeze({
  clientName: field(
    "client_name",
    "Cliente",
    [
      candidate("acceptedQuote", "client.fullName", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "client.name", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "prospect.name", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "prospect.fullName", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "context.clientName", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.clientName", AUTHORITIES.QUOTE),
      candidate("calculation", "clientName", AUTHORITIES.CALCULATION),
    ],
    { required: true },
  ),
  advisorName: field(
    "advisor_name",
    "Asesor",
    [
      candidate("acceptedQuote", "advisor.name", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "context.advisorName", AUTHORITIES.QUOTE),
      candidate("calculation", "advisorName", AUTHORITIES.CALCULATION),
    ],
  ),
  quoteId: field(
    "quote_id",
    "Folio",
    [
      candidate("acceptedQuote", "quoteId", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "id", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "acceptedQuoteId", AUTHORITIES.QUOTE),
      candidate("calculation", "quoteId", AUTHORITIES.CALCULATION),
    ],
  ),
  acceptedAt: field(
    "accepted_at",
    "Fecha de aceptación",
    [
      candidate("acceptedQuote", "acceptedAt", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "confirmedAt", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "createdAt", AUTHORITIES.QUOTE),
      candidate("calculation", "calculatedAt", AUTHORITIES.CALCULATION),
    ],
  ),
  product: field(
    "product",
    "Producto",
    [
      candidate(
        "productIntelligence",
        "identity.detected_product_name",
        AUTHORITIES.PRODUCT,
      ),
      candidate("calculation", "product", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "product", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.product", AUTHORITIES.QUOTE),
    ],
    { required: true },
  ),
  productFamily: field(
    "product_family",
    "Familia",
    [
      candidate("calculation", "productFamily", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "context.productFamily", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "context.product_family", AUTHORITIES.QUOTE),
    ],
  ),
  plan: field(
    "plan",
    "Plan",
    [
      candidate("calculation", "plan", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "plan", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.plan", AUTHORITIES.QUOTE),
    ],
  ),
  currency: field(
    "currency",
    "Moneda",
    [
      candidate("calculation", "currency", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "currency", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.currency", AUTHORITIES.QUOTE),
    ],
  ),
  paymentMode: field(
    "payment_mode",
    "Forma de pago",
    [
      candidate("calculation", "paymentMode", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "paymentMode", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.paymentMode", AUTHORITIES.QUOTE),
    ],
  ),
  paymentYears: field(
    "payment_years",
    "Plazo de pago",
    [
      candidate("calculation", "paymentYears", AUTHORITIES.CALCULATION),
      candidate(
        "productIntelligence",
        "premium_structure.payment_term_years",
        AUTHORITIES.PRODUCT,
      ),
      candidate("acceptedQuote", "paymentTerm", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.paymentTerm", AUTHORITIES.QUOTE),
    ],
  ),
  coveragePeriod: field(
    "coverage_period",
    "Vigencia",
    [
      candidate("calculation", "coveragePeriod", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "coveragePeriod", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.coveragePeriod", AUTHORITIES.QUOTE),
    ],
  ),
  sumAssured: field(
    "sum_assured",
    "Suma asegurada",
    [
      candidate(
        "productIntelligence",
        "protection_summary.basic_sum_assured",
        AUTHORITIES.PRODUCT,
      ),
      candidate("calculation", "sumInsured", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "sumInsured", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.sumInsured", AUTHORITIES.QUOTE),
    ],
  ),
  currentProtectionMXN: field(
    "current_protection_mxn",
    "Protección actual MXN",
    [
      candidate(
        "calculation",
        "currentProtectionMXN",
        AUTHORITIES.CALCULATION,
      ),
    ],
  ),
  optionalCoverages: field(
    "optional_coverages",
    "Coberturas opcionales",
    [
      candidate(
        "calculation",
        "optionalCoverages",
        AUTHORITIES.CALCULATION,
      ),
      candidate("acceptedQuote", "optionalCoverages", AUTHORITIES.QUOTE),
    ],
  ),
  annualPremium: field(
    "annual_premium",
    "Prima anual básica",
    [
      candidate(
        "productIntelligence",
        "premium_structure.basic_annual_premium",
        AUTHORITIES.PRODUCT,
      ),
      candidate("calculation", "annualPremium", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "premiumTable.annual", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.premiumTable.annual", AUTHORITIES.QUOTE),
    ],
  ),
  totalAnnualPremium: field(
    "total_annual_premium",
    "Prima anual total",
    [
      candidate(
        "productIntelligence",
        "premium_structure.total_annual_premium",
        AUTHORITIES.PRODUCT,
      ),
      candidate("calculation", "totalAnnualPremium", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "premiumTable.plannedAnnual", AUTHORITIES.QUOTE),
      candidate(
        "acceptedQuote",
        "nativeResult.premiumTable.plannedAnnual",
        AUTHORITIES.QUOTE,
      ),
    ],
  ),
  totalContributed: field(
    "total_contributed",
    "Total aportado",
    [
      candidate("calculation", "totalContributed", AUTHORITIES.CALCULATION),
    ],
    { classification: "PROJECTION" },
  ),
  totalContributedMXN: field(
    "total_contributed_mxn",
    "Total aportado MXN",
    [
      candidate(
        "calculation",
        "totalContributedMXN",
        AUTHORITIES.CALCULATION,
      ),
    ],
    { classification: "PROJECTION" },
  ),
  totalRecovery: field(
    "total_recovery",
    "Recuperación total",
    [
      candidate("calculation", "totalRecovery", AUTHORITIES.CALCULATION),
    ],
    { classification: "PROJECTION" },
  ),
  totalRecoveryMXN: field(
    "total_recovery_mxn",
    "Recuperación MXN",
    [
      candidate(
        "calculation",
        "totalRecoveryMXN",
        AUTHORITIES.CALCULATION,
      ),
    ],
    { classification: "PROJECTION" },
  ),
  monthlyIncomeMXN: field(
    "monthly_income_mxn",
    "Ingreso mensual MXN",
    [
      candidate(
        "calculation",
        "monthlyIncomeMXN",
        AUTHORITIES.CALCULATION,
      ),
    ],
    { classification: "PROJECTION" },
  ),
  annualIncomeMXN: field(
    "annual_income_mxn",
    "Ingreso anual MXN",
    [
      candidate(
        "calculation",
        "annualIncomeMXN",
        AUTHORITIES.CALCULATION,
      ),
    ],
    { classification: "PROJECTION" },
  ),
  scenarios: field(
    "scenarios",
    "Escenarios",
    [
      candidate("calculation", "scenarios", AUTHORITIES.CALCULATION),
      candidate("calculation", "projectionScenarios", AUTHORITIES.CALCULATION),
    ],
    { classification: "PROJECTION" },
  ),
  productVersion: field(
    "product_version",
    "Versión del producto",
    [
      candidate(
        "productIntelligence",
        "schema.version",
        AUTHORITIES.PRODUCT,
      ),
      candidate(
        "productIntelligence",
        "identity.product_version",
        AUTHORITIES.PRODUCT,
      ),
    ],
  ),
  sourceDate: field(
    "source_date",
    "Fecha de fuente",
    [
      candidate(
        "productIntelligence",
        "provenance.source_date",
        AUTHORITIES.PRODUCT,
      ),
      candidate(
        "productIntelligence",
        "metadata.source_date",
        AUTHORITIES.PRODUCT,
      ),
      candidate("calculation", "calculatedAt", AUTHORITIES.CALCULATION),
    ],
  ),
  exchangeRate: field(
    "exchange_rate",
    "Tipo de cambio",
    [
      candidate("calculation", "exchangeRate", AUTHORITIES.CALCULATION),
      candidate("calculation", "banxicoRate", AUTHORITIES.CALCULATION),
    ],
  ),
  udiValue: field(
    "udi_value",
    "Valor UDI",
    [
      candidate("calculation", "udiValue", AUTHORITIES.CALCULATION),
      candidate("calculation", "udi", AUTHORITIES.CALCULATION),
    ],
  ),
});

const SECTION_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: "identity",
    title: "Datos de la cotización",
    fieldIds: Object.freeze([
      "clientName",
      "advisorName",
      "quoteId",
      "acceptedAt",
      "product",
      "productFamily",
      "plan",
    ]),
  }),
  Object.freeze({
    id: "terms",
    title: "Condiciones principales",
    fieldIds: Object.freeze([
      "currency",
      "paymentMode",
      "paymentYears",
      "coveragePeriod",
    ]),
  }),
  Object.freeze({
    id: "protection",
    title: "Protección y coberturas",
    fieldIds: Object.freeze([
      "sumAssured",
      "currentProtectionMXN",
      "optionalCoverages",
    ]),
  }),
  Object.freeze({
    id: "premiums",
    title: "Primas y aportaciones",
    fieldIds: Object.freeze([
      "annualPremium",
      "totalAnnualPremium",
      "totalContributed",
      "totalContributedMXN",
    ]),
  }),
  Object.freeze({
    id: "projections",
    title: "Recuperación y escenarios",
    fieldIds: Object.freeze([
      "totalRecovery",
      "totalRecoveryMXN",
      "monthlyIncomeMXN",
      "annualIncomeMXN",
      "scenarios",
    ]),
  }),
  Object.freeze({
    id: "evidence",
    title: "Fuente y vigencia de los datos",
    fieldIds: Object.freeze([
      "productVersion",
      "sourceDate",
      "exchangeRate",
      "udiValue",
    ]),
  }),
]);

function buildQuotePrintableReadModel({
  reviewSnapshot,
  generatedAt = null,
  locale = "es-MX",
} = {}) {
  if (!isRecord(reviewSnapshot)) {
    throw new TypeError("reviewSnapshot must be a plain object");
  }

  if (reviewSnapshot.packetType !== ACCEPTED_QUOTE_SNAPSHOT_TYPE) {
    throw new TypeError("Unsupported accepted quote snapshot");
  }

  if (
    !isRecord(reviewSnapshot.acceptedQuote) ||
    !isRecord(reviewSnapshot.calculation) ||
    !isRecord(reviewSnapshot.productIntelligence)
  ) {
    throw new TypeError(
      "Accepted quote, calculation and Product Intelligence are required",
    );
  }

  const roots = {
    acceptedQuote: cloneJsonSafe(
      reviewSnapshot.acceptedQuote,
      "reviewSnapshot.acceptedQuote",
    ),
    calculation: cloneJsonSafe(
      reviewSnapshot.calculation,
      "reviewSnapshot.calculation",
    ),
    productIntelligence: cloneJsonSafe(
      reviewSnapshot.productIntelligence,
      "reviewSnapshot.productIntelligence",
    ),
  };

  const selected = Object.fromEntries(
    Object.entries(FIELD_DEFINITIONS).map(([key, definition]) => [
      key,
      selectField(roots, definition),
    ]),
  );

  const sections = SECTION_DEFINITIONS.map((section) => {
    const fields = section.fieldIds.map((fieldId) => selected[fieldId]);
    return deepFreeze({
      id: section.id,
      title: section.title,
      fields,
      availableFieldCount: fields.filter(
        (item) => item.status === "CONFIRMED",
      ).length,
    });
  }).filter((section) => section.availableFieldCount > 0);

  const unavailableRequiredFields = Object.values(selected)
    .filter(
      (item) => item.required && item.status === "UNAVAILABLE",
    )
    .map((item) => item.id);

  const projectionFieldIds = Object.values(selected)
    .filter(
      (item) =>
        item.status === "CONFIRMED" &&
        item.classification === "PROJECTION",
    )
    .map((item) => item.id);

  const sourceIdentity = JSON.stringify({
    acceptedQuote: roots.acceptedQuote,
    calculation: roots.calculation,
    productIntelligence: roots.productIntelligence,
  });
  const sourceHash = hash(sourceIdentity);

  const model = {
    packetType: QUOTE_PRINTABLE_READ_MODEL_TYPE,
    contractVersion: CONTRACT_VERSION,
    documentId: `quote-printable-${sourceHash}`,
    sourceRevisionHash: sourceHash,
    status:
      unavailableRequiredFields.length === 0
        ? "READY_FOR_DOCUMENT_COMPOSITION"
        : "REVIEW_REQUIRED_MISSING_CORE_FIELDS",
    locale: String(locale || "es-MX"),
    generatedAt:
      generatedAt === null ? null : String(generatedAt).trim() || null,
    documentPurpose: "QUOTE_TECHNICAL_COMMERCIAL_RECORD",
    supportedPageFormats: ["A4", "LETTER"],
    summary: {
      client: selected.clientName,
      advisor: selected.advisorName,
      quoteId: selected.quoteId,
      acceptedAt: selected.acceptedAt,
      product: selected.product,
      productFamily: selected.productFamily,
      plan: selected.plan,
      currency: selected.currency,
      paymentMode: selected.paymentMode,
      paymentYears: selected.paymentYears,
      coveragePeriod: selected.coveragePeriod,
      sumAssured: selected.sumAssured,
      annualPremium: selected.annualPremium,
      totalAnnualPremium: selected.totalAnnualPremium,
    },
    sections,
    review: {
      unavailableRequiredFields,
      projectionFieldIds,
      warnings: [
        ...(unavailableRequiredFields.length
          ? [
              "La cotización requiere revisión porque faltan datos esenciales.",
            ]
          : []),
        ...(projectionFieldIds.length
          ? [
              "Las proyecciones no son garantías y deben conservar su fuente y fecha.",
            ]
          : []),
      ],
    },
    disclaimers: [
      "Este documento resume una cotización aceptada para revisión humana.",
      "Las condiciones generales, la póliza emitida y la documentación oficial prevalecen.",
      "Las proyecciones y escenarios no constituyen valores garantizados salvo indicación documental expresa.",
    ],
    authority: {
      quoteTruthOwner: "ACCEPTED_QUOTE_SOURCE",
      calculationTruthOwner: "EXISTING_QUOTE_CALCULATION",
      productTruthOwner: "PRODUCT_INTELLIGENCE",
      documentCompositionOwner: "ADVISOR_OS_QUOTE_PRINTABLE_DOCUMENT",
      finalAuthority: "HUMAN",
    },
    safety: {
      factsEditable: false,
      recalculationAllowed: false,
      productMutationAllowed: false,
      quoteMutationAllowed: false,
      rawPdfAllowed: false,
      automaticSendAllowed: false,
      crmMutationAllowed: false,
      policyMutationAllowed: false,
      taskCreationAllowed: false,
      calendarCreationAllowed: false,
      pdfGenerated: false,
      printExecuted: false,
      persistenceWritten: false,
      humanReviewRequired: true,
    },
  };

  return deepFreeze(model);
}

export {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
  buildQuotePrintableReadModel,
};
