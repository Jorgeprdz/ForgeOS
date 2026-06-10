# FORGE_CONSTITUTION_V3.md

*(All principles are drawn from the repository, the earlier analyses, and the explicit constitutional input supplied by the user.  Each item is tagged with its source: `[Repository]`, `[Constitutional]`, or `[Repository + Constitutional]`.)*

---

## 1. Project Identity

| Statement | Source |
|-----------|--------|
| **Forge OS is a decision‑intelligence platform for financial advisors.** It aggregates conversation, relationship, product, and policy data to surface *actionable* recommendations. | `[Repository]` – `AGENTS.md` Vision & engine naming (`nash‑master‑intelligence‑engine.js`, `relationship‑master‑engine.js`). |
| **Forge OS is *not* a generic CRM, a chatbot, nor an OCR application.** Its purpose is intelligence, not data entry or raw image extraction. | `[Repository]` – Repeated statements in `AGENTS.md` and the “What Forge is not” clause in the user‑provided rules. |
| **Forge OS is *not* a number‑extraction system.** Numbers without product meaning are insufficient. | `[Constitutional]` – “Product Semantics > Number Extraction”. |
| **Forge OS treats user data as private and product knowledge as shared.** The two knowledge domains never mix. | `[Constitutional]` – “Shared Knowledge, Private Data”. |

---

## 2. Mission

> Enable advisors to make *clear, profitable decisions* that increase sales, retain clients, generate referrals, and improve client experiences.

*Derived from the “Advisor First” stance and the Prime Directives that emphasize revenue impact.*

**Source:** `[Repository + Constitutional]` – `AGENTS.md` Mission, Prime Directive 4, and explicit “Advisor First”.

---

## 3. Vision

- Build the **operating layer** for advisor productivity and commercial intelligence.
- Provide **real‑time, actionable insight** that translates data into the next best action.
- Ensure every engine output is **action‑oriented**, **transparent**, and **testable**.

**Source:** `[Repository]` – Vision section of `AGENTS.md` and the architecture of the NASH and Relationship engines.

## Constitutional Vision Statement

Forge OS does not aspire to become the best CRM for advisors.

Forge OS aspires to become:

"The Best Advisor for Advisors."

This statement is now considered a constitutional-level principle.

**Meaning:**
- Forge exists to augment advisors.
- Forge exists to help advisors make better decisions.
- Forge exists to help advisors sell more, retain more clients, generate more referrals, and create better client experiences.
- Forge should transform information into judgment, recommendations, and action.
- Every feature, engine, workflow, recommendation, report, dashboard, and intelligence layer should be evaluated against a single question:

"Does this help Forge become the best advisor an advisor can have?"

If the answer is no, the feature should be questioned.

---

## 4. Prime Directives

| Directive | Description | Source |
|-----------|-------------|--------|
| **Decision Clarity First** | Every output must answer *what it means*, *what options exist*, and *what should happen next*. | `[Repository + Constitutional]` – Decision‑Intelligence First (repo) + explicit “Decision Clarity First”. |
| **Intelligence Must Lead To Action** | Raw information is useless; all intelligence engines must culminate in a concrete recommendation (who to contact, what risk, next best action). | `[Repository + Constitutional]` – Decision‑Intelligence First (repo) + explicit “Intelligence Must Lead To Action”. |
| **Advisor First** | The advisor is the primary customer; the manager is secondary and exists to help develop the advisor. The system augments—*does not replace*—the advisor. | `[Repository + Constitutional]` – Advisor‑Centric Empowerment (repo) + explicit “Advisor First”. |
| **Value Before Work** | Forge should create clear value before asking for manual capture, setup, configuration, or effort. Requested data must enable a decision or action. | `[Constitutional]`. |
| **Learning By Doing** | Learning is measured by completed behavior, repeated execution, and reduced friction, not by screens viewed. | `[Constitutional]`. |
| **Economic Clarity** | Commercial metrics should translate into money earned, money potential, or money at risk when explicit data and confirmed rules support it. | `[Constitutional]`. |
| **No Invented Data** | The system never fabricates products, benefits, rates, or assumptions. Missing evidence must be reported as uncertainty. | `[Constitutional]`. |
| **No Projection Without Explicit Rates** | Future value projections are allowed only when rates are known and calculations reproducible; otherwise the projection stays unknown. | `[Constitutional]`. |
| **Product Semantics > Number Extraction** | Understanding *what a product means* precedes any numeric handling; numbers alone are insufficient. | `[Constitutional]`. |
| **Production Events Principle** | Production Events are facts; Career, Contest, Compensation, Conservation, and Manager Intelligence are rule-based interpretations of those facts. | `[Constitutional]`. |
| **Every Feature Must Improve Sales Capability** | Before a feature is approved, it must demonstrably help advisors sell more, retain clients, generate referrals, make better decisions, or improve client experience. | `[Repository + Constitutional]` – Strategic Prioritization by Revenue Impact (repo) + explicit “Every Feature Must Improve Sales Capability”. |
| **The Best Advisor for Advisors** | Forge should continuously evolve toward becoming the best advisor an advisor can have. | `[Constitutional]` |

---

## 5. Business Directives

| Directive | Description | Source |
|-----------|-------------|--------|
| **Revenue‑Impact Prioritization** | Work is prioritized by its measurable impact on advisor revenue, retention, or referrals. | `[Repository + Constitutional]`. |
| **Value Measured by Advisor Revenue Growth** | Success metrics are expressed as % increase in advisor sales (target +50 %). | `[Repository]` – Prime Directive 4. |
| **Compliance‑First Data Governance** | All data handling follows documented privacy, retention, and audit policies (see Data Governance Principles). | `[Repository]` – “Do not add external APIs” & “Compliance‑First Mentality” (known gaps). |
| **Continuous Improvement Loop** | Engines produce coaching, manager, and team insights that feed back into product refinement. | `[Repository]` – Council roles (Coaching Insight, Manager Alert, Team Intelligence). |

---

## 6. Product Directives

| Directive | Description | Source |
|-----------|-------------|--------|
| **Advisor‑Controlled Automation** | Engines suggest actions but the advisor retains final decision authority. | `[Repository]` – Output objects contain `advisorInsight`. |
| **Rule‑Based Transparency** | All logic is deterministic, rule‑based, and free of hidden AI models. | `[Repository + Constitutional]`. |
| **Confidence Scoring & Uncertainty Communication** | Every recommendation includes a `confidence` value; low confidence triggers explicit uncertainty statements. | `[Repository]` – `confidence` field in master engines. |
| **Heuristics Rationale Documentation** | Hard‑coded regexes and lookup tables must be accompanied by rationale comments (future documentation). | `[Repository]` – Presence of extensive pattern lists. |
| **Shared Knowledge vs. Private Data Separation** | Product knowledge resides in a shared library; user‑specific data stays isolated. | `[Constitutional]`. |
| **No OCR/Number‑Extraction‑Only Processing** | OCR is allowed only as a *pre‑processing* step; downstream logic must attach product meaning. | `[Constitutional]`. |
| **Best Advisor for Advisors** | All product features must be assessed for how they help Forge be the best advisor for advisors. | `[Constitutional]` |
| **Benvenù Principle** | The first Forge experience must create adoption and signal that Forge is not another CRM; it must not be a form, PDF, corporate tutorial, or training flow. | `[Constitutional]`. |
| **Clippy Principle** | Contextual help must be non-invasive, non-interruptive, relevant, and withdrawn when the advisor has learned. | `[Constitutional]`. |
| **Candy Crush Experience Principle** | Forge adapts learning, discovery, goals, coaching, and complexity to the advisor's current level: never so hard that it causes abandonment, never so easy that it creates complacency. | `[Constitutional]`. |
| **No Invented Data** | (Repeated for emphasis under product scope). | `[Constitutional]`. |

---

## 7. Architecture Directives

| Directive | Description | Source |
|-----------|-------------|--------|
| **Modular Micro‑Engine Pattern** | Each concern lives in a small, focused engine (`*-engine.js`) aggregated by a master orchestrator (`*-master‑engine.js`). | `[Repository]`. |
| **Mixed‑Module Compatibility Policy** | New code uses CommonJS; legacy code may use ESM. Both coexist without conversion. | `[Repository]`. |
| **Deterministic Build‑Time Only** | No runtime calls to external services; all dependencies are local and version‑pinned. | `[Repository]`. |
| **Local JSON Persistence for Memory** | NASH memory is stored in `/nash‑memory/` JSON files and treated as the sole state store. | `[Repository]`. |
| **Incremental, Test‑Driven Delivery** | Every change must pass its dedicated `*-master‑test.js` before committing. | `[Repository]`. |
| **Weighted Ensemble Scoring (Undocumented Schema)** | Master engines compute a unified `confidence` by weighting sub‑engine outputs (policy pending documentation). | `[Repository]`. |
| **Continuous Improvement Loop** | Feedback from coaching/manager alerts is fed back into engine refinement. | `[Repository]`. |

---

## 8. Product Intelligence Principles

| Principle | Description | Source |
|-----------|-------------|--------|
| **Decision‑Intelligence First** | All product processing strives to produce a concrete recommendation, not just raw data. | `[Repository + Constitutional]`. |
| **Rule‑Based Determinism** | Product‑intelligence engines are fully deterministic; no stochastic AI components. | `[Repository]`. |
| **Confidence‑Based Uncertainty** | Recommendations include a confidence metric; uncertainty is explicitly reported. | `[Repository]`. |
| **No Number Extraction Without Meaning** | Numbers are only useful when mapped to product semantics. | `[Constitutional]`. |
| **No Invented Product Data** | All product attributes must be derived from source documents; missing data = explicit unknown. | `[Constitutional]`. |

---

## 9. Advisor Experience Principles

| Principle | Description | Source |
|-----------|-------------|--------|
| **Advisor‑Centric Empowerment** | The system augments the advisor, never replaces human judgment. | `[Repository + Constitutional]`. |
| **Empathetic Interaction Philosophy** | UI/UX should convey warmth, rapport, and respect (Patch Adams, Hitch roles). | `[Repository]`. |
| **Advisor‑First Design** | The advisor is the primary customer; UI flows prioritize advisor efficiency. | `[Constitutional]`. |
| **Value Before Work** | Advisor flows should produce value before requesting effort, capture, or configuration. | `[Constitutional]`. |
| **Learning By Doing** | Advisor learning is proven by behavior and task completion, not exposure to educational screens. | `[Constitutional]`. |
| **Progressive Discovery** | Forge capabilities should be revealed in context as they become useful, not dumped into a traditional onboarding path. | `[Constitutional]`. |
| **Contextual Help** | Help appears only when useful, never blocks commercial work, and is suppressed when already learned. | `[Constitutional]`. |
| **Adaptive Difficulty** | Forge should reduce complexity during frustration and increase challenge during progress. | `[Constitutional]`. |
| **Best Advisor for Advisors** | Evaluate every change against the constitutional vision of becoming the best advisor for advisors. | `[Constitutional]` |

---

## 10. Data Governance Principles

| Principle | Description | Source |
|-----------|-------------|--------|
| **Privacy‑First** – User data is owned by the user and never mixed with shared product knowledge. | `[Constitutional]`. |
| **Compliance‑First Mentality** – No external API calls; all processing stays within the trusted codebase. | `[Repository]`. |
| **No Invented Data** – The system never fabricates missing product or rate information. | `[Constitutional]`. |
| **Explicit Rate Requirement for Projections** – Projections only when rates are known and assumptions documented. | `[Constitutional]`. |
| **Local JSON as Trusted Persistence** – NASH memory stored locally and protected by repository‑level access controls. | `[Repository]`. |

---

## 11. Workflow

1. **Analyze** – Examine requirements and existing code.
2. **Propose** – Draft a design or change.
3. **Approve** – Forge Council reviews and signs off.
4. **Implement** – Write code respecting the directives.
5. **Test** – Run the engine‑specific `*-master‑test.js`.
6. **Commit** – Stage only changed files; write a clear commit message.
7. **Push** – After final council sign‑off.

*All steps are defined in `AGENTS.md`.*

**Source:** `[Repository]`.

---

## 12. Testing Philosophy

- **One master test per engine** (`*-master-test.js`).
- **Test‑first mindset** – No code is merged without its test passing.
- **Deterministic expectations** – Tests must produce the same results on every run.

**Source:** `[Repository]`.

---

## 13. Decision Framework

Every engine output, UI report, or recommendation must answer the three questions from the **Decision Clarity First** directive:
1. **What does this mean?** – Clear interpretation of the data.
2. **What options exist?** – Enumerated possible actions or decisions.
3. **What should happen next?** – Concrete next‑best‑action guidance, backed by confidence.

**Source:** `[Constitutional]` (Decision Clarity First) & `[Repository]` (engine outputs).
- Before approving any feature, ask: "Does this move Forge closer to becoming the best advisor for advisors?"

---

## 14. Forge Council

- **Miranda** – Quality, priority, product discipline.
- **Nash** – Conversation intelligence, intent, next best action.
- **Joy Mangano** – Business value, real‑world usefulness.
- **Arqui Juve** – Architecture, scalability, maintainability.
- **Jurgen Klaric** – Behavioral psychology, buying motivation.
- **Jordan Belfort** – Sales conversion, persuasion.
- **Hitch** – Rapport, warm openings.
- **Patch Adams** – Empathy, human safety.
- **Chris Gardner** – Execution, prospecting discipline.
- **Rocky** – Consistency, resilience.
- **Mick** – Coaching, skill improvement.
- **Nicky Spurgeon** – Networking, referrals.

*Described in `AGENTS.md`.*

**Source:** `[Repository]`.

---

## 15. Current Project Snapshot

| Subsystem | Status | Key Files | Tests |
|-----------|--------|-----------|-------|
| **NASH (Conversation Intelligence)** | Mature – multiple engines integrated; master orchestrator exists. | `nash‑master‑intelligence‑engine.js`, `nash‑intent‑engine.js`, … | `nash‑intent‑engine‑master‑test.js`, etc. |
| **Relationship Intelligence** | Mature – timeline, opportunity, health, referral engines present. | `relationship‑master‑engine.js`, `relationship‑next‑action‑engine.js` | `relationship‑next‑action‑master‑test.js`, etc. |
| **Product Intelligence** | Functional – OCR/quote ingestion, product detection. Mixed module style (ESM + CJS). | `product‑detection‑engine.js`, `policy‑ocr‑engine.js` | `product‑detection‑master‑test.js` (requires local PDFs). |
| **Policy & Sales Operations** | In‑progress – “Policy Renewal” marked *building*. | `policy‑renewal‑engine.js` (partial) | No master test yet. |
| **Shared Libraries** | Stable – AVE, CLP utilities. | `forge‑shared‑ave‑master‑test.js`, `shared‑clp‑master‑test.js` | Tests present. |
| **Build Tree** | Up‑to‑date `FORGE_MASTER_BUILD_TREE.md` reflects status. | — | — |

**Source:** `[Repository]` – file listings, test files, and build‑tree status.

---

## 16. Known Risks

| Risk | Why it matters | Current evidence |
|------|----------------|------------------|
| **Missing Data‑Governance Documentation** | Legal/regulatory exposure in finance. | No `DATA_GOVERNANCE.md`; only implicit policies in `AGENTS.md`. |
| **Undocumented Weighted Scoring Scheme** | Inconsistent confidence values across engines. | `confidence` field present but weighting matrix absent. |
| **Mixed Module System (CJS/ESM) Complexity** | Build failures when new contributors choose the wrong module style. | Listed in “Known Gaps” of `AGENTS.md`. |
| **Product Heuristics Rationale Not Recorded** | Future maintainers may replace regexes arbitrarily. | Large hard‑coded pattern lists with no comments. |
| **Incomplete Test Coverage for New Features** | Risk of regressions in untested paths. | Some engines (e.g., Policy Renewal) lack master tests. |
| **Potential Drift from Advisor‑First Philosophy** | Features could become automation‑centric. | No explicit checklist linking new UI changes to “Advisor First”. |

**Source:** `[Repository]` (risk sections, test inventory, code patterns).

---

## 17. Constitution Amendment v1.1 - Ratified Principles

Forge Constitution Amendment v1.1 is ratified as constitutional doctrine.

Full text:
`docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md`

The amendment formalizes the discoveries from Foundation Lock, Shared Commercial Model, Compensation Intelligence, Advisor Experience, Forecast Intelligence and Business Planning Intelligence.

### Capture Once Principle

Forge must become the primary operational source. No user should capture the same data twice. If Forge can infer, import, extract or derive a reliable data point, Forge must not request duplicate manual capture.

Excel files, PDFs, institutional formats and reports are derived views or evidence. They are not competing systems of record.

### Forecasts Are Suggestions, Facts Are Facts

Forge must clearly separate facts, metrics, forecasts, interpretations and recommendations.

A forecast helps make decisions. It is not a guarantee, not confirmed production, not confirmed income and not confirmed qualification.

### Business Planning Principle

Forge must convert goals into executable plans.

Approved planning chain:

```text
Goal
Forecast
Gap
Actions
```

Planning must be based on historicals, current pipeline, installed capacity, observed behavior and active rules. It must not be based on arbitrary estimates.

### Economic Clarity Extension

Commercial gaps should translate into economic impact when sufficient evidence exists.

Forge may explain:

- Income potential
- Expected income
- Income at risk

Forge must not invent values. Uncertainty must be explicit.

### Causal Clarity Principle

Forge must explain the causal chain that connects action to result whenever possible.

The advisor should understand why an action matters, not only what to do.

### Learning Through Reasoning Principle

Reading does not imply learning. Understanding implies learning.

Forge must favor comprehension, reflection and reasoning over passive consumption. Learning is measured by observable behavior and observable understanding, not by exposure.

### Advisor Development Principle

Forge must not only produce better outcomes. It must help develop better advisors, managers and partners.

The intelligence of the system should transfer progressively to the user. The goal is growth, not dependency.

### Rule Pack Separation Principle

Forge Core contains universal primitives.

Rule Packs contain interpretations specific to a carrier, distribution channel, commercial model, contest, compensation plan, career system, promotion path, KPI framework, activity model or recognition structure.

SMNYL Agency 2026 is the first validated Rule Pack. It is not Forge Core.

Canonical hierarchy:

```text
Carrier
Distribution Channel
Rule Pack
Rules
```

Production Events are facts. Rule Packs interpret facts.

Forge Core never hardcodes carrier-specific groups, bonuses, contests, careers, promotions, compensation formulas, conservation formulas, KPI names, activity rules or recognition rules.

---

## 18. Constitutional Amendments Process

1. **Propose Amendment** – Any contributor submits a markdown change to `FORGE_CONSTITUTION_V3.md` in a feature branch.
2. **Council Review** – The Forge Council evaluates the proposal against existing directives and business goals.
3. **Approve / Reject** – Majority vote (≥ 2/3 of council members) plus a passing automated test (if applicable).
4. **Commit** – After approval, the change is merged to `main`.
5. **Communicate** – The updated constitution is posted to the project wiki and a notification sent to all contributors.

*All steps follow the workflow defined in Section 11.*

---

---

# CONSTITUTION_HISTORY

| Document | Classification | Purpose |
|----------|----------------|---------|
| `FORGE_ARCHITECTURAL_CONSTITUTION_v3.md` | Constitutional Discovery / Audit Closure Document | Lock and stabilize core primitives (FD-0001, WALL-E, ADR-0019, Evidence Ledger, Phase -1). |

# CONSTITUTION_GAP_REPORT

### 1. Principles that still need clarification

| Gap | Description | Why it matters |
|-----|-------------|----------------|
| **Explicit Weighted Scoring Methodology** | How sub‑engine confidences are combined into a single `confidence` value. | Guarantees deterministic, comparable recommendations. |
| **Heuristics Rationale Documentation** | Required format for commenting each regex / rule with business rationale. | Prevents accidental rule erosion. |
| **Formal Advisor‑First UI Checklist** | A checklist to verify that any UI change respects the advisor‑first principle. | Ensures product stays aligned with primary customer. |
| **Data‑Retention & Deletion Policy** | Exact periods for retaining `nash‑memory` JSON and procedures for secure deletion. | Legal compliance (GDPR/CCPA). |
| **Rate‑Availability Verification Process** | How the system determines that a rate is “explicit” before allowing projections. | Enforces “No Projection Without Explicit Rates”. |

### 2. Areas of Forge that remain under‑documented

| Area | Missing Documentation |
|------|-----------------------|
| **Policy Renewal Engine** | No master test, no design doc, status unclear. |
| **Mixed‑Module Build Configuration** | No guide on when to use CJS vs. ESM, causing potential build errors. |
| **Continuous Improvement Loop Mechanics** | No clear process for feeding coaching/manager insights back into engine updates. |
| **Shared Knowledge Library Schema** | No schema describing product‑knowledge objects that are shared across engines. |
| **Deployment / CI Pipeline** | No documented steps for running the full suite of master tests in CI. |

### 3. Architectural Risks

| Risk | Potential Impact |
|------|------------------|
| **Undocumented weighting** → inconsistent confidence → advisor distrust. |
| **Mixed module ambiguity** → build failures, runtime errors. |
| **Absence of CI pipeline** → undetected regression on merges. |
| **Lack of data‑governance docs** → regulatory penalties. |

### 4. Product Risks

| Risk | Potential Impact |
|------|------------------|
| **Heuristics drift** → malformed product interpretations, bad recommendations. |
| **No UI advisor‑first checklist** → UI becomes automation‑centric, reducing adoption. |
| **No rate‑verification process** → inaccurate projections, loss of credibility. |
| **Incomplete test coverage** → hidden bugs in new features. |

### 5. Recommended Future Constitutional Amendments

| Proposed Amendment | Reason |
|--------------------|--------|
| **Add “Weighted Scoring & Confidence” section** to the Constitution (with placeholder for the matrix). | Close the most critical decision‑risk gap. |
| **Create “Heuristics Documentation Standard”** as a sub‑section of Product Directives. | Preserve domain knowledge. |
| **Introduce “Advisor‑First UI Review Checklist”** under Product Directives. | Guard against UI drift. |
| **Add “Data Retention & Deletion Policy”** to Data Governance Principles. | Meet compliance requirements. |
| **Document “Mixed‑Module Build Guidelines”** in Architecture Directives. | Reduce build‑time errors. |
| **Define “Continuous Improvement Loop Process”** under Business Directives. | Formalize feedback integration. |
| **Specify CI / Deployment Workflow** in a new “Operations” section. | Ensure reliable delivery. |

---

*End of FORGE_CONSTITUTION_V3.md*
