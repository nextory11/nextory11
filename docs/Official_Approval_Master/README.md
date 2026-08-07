# NEXTORY11 Official Approval Master

## Repository Authority

- Package: NEXTORY11 Question Design Version 3.5 Official Package
- Official Master Repository: `docs/Official_Approval_Master/`
- Authority decision: Director HIRO Decisions 001, 002, and 005
- Repository role: the single authoritative preservation location for this package
- Current package state: **APPROVED — DIRECTOR ACCEPTED**
- Current Manifest: **REVISION 4 — APPROVED / FROZEN**
- Release state: **NOT RELEASE APPROVED**

This directory is intended to be self-contained. It preserves the approved-source candidates, Official Approved documents, Approved JSON implementation data, approval records, available evidence, integrity records, management documentation, and superseded history required to reconstruct and inspect Version 3.5.

Director HIRO has resolved the former Challenge `NEEDS_HIRO_CONFIRMATION` condition. The current Challenge Final Source is HIRO Final Confirmed, Approved, READY, and Frozen. The pre-decision state remains preserved under `archive/`.

Director HIRO formally accepted the complete 292-file Version 3.5 Official Package under Director Decision 005 on 2026-08-06. This acceptance does not itself grant Release Approval or authorize Git or deployment operations.

## Authority Order

The Director-approved authority order is:

1. HIRO Approved Final Source
2. Official Approved Document
3. Approved JSON / Implementation Data
4. Generated / Derived Data

Approved JSON is preserved as formal implementation data derived from the HIRO Approved Final Source. It is not the design original and must not override the approved source wording.

## Current Package Contents

For each of the 11 types, the current package preserves:

- `<Type>_Final_Approved_Source.md`
- `<Type>_Official_Approved.md`
- `<Type>_Approved.json`

Types:

- Challenge
- Pioneer
- Luminary
- Intuitive
- Harmonizer
- Guardian
- Explorer
- Evolver
- Empath
- Creator
- Visionary

Management and recovery documents:

- `README.md`
- `QUESTION_DESIGN_V3_5_MANIFEST.md`
- `QUESTION_DESIGN_V3_5_COMPLETION_RECORD.md`
- `APPROVAL_EVIDENCE_INDEX.md`
- `RELEASE_PACKAGE_INFORMATION.md`
- `REVISION_HISTORY.md`
- `APPROVED_JSON_SPECIFICATION.md`
- `approved-json.schema.json`
- `IMPLEMENTATION_HANDOFF.md`
- `DIRECTOR_DECISIONS.md`
- `INTEGRITY_VERIFICATION.md`
- `CHECKSUMS.sha256`

Supporting preservation areas:

- `approval-records/` — existing independent approval records
- `evidence/` — evidence that was available and safe to preserve
- `archive/` — superseded package states and their original management records

## Stable Identity Rule

Question ID is the authoritative record-matching key. Do not match records by array position, display order, browser state, chat memory, inferred type order, or current Question Bank order.

Expected Question ID ranges are recorded in the Manifest. Luminary is represented by the display type `Luminary`, its Approved JSON uses `type: "luminary"`, and its Version 3.5 Official Question IDs are `n11-luminary-01`–`n11-luminary-20`. The former `n11-light-bringer-*` management definition is superseded and must not be used as a Version 3.5 Official Question ID.

## Use by Implementation

Implementation personnel must:

1. identify the exact package and Manifest revision;
2. verify `CHECKSUMS.sha256`;
3. read `IMPLEMENTATION_HANDOFF.md`;
4. use the Approved JSON only as implementation data;
5. compare any ambiguity against the higher-authority Final Source and Official Approved document;
6. stop and report any conflict without rewriting content.

Do not use copies outside this directory as Current Official authority after migration. Review viewers, browser storage, Question Bank data, runtime state, Production state, generated data, and external copies are downstream or non-authoritative representations.

Some preserved artifacts contain legacy references such as `docs/<Type>_Final_Approved_Source.md`. Those strings were not rewritten during preservation. Within this package, resolve an exact known legacy basename to the same-named file in `docs/Official_Approval_Master/`; do not treat the root copy as the governing authority. See `IMPLEMENTATION_HANDOFF.md` for the compatibility rule.

## Change and Preservation Rules

- Silent edits are prohibited.
- Questions, answers, Question IDs, type design, scoring, runtime, AI JUZA, and Production code are outside this preservation migration and were not changed.
- Every future official change requires a version, reason, approving authority, date, impact scope, revision entry, and regenerated integrity record.
- Existing important material must not be deleted merely because a newer state exists.
- Superseded material must be retained under `archive/` and clearly separated from Current Official material.
- A checksum change without a corresponding approved revision must be treated as an integrity failure.
- Release requires a separate explicit Director Release Approval.

## Challenge Final Authority

The Challenge Q01–Q20 questions and Answers A–D were confirmed by Director HIRO as the Approved Final Version on 2026-08-06. Current authority follows the package authority order. The earlier `NEEDS_HIRO_CONFIRMATION` state is retained only in `archive/superseded-2026-08-06-challenge-pre-final-confirmation/`.

This resolution completes the previously pending Challenge approval-consistency requirement. It does not itself grant Package Release Approval, authorize Production changes, or authorize deployment.

## Superseded History

The original 2026-08-06 all-BLOCKED Master state is preserved at:

`archive/superseded-2026-08-06-initial-blocked/`

That archive contains the original README, Manifest, and 11 placeholder type documents. It is historical evidence and is not Current Official content.

The Challenge pre-final-confirmation state is preserved at:

`archive/superseded-2026-08-06-challenge-pre-final-confirmation/`
