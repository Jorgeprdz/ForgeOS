// CARTERA 020C authenticated confirmation-review reader.
// Reads owner-scoped Evidence and canonical candidate authorities; executes no mutation RPC.

import { SupabaseRuntime } from '../../supabase-runtime.js';
import { createCartera020cReviewReadModel } from '../../platform/policy-intelligence/intake/cartera-020c-candidate-reconciliation.js';

const PACKET_SELECT = [
  'id', 'advisor_id', 'packet_reference', 'inbox_item_id', 'candidate_id',
  'document_type', 'extracted_fields', 'extraction_confidence', 'warnings',
  'identity_candidates', 'policy_role_candidates', 'existing_policy_candidates',
  'confirmation_state', 'creates_truth', 'created_at',
].join(',');

const CANDIDATE_SELECT = [
  'id', 'advisor_id', 'candidate_reference', 'inbox_item_id', 'attempt_id',
  'candidate_type', 'classification', 'extracted_fields', 'overall_confidence',
  'extraction_source', 'parser_id', 'parser_version', 'warnings',
  'missing_fields', 'creates_truth', 'created_at',
].join(',');

const INBOX_SELECT = [
  'id', 'advisor_id', 'inbox_reference', 'source_id', 'status',
  'document_type_candidate', 'classification_state', 'classification_confidence',
  'worker_state', 'warnings', 'created_at', 'updated_at',
].join(',');

const SOURCE_SELECT = [
  'id', 'advisor_id', 'source_reference', 'original_filename', 'mime_type',
  'document_digest', 'received_at',
].join(',');

const PERSON_SELECT = [
  'id', 'advisor_id', 'person_reference', 'display_name', 'preferred_name',
  'normalized_name', 'verified_phone', 'verified_email', 'lifecycle_state',
  'privacy_classification', 'archived_at',
].join(',');

const ACCOUNT_SELECT = [
  'id', 'advisor_id', 'account_reference', 'account_type', 'display_label',
  'lifecycle_state', 'privacy_classification', 'archived_at',
].join(',');

const POLICY_SELECT = [
  'id', 'advisor_id', 'policy_reference', 'carrier_reference', 'policy_number',
  'product_reference', 'status_value', 'status_as_of', 'archived_at',
].join(',');

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function rows(result, code) {
  if (result?.error) throw fail(code, result.error);
  return Array.isArray(result?.data) ? result.data : [];
}

function one(result, code) {
  if (result?.error) throw fail(code, result.error);
  if (!result?.data) throw fail(code);
  return result.data;
}

async function authenticatedUser(client) {
  const result = await client.auth.getUser();
  if (result?.error) throw fail('CARTERA020C_AUTH_LOOKUP_FAILED', result.error);
  if (!result?.data?.user?.id) throw fail('CARTERA020C_AUTH_REQUIRED');
  return result.data.user;
}

function queryOne(client, table, select, column, value) {
  return client
    .from(table)
    .select(select)
    .eq(column, value)
    .maybeSingle();
}

async function loadCandidateCatalogs(client) {
  const [peopleResult, accountsResult, policiesResult] = await Promise.all([
    client.from('commercial_people').select(PERSON_SELECT).order('display_name', { ascending: true }),
    client.from('commercial_accounts').select(ACCOUNT_SELECT).order('display_label', { ascending: true }),
    client.from('canonical_policies').select(POLICY_SELECT).order('status_as_of', { ascending: false }),
  ]);
  return Object.freeze({
    people: rows(peopleResult, 'CARTERA020C_PERSON_CATALOG_READ_FAILED'),
    accounts: rows(accountsResult, 'CARTERA020C_ACCOUNT_CATALOG_READ_FAILED'),
    policies: rows(policiesResult, 'CARTERA020C_POLICY_CATALOG_READ_FAILED'),
  });
}

export function createCanonicalConfirmationReviewService({ client, clock } = {}) {
  const resolvedClient = client || SupabaseRuntime.getClient();
  const resolvedClock = typeof clock === 'function'
    ? clock
    : () => new Date().toISOString();

  if (!resolvedClient?.auth?.getUser || !resolvedClient?.from) {
    throw fail('CARTERA020C_SUPABASE_CLIENT_INVALID');
  }

  async function loadReview(packetReference) {
    const user = await authenticatedUser(resolvedClient);
    const packetResult = await queryOne(
      resolvedClient,
      'cartera020b_policy_evidence_packets',
      PACKET_SELECT,
      'packet_reference',
      packetReference
    );
    const packet = one(packetResult, 'CARTERA020C_PACKET_NOT_FOUND');

    const [candidateResult, inboxResult, catalogs] = await Promise.all([
      queryOne(
        resolvedClient,
        'cartera020b_extraction_candidates',
        CANDIDATE_SELECT,
        'id',
        packet.candidate_id
      ),
      queryOne(
        resolvedClient,
        'cartera020b_evidence_inbox_items',
        INBOX_SELECT,
        'id',
        packet.inbox_item_id
      ),
      loadCandidateCatalogs(resolvedClient),
    ]);
    const candidate = one(candidateResult, 'CARTERA020C_CANDIDATE_NOT_FOUND');
    const inbox = one(inboxResult, 'CARTERA020C_INBOX_NOT_FOUND');
    const sourceResult = await queryOne(
      resolvedClient,
      'cartera020b_evidence_sources',
      SOURCE_SELECT,
      'id',
      inbox.source_id
    );
    const source = one(sourceResult, 'CARTERA020C_SOURCE_NOT_FOUND');

    return createCartera020cReviewReadModel({
      advisorId: user.id,
      actorReference: user.id,
      packetRow: packet,
      candidateRow: candidate,
      inboxRow: inbox,
      sourceRow: source,
      people: catalogs.people,
      accounts: catalogs.accounts,
      policies: catalogs.policies,
      reviewReference: `review/${packet.packet_reference}`,
      createdAt: resolvedClock(),
    });
  }

  async function listPendingReviews() {
    const user = await authenticatedUser(resolvedClient);
    const inboxResult = await resolvedClient
      .from('cartera020b_evidence_inbox_items')
      .select(INBOX_SELECT)
      .eq('status', 'confirmation_required')
      .eq('worker_state', 'COMPLETED')
      .order('updated_at', { ascending: false });
    const inboxRows = rows(inboxResult, 'CARTERA020C_PENDING_INBOX_READ_FAILED');
    if (inboxRows.length === 0) return Object.freeze([]);

    const inboxIds = inboxRows.map((row) => row.id);
    const sourceIds = [...new Set(inboxRows.map((row) => row.source_id))];
    const [packetResult, sourceResult, catalogs] = await Promise.all([
      resolvedClient
        .from('cartera020b_policy_evidence_packets')
        .select(PACKET_SELECT)
        .in('inbox_item_id', inboxIds),
      resolvedClient
        .from('cartera020b_evidence_sources')
        .select(SOURCE_SELECT)
        .in('id', sourceIds),
      loadCandidateCatalogs(resolvedClient),
    ]);
    const packets = rows(packetResult, 'CARTERA020C_PENDING_PACKET_READ_FAILED');
    const sources = rows(sourceResult, 'CARTERA020C_PENDING_SOURCE_READ_FAILED');
    const candidateIds = [...new Set(packets.map((row) => row.candidate_id))];
    const candidateResult = await resolvedClient
      .from('cartera020b_extraction_candidates')
      .select(CANDIDATE_SELECT)
      .in('id', candidateIds);
    const candidates = rows(candidateResult, 'CARTERA020C_PENDING_CANDIDATE_READ_FAILED');

    const inboxById = new Map(inboxRows.map((row) => [row.id, row]));
    const sourceById = new Map(sources.map((row) => [row.id, row]));
    const candidateById = new Map(candidates.map((row) => [row.id, row]));

    return Object.freeze(packets.map((packet) => {
      const inbox = inboxById.get(packet.inbox_item_id);
      if (!inbox) throw fail('CARTERA020C_PENDING_INBOX_CHAIN_MISSING');
      const source = sourceById.get(inbox.source_id);
      const candidate = candidateById.get(packet.candidate_id);
      if (!source || !candidate) throw fail('CARTERA020C_PENDING_EVIDENCE_CHAIN_MISSING');

      return createCartera020cReviewReadModel({
        advisorId: user.id,
        actorReference: user.id,
        packetRow: packet,
        candidateRow: candidate,
        inboxRow: inbox,
        sourceRow: source,
        people: catalogs.people,
        accounts: catalogs.accounts,
        policies: catalogs.policies,
        reviewReference: `review/${packet.packet_reference}`,
        createdAt: resolvedClock(),
      });
    }));
  }

  return Object.freeze({ loadReview, listPendingReviews });
}

export const CARTERA_020C_PACKET_SELECT = PACKET_SELECT;
export const CARTERA_020C_CANDIDATE_SELECT = CANDIDATE_SELECT;
export const CARTERA_020C_INBOX_SELECT = INBOX_SELECT;
export const CARTERA_020C_SOURCE_SELECT = SOURCE_SELECT;
export const CARTERA_020C_PERSON_SELECT = PERSON_SELECT;
export const CARTERA_020C_ACCOUNT_SELECT = ACCOUNT_SELECT;
export const CARTERA_020C_POLICY_SELECT = POLICY_SELECT;
