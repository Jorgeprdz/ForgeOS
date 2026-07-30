# Post-fix local Pages artifact

The artifact is served beneath the project prefix:

`/ForgeOS/static-preview/forge-alive/`

The browser harness uses the same production modules with deterministic
local auth, prospect, Timeline and provider-error adapters. It clicks the
rendered controls and intercepts external WhatsApp navigation without
sending a message.

Required evidence is emitted by `tools/forge-ui-visual-diagnostic.mjs`:

- `combat-click-through.json`
- `nash-click-through.json`
- `whatsapp-click-through.json`
- `workspace-duplication-audit.json`
- viewport screenshots and telemetry

## Result

- Exact workflow artifact: `_site`
- Served URL: `http://127.0.0.1:4280/ForgeOS/static-preview/forge-alive/`
- Viewports: 412×915, 1024×768 and 1600×900
- Focused tests: 23 passed, 0 failed
- Page errors: 0
- Failed runtime requests: 0
- Console errors: 0
- Maximum simultaneous productive workspaces: 1
- Combat and NASH WhatsApp links were clicked with Playwright locators,
  intercepted, decoded and compared to the exact approved textarea value.
- Automatic WhatsApp navigation: no
- Real message sent: no
- Result: PASS
