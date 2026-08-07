# Forge Aura Pipeline UX Reconciliation Report 001

```text
EXECUTION_ID=FORGE_AURA_PIPELINE_UX_DIRECTIVE_RECONCILIATION_001
SOURCE_SHA=c011f08622b957dbb9fb1225a7d99e550d36c761
INHERITED_AURA_BASE_SHA=cbf493409fc9ff7787ec8da60a436cbed42dd12b
DELIVERY_BRANCH=codex/forge-aura-pipeline-ux-reconciliation-001
DRAFT_PR=278
RECONCILIATION_BASE_SHA=cbf493409fc9ff7787ec8da60a436cbed42dd12b
```

## 1. Autoridades leídas

```text
UX_DIRECTIVE_SOURCE_BRANCH=governance/forge-aura-light-2026-authority
UX_DIRECTIVE_BRANCH_SHA=e695dc61fd9ec37969ab1339e1d510299049ecd0
UX_DIRECTIVE_READ=YES
UX_DIRECTIVE_SHA=0b7afdda7bdf5e3f01a735cb8a389b81ff101279
CANONICAL_DESIGN_SYSTEM_SHA=0cbc31e02be9b423437142f59c561275754340d1
CANONICAL_AUTHORITY_SHA=88becacc83d3a315eb038f86f0893c0b142f14f1
```

Se leyeron desde la rama de autoridad, sin fusionarla ni copiarla silenciosamente al runtime:

- `docs/05-foundation/design-system/README.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_AUTHORITY.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_UX_BEHAVIOR_DIRECTIVE_LOCKED.md`

La interpretación aplicada es conjunta: Aura Light gobierna la jerarquía visual y la directiva bloqueada gobierna comportamiento, decisiones, formularios, feedback, accesibilidad y responsive. Ninguna de las dos autoriza nuevas fuentes de verdad, backend paralelo, decisiones automáticas ni debilitamiento de sesión, RLS o aislamiento por asesor.

## 2. Baseline heredado

El SHA `cbf493409fc9ff7787ec8da60a436cbed42dd12b` corresponde al runtime Aura/Pipeline heredado de PR #274. No es un resultado ni un `FINAL_SHA` de esta reconciliación.

### Clasificación del delta heredado contra `main`

| Archivo heredado | Clasificación | Justificación |
| --- | --- | --- |
| `.github/workflows/aura-pages-dispatch.yml` | `OUT_OF_SCOPE_INHERITED` | Publicación heredada; no se modificó en esta fase. |
| `docs/00-governance/FORGE_AURA_CLEAN_RUNTIME_PRODUCTIVE_PIPELINE_EXECUTION_AUTHORITY.md` | `OUT_OF_SCOPE_INHERITED` | Autoridad heredada; no se alteró. |
| `docs/static-preview/forge-aura/app-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante heredada no requerida por el delta nuevo. |
| `docs/static-preview/forge-aura/app.js` | `RUNTIME_INDISPENSABLE` | Monta el módulo Pipeline autenticado; no se modificó después del baseline. |
| `docs/static-preview/forge-aura/aura-auth-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante Auth heredada, fuera del trabajo nuevo. |
| `docs/static-preview/forge-aura/aura-auth.css` | `RUNTIME_INDISPENSABLE` | Estilo de acceso del runtime heredado; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-auth.js` | `RUNTIME_INDISPENSABLE` | Provee sesión al montaje heredado; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-bootstrap-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante heredada no tocada. |
| `docs/static-preview/forge-aura/aura-bootstrap.js` | `RUNTIME_INDISPENSABLE` | Carga el runtime existente; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-router-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante heredada no tocada. |
| `docs/static-preview/forge-aura/aura-router.js` | `RUNTIME_INDISPENSABLE` | Enruta al Pipeline existente; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-shell.css` | `RUNTIME_INDISPENSABLE` | Contenedor Aura existente; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-shell.js` | `RUNTIME_INDISPENSABLE` | Monta la superficie y scrub de shell heredados; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-tokens.css` | `RUNTIME_INDISPENSABLE` | Tokens compartidos Aura ya heredados; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/auth-v4-build.txt` | `REMOVE_FROM_PR_IF_POSSIBLE` | Marcador heredado sin relación con el delta nuevo. |
| `docs/static-preview/forge-aura/auth-v4.html` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante Login heredada; no se tocó. |
| `docs/static-preview/forge-aura/env.js` | `RUNTIME_INDISPENSABLE` | Configuración pública fail-closed heredada; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/index.html` | `RUNTIME_INDISPENSABLE` | Entrada del runtime heredado; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/oauth-callback-v4.html` | `OUT_OF_SCOPE_INHERITED` | Flujo OAuth heredado; no se modificó. |
| `docs/static-preview/forge-aura/oauth-callback-v4.js` | `OUT_OF_SCOPE_INHERITED` | Flujo OAuth heredado; no se modificó. |
| `docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v1.js` | `PIPELINE_DIRECT` | Adaptador directo del Pipeline Pages. |
| `docs/static-preview/forge-aura/pipeline/pipeline-adapter.js` | `PIPELINE_DIRECT` | Adaptador directo a autoridades productivas. |
| `docs/static-preview/forge-aura/pipeline/pipeline-calendar.js` | `PIPELINE_DIRECT` | Borrador externo de seguimiento; conservado. |
| `docs/static-preview/forge-aura/pipeline/pipeline-core.js` | `PIPELINE_DIRECT` | Estados, etapas y modelo de presentación. |
| `docs/static-preview/forge-aura/pipeline/pipeline-module.js` | `PIPELINE_DIRECT` | Superficie e interacción principal; reescrita. |
| `docs/static-preview/forge-aura/pipeline/pipeline.css` | `PIPELINE_DIRECT` | Presentación Aura del módulo; reescrita. |
| `scripts/preview-forge-aura-pipeline.sh` | `OUT_OF_SCOPE_INHERITED` | Herramienta heredada fuera de los commits nuevos. |

No se intentó limpiar archivos heredados fuera del alcance porque hacerlo habría creado mutaciones nuevas ajenas al guard definido desde `RECONCILIATION_BASE_SHA`. La recomendación `REMOVE_FROM_PR_IF_POSSIBLE` queda registrada para una reconciliación separada del baseline, no para esta fase.

## 3. Auditoría de brechas y solución autorizada

| Requisito | Estado heredado | Brecha | Solución implementada | Archivos | Prueba |
| --- | --- | --- | --- | --- | --- |
| Acción primaria | No existía | No había entrada productiva inequívoca | Una sola acción `Agregar prospecto`, conectada a `createProspect` y con fail-closed si falta autoridad | `pipeline-module.js`, adaptadores | `PIPELINE_PRIMARY_ACTION_TEST` |
| Encabezado operativo | Título “Prospectos” y conteo básico | Sin estado contextual ni actualización | Título Pipeline, resumen de atención, última actualización y refresh | `pipeline-module.js` | Browser hierarchy |
| Capa de atención | Inexistente | Directorio aparecía antes de prioridades | Máximo tres señales verificadas antes del directorio | `pipeline-priority.js`, `pipeline-module.js` | `PIPELINE_ATTENTION_LAYER_TEST` |
| Prioridad explicable | Inexistente | Riesgo de scoring opaco | Precedencia determinista por hecho: vencido, hoy, sin compromiso, actividad, incompleto; fuente y evidencia desplegables | `pipeline-priority.js` | `PIPELINE_EXPLAINABLE_PRIORITY_TEST` |
| Siguiente mejor acción | Solo iconos genéricos | Sin razón ni continuidad | Recomendación por registro con razón y acción humana | `pipeline-priority.js`, `pipeline-module.js` | `PIPELINE_NEXT_BEST_ACTION_TEST` |
| Vacío total | Solo “no hay prospectos” | No orientaba ni permitía comenzar | Beneficio, CTA productivo o alternativa honesta cuando no existe autoridad | `pipeline-module.js` | `PIPELINE_EMPTY_STATE_CTA_TEST` |
| Vacío filtrado | Botón básico | No explicaba filtros activos ni integridad | Muestra filtros activos, confirma que los datos siguen intactos y permite limpiar | `pipeline-module.js` | `PIPELINE_FILTERED_EMPTY_TEST` |
| Smart defaults | Duración 45, fecha y hora vacías | No había regla explicada | Usa compromiso futuro existente; si no existe propone siguiente día hábil, deja hora vacía y explica por qué | `pipeline-priority.js`, `pipeline-module.js` | `PIPELINE_SMART_DEFAULTS_TEST` |
| Edición resiliente | Valores actuales y error general | Sin validación junto al campo ni explicación de integridad | Validación inline, doble envío bloqueado, entradas preservadas, copy de qué quedó intacto | `pipeline-module.js` | Contrato + browser |
| Feedback humano | Principalmente `aria-live` oculto | No decía qué cambió ni siguiente paso | Mensajes visibles y accesibles después de crear, editar, cambiar etapa, archivar y abrir borradores | `pipeline-module.js` | `PIPELINE_ARIA_LIVE_TEST` |
| Progressive disclosure | Parcial | Fuentes y evidencia no estaban ligadas a prioridad | `details/summary` por señal y Timeline | `pipeline-module.js` | Browser hierarchy |
| Paridad tarjeta/lista | Semántica divergente | Lista usaba tabla incompleta | Misma clave semántica, recomendación y acciones; encabezados `columnheader` completos | `pipeline-module.js` | `PIPELINE_CARD_LIST_PARITY_TEST` |
| Teclado y foco | Parcial | Faltaba cierre completo de contratos | Trap de foco, Escape, retorno de foco, menú con flechas/Home/End | `pipeline-module.js` | `PIPELINE_KEYBOARD_TEST`, `PIPELINE_FOCUS_TEST` |
| Responsive | Tarjetas y lista adaptables | Sin validación de atención y zoom | Jerarquía única adaptable, bottom sheet móvil, min-width 0 y safe area | `pipeline.css` | Playwright 390/834/1440/200% |
| Reduced motion | Token global | No había aceptación específica Pipeline | Transiciones locales anuladas bajo preferencia | `pipeline.css` | Playwright reduced motion |
| Sesión y respuestas tardías | Baseline tenía revisión de montaje | Scrub local incompleto | `destroy()` vacía registros, adaptador, feedback, filtros y aumenta revisión | `pipeline-module.js` | `PIPELINE_SESSION_SCRUB_TEST`, `PIPELINE_LATE_RESULT_REJECTION_TEST` |
| Aislamiento | RLS y sesión existentes | No debía sustituirse | Adaptadores mantienen `auth.getUser`, RLS y RPC productivo; cero filtros client-side como autoridad | adaptadores | `PIPELINE_NO_CROSS_ADVISOR_TEST` |
| Acciones automáticas | No autorizadas | Copy podía ser ambiguo | Mensajes explícitos: WhatsApp y Calendar son aperturas externas, nunca envío o cita confirmada | `pipeline-module.js` | `PIPELINE_NO_AUTOMATIC_ACTION_TEST` |
| Datos ficticios | Baseline fail-closed | Debía conservarse | Desconocido no se convierte en cero; no se agregan demo records | módulo y prioridad | `PIPELINE_NO_FAKE_DATA_TEST` |

## 4. Decisiones de arquitectura

1. **Reescritura de presentación ejecutada.** `pipeline-module.js` era monolítico y no permitía implementar de forma aislable prioridad, recomendación, estados, continuidad y pruebas. Se conserva como orquestador, pero la composición de hechos se extrajo a `pipeline-priority.js`.
2. **Sin motor comercial nuevo.** `pipeline-priority.js` no puntúa ni decide: deriva señales deterministas únicamente de fechas, Timeline, compromiso y campos existentes.
3. **Autoridad productiva preservada.** Alta usa `createProspect`; etapa usa el RPC confirmado; edición, archivo y Timeline conservan los servicios existentes y read-after-write.
4. **Hora no inferida.** Cuando no existe compromiso futuro, se propone siguiente día hábil pero se deja la hora vacía.
5. **Timeline desconectado no equivale a inactividad.** Una fuente no disponible no produce señal de “sin actividad”.
6. **Estado local seguro.** Solo se persiste la preferencia `cards/list`; no se guarda información privada en `localStorage`.
7. **Baseline heredado no reescrito fuera de Pipeline.** Auth, router, shell, Home, Activity, Reports, Cartera, Comisiones y Login recibieron cero mutaciones nuevas.

## 5. Archivos de esta reconciliación

### Nuevo

- `docs/static-preview/forge-aura/pipeline/pipeline-priority.js`
- `tests/pipeline-aura-ux-reconciliation.test.mjs`
- `tests/pipeline-scope-guard.test.mjs`
- `tests/pipeline-playwright.config.mjs`
- `tests/e2e/pipeline-aura-ux-reconciliation.spec.mjs`
- `docs/architecture/source-truth/FORGE_AURA_PIPELINE_UX_RECONCILIATION_REPORT_001.md`
- `docs/evidence/FORGE_AURA_PIPELINE_UX_RECONCILIATION_ACCEPTANCE_001.md`
- `.github/workflows/pipeline-aura-ux-reconciliation-001.yml`

### Reescrito o extendido

- `docs/static-preview/forge-aura/pipeline/pipeline-module.js`
- `docs/static-preview/forge-aura/pipeline/pipeline.css`
- `docs/static-preview/forge-aura/pipeline/pipeline-core.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-adapter.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v1.js`

### Compartidos modificados después del baseline

```text
SHARED_FILES_MODIFIED_AFTER_BASELINE=ZERO
```

## 6. Pruebas

Suite contractual local antes del push:

```text
NODE_SYNTAX=PASS
PIPELINE_UNIT_AND_STATIC_CONTRACTS=14/14 PASS
```

Contratos cubiertos:

- acción primaria;
- atención máxima de tres;
- prioridad explicable;
- siguiente mejor acción;
- vacío productivo y filtrado;
- smart defaults;
- paridad tarjeta/lista;
- teclado, foco y `aria-live`;
- scrub y rechazo tardío;
- sesión/RLS y aislamiento;
- cero acciones automáticas;
- cero datos falsos;
- responsive y reduced motion.

La aceptación Chromium se ejecuta en CI para:

```text
MOBILE=390x844
TABLET=834x1194
DESKTOP=1440x900
ZOOM=200_PERCENT
REDUCED_MOTION=ON
KEYBOARD_ONLY=REQUIRED
```

## 7. Límites conocidos

- La señal de enfriamiento se limita a actividad verificada con más de 72 horas y solo cuando Timeline está conectado. No afirma pérdida de interés ni probabilidad comercial.
- El borrador de Calendar depende de que el usuario revise y guarde externamente.
- La evidencia visual final y el `FINAL_SHA` permanecen pendientes hasta que el workflow de esta ejecución termine exitosamente y los artefactos queden ligados al head.

## 8. Estado

```text
PIPELINE_REWRITE_REQUIRED=YES
PIPELINE_REWRITE_EXECUTED=YES
NEW_LOGIN_MUTATIONS=ZERO
NEW_ACTIVITY_MUTATIONS=ZERO
NEW_REPORTS_MUTATIONS=ZERO
NEW_HOME_MUTATIONS=ZERO
NEW_UNRELATED_MUTATIONS=ZERO
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
AUTO_MERGE_ENABLED=NO
FINAL_STATUS=PENDING_CI_AND_EVIDENCE
```
