# NEXTORY11 Official Website — Section 03 Approval Record

## Record Metadata

- Deliverable: NEXTORY11 Official Website — Section 03「NEXTORY11の使い方」
- Preview Route: `/official-preview/how-to-use`
- Approval Date: `2026-08-09`
- Time Zone: `America/Vancouver`
- Overall Section Status: `FINAL APPROVED / PRESERVED / LOCKED`

## Final Approval Status

| Scope | Approval Status | Lock Status |
| --- | --- | --- |
| Desktop Design Master | FINAL APPROVED | LOCKED |
| Mobile Design Master | FINAL APPROVED | LOCKED |
| Desktop Implementation | FINAL APPROVED | LOCKED |
| Mobile Implementation | FINAL APPROVED | LOCKED |
| Responsive Rule | FINAL APPROVED | LOCKED |
| Production `/` | UNCHANGED | Protected |

## Responsive Authority

| Viewport Class | Approved Visual Authority |
| --- | --- |
| Phone Portrait | Mobile |
| Phone Landscape | Mobile |
| Low-height Phone Landscape | Mobile |
| Tablet Portrait | Mobile |
| Tablet Landscape | Desktop |
| Desktop / Laptop | Desktop |

The approved implementation rule is:

- `≤767px` → Mobile
- `768–1099px` Portrait → Mobile
- `768–1099px` Landscape → Desktop
- Low-height Phone Landscape → Mobile
- `≥1100px` → Desktop

There are only two approved visual authorities:

1. Desktop Final Approved Design Master
2. Mobile Final Approved Design Master

Independent Tablet Design: **NOT AUTHORIZED**

## Desktop Final Approved Specification

The Desktop composition is final approved, preserved, and locked, including:

- Deep Navy / Black cosmic background
- Blue / Purple nebula and gold typography
- Four STEP Journey and gold orbital path
- STEP 01, STEP 02, STEP 03 AI JUZA, and STEP 04 Premium Report visuals
- Earth horizon and blue rim light
- Final Message and CTA
- TOP / MENU, NEXTORY11 branding, and approved copy

## Mobile Final Approved Specification

The latest Mobile Design Master and its current implementation are final approved, preserved, and locked, including:

- Sufficient breathing room in the top, title, and Intro areas
- Sufficient spacing from Intro to STEP 01
- One continuous cosmic background across the full page
- No black horizontal band and no background split
- Approved right-side brightness
- Readable gold headings and white body copy
- STEP 01–04 vertical journey and gold orbital path
- No unwanted rectangle around TOP in normal, hover, focus-visible, active, or post-tap states
- Approved Earth lighting with no strong left sunrise
- Approved Final Message and CTA

## Background Continuity Rule

On Mobile, creating whitespace means increasing the physical distance between content within the same continuous cosmic background. It must never mean splitting, ending, restarting, or replacing the background.

The universe must remain visually continuous through:

`Intro → STEP 01 → STEP 02 → STEP 03 → STEP 04 → Earth`

Black bands, solid-color spacer regions, background-image breaks, and section-like background transitions are prohibited.

## Readability Rule

The approved visual standard is **Premium + Cosmic + Readable**.

- Gold headings and white body copy must retain clear contrast.
- Premium styling must not be created by making the content excessively dark.
- A right-side-only dark overlay or gradient is prohibited.
- Deep Navy must coexist with visible Blue / Purple cosmic light and nebula.

## TOP Control Rule

The Mobile `← TOP` control must not display an unwanted rectangular background, panel, image edge, or artifact in normal, hover, focus-visible, active, or post-tap states. Accessibility and a usable touch target must remain intact.

## Approved Copy

The currently implemented Section 03 copy, STEP names, `AI JUZA`, and `Premium Report` naming are final approved and locked.

Without HIRO's explicit approval, do not add, delete, summarize, rewrite, or rename approved copy.

## Approved Asset References

All paths below are repository-relative, exist, and were verified on the approval date.

| Asset | Approved Repository Path | SHA-256 |
| --- | --- | --- |
| Desktop Final Approved Source PNG | `public/official-site/images/how-to-use/source/nextory11-how-to-use-desktop-final-approved.png` | `FFDEF250CA06A37F8700A5A3477665AA60F042F634AD2C5BC56DD5168C6EE3EB` |
| Desktop WebP | `public/official-site/images/how-to-use/nextory11-how-to-use-desktop-final.webp` | `116B5BF044F45AB42CC1A3729DB4DD240F0D4D1AE754BF0C5633924640C36FEF` |
| Mobile Final Approved Source PNG | `public/official-site/images/how-to-use/mobile/source/nextory11-how-to-use-mobile-final-approved.png` | `6AD8C364C9C4C62C4E0C8736FD2570A5EC61AFAA9803126E7DBFE4D30EF2CA84` |
| Mobile WebP | `public/official-site/images/how-to-use/mobile/nextory11-how-to-use-mobile-final.webp` | `0325F5D247A833BF6103663FD5F2DDB88683D34631BA13C6A7D8161CFF9437BA` |

The former Mobile whitespace-interpolation WebP is deleted and is not an approved asset.

## Approved Implementation References

| Implementation | Repository Path | Approval-time SHA-256 |
| --- | --- | --- |
| Section component | `src/official-site/sections/HowToUseNextory11.jsx` | `65E53F4C06DAF9876FAAC91B485C51A0FD3F81D35BD71A478557959C3CA42620` |
| Responsive presentation | `src/official-site/styles/how-to-use-nextory11.css` | `BC4D628FFD67BEA3CD651BE1CD72E702FCF60002A1D8FE38750F52D809623640` |

These files define the final approved Section 03 implementation authority.

## Approved QA Record

| Verification | Result | Authority / Detail |
| --- | --- | --- |
| Latest Mobile Design Master reproduction | PASS | Final Approved Mobile Master |
| Top area spacing | PASS | Approved |
| Title / Intro breathing room | PASS | Approved |
| Intro → STEP 01 spacing | PASS | Approved |
| Cosmic background continuity | PASS | Continuous universe |
| Black horizontal band | NONE | Verified |
| Background split | NONE | Verified |
| Right-side brightness | PASS | Approved |
| Gold text readability | PASS | Approved |
| White text readability | PASS | Approved |
| STEP 01 | PASS | Approved |
| STEP 02 | PASS | Approved |
| STEP 03 | PASS | Approved |
| STEP 04 | PASS | Approved |
| TOP unwanted rectangle | NONE | Verified |
| Earth / lighting | PASS | Approved |
| Final Message | PASS | Approved |
| CTA | PASS | Approved |
| Copy unchanged | PASS | Preserved |
| `390×844` | PASS | Mobile |
| `430×932` | PASS | Mobile |
| `768×1024` Portrait | PASS | Mobile |
| `1024×768` Landscape | PASS | Desktop |
| Approx. `1440px` | PASS | Desktop |
| Desktop regression | NONE | Desktop Final Approved preserved |
| Horizontal overflow | NONE | Verified |
| Typecheck | PASS | Verified before approval record |
| Production Build | PASS | Verified before approval record |

## Previous Approved Section Protection

- Section 02「NEXTORY11とは？」: `FINAL APPROVED / PRESERVED / LOCKED`
- PHILOSOPHY: `FINAL APPROVED / PRESERVED / LOCKED`

Their locked implementation files remained hash-identical during Section 03 approval verification. Neither section was modified while creating this record.

## Approval Authority

- HIRO — Final Decision Authority
- JUZA — Design Director
- CODEX — Implementation Engineer

HIRO Final Approval:

- Section 03 Desktop — **APPROVED**
- Section 03 Mobile — **APPROVED**
- Responsive Behavior — **APPROVED**
- Implementation — **APPROVED**

## Lock Rule

Section 03「NEXTORY11の使い方」is locked. Unless HIRO explicitly reopens the section and authorizes a change, do not modify:

- Desktop or Mobile Design Master and approved web derivatives
- Desktop or Mobile implementation
- Copy and typography
- Background, nebula, lighting, and readability treatment
- STEP 01–04, STEP visuals, and orbital journey
- Earth, Final Message, and CTA
- TOP / MENU
- Responsive behavior

Future Official Website work must not cause CSS or component regressions in Section 03. Production `/` must remain unchanged unless HIRO explicitly approves a Production change.

## Preservation Declaration

Section 03 Desktop and Mobile Design Masters, their approved web derivatives, implementation, copy, responsive authority, and QA state are preserved under this record as the current official approved state.

**NEXTORY11 Official Website — Section 03「NEXTORY11の使い方」 — FINAL APPROVED / PRESERVED / LOCKED**

― Find Your Star. ―
