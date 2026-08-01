export const REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION =
  "report-comparison-definition.v1";

export const REPORT_COMPARISON_KINDS =
  Object.freeze([
    "PREVIOUS_PERIOD",
    "PREVIOUS_YEAR_SAME_PERIOD",
    "TARGET",
    "BUDGET",
    "CUSTOM_BASELINE",
  ]);

export const REPORT_COMPARISON_KIND_ALIASES =
  Object.freeze({
    PERIOD_OVER_PERIOD:
      "PREVIOUS_PERIOD",
    YEAR_OVER_YEAR:
      "PREVIOUS_YEAR_SAME_PERIOD",
  });

const INPUT_KEYS =
  new Set([
    "comparisonId",
    "comparisonVersion",
    "kind",
    "measures",
  ]);

const IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

export class ReportComparisonDefinitionError
  extends TypeError {
  constructor(message) {
    super(
      `ReportComparisonDefinition: ${message}`,
    );
    this.name =
      "ReportComparisonDefinitionError";
  }
}

function definitionError(message) {
  throw new ReportComparisonDefinitionError(
    message,
  );
}

function assertPlainObject(
  value,
  label,
) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    definitionError(
      `${label} must be a plain object`,
    );
  }
}

function assertExactKeys(
  value,
  allowed,
  label,
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      definitionError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function identifier(
  value,
  label,
) {
  if (
    typeof value !== "string" ||
    !IDENTIFIER_PATTERN.test(
      value.trim(),
    )
  ) {
    definitionError(
      `${label} must be a canonical identifier`,
    );
  }

  return value.trim();
}

function normalizeKind(value) {
  const inputKind =
    identifier(
      value,
      "definition.kind",
    );
  const kind =
    REPORT_COMPARISON_KIND_ALIASES[
      inputKind
    ] ??
    inputKind;

  if (
    !REPORT_COMPARISON_KINDS.includes(
      kind,
    )
  ) {
    definitionError(
      `definition.kind ${inputKind} is not supported`,
    );
  }

  return {
    inputKind,
    kind,
  };
}

function identifierSet(
  value,
  label,
) {
  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    definitionError(
      `${label} must be a non-empty array`,
    );
  }

  return [
    ...new Set(
      value.map(
        (item, index) =>
          identifier(
            item,
            `${label}[${index}]`,
          ),
      ),
    ),
  ].sort();
}

function deepFreeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of
    Object.values(value)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

export function createReportComparisonDefinition(
  input,
) {
  assertPlainObject(
    input,
    "definition",
  );
  assertExactKeys(
    input,
    INPUT_KEYS,
    "definition",
  );

  const kinds =
    normalizeKind(
      input.kind,
    );

  return deepFreeze({
    schemaVersion:
      REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION,
    comparisonId:
      identifier(
        input.comparisonId,
        "definition.comparisonId",
      ),
    comparisonVersion:
      identifier(
        input.comparisonVersion,
        "definition.comparisonVersion",
      ),
    inputKind:
      kinds.inputKind,
    kind:
      kinds.kind,
    measures:
      identifierSet(
        input.measures,
        "definition.measures",
      ),
    baselineMode:
      kinds.kind ===
        "PREVIOUS_PERIOD" ||
      kinds.kind ===
        "PREVIOUS_YEAR_SAME_PERIOD"
        ? "REPORT_EXECUTION"
        : kinds.kind ===
            "CUSTOM_BASELINE"
          ? "EXTERNAL_REPORT"
          : "STATIC_VALUES",
    zeroBaselinePolicy:
      "NULL_PERCENT_AND_RATIO",
    favorabilityAuthority:
      false,
    boundary: {
      comparisonAuthority:
        true,
      domainTruthAuthority:
        false,
      periodResolutionAuthority:
        false,
      aggregationAuthority:
        false,
      rankingAuthority:
        false,
      humanWorthAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  });
}
