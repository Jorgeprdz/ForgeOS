# Forge Desktop Design System Draft 001

## Resumen claro

Este es un borrador inicial para la línea visual desktop de Forge.

No cierra desktop.

Sirve para guiar la siguiente fase de implementación sin contaminar mobile.

## Dirección visual

Desktop debe sentirse como:

- sistema profesional;
- workspace operativo;
- CRM premium;
- spreadsheet-grade productivity;
- sistema financiero;
- command workspace.

No debe sentirse como:

- mobile ampliado;
- dashboard decorativo;
- iPad app;
- landing page;
- demo con widgets grandes.

## Layout recomendado

1. Sidebar izquierda compacta.
2. Topbar con breadcrumb y cuenta.
3. Command bar global prioritaria.
4. KPI strip compacto.
5. Tabla principal operativa.
6. Panel secundario o right rail Alfred.
7. Documentos/cotizaciones como tab, tabla o panel inferior.

## Command bar

La command bar debe estar cerca del top, no escondida abajo.

Debe aceptar:

- destinos;
- clientes;
- acciones;
- documentos;
- cotizaciones;
- pólizas.

Debe mostrar resultados sólo cuando haya intención.

Cada resultado debe indicar:

- tipo;
- destino/acción;
- límite;
- preview/aprobación si aplica.

## Densidad

Desktop puede ser denso.

Pero cada zona debe tener una jerarquía:

1. command bar;
2. tabla principal;
3. Alfred contextual;
4. KPIs;
5. documentos/actividad.

## Componentes base

- desktop sidebar;
- desktop topbar;
- command bar;
- quick actions;
- KPI strip;
- data table;
- status chip;
- action button inline;
- right rail Alfred;
- document workflow table;
- filters;
- contextual drawer.

## Reglas de implementación

- No tocar mobile cerrado.
- No agregar desktop al final de `styles-mobile.css`.
- Evitar nuevos overrides globales en `styles.css`.
- Preferir `styles-desktop.css`.
- Si una pantalla necesita patrón nuevo, documentarlo antes.

## Estado

```text
DESKTOP_DESIGN_SYSTEM_DRAFT_001
```
