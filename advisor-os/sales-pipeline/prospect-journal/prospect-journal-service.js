(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ForgeProspectJournalServiceP7 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  class ProspectJournalError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = 'ProspectJournalError';
      this.code = code;
      this.details = details;
    }
  }

  function rowToEntry(row) {
    return {
      id: row?.id || null,
      prospectId: row?.prospect_id || row?.prospectId || null,
      advisorId: row?.advisor_id || row?.advisorId || null,
      content: row?.content || '',
      captureMethod: row?.capture_method || row?.captureMethod || 'text',
      source: row?.source || 'PIPELINE_CONTEXT',
      createdAt: row?.created_at || row?.createdAt || null,
      createdBy: row?.created_by || row?.createdBy || null,
    };
  }

  async function authenticatedUser(client) {
    const { data, error } = await client.auth.getUser();
    const user = data?.user;
    if (error || !user?.id) {
      throw new ProspectJournalError('AUTH_REQUIRED', 'Tu sesión expiró. Inicia sesión nuevamente.');
    }
    return user;
  }

  function mapError(error) {
    if (error instanceof ProspectJournalError) throw error;
    if (error?.code === '42P01' || error?.code === 'PGRST205') {
      throw new ProspectJournalError(
        'PROSPECT_JOURNAL_NOT_DEPLOYED',
        'La bitácora todavía no está disponible en este entorno.',
      );
    }
    if (error?.code === '23503') {
      throw new ProspectJournalError('PROSPECT_NOT_FOUND', 'No encontramos el prospecto.');
    }
    throw new ProspectJournalError('NETWORK_ERROR', 'No pudimos completar la operación. Intenta nuevamente.');
  }

  function validateEntry(input = {}) {
    const content = String(input.content || '').trim();
    const captureMethod = input.captureMethod === 'voice' ? 'voice' : 'text';
    if (!content) {
      throw new ProspectJournalError('VALIDATION_ERROR', 'Escribe o dicta una nota antes de guardarla.');
    }
    if (content.length > 4000) {
      throw new ProspectJournalError('VALIDATION_ERROR', 'La nota no puede superar 4,000 caracteres.');
    }
    return { content, captureMethod };
  }

  function assertWriteReceipt({ created, expected, prospectId, advisorId }) {
    const valid = created?.id
      && created.prospectId === prospectId
      && created.advisorId === advisorId
      && created.content === expected.content
      && created.captureMethod === expected.captureMethod
      && created.source === 'PIPELINE_CONTEXT';
    if (valid) return created;
    throw new ProspectJournalError(
      'PROSPECT_JOURNAL_WRITE_RECEIPT_MISMATCH',
      'La fuente no devolvió una confirmación válida de la nota escrita.',
      { createdId: created?.id || null, prospectId: created?.prospectId || null },
    );
  }

  function assertConfirmedEntry({ created, confirmed, expected }) {
    const valid = created?.id
      && confirmed?.id === created.id
      && confirmed.prospectId === created.prospectId
      && confirmed.content === expected.content
      && confirmed.captureMethod === expected.captureMethod;
    if (valid) return confirmed;
    throw new ProspectJournalError(
      'PROSPECT_JOURNAL_PERSISTENCE_MISMATCH',
      'La nota no pudo confirmarse después de guardarla.',
      { createdId: created?.id || null, confirmedId: confirmed?.id || null },
    );
  }

  function create(client) {
    if (!client?.auth?.getUser || !client?.from) {
      throw new ProspectJournalError('AUTH_REQUIRED', 'Supabase autenticado es obligatorio.');
    }

    async function listEntries(prospectId) {
      await authenticatedUser(client);
      const { data, error } = await client
        .from('prospect_journal_entries')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false });
      if (error) mapError(error);
      return (data || []).map(rowToEntry);
    }

    async function getEntry(entryId) {
      await authenticatedUser(client);
      const { data, error } = await client
        .from('prospect_journal_entries')
        .select('*')
        .eq('id', entryId)
        .single();
      if (error) mapError(error);
      return rowToEntry(data);
    }

    async function appendEntry(prospectId, input) {
      const user = await authenticatedUser(client);
      const normalized = validateEntry(input);
      const row = {
        advisor_id: user.id,
        prospect_id: prospectId,
        content: normalized.content,
        capture_method: normalized.captureMethod,
        source: 'PIPELINE_CONTEXT',
        created_by: user.id,
      };
      const { data, error } = await client
        .from('prospect_journal_entries')
        .insert(row)
        .select('*')
        .single();
      if (error) mapError(error);

      // The INSERT ... RETURNING response is the write receipt. Do not make a
      // second read part of the write promise: a temporary read outage must not
      // relabel a committed write as a failed write. Callers that need stronger
      // read-after-write verification can use getEntry/listEntries separately.
      const created = rowToEntry(data);
      return assertWriteReceipt({
        created,
        expected: normalized,
        prospectId,
        advisorId: user.id,
      });
    }

    return Object.freeze({ listEntries, getEntry, appendEntry });
  }

  return Object.freeze({
    create,
    validateEntry,
    assertWriteReceipt,
    assertConfirmedEntry,
    ProspectJournalError,
  });
});
