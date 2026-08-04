# Alfred Command Connection 001

## Status

- `STATUS=IMPLEMENTED_ON_BRANCH`
- `RUNTIME=AUTHENTICATED_READ_ONLY`
- `PROVIDER=GEMINI_WITH_DETERMINISTIC_FALLBACK`
- `HUMAN_APPROVAL_REQUIRED=YES`
- `CRM_MUTATION=NO`
- `MESSAGE_SEND=NO`
- `CALENDAR_WRITE=NO`
- `TASK_WRITE=NO`
- `MEMORY_PERSISTENCE=NO`

## Connected controls

- Alfred suggestion buttons
- send arrow
- Enter key
- follow-up suggestion buttons
- authenticated profile command `/jorge`

## Context boundary

Alfred receives only the authenticated display name, the currently visible route text, bounded UI state and a short in-memory conversation history. The history is cleared when authentication changes and is never stored in browser persistence.

## Deployment boundary

The browser runtime and Edge Function are prepared on the feature branch. Production requires controlled merge, Supabase Edge Function deployment and GitHub Pages deployment.
