import {
  UNIVERSAL_REPORTING_KERNEL_CAPABILITIES,
  UNIVERSAL_REPORTING_KERNEL_SCHEMA_VERSION,
  UniversalReportingContractError,
  assertExactKeys,
  assertPlainObject,
  createReportProviderDescriptor,
  createReportingAuthorityBinding,
  createUniversalReportRequest,
} from "../domain/reporting-kernel-contract.js";

const INPUT_KEYS =
  new Set([
    "authority",
    "providers",
    "clock",
  ]);

export class UniversalReportingKernelError
  extends TypeError {
  constructor(message) {
    super(
      `UniversalReportingKernel: ${message}`,
    );
    this.name =
      "UniversalReportingKernelError";
  }
}

function kernelError(message) {
  throw new UniversalReportingKernelError(
    message,
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

function normalizeClock(value) {
  if (value === undefined) {
    return () =>
      new Date();
  }

  if (typeof value !== "function") {
    kernelError(
      "clock must be a function",
    );
  }

  return value;
}

function normalizeProviders(value) {
  if (!Array.isArray(value)) {
    kernelError(
      "providers must be an array",
    );
  }

  const byId =
    new Map();

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    const descriptor =
      createReportProviderDescriptor(
        value[index],
      );

    if (
      byId.has(
        descriptor.providerId,
      )
    ) {
      kernelError(
        `duplicate providerId ${descriptor.providerId}`,
      );
    }

    byId.set(
      descriptor.providerId,
      descriptor,
    );
  }

  const list =
    deepFreeze(
      [...byId.values()]
        .sort(
          (left, right) =>
            left.providerId.localeCompare(
              right.providerId,
            ),
        ),
    );

  return {
    byId,
    list,
  };
}

export function createUniversalReportingKernel(
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

  const authority =
    createReportingAuthorityBinding(
      input.authority,
    );
  const clock =
    normalizeClock(
      input.clock,
    );
  const registry =
    normalizeProviders(
      input.providers,
    );

  const kernel = {
    schemaVersion:
      UNIVERSAL_REPORTING_KERNEL_SCHEMA_VERSION,
    capabilities:
      UNIVERSAL_REPORTING_KERNEL_CAPABILITIES,
    authority,
    providerRegistry: {
      schemaVersion:
        "report-provider-registry.v1",
      size:
        registry.list.length,
      providerIds:
        registry.list.map(
          (provider) =>
            provider.providerId,
        ),
    },
    boundary: {
      domainMeasureOwnership:
        false,
      periodResolutionComplete:
        false,
      providerExecutionAuthorized:
        false,
      aggregationAuthorized:
        false,
      comparisonAuthorized:
        false,
      exportAuthorized:
        false,
      uiRenderingAuthorized:
        false,
      persistenceMutationAuthorized:
        false,
    },

    listProviders() {
      return registry.list;
    },

    getProvider(providerId) {
      if (
        typeof providerId !== "string" ||
        providerId.trim() === ""
      ) {
        return null;
      }

      return (
        registry.byId.get(
          providerId.trim(),
        ) ??
        null
      );
    },

    createRequest(requestInput) {
      const providerId =
        requestInput?.providerId;
      const provider =
        typeof providerId === "string"
          ? registry.byId.get(
              providerId.trim(),
            )
          : null;

      if (!provider) {
        kernelError(
          "request references an unregistered provider",
        );
      }

      try {
        return createUniversalReportRequest({
          input:
            requestInput,
          authority,
          provider,
          defaultAsOf:
            clock(),
        });
      } catch (error) {
        if (
          error instanceof
          UniversalReportingContractError
        ) {
          throw error;
        }

        throw error;
      }
    },
  };

  return deepFreeze(kernel);
}
