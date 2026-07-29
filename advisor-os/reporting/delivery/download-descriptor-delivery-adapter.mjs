import {
  createHash,
} from "node:crypto";

import {
  REPORT_EXPORT_BUNDLE_SCHEMA_VERSION,
  REPORT_EXPORT_FILE_SCHEMA_VERSION,
} from "../export/report-export-contract.mjs";

export const REPORT_DELIVERY_RECEIPT_SCHEMA_VERSION =
  "report-delivery-receipt.v1";

export const DOWNLOAD_DESCRIPTOR_DELIVERY_ADAPTER_SCHEMA_VERSION =
  "download-descriptor-delivery-adapter.v1";

export class ReportDeliveryAdapterError
  extends TypeError {
  constructor(message) {
    super(
      `ReportDeliveryAdapter: ${message}`,
    );
    this.name =
      "ReportDeliveryAdapterError";
  }
}

function fail(message) {
  throw new ReportDeliveryAdapterError(
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

function digest(value) {
  return createHash(
    "sha256",
  )
    .update(
      JSON.stringify(value),
    )
    .digest("hex");
}

function assertBundle(bundle) {
  if (
    bundle === null ||
    typeof bundle !== "object" ||
    Array.isArray(bundle) ||
    bundle.schemaVersion !==
      REPORT_EXPORT_BUNDLE_SCHEMA_VERSION ||
    typeof bundle.exportId !==
      "string" ||
    bundle.exportId.trim() === "" ||
    !Array.isArray(bundle.files) ||
    bundle.files.length === 0
  ) {
    fail(
      "bundle is not a canonical report export bundle",
    );
  }

  const names =
    new Set();

  for (const file of bundle.files) {
    if (
      file?.schemaVersion !==
        REPORT_EXPORT_FILE_SCHEMA_VERSION ||
      typeof file.fileName !==
        "string" ||
      typeof file.mediaType !==
        "string" ||
      typeof file.content !==
        "string" ||
      !Number.isSafeInteger(
        file.byteLength,
      ) ||
      file.byteLength < 0 ||
      typeof file.sha256 !==
        "string"
    ) {
      fail(
        "bundle contains an invalid export file",
      );
    }

    if (
      names.has(
        file.fileName,
      )
    ) {
      fail(
        `bundle contains duplicate file ${file.fileName}`,
      );
    }

    names.add(
      file.fileName,
    );
  }

  return bundle;
}

export function createDownloadDescriptorDeliveryAdapter() {
  return Object.freeze({
    schemaVersion:
      DOWNLOAD_DESCRIPTOR_DELIVERY_ADAPTER_SCHEMA_VERSION,
    deliveryMode:
      "DOWNLOAD_DESCRIPTOR",

    deliver(bundle) {
      const source =
        assertBundle(
          bundle,
        );
      const descriptors =
        source.files.map(
          (file) =>
            deepFreeze({
              fileName:
                file.fileName,
              mediaType:
                file.mediaType,
              content:
                file.content,
              byteLength:
                file.byteLength,
              sha256:
                file.sha256,
            }),
        );
      const identity = {
        sourceExportId:
          source.exportId,
        deliveryMode:
          "DOWNLOAD_DESCRIPTOR",
        files:
          descriptors.map(
            (file) => ({
              fileName:
                file.fileName,
              mediaType:
                file.mediaType,
              byteLength:
                file.byteLength,
              sha256:
                file.sha256,
            }),
          ),
      };

      return deepFreeze({
        schemaVersion:
          REPORT_DELIVERY_RECEIPT_SCHEMA_VERSION,
        deliveryId:
          `report-delivery:${digest(identity)}`,
        ...identity,
        descriptors:
          deepFreeze(
            descriptors,
          ),
        status:
          "READY_FOR_CLIENT_DOWNLOAD",
        boundary: {
          browserDownloadSideEffect:
            false,
          fileSystemWrite:
            false,
          networkSend:
            false,
          emailSend:
            false,
          persistenceMutation:
            false,
        },
      });
    },

    boundary:
      Object.freeze({
        browserDownloadSideEffect:
          false,
        fileSystemWrite:
          false,
        networkSend:
          false,
        emailSend:
          false,
        persistenceMutation:
          false,
      }),
  });
}
