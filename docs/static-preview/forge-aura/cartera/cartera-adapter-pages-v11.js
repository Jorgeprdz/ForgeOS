import { createCarteraAdapter as createDurableAdapter } from './cartera-adapter-pages-v10.js?v=forge-beta2-post-release-recovery-010i';

const STATUS_RPC = 'forge_cartera020c_get_confirmation_status';
const REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function packetDigestToken(reference) {
  const text = String(reference || '').trim();
  if (!text.startsWith('POLICY_PACKET:AURA:')) return null;
  const token = text.split(':').filter(Boolean).at(-1) || '';
  return /^[a-f0-9]{40}$/i.test(token) ? token.toLowerCase() : null;
}

function confirmationReviewReference(review) {
  const explicit = String(review?.reviewReference || '').trim();
  if (REF.test(explicit) && explicit.startsWith('review/')) return explicit;
  const packetReference = String(review?.packetReference || '').trim();
  if (REF.test(packetReference) && packetReference.startsWith('POLICY_PACKET:AURA:')) {
    return `review/${packetReference}`;
  }
  const digest = String(review?.documentDigest || '').trim();
  const token = /^[a-f0-9]{40,64}$/i.test(digest)
    ? digest.slice(0, 40).toLowerCase()
    : packetDigestToken(review?.packetReference);
  return token ? `CONFIRMATION_REVIEW:AURA:${token}` : null;
}

function pendingReviewKey(review) {
  return packetDigestToken(review?.packetReference)
    || String(review?.packetReference || review?.reviewReference || '');
}

function preferSemanticRefresh(current, candidate) {
  if (!current) return candidate;
  const currentRefresh = String(current?.packetReference || '').includes(':SEMANTIC_REFRESH:');
  const nextRefresh = String(candidate?.packetReference || '').includes(':SEMANTIC_REFRESH:');
  return nextRefresh && !currentRefresh ? candidate : current;
}

function dedupeReviews(reviews = []) {
  const byDocument = new Map();
  for (const review of reviews || []) {
    const key = pendingReviewKey(review);
    byDocument.set(key, preferSemanticRefresh(byDocument.get(key), review));
  }
  return [...byDocument.values()];
}

async function durableReviewState(client, review) {
  const reference = confirmationReviewReference(review);
  if (!reference) return null;
  const result = await client.rpc(STATUS_RPC, { p_review_reference: reference });
  if (result?.error) return null; // fail open: unreadable status never hides evidence.
  return String(result?.data?.state || result?.data?.confirmationState || '').toUpperCase() || null;
}

async function activePendingReviews(client, reviews = []) {
  const unique = dedupeReviews(reviews);
  const states = await Promise.all(unique.map(review => durableReviewState(client, review)));
  return unique.filter((review, index) => states[index] !== 'CONFIRMED');
}

async function latestPolicyEvidence(client, policyReference) {
  if (!REF.test(String(policyReference || ''))) return null;

  const policyResult = await client.from('canonical_policies')
    .select('id,policy_reference')
    .eq('policy_reference', policyReference)
    .is('archived_at', null)
    .single();
  if (policyResult?.error || !policyResult?.data?.id) return null;

  const versionResult = await client.from('policy_versions')
    .select('id,policy_version_reference,version_number,evidence_version_id,confirmed_at')
    .eq('policy_id', policyResult.data.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionResult?.error || !versionResult?.data?.evidence_version_id) return null;

  const evidenceResult = await client.from('policy_evidence_versions')
    .select('id,evidence_version_reference,document_hash,source_type,observed_at,verification_state,field_claims,provenance,created_at')
    .eq('id', versionResult.data.evidence_version_id)
    .maybeSingle();
  if (evidenceResult?.error || !evidenceResult?.data) return null;

  return freeze({
    policyVersionReference: versionResult.data.policy_version_reference || null,
    policyVersion: versionResult.data.version_number ?? null,
    confirmedAt: versionResult.data.confirmed_at || null,
    evidenceVersionReference: evidenceResult.data.evidence_version_reference || null,
    documentHash: evidenceResult.data.document_hash || null,
    sourceType: evidenceResult.data.source_type || null,
    observedAt: evidenceResult.data.observed_at || null,
    verificationState: evidenceResult.data.verification_state || null,
    fieldClaims: evidenceResult.data.field_claims || {},
    provenance: evidenceResult.data.provenance || {},
    createdAt: evidenceResult.data.created_at || null,
    createsTruth: false,
  });
}

async function enrichRolePeople(client, roles = []) {
  const personIds = [...new Set((roles || [])
    .map(role => String(role?.participant_person_id || role?.participantPersonId || ''))
    .filter(Boolean))];
  if (!personIds.length) return roles || [];

  const peopleResult = await client.from('commercial_people')
    .select('id,person_reference,display_name,preferred_name,lifecycle_state,archived_at')
    .in('id', personIds)
    .eq('lifecycle_state', 'CONFIRMED')
    .is('archived_at', null);
  if (peopleResult?.error) return roles || [];

  const byId = new Map((peopleResult?.data || []).map(person => [String(person.id), person]));
  return (roles || []).map(role => {
    const person = byId.get(String(role?.participant_person_id || role?.participantPersonId || ''));
    if (!person) return role;
    const label = person.preferred_name || person.display_name || role.display_label || role.person_display_label;
    return {
      ...role,
      display_label: label,
      person_display_label: label,
      participant_person_reference: role.participant_person_reference || person.person_reference || null,
    };
  });
}

async function loadEvidencePacket(client, packetReference) {
  if (!REF.test(String(packetReference || '')) || !String(packetReference).startsWith('POLICY_PACKET:AURA:')) {
    const error = new Error('CARTERA_EVIDENCE_PACKET_REFERENCE_INVALID');
    error.code = 'CARTERA_EVIDENCE_PACKET_REFERENCE_INVALID';
    throw error;
  }
  const result = await client.from('cartera020b_policy_evidence_packets')
    .select('packet_reference,document_type,extracted_fields,extraction_confidence,warnings,identity_candidates,policy_role_candidates,existing_policy_candidates,confirmation_state,created_at')
    .eq('packet_reference', packetReference)
    .maybeSingle();
  if (result?.error || !result?.data) {
    const error = new Error('CARTERA_EVIDENCE_PACKET_READ_FAILED');
    error.code = 'CARTERA_EVIDENCE_PACKET_READ_FAILED';
    error.cause = result?.error || null;
    throw error;
  }
  return freeze({
    packetReference: result.data.packet_reference,
    documentType: result.data.document_type,
    fields: result.data.extracted_fields || {},
    confidence: result.data.extraction_confidence ?? null,
    warnings: result.data.warnings || [],
    identityCandidates: result.data.identity_candidates || [],
    policyRoleCandidates: result.data.policy_role_candidates || [],
    existingPolicyCandidates: result.data.existing_policy_candidates || [],
    confirmationState: result.data.confirmation_state || null,
    createdAt: result.data.created_at || null,
    createsTruth: false,
  });
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createDurableAdapter({ client, windowRef });

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      stale020cReviewSuppression010i: true,
      policyEvidenceRecovery010i: true,
      policyRolePersonProjection010i: true,
      pendingEvidenceOpen010i: true,
    }),
    async loadHome() {
      const home = await adapter.loadHome();
      const reviews = await activePendingReviews(client, home?.reviews || []);
      return freeze({ ...home, reviews });
    },
    async loadPolicyWorkspace(reference) {
      const workspace = await adapter.loadPolicyWorkspace(reference);
      const [roles, evidence] = await Promise.all([
        enrichRolePeople(client, workspace?.roles || []),
        latestPolicyEvidence(client, reference),
      ]);
      return freeze({ ...workspace, roles, evidence });
    },
    async loadEvidencePacket(reference) {
      return loadEvidencePacket(client, reference);
    },
  });
}