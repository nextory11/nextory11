# NEXTORY11 Question Design Version 3.5 Implementation Handoff

## Handoff Status

- Official Master Repository: `docs/Official_Approval_Master/`
- Package status: **TECHNICALLY COMPLETE — DIRECTOR PACKAGE ACCEPTANCE PENDING**
- Implementation data status: preserved and structurally validated
- Release authorization: **NOT GRANTED**
- Challenge authority status: HIRO Final Confirmed / Approved / READY / Frozen

## Files to Use

For each type, implementation work must identify all three files:

1. `<Type>_Final_Approved_Source.md` — highest content-source authority in the package
2. `<Type>_Official_Approved.md` — official approval and registration document
3. `<Type>_Approved.json` — formal implementation data

Implementation should consume the Approved JSON only after confirming the applicable Director decision, Manifest revision, and checksum inventory.

## Authority Rule

```text
HIRO Approved Final Source
        ↓
Official Approved Document
        ↓
Approved JSON / Implementation Data
        ↓
Generated / Derived Data
```

Question Bank content, runtime data, browser state, review-viewer data, generated bundles, and Production behavior do not override the files in this Master.

## Matching Rule

Use `questionId` as the only authoritative record-matching key.

Do not match by:

- JSON array position;
- Question Bank order;
- display order;
- browser storage;
- type sequence assumptions;
- similarity of wording;
- chat memory.

## Legacy Reference Compatibility

Preserved Official documents and Approved JSON records may contain source references in the historical form:

`docs/<Type>_Final_Approved_Source.md`

Those values were preserved byte-for-byte because this migration did not authorize JSON or approved-content rewriting. For Version 3.5 package resolution, an exact known basename in that historical form maps to:

`docs/Official_Approval_Master/<Type>_Final_Approved_Source.md`

The Master file is authoritative after migration. This compatibility mapping must not be generalized to arbitrary paths, and it must not be used to substitute a different file with similar wording. Verify the basename, type, Question ID, and package checksum.

## Required Pre-Implementation Checks

1. Verify `CHECKSUMS.sha256`.
2. Confirm the Manifest revision approved for use.
3. Confirm all 11 JSON files parse.
4. Confirm 220 unique Question IDs.
5. Confirm the type-to-ID mapping in `APPROVED_JSON_SPECIFICATION.md`.
6. Review `QUESTION_DESIGN_V3_5_COMPLETION_RECORD.md` for pending conditions.
7. Review `APPROVAL_EVIDENCE_INDEX.md` for evidence limitations.
8. Confirm that Manifest revision 3 or a later Director-accepted revision is the authorized implementation input.

## Prohibited Interpretation and Transformation

Implementation personnel and tools must not, without explicit approval:

- rewrite or correct question wording;
- rewrite or correct answer wording;
- change Question IDs;
- change answer labels or order;
- change type design or identifiers;
- infer missing approval;
- normalize content as a substitute for the source;
- change scoring;
- use runtime or Production data as the source of truth.

## Conflict Procedure

If Source, Official document, JSON, Question Bank, runtime, or Production differs:

1. stop the affected transfer or implementation;
2. preserve the observed values without editing them;
3. identify exact files, versions, Question IDs, and checksums;
4. report the discrepancy and impact;
5. await Director HIRO's decision;
6. record any authorized resolution through version and revision control.

## Challenge Final Authority Resolution

Director HIRO confirmed that the preserved Challenge Q01–Q20 questions and Answers A–D are the Approved Final Version. The Challenge Final Source, Official Document, and Approved JSON were compared with zero content mismatches.

Use the current Master files. Do not use the pre-confirmation snapshot as implementation input; it is retained only under `archive/superseded-2026-08-06-challenge-pre-final-confirmation/` for history.

## Implementation Output Requirements

Any future authorized implementation should report:

- source package and Manifest revision;
- input checksums;
- mapped Question IDs;
- output files and systems;
- validation results;
- deviations or unresolved items;
- responsible implementer;
- implementation approval record;
- release approval reference where applicable.
