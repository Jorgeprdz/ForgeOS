const BASIC_ALIASES = Object.freeze({
  firstName: ['nombre','nombres','first name'], lastName: ['apellido','apellidos','last name'],
  displayName: ['nombre completo','contacto','persona'], phone: ['telefono','teléfono','celular','whatsapp'],
  email: ['correo','email','e-mail'], company: ['empresa','ocupacion','ocupación'], externalId: ['id','identificador','folio'],
});
const norm = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const phone = value => String(value || '').replace(/\D/g, '').replace(/^52(?=\d{10}$)/, '');
const email = value => norm(value);
const freeze = value => Object.freeze(value);

export function parseCsv(text, { delimiter = null } = {}) {
  const source = String(text || '').replace(/^\uFEFF/, '');
  const first = source.split(/\r?\n/, 1)[0] || '';
  delimiter ||= (first.match(/;/g)?.length || 0) > (first.match(/,/g)?.length || 0) ? ';' : ',';
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === '"' && quoted && source[i + 1] === '"') { cell += '"'; i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === delimiter && !quoted) { row.push(cell); cell = ''; continue; }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      row.push(cell); if (row.some(value => String(value).trim())) rows.push(row); row = []; cell = ''; continue;
    }
    cell += char;
  }
  row.push(cell); if (row.some(value => String(value).trim())) rows.push(row);
  if (quoted) throw Object.assign(new Error('CSV_UNCLOSED_QUOTE'), { code: 'CSV_UNCLOSED_QUOTE' });
  return freeze(rows.map(rowValue => freeze([...rowValue])));
}

export function workbookToRows(workbook, { sheetName = null } = {}) {
  if (!workbook || !Array.isArray(workbook.sheetNames) || typeof workbook.readSheet !== 'function') {
    throw Object.assign(new TypeError('SAFE_WORKBOOK_DECODER_REQUIRED'), { code: 'SAFE_WORKBOOK_DECODER_REQUIRED' });
  }
  const selected = sheetName || (workbook.sheetNames.includes('Captura') ? 'Captura' : workbook.sheetNames[0]);
  const rows = workbook.readSheet(selected);
  if (!Array.isArray(rows)) throw Object.assign(new TypeError('WORKBOOK_ROWS_REQUIRED'), { code: 'WORKBOOK_ROWS_REQUIRED' });
  return freeze({ selectedSheet: selected, sheetNames: freeze([...workbook.sheetNames]), rows: freeze(rows.map(row => freeze([...row]))) });
}

function headerIndex(headers, aliases) { return headers.findIndex(header => aliases.includes(norm(header))); }
export function mapRows(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return freeze({ headers: freeze([]), contacts: freeze([]), invalidRows: freeze([]) });
  const headers = rows[0].map(value => String(value || '').trim());
  const indexes = Object.fromEntries(Object.entries(BASIC_ALIASES).map(([key, aliases]) => [key, headerIndex(headers, aliases)]));
  const basicIndexes = new Set(Object.values(indexes).filter(index => index >= 0));
  const contacts = []; const invalidRows = [];
  rows.slice(1).forEach((values, offset) => {
    const value = key => indexes[key] >= 0 ? String(values[indexes[key]] || '').trim() : '';
    const displayName = value('displayName') || [value('firstName'), value('lastName')].filter(Boolean).join(' ');
    const normalizedPhone = phone(value('phone')); const normalizedEmail = email(value('email'));
    if (!displayName && !normalizedPhone && !normalizedEmail) { invalidRows.push(offset + 2); return; }
    const context = {};
    headers.forEach((header, index) => { const item = String(values[index] || '').trim(); if (item && !basicIndexes.has(index)) context[header || `Columna ${index + 1}`] = item; });
    contacts.push(freeze({ sourceRow: offset + 2, displayName, firstName: value('firstName'), lastName: value('lastName'), phone: normalizedPhone, email: normalizedEmail, company: value('company'), externalId: value('externalId'), context: freeze(context) }));
  });
  return freeze({ headers: freeze(headers), contacts: freeze(contacts), invalidRows: freeze(invalidRows) });
}

export function detectPlan200({ fileName = '', sheetNames = [], headers = [] } = {}) {
  const normalizedHeaders = headers.map(norm);
  const characteristic = ['nombre','telefono','ocupacion','estado civil','tiempo de conocerla','potencial de referidos'];
  let score = /plan\s*200|proyecto\s*200|p200/i.test(fileName) ? 1 : 0;
  if (sheetNames.some(name => norm(name) === 'captura')) score += 2;
  score += characteristic.filter(header => normalizedHeaders.some(value => value.includes(header))).length;
  return freeze({ detected: score >= 4, score, template: score >= 4 ? 'PLAN_200' : 'GENERIC' });
}

export function reconcileDuplicates(contacts, existing = []) {
  const byPhone = new Map(existing.filter(item => phone(item.phone)).map(item => [phone(item.phone), item]));
  const byEmail = new Map(existing.filter(item => email(item.email)).map(item => [email(item.email), item]));
  const byExternal = new Map(existing.filter(item => item.externalId).map(item => [String(item.externalId), item]));
  return freeze(contacts.map(contact => {
    const match = (contact.phone && byPhone.get(contact.phone)) || (contact.email && byEmail.get(contact.email)) || (contact.externalId && byExternal.get(contact.externalId)) || null;
    return freeze({ contact, classification: match ? 'STRONG_MATCH' : 'NEW', existingPerson: match, overwriteExistingFields: false, completeEmptyBasicFields: Boolean(match) });
  }));
}

export function createBulkImportEngine({ booksRuntime, personAuthority, batchRepository, contextSink = null, pipelineAuthority = null, clock = () => new Date().toISOString() } = {}) {
  if (!booksRuntime || !personAuthority || !batchRepository) throw Object.assign(new TypeError('IMPORT_AUTHORITIES_REQUIRED'), { code: 'IMPORT_AUTHORITIES_REQUIRED' });
  async function importPrepared({ ownerId, fileName, fileType, prepared, destinationBookId = null, detectedTemplate = 'GENERIC' }) {
    const batch = await batchRepository.start({ ownerId, fileName, fileType, detectedTemplate, totalRows: prepared.length, startedAt: clock() });
    const project = detectedTemplate === 'PLAN_200' ? await booksRuntime.resolveProject200Book({ ownerId }) : null;
    const bookId = project?.book?.bookId || destinationBookId;
    if (!bookId) throw Object.assign(new TypeError('DESTINATION_BOOK_REQUIRED'), { code: 'DESTINATION_BOOK_REQUIRED' });
    const personIds = []; let createdPeople = 0; let existingPeople = 0;
    for (const decision of prepared) {
      const result = await personAuthority.reconcileImportedContact({ ownerId, contact: decision.contact, existingPerson: decision.existingPerson, overwriteExistingFields: false });
      personIds.push(result.personId); result.created ? createdPeople += 1 : existingPeople += 1;
      if (Object.keys(decision.contact.context || {}).length) await contextSink?.append?.({ type: 'CONTACT_CONTEXT_IMPORTED', ownerId, personId: result.personId, importBatchId: batch.importBatchId, sourceRow: decision.contact.sourceRow, source: detectedTemplate, context: decision.contact.context });
    }
    await booksRuntime.addPeopleToBook({ ownerId, bookId, personIds, source: detectedTemplate, importBatchId: batch.importBatchId });
    const completed = await batchRepository.complete({ importBatchId: batch.importBatchId, processedRows: prepared.length, createdPeople, existingPeople, destinationBookId: bookId, completedAt: clock(), status: 'COMPLETED' });
    return freeze({ batch: completed, destinationBookId: bookId, autoOpenBookId: detectedTemplate === 'PLAN_200' ? bookId : null });
  }
  async function activateInPipeline({ ownerId, personIds, originBookId }) {
    if (!pipelineAuthority?.activatePeople) return freeze({ ok: false, reason: 'PIPELINE_AUTHORITY_NOT_REGISTERED' });
    return pipelineAuthority.activatePeople({ ownerId, personIds, originBookId, preserveBookMembership: true });
  }
  return freeze({ importPrepared, activateInPipeline, diagnostics: () => freeze({ macroExecution: false, formulaExecution: false, directDatabaseWrite: false, personDuplication: false }) });
}
