import {
  createHash,
} from "node:crypto";

import {
  PIPELINE_STAGE_CODES,
  PIPELINE_TRANSITION_SCHEMA_VERSION,
  createPipelineTransitionEvent,
} from "../../activity/application/pipeline-to-activity-projector.mjs";

export const PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA_VERSION =
  "pipeline-transition-period-read-model.v1";

export const PIPELINE_TRANSITION_EXCLUSIONS_SCHEMA_VERSION =
  "pipeline-transition-exclusions.v1";

const MODEL_KEYS =
  new Set([
    "schemaVersion",
    "sourceSchemaVersion",
    "authority",
    "period",
    "transitions",
    "exclusions",
  ]);

const AUTHORITY_KEYS =
  new Set([
    "organizationId",
    "advisorId",
  ]);

const PERIOD_KEYS =
  new Set([
    "transitionDateFrom",
    "transitionDateTo",
    "asOf",
  ]);

const EXCLUSION_KEYS =
  new Set([
    "futureRecorded",
    "suppressed",
    "unverified",
    "total",
  ]);

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/u;

const IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

export class PipelineTransitionReadModelError
  extends TypeError {
  constructor(message) {
    super(
      `PipelineTransitionReadModel: ${message}`,
    );
    this.name =
      "PipelineTransitionReadModelError";
  }
}

function fail(message) {
  throw new PipelineTransitionReadModelError(
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
    fail(
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
      fail(
        `${label} contains unknown field ${key}`,
      );
    }
  }

  for (const key of allowed) {
    if (!(key in value)) {
      fail(
        `${label}.${key} is required`,
      );
    }
  }
}

function requiredString(
  value,
  label,
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    fail(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function identifier(
  value,
  label,
) {
  const normalized =
    requiredString(
      value,
      label,
    );

  if (!IDENTIFIER_PATTERN.test(normalized)) {
    fail(
      `${label} must be a canonical identifier`,
    );
  }

  return normalized;
}

function canonicalDate(
  value,
  label,
) {
  const normalized =
    requiredString(
      value,
      label,
    );

  if (!DATE_PATTERN.test(normalized)) {
    fail(
      `${label} must be YYYY-MM-DD`,
    );
  }

  const parsed =
    new Date(
      `${normalized}T00:00:00.000Z`,
    );

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !==
      normalized
  ) {
    fail(
      `${label} must be a valid date`,
    );
  }

  return normalized;
}

function canonicalInstant(
  value,
  label,
) {
  const parsed =
    new Date(
      requiredString(
        value,
        label,
      ),
    );

  if (Number.isNaN(parsed.getTime())) {
    fail(
      `${label} must be an ISO instant`,
    );
  }

  return parsed.toISOString();
}

function nonNegativeInteger(
  value,
  label,
) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    fail(
      `${label} must be a non-negative integer`,
    );
  }

  return value;
}

function localDate(
  instant,
  timeZone,
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone,
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit",
      },
    ).formatToParts(
      new Date(instant),
    );

  const values =
    Object.fromEntries(
      parts
        .filter(
          ({ type }) =>
            [
              "year",
              "month",
              "day",
            ].includes(type),
        )
        .map(
          ({ type, value }) => [
            type,
            value,
          ],
        ),
    );

  return (
    `${values.year}-` +
    `${values.month}-` +
    `${values.day}`
  );
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

function canonicalize(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      canonicalize,
    );
  }

  const result = {};

  for (const key of
    Object.keys(value).sort()) {
    result[key] =
      canonicalize(
        value[key],
      );
  }

  return result;
}

function digest(value) {
  return createHash(
    "sha256",
  )
    .update(
      JSON.stringify(
        canonicalize(value),
      ),
    )
    .digest("hex");
}

function normalizeAuthority(value) {
  assertPlainObject(
    value,
    "authority",
  );
  assertExactKeys(
    value,
    AUTHORITY_KEYS,
    "authority",
  );

  return {
    organizationId:
      identifier(
        value.organizationId,
        "authority.organizationId",
      ),
    advisorId:
      identifier(
        value.advisorId,
        "authority.advisorId",
      ),
  };
}

function normalizePeriod(value) {
  assertPlainObject(
    value,
    "period",
  );
  assertExactKeys(
    value,
    PERIOD_KEYS,
    "period",
  );

  const transitionDateFrom =
    canonicalDate(
      value.transitionDateFrom,
      "period.transitionDateFrom",
    );
  const transitionDateTo =
    canonicalDate(
      value.transitionDateTo,
      "period.transitionDateTo",
    );

  if (
    transitionDateFrom >
    transitionDateTo
  ) {
    fail(
      "period dates are reversed",
    );
  }

  return {
    transitionDateFrom,
    transitionDateTo,
    asOf:
      canonicalInstant(
        value.asOf,
        "period.asOf",
      ),
  };
}

function normalizeTransition(
  value,
  index,
  authority,
  period,
) {
  let transition;

  try {
    transition =
      createPipelineTransitionEvent(
        value,
      );
  } catch (error) {
    fail(
      `transitions[${index}] is invalid: ${error.message}`,
    );
  }

  if (
    transition.schemaVersion !==
    PIPELINE_TRANSITION_SCHEMA_VERSION
  ) {
    fail(
      `transitions[${index}] schemaVersion is unsupported`,
    );
  }

  if (
    transition.organizationId !==
      authority.organizationId ||
    transition.advisorId !==
      authority.advisorId
  ) {
    fail(
      `transitions[${index}] authority drifted`,
    );
  }

  if (
    transition.recordedAt >
    period.asOf
  ) {
    fail(
      `transitions[${index}] is recorded after asOf`,
    );
  }

  const transitionDate =
    localDate(
      transition.occurredAt,
      transition.timeZone,
    );

  if (
    transitionDate <
      period.transitionDateFrom ||
    transitionDate >
      period.transitionDateTo
  ) {
    fail(
      `transitions[${index}] is outside period`,
    );
  }

  return deepFreeze({
    ...transition,
    transitionDate,
  });
}

function normalizeExclusions(value) {
  assertPlainObject(
    value,
    "exclusions",
  );
  assertExactKeys(
    value,
    EXCLUSION_KEYS,
    "exclusions",
  );

  const futureRecorded =
    nonNegativeInteger(
      value.futureRecorded,
      "exclusions.futureRecorded",
    );
  const suppressed =
    nonNegativeInteger(
      value.suppressed,
      "exclusions.suppressed",
    );
  const unverified =
    nonNegativeInteger(
      value.unverified,
      "exclusions.unverified",
    );
  const total =
    nonNegativeInteger(
      value.total,
      "exclusions.total",
    );

  if (
    total !==
    futureRecorded +
      suppressed +
      unverified
  ) {
    fail(
      "exclusions.total must equal its components",
    );
  }

  return {
    schemaVersion:
      PIPELINE_TRANSITION_EXCLUSIONS_SCHEMA_VERSION,
    futureRecorded,
    suppressed,
    unverified,
    total,
  };
}

export function normalizePipelineTransitionPeriodModel(
  value,
) {
  assertPlainObject(
    value,
    "model",
  );
  assertExactKeys(
    value,
    MODEL_KEYS,
    "model",
  );

  if (
    value.schemaVersion !==
    PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA_VERSION
  ) {
    fail(
      "model schemaVersion is unsupported",
    );
  }

  if (!Array.isArray(value.transitions)) {
    fail(
      "transitions must be an array",
    );
  }

  const sourceSchemaVersion =
    identifier(
      value.sourceSchemaVersion,
      "sourceSchemaVersion",
    );
  const authority =
    normalizeAuthority(
      value.authority,
    );
  const period =
    normalizePeriod(
      value.period,
    );
  const eventIds =
    new Set();
  const transitions =
    value.transitions
      .map(
        (transition, index) =>
          normalizeTransition(
            transition,
            index,
            authority,
            period,
          ),
      )
      .map(
        (transition) => {
          if (
            eventIds.has(
              transition.eventId,
            )
          ) {
            fail(
              `duplicate eventId ${transition.eventId}`,
            );
          }

          eventIds.add(
            transition.eventId,
          );

          return transition;
        },
      )
      .sort(
        (left, right) =>
          left.occurredAt.localeCompare(
            right.occurredAt,
          ) ||
          left.eventId.localeCompare(
            right.eventId,
          ),
      );
  const exclusions =
    normalizeExclusions(
      value.exclusions,
    );
  const modelKey =
    digest({
      sourceSchemaVersion,
      authority,
      period,
      transitions,
      exclusions,
    });

  return deepFreeze({
    schemaVersion:
      PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA_VERSION,
    sourceSchemaVersion,
    authority,
    period,
    transitions,
    exclusions,
    modelKey,
    stageVocabulary:
      PIPELINE_STAGE_CODES,
    boundary: {
      transitionReadAuthority:
        true,
      stageMutationAuthority:
        false,
      currentStageSnapshotAuthority:
        false,
      conversionRateAuthority:
        false,
      forecastAuthority:
        false,
      scoringAuthority:
        false,
      activityProjectionAuthority:
        false,
      crmMutationAuthority:
        false,
    },
  });
}
