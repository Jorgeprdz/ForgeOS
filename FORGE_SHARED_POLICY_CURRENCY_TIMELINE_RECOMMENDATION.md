# Recomendación: Shared Policy Currency Timeline

## Veredicto

**PARTIAL**

El cálculo creado coincide con `IMAGINA` para el caso Edwin cuando se usa la lógica real del Excel:

```text
valor actuarial UDI
*
moneda proyectada del año
=
valor nominal MXN
```

Pero el workbook no usa una sola estructura universal. Cada hoja puede tener distinta columna de moneda, distinta tasa, distintos acumulados y, en algunos casos, valores pegados sin fórmula visible.

## Qué Mantener

Mantener:

- `retirement-future-udi-projection-engine.js`
- `imagina-ser-future-mxn-bridge.js`
- `shared-policy-currency-timeline-engine.js`

El motor que debe convertirse en la base universal es:

```text
shared-policy-currency-timeline-engine.js
```

## Evidencia

### IMAGINA

```text
D5 = C5*I5
I6 = I5*1.04
P6 = P5*1.045
R5 = Q5*P5
N5 = L5*P5
Q15 = SUM(M5:M15)
R15 = SUM(O5:O15)
Q20 = SUM(M5:M20)
R20 = SUM(O5:O20)
```

Conclusión:
Compatible, pero requiere múltiples timelines: aportaciones/protección y rentas.

### ORVI

```text
D4 = C4*I4
H4 = G4*I4
I5 = I4*1.045
I6:I49 = moneda previa * 1.045
D51 = SUM(D4:D50)
```

Conclusión:
Compatible con motor compartido si el producto configura columna y tasa.

### Vida Mujer

```text
D9 = C9*L9
K9 = J9*L9
L10 = L9*1.04
L11:L28 = moneda previa * 1.04
G29 = SUM(G9:G28)
```

Conclusión:
Compatible con motor compartido si el producto configura columna y tasa.

### Segubeca

```text
F8 = E8*K8
J8 = I8*K8
K9 = K8*1.045
P13 = SUM(P9:P12)
```

Conclusión:
Compatible parcialmente. Hay fórmulas especiales de renta que requieren adapter.

### Realiza

```text
D4 = C4*M4
F4 = E4*M4
H4 = G4*M4
L4 = K4*M4
D32 = SUM(D4:D13)
```

Conclusión:
Compatible parcialmente. La columna `M` contiene valores de moneda visibles, pero no todas las fórmulas aparecen en XML; el motor debe aceptar timelines por valores explícitos.

## Cambios Recomendados Antes de Universalizar

1. Crear configuración por producto:
   - moneda;
   - columna/rango de moneda;
   - tasa anual;
   - columnas de aportación;
   - columnas de beneficio;
   - columnas de rescate/retiro;
   - reglas de acumulado.

2. Permitir múltiples timelines por producto:
   - aportaciones;
   - protección;
   - fondo;
   - pago único;
   - rentas.

3. Permitir moneda proyectada por:
   - tasa anual;
   - tabla explícita de valores.

4. No calcular acumulados convirtiendo el total UDI con una sola UDI final cuando Excel usa suma de MXN por año.

5. Mantener siempre:

```text
VALORES_NOMINALES_PROYECTADOS_NO_GARANTIZADOS
```

## Recomendación Final

No reemplazar el motor.

Sí conservarlo y evolucionarlo hacia:

```text
shared-policy-currency-timeline-engine.js
```

Estado recomendado:

```text
FOUNDATION VALIDATED / UNIVERSALIZATION PARTIAL
```
