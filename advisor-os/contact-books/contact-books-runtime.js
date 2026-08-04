const BOOK_TYPES = new Set(['CUSTOM','PROJECT_200','SYSTEM']);
const SORTS = new Set(['NAME_ASC','NAME_DESC','CREATED_AT_ASC','CREATED_AT_DESC']);
const required = (value, code) => { const text = String(value || '').trim(); if (!text) throw Object.assign(new TypeError(code), { code }); return text; };
const freeze = value => Object.freeze({ ...value });
const normalizeName = value => required(value, 'BOOK_NAME_REQUIRED').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export function createContactBooksRuntime({ repository, eventSink = null, clock = () => new Date().toISOString() } = {}) {
  if (!repository) throw Object.assign(new TypeError('BOOK_REPOSITORY_REQUIRED'), { code: 'BOOK_REPOSITORY_REQUIRED' });
  const emit = async event => eventSink?.append?.(freeze({ ...event, occurredAt: clock() }));

  async function createBook({ ownerId, name, bookType = 'CUSTOM', idempotencyKey = null, bookReference = null }) {
    ownerId = required(ownerId, 'OWNER_REQUIRED');
    const normalizedName = normalizeName(name);
    if (!BOOK_TYPES.has(bookType)) throw Object.assign(new TypeError('BOOK_TYPE_INVALID'), { code: 'BOOK_TYPE_INVALID' });
    if (repository.commandAuthority !== true) {
      const existing = await repository.findActiveBookByNormalizedName({ ownerId, normalizedName });
      if (existing) return freeze({ book: existing, created: false });
    }
    const book = await repository.createBook({ ownerId, name: required(name, 'BOOK_NAME_REQUIRED'), normalizedName, bookType, status: 'ACTIVE', createdAt: clock(), idempotencyKey, bookReference });
    await emit({ type: 'BOOK_CREATED', ownerId, bookId: book.bookId });
    return freeze({ book, created: book.status === 'CREATED' });
  }

  async function resolveProject200Book({ ownerId, idempotencyKey = null }) {
    if (typeof repository.resolveProject200Book === 'function') {
      const book = await repository.resolveProject200Book({ ownerId: required(ownerId, 'OWNER_REQUIRED'), idempotencyKey });
      return freeze({ book, created: book.status === 'CREATED' });
    }
    return createBook({ ownerId, name: 'Proyecto 200', bookType: 'PROJECT_200' });
  }

  async function addPeopleToBook({ ownerId, bookId, personIds, source = 'MANUAL', importBatchId = null, idempotencyKey = null }) {
    ownerId = required(ownerId, 'OWNER_REQUIRED');
    bookId = required(bookId, 'BOOK_ID_REQUIRED');
    const ids = [...new Set((personIds || []).map(String).map(value => value.trim()).filter(Boolean))];
    if (typeof repository.addMembers === 'function') {
      const result = await repository.addMembers({ ownerId, bookId, personIds: ids, source, importBatchId, idempotencyKey });
      for (const personId of ids) await emit({ type: 'CONTACT_ADDED_TO_BOOK', ownerId, bookId, personId, importBatchId });
      return freeze({ ...result, count: result.addedCount ?? ids.length });
    }
    const memberships = [];
    for (const personId of ids) {
      const membership = await repository.ensureMembership({ ownerId, bookId, personId, source, importBatchId, joinedAt: clock() });
      memberships.push(membership);
      await emit({ type: 'CONTACT_ADDED_TO_BOOK', ownerId, bookId, personId, importBatchId });
    }
    return freeze({ memberships: Object.freeze(memberships), count: memberships.length });
  }

  async function movePeopleBetweenBooks({ ownerId, originBookId, destinationBookId, personIds, idempotencyKey = null }) {
    if (originBookId === destinationBookId) throw Object.assign(new TypeError('BOOK_MOVE_DESTINATION_EQUALS_ORIGIN'), { code: 'BOOK_MOVE_DESTINATION_EQUALS_ORIGIN' });
    const ids = [...new Set((personIds || []).map(String).map(value => value.trim()).filter(Boolean))];
    if (typeof repository.moveMembers === 'function') {
      const result = await repository.moveMembers({ ownerId: required(ownerId, 'OWNER_REQUIRED'), originBookId, destinationBookId, personIds: ids, idempotencyKey });
      for (const personId of ids) await emit({ type: 'CONTACT_MOVED_BETWEEN_BOOKS', ownerId, personId, originBookId, destinationBookId });
      return freeze(result);
    }
    const result = await repository.transaction(async tx => {
      const added = await createContactBooksRuntime({ repository: tx, eventSink: null, clock }).addPeopleToBook({ ownerId, bookId: destinationBookId, personIds: ids, source: 'MOVE' });
      for (const personId of ids) await tx.removeMembership({ ownerId, bookId: originBookId, personId });
      return added;
    });
    for (const personId of ids) await emit({ type: 'CONTACT_MOVED_BETWEEN_BOOKS', ownerId, personId, originBookId, destinationBookId });
    return result;
  }

  async function listBookMembers({ ownerId, bookId, sort = 'CREATED_AT_DESC' }) {
    if (!SORTS.has(sort)) throw Object.assign(new TypeError('SORT_INVALID'), { code: 'SORT_INVALID' });
    const members = await repository.listBookMembers({ ownerId: required(ownerId, 'OWNER_REQUIRED'), bookId: required(bookId, 'BOOK_ID_REQUIRED') });
    const collator = new Intl.Collator('es-MX', { sensitivity: 'base' });
    const sorted = [...members].sort((a, b) => {
      if (sort === 'NAME_ASC') return collator.compare(a.displayName || '', b.displayName || '');
      if (sort === 'NAME_DESC') return collator.compare(b.displayName || '', a.displayName || '');
      const left = Date.parse(a.createdAt || 0) || 0;
      const right = Date.parse(b.createdAt || 0) || 0;
      return sort === 'CREATED_AT_ASC' ? left - right : right - left;
    });
    return freeze({ sort, members: Object.freeze(sorted) });
  }

  const command = (method, input) => {
    if (typeof repository[method] !== 'function') throw Object.assign(new Error('BOOK_COMMAND_UNAVAILABLE'), { code: 'BOOK_COMMAND_UNAVAILABLE' });
    return repository[method](input);
  };

  return Object.freeze({
    createBook,
    resolveProject200Book,
    addPeopleToBook,
    movePeopleBetweenBooks,
    listBookMembers,
    listBooks: input => command('listBooks', input),
    renameBook: input => command('renameBook', input),
    archiveBook: input => command('archiveBook', input),
    restoreBook: input => command('restoreBook', input),
    removePeopleFromBook: input => command('removeMembers', input),
    diagnostics: () => freeze({ secondPersonStore: false, directDatabaseWrite: false, defaultSort: 'CREATED_AT_DESC', atomicRemoteMove: typeof repository.moveMembers === 'function' }),
  });
}
