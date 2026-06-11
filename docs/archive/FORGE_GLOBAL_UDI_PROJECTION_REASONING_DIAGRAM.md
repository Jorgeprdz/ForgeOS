# Diagrama de Razonamiento: Proyección UDI Global 4.5%

```text
Banxico SIE API
↓
UDI actual verificada
USD/MXN FIX verificado
↓
Forge Market Data Cache
↓
Motores de proyección financiera
```

```text
Valor UDI actual
↓
Aplicar tasa global fija 4.5% anual compuesta
↓
UDI proyectada por año
↓
Valor actuarial del producto en UDI
↓
Conversión nominal futura a MXN
↓
Etiqueta de estimación no garantizada
```

```text
Producto
↓
Tabla actuarial / cotización / PDF / Excel
↓
Aportaciones por año
Beneficios por año
Rescate o retiro por año
Mensualidades o pago único
↓
shared-policy-currency-timeline-engine.js
↓
UDI proyectada 4.5%
↓
MXN nominal por año
↓
Total nominal acumulado
```

```text
Imagina Ser
↓
imagina-ser-ocr-extractor.js
↓
quoteFacts
↓
imagina-ser-future-mxn-bridge.js
↓
retirement-future-udi-projection-engine.js
↓
4.5% global
↓
Pago único / mensualidad / acumulados
```

```text
ORVI
↓
orvi-guaranteed-value-timeline-engine.js
↓
orvi-mxn-conversion-engine.js
↓
4.5% global
↓
Valores garantizados UDI convertidos a MXN estimado
```

```text
Vida Mujer
↓
vida-mujer-survival-schedule-engine.js
↓
Beneficios de supervivencia UDI
↓
4.5% global
↓
MXN por año de pago
```

```text
SeguBeca
↓
market-data-master-test.js
↓
Prima anual UDI
↓
4.5% global
↓
Prima futura estimada MXN
```

```text
Nuevo Plenitud
↓
Fuente no detectada en Hoja de trabajo.xlsx
↓
No inventar valores
↓
Esperar tabla actuarial verificable
```

```text
Control de seguridad
↓
No UI
No Build Tree
No schemas
No GMM
No claims
No coverage engines
↓
Solo motores de proyección financiera UDI
```
