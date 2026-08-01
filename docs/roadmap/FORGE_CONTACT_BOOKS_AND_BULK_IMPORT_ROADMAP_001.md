# ForgeOS — Contact Books and Bulk Import Roadmap 001

```text
SYSTEM=FORGE_CONTACT_BOOKS_AND_BULK_IMPORT
MODULE=CARTERA
ENTRYPOINT=PIPELINE/CARTERA
STATUS=PLANNED
IMPLEMENTATION=NOT_STARTED
NEXT=STAGE_0_PRODUCT_CONTRACT_LOCK
```

## 1. Purpose

Create the missing pre-Pipeline layer that converts contact files into an organized, usable and traceable portfolio.

The advisor must be able to:

1. Create books for organizing contacts.
2. Import contacts in bulk from CSV or XLSX.
3. Upload the Seguros Monterrey Plan 200 workbook without needing a dedicated UI button.
4. Store only basic contact data as structured fields.
5. Preserve every additional imported value as context in the contact timeline/log.
6. Order people by name or entry date.
7. See newest entries first by default.
8. Add, move or remove people from books without duplicating the master contact.
9. Activate people from a book into Pipeline without creating a second person record.

## 2. Locked product decisions

```text
DEFAULT_SORT=CREATED_AT_DESC
PERMANENT_ACTIONS=BULK_IMPORT,CREATE_BOOK
P200_DESTINATION=PROYECTO_200
P200_AUTO_CREATE=YES
P200_AUTO_OPEN=YES
EXTRA_COLUMNS=CONTEXT_LOG
CONTACT_DUPLICATION=NOT_ALLOWED
BOOK_MEMBERSHIP=MANY_TO_MANY
```

### 2.1 Minimal capture

The structured contact record must remain small and operational.

Initial structured fields:

- First name and last name, according to the current person model.
- Phone / WhatsApp.
- Email, when available.
- Company or occupation only when already supported by the current model.
- Entry date.
- Creation/import source.
- Basic record status.

The Plan 200 workbook must not expand the person schema with permanent fields for marital status, relationship proximity, estimated income, contact frequency, referral potential or similar classifications.

Those values belong in imported context.

### 2.2 One person, multiple books

A person exists once in Cartera and can belong to multiple books through memberships.

```text
PERSON
  └── BOOK_MEMBERSHIP
        └── BOOK
```

Adding a person to another book creates a membership, not another contact.

### 2.3 Clean UI

The only permanent actions introduced by this scope are:

```text
[ Carga masiva ]   [ + Nuevo libro ]
```

There will be no separate permanent buttons for Plan 200, CSV, Excel, moving contacts, archiving or Pipeline activation.

Administrative actions appear only inside the import flow or when one or more contacts are selected.

## 3. MVP scope

### Included

- Create, rename and archive books.
- View book members.
- Import CSV.
- Import XLSX.
- Recognize the Plan 200 workbook by structure.
- Create or reuse the `Proyecto 200` book automatically.
- Open `Proyecto 200` automatically after a successful Plan 200 import.
- Choose an existing destination book for generic imports.
- Create a new book from inside a generic import.
- Basic duplicate detection.
- Store extra columns as timeline/log context.
- Import batch traceability.
- Sort by name, ascending or descending.
- Sort by entry date, ascending or descending.
- Use entry date descending by default.
- Multi-select contacts.
- Add to another book.
- Move between books.
- Remove from the current book.
- Activate selected people in Pipeline.

### Outside the MVP

- Automatic prospect ranking.
- AI-generated `Mis Mejores 30`.
- Plan 200 charts or market composition analytics.
- Direct Google Contacts synchronization.
- Direct phone contact synchronization.
- Dynamic rule-based books.
- Automated campaigns by book.
- Nash recommendations generated from book membership.
- Advanced bulk editing of imported context.

## 4. Domain model

### 4.1 Book

```text
book_id
owner_id
name
normalized_name
book_type
status
created_at
updated_at
archived_at
```

Initial book types:

```text
CUSTOM
PROJECT_200
SYSTEM
```

### 4.2 Book membership

```text
membership_id
book_id
person_id
joined_at
source
import_batch_id
created_by
```

Constraints:

- A person cannot have two active memberships in the same book.
- Removing a membership does not delete the person.
- Archiving a book does not archive its people.
- `Proyecto 200` creation is idempotent.
- Book membership does not automatically change Pipeline status.

### 4.3 Import batch

```text
import_batch_id
file_name
file_type
detected_template
destination_book_id
total_rows
processed_rows
created_people
updated_people
existing_people
invalid_rows
duplicate_rows
started_at
completed_at
status
```

## 5. Implementation stages

## Stage 0 — Product contract lock

Freeze behavior before repository, database or UI implementation.

Deliverables:

- Contact basic-field contract.
- Book and membership contract.
- Bulk-import contract.
- Plan 200 recognition contract.
- Duplicate reconciliation rules.
- Extra-column-to-context rules.
- Sorting rules.
- Permanent versus contextual UI actions.

Exit gate:

```text
PRODUCT_CONTRACT=LOCKED
UI_SCOPE=LOCKED
DATA_SCOPE=LOCKED
```

## Stage 1 — Book persistence

Create book and membership persistence without changing person ownership.

Requirements:

- Database migrations.
- Tenant/owner RLS.
- Unique active membership per person and book.
- Idempotent system book resolution.
- Archive and restore behavior.

Exit gate:

```text
BOOK_SCHEMA=READY
BOOK_MEMBERSHIP_SCHEMA=READY
RLS=PASS
MIGRATIONS=PASS
```

## Stage 2 — Book domain service

Required commands:

```text
CREATE_BOOK
RENAME_BOOK
ARCHIVE_BOOK
RESTORE_BOOK
ADD_PERSON_TO_BOOK
ADD_PEOPLE_TO_BOOK
MOVE_PERSON_BETWEEN_BOOKS
MOVE_PEOPLE_BETWEEN_BOOKS
REMOVE_PERSON_FROM_BOOK
REMOVE_PEOPLE_FROM_BOOK
LIST_BOOKS
LIST_BOOK_MEMBERS
```

Move must be atomic:

1. Add membership to the destination.
2. Confirm destination membership.
3. Remove membership from the origin.
4. Preserve the person.
5. Record the operation in activity/timeline evidence.

Exit gate:

```text
BOOK_COMMANDS=PASS
MEMBERSHIP_IDEMPOTENCY=PASS
MOVE_ATOMICITY=PASS
AUDIT_EVENTS=PASS
```

## Stage 3 — Generic bulk-import engine

Single import flow:

```text
SELECT_FILE
→ INSPECT
→ DETECT_FORMAT
→ READ_COLUMNS
→ MAP_BASIC_DATA
→ PREVIEW
→ DETECT_DUPLICATES
→ CONFIRM
→ IMPORT
→ RESULT
```

Initial boundaries:

- UTF-8 CSV.
- XLSX without macro execution.
- Controlled rejection of damaged files.
- Configurable file-size limit.
- Batch processing that does not freeze the UI.
- No formula or macro execution.

Exit gate:

```text
CSV_PARSER=PASS
XLSX_PARSER=PASS
IMPORT_PREVIEW=PASS
BATCH_PERSISTENCE=PASS
ERROR_HANDLING=PASS
```

## Stage 4 — Plan 200 recognition

Recognition must use a structural signature, not only the file name.

Signals may include:

- Approximate file name.
- Presence of a `Captura` sheet.
- Characteristic column headings.
- Expected column distribution.
- Known workbook layout.

When recognized:

1. Resolve an active `Proyecto 200` book.
2. Create it as `PROJECT_200` when absent.
3. Read valid rows.
4. Create or reconcile people.
5. Add memberships to `Proyecto 200`.
6. Convert non-basic columns into imported context.
7. Record Plan 200 as the import source.
8. Complete the batch.
9. Open `Proyecto 200` automatically.
10. Display newest entries first.

Re-importing the same file must not duplicate people or memberships.

Exit gate:

```text
P200_DETECTION=PASS
P200_BOOK_AUTO_CREATE=PASS
P200_MEMBERSHIP_IMPORT=PASS
P200_CONTEXT_PROJECTION=PASS
P200_AUTO_OPEN=PASS
P200_REIMPORT_IDEMPOTENCY=PASS
```

## Stage 5 — Imported context projection

Each imported row can generate an event such as:

```text
EVENT_TYPE=CONTACT_CONTEXT_IMPORTED
SOURCE=PLAN_200
IMPORT_BATCH_ID=<id>
SOURCE_ROW=<row>
```

Human-readable example:

```text
Contexto importado desde Plan 200.

Fuente del contacto: Antiguos empleos.
Edad estimada: 36 a 50 años.
Ocupación reportada: Vendedora.
Estado civil reportado: Viuda con hijos.
Tiempo de conocerla: Más de cinco años.
Tipo de relación: Amiga cercana.
Frecuencia de convivencia: Tres a cinco veces durante el último año.
Facilidad de acercamiento: Fácil.
Potencial de referidos: Excelente.
Ingreso estimado: $11,600 a $34,999.
```

The readable entry must coexist with preserved structured source evidence for audit, reprocessing and future intelligence, without exposing those values as permanent editable person fields.

Exit gate:

```text
CONTEXT_EVENT_CREATION=PASS
RAW_SOURCE_PRESERVATION=PASS
TIMELINE_PROJECTION=PASS
NO_CONTACT_SCHEMA_POLLUTION=PASS
```

## Stage 6 — Books UI

Main surface:

```text
CARTERA

[ Carga masiva ]   [ + Nuevo libro ]

Todos
Proyecto 200
Mis Mejores 30
Clientes
Referidos
```

Creating a book requires only its name in the MVP.

Book detail:

```text
PROYECTO 200

200 personas

[ Buscar ]   [ Filtros ]   [ ⋮ ]
```

The exact presentation can use the current Material 3 list, cards or selector patterns, but it must preserve the two-action limit and mobile safe area above the floating nav pill.

Exit gate:

```text
BOOK_LIST_UI=PASS
CREATE_BOOK_UI=PASS
BOOK_DETAIL_UI=PASS
MATERIAL3_CONSISTENCY=PASS
MOBILE_SAFE_AREA=PASS
```

## Stage 7 — Filters and sorting

Default order everywhere:

```text
ORDER_BY=CREATED_AT
DIRECTION=DESC
```

Newest entries appear first in:

- All contacts.
- `Proyecto 200`.
- Every custom book.
- Post-import results.

The contextual menu contains only:

```text
Ordenar por

Nombre             ↑ ↓
Fecha de ingreso   ↑ ↓
```

Meaning:

- Name `↑`: A–Z.
- Name `↓`: Z–A.
- Entry date `↑`: oldest first.
- Entry date `↓`: newest first.

Do not add visible labels such as “ascendente”, “descendente”, “más reciente” or “más antiguo”.

Exit gate:

```text
DEFAULT_NEWEST_FIRST=PASS
NAME_ASC_DESC=PASS
DATE_ASC_DESC=PASS
SORT_MENU_UI=PASS
FILTER_COMPATIBILITY=PASS
```

## Stage 8 — Multi-select and contextual actions

Normal state shows no permanent administration toolbar.

Selection state:

```text
3 seleccionados

[ Agregar a libro ]   [ Mover ]   [ ⋮ ]
```

Actions:

- Add to book: preserve current memberships and add new ones.
- Move: add to destination and remove from current book.
- Remove from this book: remove only the membership.
- Activate in Pipeline: create or reuse the commercial process without duplicating the person.
- Archive person: secondary confirmed action.

Exit gate:

```text
MULTI_SELECT=PASS
ADD_TO_BOOK=PASS
MOVE_TO_BOOK=PASS
REMOVE_FROM_BOOK=PASS
PIPELINE_ACTIVATION=PASS
NO_PERMANENT_ACTION_CLUTTER=PASS
```

## Stage 9 — Complete import UI flow

Generic file:

```text
Carga masiva
→ Seleccionar archivo
→ Vista previa
→ Elegir libro existente o crear libro
→ Revisar duplicados
→ Confirmar
→ Resultado
→ Abrir libro destino
```

Recognized Plan 200:

```text
Carga masiva
→ Seleccionar archivo
→ Plan 200 detectado
→ Vista previa
→ Confirmar
→ Crear o actualizar Proyecto 200
→ Importar
→ Abrir Proyecto 200
```

A recognized Plan 200 must not ask for a destination book.

Exit gate:

```text
GENERIC_IMPORT_FLOW=PASS
P200_IMPORT_FLOW=PASS
IMPORT_RESULT_UI=PASS
DESTINATION_AUTO_NAVIGATION=PASS
```

## Stage 10 — Duplicate reconciliation

Strong matches:

- Normalized phone.
- Normalized email.
- Previously imported external identifier.

Probable matches:

- Similar complete name.
- Matching name and company.
- Matching name and incomplete phone.

Default behavior for strong matches:

```text
REUSE_EXISTING_PERSON=YES
CREATE_MEMBERSHIP=IF_MISSING
COMPLETE_EMPTY_BASIC_FIELDS=YES
OVERWRITE_EXISTING_FIELDS=NO
APPEND_CONTEXT=IF_NEW
```

Uncertain duplicates can enter a review queue without blocking the entire batch.

Exit gate:

```text
PHONE_DEDUPLICATION=PASS
EMAIL_DEDUPLICATION=PASS
MEMBERSHIP_DEDUPLICATION=PASS
NO_SILENT_OVERWRITE=PASS
REVIEW_QUEUE=PASS
```

## Stage 11 — Pipeline, Activity and FES integration

Pipeline activation must:

- Reuse the person record.
- Create or recover the commercial process.
- Preserve book origin.
- Record the action.
- Leave the person in the originating book.

Required event candidates:

```text
CONTACT_IMPORTED
CONTACT_ADDED_TO_BOOK
CONTACT_MOVED_BETWEEN_BOOKS
CONTACT_REMOVED_FROM_BOOK
CONTACT_CONTEXT_IMPORTED
CONTACT_ACTIVATED_IN_PIPELINE
IMPORT_BATCH_COMPLETED
```

The event model must support future measurement of imported contacts, Pipeline activation, appointments, applications and policies by originating book, without adding those reports to this MVP.

Exit gate:

```text
PIPELINE_LINKAGE=PASS
ACTIVITY_PROJECTION=PASS
TIMELINE_PROJECTION=PASS
FES_EVIDENCE=PASS
```

## Stage 12 — Quality and visual closure

Functional tests:

- Create, rename and archive a book.
- Import CSV and XLSX.
- Detect Plan 200.
- Create `Proyecto 200` automatically.
- Re-import the same Plan 200.
- Add, move and remove memberships.
- Sort by name and date.
- Verify newest-first default.
- Activate people in Pipeline.

Data cases:

- Missing phone.
- Missing email.
- Repeated names.
- Different phone formats.
- Empty rows.
- Unknown columns.
- Missing headings.
- Multiple Excel sheets.
- Interrupted import.
- Retried import.

Visual acceptance:

- Mobile.
- Tablet.
- Desktop / DeX.
- Empty states.
- Large books.
- Multi-selection.
- Sorting menu.
- Book creation.
- Import flow.
- Safe bottom area above the floating nav pill.

Final gate:

```text
BUILD=PASS
UNIT_TESTS=PASS
INTEGRATION_TESTS=PASS
E2E_TESTS=PASS
MOBILE_VISUAL_ACCEPTANCE=PASS
TABLET_VISUAL_ACCEPTANCE=PASS
DEX_VISUAL_ACCEPTANCE=PASS
NO_REGRESSION_PIPELINE=PASS
```

## 6. Productive delivery blocks

### Block A — Functional books

Includes persistence, book commands, memberships, add/move/remove and default newest-first sorting.

Result:

> ForgeOS can organize existing people in books without bulk import.

### Block B — Generic bulk import

Includes CSV, XLSX, basic-field mapping, destination selection, book creation during import, duplicate reconciliation and import batches.

Result:

> ForgeOS can convert generic contact files into usable books.

### Block C — Proyecto 200

Includes automatic recognition, idempotent `Proyecto 200` creation, additional-column context, automatic navigation and import evidence.

Result:

> Uploading the Plan 200 workbook creates or updates and opens `Proyecto 200` without manual configuration.

### Block D — Productive integration

Includes multi-select, Pipeline activation, Activity/Timeline projection, FES evidence and final Material 3 closure.

Result:

> Books become a governed source of commercial activity rather than isolated agendas.

## 7. Final acceptance journey

The scope is complete when this exact journey works:

```text
1. The user enters Cartera.
2. Only Carga masiva and Nuevo libro appear as permanent actions.
3. The user selects Carga masiva.
4. The user selects 4.-Plan 200.xlsx.
5. ForgeOS recognizes the workbook structure.
6. ForgeOS shows a preview.
7. The user confirms.
8. ForgeOS creates or reuses Proyecto 200.
9. ForgeOS creates or reconciles people without duplication.
10. Only basic values are stored as person fields.
11. Every other workbook value becomes imported timeline context.
12. The batch and its evidence are recorded.
13. Proyecto 200 opens automatically.
14. Newly entered people appear first.
15. The user can order by name or entry date using arrows.
16. Contextual actions appear only after selecting people.
17. The user can add, move or activate them in Pipeline.
18. The screen becomes clean again when selection ends.
```

## 8. Current status

```text
FORGE_CONTACT_BOOKS_AND_BULK_IMPORT=PLANNED
PRODUCT_SCOPE=DEFINED
P200_SOURCE_SAMPLE=REVIEWED_NOT_COMMITTED
DATA_MODEL=NOT_STARTED
IMPORT_ENGINE=NOT_STARTED
UI_IMPLEMENTATION=NOT_STARTED
PIPELINE_INTEGRATION=NOT_STARTED
FINAL_ACCEPTANCE=NO
NEXT=STAGE_0_PRODUCT_CONTRACT_LOCK
```
