# NEXTORY11 Version 3.5 Approved JSON Specification

## Status and Role

- Specification version: 1.0
- Applies to: `*_Approved.json` files in this Official Package
- Authority class: Approved JSON / Implementation Data
- Design-source authority: subordinate to the HIRO Approved Final Source and Official Approved Document
- Content transformation authorized by this specification: none

This specification documents the JSON shape that was preserved. It does not normalize, rewrite, or reinterpret the JSON content.

## File Set

One JSON file exists for each of the 11 types:

`<Type>_Approved.json`

Each file contains 20 question records. The package total is 220 records.

## Common Top-Level Fields

| Field | Type | Required in preserved files | Meaning |
|---|---|---:|---|
| `type` | string | Yes | Implementation type identifier |
| `questionDesignVersion` | string | Yes | Expected value `3.5` |
| `approvalAuthority` | string | Yes | Recorded approval authority |
| `contentAuthority` | string | Yes | Recorded content authority |
| `status` | string | No | Present in some preserved files only |
| `questions` | array | Yes | Exactly 20 question records per file |

The optional `status` difference is an existing schema variation. This preservation process does not add it to files where it is absent.

## Question Record Fields

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `questionId` | string | Yes | Stable authoritative matching key |
| `questionNumber` | integer | Yes | Q01–Q20 numeric representation |
| `finalApprovedQuestion` | string | Yes | Preserved question wording |
| `answers` | object | Yes | Answers `A`, `B`, `C`, and `D` |
| `hiroApprovalStatus` | string | Yes | Recorded approval status |
| `juzaFinalStatus` | string | Yes | Recorded content-final status |
| `questionDesignVersion` | string | Yes | Expected value `3.5` |
| `evidenceReference` | string | Yes | Reference to supporting source or record |

Some records contain additional evidence identity fields. Consumers must preserve unknown additional fields and must not discard them during round-trip processing.

## Answers Object

The `answers` object contains exactly these required string keys:

- `A`
- `B`
- `C`
- `D`

Answer order must be interpreted by key, not by object-property iteration behavior.

## Type and Question ID Mapping

| Display type | JSON `type` | Question ID prefix |
|---|---|---|
| Challenge | `challenge` | `n11-challenge-` |
| Pioneer | `pioneer` | `n11-pioneer-` |
| Luminary | `luminary` | `n11-light-bringer-` |
| Intuitive | `intuitive` | `n11-intuitive-` |
| Harmonizer | `harmonizer` | `n11-harmonizer-` |
| Guardian | `guardian` | `n11-guardian-` |
| Explorer | `explorer` | `n11-explorer-` |
| Evolver | `evolver` | `n11-evolver-` |
| Empath | `empath` | `n11-empath-` |
| Creator | `creator` | `n11-creator-` |
| Visionary | `visionary` | `n11-visionary-` |

The Luminary mapping is intentionally documented as found. This specification does not rename it.

## Validation Requirements

A preservation or handoff validation should confirm:

- JSON parses successfully;
- 11 expected files exist;
- each file has 20 questions;
- package total is 220 questions;
- all Question IDs are unique;
- Question IDs match the expected type range;
- question numbers cover 1–20;
- answers A–D exist as strings;
- version is `3.5` at top level and record level;
- approval and evidence-reference fields exist;
- file checksum matches the Package Manifest and `CHECKSUMS.sha256`.

Validation failure must be reported. It does not authorize automatic correction.

## Machine-Readable Schema

See `approved-json.schema.json`. The schema documents structural expectations and intentionally permits additional properties so that preserved evidence metadata is not lost.

