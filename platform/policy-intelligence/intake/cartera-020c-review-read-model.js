// CARTERA 020C owner-scoped confirmation review projection.
// Pure reconciliation only: no RPC execution, canonical writes or restricted-data disclosure.

import {
  createIdentityPolicyConfirmationReview,
  generalPolicyRoleReviewProjection,
} from '../../../policy-operations/intake/cartera-020c-confirmation-review-contracts.js';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const LOW_CONFIDENCE_THRESHOLD = 0.8;
const MATERIAL_FIELD_NAMES = new Set([
  'carrierid',
  'carrierreference',
  'productname',
  'productreference',
  'policynumber',
]);
const SENSITIVE_FIELD_PATTERN = /(beneficiar|curp|rfc|tax|phone|email|correo|telefono|teléfono)/i;
const RESTRICTED_ROLE_TYPES = new Set(['BENEFICIARY']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireRecord(value, label) {
  if (!isRecord(value)) throw new TypeError(`${label}_MUST_BE_OBJECT`);
  return value;
}

function requireReference(value, label) {
  const reference = typeof value === 'string' ? value.trim() : '';
  if (!REFERENCE_PATTERN.test(reference)) throw new TypeError(`${label}_INVALID`);
  return reference;
}

function optionalReference(value, label) {
  if (value === null || value === undefined || value === '') return null;
  return requireReference(value, label);
}

function requireOwner(row, advisorId, label) {
  requireRecord(row, label);
  if (row.advisor_id !== advisorId) throw new TypeError(`${label}_OWNER_MISMATCH`);
  return row;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function freezeList(values) {
  return Object.freeze(values.map((value) => (
    isRecord(value) ? Object.freeze({ ...value }) : value
  )));
}

function normalizedText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function candidateCreatesTruth(candidate, label) {
  if (!isRecord(candidate)) throw new TypeError(`${label}_MUST_BE_OBJECT`);
  if (candidate.createsTruth === true || candidate.creates_truth === true) {
    throw new TypeError(`${label}_TRUTH_CLAIM_FORBIDDEN`);
  }
}

function candidateReferences(candidate, keys = []) {
  const references = [];
  for (const key of keys) {
    const value = candidate[key];
    if (Array.isArray(value)) references.push(...value);
    else if (value) references.push(value);
  }
  return [...new Set(references.map((value) => optionalReference(value, 'CANDIDATE_REFERENCE')).filter(Boolean))];
}

function publicPerson(person, matchReasons = []) {
  return Object.freeze({
    personReference: requireReference(person.person_reference, 'PERSON_REFERENCE'),
    displayLabel: String(person.preferred_name || person.display_name || '').trim(),
    lifecycleState: person.lifecycle_state || 'UNKNOWN',
    privacyClassification: person.privacy_classification || 'PRIVATE',
    matchReasons: freezeList([...new Set(matchReasons)].sort()),
  });
}

function publicAccount(account, matchReasons = []) {
  return Object.freeze({
    accountReference: requireReference(account.account_reference, 'ACCOUNT_REFERENCE'),
    displayLabel: String(account.display_label || '').trim(),
    accountType: account.account_type || 'UNKNOWN',
    lifecycleState: account.lifecycle_state || 'UNKNOWN',
    privacyClassification: account.privacy_classification || 'PRIVATE',
    matchReasons: freezeList([...new Set(matchReasons)].sort()),
  });
}

function publicPolicy(policy, matchReasons = []) {
  return Object.freeze({
    policyReference: requireReference(policy.policy_reference, 'POLICY_REFERENCE'),
    carrierReference: optionalReference(policy.carrier_reference, 'CARRIER_REFERENCE'),
    policyNumber: policy.policy_number || null,
    productReference: optionalReference(policy.product_reference, 'PRODUCT_REFERENCE'),
    status: policy.status_value || 'UNKNOWN',
    matchReasons: freezeList([...new Set(matchReasons)].sort()),
  });
}

function activePeople(rows, advisorId) {
  return array(rows)
    .map((row) => requireOwner(row, advisorId, 'COMMERCIAL_PERSON'))
    .filter((row) => !row.archived_at && row.lifecycle_state === 'CONFIRMED');
}

function activeAccounts(rows, advisorId) {
  return array(rows)
    .map((row) => requireOwner(row, advisorId, 'COMMERCIAL_ACCOUNT'))
    .filter((row) => !row.archived_at && row.lifecycle_state === 'CONFIRMED');
}

function activePolicies(rows, advisorId) {
  return array(rows)
    .map((row) => requireOwner(row, advisorId, 'CANONICAL_POLICY'))
    .filter((row) => !row.archived_at);
}

function reconcileIdentityCandidates(rawCandidates, people, packetReference) {
  return freezeList(array(rawCandidates).map((rawCandidate, index) => {
    candidateCreatesTruth(rawCandidate, 'IDENTITY_CANDIDATE');
    const candidateReference = requireReference(
      rawCandidate.candidateReference
        || rawCandidate.candidate_reference
        || `identity-candidate/${packetReference}/${index + 1}`,
      'IDENTITY_CANDIDATE_REFERENCE'
    );
    const explicitReferences = new Set(candidateReferences(rawCandidate, [
      'personReference',
      'existingPersonReference',
      'existingPersonReferences',
      'candidatePersonReferences',
    ]));
    const proposedName = normalizedText(
      rawCandidate.displayName
        || rawCandidate.preferredName
        || rawCandidate.normalizedName
        || rawCandidate.name
    );
    const proposedPhone = normalizedText(rawCandidate.verifiedPhone || rawCandidate.phone);
    const proposedEmail = normalizedText(rawCandidate.verifiedEmail || rawCandidate.email);

    const matches = [];
    for (const person of people) {
      const reasons = [];
      if (explicitReferences.has(person.person_reference)) reasons.push('REFERENCE');
      if (proposedName && [person.display_name, person.preferred_name, person.normalized_name]
        .some((value) => normalizedText(value) === proposedName)) reasons.push('NAME');
      if (proposedPhone && normalizedText(person.verified_phone) === proposedPhone) reasons.push('PHONE');
      if (proposedEmail && normalizedText(person.verified_email) === proposedEmail) reasons.push('EMAIL');
      if (reasons.length > 0) matches.push(publicPerson(person, reasons));
    }

    matches.sort((left, right) => (
      right.matchReasons.length - left.matchReasons.length
      || left.displayLabel.localeCompare(right.displayLabel)
    ));

    return {
      candidateReference,
      candidateType: rawCandidate.candidateType || rawCandidate.candidate_type || 'EXISTING_PERSON_OR_NEW_PERSON',
      state: rawCandidate.state || 'UNRESOLVED',
      required: rawCandidate.required !== false,
      proposedLabel: rawCandidate.displayName || rawCandidate.preferredName || rawCandidate.name || null,
      existingPersonMatches: freezeList(matches),
      createsTruth: false,
    };
  }));
}

function reconcileAccountCandidates(rawCandidates, accounts, packetReference) {
  return freezeList(array(rawCandidates).map((rawCandidate, index) => {
    candidateCreatesTruth(rawCandidate, 'ACCOUNT_CANDIDATE');
    const candidateReference = requireReference(
      rawCandidate.candidateReference
        || rawCandidate.candidate_reference
        || `account-candidate/${packetReference}/${index + 1}`,
      'ACCOUNT_CANDIDATE_REFERENCE'
    );
    const explicitReferences = new Set(candidateReferences(rawCandidate, [
      'accountReference',
      'existingAccountReference',
      'existingAccountReferences',
      'candidateAccountReferences',
    ]));
    const proposedLabel = normalizedText(rawCandidate.displayLabel || rawCandidate.label || rawCandidate.name);
    const matches = [];

    for (const account of accounts) {
      const reasons = [];
      if (explicitReferences.has(account.account_reference)) reasons.push('REFERENCE');
      if (proposedLabel && normalizedText(account.display_label) === proposedLabel) reasons.push('LABEL');
      if (reasons.length > 0) matches.push(publicAccount(account, reasons));
    }

    matches.sort((left, right) => (
      right.matchReasons.length - left.matchReasons.length
      || left.displayLabel.localeCompare(right.displayLabel)
    ));

    return {
      candidateReference,
      candidateType: rawCandidate.candidateType || rawCandidate.candidate_type || 'EXISTING_ACCOUNT',
      state: rawCandidate.state || 'UNRESOLVED',
      required: rawCandidate.required === true,
      proposedLabel: rawCandidate.displayLabel || rawCandidate.label || rawCandidate.name || null,
      existingAccountMatches: freezeList(matches),
      createsTruth: false,
    };
  }));
}

function reconcilePolicyCandidates(rawCandidates, policies, packetReference) {
  return freezeList(array(rawCandidates).map((rawCandidate, index) => {
    candidateCreatesTruth(rawCandidate, 'EXISTING_POLICY_CANDIDATE');
    const candidateReference = requireReference(
      rawCandidate.candidateReference
        || rawCandidate.candidate_reference
        || rawCandidate.policyReference
        || `existing-policy-candidate/${packetReference}/${index + 1}`,
      'EXISTING_POLICY_CANDIDATE_REFERENCE'
    );
    const explicitReference = optionalReference(
      rawCandidate.policyReference || rawCandidate.existingPolicyReference,
      'EXISTING_POLICY_REFERENCE'
    );
    const carrier = normalizedText(rawCandidate.carrierReference || rawCandidate.carrierId);
    const policyNumber = normalizedText(rawCandidate.policyNumber);
    const matches = [];

    for (const policy of policies) {
      const reasons = [];
      if (explicitReference && policy.policy_reference === explicitReference) reasons.push('REFERENCE');
      if (carrier && normalizedText(policy.carrier_reference) === carrier) reasons.push('CARRIER');
      if (policyNumber && normalizedText(policy.policy_number) === policyNumber) reasons.push('POLICY_NUMBER');
      if (reasons.length > 0) matches.push(publicPolicy(policy, reasons));
    }

    matches.sort((left, right) => (
      right.matchReasons.length - left.matchReasons.length
      || String(left.policyNumber).localeCompare(String(right.policyNumber))
    ));

    return {
      candidateReference,
      state: rawCandidate.state || 'UNRESOLVED',
      matchReason: rawCandidate.matchReason || rawCandidate.reason || null,
      existingPolicyMatches: freezeList(matches),
      createsTruth: false,
    };
  }));
}

function reconcilePolicyRoleCandidates(rawCandidates, packetReference) {
  return freezeList(array(rawCandidates).map((rawCandidate, index) => {
    candidateCreatesTruth(rawCandidate, 'POLICY_ROLE_CANDIDATE');
    const roleType = requireReference(
      rawCandidate.roleType || rawCandidate.role_type,
      'POLICY_ROLE_TYPE'
    );
    const restricted = RESTRICTED_ROLE_TYPES.has(roleType);
    const visibilityScope = rawCandidate.visibilityScope
      || rawCandidate.visibility_scope
      || (restricted ? 'RESTRICTED' : 'POLICY_TEAM');
    if (restricted && visibilityScope !== 'RESTRICTED') {
      throw new TypeError('RESTRICTED_POLICY_ROLE_VISIBILITY_REQUIRED');
    }

    return {
      candidateReference: requireReference(
        rawCandidate.candidateReference
          || rawCandidate.candidate_reference
          || `policy-role-candidate/${packetReference}/${roleType}/${index + 1}`,
        'POLICY_ROLE_CANDIDATE_REFERENCE'
      ),
      roleType,
      participantState: rawCandidate.participantState || rawCandidate.participant_state || 'UNRESOLVED',
      participantCandidateReference: optionalReference(
        rawCandidate.participantCandidateReference || rawCandidate.participant_candidate_reference,
        'PARTICIPANT_CANDIDATE_REFERENCE'
      ),
      selectedPersonReference: optionalReference(
        rawCandidate.selectedPersonReference || rawCandidate.personReference,
        'SELECTED_PERSON_REFERENCE'
      ),
      selectedAccountReference: optionalReference(
        rawCandidate.selectedAccountReference || rawCandidate.accountReference,
        'SELECTED_ACCOUNT_REFERENCE'
      ),
      visibilityScope,
      evidenceReferences: freezeList(array(rawCandidate.evidenceReferences || rawCandidate.evidence_references)),
      restricted,
      createsTruth: false,
    };
  }));
}

function normalizeFields(extractedFields = {}) {
  if (!isRecord(extractedFields)) throw new TypeError('EXTRACTED_FIELDS_MUST_BE_OBJECT');
  const general = [];
  const restricted = [];
  const lowConfidence = [];

  for (const [fieldName, rawField] of Object.entries(extractedFields)) {
    const field = isRecord(rawField) ? rawField : { value: rawField };
    const sensitive = SENSITIVE_FIELD_PATTERN.test(fieldName);
    const confidence = Number.isFinite(field.confidence) ? field.confidence : null;
    const value = Object.hasOwn(field, 'value') ? field.value : (field.normalizedValue ?? null);
    const normalized = Object.freeze({
      fieldName,
      value: sensitive ? null : value,
      candidateState: field.state || 'UNKNOWN',
      confidence,
      sourceLocation: field.sourceLocation || null,
      extractionMethod: field.extractionMethod || null,
      parserId: field.parserId || null,
      parserVersion: field.parserVersion || null,
      restricted: sensitive,
      createsTruth: false,
    });

    if (sensitive) restricted.push(normalized);
    else general.push(normalized);

    if (
      MATERIAL_FIELD_NAMES.has(normalizedText(fieldName).replace(/\s/g, ''))
      && confidence !== null
      && confidence < LOW_CONFIDENCE_THRESHOLD
    ) {
      lowConfidence.push(fieldName);
    }
  }

  return Object.freeze({
    general: freezeList(general),
    restricted: freezeList(restricted),
    lowConfidence: freezeList(lowConfidence),
  });
}

export function createCartera020cReviewReadModel({
  advisorId,
  actorReference,
  packetRow,
  candidateRow,
  inboxRow,
  sourceRow,
  people = [],
  accounts = [],
  policies = [],
  reviewReference,
  createdAt = new Date().toISOString(),
} = {}) {
  requireReference(advisorId, 'ADVISOR_ID');
  requireReference(actorReference, 'ACTOR_REFERENCE');
  if (advisorId !== actorReference) throw new TypeError('CARTERA020C_REVIEW_OWNER_MISMATCH');

  const packet = requireOwner(packetRow, advisorId, 'POLICY_EVIDENCE_PACKET');
  const candidate = requireOwner(candidateRow, advisorId, 'EXTRACTION_CANDIDATE');
  const inbox = requireOwner(inboxRow, advisorId, 'EVIDENCE_INBOX_ITEM');
  const source = requireOwner(sourceRow, advisorId, 'EVIDENCE_SOURCE');

  if (packet.candidate_id !== candidate.id || packet.inbox_item_id !== inbox.id || inbox.source_id !== source.id) {
    throw new TypeError('CARTERA020C_EVIDENCE_CHAIN_MISMATCH');
  }
  if (packet.confirmation_state !== 'PENDING_CONFIRMATION' || packet.creates_truth !== false) {
    throw new TypeError('CARTERA020C_PACKET_NOT_PENDING_NON_TRUTH');
  }
  if (candidate.creates_truth !== false) throw new TypeError('CARTERA020C_CANDIDATE_TRUTH_CLAIM_FORBIDDEN');
  if (inbox.status !== 'confirmation_required' || inbox.worker_state !== 'COMPLETED') {
    throw new TypeError('CARTERA020C_INBOX_NOT_READY_FOR_REVIEW');
  }

  const packetReference = requireReference(packet.packet_reference, 'PACKET_REFERENCE');
  const canonicalPeople = activePeople(people, advisorId);
  const canonicalAccounts = activeAccounts(accounts, advisorId);
  const canonicalPolicies = activePolicies(policies, advisorId);
  const identityCandidates = reconcileIdentityCandidates(
    packet.identity_candidates,
    canonicalPeople,
    packetReference
  );
  const accountCandidates = reconcileAccountCandidates(
    packet.account_candidates || [],
    canonicalAccounts,
    packetReference
  );
  const policyRoleCandidates = reconcilePolicyRoleCandidates(
    packet.policy_role_candidates,
    packetReference
  );
  const duplicatePolicyCandidates = reconcilePolicyCandidates(
    packet.existing_policy_candidates,
    canonicalPolicies,
    packetReference
  );
  const fields = normalizeFields(packet.extracted_fields);
  const missingEvidence = freezeList(array(candidate.missing_fields));
  const sensitiveFields = freezeList(fields.restricted.map((field) => field.fieldName));

  const review = createIdentityPolicyConfirmationReview({
    reviewReference: reviewReference || `review/${packetReference}`,
    advisorId,
    actorReference,
    packet: {
      packetReference,
      documentReference: requireReference(source.source_reference, 'SOURCE_REFERENCE'),
      confirmationState: 'pending_confirmation',
      createsTruth: false,
      canInvokeConfirmedPolicyCommand: false,
    },
    identityCandidates,
    accountCandidates,
    policyRoleCandidates,
    duplicatePolicyCandidates,
    missingEvidence,
    lowConfidenceFields: fields.lowConfidence,
    sensitiveFields,
    createdAt,
  });

  const generalPolicyRoles = generalPolicyRoleReviewProjection(review);
  const restrictedPolicyRoles = freezeList(
    review.policyRoleCandidates
      .filter((role) => role.restricted)
      .map((role) => ({
        candidateReference: role.candidateReference,
        roleType: role.roleType,
        participantState: role.participantState,
        visibilityScope: 'RESTRICTED',
        restricted: true,
      }))
  );

  return Object.freeze({
    contractType: 'FORGE_CARTERA_020C_REVIEW_READ_MODEL',
    contractVersion: 'CARTERA-020C.1',
    review,
    source: Object.freeze({
      sourceReference: source.source_reference,
      originalFilename: source.original_filename,
      mimeType: source.mime_type,
      documentDigest: source.document_digest,
      receivedAt: source.received_at,
    }),
    inbox: Object.freeze({
      inboxReference: inbox.inbox_reference,
      status: inbox.status,
      classificationState: inbox.classification_state,
      classificationConfidence: inbox.classification_confidence,
      warnings: freezeList(array(inbox.warnings)),
    }),
    fields: fields.general,
    restrictedFields: fields.restricted,
    identityCandidates,
    accountCandidates,
    duplicatePolicyCandidates,
    generalPolicyRoleCandidates: generalPolicyRoles,
    restrictedPolicyRoleCandidates: restrictedPolicyRoles,
    state: review.state,
    blockers: review.blockers,
    createsTruth: false,
    invokesRemoteCommand: false,
    canInvokeConfirmedPolicyCommand: false,
  });
}
