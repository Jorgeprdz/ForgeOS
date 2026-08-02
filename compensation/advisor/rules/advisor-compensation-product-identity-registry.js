"use strict";

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function normalizeProductAlias(value) {
  if (!present(value)) return null;
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function validateProductIdentityRegistry(productIdentities = []) {
  const errors = [];
  const productIds = new Set();
  const aliases = new Map();

  if (!Array.isArray(productIdentities) || productIdentities.length === 0) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["product_identity_registry_missing"]),
      productCount: 0,
      aliasCount: 0
    });
  }

  productIdentities.forEach((identity, index) => {
    if (!identity || typeof identity !== "object" || Array.isArray(identity)) {
      errors.push(`product_identity_${index}_invalid`);
      return;
    }

    if (!present(identity.productId)) {
      errors.push(`product_identity_${index}_missing_product_id`);
    } else if (productIds.has(identity.productId)) {
      errors.push(`duplicate_product_id:${identity.productId}`);
    } else {
      productIds.add(identity.productId);
    }

    if (!present(identity.displayName)) {
      errors.push(`product_identity_${identity.productId || index}_missing_display_name`);
    }

    if (!present(identity.lineOfBusiness)) {
      errors.push(`product_identity_${identity.productId || index}_missing_line_of_business`);
    }

    const candidates = [identity.productId, identity.displayName, ...(Array.isArray(identity.aliases) ? identity.aliases : [])];
    candidates.forEach((candidate) => {
      const normalized = normalizeProductAlias(candidate);
      if (!normalized) return;
      const previous = aliases.get(normalized);
      if (previous && previous !== identity.productId) {
        errors.push(`conflicting_product_alias:${normalized}:${previous}:${identity.productId}`);
      } else {
        aliases.set(normalized, identity.productId);
      }
    });
  });

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...new Set(errors)]),
    productCount: productIds.size,
    aliasCount: aliases.size
  });
}

function resolveProductIdentity(productIdentities = [], productInput) {
  const normalizedInput = normalizeProductAlias(productInput);
  if (!normalizedInput) {
    return Object.freeze({
      status: "UNKNOWN",
      productId: null,
      identity: null,
      reason: "product_input_missing"
    });
  }

  const matches = productIdentities.filter((identity) => {
    const candidates = [identity.productId, identity.displayName, ...(Array.isArray(identity.aliases) ? identity.aliases : [])];
    return candidates.some((candidate) => normalizeProductAlias(candidate) === normalizedInput);
  });

  if (matches.length === 0) {
    return Object.freeze({
      status: "UNKNOWN",
      productId: null,
      identity: null,
      reason: "product_identity_not_found"
    });
  }

  if (matches.length > 1) {
    return Object.freeze({
      status: "CONFLICTING",
      productId: null,
      identity: null,
      reason: "product_identity_conflict",
      candidateProductIds: Object.freeze(matches.map((item) => item.productId))
    });
  }

  return Object.freeze({
    status: "READY",
    productId: matches[0].productId,
    identity: Object.freeze(JSON.parse(JSON.stringify(matches[0]))),
    reason: null
  });
}

module.exports = {
  normalizeProductAlias,
  validateProductIdentityRegistry,
  resolveProductIdentity
};
