# Forge Desktop System Vision And Layer Lock 056W

## Resumen claro

La versión desktop de Alfred Static Preview queda declarada como fase pendiente de rediseño/pulido profesional.

Mobile `056U` queda cerrado y no debe reabrirse para resolver desktop.

Desktop debe evolucionar como un sistema profesional propio:

> Salesforce premium + Excel-grade productivity + sistema financiero operativo + Alfred como capa de comando e inteligencia.

No debe verse como:

- mobile ampliado;
- app de iPad vieja;
- dashboard hero decorativo;
- conjunto de widgets grandes;
- demo visual sin productividad real.

## Estados

Mobile:

```text
MOBILE_DESIGN_CLOSED_056U
```

Desktop:

```text
DESKTOP_DESIGN_PENDING_POLISH_056W
```

Command bar:

```text
COMMAND_BAR_DESKTOP_PRIORITY_NON_NEGOTIABLE
```

Filosofía UX:

```text
MIN_CLICKS_IS_NON_NEGOTIABLE
```

## Principio no negociable: menos clicks

Forge debe minimizar clicks entre señal, juicio y acción aprobada.

Esto no significa esconder información ni simplificar en exceso.

En desktop significa:

- llegar rápido a destinos;
- abrir acciones desde command bar;
- tener acciones inline en tablas;
- usar filtros y búsquedas persistentes;
- reducir fricción en cotizaciones, pólizas, clientes y seguimiento.

Regla:

> La densidad está permitida; la fricción no.

## Command bar como prioridad

La command bar es la columna vertebral de desktop.

No es decoración.
No es buscador genérico.
No es input visual.

Debe servir para:

- navegar a destinos;
- buscar clientes;
- abrir cotizaciones;
- subir pólizas;
- preparar previews;
- revisar pipeline;
- iniciar acciones con aprobación humana.

Ejemplos:

- `/cotizar GMM Juan`
- `/subir póliza Lariza`
- `/buscar cliente Octavio`
- `/follow María`
- `/seguimiento atrasado`
- `/pipeline riesgo alto`

Regla:

> La navegación es para explorar. La command bar es para llegar.

## Rol de desktop

Mobile resuelve acción rápida.

Desktop resuelve trabajo profundo:

- cotizaciones;
- carga y revisión de pólizas;
- documentos;
- pipeline;
- análisis comercial;
- gestión de clientes;
- seguimiento;
- reportes;
- operación de managers;
- revisión con más contexto.

## Lectura del estado actual

Discovery `056W_DESKTOP_MOBILE_LAYER_DISCOVERY` confirmó:

- `index.html` contiene DOM desktop y mobile en el mismo documento.
- `styles-mobile.css` tiene miles de líneas y mobile quedó cerrado por capas acumuladas.
- `styles-desktop.css` existe, pero aún es muy pequeño para sostener un sistema desktop final.
- Desktop tiene base: sidebar, hero, KPIs, oportunidades, motor de seguimiento, agenda y actividad.
- Desktop todavía depende demasiado de estilos base/históricos.

Conclusión:

> Desktop existe como maqueta avanzada, no como sistema profesional cerrado.

## Layer lock

Para implementar desktop:

1. No tocar `styles-mobile.css` salvo emergencia explícita.
2. No tocar el Smart Widget mobile `056U`.
3. No mover el Alfred orb mobile.
4. No reabrir mobile closure para resolver desktop.
5. Trabajar desktop principalmente en:

```text
docs/static-preview/forge-alive/styles-desktop.css
docs/static-preview/forge-alive/alfred-desktop-dashboard.js
```

6. Si hace falta nuevo CSS desktop, debe estar claramente separado.
7. No agregar overrides desktop al final de `styles.css` salvo justificación fuerte.

## Componentes desktop deseados

### App shell

- sidebar persistente;
- topbar con breadcrumb;
- profile/actions;
- main workspace;
- right rail opcional contextual.

### Command bar

- persistente;
- visible arriba;
- keyboard-first;
- resultados agrupados;
- acciones rápidas;
- preview/aprobación visible.

### Workspace central

Debe priorizar:

- tablas;
- filtros;
- acciones inline;
- estados;
- documentos;
- flujos operativos.

No debe estar dominado por cards gigantes.

### Alfred right rail

Alfred debe actuar como panel contextual:

- `Haz esto ahora`;
- `Por qué ahora`;
- límites;
- comando recomendado;
- feedback.

No debe competir con la tabla principal.

### Data tables

Tablas desktop deben ser protagonistas en:

- oportunidades;
- clientes;
- cotizaciones;
- pólizas;
- documentos;
- reportes.

Debe haber acciones inline como:

- revisar;
- cotizar;
- follow;
- abrir;
- subir documento;
- preparar preview.

## Qué conservar de la maqueta actual

Conservar:

- sidebar izquierda;
- concepto de dashboard `Mi día`;
- KPIs compactos;
- oportunidades;
- motor de seguimiento;
- agenda;
- Alfred como capa de inteligencia;
- dark navy/gold/cyan.

Replantear:

- hero demasiado grande;
- widgets grandes;
- command bar inferior ornamental;
- iconos tipo ASCII;
- exceso de glow;
- densidad poco productiva;
- cards con peso visual igual.

## Qué no debe pasar

Desktop no debe:

- parecer mobile ampliado;
- parecer una tablet app;
- depender de cards enormes;
- ocultar la command bar;
- obligar a navegación profunda;
- hacer que cotizar/subir póliza tome demasiados pasos;
- inventar verdad comercial;
- ejecutar sin aprobación.

## Criterio de aceptación desktop

Una futura versión desktop pasa si:

- se puede trabajar varias horas sin sentir demo;
- la command bar reduce clicks reales;
- tablas y documentos son operables;
- Alfred ayuda sin estorbar;
- acciones riesgosas son preview/aprobación;
- el layout se siente Salesforce/Excel/profesional;
- mobile `056U` permanece intacto.

## Próxima fase recomendada

```text
056X_FORGE_DESKTOP_COMMAND_WORKSPACE_SCOPE
```

Objetivo:

Definir el alcance exacto de la nueva pantalla desktop profesional antes de tocar implementación.

## Decisión

```text
DECISION=DESKTOP_SYSTEM_VISION_LOCKED_056W
```
