import {
  ORVI_PDF_PARSER_IMPLEMENTATION_REF,
  assertValidOrviPdfParserEnvelope,
} from "./orvi-pdf-parser-contract.js";
import {
  buildOrviProductIntelligence,
  validateOrviProductIntelligence,
} from "../knowledge/orvi-product-intelligence.js";

export const ORVI_PDF_TO_PRODUCT_INTELLIGENCE_ADAPTER_ID = "orvi.pdf-to-product-intelligence.v1";

function valueOf(stateful) {
  if (!stateful || typeof stateful !== "object") return null;
  return ["numeric", "explicit_zero"].includes(stateful.state) ? stateful.value : null;
}

function explicitZero(stateful) {
  return stateful?.state === "explicit_zero";
}

function sourceTraceFromEnvelope(envelope) {
  const fields = [
    "identity.plan_variant",
    "identity.currency",
    "premium_structure.payment_term_years",
    "protection_summary.basic_sum_assured",
    "guaranteed_value_timeline",
  ];
  return fields.map((field) => ({
    field,
    source_type: "solucionline_pdf_text_parser",
    source_ref: ORVI_PDF_TO_PRODUCT_INTELLIGENCE_ADAPTER_ID,
    status: envelope.synthetic_fixture ? "synthetic_confirmed" : "source_confirmed",
    privacy_safe: true,
  }));
}

function mapTimelineRow(row) {
  return {
    policy_year: row.policy_year,
    attained_age: row.real_age,
    currency: row.annual_premium.unit,
    annual_premium: valueOf(row.annual_premium),
    annual_premium_explicit_zero: explicitZero(row.annual_premium),
    additional_premium: valueOf(row.additional_premium),
    additional_premium_explicit_zero: explicitZero(row.additional_premium),
    guaranteed_surrender_value: valueOf(row.guaranteed_surrender_value),
    guaranteed_surrender_value_explicit_zero: explicitZero(row.guaranteed_surrender_value),
    cash_value: valueOf(row.cash_value),
    cash_value_explicit_zero: explicitZero(row.cash_value),
    total_recovery: valueOf(row.total_recovery),
    total_recovery_explicit_zero: explicitZero(row.total_recovery),
    source_status: envelopeRowStatus(row),
  };
}

function envelopeRowStatus(row) {
  const states = [
    row.annual_premium?.state,
    row.additional_premium?.state,
    row.guaranteed_surrender_value?.state,
    row.cash_value?.state,
    row.total_recovery?.state,
  ];
  return states.includes("unreadable") || states.includes("missing")
    ? "source_partial"
    : "source_confirmed";
}

export function mapOrviPdfEnvelopeToProductIntelligence(envelope) {
  assertValidOrviPdfParserEnvelope(envelope);

  const basicCoverage = envelope.coverages.find((coverage) => coverage.code?.startsWith("ORVI_BASE"))
    ?? envelope.coverages[0];
  const firstTimelineRow = envelope.guaranteed_values.rows[0] ?? null;

  const model = buildOrviProductIntelligence({
    identity: {
      detected_product_name: envelope.document.plan_label,
      plan_variant: envelope.document.plan_label,
      currency: envelope.document.currency,
    },
    ownership: {
      parser_ref: ORVI_PDF_PARSER_IMPLEMENTATION_REF,
    },
    participants: {
      primary_insured: {
        age: envelope.insured.age,
        gender: envelope.insured.gender,
      },
    },
    premium_structure: {
      basic_annual_premium: valueOf(basicCoverage?.annual_premium),
      basic_annual_premium_explicit_zero: explicitZero(basicCoverage?.annual_premium),
      additional_annual_premium: valueOf(firstTimelineRow?.additional_premium),
      additional_annual_premium_explicit_zero: explicitZero(firstTimelineRow?.additional_premium),
      total_annual_premium: valueOf(envelope.premium_summary.base_total_annual_premium),
      total_annual_premium_explicit_zero: explicitZero(envelope.premium_summary.base_total_annual_premium),
      displayed_total_with_recommended: valueOf(envelope.premium_summary.displayed_total_with_recommended),
      displayed_total_with_recommended_explicit_zero: explicitZero(envelope.premium_summary.displayed_total_with_recommended),
      visible_line_item_sum: valueOf(envelope.premium_summary.visible_line_item_sum),
      visible_line_item_sum_explicit_zero: explicitZero(envelope.premium_summary.visible_line_item_sum),
      reconciliation: envelope.premium_summary.reconciliation,
      payment_term_years: envelope.document.payment_term_years,
      limited_payment_variant: envelope.document.plan_label,
    },
    protection_summary: {
      basic_sum_assured: valueOf(basicCoverage?.sum_assured),
      basic_sum_assured_explicit_zero: explicitZero(basicCoverage?.sum_assured),
      coverage_duration_years: envelope.document.coverage_duration_years,
      included_coverages: envelope.coverages,
      additional_coverages: envelope.recommended_benefits,
    },
    guaranteed_value_timeline: envelope.guaranteed_values.rows.map(mapTimelineRow),
    source_trace: sourceTraceFromEnvelope(envelope),
  });

  const validation = validateOrviProductIntelligence(model);
  if (!validation.valid) {
    throw new TypeError(`Invalid ORVI Product Intelligence mapping: ${validation.errors.join(",")}`);
  }
  return model;
}
