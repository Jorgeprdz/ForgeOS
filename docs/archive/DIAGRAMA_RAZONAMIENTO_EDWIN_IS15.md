# Diagrama de Razonamiento

Validacion Jorge vs Forge para Imagina Ser Edwin IS-15

Este diagrama muestra arquitectura de procesamiento. No contiene cadena de pensamiento.

```text
FUENTE HUMANA
Edwin IS-15.pdf
Jorge Palacios
UDI hoy: $8.85 MXN
        |
        v
EXTRACCION HUMANA
Valores visibles:
- Prima: 3,222 UDI = $28,515 MXN
- Suma asegurada: 75,000 UDI = $663,750 MXN
- Ahorro 15 anos: $570,967 MXN
- Pago unico: $5,942,841 MXN
- Renta inicial: 606 UDI = $27,983 MXN
- A los 75: 79,992 UDI = $4,647,856 MXN
- A los 80: 116,352 UDI = $7,629,134 MXN
        |
        v
CALCULO HUMANO
Valores de hoy:
UDI x $8.85 MXN

Valores futuros:
Uso implicito de UDI futura/proyectada
        |
        v
COMPARACION
        ^
        |
FUENTE FORGE
Solucionline_20260602_18_10.PDF
        |
        v
OCR / EXTRACCION
Modulo: imagina-ser-ocr-extractor.js
        |
        v
VALIDACION
Modulo/script: imagina-ser-real-quote-validation.js
Resultado: PASS
        |
        v
HECHOS EXTRAIDOS
- Prima: 3,222 UDI
- Suma asegurada: 75,000 UDI
- Base: 82,829 UDI / 390 UDI
- Favorable: 128,697 UDI / 606 UDI
- Desfavorable: 57,228 UDI / 270 UDI
        |
        v
CAPA DE EVIDENCIA
PDF gana sobre parser si hay discrepancia.
Estado actual: sin discrepancias en UDI principales.
        |
        v
CAPA DE MONEDA
Modulo: exchange-rate-cache-engine.js
Fuente: BANXICO_SIE_API/cache
UDI usada por Forge: $8.82994 MXN
        |
        v
CALCULO FORGE
Conversion actual:
UDI del PDF x $8.82994 MXN
        |
        v
RESULTADO FORGE
- Prima: $28,450.07 MXN
- Suma asegurada: $662,245.50 MXN
- Favorable renta: $5,350.94 MXN
- Favorable pago unico: $1,136,386.79 MXN
- No calcula acumulados 75/80
        |
        v
DICTAMEN
Coincide en UDI.
No coincide en MXN proyectados.
Veredicto: COINCIDE PARCIALMENTE.
```

## Puntos de control

### Extraccion

Forge extrae correctamente los valores UDI de la cotizacion Solucionline.

### Evidencia

Los reportes Forge usan valores respaldados por PDF para prima, suma asegurada y escenarios UDI.

### Proyeccion

Forge no replica la proyeccion MXN futura de Jorge.

### Causa

El calculo de Jorge contiene conversiones futuras implicitas de UDI/MXN.

### Riesgo

Alto si el asesor espera que Forge replique la presentacion humana en MXN.

### Resultado operativo

Forge necesita una capa adicional para representar:

- UDI actual.
- UDI futura por edad.
- Acumulados por edad.
- Diferencia entre conversion actual y proyeccion para presentacion.

