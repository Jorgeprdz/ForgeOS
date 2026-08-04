const required = (value, code) => {
  const text = String(value || '').trim();
  if (!text) throw Object.assign(new TypeError(code), { code });
  return text;
};

const uid = () => typeof crypto?.randomUUID === 'function'
  ? crypto.randomUUID()
  : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function createContactBooksSupabaseRepository({ client, userId, getCurrentUserId = () => userId, getGeneration = () => 0 } = {}) {
  if (!client?.rpc) throw Object.assign(new TypeError('SUPABASE_CLIENT_REQUIRED'), { code: 'SUPABASE_CLIENT_REQUIRED' });
  userId = required(userId, 'OWNER_REQUIRED');
  const referencesById = new Map();

  function assertOwner(ownerId) {
    if (required(ownerId, 'OWNER_REQUIRED') !== userId || getCurrentUserId() !== userId) {
      throw Object.assign(new Error('CONTACT_BOOK_SESSION_CHANGED'), { code: 'SESSION_CHANGED' });
    }
  }

  async function rpc(name, args, ownerId = userId) {
    assertOwner(ownerId);
    const generation = getGeneration();
    const result = await client.rpc(name, args);
    assertOwner(ownerId);
    if (generation !== getGeneration()) throw Object.assign(new Error('CONTACT_BOOK_LATE_RESULT_REJECTED'), { code: 'LATE_RESULT_REJECTED' });
    if (result?.error) throw Object.assign(new Error(result.error.message || 'CONTACT_BOOK_COMMAND_FAILED'), { code: result.error.code || 'COMMAND_FAILED' });
    return result?.data;
  }

  const key = (value, operation) => value || `contact-books:${operation}:${uid()}`;
  const remember = book => {
    if (book?.bookId && book?.bookReference) referencesById.set(String(book.bookId), book.bookReference);
    return book;
  };
  async function reference(ownerId, bookId) {
    const direct = referencesById.get(String(bookId));
    if (direct) return direct;
    const books = await listBooks({ ownerId, includeArchived: true });
    const book = books.find(item => String(item.bookId) === String(bookId) || item.bookReference === bookId);
    if (!book) throw Object.assign(new Error('CONTACT_BOOK_NOT_FOUND'), { code: 'BOOK_NOT_FOUND' });
    return book.bookReference;
  }

  async function listBooks({ ownerId, includeArchived = false, sort = 'CREATED_AT_DESC' }) {
    const books = await rpc('forge_contact_books_list', { p_include_archived: includeArchived, p_sort: sort }, ownerId);
    return Object.freeze((books || []).map(book => Object.freeze(remember(book))));
  }

  return Object.freeze({
    commandAuthority: true,
    listBooks,
    async findActiveBookByNormalizedName({ ownerId, normalizedName }) {
      return (await listBooks({ ownerId })).find(book => String(book.name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalizedName) || null;
    },
    async createBook({ ownerId, name, bookType, idempotencyKey, bookReference }) {
      return remember(await rpc('forge_contact_books_create', { p_command: { ownerId, name, bookType, bookReference, idempotencyKey: key(idempotencyKey, 'create') } }, ownerId));
    },
    async resolveProject200Book({ ownerId, idempotencyKey }) {
      return remember(await rpc('forge_contact_books_resolve_project_200', { p_command: { ownerId, idempotencyKey: key(idempotencyKey, 'project-200') } }, ownerId));
    },
    async renameBook({ ownerId, bookId, name, idempotencyKey }) {
      return rpc('forge_contact_books_rename', { p_command: { ownerId, bookReference: await reference(ownerId, bookId), name, idempotencyKey: key(idempotencyKey, 'rename') } }, ownerId);
    },
    async archiveBook({ ownerId, bookId, idempotencyKey }) {
      return rpc('forge_contact_books_archive', { p_command: { ownerId, bookReference: await reference(ownerId, bookId), idempotencyKey: key(idempotencyKey, 'archive') } }, ownerId);
    },
    async restoreBook({ ownerId, bookId, idempotencyKey }) {
      return rpc('forge_contact_books_restore', { p_command: { ownerId, bookReference: await reference(ownerId, bookId), idempotencyKey: key(idempotencyKey, 'restore') } }, ownerId);
    },
    async addMembers({ ownerId, bookId, personIds, source, importBatchId, idempotencyKey }) {
      return rpc('forge_contact_books_add_members', { p_command: { ownerId, bookReference: await reference(ownerId, bookId), personReferences: personIds, source, importBatchReference: importBatchId, idempotencyKey: key(idempotencyKey, 'add') } }, ownerId);
    },
    async removeMembers({ ownerId, bookId, personIds, idempotencyKey }) {
      return rpc('forge_contact_books_remove_members', { p_command: { ownerId, bookReference: await reference(ownerId, bookId), personReferences: personIds, idempotencyKey: key(idempotencyKey, 'remove') } }, ownerId);
    },
    async moveMembers({ ownerId, originBookId, destinationBookId, personIds, idempotencyKey }) {
      return rpc('forge_contact_books_move_members', { p_command: { ownerId, originBookReference: await reference(ownerId, originBookId), destinationBookReference: await reference(ownerId, destinationBookId), personReferences: personIds, idempotencyKey: key(idempotencyKey, 'move') } }, ownerId);
    },
    async listBookMembers({ ownerId, bookId }) {
      return rpc('forge_contact_books_list_members', { p_book_reference: await reference(ownerId, bookId) }, ownerId);
    },
    async transaction() { throw Object.assign(new Error('REMOTE_TRANSACTION_CALLBACK_NOT_ALLOWED'), { code: 'REMOTE_TRANSACTION_CALLBACK_NOT_ALLOWED' }); },
    diagnostics: () => Object.freeze({ ownerId: userId, directDatabaseWrite: false, rpcOnly: true, lateResultGuard: true }),
  });
}
