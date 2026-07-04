# Forge Desktop Command Workspace Scope 056X

## Resumen claro

`056X` define el alcance de la primera reconstrucción desktop profesional de Forge Alive.

Esta fase no implementa UI.

Su objetivo es dejar lista la siguiente fase de construcción:

```text
056Y_FORGE_DESKTOP_COMMAND_WORKSPACE_IMPLEMENTATION
```

La versión mobile queda cerrada y fuera de alcance:

```text
MOBILE_DESIGN_CLOSED_056U
```

## Objetivo desktop

Desktop debe convertirse en un workspace profesional, no en una ampliación de mobile.

Debe sentirse como:

- Salesforce premium;
- Excel-grade productivity;
- sistema financiero operativo;
- command workspace;
- Alfred como capa contextual de inteligencia.

## Principios no negociables

### Menos clicks

```text
MIN_CLICKS_IS_NON_NEGOTIABLE
```

Forge debe minimizar clicks entre intención, contexto y acción aprobada.

Desktop puede ser denso, pero no puede ser friccionado.

### Command bar prioritaria

```text
COMMAND_BAR_DESKTOP_PRIORITY_NON_NEGOTIABLE
```

La command bar es el camino más corto a:

- destinos;
- clientes;
- cotizaciones;
- pólizas;
- documentos;
- previews;
- acciones de seguimiento.

### Seguridad constitucional

La command bar puede preparar acciones, pero no ejecuta mutaciones sin revisión/aprobación humana.

Ejemplos:

- `/mandar mensaje Juan` abre preview, no envía.
- `/crear evento Lariza` abre borrador, no crea.
- `/subir póliza Octavio` abre flujo, no muta source-of-truth sin revisión.
- `/cotizar GMM María` abre workspace de cotización, no inventa producto.

## Pantalla objetivo

La primera pantalla desktop a reconstruir es:

```text
Desktop Mi día / Command Workspace
```

Debe incluir:

1. sidebar profesional compacta;
2. topbar con breadcrumb y cuenta;
3. command bar global prioritaria;
4. quick actions;
5. KPI strip compacto;
6. tabla principal de oportunidades;
7. panel de seguimiento/riesgo;
8. tabla de cotizaciones y pólizas;
9. right rail Alfred contextual.

## Arquitectura de layout

### Sidebar

Debe contener:

- Inicio;
- Pipeline;
- Clientes;
- Cotizaciones;
- Pólizas;
- Reportes;
- Alfred;
- Más.

Debe sentirse profesional y compacta.

No usar iconos ASCII como solución final.

### Topbar

Debe contener:

- breadcrumb;
- estado de entorno si aplica;
- perfil;
- notificaciones/configuración.

No debe competir con la command bar.

### Command bar

Debe estar arriba, visible y prioritaria.

Placeholder base:

```text
/cotizar, /subir póliza, /buscar cliente, /follow Juan...
```

Quick actions iniciales:

- Cotizar GMM;
- Subir póliza;
- Revisar pipeline;
- Seguimiento atrasado;
- Buscar cliente.

Resultados esperados:

- clientes;
- destinos;
- acciones;
- documentos;
- cotizaciones;
- pólizas.

Cada resultado debe mostrar:

- tipo;
- nombre;
- siguiente paso;
- límite: preview / requiere aprobación / solo lectura.

### Main workspace

Debe priorizar una tabla principal.

Tabla inicial:

```text
Oportunidades prioritarias
```

Columnas:

- Cliente;
- Producto;
- Etapa;
- Probabilidad;
- Último contacto;
- Siguiente acción;
- Acciones.

Acciones inline:

- Revisar;
- Cotizar;
- Follow;
- Abrir.

### KPI strip

Debe ser compacto.

KPIs iniciales:

- Probabilidad meta mensual;
- Producción esperada;
- Gap;
- Riesgo de seguimiento.

No deben dominar la pantalla.

### Cotizaciones y pólizas

Debe aparecer como tabla o panel inferior.

Columnas:

- Documento;
- Cliente;
- Tipo;
- Estado;
- Última actualización;
- Responsable;
- Acción.

Estados:

- Borrador;
- Pendiente revisión;
- Falta documento;
- Listo para preview.

### Right rail Alfred

Alfred debe vivir como panel contextual.

Debe mostrar:

- Haz esto ahora;
- Por qué ahora;
- límites;
- comando recomendado;
- feedback.

No debe ser un avatar gigante.
No debe desplazar la tabla principal.

## Qué queda fuera de 056X

No entra:

- implementación visual;
- rediseño mobile;
- audio/speech;
- live search;
- provider runtime;
- browser storage;
- CRM write;
- calendar write;
- envío de mensajes;
- carga real de pólizas.

## Archivos a tocar en 056Y

La implementación siguiente debe trabajar principalmente en:

```text
docs/static-preview/forge-alive/styles-desktop.css
docs/static-preview/forge-alive/alfred-desktop-dashboard.js
```

Puede tocar `index.html` sólo si necesita reorganizar markup desktop.

No debe tocar:

```text
docs/static-preview/forge-alive/styles-mobile.css
docs/static-preview/forge-alive/alfred-smart-widget-static-056u.css
docs/static-preview/forge-alive/alfred-smart-widget-static-056u.js
```

## Criterio de aceptación para 056Y

La implementación desktop pasa si:

- no afecta mobile `056U`;
- command bar queda visualmente prioritaria;
- tabla principal se siente profesional;
- quick actions reducen clicks;
- right rail Alfred ayuda sin saturar;
- cotizaciones/pólizas aparecen como flujo operativo;
- no se siente como mobile ampliado;
- no se siente como iPad app;
- no se ve tosco ni saturado;
- límites de preview siguen visibles.

## Siguiente fase

```text
056Y_FORGE_DESKTOP_COMMAND_WORKSPACE_IMPLEMENTATION
```

## Decisión

```text
DECISION=FORGE_DESKTOP_COMMAND_WORKSPACE_SCOPED_056X
```
