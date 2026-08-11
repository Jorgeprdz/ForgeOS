import {
  createHash,
} from "node:crypto";

import {
  REPORT_DEFINITION_SCHEMA_VERSION,
  createReportDefinition,
} from "../domain/report-definition.js";

import {
  REPORT_PROVIDER_SLICE_QUERY_SCHEMA_VERSION,
  assertReportProviderPort,
  normalizeReportProviderSlice,
} from "../application/report-provider-port.js";

export const REPORT_PROVIDER_RUNTIME_SCHEMA_VERSION =
  "report-provider-runtime.v1";

export const REPORT_PROVIDER_EXECUTION_PLAN_SCHEMA_VERSION =
  "report-provider-execution-plan.v1";

export const REPORT_PROVIDER_EXECUTION_MODES =
  Object.freeze([
    "DIRECT",
    "BATCHING_REQUIRED",
  ]);

const INPUT_KEYS =
  new Set([
    "definitions",
    "providers",
  ]);

const RESOLVED_REQUEST_SCHEMA =
  "resolved-universal-report-request.v1";

export class ReportProviderRuntimeError
  extends TypeError {
  constructor(message) {
    super(
      `ReportProviderRuntime: ${message}`,
    );
    this.name =
      "ReportProviderRuntimeError";
  }
}

function runtimeError(message) {
  throw new ReportProviderRuntimeError(
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
    runtimeError(
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
      runtimeError(
        `${label} contains unknown field ${key}`,
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

function canonicalize(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
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

function normalizeDefinition(
  value,
) {
  if (
    value?.schemaVersion ===
    REPORT_DEFINITION_SCHEMA_VERSION
  ) {
    return value;
  }

  return createReportDefinition(
    value,
  );
}

function sortedUnique(
  value,
) {
  return [
    ...new Set(value),
  ].sort();
}

function assertSubset(
  subset,
  parent,
  label,
) {
  for (const item of subset) {
    if (!parent.includes(item)) {
      runtimeError(
        `${label} contains unsupported identifier ${item}`,
      );
    }
  }
}

function capabilityIds(
  value,
  key,
) {
  return value.map(
    (item) =>
      item[key],
  );
}

function normalizeResolvedRequest(
  request,
) {
  assertPlainObject(
    request,
    "resolved request",
  );

  if (
    request.schemaVersion !==
    RESOLVED_REQUEST_SCHEMA
  ) {
    runtimeError(
      "resolved request schemaVersion is not supported",
    );
  }

  if (
    request.status !==
    "PERIOD_RESOLVED_NOT_EXECUTED"
  ) {
    runtimeError(
      "resolved request status is not supported",
    );
  }

  if (
    request.boundary
      ?.periodResolutionComplete !==
      true ||
    request.boundary
      ?.providerExecutionAuthorized !==
      false
  ) {
    runtimeError(
      "resolved request boundary is not supported",
    );
  }

  return request;
}

export function createReportProviderRuntime(
  input,
) {
  assertPlainObject(
    input,
    "input",
  );
  assertExactKeys(
    input,
    INPUT_KEYS,
    "input",
  );

  if (!Array.isArray(input.providers)) {
    runtimeError(
      "providers must be an array",
    );
  }

  if (!Array.isArray(input.definitions)) {
    runtimeError(
      "definitions must be an array",
    );
  }

  const providers =
    new Map();
  const definitions =
    new Map();

  for (const candidate of
    input.providers) {
    const provider =
      assertReportProviderPort(
        candidate,
      );
    const providerId =
      provider.contract
        .descriptor
        .providerId;

    if (providers.has(providerId)) {
      runtimeError(
        `duplicate providerId ${providerId}`,
      );
    }

    providers.set(
      providerId,
      provider,
    );
  }

  for (const candidate of
    input.definitions) {
    const definition =
      normalizeDefinition(
        candidate,
      );

    if (
      definitions.has(
        definition.definitionId,
      )
    ) {
      runtimeError(
        `duplicate definitionId ${definition.definitionId}`,
      );
    }

    const provider =
      providers.get(
        definition.providerId,
      );

    if (!provider) {
      runtimeError(
        `definition ${definition.definitionId} references an unregistered provider`,
      );
    }

    const dimensionIds =
      capabilityIds(
        provider.contract.dimensions,
        "dimensionId",
      );
    const measureIds =
      capabilityIds(
        provider.contract.measures,
        "measureId",
      );

    assertSubset(
      definition.dimensions,
      dimensionIds,
      `definition ${definition.definitionId}.dimensions`,
    );
    assertSubset(
      definition.measures,
      measureIds,
      `definition ${definition.definitionId}.measures`,
    );

    definitions.set(
      definition.definitionId,
      definition,
    );
  }

  const providerList =
    deepFreeze(
      [...providers.values()]
        .sort(
          (left, right) =>
            left.contract.descriptor.providerId.localeCompare(
              right.contract.descriptor.providerId,
            ),
        ),
    );
  const definitionList =
    deepFreeze(
      [...definitions.values()]
        .sort(
          (left, right) =>
            left.definitionId.localeCompare(
              right.definitionId,
            ),
        ),
    );

  const runtime = {
    schemaVersion:
      REPORT_PROVIDER_RUNTIME_SCHEMA_VERSION,
    registry: {
      providerIds:
        providerList.map(
          (item) =>
            item.contract
              .descriptor
              .providerId,
        ),
      definitionIds:
        definitionList.map(
          (item) =>
            item.definitionId,
        ),
    },
    boundary: {
      providerExecutionAuthorized:
        true,
      periodResolutionAuthority:
        false,
      universalAggregationAuthority:
        false,
      comparisonAuthority:
        false,
      exportAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },

    listProviders() {
      return providerList;
    },

    listDefinitions() {
      return definitionList;
    },

    getProvider(providerId) {
      return (
        providers.get(
          providerId,
        ) ??
        null
      );
    },

    getDefinition(definitionId) {
      return (
        definitions.get(
          definitionId,
        ) ??
        null
      );
    },

    createPlan(resolvedRequest) {
      const request =
        normalizeResolvedRequest(
          resolvedRequest,
        );
      const definition =
        definitions.get(
          request.definitionId,
        );

      if (!definition) {
        runtimeError(
          "resolved request references an unregistered definition",
        );
      }

      if (
        request.provider.providerId !==
        definition.providerId
      ) {
        runtimeError(
          "resolved request provider does not match definition",
        );
      }

      const provider =
        providers.get(
          definition.providerId,
        );

      if (
        request.provider.providerVersion !==
        provider.contract
          .descriptor
          .providerVersion
      ) {
        runtimeError(
          "resolved request provider version does not match port",
        );
      }

      const dimensions =
        sortedUnique(
          request.dimensions.length > 0
            ? request.dimensions
            : definition.defaultDimensions,
        );
      const measures =
        sortedUnique(
          request.measures.length > 0
            ? request.measures
            : definition.defaultMeasures,
        );

      assertSubset(
        dimensions,
        definition.dimensions,
        "resolved request dimensions",
      );
      assertSubset(
        measures,
        definition.measures,
        "resolved request measures",
      );

      if (measures.length === 0) {
        runtimeError(
          "resolved request must select at least one measure",
        );
      }

      const dayCount =
        request.period.dayCount;
      const maxSliceDays =
        provider.contract
          .slicePolicy
          .maxSliceDays;
      const requiresBatching =
        dayCount >
        maxSliceDays;

      if (
        requiresBatching &&
        !provider.contract
          .slicePolicy
          .batchingSupported
      ) {
        runtimeError(
          `provider ${definition.providerId} cannot read ${dayCount} days and does not support batching`,
        );
      }

      const executionMode =
        requiresBatching
          ? "BATCHING_REQUIRED"
          : "DIRECT";
      const queryIdentity = {
        schemaVersion:
          REPORT_PROVIDER_SLICE_QUERY_SCHEMA_VERSION,
        sourceResolvedRequestKey:
          request.resolvedRequestKey,
        authority:
          request.authority,
        provider: {
          providerId:
            provider.contract
              .descriptor
              .providerId,
          providerVersion:
            provider.contract
              .descriptor
              .providerVersion,
          domain:
            provider.contract
              .descriptor
              .domain,
        },
        definition: {
          definitionId:
            definition.definitionId,
          definitionVersion:
            definition.definitionVersion,
        },
        period:
          request.period,
        timeZone:
          request.timeZone,
        asOf:
          request.asOf,
        dimensions,
        measures,
      };
      const query =
        deepFreeze({
          ...queryIdentity,
          queryKey:
            `report-provider-query:${digest(queryIdentity)}`,
        });
      const planIdentity = {
        schemaVersion:
          REPORT_PROVIDER_EXECUTION_PLAN_SCHEMA_VERSION,
        sourceResolvedRequestKey:
          request.resolvedRequestKey,
        executionMode,
        query,
        slicePolicy:
          provider.contract
            .slicePolicy,
      };

      return deepFreeze({
        ...planIdentity,
        planKey:
          `report-provider-plan:${digest(planIdentity)}`,
        status:
          executionMode === "DIRECT"
            ? "READY_FOR_PROVIDER_READ"
            : "BATCHING_REQUIRED_REP_04",
      });
    },

    async readSlice(resolvedRequest) {
      const plan =
        this.createPlan(
          resolvedRequest,
        );

      if (
        plan.executionMode !==
        "DIRECT"
      ) {
        runtimeError(
          "provider read requires REP-04 batching",
        );
      }

      const provider =
        providers.get(
          plan.query.provider
            .providerId,
        );
      const raw =
        await provider.readSlice(
          plan.query,
        );

      return normalizeReportProviderSlice({
        raw,
        query:
          plan.query,
        port:
          provider,
      });
    },
  };

  return deepFreeze(runtime);
}
