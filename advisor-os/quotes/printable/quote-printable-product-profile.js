import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
} from "./quote-printable-read-model.js";
import {
  buildQuotePrintableDocument,
} from "./quote-printable-document-composer.js";

const CONTRACT_VERSION = "QPD04_PRODUCT_PROFILE_V1";
const PROFILED_READ_MODEL_CONTRACT_VERSION =
  "QPD04_PROFILED_READ_MODEL_V1";
const PRODUCT_PROFILE_TYPE = "FORGE_QUOTE_PRINTABLE_PRODUCT_PROFILE";

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

const AUTHORITIES = Object.freeze({
  QUOTE: "ACCEPTED_QUOTE_SOURCE",
  CALCULATION: "ACCEPTED_QUOTE_CALCULATION",
  PRODUCT: "PRODUCT_INTELLIGENCE",
});

function isRecord(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function normalizeToken(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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
  return String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce(
      (value, segment) =>
        value === null || typeof value === "undefined"
          ? undefined
          : value[segment],
      root,
    );
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

function candidate(root, path, authority) {
  return Object.freeze({ root, path, authority });
}

function fieldDefinition(id, label, candidates, options = {}) {
  return Object.freeze({
    id,
    label,
    candidates: Object.freeze(candidates),
    classification: options.classification || "FACT",
  });
}

function unavailableField(definition) {
  return deepFreeze({
    id: definition.id,
    label: definition.label,
    status: "UNAVAILABLE",
    classification: definition.classification,
    value: null,
    unit: null,
    truthStatus: "unknown",
    sourcePath: null,
    authority: null,
    editable: false,
    required: false,
  });
}

function extractField(roots, definition) {
  for (const source of definition.candidates) {
    const normalized = normalizeSelectedValue(
      readPath(roots[source.root], source.path),
    );
    if (!normalized.available) continue;

    return deepFreeze({
      id: definition.id,
      label: definition.label,
      status: "CONFIRMED",
      classification: definition.classification,
      value: normalized.value,
      unit: normalized.unit,
      truthStatus: normalized.truthStatus,
      sourcePath: `${source.root}.${source.path}`,
      authority: source.authority,
      editable: false,
      required: false,
    });
  }
  return unavailableField(definition);
}

const EXTRA_FIELD_DEFINITIONS = Object.freeze({
  annualPremiumWithAve: fieldDefinition(
    "annual_premium_with_ave",
    "Prima anual total con AVE",
    [
      candidate("calculation", "annualPremiumWithAve", AUTHORITIES.CALCULATION),
      candidate("calculation", "annualPremiumTotalWithAve", AUTHORITIES.CALCULATION),
      candidate("calculation", "annualPremiumWithRecommended", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.annualPremiumWithAve", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.annualPremiumTotalWithAve", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.premiumTable.plannedAnnual", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "premium_structure.annual_premium_with_ave", AUTHORITIES.PRODUCT),
    ],
  ),
  annualAvePremium: fieldDefinition(
    "annual_ave_premium",
    "Aportación anual AVE",
    [
      candidate("calculation", "annualAvePremium", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.annualAvePremium", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.primaAveAnual", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "premium_structure.annual_ave_premium", AUTHORITIES.PRODUCT),
    ],
  ),
  guaranteePeriod: fieldDefinition(
    "guarantee_period",
    "Periodo garantizado",
    [
      candidate("calculation", "guaranteePeriod", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.guaranteePeriod", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "projection.guarantee_period", AUTHORITIES.PRODUCT),
    ],
  ),
  interestRate: fieldDefinition(
    "interest_rate",
    "Tasa utilizada",
    [
      candidate("calculation", "interestRate", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.interestRate", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "projection.interest_rate", AUTHORITIES.PRODUCT),
    ],
    { classification: "PROJECTION" },
  ),
  deliveryAge: fieldDefinition(
    "delivery_age",
    "Edad de entrega",
    [
      candidate("calculation", "deliveryAge", AUTHORITIES.CALCULATION),
      candidate("calculation", "educationDeliveryAge", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.deliveryAge", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.educationDeliveryAge", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.targetAge", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "education.delivery_age", AUTHORITIES.PRODUCT),
    ],
  ),
  deductible: fieldDefinition(
    "deductible",
    "Deducible",
    [
      candidate("calculation", "deductible", AUTHORITIES.CALCULATION),
      candidate("calculation", "deductibleAmount", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "deductible", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.deductible", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.deductibleAmount", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.deducible", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.deductible", AUTHORITIES.PRODUCT),
      candidate("productIntelligence", "coverage_structure.deductible", AUTHORITIES.PRODUCT),
    ],
  ),
  coinsurance: fieldDefinition(
    "coinsurance",
    "Coaseguro",
    [
      candidate("calculation", "coinsurance", AUTHORITIES.CALCULATION),
      candidate("calculation", "coinsurancePercent", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "coinsurance", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.coinsurance", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.coInsurance", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.coaseguro", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.coinsurance", AUTHORITIES.PRODUCT),
      candidate("productIntelligence", "coverage_structure.coinsurance", AUTHORITIES.PRODUCT),
    ],
  ),
  coinsuranceCap: fieldDefinition(
    "coinsurance_cap",
    "Tope de coaseguro",
    [
      candidate("calculation", "coinsuranceCap", AUTHORITIES.CALCULATION),
      candidate("calculation", "coinsuranceLimit", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.coinsuranceCap", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.coInsuranceCap", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.topeCoaseguro", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.coinsurance_cap", AUTHORITIES.PRODUCT),
    ],
  ),
  hospitalLevel: fieldDefinition(
    "hospital_level",
    "Nivel hospitalario",
    [
      candidate("calculation", "hospitalLevel", AUTHORITIES.CALCULATION),
      candidate("calculation", "hospitalNetworkLevel", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.hospitalLevel", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.hospitalPlan", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.nivelHospitalario", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "plan", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.hospital_level", AUTHORITIES.PRODUCT),
    ],
  ),
  hospitalNetwork: fieldDefinition(
    "hospital_network",
    "Red hospitalaria",
    [
      candidate("calculation", "hospitalNetwork", AUTHORITIES.CALCULATION),
      candidate("calculation", "network", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.hospitalNetwork", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.network", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.redHospitalaria", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.hospital_network", AUTHORITIES.PRODUCT),
    ],
  ),
  territory: fieldDefinition(
    "territory",
    "Territorio de cobertura",
    [
      candidate("calculation", "territory", AUTHORITIES.CALCULATION),
      candidate("calculation", "coverageTerritory", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.territory", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.coverageTerritory", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.territorio", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.territory", AUTHORITIES.PRODUCT),
    ],
  ),
  roomType: fieldDefinition(
    "room_type",
    "Tipo de habitación",
    [
      candidate("calculation", "roomType", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.roomType", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.hospitalRoom", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.tipoHabitacion", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.room_type", AUTHORITIES.PRODUCT),
    ],
  ),
  insuredMembers: fieldDefinition(
    "insured_members",
    "Asegurados incluidos",
    [
      candidate("calculation", "insuredMembers", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "insuredMembers", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.insuredMembers", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.insureds", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.members", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.insured_members", AUTHORITIES.PRODUCT),
    ],
  ),
  maternityCoverage: fieldDefinition(
    "maternity_coverage",
    "Cobertura de maternidad",
    [
      candidate("calculation", "maternityCoverage", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.maternityCoverage", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.maternity", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.maternidad", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.maternity", AUTHORITIES.PRODUCT),
    ],
  ),
  waitingPeriods: fieldDefinition(
    "waiting_periods",
    "Periodos de espera",
    [
      candidate("calculation", "waitingPeriods", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.waitingPeriods", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.periodosEspera", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.waiting_periods", AUTHORITIES.PRODUCT),
    ],
  ),
  medicalBenefits: fieldDefinition(
    "medical_benefits",
    "Beneficios médicos adicionales",
    [
      candidate("calculation", "medicalBenefits", AUTHORITIES.CALCULATION),
      candidate("acceptedQuote", "nativeResult.medicalBenefits", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.additionalBenefits", AUTHORITIES.QUOTE),
      candidate("acceptedQuote", "nativeResult.benefits", AUTHORITIES.QUOTE),
      candidate("productIntelligence", "medical_plan.additional_benefits", AUTHORITIES.PRODUCT),
    ],
  ),
});

function section(id, title, fieldIds) {
  return Object.freeze({
    id,
    title,
    fieldIds: Object.freeze(fieldIds),
  });
}

const COMMON_IDENTITY_FIELDS = Object.freeze([
  "client_name",
  "advisor_name",
  "quote_id",
  "accepted_at",
  "product",
  "product_family",
  "plan",
]);

const PROFILE_REGISTRY = Object.freeze([
  deepFreeze({
    id: "ORVI",
    label: "ORVI",
    aliases: ["orvi"],
    documentTitle: "Cotización ORVI",
    coverDescription:
      "Protección de vida con primas, aportaciones y escenarios confirmados.",
    sections: [
      section("identity", "Datos de la cotización", COMMON_IDENTITY_FIELDS),
      section("terms", "Condiciones del plan", [
        "currency",
        "payment_mode",
        "payment_years",
        "coverage_period",
      ]),
      section("protection", "Protección de vida y coberturas", [
        "sum_assured",
        "current_protection_mxn",
        "optional_coverages",
      ]),
      section("premiums", "Primas y aportaciones", [
        "annual_premium",
        "total_annual_premium",
        "annual_premium_with_ave",
        "annual_ave_premium",
        "total_contributed",
        "total_contributed_mxn",
      ]),
      section("projections", "Recuperación e ingreso proyectado", [
        "total_recovery",
        "total_recovery_mxn",
        "monthly_income_mxn",
        "annual_income_mxn",
        "guarantee_period",
        "scenarios",
      ]),
      section("evidence", "Fuente y equivalencias", [
        "product_version",
        "source_date",
        "exchange_rate",
      ]),
    ],
    recommendedFieldIds: [
      "sum_assured",
      "total_annual_premium",
      "payment_years",
    ],
    warnings: [],
    disclaimers: [
      "Las equivalencias en MXN dependen del tipo de cambio documentado en la cotización.",
    ],
  }),
  deepFreeze({
    id: "IMAGINA_SER",
    label: "Imagina Ser",
    aliases: ["imagina_ser", "imaginaser", "imagina"],
    documentTitle: "Cotización Imagina Ser",
    coverDescription:
      "Solución de protección y ahorro con aportaciones y valores proyectados.",
    sections: [
      section("identity", "Datos de la cotización", COMMON_IDENTITY_FIELDS),
      section("terms", "Condiciones del plan", [
        "currency",
        "payment_mode",
        "payment_years",
        "coverage_period",
      ]),
      section("protection", "Protección contratada", [
        "sum_assured",
        "current_protection_mxn",
        "optional_coverages",
      ]),
      section("premiums", "Aportaciones y AVE", [
        "annual_premium",
        "total_annual_premium",
        "annual_premium_with_ave",
        "annual_ave_premium",
        "total_contributed",
        "total_contributed_mxn",
      ]),
      section("projections", "Valores de recuperación y retiro", [
        "total_recovery",
        "total_recovery_mxn",
        "monthly_income_mxn",
        "annual_income_mxn",
        "guarantee_period",
        "interest_rate",
        "scenarios",
      ]),
      section("evidence", "Fuente y vigencia", [
        "product_version",
        "source_date",
        "exchange_rate",
        "udi_value",
      ]),
    ],
    recommendedFieldIds: [
      "total_annual_premium",
      "total_contributed",
      "total_recovery",
    ],
    warnings: [],
    disclaimers: [
      "Los valores de recuperación y retiro deben leerse con el escenario, plazo y tasa documentados.",
    ],
  }),
  deepFreeze({
    id: "VIDA_MUJER",
    label: "Vida Mujer",
    aliases: ["vida_mujer", "vidamujer"],
    documentTitle: "Cotización Vida Mujer",
    coverDescription:
      "Protección especializada con coberturas y primas confirmadas.",
    sections: [
      section("identity", "Datos de la cotización", COMMON_IDENTITY_FIELDS),
      section("terms", "Condiciones del plan", [
        "currency",
        "payment_mode",
        "payment_years",
        "coverage_period",
      ]),
      section("protection", "Protección y coberturas para la mujer", [
        "sum_assured",
        "current_protection_mxn",
        "optional_coverages",
      ]),
      section("premiums", "Prima de la propuesta", [
        "annual_premium",
        "total_annual_premium",
        "annual_premium_with_ave",
        "annual_ave_premium",
        "total_contributed",
        "total_contributed_mxn",
      ]),
      section("projections", "Valores y recuperación", [
        "total_recovery",
        "total_recovery_mxn",
        "scenarios",
      ]),
      section("evidence", "Fuente y vigencia", [
        "product_version",
        "source_date",
        "exchange_rate",
        "udi_value",
      ]),
    ],
    recommendedFieldIds: [
      "sum_assured",
      "optional_coverages",
      "total_annual_premium",
    ],
    warnings: [
      "Las coberturas especializadas sólo se muestran cuando están confirmadas en la cotización fuente.",
    ],
    disclaimers: [],
  }),
  deepFreeze({
    id: "SEGUBECA",
    label: "SeguBeca",
    aliases: [
      "segubeca",
      "segu_beca",
      "seguro_educacion",
      "seguro_educativo",
    ],
    documentTitle: "Cotización SeguBeca",
    coverDescription:
      "Meta educativa, protección del contratante y entregas expresadas en su unidad confirmada.",
    sections: [
      section("identity", "Datos de la cotización", COMMON_IDENTITY_FIELDS),
      section("education_goal", "Meta educativa", [
        "delivery_age",
        "sum_assured",
        "coverage_period",
        "payment_years",
      ]),
      section("contractor_protection", "Protección del contratante", [
        "current_protection_mxn",
        "optional_coverages",
      ]),
      section("premiums", "Primas y aportaciones", [
        "currency",
        "payment_mode",
        "annual_premium",
        "total_annual_premium",
        "annual_premium_with_ave",
        "total_contributed",
        "total_contributed_mxn",
      ]),
      section("education_delivery", "Entrega educativa", [
        "total_recovery",
        "total_recovery_mxn",
        "interest_rate",
        "scenarios",
      ]),
      section("evidence", "UDI, fuente y vigencia", [
        "udi_value",
        "product_version",
        "source_date",
      ]),
    ],
    recommendedFieldIds: [
      "sum_assured",
      "total_annual_premium",
      "total_recovery",
      "udi_value",
    ],
    warnings: [
      "Las cantidades expresadas en UDI deben conservar el valor UDI y la fecha utilizados.",
    ],
    disclaimers: [
      "Las equivalencias en MXN cambian con el valor de la UDI y no sustituyen la cifra contractual en UDI.",
    ],
  }),
  deepFreeze({
    id: "GMM",
    label: "Gastos Médicos Mayores",
    aliases: [
      "gmm",
      "gastos_medicos",
      "gastos_medicos_mayores",
      "alfa_medical",
      "alfamedical",
      "medical_flex",
      "medicalflex",
    ],
    documentTitle: "Cotización de Gastos Médicos Mayores",
    coverDescription:
      "Configuración del plan médico, participación del asegurado, coberturas y prima confirmada.",
    sections: [
      section("identity", "Datos de la cotización", COMMON_IDENTITY_FIELDS),
      section("medical_plan", "Configuración del plan médico", [
        "hospital_level",
        "hospital_network",
        "territory",
        "room_type",
        "coverage_period",
        "insured_members",
      ]),
      section("cost_sharing", "Participación del asegurado", [
        "deductible",
        "coinsurance",
        "coinsurance_cap",
      ]),
      section("medical_coverage", "Cobertura y beneficios", [
        "sum_assured",
        "optional_coverages",
        "maternity_coverage",
        "waiting_periods",
        "medical_benefits",
      ]),
      section("premium", "Prima de la propuesta", [
        "currency",
        "payment_mode",
        "annual_premium",
        "total_annual_premium",
      ]),
      section("evidence", "Fuente y vigencia", [
        "product_version",
        "source_date",
      ]),
    ],
    recommendedFieldIds: [
      "deductible",
      "coinsurance",
      "hospital_level",
      "sum_assured",
      "total_annual_premium",
    ],
    warnings: [
      "Deducible, coaseguro, red y nivel hospitalario deben corresponder exactamente a la opción cotizada.",
    ],
    disclaimers: [
      "La cobertura médica está sujeta a deducible, coaseguro, periodos de espera, exclusiones, red y condiciones generales aplicables.",
    ],
  }),
]);

const GENERIC_PROFILE = deepFreeze({
  id: "GENERIC",
  label: "Cotización",
  aliases: [],
  documentTitle: "Cotización",
  coverDescription:
    "Resumen técnico-comercial de la cotización aceptada.",
  sections: [],
  recommendedFieldIds: [],
  warnings: [
    "No se identificó una familia con perfil documental específico; se conserva la composición genérica.",
  ],
  disclaimers: [],
});

function sourceCandidates(readModel, roots) {
  return [
    ["summary.productFamily", readModel.summary?.productFamily?.value],
    ["summary.product", readModel.summary?.product?.value],
    ["calculation.productFamily", roots.calculation?.productFamily],
    ["calculation.product", roots.calculation?.product],
    ["acceptedQuote.context.productFamily", roots.acceptedQuote?.context?.productFamily],
    ["acceptedQuote.context.product_family", roots.acceptedQuote?.context?.product_family],
    ["acceptedQuote.nativeResult.productFamily", roots.acceptedQuote?.nativeResult?.productFamily],
    ["acceptedQuote.nativeResult.product", roots.acceptedQuote?.nativeResult?.product],
    ["productIntelligence.schema.id", roots.productIntelligence?.schema?.id],
    ["productIntelligence.identity.detected_product_name", roots.productIntelligence?.identity?.detected_product_name],
  ].filter(([, value]) => hasValue(value));
}

function detectProfile(readModel, roots) {
  const candidates = sourceCandidates(readModel, roots);
  for (const [sourcePath, value] of candidates) {
    const normalized = normalizeToken(value);
    for (const profile of PROFILE_REGISTRY) {
      if (
        profile.aliases.some((alias) =>
          normalized.includes(normalizeToken(alias)),
        )
      ) {
        return { profile, detectedFrom: sourcePath, detectedValue: value };
      }
    }
  }
  return {
    profile: GENERIC_PROFILE,
    detectedFrom: null,
    detectedValue: null,
  };
}

function fieldsFromReadModel(readModel) {
  const fields = new Map();
  for (const field of Object.values(readModel.summary || {})) {
    if (isRecord(field) && field.id) fields.set(field.id, field);
  }
  for (const sectionItem of readModel.sections || []) {
    for (const field of sectionItem.fields || []) {
      if (field?.id) fields.set(field.id, field);
    }
  }
  return fields;
}

function sourceRevisionHash(roots) {
  return hash(JSON.stringify({
    acceptedQuote: roots.acceptedQuote,
    calculation: roots.calculation,
    productIntelligence: roots.productIntelligence,
  }));
}

function genericSections(readModel) {
  return (readModel.sections || []).map((sectionItem) =>
    deepFreeze({
      ...cloneJsonSafe(sectionItem),
      fields: (sectionItem.fields || []).map((field) =>
        deepFreeze(cloneJsonSafe(field)),
      ),
    }),
  );
}

function productSections(profile, fieldMap) {
  return profile.sections
    .map((definition) => {
      const fields = definition.fieldIds
        .map((fieldId) => fieldMap.get(fieldId))
        .filter(Boolean);
      return deepFreeze({
        id: definition.id,
        title: definition.title,
        fields,
        availableFieldCount: fields.filter(
          (field) => field.status === "CONFIRMED",
        ).length,
      });
    })
    .filter((sectionItem) => sectionItem.availableFieldCount > 0);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot,
} = {}) {
  if (!isRecord(readModel)) {
    throw new TypeError("readModel must be a plain object");
  }
  if (readModel.packetType !== QUOTE_PRINTABLE_READ_MODEL_TYPE) {
    throw new TypeError("Unsupported quote printable read model");
  }
  if (readModel.status !== "READY_FOR_DOCUMENT_COMPOSITION") {
    throw new TypeError(
      "Quote printable read model requires human review before profiling",
    );
  }
  if (!isRecord(reviewSnapshot)) {
    throw new TypeError("reviewSnapshot must be a plain object");
  }
  if (reviewSnapshot.packetType !== ACCEPTED_QUOTE_SNAPSHOT_TYPE) {
    throw new TypeError("Unsupported accepted quote snapshot");
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

  if (sourceRevisionHash(roots) !== readModel.sourceRevisionHash) {
    throw new TypeError(
      "Accepted quote snapshot does not match the printable read model revision",
    );
  }

  const detection = detectProfile(readModel, roots);
  const fieldMap = fieldsFromReadModel(readModel);
  for (const definition of Object.values(EXTRA_FIELD_DEFINITIONS)) {
    fieldMap.set(definition.id, extractField(roots, definition));
  }

  const profile = detection.profile;
  const sections = profile.id === "GENERIC"
    ? genericSections(readModel)
    : productSections(profile, fieldMap);
  const visibleFields = sections.flatMap((sectionItem) => sectionItem.fields);
  const visibleFieldIds = new Set(visibleFields.map((field) => field.id));
  const projectionFieldIds = visibleFields
    .filter(
      (field) =>
        field.status === "CONFIRMED" &&
        field.classification === "PROJECTION",
    )
    .map((field) => field.id);
  const missingRecommendedFieldIds = profile.recommendedFieldIds.filter(
    (fieldId) => fieldMap.get(fieldId)?.status !== "CONFIRMED",
  );
  const dynamicWarnings = missingRecommendedFieldIds.length
    ? [
        `Faltan datos recomendados para ${profile.label}: ${missingRecommendedFieldIds.join(", ")}.`,
      ]
    : [];
  const baseWarnings = (readModel.review?.warnings || []).filter(
    (warning) =>
      projectionFieldIds.length > 0 ||
      !String(warning).toLowerCase().includes("proyecciones"),
  );
  const disclaimers = (readModel.disclaimers || []).filter(
    (disclaimer) =>
      projectionFieldIds.length > 0 ||
      !String(disclaimer).toLowerCase().includes("proyecciones"),
  );
  const suppressedGenericSectionIds = (readModel.sections || [])
    .map((sectionItem) => sectionItem.id)
    .filter((sectionId) => !sections.some((item) => item.id === sectionId));

  return deepFreeze({
    ...cloneJsonSafe(readModel),
    contractVersion: PROFILED_READ_MODEL_CONTRACT_VERSION,
    documentId: `${readModel.documentId}-${profile.id.toLowerCase()}`,
    sections,
    review: {
      ...cloneJsonSafe(readModel.review || {}),
      projectionFieldIds,
      warnings: unique([
        ...baseWarnings,
        ...profile.warnings,
        ...dynamicWarnings,
      ]),
    },
    disclaimers: unique([
      ...disclaimers,
      ...profile.disclaimers,
    ]),
    productProfile: {
      packetType: PRODUCT_PROFILE_TYPE,
      contractVersion: CONTRACT_VERSION,
      id: profile.id,
      label: profile.label,
      documentTitle: profile.documentTitle,
      coverDescription: profile.coverDescription,
      detectedFrom: detection.detectedFrom,
      detectedValue: detection.detectedValue,
      fallbackUsed: profile.id === "GENERIC",
      sectionOrder: sections.map((sectionItem) => sectionItem.id),
      visibleFieldIds: [...visibleFieldIds],
      missingRecommendedFieldIds,
      suppressedGenericSectionIds,
    },
    authority: {
      ...cloneJsonSafe(readModel.authority || {}),
      productProfileOwner:
        "ADVISOR_OS_QUOTE_PRINTABLE_PRODUCT_PROFILE",
    },
    safety: {
      ...cloneJsonSafe(readModel.safety || {}),
      factsEditable: false,
      recalculationAllowed: false,
      productMutationAllowed: false,
      quoteMutationAllowed: false,
      automaticSendAllowed: false,
      persistenceWritten: false,
      humanReviewRequired: true,
    },
  });
}

function buildProductSpecificQuotePrintableDocument({
  readModel,
  pageFormat = "A4",
} = {}) {
  if (
    !isRecord(readModel) ||
    readModel.productProfile?.packetType !== PRODUCT_PROFILE_TYPE
  ) {
    throw new TypeError("Product-profiled printable read model required");
  }

  const document = buildQuotePrintableDocument({
    readModel,
    pageFormat,
    documentTitle: readModel.productProfile.documentTitle,
  });

  return deepFreeze({
    ...document,
    productProfile: cloneJsonSafe(readModel.productProfile),
  });
}

export {
  CONTRACT_VERSION,
  PRODUCT_PROFILE_TYPE,
  PROFILED_READ_MODEL_CONTRACT_VERSION,
  PROFILE_REGISTRY,
  buildProductSpecificQuotePrintableDocument,
  buildProductSpecificQuotePrintableReadModel,
};
