const authorities = new Map();
const previews = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function freezeRecord(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeRecord));
  if (!value || typeof value !== 'object') return value;
  return Object.freeze(Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, freezeRecord(entry)]),
  ));
}

function createOpaqueId(prefix) {
  const random = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

function missingContext(command, context) {
  return (command.requiresContext || []).filter(key => {
    const value = context?.[key];
    return value === undefined || value === null || value === '';
  });
}

export function registerWriteAuthority({ handlerId, prepare, execute }) {
  if (!handlerId || typeof execute !== 'function') {
    throw new TypeError('Write authority requires handlerId and execute');
  }
  const authority = Object.freeze({
    handlerId: String(handlerId),
    prepare: typeof prepare === 'function' ? prepare : null,
    execute,
  });
  authorities.set(authority.handlerId, authority);
  return () => authorities.delete(authority.handlerId);
}

export function clearWriteAuthorities() {
  authorities.clear();
}

export function clearWritePreviews() {
  previews.clear();
}

export function getWritePreview(previewId) {
  const session = previews.get(previewId);
  if (!session) return null;
  return session.publicPreview;
}

export async function prepareWritePreview({
  command,
  context = {},
  input = {},
  now = Date.now(),
  ttlMs = DEFAULT_TTL_MS,
} = {}) {
  if (!command || command.intent !== 'WRITE') {
    return { ok: false, reason: 'WRITE_COMMAND_REQUIRED' };
  }
  if (command.availability !== 'enabled') {
    return { ok: false, reason: 'COMMAND_UNAVAILABLE' };
  }

  const missing = missingContext(command, context);
  if (missing.length) {
    return { ok: false, reason: 'WRITE_CONTEXT_REQUIRED', missing };
  }

  const authority = authorities.get(command.handlerId);
  if (!authority) {
    return { ok: false, reason: 'WRITE_AUTHORITY_NOT_REGISTERED' };
  }

  const prepared = authority.prepare
    ? await authority.prepare({ command, context: freezeRecord({ ...context }), input: freezeRecord({ ...input }) })
    : { summary: command.label, changes: input, payload: input };

  if (!prepared || prepared.ok === false) {
    return {
      ok: false,
      reason: prepared?.reason || 'WRITE_PREVIEW_REJECTED',
      details: prepared?.details || null,
    };
  }

  const previewId = createOpaqueId('write-preview');
  const confirmationToken = createOpaqueId('confirm');
  const expiresAt = Number(now) + Math.max(1, Number(ttlMs) || DEFAULT_TTL_MS);
  const draft = freezeRecord({
    commandId: command.id,
    handlerId: command.handlerId,
    context: { ...context },
    input: { ...input },
    payload: prepared.payload ?? input,
  });
  const publicPreview = freezeRecord({
    ok: true,
    status: 'PREVIEW_REQUIRED',
    previewId,
    confirmationToken,
    commandId: command.id,
    label: command.label,
    summary: prepared.summary || command.label,
    changes: prepared.changes || prepared.payload || input,
    expiresAt,
    requiresExplicitConfirmation: true,
  });

  previews.set(previewId, {
    authority,
    command,
    draft,
    confirmationToken,
    expiresAt,
    state: 'PENDING',
    publicPreview,
  });
  return publicPreview;
}

export async function confirmWritePreview({ previewId, confirmationToken, now = Date.now() } = {}) {
  const session = previews.get(previewId);
  if (!session) return { ok: false, reason: 'WRITE_PREVIEW_NOT_FOUND' };
  if (session.state !== 'PENDING') return { ok: false, reason: 'WRITE_PREVIEW_ALREADY_RESOLVED' };
  if (Number(now) > session.expiresAt) {
    session.state = 'EXPIRED';
    return { ok: false, reason: 'WRITE_PREVIEW_EXPIRED' };
  }
  if (!confirmationToken || confirmationToken !== session.confirmationToken) {
    return { ok: false, reason: 'WRITE_CONFIRMATION_TOKEN_INVALID' };
  }

  session.state = 'EXECUTING';
  try {
    const authorityResult = await session.authority.execute({
      command: session.command,
      draft: session.draft,
    });
    if (!authorityResult?.ok) {
      session.state = 'PENDING';
      return {
        ok: false,
        reason: authorityResult?.reason || 'WRITE_AUTHORITY_REJECTED',
        details: authorityResult?.details || null,
      };
    }

    session.state = 'CONFIRMED';
    const receipt = freezeRecord({
      ok: true,
      status: 'WRITE_CONFIRMED',
      receiptId: authorityResult.receiptId || createOpaqueId('write-receipt'),
      previewId,
      commandId: session.command.id,
      authority: session.command.handlerId,
      result: authorityResult.result ?? null,
      confirmedAt: Number(now),
    });
    session.receipt = receipt;
    return receipt;
  } catch (error) {
    session.state = 'PENDING';
    return {
      ok: false,
      reason: 'WRITE_AUTHORITY_FAILED',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export function cancelWritePreview({ previewId } = {}) {
  const session = previews.get(previewId);
  if (!session) return { ok: false, reason: 'WRITE_PREVIEW_NOT_FOUND' };
  if (session.state !== 'PENDING') return { ok: false, reason: 'WRITE_PREVIEW_ALREADY_RESOLVED' };
  session.state = 'CANCELLED';
  return freezeRecord({ ok: true, status: 'WRITE_CANCELLED', previewId });
}
