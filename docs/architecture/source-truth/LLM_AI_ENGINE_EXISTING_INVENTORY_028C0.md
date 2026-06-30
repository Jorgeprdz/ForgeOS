# LLM / AI Engine Existing Inventory 028C0

Phase: 028C0_LLM_AI_ENGINE_EXISTING_INVENTORY

Mode: READ ONLY DISCOVERY + DOCS ONLY INVENTORY

Status: AI_LLM_ENGINE_INVENTORY_DOCUMENTED

## Forge AI Principle

Forge decides.

Generative AI explains.

AI may:

- draft messages
- explain recommendations
- improve language

AI may not:

- invent products
- invent premiums
- invent coverage
- invent recommendations
- create payout truth
- create revenue truth
- create compensation truth
- bypass human approval

## Discovery Commands Used

- `git status --short --branch`
- `git log --oneline -24`
- `git ls-files | rg -i '(ai|llm|gpt|openai|anthropic|gemini|prompt|draft|message-generation|message|safety|validator|guardrail|completion|chat|model|connector|language|explain|recommendation)'`
- Targeted header/import/export/function inspection of AI/LLM-related modules with `rg` and `sed`.
- No provider/runtime command was executed.

## Discovery Summary

- AI/LLM/prompt/draft/message/safety/provider-related tracked paths discovered: 220.
- Primary operational AI/LLM candidate modules reviewed: 34.
- Modern Manager OS prompt/draft/safety modules found: 4.
- Legacy/root Forge AI connector and guardrail modules found: 3.
- Provider-call surfaces found: 2 primary candidates.
- Prompt builder modules found across root, Advisor OS, and Manager OS.
- Safety validator / guardrail modules found across Manager OS, Nash, Mick, Engagement, semantic guardrails, and Forge AI guardrails.
- No AI/LLM runtime was executed.
- No provider calls were made.
- No drafts/messages were generated.
- No implementation files were changed.

## AI/LLM engine inventory table

| File | Module / engine name | Probable capability | What it appears to do | Inputs observed | Outputs observed | Imports/dependencies observed | Tests observed | Classification | Runtime/provider-call risk | Draft-generation risk | Send/delivery risk | Financial invention risk | Recommendation invention risk | Human approval bypass risk | Safe future use | Boundary notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js` | Manager Message Prompt Builder Boundary | prompt builder boundary | Protects prompt-prep allowed/forbidden uses and false action/truth flags. | manager context, evidence/source/freshness, requested use | prompt boundary status, warnings, false flags | none beyond local helpers | `manager-message-prompt-builder-boundary-contract-master-test.js` | AI_SAFE_CONTEXT_REFERENCE | none observed | prompt only | none | low | low | blocks runtime/send/draft | Candidate for 028C docs sync and Human Approval Gate context | Prompt is not draft. |
| `manager-os/message-generation/manager-message-prompt-builder.js` | Manager Message Prompt Builder | prompt builder | Builds protected prompt instructions only. | managerContext, Nash context, purpose, audience, evidence/source/freshness | promptInstructions, warnings, false flags | prompt builder boundary | `manager-message-prompt-builder-master-test.js` | AI_SAFE_CONTEXT_REFERENCE | none observed | instruction only | none | low | low | human approval required | Candidate for 028C docs sync | Prompt instructions only; no LLM runtime. |
| `manager-os/message-generation/llm-draft-intake-boundary-contract.js` | LLM Draft Intake Boundary | draft intake | Receives future draft text as unapproved draft context only. | draftText, promptContext, evidence/source/freshness, requested use | intake status, draft context, false flags | none beyond local helpers | `llm-draft-intake-boundary-contract-master-test.js` | AI_SAFE_CONTEXT_REFERENCE | none observed | intake only | none | low | low | always human review | Primary 028C candidate | Draft intake is not LLM execution. |
| `manager-os/message-generation/message-safety-validator.js` | Message Safety Validator | safety validator | Detects pressure, shame, manipulation, unsupported claims, execution claims, missing evidence/source/freshness. | draft text, purpose, context, evidence/source/freshness | safety status, risks, revisions, safeForHumanReview, safeForSend false | none beyond local helpers | `message-safety-validator-master-test.js` | AI_SAFE_CONTEXT_REFERENCE | none observed | validates draft | none | protective | protective | cannot approve/send | Primary 028C candidate and Human Approval Gate input | Safety validation is not human approval. |
| `forge-ai-connector.js` | `runForgeAiConnector` | AI connector / provider adapter | Builds prompt, runs guardrails, optionally calls OpenAI Responses API when not dry-run. | structuredDecision, mode, tone, model, dryRun, API key | generatedText, prompt dryRun, errors, safety notes | `openai` dynamic require, prompt builder, guardrails | `forge-ai-connector-master-test.js` | AI_RUNTIME_RISK | high: OpenAI provider call possible | generates text | no direct send observed | guarded but risk exists | must not invent decision | no approval gate observed | Source material or future provider adapter behind boundary | Forge decides; connector must remain behind approval/safety gates. |
| `forge-ai-prompt-builder.js` | `buildForgeAiPrompt` | prompt builder | Converts structured decision into AI prompt instructions. | structuredDecision, mode, tone | instructions, input payload, safetyNotes | `forge-ai-guardrails-engine.js` | connector tests | AI_NEEDS_BOUNDARY_WRAPPER | no provider call itself | prompt for draft text | none | guarded instruction | prevents decision changes | no approval gate itself | Reference/wrapper candidate | Prompt builder must not become draft approval. |
| `forge-ai-guardrails-engine.js` | `runForgeAiGuardrails`, `validateGeneratedText` | guardrail | Blocks invented products and financial values against structuredDecision. | structuredDecision, generatedText, mode, tone | approved/errors/safetyNotes | none observed | connector tests | AI_SAFE_CONTEXT_REFERENCE | none | validates generated text | none | protective | protective | no approval gate itself | Candidate guardrail reference | Useful for 028C safety docs; not human approval. |
| `ai-service.js` | `AIService`, `callGemini` | provider adapter | Calls `/api/gemini`, caches responses, writes text to DOM element. | prompt, cacheKey, requestId, temperature, outputElementId | generated text, DOM text output | browser fetch, EventBus, DOM | none observed | AI_RUNTIME_RISK | high: provider route call | generated text | may surface output directly | unbounded prompt risk | recommendation invention risk | outputElement write can bypass review | Do not execute; future provider adapter review only | Runtime/provider-call surface. |
| `ai-context-engine.js` | `construirContextoIA` | AI context | Builds IA context from advisor/prospect inputs. | advisor/prospect context | AI context | none observed | none observed | AI_NEEDS_SOURCE_TRUTH_REVIEW | none observed | context only | none | depends on inputs | context can imply recommendation | no approval gate | Source material only | Context is not truth. |
| `ai-prompt-builder.js` | `construirPromptOutreach`, `construirPromptObjecion` | prompt builder | Builds outreach and objection prompts. | prospect/advisor context, objections | prompt text | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | prompt can lead to draft | none | unknown | may shape recommendations | no approval gate | Source material; wrapper required | Prompt is not draft. |
| `ai-sales-coach-engine.js` | `generarCoachingIA` | coaching/explanation | Generates AI coaching prompt/context. | advisor/coaching inputs | coaching IA output/prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | may generate coaching language | none | low | coaching recommendation risk | no approval gate | Wrapper only | Coaching is not punishment/ranking truth. |
| `adaptive-message-builder.js` | `construirPromptMensaje` | message/prompt builder | Builds adaptive message prompt. | message/person/context inputs | prompt/message candidate | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | message generation risk | no direct send | unknown | recommendation/message angle risk | no approval gate | Source material only | Message capability is not approved communication. |
| `adaptive-outreach-prompt-builder.js` | `construirPromptAcercamientoAdaptativo` | prompt builder | Builds adaptive outreach prompt. | prospect/outreach context | prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | prompt-to-draft risk | none | unknown | recommendation angle risk | no approval gate | Source material only | Requires prompt/draft/safety/human approval chain. |
| `ghosting-prompt-builder.js` | `construirPromptReactivacion` | prompt builder | Builds reactivation/ghosting prompt. | stale contact/context | prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | draft pressure risk | none | unknown | false urgency risk | no approval gate | Source material only | Must avoid pressure/shame. |
| `outreach-prompt-builder.js` | `construirPromptAcercamiento` | prompt builder | Builds outreach prompt. | outreach context | prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | draft risk | none | unknown | recommendation risk | no approval gate | Source material only | Prompt is not draft. |
| `introduction-message-engine.js` | `construirPromptIntroduccion` | message/prompt builder | Builds introduction message prompt. | introduction context | prompt/message candidate | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | message generation risk | none | unknown | recommendation risk | no approval gate | Source material only | Draft is not approved communication. |
| `advisor-os/conversation/ai-first-contact-message-engine.js` | `construirPromptPrimerContactoIA` | message generator/prompt | Builds first-contact AI prompt/message. | advisor/prospect context | prompt/message candidate | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | first-contact message risk | possible downstream delivery risk | unknown | recommendation/invented context risk | no approval gate | Advisor OS source material only | Advisor OS owns advisor-facing context. |
| `advisor-os/conversation/first-contact-ai-suggestion-engine.js` | `sugerirSiguienteMovimiento` | recommendation explainer | Suggests next movement/action. | conversation/prospect context | suggested next move | none observed | none observed | AI_NEEDS_SOURCE_TRUTH_REVIEW | none observed | none direct | action risk | low | next-action invention risk | no approval gate | Source material only | Recommendation is not execution. |
| `advisor-os/conversation/objection-prompt-builder.js` | `construirPromptObjecion` | prompt builder | Builds objection response prompt. | objection/context | prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | objection response risk | none | product/claim risk | manipulation risk | no approval gate | Source material only | Nash Combat support is not manipulation. |
| `advisor-os/prospecting/close-prompt-builder.js` | `construirPromptCierre` | prompt builder | Builds closing prompt. | prospecting/close context | prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | close draft risk | none | unsupported claim risk | pressure/manipulation risk | no approval gate | Source material only | Closing support must remain human-reviewed. |
| `advisor-os/referrals/referral-ai-followup.js` | `generarPromptFollowup` | prompt builder | Generates referral follow-up prompt. | referral/follow-up context | prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | referral message risk | none | unknown | pressure risk | no approval gate | Source material only | Referral context must not pressure. |
| `advisor-os/referrals/referral-prompt-builder.js` | `construirPromptReferido` | prompt builder | Builds referral prompt. | referral context | prompt | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | referral draft risk | none | unknown | pressure risk | no approval gate | Source material only | Human approval required. |
| `nash-message-recommendation-engine.js` | `buildMessageRecommendation` | message generator | Builds first/follow-up messages, nextBestAction, product affinity. | Nash context/council | message strings, next action | none observed | Nash tests observed in 005A | AI_LEGACY_DO_NOT_EXECUTE | no provider call | high message generation risk | no direct send | product affinity risk | nextBestAction invention risk | no approval gate | Legacy source material only | Message recommendation is not message send. |
| `policy-operations/evidence/policy-ai-parser.js` | `parsearTextoPoliza` | parser / AI-labeled extraction | Parses policy text for client/product/premium/policy number. | policy text | extracted policy fields | none observed | none observed | AI_NEEDS_SOURCE_TRUTH_REVIEW | none observed | none | none | premium/product extraction risk | low | no approval gate | Source material only | Extracted policy facts require evidence review. |
| `policy-operations/policy-detail/policy-ai-insights-engine.js` | `generarInsightsIA` | explanation/insights | Generates policy AI insights. | policy context | insight text | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | insight text risk | none | policy/financial claim risk | recommendation risk | no approval gate | Source material only | Insights are not policy truth. |
| `policy-operations/tasks/ai-task-suggestion-engine.js` | `generarSugerenciasIA` | recommendation explainer/task suggestion | Generates AI task suggestions. | policy/task context | suggestions | none observed | none observed | AI_RUNTIME_RISK | none observed | none | task creation risk if connected | low | task recommendation risk | no approval gate | Future Human Approval Gate candidate | Task suggestion is not task execution. |
| `rule-packs/smnyl/smnyl-ai-coach-engine.js` | `generarCoaching` | coaching/explanation | Generates SMNYL coach guidance. | rule-pack/advisor context | coaching text | none observed | none observed | AI_NEEDS_SOURCE_TRUTH_REVIEW | none observed | coaching language | none | rule-pack claim risk | coaching recommendation risk | no approval gate | Source material only | Rule Pack truth must remain separate from AI language. |
| `rule-packs/smnyl/smnyl-ai-presence-engine.js` | `construirPresenciaIA`, `generarMensaje` | message/presence | Builds AI presence and generates message. | SMNYL/advisor context | message | none observed | none observed | AI_NEEDS_BOUNDARY_WRAPPER | none observed | message generation risk | none | rule-pack claim risk | recommendation risk | no approval gate | Source material only | Message output is not approved communication. |
| `product-intelligence/knowledge/imagina-ser-human-language-engine.js` | explanation helpers | explanation engine | Translates Imagina Ser terms into human language. | product terms | explanations | none observed | none observed | AI_SAFE_CONTEXT_REFERENCE | none | no draft | none | product explanation risk if stale | low | no approval gate | Reference with product evidence boundary | Product truth comes from documentation. |
| `shared-client-language-engine.js` | `translateClientLanguage` | explanation engine | Translates terms into client language. | term | client language | none observed | none observed | AI_SAFE_CONTEXT_REFERENCE | none | no draft | none | low | low | no approval gate | Reference only | Language simplification, not source truth. |
| `shared-human-financial-language-engine.js` | `explainFinancialReturn` | explanation engine | Formats/explains financial return terms. | financial values/context | explanation | none observed | none observed | AI_NEEDS_SOURCE_TRUTH_REVIEW | none | no draft | none | financial explanation risk | low | no approval gate | Reference only after evidence review | Financial language must not invent values. |
| `src/intelligence/semantic-guardrails/human-acceptance-gate.js` | human acceptance gate | guardrail / approval-adjacent | Provides semantic acceptance gate. | candidate semantic input | acceptance/guardrail result | local modules not inspected deeply | semantic guardrail tests | AI_SAFE_CONTEXT_REFERENCE | none | none | approval-adjacent | protective | protective | candidate for Human Approval Gate | Candidate only; not current Manager OS approval gate. |
| `src/intelligence/semantic-guardrails/semantic-candidate-guardrail.js` | semantic candidate guardrail | guardrail | Evaluates semantic candidate safety. | semantic candidate | guardrail result | local modules | `semantic-candidate-guardrail.test.js` | AI_SAFE_CONTEXT_REFERENCE | none | none | none | protective | protective | Human Approval Gate support | Guardrail is not human approval. |

## Prompt builder modules

- `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js` - safe modern boundary.
- `manager-os/message-generation/manager-message-prompt-builder.js` - safe modern prompt-instruction builder.
- `forge-ai-prompt-builder.js` - legacy/root prompt builder; wrapper-required.
- `ai-prompt-builder.js` - legacy/root prompt builder; wrapper-required.
- `adaptive-outreach-prompt-builder.js` - adaptive outreach prompt builder; wrapper-required.
- `ghosting-prompt-builder.js` - reactivation prompt builder; wrapper-required because pressure/shame risk.
- `outreach-prompt-builder.js` - outreach prompt builder; wrapper-required.
- `advisor-os/conversation/objection-prompt-builder.js` - objection prompt builder; wrapper-required.
- `advisor-os/prospecting/close-prompt-builder.js` - close prompt builder; wrapper-required.
- `advisor-os/referrals/referral-prompt-builder.js` - referral prompt builder; wrapper-required.

Boundary:

- Prompt is not draft.
- Prompt generation is not draft approval.
- Prompt generation is not message send.

## Draft/message generation modules

- `manager-os/message-generation/llm-draft-intake-boundary-contract.js` - safe draft intake boundary; receives draft context only.
- `adaptive-message-builder.js` - message/prompt builder; wrapper-required.
- `introduction-message-engine.js` - introduction message prompt; wrapper-required.
- `advisor-os/conversation/ai-first-contact-message-engine.js` - Advisor OS first-contact prompt/message surface; wrapper-required.
- `advisor-os/referrals/referral-ai-followup.js` - referral follow-up prompt; wrapper-required.
- `nash-message-recommendation-engine.js` - legacy message recommendation; do not execute directly.
- `rule-packs/smnyl/smnyl-ai-presence-engine.js` - message generation risk; wrapper-required.

Boundary:

- Draft is not approved communication.
- Message recommendation is not message send.
- Human approval remains mandatory.

## Safety validator / guardrail modules

- `manager-os/message-generation/message-safety-validator.js` - safe modern message safety validator.
- `forge-ai-guardrails-engine.js` - useful guardrail for invented product and financial values.
- `nash/context-intake/nash-manager-safe-language-guardrail-intake.js` - Nash safe language guardrail.
- `mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js` - Mick no-surveillance guardrail.
- `engagement/context-intake/engagement-manager-dignity-guardrail-intake.js` - dignity/private motivation guardrail.
- `src/intelligence/semantic-guardrails/human-acceptance-gate.js` - approval-adjacent candidate.
- `src/intelligence/semantic-guardrails/semantic-candidate-guardrail.js` - semantic guardrail candidate.

Boundary:

- Safety validation is not human approval.
- Guardrails may block, flag, or request review. They must not approve send.

## LLM/provider connector modules

- `forge-ai-connector.js` - can call OpenAI Responses API when API key and non-dry-run input are present; runtime-risk.
- `ai-service.js` - can call `/api/gemini`, cache generated responses, and write text into DOM; runtime-risk.

Boundary:

- Provider connector exists does not mean provider runtime is approved.
- No provider calls were executed in this phase.
- Future provider use requires explicit runtime, safety, human approval, and delivery boundaries.

## Explanation-only modules

- `product-intelligence/knowledge/imagina-ser-human-language-engine.js`
- `shared-client-language-engine.js`
- `shared-human-financial-language-engine.js`
- `partner-advisor-qualification-explainability-engine.js` as compensation-adjacent explanation, not payout truth.

Boundary:

- Explanation is not source truth.
- Financial explanation must not invent values.
- Product explanation must come from documentation.

## Runtime-risk modules

- `forge-ai-connector.js` - OpenAI provider call possible.
- `ai-service.js` - Gemini route call and DOM output possible.
- `policy-operations/tasks/ai-task-suggestion-engine.js` - task suggestion can be mistaken for task execution.
- `nash-message-recommendation-engine.js` - message generation and next-best-action risk.

## Legacy / do-not-execute modules

- `nash-message-recommendation-engine.js`
- direct legacy root prompt/message builders where no evidence/source/freshness/human approval boundary exists
- provider connectors when used outside explicit approved runtime gates

## Candidate modules for 028C docs sync

- `manager-os/message-generation/llm-draft-intake-boundary-contract.js`
- `manager-os/message-generation/message-safety-validator.js`
- `manager-os/tests/llm-draft-intake-boundary-contract-master-test.js`
- `manager-os/tests/message-safety-validator-master-test.js`
- `manager-os/message-generation/manager-message-prompt-builder.js`
- `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js`

## Candidate modules for Human Approval Gate

- `manager-os/message-generation/message-safety-validator.js`
- `manager-os/message-generation/llm-draft-intake-boundary-contract.js`
- `src/intelligence/semantic-guardrails/human-acceptance-gate.js`
- `src/intelligence/semantic-guardrails/semantic-candidate-guardrail.js`
- `forge-ai-guardrails-engine.js`
- `policy-operations/tasks/ai-task-suggestion-engine.js` only as future task-suggestion context, not execution.

## Boundary wrappers needed

1. AI Provider Runtime Boundary
2. Legacy Prompt Builder Boundary
3. Legacy Message Generator Boundary
4. AI Financial/Product Claim Guardrail Wrapper
5. Human Approval Gate Contract
6. Delivery Adapter Boundary
7. Task/Calendar Suggestion No-Execution Wrapper
8. Provider Output Evidence/Freshness Envelope

## Open questions before 028C

1. Should 028C document Manager OS draft intake and safety validator as implemented pending docs sync while keeping provider connectors out of scope?
2. Should `forge-ai-connector.js` remain parked until Human Approval Gate and provider runtime boundary exist?
3. Should `ai-service.js` be classified as legacy runtime-risk because it writes provider output into the DOM?
4. Should Human Approval Gate consume only `safeForHumanReview` outputs and still keep `safeForSend=false` until delivery layers are scoped?
5. Should legacy prompt builders be source material only for tone/patterns after safety validator and prompt builder boundaries?

## What Forge Learned

- Forge already has modern Manager OS prompt, draft intake, and safety validator boundaries.
- Forge also has older AI/provider/prompt/message modules that can generate or display text without the newer approval gates.
- The modern Manager OS message-generation chain is the safest candidate for 028C closure.

## Appendix: 028C Consumption

028C consumed this inventory as source-truth input for the LLM Draft Intake and Message Safety Validator docs sync.

- The modern Manager OS path was selected for docs closure:
  - `manager-os/message-generation/manager-message-prompt-builder.js`
  - `manager-os/message-generation/llm-draft-intake-boundary-contract.js`
  - `manager-os/message-generation/message-safety-validator.js`
- Provider connectors remain runtime-risk:
  - `forge-ai-connector.js`
  - `ai-service.js`
- Legacy generators remain source material only:
  - `nash-message-recommendation-engine.js`
  - root/advisor prompt and message builders without the modern evidence/source/freshness/human-approval boundary
- Human Approval Gate remains the next required layer before delivery/send can be scoped.
- Provider connectors are runtime-risk and must not be executed or treated as approval.
- Human Approval Gate should consume validated draft context, not raw provider output.

## Forge Council Review

- Miranda: This makes Forge better because it prevents old AI modules from being mistaken for approved runtime.
- Arqui Juve: Architecture is clearer when provider adapters, prompt builders, draft intake, safety validation, and approval are separate.
- Joy Mangano: Real utility improves by identifying what can help language and what could confuse users.
- Nash: Conversation support remains useful only when AI does not invent intent or send messages.
- Mick: Behavior context must not become surveillance or automated coaching language.
- Patch Adams: Trust is preserved because drafts and AI text remain unapproved until human review.
- Chris Gardner: Prospecting support improves only when AI helps language without replacing execution judgment.
- Rocky: Consistency improves by routing future AI use through repeatable safety gates.
- Nicky Spurgeon: Referral/networking language must remain ethical and human-approved.
- Jordan Belfort: Conversion support must avoid manipulation, pressure, and invented claims.
- Jurgen Klaric: Psychology may improve clarity, but must not become coercion.

Council review is advisory only and does not override Constitution, ADRs, tests, evidence, or source-truth boundaries.
