export const REPORT_DEFINITION_SCHEMA_VERSION =
  "report-definition.v1";

const INPUT_KEYS =
  new Set([
    "definitionId",
    "definitionVersion",
    "providerId",
    "dimensions",
    "measures",
    "defaultDimensions",
    "defaultMeasures",
  ]);

const IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

export class ReportDefinitionError
  extends TypeError {
  constructor(message) {
    super(
      `ReportDefinition: ${message}`,
    );
    this.name =
      "ReportDefinitionError";
  }
}

function definitionError(message) {
  throw new ReportDefinitionError(
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

function identifierSet(
  value,
  label,
  {
    allowEmpty = true,
  } = {},
) {
  if (!Array.isArray(value)) {
    definitionError(
      `${label} must be an array`,
    );
  }

  const normalized =
    value.map(
      (item, index) =>
        identifier(
          item,
          `${label}[${index}]`,
        ),
    );
  const unique =
    [...new Set(normalized)]
      .sort();

  if (
    !allowEmpty &&
    unique.length === 0
  ) {
    definitionError(
      `${label} must not be empty`,
    );
  }

  return unique;
}

function assertSubset(
  subset,
  parent,
  label,
) {
  for (const item of subset) {
    if (!parent.includes(item)) {
      definitionError(
        `${label} contains unsupported identifier ${item}`,
      );
    }
  }
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

export function createReportDefinition(
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

  const dimensions =
    identifierSet(
      input.dimensions ?? [],
      "definition.dimensions",
    );
  const measures =
    identifierSet(
      input.measures,
      "definition.measures",
      {
        allowEmpty: false,
      },
    );
  const defaultDimensions =
    identifierSet(
      input.defaultDimensions ?? [],
      "definition.defaultDimensions",
    );
  const defaultMeasures =
    identifierSet(
      input.defaultMeasures,
      "definition.defaultMeasures",
      {
        allowEmpty: false,
      },
    );

  assertSubset(
    defaultDimensions,
    dimensions,
    "definition.defaultDimensions",
  );
  assertSubset(
    defaultMeasures,
    measures,
    "definition.defaultMeasures",
  );

  return deepFreeze({
    schemaVersion:
      REPORT_DEFINITION_SCHEMA_VERSION,
    definitionId:
      identifier(
        input.definitionId,
        "definition.definitionId",
      ),
    definitionVersion:
      identifier(
        input.definitionVersion,
        "definition.definitionVersion",
      ),
    providerId:
      identifier(
        input.providerId,
        "definition.providerId",
      ),
    dimensions,
    measures,
    defaultDimensions,
    defaultMeasures,
    boundary: {
      providerExecutionAuthority:
        false,
      periodResolutionAuthority:
        false,
      universalAggregationAuthority:
        false,
      comparisonAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  });
}
