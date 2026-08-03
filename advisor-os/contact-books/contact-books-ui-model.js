const SORT_OPTIONS = Object.freeze([
  Object.freeze({ id: 'NAME_ASC', label: 'Nombre', direction: '↑' }),
  Object.freeze({ id: 'NAME_DESC', label: 'Nombre', direction: '↓' }),
  Object.freeze({ id: 'CREATED_AT_ASC', label: 'Fecha de ingreso', direction: '↑' }),
  Object.freeze({ id: 'CREATED_AT_DESC', label: 'Fecha de ingreso', direction: '↓' }),
]);

export function createContactBooksUiModel({ books = [], selectedBookId = null, selectedPersonIds = [], importState = null } = {}) {
  const selected = [...new Set(selectedPersonIds.map(String))];
  return Object.freeze({
    permanentActions: Object.freeze([
      Object.freeze({ id: 'BULK_IMPORT', label: 'Carga masiva' }),
      Object.freeze({ id: 'CREATE_BOOK', label: 'Nuevo libro' }),
    ]),
    books: Object.freeze([...books]),
    selectedBookId,
    defaultSort: 'CREATED_AT_DESC',
    sortOptions: SORT_OPTIONS,
    selection: Object.freeze({
      count: selected.length,
      personIds: Object.freeze(selected),
      contextualActions: selected.length ? Object.freeze(['ADD_TO_BOOK','MOVE_TO_BOOK','REMOVE_FROM_BOOK','ACTIVATE_IN_PIPELINE']) : Object.freeze([]),
    }),
    importFlow: importState ? Object.freeze({ ...importState }) : null,
    mobileSafeAreaRequired: true,
    diagnostics: Object.freeze({ permanentActionCount: 2, separatePlan200Button: false, administrationToolbarAlwaysVisible: false }),
  });
}

export function nextImportStep({ step = 'SELECT_FILE', detectedTemplate = 'GENERIC', confirmed = false } = {}) {
  const generic = ['SELECT_FILE','INSPECT','PREVIEW','CHOOSE_DESTINATION','REVIEW_DUPLICATES','CONFIRM','IMPORT','RESULT','OPEN_BOOK'];
  const p200 = ['SELECT_FILE','INSPECT','PLAN_200_DETECTED','PREVIEW','CONFIRM','IMPORT','RESULT','OPEN_PROJECT_200'];
  const flow = detectedTemplate === 'PLAN_200' ? p200 : generic;
  const index = flow.indexOf(step);
  if (index < 0) return Object.freeze({ ok: false, reason: 'IMPORT_STEP_INVALID' });
  if (step === 'CONFIRM' && !confirmed) return Object.freeze({ ok: true, step, waitingForConfirmation: true });
  return Object.freeze({ ok: true, step: flow[Math.min(index + 1, flow.length - 1)], waitingForConfirmation: false });
}
