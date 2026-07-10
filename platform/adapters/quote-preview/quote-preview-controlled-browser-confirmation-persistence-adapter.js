"use strict";

const coordinator = require(
  "./quote-preview-pdf-result-persistence-coordinator.js"
);
const contract = require(
  "./quote-preview-pdf-result-persistence-contract.js"
);

function fail(condition, code, message) {
  if (condition) {
    return;
  }

  const error = new Error(message);
  error.code = code;
  throw error;
}

function isObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertStore(store) {
  fail(
    isObject(store),
    "CONFIRMATION_PERSISTENCE_STORE_REQUIRED",
    "store required"
  );
  fail(
    typeof store.writePreviewResult === "function",
    "CONFIRMATION_PERSISTENCE_STORE_WRITE_REQUIRED",
    "store.writePreviewResult required"
  );
  fail(
    typeof store.readPreviewResult === "function",
    "CONFIRMATION_PERSISTENCE_STORE_READ_REQUIRED",
    "store.readPreviewResult required"
  );
}

function persistConfirmedQuotePreviewPdfResult(request = {}) {
  fail(
    request.confirmed === true,
    "QUOTE_PREVIEW_CONFIRMATION_REQUIRED",
    "explicit confirmation required"
  );

  const store = request.store;
  assertStore(store);

  const fields =
    coordinator.buildQuotePreviewPdfCanonicalPersistenceInput({
      nativeResult: request.nativeResult,
      context: request.context,
    });

  const recordInput = {
    previewResultId: request.previewResultId,
    schemaVersion: contract.SCHEMA_VERSION,
    createdAt: request.createdAt,
    expiresAt: request.expiresAt,
    fields,
    ambiguity: isObject(request.ambiguity)
      ? cloneJson(request.ambiguity)
      : {},
    source: isObject(request.source)
      ? cloneJson(request.source)
      : {},
  };

  const expectedRecord = contract.createRecord(recordInput);
  contract.validateRecord(expectedRecord);

  const identity = store.writePreviewResult(recordInput);

  fail(
    isObject(identity),
    "QUOTE_PREVIEW_PERSISTENCE_IDENTITY_REQUIRED",
    "store write identity required"
  );

  const readRecord = store.readPreviewResult(identity);
  const validatedRecord = contract.validateRecord(readRecord);

  fail(
    JSON.stringify(validatedRecord) === JSON.stringify(expectedRecord),
    "QUOTE_PREVIEW_PERSISTENCE_ROUND_TRIP_MISMATCH",
    "persisted record mismatch"
  );

  return Object.freeze({
    identity: Object.freeze(cloneJson(identity)),
    record: validatedRecord,
  });
}

module.exports = Object.freeze({
  persistConfirmedQuotePreviewPdfResult,
});
