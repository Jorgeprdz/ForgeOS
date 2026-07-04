# Forge Desktop Command Workspace Blueprint 001

## Resumen claro

Este blueprint traduce la visión desktop a estructura visual implementable.

Desktop debe sentirse como sistema operativo comercial profesional.

## Wireframe lógico

```text
┌ Sidebar ┬ Topbar / Breadcrumb / Profile ┐
│         ├ Command Bar + Quick Actions   │
│         ├ KPI Strip                     │
│         ├ Main Table ┬ Alfred Rail      │
│         ├ Docs Table ┴ Alfred Rail      │
└─────────┴───────────────────────────────┘
```

## Jerarquía visual

1. Command bar.
2. Main table.
3. Alfred contextual rail.
4. KPI strip.
5. Documents/cotizaciones table.
6. Secondary panels.

## Command bar behavior

Estados:

- idle;
- typing;
- results;
- selected result;
- preview opened;
- approval required.

Grupos de resultados:

- Destinos;
- Clientes;
- Acciones;
- Documentos;
- Cotizaciones/Pólizas.

## Desktop density rules

Permitido:

- tablas densas;
- filas compactas;
- chips de estado;
- toolbars;
- filtros;
- acciones inline.

Evitar:

- cards enormes;
- glows excesivos;
- widgets gigantes;
- hero dominante;
- espacios vacíos tipo demo.

## Right rail Alfred

Tamaño recomendado:

```text
280px - 340px
```

Contenido recomendado:

- Haz esto ahora;
- Por qué ahora;
- Límites;
- Comando recomendado;
- Feedback.

## Main table initial rows

Ejemplo:

| Cliente | Producto | Etapa | Probabilidad | Último contacto | Siguiente acción | Acciones |
|---|---|---|---:|---|---|---|
| Lariza | GMM | Propuesta | 72% | Hace 5 días | Llamar a Lariza | Revisar / Follow |
| Octavio | GMM | Presentación | 65% | Hace 8 días | Enviar propuesta | Revisar / Follow |
| María | Vida | Evaluación | 40% | Hace 12 días | Aclarar objeciones | Revisar / Cotizar |
| Juan | GMM | Descubrimiento | 25% | Hace 15 días | Reagendar reunión | Revisar / Abrir |

## Document workflow initial rows

| Documento | Cliente | Tipo | Estado | Acción |
|---|---|---|---|---|
| COT-2025-0487 | Lariza | GMM | Borrador | Abrir |
| POL-2025-0312 | Octavio | Vida | Pendiente revisión | Abrir |
| COT-2025-0471 | María | GMM | Falta documento | Abrir |
| POL-2025-0289 | Juan | GMM | Listo para preview | Abrir |

## Visual tone

Paleta:

- navy profundo;
- panels glass sobrios;
- gold para prioridad/Alfred;
- cyan para inteligencia/señales;
- rojo sólo para gap/riesgo real;
- verde sólo para avance/producción.

Motion:

- sutil;
- productivo;
- no ornamental.

## Implementación recomendada

Primera implementación:

```text
056Y_FORGE_DESKTOP_COMMAND_WORKSPACE_IMPLEMENTATION
```

Archivos:

```text
docs/static-preview/forge-alive/styles-desktop.css
docs/static-preview/forge-alive/alfred-desktop-dashboard.js
```

`index.html` sólo si la estructura actual no permite el workspace.

## Decisión

```text
DECISION=FORGE_DESKTOP_COMMAND_WORKSPACE_BLUEPRINT_001
```
