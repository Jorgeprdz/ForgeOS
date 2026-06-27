# REPO-006 Destination Overwrite Risk Analysis

Report ID: REPO-006
Status: ARCHITECTURE DISCOVERY / INVESTIGATION COMPLETE

## 1. Collision Summary

BUILD-003 reports one hard destination overwrite risk:

| Field | Evidence |
| --- | --- |
| Source path | `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` |
| Destination path | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` |
| BUILD-003 classification | `CONTENT_DIFFERS` |
| Source size | 32,693 bytes |
| Destination size | 32,054 bytes |
| Source mtime | 2026-06-03 19:46:53 -0600 |
| Destination mtime | 2026-06-03 14:45:37 -0600 |
| Source git object | `57e96e469ab18cca8e0f11603ebfeb619b3235ba` |
| Destination git object | `be447648431dd4349463e2659624ca69a7778bce` |
| Source git history | `f5a593e docs: convert PAQ architecture reviews to markdown` |
| Destination git history | `fefcc34 docs: ratify forge constitution amendment v1.1` |

The collision is not caused by code, imports or runtime behavior. It is a documentation-governance collision between a root copy and a canonical constitution-folder copy.

The hard blocker exists because a future migration plan would try to place the root file at a path that already exists and has different content. The harness correctly refuses overwrite.

## 2. File Comparison

Classification: `MINOR_VARIATION`

The two files contain the same constitutional doctrine and the same major amendment body. The observed differences are structural and documentary, not substantive.

### Executive Purpose

Both files define Forge Constitution Amendment v1.1. Both state that the amendment introduces eight constitutional principles:

- Capture Once Principle
- Forecasts Are Suggestions, Facts Are Facts
- Business Planning Principle
- Economic Clarity Extension
- Causal Clarity Principle
- Learning Through Reasoning Principle
- Advisor Development Principle
- Rule Pack Separation Principle

Both documents end with the same constitutional conclusion: Forge should convert commercial reality into decision clarity, action and professional growth.

### Main Sections

Both files contain the same functional body:

- Status / Mode / Scope
- Executive Summary
- Constitutional Context
- Principle 1 through Principle 8
- Complement to existing principles
- Possible conflicts
- Recommendations for adoption
- Final verdict

The source file uses Markdown heading syntax more consistently, for example `## 1. Executive Summary` and `### Statement`.

The destination file preserves a flatter ratification style, for example `1. EXECUTIVE SUMMARY` and `Statement:`.

### Evidence Models

Both files preserve the same evidence and governance model:

- constitutional doctrine, not implementation scope
- no code creation
- no engine creation
- no schema creation
- no UI modification
- no Build Tree modification
- no Roadmap modification
- no commit authorization

The source file adds a `Repository References` block:

- `FORGE_MASTER_BUILD_TREE.md`
- `AGENTS.md`
- `FORGE_CONSTITUTION_V3.md`
- `FORGE_FOUNDATION_LOCK.md`

This is navigational metadata. It is not part of the constitutional doctrine. One referenced path, `FORGE_FOUNDATION_LOCK.md`, is currently target-broken under the current root scan.

### Terminology Differences

The differences are mostly formatting:

- source: Markdown headings
- destination: plain uppercase section labels
- source: colonless headings such as `### Statement`
- destination: inline labels such as `Statement:`
- source: added repository-reference preface
- destination: no repository-reference preface

No reviewed diff evidence shows a competing constitutional principle in one file that is absent from the other.

### Missing Content

Content present only in source:

- `Repository References` section
- Markdown heading formatting

Content present only in destination:

- Ratified original formatting style from `fefcc34`

Substantive constitutional body:

- No material doctrine gap identified.

## 3. Ownership Analysis

Ownership outcome: `DESTINATION_IS_CANONICAL`

Evidence:

- `FORGE_CONSTITUTION_V3.md` explicitly ratifies Amendment v1.1 and points to `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md`.
- The destination file was introduced by `fefcc34 docs: ratify forge constitution amendment v1.1`.
- The root file was introduced later by `f5a593e docs: convert PAQ architecture reviews to markdown`.
- REPO-004 states that root is a protected compatibility and governance surface, not a destination domain.
- REPO-005 identifies `docs/architecture/constitution/` as the destination for constitutional governance and notes the remaining tracked root doc with destination collision.

The destination has stronger constitutional ownership because it is the ratified amendment path referenced by the active Constitution. The source has useful markdown/navigation treatment, but its later conversion lineage is weaker than the destination's ratification lineage.

## 4. Risk Analysis

| Option | Documentation Risk | Link Risk | Knowledge Loss Risk | Migration Risk |
| --- | --- | --- | --- | --- |
| A. Keep Destination | Low. Preserves ratified canonical path. | Low to medium. Existing root references may still point to root copy until references are reviewed. | Low. Source-only content is navigational metadata. | Low. Requires plan to avoid overwriting destination. |
| B. Keep Source | Medium. Replaces ratified-format destination with later markdown conversion. | Medium. Source includes one broken repository reference. | Low. Constitutional body appears preserved. | High. Would require overwrite or human-approved replacement. |
| C. Merge | Medium. Could preserve source navigation and destination canonical body, but merge is a constitutional edit. | Medium. Must repair repository references during merge. | Lowest. Preserves all observed content. | Medium. Requires human review and explicit constitutional approval. |
| D. Archive Source | Low. Keeps canonical destination and preserves source as historical conversion artifact. | Medium. Any links to root source must be redirected later. | Very low. Source-only metadata is preserved in archive. | Low. Avoids destination overwrite. |
| E. Archive Destination | High. Would archive the ratified canonical path referenced by Constitution. | High. Breaks constitutional path alignment. | Medium. Could confuse ratification lineage. | High. Not recommended without constitutional amendment. |

## 5. Recommendation

Recommended action: `ARCHIVE_SOURCE`

The source file should not be moved into `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` because that destination already contains the ratified canonical document.

Future human-approved migration should treat the root source as a historical markdown conversion artifact, not as the canonical constitutional amendment. A safe future resolution would be:

1. Keep `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` as canonical.
2. Exclude `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` from any move plan targeting the canonical destination.
3. Preserve the root source only as archive/history if required.
4. Review references to the root source before any archive action.

This recommendation resolves the hard overwrite blocker without deleting knowledge and without overwriting a ratified constitutional path.

## 6. Confidence Score

Confidence: 0.86

Rationale:

- Strong evidence supports the destination as canonical.
- Git history clearly shows destination ratification before source conversion.
- Structural diff indicates minor variation rather than conflicting doctrine.
- Remaining uncertainty: source-only repository references may have been intentionally added as navigation metadata, so archival should not occur until links are reviewed in a later approved migration step.

Additional blocker discovered:

- The source file references `FORGE_FOUNDATION_LOCK.md`, which is currently unresolved by the BUILD-003 link resolver.
