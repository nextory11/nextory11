# NEXTORY11 Result Scene Design Quality Rules

Status: Active

Approval authority: Product Owner (Hiro)

Effective date: 2026-08-04

## Preview First Rule

All Result Scene design work follows this sequence:

1. Design Master
2. Preview completed state
3. Hiro visual approval
4. Promotion to Production

Passing code checks, builds, or automated visual measurements does not replace Hiro's visual approval.

## Approved Reference Rule

The approved Desktop, Tablet, and Mobile screenshots are the sole visual completion standard for an approved Result Scene version.

Future changes must:

- compare the rendered result against the approved screenshots at the recorded viewport sizes;
- preserve the approved composition unless Hiro explicitly approves a replacement version;
- use measured DOM rectangles, computed styles, and rendered bundle behavior when investigating drift;
- never move or resize visual elements using guessed values;
- remain scoped to the approved type and must not be copied to other types without separate approval.

## Luminary Approved Reference Version 1.0

Type: Luminary / 光導力タイプ

Slug: `light-bringer`

Internal ID: `expression`

Approved by: Hiro

Approval date: 2026-08-04

The following screenshots are the authoritative visual reference for the Luminary AI JUZA composition:

- [Desktop 1440×1000](approved-references/luminary/v1.0/desktop-1440x1000.png)
- [Tablet 768×900](approved-references/luminary/v1.0/tablet-768x900.png)
- [Mobile 390×844](approved-references/luminary/v1.0/mobile-390x844.png)

The approved composition keeps the complete circular portrait inside the left aperture without covering the lower frame, center crystal, side ornamentation, or right text chamber.

Any future Production drift must be corrected by measuring it against these references. These screenshots remain authoritative until Hiro explicitly approves a later Luminary reference version.
