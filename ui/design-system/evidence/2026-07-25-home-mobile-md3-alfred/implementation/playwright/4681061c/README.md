# Forge UI — Playwright responsive evidence

- Source commit: `4681061c`
- Playwright: `1.62.0`
- Node: `v26.5.0`
- Browser: `Chromium 150.0.7871.46 Arch Linux ARM`
- Result: **PASS**

## Viewports capturados

- Mobile: 390 × 844
- Tablet vertical: 800 × 1280
- Tablet horizontal: 1100 × 800
- Desktop: 1440 × 900
- Desktop amplio: 1920 × 1080

Cada formato incluye:

- viewport;
- página completa;
- Alfred abierto.

También se auditan los límites 759/760, 899/900 y 1199/1200 px.

La validación en dispositivo real sigue siendo autoridad para teclado virtual,
barras del sistema, safe areas y comportamiento específico de Samsung Browser.
