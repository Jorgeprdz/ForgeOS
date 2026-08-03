const BOOK_TYPES = new Set(['CUSTOM','PROJECT_200','SYSTEM']);
const SORTS = new Set(['NAME_ASC','NAME_DESC','CREATED_AT_ASC','CREATED_AT_DESC']);
const required = (value, code) => { const text = String(value || '').trim(); if (!text) throw Object.assign(new TypeError(code), { code }); return text; };
const freeze = value => Object.freeze({ ...value });
const normalizeName = value => required(value, 'BOOK_NAME_REQUIRED').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export function createContactBooksRuntime({ repository, eventSink = null, clock = () => new Date().toISOString() } = {}) {
  if (!repository) throw Object.assign(new TypeError('BOOK_REPOSITORY_REQUIRED'), { code: 'BOOK_REPOSITORY_REQUIRED' });
  const emit = async event => eventSink?.append?.(freeze({ ...event, occurredAt: clock() }));

  async function createBook({ ownerId, name, bookType = 'CUSTOM' }) {
    ownerId = required(ownerId, 'OWNER_REQUIRED');
    const normalizedName = normalizeName(name);
    if (!BOOK_TYPES.has(bookType)) throw Object.assign(new TypeError('BOOK_TYPE_INVALID'), { code: 'BOOK_TYPE_INVALID' });
    const existing = await repository.findActiveBookByNormalizedName({ ownerId, normalizedName });
    if (existing) return freeze({ book: existing, created: false });
    const book = await repository.createBook({ ownerId, name: required(name, 'BOOK_NAME_REQUIRED'), normalizedName, bookType, status: 'ACTIVE', createdAt: clock() });
    await emit({ type: 'BOOK_CREATED', ownerId, bookId: book.bookId });
    return freeze({ book, created: true });
  }

  async function resolveProject200Book({ ownerId }) {
    return createBook({ ownerId, name: 'Proyecto 200', bookType: 'PROJECT_200' });
  }

  async function addPeopleToBook({ ownerId, bookId, personIds, source = 'MANUAL', importBatchId = null }) {
    ownerId = required(ownerId, 'OWNER_REQUIRED');
    bookId = required(bookId, 'BOOK_ID_REQUIRED');
    const ids = [...new Set((personIds || []).map(String).map(value => value.trim()).filter(Boolean))];
    const memberships = [];
    for (const personId of ids) {
      const membership = await repository.ensureMembership({ ownerId, bookId, personId, source, importBatchId, joinedAt: clock() });
      memberships.push(membership);
      await emit({ type: 'CONTACT_ADDED_TO_BOOK', ownerId, bookId, personId, importBatchId });
    }
    return freeze({ memberships: Object.freeze(memberships), count: memberships.length });
  }

  async function movePeopleBetweenBooks({ ownerId, originBookId, destinationBookId, personIds }) {
    if (originBookId === destinationBookId) throw Object.assign(new TypeError('BOOK_MOVE_DESTINATION_EQUALS_ORIGIN'), { code: 'BOOK_MOVE_DESTINATION_EQUALS_ORIGIN' });
    const result = await repository.transaction(async tx => {
      const added = await createContactBooksRuntime({ repository: tx, eventSink: null, clock }).addPeopleToBook({ ownerId, bookId: destinationBookId, personIds, source: 'MOVE' });
      for (const personId of personIds) await tx.removeMembership({ ownerId, bookId: originBookId, personId });
      return added;
    });
    for (const personId of personIds) await emit({ type: 'CONTACT_MOVED_BETWEEN_BOOKS', ownerId, personId, originBookId, destinationBookId });
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

  return Object.freeze({ createBook, resolveProject200Book, addPeopleToBook, movePeopleBetweenBooks, listBookMembers, diagnostics: () => freeze({ secondPersonStore: false, directDatabaseWrite: false, defaultSort: 'CREATED_AT_DESC' }) });
}
