import { ACCEPTED_QUOTE_SNAPSHOT_TYPE, QUOTE_PRINTABLE_READ_MODEL_TYPE } from "./quote-printable-read-model.js";
import { buildQuotePrintableDocument } from "./quote-printable-document-composer.js";

const CONTRACT_VERSION = "QPD04_PRODUCT_PROFILE_V1";
const PROFILED_READ_MODEL_CONTRACT_VERSION = "QPD04_PROFILED_READ_MODEL_V1";
const PRODUCT_PROFILE_TYPE = "FORGE_QUOTE_PRINTABLE_PRODUCT_PROFILE";
const GENERIC_SECTION_IDS = Object.freeze(["identity", "terms", "protection", "premiums", "projections", "evidence"]);
const FORBIDDEN_KEYS = new Set(["arraybuffer", "base64", "binary", "blob", "dataurl", "file", "pdfbytes", "rawpdf"]);
const AUTH = Object.freeze({ QUOTE: "ACCEPTED_QUOTE_SOURCE", CALC: "ACCEPTED_QUOTE_CALCULATION", PRODUCT: "PRODUCT_INTELLIGENCE" });

const isRecord = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const token = value => String(value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const keyToken = value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const hasValue = value => value !== null && typeof value !== "undefined" && (typeof value !== "string" || value.trim()) && (!Array.isArray(value) || value.length);

function cloneSafe(value, path = "root", seen = new WeakSet()) {
  if (value === null || ["string", "boolean"].includes(typeof value)) return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`Non-finite number at ${path}`);
    return value;
  }
  if (typeof value === "undefined") throw new TypeError(`Undefined value at ${path}`);
  if (["function", "symbol", "bigint"].includes(typeof value)) throw new TypeError(`Non-JSON value at ${path}`);
  if (typeof ArrayBuffer !== "undefined" && (value instanceof ArrayBuffer || ArrayBuffer.isView?.(value))) throw new TypeError(`Binary value at ${path}`);
  if (seen.has(value)) throw new TypeError(`Circular value at ${path}`);
  seen.add(value);
  if (Array.isArray(value)) {
    const output = value.map((item, index) => cloneSafe(item, `${path}[${index}]`, seen));
    seen.delete(value);
    return output;
  }
  if (!isRecord(value)) throw new TypeError(`Non-plain object at ${path}`);
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(keyToken(key))) throw new TypeError(`Forbidden raw document key at ${path}.${key}`);
    output[key] = cloneSafe(item, `${path}.${key}`, seen);
  }
  seen.delete(value);
  return output;
}

function freeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const item of Object.values(value)) freeze(item, seen);
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

const readPath = (root, path) => String(path || "").split(".").filter(Boolean).reduce((value, segment) => value == null ? undefined : value[segment], root);
const candidate = (root, path, authority) => Object.freeze({ root, path, authority });
const definition = (id, label, candidates, classification = "FACT") => Object.freeze({ id, label, candidates: Object.freeze(candidates), classification });

function normalizeValue(value) {
  if (isRecord(value) && Object.hasOwn(value, "truth_status") && value.truth_status !== "source_provided") return { available: false, value: null, unit: value.currency || value.unit || null, truthStatus: String(value.truth_status || "unknown") };
  if (isRecord(value) && Object.hasOwn(value, "value")) return { available: Boolean(hasValue(value.value)), value: hasValue(value.value) ? cloneSafe(value.value) : null, unit: value.currency || value.unit || null, truthStatus: value.truth_status || null };
  return { available: Boolean(hasValue(value)), value: hasValue(value) ? cloneSafe(value) : null, unit: null, truthStatus: null };
}

function extract(roots, item) {
  for (const source of item.candidates) {
    const normalized = normalizeValue(readPath(roots[source.root], source.path));
    if (!normalized.available) continue;
    return freeze({ id: item.id, label: item.label, status: "CONFIRMED", classification: item.classification, value: normalized.value, unit: normalized.unit, truthStatus: normalized.truthStatus, sourcePath: `${source.root}.${source.path}`, authority: source.authority, editable: false, required: false });
  }
  return freeze({ id: item.id, label: item.label, status: "UNAVAILABLE", classification: item.classification, value: null, unit: null, truthStatus: "unknown", sourcePath: null, authority: null, editable: false, required: false });
}

const EXTRA = Object.freeze([
  definition("annual_premium_with_ave", "Prima anual total con AVE", [candidate("calculation", "annualPremiumWithAve", AUTH.CALC), candidate("calculation", "annualPremiumTotalWithAve", AUTH.CALC), candidate("calculation", "annualPremiumWithRecommended", AUTH.CALC), candidate("acceptedQuote", "nativeResult.annualPremiumWithAve", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.annualPremiumTotalWithAve", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.premiumTable.plannedAnnual", AUTH.QUOTE), candidate("productIntelligence", "premium_structure.annual_premium_with_ave", AUTH.PRODUCT)]),
  definition("annual_ave_premium", "Aportación anual AVE", [candidate("calculation", "annualAvePremium", AUTH.CALC), candidate("acceptedQuote", "nativeResult.annualAvePremium", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.primaAveAnual", AUTH.QUOTE), candidate("productIntelligence", "premium_structure.annual_ave_premium", AUTH.PRODUCT)]),
  definition("guarantee_period", "Periodo garantizado", [candidate("calculation", "guaranteePeriod", AUTH.CALC), candidate("acceptedQuote", "nativeResult.guaranteePeriod", AUTH.QUOTE), candidate("productIntelligence", "projection.guarantee_period", AUTH.PRODUCT)]),
  definition("interest_rate", "Tasa utilizada", [candidate("calculation", "interestRate", AUTH.CALC), candidate("acceptedQuote", "nativeResult.interestRate", AUTH.QUOTE), candidate("productIntelligence", "projection.interest_rate", AUTH.PRODUCT)], "PROJECTION"),
  definition("delivery_age", "Edad de entrega", [candidate("calculation", "deliveryAge", AUTH.CALC), candidate("calculation", "educationDeliveryAge", AUTH.CALC), candidate("acceptedQuote", "nativeResult.deliveryAge", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.educationDeliveryAge", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.targetAge", AUTH.QUOTE), candidate("productIntelligence", "education.delivery_age", AUTH.PRODUCT)]),
  definition("contractor_protection_coverages", "Protección del contratante", [candidate("calculation", "contractorProtectionCoverages", AUTH.CALC), candidate("calculation", "optionalCoverages", AUTH.CALC), candidate("acceptedQuote", "optionalCoverages", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.recommendedCoverages", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.contractorProtectionCoverages", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.coverages", AUTH.QUOTE), candidate("productIntelligence", "education.contractor_protection_coverages", AUTH.PRODUCT)]),
  definition("deductible", "Deducible", [candidate("calculation", "deductible", AUTH.CALC), candidate("calculation", "deductibleAmount", AUTH.CALC), candidate("acceptedQuote", "deductible", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.deductible", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.deductibleAmount", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.deducible", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.deductible", AUTH.PRODUCT), candidate("productIntelligence", "coverage_structure.deductible", AUTH.PRODUCT)]),
  definition("coinsurance", "Coaseguro", [candidate("calculation", "coinsurance", AUTH.CALC), candidate("calculation", "coinsurancePercent", AUTH.CALC), candidate("acceptedQuote", "coinsurance", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.coinsurance", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.coInsurance", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.coaseguro", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.coinsurance", AUTH.PRODUCT), candidate("productIntelligence", "coverage_structure.coinsurance", AUTH.PRODUCT)]),
  definition("coinsurance_cap", "Tope de coaseguro", [candidate("calculation", "coinsuranceCap", AUTH.CALC), candidate("calculation", "coinsuranceLimit", AUTH.CALC), candidate("acceptedQuote", "nativeResult.coinsuranceCap", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.coInsuranceCap", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.topeCoaseguro", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.coinsurance_cap", AUTH.PRODUCT)]),
  definition("hospital_level", "Nivel hospitalario", [candidate("calculation", "hospitalLevel", AUTH.CALC), candidate("calculation", "hospitalNetworkLevel", AUTH.CALC), candidate("acceptedQuote", "nativeResult.hospitalLevel", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.hospitalPlan", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.nivelHospitalario", AUTH.QUOTE), candidate("acceptedQuote", "plan", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.hospital_level", AUTH.PRODUCT)]),
  definition("hospital_network", "Red hospitalaria", [candidate("calculation", "hospitalNetwork", AUTH.CALC), candidate("calculation", "network", AUTH.CALC), candidate("acceptedQuote", "nativeResult.hospitalNetwork", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.network", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.redHospitalaria", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.hospital_network", AUTH.PRODUCT)]),
  definition("territory", "Territorio de cobertura", [candidate("calculation", "territory", AUTH.CALC), candidate("calculation", "coverageTerritory", AUTH.CALC), candidate("acceptedQuote", "nativeResult.territory", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.coverageTerritory", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.territorio", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.territory", AUTH.PRODUCT)]),
  definition("room_type", "Tipo de habitación", [candidate("calculation", "roomType", AUTH.CALC), candidate("acceptedQuote", "nativeResult.roomType", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.hospitalRoom", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.tipoHabitacion", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.room_type", AUTH.PRODUCT)]),
  definition("insured_members", "Asegurados incluidos", [candidate("calculation", "insuredMembers", AUTH.CALC), candidate("acceptedQuote", "insuredMembers", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.insuredMembers", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.insureds", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.members", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.insured_members", AUTH.PRODUCT)]),
  definition("maternity_coverage", "Cobertura de maternidad", [candidate("calculation", "maternityCoverage", AUTH.CALC), candidate("acceptedQuote", "nativeResult.maternityCoverage", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.maternity", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.maternidad", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.maternity", AUTH.PRODUCT)]),
  definition("waiting_periods", "Periodos de espera", [candidate("calculation", "waitingPeriods", AUTH.CALC), candidate("acceptedQuote", "nativeResult.waitingPeriods", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.periodosEspera", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.waiting_periods", AUTH.PRODUCT)]),
  definition("medical_benefits", "Beneficios médicos adicionales", [candidate("calculation", "medicalBenefits", AUTH.CALC), candidate("acceptedQuote", "nativeResult.medicalBenefits", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.additionalBenefits", AUTH.QUOTE), candidate("acceptedQuote", "nativeResult.benefits", AUTH.QUOTE), candidate("productIntelligence", "medical_plan.additional_benefits", AUTH.PRODUCT)]),
]);

const section = (id, title, fieldIds) => Object.freeze({ id, title, fieldIds: Object.freeze(fieldIds) });
const IDENTITY = Object.freeze(["client_name", "advisor_name", "quote_id", "accepted_at", "product", "product_family", "plan"]);

const PROFILE_REGISTRY = Object.freeze([
  freeze({ id: "ORVI", label: "ORVI", aliases: ["orvi"], documentTitle: "Cotización ORVI", coverDescription: "Protección de vida con primas, aportaciones y escenarios confirmados.", sections: [section("identity", "Datos de la cotización", IDENTITY), section("terms", "Condiciones del plan", ["currency", "payment_mode", "payment_years", "coverage_period"]), section("protection", "Protección de vida y coberturas", ["sum_assured", "current_protection_mxn", "optional_coverages"]), section("premiums", "Primas y aportaciones", ["annual_premium", "total_annual_premium", "annual_premium_with_ave", "annual_ave_premium", "total_contributed", "total_contributed_mxn"]), section("projections", "Recuperación e ingreso proyectado", ["total_recovery", "total_recovery_mxn", "monthly_income_mxn", "annual_income_mxn", "guarantee_period", "scenarios"]), section("evidence", "Fuente y equivalencias", ["product_version", "source_date", "exchange_rate"])], recommended: ["sum_assured", "total_annual_premium", "payment_years"], warnings: [], disclaimers: ["Las equivalencias en MXN dependen del tipo de cambio documentado en la cotización."] }),
  freeze({ id: "IMAGINA_SER", label: "Imagina Ser", aliases: ["imagina_ser", "imaginaser", "imagina"], documentTitle: "Cotización Imagina Ser", coverDescription: "Solución de protección y ahorro con aportaciones y valores proyectados.", sections: [section("identity", "Datos de la cotización", IDENTITY), section("terms", "Condiciones del plan", ["currency", "payment_mode", "payment_years", "coverage_period"]), section("protection", "Protección contratada", ["sum_assured", "current_protection_mxn", "optional_coverages"]), section("premiums", "Aportaciones y AVE", ["annual_premium", "total_annual_premium", "annual_premium_with_ave", "annual_ave_premium", "total_contributed", "total_contributed_mxn"]), section("projections", "Valores de recuperación y retiro", ["total_recovery", "total_recovery_mxn", "monthly_income_mxn", "annual_income_mxn", "guarantee_period", "interest_rate", "scenarios"]), section("evidence", "Fuente y vigencia", ["product_version", "source_date", "exchange_rate", "udi_value"])], recommended: ["total_annual_premium", "total_contributed", "total_recovery"], warnings: [], disclaimers: ["Los valores de recuperación y retiro deben leerse con el escenario, plazo y tasa documentados."] }),
  freeze({ id: "VIDA_MUJER", label: "Vida Mujer", aliases: ["vida_mujer", "vidamujer"], documentTitle: "Cotización Vida Mujer", coverDescription: "Protección especializada con coberturas y primas confirmadas.", sections: [section("identity", "Datos de la cotización", IDENTITY), section("terms", "Condiciones del plan", ["currency", "payment_mode", "payment_years", "coverage_period"]), section("protection", "Protección y coberturas para la mujer", ["sum_assured", "current_protection_mxn", "optional_coverages"]), section("premiums", "Prima de la propuesta", ["annual_premium", "total_annual_premium", "annual_premium_with_ave", "annual_ave_premium", "total_contributed", "total_contributed_mxn"]), section("projections", "Valores y recuperación", ["total_recovery", "total_recovery_mxn", "scenarios"]), section("evidence", "Fuente y vigencia", ["product_version", "source_date", "exchange_rate", "udi_value"])], recommended: ["sum_assured", "optional_coverages", "total_annual_premium"], warnings: ["Las coberturas especializadas sólo se muestran cuando están confirmadas en la cotización fuente."], disclaimers: [] }),
  freeze({ id: "SEGUBECA", label: "SeguBeca", aliases: ["segubeca", "segu_beca", "seguro_educacion", "seguro_educativo"], documentTitle: "Cotización SeguBeca", coverDescription: "Meta educativa, protección del contratante y entregas expresadas en su unidad confirmada.", sections: [section("identity", "Datos de la cotización", IDENTITY), section("education_goal", "Meta educativa", ["delivery_age", "sum_assured", "coverage_period", "payment_years"]), section("contractor_protection", "Protección del contratante", ["current_protection_mxn", "contractor_protection_coverages"]), section("premiums", "Primas y aportaciones", ["currency", "payment_mode", "annual_premium", "total_annual_premium", "annual_premium_with_ave", "total_contributed", "total_contributed_mxn"]), section("education_delivery", "Entrega educativa", ["total_recovery", "total_recovery_mxn", "interest_rate", "scenarios"]), section("evidence", "UDI, fuente y vigencia", ["udi_value", "product_version", "source_date"])], recommended: ["sum_assured", "total_annual_premium", "total_recovery", "udi_value"], warnings: ["Las cantidades expresadas en UDI deben conservar el valor UDI y la fecha utilizados."], disclaimers: ["Las equivalencias en MXN cambian con el valor de la UDI y no sustituyen la cifra contractual en UDI."] }),
  freeze({ id: "GMM", label: "Gastos Médicos Mayores", aliases: ["gmm", "gastos_medicos", "gastos_medicos_mayores", "alfa_medical", "alfamedical", "medical_flex", "medicalflex"], documentTitle: "Cotización de Gastos Médicos Mayores", coverDescription: "Configuración del plan médico, participación del asegurado, coberturas y prima confirmada.", sections: [section("identity", "Datos de la cotización", IDENTITY), section("medical_plan", "Configuración del plan médico", ["hospital_level", "hospital_network", "territory", "room_type", "coverage_period", "insured_members"]), section("cost_sharing", "Participación del asegurado", ["deductible", "coinsurance", "coinsurance_cap"]), section("medical_coverage", "Cobertura y beneficios", ["sum_assured", "optional_coverages", "maternity_coverage", "waiting_periods", "medical_benefits"]), section("premium", "Prima de la propuesta", ["currency", "payment_mode", "annual_premium", "total_annual_premium"]), section("evidence", "Fuente y vigencia", ["product_version", "source_date"])], recommended: ["deductible", "coinsurance", "hospital_level", "sum_assured", "total_annual_premium"], warnings: ["Deducible, coaseguro, red y nivel hospitalario deben corresponder exactamente a la opción cotizada."], disclaimers: ["La cobertura médica está sujeta a deducible, coaseguro, periodos de espera, exclusiones, red y condiciones generales aplicables."] }),
]);

const GENERIC = freeze({ id: "GENERIC", label: "Cotización", aliases: [], documentTitle: "Cotización", coverDescription: "Resumen técnico-comercial de la cotización aceptada.", sections: [], recommended: [], warnings: ["No se identificó una familia con perfil documental específico; se conserva la composición genérica."], disclaimers: [] });

function detect(readModel, roots) {
  const candidates = [
    ["summary.productFamily", readModel.summary?.productFamily?.value], ["summary.product", readModel.summary?.product?.value], ["calculation.productFamily", roots.calculation?.productFamily], ["calculation.product", roots.calculation?.product], ["acceptedQuote.context.productFamily", roots.acceptedQuote?.context?.productFamily], ["acceptedQuote.context.product_family", roots.acceptedQuote?.context?.product_family], ["acceptedQuote.nativeResult.productFamily", roots.acceptedQuote?.nativeResult?.productFamily], ["acceptedQuote.nativeResult.product", roots.acceptedQuote?.nativeResult?.product], ["productIntelligence.schema.id", roots.productIntelligence?.schema?.id], ["productIntelligence.identity.detected_product_name", roots.productIntelligence?.identity?.detected_product_name],
  ].filter(([, value]) => hasValue(value));
  for (const [source, value] of candidates) {
    const normalized = token(value);
    for (const profile of PROFILE_REGISTRY) if (profile.aliases.some(alias => normalized.includes(token(alias)))) return { profile, source, value };
  }
  return { profile: GENERIC, source: null, value: null };
}

function fieldMap(readModel, roots) {
  const map = new Map();
  for (const item of Object.values(readModel.summary || {})) if (item?.id) map.set(item.id, item);
  for (const sectionItem of readModel.sections || []) for (const item of sectionItem.fields || []) if (item?.id) map.set(item.id, item);
  for (const item of EXTRA) map.set(item.id, extract(roots, item));
  return map;
}

function sourceHash(roots) {
  return hash(JSON.stringify({ acceptedQuote: roots.acceptedQuote, calculation: roots.calculation, productIntelligence: roots.productIntelligence }));
}

function genericSections(readModel) {
  return (readModel.sections || []).map(item => freeze(cloneSafe(item)));
}

function profiledSections(profile, map) {
  return profile.sections.map(item => {
    const fields = item.fieldIds.map(id => map.get(id)).filter(Boolean);
    return freeze({ id: item.id, title: item.title, fields, availableFieldCount: fields.filter(field => field.status === "CONFIRMED").length });
  }).filter(item => item.availableFieldCount > 0);
}

const unique = values => [...new Set(values.filter(Boolean))];

function buildProductSpecificQuotePrintableReadModel({ readModel, reviewSnapshot } = {}) {
  if (!isRecord(readModel)) throw new TypeError("readModel must be a plain object");
  if (readModel.packetType !== QUOTE_PRINTABLE_READ_MODEL_TYPE) throw new TypeError("Unsupported quote printable read model");
  if (readModel.status !== "READY_FOR_DOCUMENT_COMPOSITION") throw new TypeError("Quote printable read model requires human review before profiling");
  if (!isRecord(reviewSnapshot)) throw new TypeError("reviewSnapshot must be a plain object");
  if (reviewSnapshot.packetType !== ACCEPTED_QUOTE_SNAPSHOT_TYPE) throw new TypeError("Unsupported accepted quote snapshot");
  const roots = { acceptedQuote: cloneSafe(reviewSnapshot.acceptedQuote, "reviewSnapshot.acceptedQuote"), calculation: cloneSafe(reviewSnapshot.calculation, "reviewSnapshot.calculation"), productIntelligence: cloneSafe(reviewSnapshot.productIntelligence, "reviewSnapshot.productIntelligence") };
  if (sourceHash(roots) !== readModel.sourceRevisionHash) throw new TypeError("Accepted quote snapshot does not match the printable read model revision");
  const found = detect(readModel, roots);
  const map = fieldMap(readModel, roots);
  const sections = found.profile.id === "GENERIC" ? genericSections(readModel) : profiledSections(found.profile, map);
  const visible = sections.flatMap(item => item.fields);
  const projectionFieldIds = visible.filter(item => item.status === "CONFIRMED" && item.classification === "PROJECTION").map(item => item.id);
  const missing = found.profile.recommended.filter(id => map.get(id)?.status !== "CONFIRMED");
  const baseWarnings = (readModel.review?.warnings || []).filter(text => projectionFieldIds.length || !String(text).toLowerCase().includes("proyecciones"));
  const baseDisclaimers = (readModel.disclaimers || []).filter(text => projectionFieldIds.length || !String(text).toLowerCase().includes("proyecciones"));
  const sectionIds = new Set(sections.map(item => item.id));
  return freeze({
    ...cloneSafe(readModel),
    contractVersion: PROFILED_READ_MODEL_CONTRACT_VERSION,
    documentId: `${readModel.documentId}-${found.profile.id.toLowerCase()}`,
    sections,
    review: { ...cloneSafe(readModel.review || {}), projectionFieldIds, warnings: unique([...baseWarnings, ...found.profile.warnings, ...(missing.length ? [`Faltan datos recomendados para ${found.profile.label}: ${missing.join(", ")}.`] : [])]) },
    disclaimers: unique([...baseDisclaimers, ...found.profile.disclaimers]),
    productProfile: { packetType: PRODUCT_PROFILE_TYPE, contractVersion: CONTRACT_VERSION, id: found.profile.id, label: found.profile.label, documentTitle: found.profile.documentTitle, coverDescription: found.profile.coverDescription, detectedFrom: found.source, detectedValue: found.value, fallbackUsed: found.profile.id === "GENERIC", sectionOrder: sections.map(item => item.id), visibleFieldIds: visible.map(item => item.id), missingRecommendedFieldIds: missing, suppressedGenericSectionIds: GENERIC_SECTION_IDS.filter(id => !sectionIds.has(id)) },
    authority: { ...cloneSafe(readModel.authority || {}), productProfileOwner: "ADVISOR_OS_QUOTE_PRINTABLE_PRODUCT_PROFILE" },
    safety: { ...cloneSafe(readModel.safety || {}), factsEditable: false, recalculationAllowed: false, productMutationAllowed: false, quoteMutationAllowed: false, automaticSendAllowed: false, persistenceWritten: false, humanReviewRequired: true },
  });
}

function buildProductSpecificQuotePrintableDocument({ readModel, pageFormat = "A4" } = {}) {
  if (!isRecord(readModel) || readModel.productProfile?.packetType !== PRODUCT_PROFILE_TYPE) throw new TypeError("Product-profiled printable read model required");
  const document = buildQuotePrintableDocument({ readModel, pageFormat, documentTitle: readModel.productProfile.documentTitle });
  return freeze({ ...document, productProfile: cloneSafe(readModel.productProfile) });
}

export { CONTRACT_VERSION, PRODUCT_PROFILE_TYPE, PROFILED_READ_MODEL_CONTRACT_VERSION, PROFILE_REGISTRY, buildProductSpecificQuotePrintableDocument, buildProductSpecificQuotePrintableReadModel };
