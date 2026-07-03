# Forge Mobile Design System 001

## Resumen claro

Este documento convierte el cierre visual de Alfred mobile `056U` en una línea de diseño reutilizable para nuevas pantallas y módulos mobile de Forge.

Objetivo:

> Las nuevas pantallas mobile de Forge no se diseñan desde cero. Se componen con shell, tokens y componentes aprobados.

Este sistema aplica a mobile. Desktop tendrá su propio cierre y plantilla cuando termine su fase de pulido.

## Principios

1. **Mobile first**

Mobile es la superficie principal. Cada módulo debe funcionar primero en teléfono.

2. **Menos clicks**

La pantalla debe mostrar la siguiente acción más importante sin obligar al usuario a navegar demasiado.

3. **Acción con criterio**

Forge no muestra información por mostrar. Debe explicar:

- qué hacer;
- con quién;
- por qué ahora;
- qué límites existen.

4. **Alfred es concierge**

Alfred no es chatbot genérico. Alfred ayuda a convertir señales en claridad accionable.

5. **Static preview no ejecuta**

Las previews deben mantener límites visibles: solo lectura, revisión humana, sin envío, sin CRM, sin calendario.

## Tokens base

| Token | Valor | Uso |
|---|---:|---|
| `--forge-navy-950` | `#050B16` | fondo principal |
| `--forge-navy-900` | `#071224` | paneles |
| `--forge-navy-850` | `#0A1A2F` | cards profundas |
| `--forge-gold-500` | `#F2CF75` | énfasis, CTA, Alfred |
| `--forge-gold-600` | `#EFC45C` | degradé activo |
| `--forge-cyan-400` | `#76DBFF` | inteligencia, glow |
| `--forge-white` | `#F5F8FF` | texto principal |
| `--forge-muted` | `rgba(220, 230, 244, 0.72)` | texto secundario |
| `--forge-border` | `rgba(223, 240, 255, 0.16)` | borde glass |
| `--forge-radius-card` | `30px` | cards mobile |
| `--forge-radius-pill` | `999px` | pills, nav, CTAs |
| `--forge-blur` | `22px` | glassmorphism |

## Mobile shell

Toda pantalla mobile debe usar esta estructura:

1. safety ribbon;
2. header de pantalla;
3. stack principal de contenido;
4. componentes de decisión/acción;
5. Alfred orb;
6. bottom navigation pill.

No se debe diseñar una pantalla sin shell salvo que sea un flujo full-screen especial aprobado.

## Componentes aprobados

### Safety Ribbon

Uso:

- indicar modo seguro;
- mostrar límites operativos;
- evitar confusión entre preview y ejecución.

Copy recomendado:

- `Muestra segura · solo lectura`
- `Solo revisión · sin envío`

### Screen Header

Uso:

- saludo;
- nombre de pantalla;
- avatar o placeholder de perfil.

Regla:

La `F` de perfil es placeholder hasta auth con Google. Cuando exista login, debe cambiarse por foto de perfil y abrir menú de perfil.

### Alfred Insight Card

Uso:

- señal principal;
- explicación breve;
- límites visibles.

Copy base:

- `Haz esto ahora`
- `Prioriza seguimiento antes de que se enfríe.`
- `Solo lectura · revisión humana`
- `Sin envío · sin CRM · sin calendario`

### Plan Card

Uso:

- orientar el día;
- activar revisión;
- separar intención de ejecución.

CTA base:

- `Iniciar revisión del día`

### Smart Widget

Uso:

- mostrar una señal accionable por tarjeta;
- explicar por qué importa;
- permitir revisión rápida con dots/swipe.

Reglas:

- 4 tarjetas máximo en mobile.
- 1 tarjeta visible por página.
- 1 fila de dots.
- La primera tarjeta debe ser comercialmente accionable.
- En static preview, el markup puede ser estático y el JS sólo debe manejar dots/swipe.

Primer slide recomendado:

- `Seguimiento prioritario`
- `Por qué ahora`
- `Juan necesita revisión antes de que se enfríe.`

### Metric Cards

Uso:

- mostrar estado resumido;
- no competir con Alfred.

Regla:

Las métricas deben ser secundarias frente a la siguiente mejor acción.

### List Card

Uso:

- oportunidades;
- recomendaciones;
- actividad reciente.

Regla:

Listas deben ser escaneables, no densas.

### Alfred Orb

Uso:

- entrada principal al command bar;
- identidad flotante de Alfred.

Regla:

No mover la posición del orb sin una razón fuerte. Debe evitar tapar acciones críticas cuando se pase a producto real.

### Bottom Navigation Pill

Uso:

- navegación principal de mobile.

Regla:

Debe estar presente en pantallas principales. Los módulos nuevos deben integrarse a la navegación sin rediseñar la pill.

## Recetas de pantalla

### Home / Mi día

Orden recomendado:

1. safety ribbon;
2. header;
3. Alfred Insight Card;
4. Plan Card;
5. Smart Widget;
6. métricas;
7. oportunidades;
8. recomendaciones;
9. orb/nav.

### Pipeline

Orden recomendado:

1. safety ribbon;
2. header `Pipeline`;
3. summary card;
4. Smart Widget de oportunidad prioritaria;
5. lista de oportunidades;
6. filtros simples;
7. orb/nav.

### Cliente

Orden recomendado:

1. safety ribbon;
2. header del cliente;
3. relationship health card;
4. Smart Widget de siguiente acción;
5. timeline de relación;
6. notas/objeciones;
7. orb/nav.

### Alfred

Orden recomendado:

1. safety ribbon;
2. Alfred command surface;
3. acciones sugeridas;
4. historial de previews;
5. límites visibles;
6. orb/nav.

## Reglas de copy

Preferir:

- frases cortas;
- verbos de acción;
- razones explícitas;
- límites humanos visibles.

Evitar:

- texto técnico interno;
- nombres de fase visibles;
- promesas de ejecución real;
- lenguaje de chatbot genérico.

## Reglas de seguridad visual

La UI debe mostrar límites cuando una acción parezca ejecutable.

Ejemplos:

- `Solo lectura`
- `Revisión humana`
- `Preview`
- `No envío`
- `Sin CRM`
- `Sin calendario`

## Qué no se debe hacer

- No crear una nueva paleta por módulo.
- No duplicar nav.
- No duplicar Smart Widget stacks.
- No montar componentes críticos sólo por detección dinámica frágil.
- No ocultar límites de static preview.
- No convertir estimaciones o señales en verdad comercial.

## Archivos template

Plantilla reusable:

- `docs/static-preview/templates/forge-mobile/index.html`
- `docs/static-preview/templates/forge-mobile/forge-mobile-tokens.css`
- `docs/static-preview/templates/forge-mobile/forge-mobile-shell.css`
- `docs/static-preview/templates/forge-mobile/forge-mobile-components.css`
- `docs/static-preview/templates/forge-mobile/forge-mobile-template.js`

## Criterio de aceptación

Una nueva pantalla mobile pasa si:

- usa tokens Forge;
- usa mobile shell;
- respeta bottom nav y Alfred orb;
- muestra una acción prioritaria;
- explica `por qué ahora`;
- mantiene límites de static preview;
- no introduce overrides visuales sin justificar;
- se puede leer en teléfono sin pelear con densidad.

## Decisión

`DECISION=FORGE_MOBILE_DESIGN_SYSTEM_TEMPLATE_001_CREATED`
