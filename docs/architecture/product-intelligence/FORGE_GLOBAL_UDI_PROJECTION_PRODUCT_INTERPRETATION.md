# Interpretación por Producto: Proyección UDI Global 4.5%

## Veredicto General

Forge ahora usa una tasa global fija de **4.5% anual compuesta** para proyecciones UDI.

Banxico se mantiene como fuente para:

- UDI actual.
- USD/MXN FIX.

Los históricos UDI quedan como referencia, no como tasa directa de cálculo.

## Imagina Ser

Imagina Ser queda alineado a la nueva política global.

Antes, la hoja `IMAGINA` mezclaba:

- 4.0% para aportaciones/protección.
- 4.5% para rentas.

Ahora Forge aplica 4.5% a:

- aportaciones;
- pago único;
- mensualidades;
- acumulados futuros.

Con Edwin:

- Prima anual: 3,222 UDI.
- Total aportado: 48,330 UDI.
- Total nominal proyectado: $592,651 MXN.
- Pago único favorable a edad 65: $7,234,290 MXN.
- Renta mensual favorable a edad 65: $34,064 MXN.

La diferencia contra la presentación anterior de Jorge es esperada porque aquella usaba lógica mixta de Excel.

## ORVI

ORVI ya estaba naturalmente cerca de la nueva regla.

La hoja `ORVI` usa:

```text
I5 = I4*1.045
I6:I49 = UDI previa * 1.045
```

Por eso la política global no contradice la hoja histórica de ORVI.

Resultado:

- Total aportado de referencia: 191,500 UDI.
- Total nominal proyectado: $2,530,713 MXN.
- Suma asegurada de 60,000 UDI a edad 65: $2,257,746 MXN.

## Vida Mujer

Vida Mujer cambia frente al Excel histórico.

La hoja `VM` usaba:

```text
L10 = L9*1.04
L11:L28 = UDI previa * 1.04
```

Forge ahora fuerza 4.5% para UDI.

Resultado:

- Prima anual de referencia: 2,217 UDI.
- Total aportado: 44,340 UDI.
- Total nominal proyectado: $614,130 MXN.
- Suma asegurada de 35,000 UDI a edad 65: $1,962,967 MXN.

Esta diferencia debe documentarse en cualquier presentación comparativa contra el Excel anterior.

## SeguBeca

SeguBeca ya estaba alineado con 4.5%.

La hoja `SB` contiene:

```text
K9 = K8*1.045
K10:K25 = UDI previa * 1.045
```

Resultado:

- Prima anual de referencia: 4,707 UDI.
- Total aportado: 84,726 UDI.
- Total nominal proyectado: $1,042,857 MXN.
- Mensualidad de 637 UDI a edad 65: $15,114 MXN.

## Nuevo Plenitud

No se encontró una hoja específica de Nuevo Plenitud en `Hoja de trabajo.xlsx`.

Estado:

```text
BLOCKED_SOURCE_NOT_FOUND
```

Forge no inventó:

- primas;
- suma asegurada;
- rescates;
- valores a edades 65, 75, 80;
- escenarios favorables o desfavorables.

El motor compartido queda listo para consumir Nuevo Plenitud cuando exista fuente verificable.

## Lectura Técnica

La regla global 4.5% debe entenderse así:

```text
valor UDI actual Banxico
*
(1 + 0.045) ^ años
=
UDI proyectada del año
```

Después:

```text
valor actuarial en UDI
*
UDI proyectada del año
=
valor nominal MXN estimado
```

## Riesgos Documentados

1. Los valores MXN futuros aumentan contra hojas que usaban 4.0%.
2. Los valores no son garantizados.
3. Banxico da el valor actual; no define la tasa futura.
4. El CAGR histórico UDI no se usa para cálculo directo.
5. Nuevo Plenitud requiere fuente antes de validarse.

## Conclusión

La actualización es consistente para una política global operativa de Forge.

Estado:

```text
GLOBAL_UDI_4_5_PERCENT_RULE_ACTIVE
```
