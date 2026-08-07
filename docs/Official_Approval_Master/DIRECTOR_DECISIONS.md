# NEXTORY11 Question Design Version 3.5 Director Decisions

## Status

This record preserves the governance decisions provided by Director HIRO for the Official Package. It does not add approval to unresolved content.

## Director Decision 001 — Official Master Repository

- Director: HIRO
- Date recorded: 2026-08-06
- Decision: `docs/Official_Approval_Master/` is the sole Official Master Repository for NEXTORY11 Question Design Version 3.5 Official Approved Source.
- Effect: copies outside this directory are not the Current Official authority after migration.

## Director Decision 002 — Full Preservation Policy

- Director: HIRO
- Date recorded: 2026-08-06
- Decision: important Official Package material is to be preserved within the Official Master Repository so that design source, approval state, implementation data, management records, and history can be reconstructed from this directory.

Required preservation scope:

- 11 Final Approved Source documents;
- 11 Official Approved documents;
- 11 Approved JSON files;
- README and Manifest;
- Completion Record;
- Approval Evidence Index;
- Release Package Information;
- Revision History;
- Approved JSON specification and schema;
- Implementation Handoff;
- existing Approval Records;
- preservable Approval Evidence and index;
- checksum and SHA-256 integrity records;
- superseded versions and history.

Superseded policy:

- existing old all-BLOCKED Master material must not be deleted;
- it must be clearly separated as Superseded / Archive;
- its history, checksums, and relationship to the old Manifest must be preserved.

Authority order:

1. HIRO Approved Final Source
2. Official Approved Document
3. Approved JSON / Implementation Data
4. Generated / Derived Data

Protected boundaries:

- no change to question wording;
- no change to answer wording;
- no change to Question IDs;
- no change to type design;
- no change to scoring;
- no change to Question Bank runtime;
- no change to AI JUZA;
- no change to Production code.

Unresolved items, including the Challenge approval-state discrepancy, must be stopped and reported rather than silently corrected.

## Decisions Not Yet Recorded

- Release Approval
- upload destination and method
- Git commit, push, tag, or release authorization
- policy for root-level migration-source copies after Director review

## Director Policy — Luminary ID Management Correction / Manifest Revision 4

- Director: HIRO
- Date recorded: 2026-08-06
- Current Official Luminary Question IDs: `n11-luminary-01`–`n11-luminary-20`
- Superseded management definition: `n11-light-bringer-01`–`n11-light-bringer-20`
- Decision: `light-bringer` is not used as a Version 3.5 Official Question ID.
- Change scope: management documentation only
- Change reason: Current OfficialのLuminary Question IDとの管理資料整合性修正
- Required history: Manifest Revision 3 and the former management definition remain preserved as Superseded history.
- Prohibited changes: questions, answers, Question IDs, Approved JSON, scoring, Question Bank, runtime, AI JUZA, and Production.

## Director Decision 003 — Challenge Final Approval

- Director: HIRO
- Date recorded: 2026-08-06
- Scope: Challenge Q01–Q20 questions and Answers A–D
- Decision: the questions and answers already finally corrected and reviewed by HIRO are adopted as the Challenge Approved Final Version.
- Authority status: HIRO Approved Final Source
- Management status: HIRO Final Confirmed / Approved / READY / Frozen
- Previous condition: `NEEDS_HIRO_CONFIRMATION` is resolved by this decision.
- Content-change authority granted to CODEX: none
- Technical authority granted to CODEX: preservation, metadata alignment, reference management, checksum, Manifest, Completion, Evidence, implementation-input, and release-preparation organization
- Historical requirement: preserve the previous state as Superseded history.
- Release effect: resolves the Challenge content-approval blocker but does not itself authorize commit, push, upload, deployment, Production modification, or Release Approval.

## Director Decision 005 — Final Package Acceptance

- Director: HIRO
- Date recorded: 2026-08-06
- Package: NEXTORY11 Question Design Version 3.5 Official Package
- Official Master Repository: `docs/Official_Approval_Master/`
- Accepted scope: the complete 292-file Official Package, including Manifest Revision 4, Package Completion Record, Current Official 11-type three-artifact sets, Approved JSON, Approval Evidence, Approval Records, package management records, `CHECKSUMS.sha256`, and Superseded / Archive history
- Package Completion: **APPROVED**
- Manifest Revision 4: **APPROVED / FROZEN**
- Official Package: **ACCEPTED**
- Authority effect: `docs/Official_Approval_Master/` is the sole Official Master Repository for Version 3.5.
- Release effect: this decision records final package acceptance only. It does not authorize Git stage, commit, push, tag, merge, runtime promotion, Question Bank changes, or deployment.
