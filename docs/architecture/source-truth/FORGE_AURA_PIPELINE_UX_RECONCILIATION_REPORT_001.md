# Forge Aura Pipeline UX Reconciliation Report 001

```text
EXECUTION_ID=FORGE_AURA_PIPELINE_UX_DIRECTIVE_RECONCILIATION_001
SOURCE_SHA=c011f08622b957dbb9fb1225a7d99e550d36c761
INHERITED_AURA_BASE_SHA=cbf493409fc9ff7787ec8da60a436cbed42dd12b
DELIVERY_BRANCH=codex/forge-aura-pipeline-ux-reconciliation-001
DRAFT_PR=278
RECONCILIATION_BASE_SHA=cbf493409fc9ff7787ec8da60a436cbed42dd12b
IMPLEMENTATION_ACCEPTANCE_SHA=57b60146a0d274acd67a857ec135887fb986989a
IMPLEMENTATION_ACCEPTANCE_RUN=31145355979
FINAL_SHA=BOUND_IN_PR_AFTER_FINAL_DOCUMENTATION_REVALIDATION
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

Se leyeron, sin fusionar la rama de gobernanza ni copiar sus archivos al runtime:

- `docs/05-foundation/design-system/README.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_AUTHORITY.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_UX_BEHAVIOR_DIRECTIVE_LOCKED.md`

Aura Light gobierna la jerarquía visual; la directiva bloqueada gobierna comportamiento, formularios, feedback, accesibilidad y responsive. Ninguna autoriza fuentes de verdad paralelas, scoring opaco, acciones comerciales automáticas ni debilitamiento de sesión, RLS o aislamiento por asesor.

## 2. Baseline heredado

`cbf493409fc9ff7787ec8da60a436cbed42dd12b` pertenece al runtime Aura/Pipeline heredado de PR #274. No fue producido por esta reconciliación y nunca se usó como `FINAL_SHA`.

### Clasificación de los 27 archivos heredados contra `main`

| Archivo | Clasificación | Justificación |
| --- | --- | --- |
| `.github/workflows/aura-pages-dispatch.yml` | `OUT_OF_SCOPE_INHERITED` | Publicación heredada; cero cambios nuevos. |
| `docs/00-governance/FORGE_AURA_CLEAN_RUNTIME_PRODUCTIVE_PIPELINE_EXECUTION_AUTHORITY.md` | `OUT_OF_SCOPE_INHERITED` | Autoridad heredada; cero cambios nuevos. |
| `docs/static-preview/forge-aura/app-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante heredada no requerida por el delta nuevo. |
| `docs/static-preview/forge-aura/app.js` | `RUNTIME_INDISPENSABLE` | Monta Pipeline autenticado; no se modificó después del baseline. |
| `docs/static-preview/forge-aura/aura-auth-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante Auth heredada; fuera de esta fase. |
| `docs/static-preview/forge-aura/aura-auth.css` | `RUNTIME_INDISPENSABLE` | Estilo de acceso heredado; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-auth.js` | `RUNTIME_INDISPENSABLE` | Provee sesión al montaje; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-bootstrap-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante heredada no tocada. |
| `docs/static-preview/forge-aura/aura-bootstrap.js` | `RUNTIME_INDISPENSABLE` | Carga el runtime existente; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-router-v4.js` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante heredada no tocada. |
| `docs/static-preview/forge-aura/aura-router.js` | `RUNTIME_INDISPENSABLE` | Enruta a Pipeline; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-shell.css` | `RUNTIME_INDISPENSABLE` | Contenedor Aura heredado; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-shell.js` | `RUNTIME_INDISPENSABLE` | Montaje y scrub de shell heredados; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/aura-tokens.css` | `RUNTIME_INDISPENSABLE` | Tokens Aura heredados; cero mutaciones nuevas. |
| `docs/static-preview/forge-aura/auth-v4-build.txt` | `REMOVE_FROM_PR_IF_POSSIBLE` | Marcador heredado sin relación con la fase. |
| `docs/static-preview/forge-aura/auth-v4.html` | `REMOVE_FROM_PR_IF_POSSIBLE` | Variante Login heredada; no se tocó. |
| `docs/static-preview/forge-aura/env.js` | `RUNTIME_INDISPENSABLE` | Configuración pública fail-closed heredada. |
| `docs/static-preview/forge-aura/index.html` | `RUNTIME_INDISPENSABLE` | Entrada del runtime heredado. |
| `docs/static-preview/forge-aura/oauth-callback-v4.html` | `OUT_OF_SCOPE_INHERITED` | OAuth heredado; no se modificó. |
| `docs/static-preview/forge-aura/oauth-callback-v4.js` | `OUT_OF_SCOPE_INHERITED` | OAuth heredado; no se modificó. |
| `docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v1.js` | `PIPELINE_DIRECT` | Adaptador Pages directo de Pipeline. |
| `docs/static-preview/forge-aura/pipeline/pipeline-adapter.js` | `PIPELINE_DIRECT` | Adaptador directo a autoridades productivas. |
| `docs/static-preview/forge-aura/pipeline/pipeline-calendar.js` | `PIPELINE_DIRECT` | Borrador externo de seguimiento. |
| `docs/static-preview/forge-aura/pipeline/pipeline-core.js` | `PIPELINE_DIRECT` | Estados, etapas y modelo de presentación. |
| `docs/static-preview/forge-aura/pipeline/pipeline-module.js` | `PIPELINE_DIRECT` | Superficie e interacción principal. |
| `docs/static-preview/forge-aura/pipeline/pipeline.css` | `PIPELINE_DIRECT` | Presentación Aura del módulo. |
| `scripts/preview-forge-aura-pipeline.sh` | `OUT_OF_SCOPE_INHERITED` | Herramienta heredada fuera de los commits nuevos. |

Los elementos `REMOVE_FROM_PR_IF_POSSIBLE` no se retiraron en esta fase porque hacerlo habría creado mutaciones nuevas fuera del guard autorizado desde `RECONCILIATION_BASE_SHA`. Su limpieza corresponde a una reconciliación separada del baseline.

## 3. Matriz de brechas y solución

| Requisito | Brecha heredada | Solución implementada | Prueba |
| --- | --- | --- | --- |
| Encabezado operativo | Sin resumen ni actualización | Título Pipeline, conteo contextual, atención y refresh | Browser hierarchy |
| Acción primaria | No existía | Una sola acción `Agregar prospecto`, conectada a autoridad productiva y fail-closed | `PIPELINE_PRIMARY_ACTION_TEST` |
| Capa de atención | Inexistente | Máximo tres señales verificadas antes del directorio | `PIPELINE_ATTENTION_LAYER_TEST` |
| Prioridad explicable | Sin razón ni fuente | Precedencia determinista por hecho, evidencia desplegable y acción humana | `PIPELINE_EXPLAINABLE_PRIORITY_TEST` |
| Siguiente mejor acción | Iconos genéricos | Recomendación por registro con razón observable | `PIPELINE_NEXT_BEST_ACTION_TEST` |
| Vacío total | Copy pasivo | Beneficio, CTA productivo o alternativa honesta | `PIPELINE_EMPTY_STATE_CTA_TEST` |
| Vacío filtrado | Recuperación incompleta | Filtros activos, integridad de datos y limpiar filtros | `PIPELINE_FILTERED_EMPTY_TEST` |
| Smart defaults | Sin regla explicada | Compromiso existente o siguiente día hábil; hora vacía si no hay evidencia | `PIPELINE_SMART_DEFAULTS_TEST` |
| Edición resiliente | Error general | Validación inline, bloqueo doble, entradas preservadas y copy de integridad | Contrato + browser |
| Feedback humano | Principalmente oculto | Feedback visible y `aria-live` para crear, editar, etapa, archivo y borrador | `PIPELINE_ARIA_LIVE_TEST` |
| Progressive disclosure | Evidencia dispersa | `details/summary` por prioridad y Timeline | Browser hierarchy |
| Tarjeta/lista | Semántica divergente | Misma clave semántica, recomendación y acciones; encabezados válidos | `PIPELINE_CARD_LIST_PARITY_TEST` |
| Teclado y foco | Contrato incompleto | Trap, Escape, retorno de foco y navegación de menú | `PIPELINE_KEYBOARD_TEST`, `PIPELINE_FOCUS_TEST` |
| Responsive | Sin aceptación completa | Arquitectura única, bottom sheet móvil, safe area y reflow | Playwright 390/834/1440/200% |
| Reduced motion | Sin aceptación específica | Transiciones locales efectivamente anuladas | Playwright reduced motion |
| Sesión y tardíos | Scrub local incompleto | `destroy()` limpia datos y revisión invalida resultados tardíos | Scrub/late-result tests |
| Aislamiento | Debía preservarse | `auth.getUser`, RLS y RPC productivo continúan como autoridad | No-cross-advisor test |
| Acciones automáticas | Copy ambiguo posible | WhatsApp y Calendar se declaran borradores/aperturas externas | No-automatic-action test |
| Datos falsos | Debía preservarse fail-closed | Desconocido no se convierte en cero; cero demo records | No-fake-data test |

## 4. Decisiones de arquitectura

1. `pipeline-module.js` se reescribió como orquestador de presentación e interacción.
2. La composición determinista de hechos se extrajo a `pipeline-priority.js`; no es un motor comercial ni asigna puntuaciones.
3. Alta usa `createProspect`; etapa conserva el RPC confirmado; edición, archivo y Timeline mantienen read-after-write.
4. Una fuente Timeline desconectada no se interpreta como inactividad.
5. Cuando no hay compromiso futuro, se propone el siguiente día hábil, pero no se inventa una hora.
6. Solo se persiste la preferencia `cards/list`; no se guarda información privada en `localStorage`.
7. Auth, Login, Home, Activity, Reports, Cartera y Comisiones recibieron cero mutaciones nuevas.

## 5. Archivos nuevos y reescritos

### Nuevos

- `docs/static-preview/forge-aura/pipeline/pipeline-priority.js`
- `tests/pipeline-aura-ux-reconciliation.test.mjs`
- `tests/pipeline-scope-guard.test.mjs`
- `tests/pipeline-playwright.config.mjs`
- `tests/pipeline-static-server.py`
- `tests/e2e/pipeline-aura-ux-reconciliation.spec.mjs`
- `docs/architecture/source-truth/FORGE_AURA_PIPELINE_UX_RECONCILIATION_REPORT_001.md`
- `docs/evidence/FORGE_AURA_PIPELINE_UX_RECONCILIATION_ACCEPTANCE_001.md`
- `.github/workflows/pipeline-aura-ux-reconciliation-001.yml`

### Reescritos o extendidos

- `docs/static-preview/forge-aura/pipeline/pipeline-module.js`
- `docs/static-preview/forge-aura/pipeline/pipeline.css`
- `docs/static-preview/forge-aura/pipeline/pipeline-core.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-adapter.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v1.js`

```text
SHARED_FILES_MODIFIED_AFTER_BASELINE=ZERO
```

## 6. Pruebas y evidencia

```text
NODE_SYNTAX=PASS
PIPELINE_UNIT_AND_STATIC_CONTRACTS=14/14 PASS
PIPELINE_SCOPE_GUARD=PASS
PLAYWRIGHT_BROWSER_CASES=9/9 PASS
MOBILE_390x844=PASS
TABLET_834x1194=PASS
DESKTOP_1440x900=PASS
ZOOM_200_PERCENT=PASS
REDUCED_MOTION=PASS
KEYBOARD_ONLY=PASS
```

Evidencia ligada al head probado:

```text
WORKFLOW_RUN=31145355979
TESTED_HEAD_SHA=57b60146a0d274acd67a857ec135887fb986989a
ARTIFACT_ID=8981284202
ARTIFACT_NAME=pipeline-aura-ux-reconciliation-001-eceef119a205b2d663f964e25466ac3b202d946b
ARTIFACT_DIGEST=sha256:042a94ec412ccd00938720f4db08f2be660d1444cd889f55c7d6697c5c73ee2b
```

El nombre del artefacto usa el merge test SHA del evento `pull_request`; la metadata del workflow liga la corrida al head de rama `57b60146a0d274acd67a857ec135887fb986989a`.

## 7. Límites conocidos

- La señal de enfriamiento solo indica más de 72 horas sin actividad verificada cuando Timeline está conectado; no afirma pérdida de interés ni probabilidad de cierre.
- Calendar abre un borrador y depende de revisión y guardado externos.
- La documentación final debe ser revalidada en el SHA resultante de este mismo reporte antes de declarar el cierre definitivo.

## 8. Resultado

```text
UX_DIRECTIVE_READ=YES
PIPELINE_REWRITE_REQUIRED=YES
PIPELINE_REWRITE_EXECUTED=YES
PRIMARY_ACTION=PASS
ATTENTION_LAYER=PASS
EXPLAINABLE_PRIORITY=PASS
NEXT_BEST_ACTION=PASS
ACTIONABLE_EMPTY_STATES=PASS
SMART_DEFAULTS=PASS
PROGRESSIVE_DISCLOSURE=PASS
HUMAN_FEEDBACK=PASS
CARD_LIST_PARITY=PASS
KEYBOARD=PASS
VISIBLE_FOCUS=PASS
SCREEN_READER=PASS_CONTRACT_AND_SEMANTICS
REDUCED_MOTION=PASS
ZOOM_200=PASS
MOBILE=PASS
TABLET=PASS
DESKTOP=PASS
SESSION_SCRUB=PASS
ADVISOR_SWITCH_SCRUB=PASS_BY_SHARED_SESSION_CONTRACT_AND_LOCAL_DESTROY
LATE_RESULT_REJECTION=PASS
TENANT_ISOLATION_PRESERVED=PASS
NEW_LOGIN_MUTATIONS=ZERO
NEW_ACTIVITY_MUTATIONS=ZERO
NEW_REPORTS_MUTATIONS=ZERO
NEW_HOME_MUTATIONS=ZERO
NEW_UNRELATED_MUTATIONS=ZERO
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
AUTO_MERGE_ENABLED=NO
FINAL_STATUS=PASS_IMPLEMENTATION_AWAITING_FINAL_DOCUMENTATION_REVALIDATION
NEXT=RUN_FINAL_SHA_REVALIDATION_AND_UPDATE_DRAFT_PR_278
```
