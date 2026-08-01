import { createHash } from 'node:crypto';
import { verifyCartera120ManifestDigest } from '../../platform/program-governance/cartera-120b-selective-promotion-manifest.js';

const DECISIONS = new Set(['HOLD', 'AUTHORIZE_SELECTIVE_PROMOTION']);
export const CARTERA_120_AUTHORIZATION_PHRASE = 'AUTHORIZE_CARTERA_120_SELECTIVE_PROMOTION';

function requiredText(value, code, maxLength = 1000) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(code);
  return text.slice(0, maxLength);
}

function requiredSha(value, code) {
  const text = requiredText(value, code, 40).toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(text)) throw new Error(code);
  return text;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function createCartera120PromotionAuthorizationReceipt(raw = {}) {
  const manifest = raw.manifest;
  if (!manifest || manifest.contract !== 'CARTERA_120B_SELECTIVE_PROMOTION_MANIFEST_V1') {
    throw new Error('CARTERA120_VALID_PROMOTION_MANIFEST_REQUIRED');
  }
  if (!verifyCartera120ManifestDigest(manifest)) {
    throw new Error('CARTERA120_PROMOTION_MANIFEST_DIGEST_MISMATCH');
  }

  const decision = requiredText(raw.decision, 'CARTERA120_DECISION_REQUIRED', 80).toUpperCase();
  if (!DECISIONS.has(decision)) throw new Error(`CARTERA120_DECISION_INVALID:${decision}`);

  const actorId = requiredText(raw.actorId, 'CARTERA120_ACTOR_REQUIRED', 240);
  const reason = requiredText(raw.reason, 'CARTERA120_REASON_REQUIRED', 1000);
  const decidedAt = requiredText(raw.decidedAt, 'CARTERA120_DECIDED_AT_REQUIRED', 80);
  if (Number.isNaN(Date.parse(decidedAt))) throw new Error('CARTERA120_DECIDED_AT_INVALID');

  const observedMainHead = requiredSha(raw.observedMainHead, 'CARTERA120_OBSERVED_MAIN_HEAD_REQUIRED');
  const observedProgramHead = requiredSha(raw.observedProgramHead, 'CARTERA120_OBSERVED_PROGRAM_HEAD_REQUIRED');
  if (observedMainHead !== manifest.currentMainHead) {
    throw new Error('CARTERA120_CURRENT_MAIN_HEAD_MOVED');
  }
  if (observedProgramHead !== manifest.acceptedProgramHead) {
    throw new Error('CARTERA120_ACCEPTED_PROGRAM_HEAD_MOVED');
  }

  const explicitPhrase = typeof raw.explicitAuthorizationPhrase === 'string'
    ? raw.explicitAuthorizationPhrase.trim()
    : '';
  if (decision === 'AUTHORIZE_SELECTIVE_PROMOTION') {
    if (manifest.state !== 'READY_FOR_AUTHORIZATION_REVIEW') {
      throw new Error('CARTERA120_MANIFEST_NOT_READY');
    }
    if (explicitPhrase !== CARTERA_120_AUTHORIZATION_PHRASE) {
      throw new Error('CARTERA120_EXPLICIT_AUTHORIZATION_PHRASE_REQUIRED');
    }
    if (raw.boardApprovalGranted !== true) {
      throw new Error('CARTERA120_BOARD_APPROVAL_REQUIRED');
    }
    if (raw.mergeAuthorizationGranted !== true) {
      throw new Error('CARTERA120_MERGE_AUTHORIZATION_REQUIRED');
    }
  }

  const authorized = decision === 'AUTHORIZE_SELECTIVE_PROMOTION';
  const receiptCore = {
    actorId,
    decision,
    decidedAt: new Date(decidedAt).toISOString(),
    manifestDigest: manifest.manifestDigest,
    observedMainHead,
    observedProgramHead,
    reason,
    boardApprovalGranted: raw.boardApprovalGranted === true,
    mergeAuthorizationGranted: raw.mergeAuthorizationGranted === true,
  };

  return Object.freeze({
    contract: 'CARTERA_120C_PROMOTION_AUTHORIZATION_RECEIPT_V1',
    ...receiptCore,
    receiptDigest: sha256(JSON.stringify(receiptCore)),
    authorizationState: authorized
      ? 'AUTHORIZED_FOR_SEPARATE_HEAD_BOUND_EXECUTION'
      : 'HELD_PENDING_EXPLICIT_AUTHORIZATION',
    authorized,
    execution: Object.freeze({
      executionAuthorized: false,
      mergeExecuted: false,
      mainMutated: false,
      pullRequestMutated: false,
      deploymentExecuted: false,
      databaseMutated: false,
      accountMutated: false,
    }),
    boundaries: Object.freeze({
      passInstructionIsMergeAuthorization: false,
      silenceIsAuthorization: false,
      exactPhraseRequiredForAuthorization: true,
      authorizationIsExecution: false,
      separateHeadBoundExecutionRequired: true,
      mainHeadMovementInvalidatesReceipt: true,
      sourceHeadMovementInvalidatesReceipt: true,
    }),
  });
}

export function prepareCartera120ControlledPromotionHandoff({ manifest, receipt } = {}) {
  if (!manifest || manifest.contract !== 'CARTERA_120B_SELECTIVE_PROMOTION_MANIFEST_V1') {
    throw new Error('CARTERA120_VALID_HANDOFF_MANIFEST_REQUIRED');
  }
  if (!receipt || receipt.contract !== 'CARTERA_120C_PROMOTION_AUTHORIZATION_RECEIPT_V1') {
    throw new Error('CARTERA120_VALID_HANDOFF_RECEIPT_REQUIRED');
  }
  if (receipt.manifestDigest !== manifest.manifestDigest) {
    throw new Error('CARTERA120_HANDOFF_DIGEST_MISMATCH');
  }

  return Object.freeze({
    contract: 'CARTERA_120C_CONTROLLED_PROMOTION_HANDOFF_V1',
    status: receipt.authorized
      ? 'READY_FOR_130_SELECTIVE_PROMOTION_EXECUTION'
      : 'HOLD_NO_EXECUTION_AUTHORIZED',
    currentMainHead: manifest.currentMainHead,
    acceptedProgramHead: manifest.acceptedProgramHead,
    manifestDigest: manifest.manifestDigest,
    receiptDigest: receipt.receiptDigest,
    entryCount: manifest.entries.length,
    requiredNextAction: receipt.authorized
      ? 'RUN_CARTERA_130_HEAD_BOUND_SELECTIVE_PROMOTION'
      : 'OBTAIN_EXACT_BOARD_AND_MERGE_AUTHORIZATION',
    effects: Object.freeze({
      filesCopied: 0,
      filesReconciled: 0,
      merge: false,
      mainMutation: false,
      pullRequestMutation: false,
      deployment: false,
      databaseMutation: false,
      accountMutation: false,
    }),
  });
}
