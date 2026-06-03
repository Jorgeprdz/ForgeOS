# Package Notes

## Forge AI Connector v0.1

- Runtime dependency for live AI calls: official `openai` SDK.
- Do not create or hardcode API keys in source files.
- `OPENAI_API_KEY` must be provided through the process environment.
- `FORGE_AI_MODEL` can override the default connector model.
- `dryRun: true` must continue to work without installing `openai`.
- No `package.json` has been created for this PAQ.
