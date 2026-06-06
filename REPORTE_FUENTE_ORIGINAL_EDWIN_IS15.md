# Reporte Fuente Original

Validacion: Edwin IS-15 vs salidas Forge

Fuente humana de referencia:

- `/storage/emulated/0/Download/Edwin IS-15.pdf`

Fuentes Forge revisadas:

- `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt`
- `IMAGINA_SER_EDWIN_ADVISOR_INTERPRETATION_REPORT.md`
- `IMAGINA_SER_EDWIN_RAW_SOURCE_REPORT.md`
- `IMAGINA_SER_EDWIN_REASONING_DIAGRAM.md`

## Valores extraidos de Edwin IS-15.pdf

| Concepto | UDI | MXN | Observacion |
|---|---:|---:|---|
| Invalidez | 75,000 UDI | $663,750 MXN | Valor mostrado en PDF humano |
| Fallecimiento | 75,000 UDI | $663,750 MXN | Valor mostrado en PDF humano |
| Prima basica anual | 3,222 UDI | $28,515 MXN | Valor mostrado en PDF humano |
| Aportacion voluntaria | No indicada | No indicada | PDF muestra guion |
| Prima total anual | 3,222 UDI | $28,515 MXN | Tambien muestra $78.12 diarios |
| Ahorro en 15 anos | No indicado | $570,967 MXN | PDF humano no muestra UDI para este concepto |
| Recuperacion pago unico | No indicado | $5,942,841 MXN | PDF humano no muestra UDI para este concepto |
| Primera renta vitalicia | 606 UDI | $27,983 MXN | Valor mostrado en PDF humano |
| Acumulado a los 75 | 79,992 UDI | $4,647,856 MXN | Valor mostrado en PDF humano |
| Acumulado a los 80 | 116,352 UDI | $7,629,134 MXN | Valor mostrado en PDF humano |
| UDI hoy usada por Jorge | 1 UDI | $8.85 MXN | Texto: "UDI HOY $8.85" |

## Valores extraidos de reportes Forge

| Concepto | UDI | MXN | Fuente Forge |
|---|---:|---:|---|
| Suma asegurada | 75,000 UDI | $662,245.50 MXN | Raw Source / Advisor |
| Prima anual total | 3,222 UDI | $28,450.07 MXN | Raw Source / Advisor |
| Prima mensual total | 269 UDI | $2,375.25 MXN | Raw Source |
| Prima trimestral total | 806 UDI | $7,116.93 MXN | Raw Source |
| Prima semestral total | 1,611 UDI | $14,225.03 MXN | Raw Source |
| Prima planeada | 0 UDI | No aplica | Raw Source |
| Total UDI contribuido | 48,330 UDI | $426,751.00 MXN | Raw Source / Advisor |
| Escenario base pago unico | 82,829 UDI | $731,375.10 MXN | Raw Source / Advisor |
| Escenario base renta mensual | 390 UDI | $3,443.68 MXN | Raw Source / Advisor |
| Escenario favorable pago unico | 128,697 UDI | $1,136,386.79 MXN | Raw Source / Advisor |
| Escenario favorable renta mensual | 606 UDI | $5,350.94 MXN | Raw Source / Advisor |
| Escenario desfavorable pago unico | 57,228 UDI | $505,319.81 MXN | Raw Source / Advisor |
| Escenario desfavorable renta mensual | 270 UDI | $2,384.08 MXN | Raw Source / Advisor |
| Acumulado a los 75 | No calculado | No calculado | No aparece en reportes Forge |
| Acumulado a los 80 | No calculado | No calculado | No aparece en reportes Forge |
| UDI usada por Forge | 1 UDI | $8.82994 MXN | BANXICO_SIE_API, cache, fecha fuente 10/06/2026 |

## Comparacion pura de valores

| Concepto | Jorge / PDF humano | Forge | Diferencia |
|---|---:|---:|---:|
| Suma asegurada UDI | 75,000 UDI | 75,000 UDI | 0 UDI |
| Suma asegurada MXN | $663,750 MXN | $662,245.50 MXN | -$1,504.50 MXN |
| Prima anual UDI | 3,222 UDI | 3,222 UDI | 0 UDI |
| Prima anual MXN | $28,515 MXN | $28,450.07 MXN | -$64.93 MXN |
| Ahorro / contribucion total UDI | No indicado | 48,330 UDI | No comparable directo |
| Ahorro / contribucion total MXN | $570,967 MXN | $426,751.00 MXN | -$144,216.00 MXN |
| Pago unico favorable UDI | No indicado | 128,697 UDI | No comparable directo |
| Pago unico favorable MXN | $5,942,841 MXN | $1,136,386.79 MXN | -$4,806,454.21 MXN |
| Renta mensual favorable UDI | 606 UDI | 606 UDI | 0 UDI |
| Renta mensual favorable MXN | $27,983 MXN | $5,350.94 MXN | -$22,632.06 MXN |
| Acumulado a los 75 UDI | 79,992 UDI | No calculado | Falta en Forge |
| Acumulado a los 75 MXN | $4,647,856 MXN | No calculado | Falta en Forge |
| Acumulado a los 80 UDI | 116,352 UDI | No calculado | Falta en Forge |
| Acumulado a los 80 MXN | $7,629,134 MXN | No calculado | Falta en Forge |

## Valores asumidos o no respaldados

- Forge usa UDI verificada Banxico/cache de $8.82994 MXN. Esta tasa no aparece en Edwin IS-15.pdf.
- Jorge usa "UDI HOY $8.85", que si aparece en Edwin IS-15.pdf.
- Forge no calcula acumulados a 75 y 80 anos.
- Edwin IS-15.pdf no muestra el valor UDI del ahorro en 15 anos ni de recuperacion pago unico; muestra esos conceptos solo en MXN.

