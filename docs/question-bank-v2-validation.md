# NEXTORY11 Question Bank Version 2.0 — Validation Report

Date: 2026-07-31
Status: Approved for NEXTORY11 Version 1.0
Authority: `Design/00_Design_Constitution.md` and `docs/NEXTORY11_CONSTITUTION.md`

## Executive assessment

Question Bank Version 2.0 contains 220 emotionally situated Japanese questions and 880 answer instances. It preserves the existing runtime schema, stable question IDs, answer IDs, categories, weights, scoring metadata, personality targeting, rotation groups, cooldown groups, selection count, and answer metadata.

The candidate passes structural, balance, duplicate-prompt, lexical-overlap, length, unit-test, and production-build validation. It is suitable for owner editorial review.

It is not yet statistically validated in the scientific or psychometric sense. Real response data is required before claims can be made about discrimination, stability, bias, or distribution effects.

## Content architecture

- Foundational standard: **Statistics × Psychology × Emotion**
- Questions: 220
- Answers: 880
- Categories: 20
- Questions per category: 11
- Target types: 11
- Questions targeting each type: 20
- Primary answer opportunities per type: 80
- Selection count: 11
- Schema version: `1.0.0`
- Question set version: `question-pack-v2`
- Question version: `2.0.0`

Every question prompt is unique. Prompts use situations involving uncertainty, responsibility, relationships, disappointment, hope, pressure, values, belonging, achievement, or personal meaning.

Answer language remains organized as a balanced category-by-motive matrix. A canonical category/motive answer may occur in four different questions because the preserved answer-target allocation gives every primary trait exactly 80 opportunities. Since a diagnosis session selects no more than one question per category, identical category/motive labels are not presented together in one session.

## Structural compatibility

Compared with `origin/main`:

- 220 of 220 question IDs preserved
- 880 of 880 answer IDs preserved
- 880 of 880 weight objects preserved
- 880 of 880 answer metadata objects preserved
- 220 of 220 categories preserved
- 220 of 220 target traits preserved
- Rotation and cooldown structure preserved
- Top-level JSON structure preserved
- Runtime importer compatibility preserved

Only question and answer display content plus explicit Version 2.0 provenance fields were changed.

## Duplicate analysis

### Question prompts

- Exact duplicate prompts: 0
- Unique prompts: 220 of 220

Version 1 repeated one prompt across all 11 questions in a category. Version 2 supplies a distinct emotional situation for every stable question ID.

### Answer labels

- Unique answer labels: 220
- Repeated canonical category/motive patterns: 220
- Occurrences per canonical pattern: 4
- Exact duplicate labels within the same four-option set: 0

The cross-question repetition is an intentional consequence of the balanced preserved scoring matrix, not an in-question duplicate. It should be reconsidered only if future empirical data shows context-specific wording is needed for discrimination.

## Overlap analysis

Automated review compared every pair inside each four-answer set using normalized Japanese character-bigram similarity.

- Pairs reviewed: 1,320
- Pairs above the 0.42 lexical-overlap review threshold: 0
- Exact in-question duplicates: 0
- Previously identified high-risk Challenge/Pioneer pairs: rewritten
- Previously identified Empath/Intuitive support pair: rewritten
- Previously identified Empath/Harmony action pair: rewritten

Key motive boundaries are now expressed as:

- Challenge: willingly face and overcome the difficult point
- Pioneer: construct or test a route that has not existed before
- Explorer: understand facts, causes, structure, or meaning
- Evolver: learn from experience and refine the current state
- Empath: receive an individual’s expressed feelings without rushing
- Harmony: connect differing expectations and restore cooperation
- Creator: bring an original form or idea into existence
- Visionary: choose through long-term direction and meaning
- Guardian: protect what matters and maintain a stable base
- Luminary: help hope, confidence, or positive meaning return
- Intuitive: notice atmosphere, inner sensations, or unspoken signals

Lexical separation is not a substitute for human or empirical validation. Owner review should still examine whether each pair represents genuinely different inner motives.

## Psychological review

Each category is framed through 11 distinct lived situations. The prompts invite the user to recall or imagine emotional experience rather than evaluate abstract personality claims.

The answer set retains four different primary psychological motives per question. Corrections from the previous editorial audit explicitly separate:

- overcoming resistance from opening an unexplored route
- receiving a person’s feelings from sensing an unspoken atmosphere
- understanding an individual from reconciling a group
- immediate confrontation from iterative refinement
- future direction from original expression

No scoring-direction reversal was introduced. Every answer remains attached to its original primary and secondary weights.

## Neutrality review

The candidate was reviewed against these prohibited imbalances:

- uniquely kind or caring language
- uniquely intelligent or evidence-based language
- uniquely brave or strong language
- uniquely safe or responsible language
- uniquely hopeful or socially desirable language
- obvious type names or direct personality labels

Changes were made to remove self-validating wording such as 「確かな感覚」 and awkward or leading phrases such as 「可能性を開ける」. The current answers frame motives as different priorities rather than good and bad choices.

Residual risk remains because hope, safety, empathy, and cooperation can be socially attractive concepts even when phrased neutrally. Real selection-rate data is required to determine whether those options are over-selected.

## Mobile and readability review

### Questions

- Average prompt length: 44.49 characters
- Maximum prompt length: 52 characters
- Prompts over 64 characters: 0
- Exact repeated setup phrases detected after refinement: 0

### Answers

- Average answer length: 19.69 characters
- Maximum answer length: 26 characters
- Answers over 24 characters: 12
- Answers over 28 characters: 0
- Questions with severe answer-length imbalance: 0

The 12 answers above 24 characters are concentrated in the `values` category and remain below the 28-character rejection threshold. They require visual confirmation at 360 px and 390 px before release approval.

## Statistical review

The preserved matrix is perfectly balanced by construction:

| Measure | Result |
| --- | --- |
| Questions per category | 11 for each of 20 categories |
| Target questions per type | 20 for each of 11 types |
| Primary answer opportunities per type | 80 for each of 11 types |
| Primary answer weight | Preserved |
| Secondary answer weight | Preserved |
| Opportunity normalization | Preserved |
| Tie-breakers | Preserved |

This structural balance does not prove real-world diagnostic balance. After data collection, evaluate:

- option selection rates
- unusually common or rare options
- Challenge/Pioneer and other neighboring-type confusion
- item discrimination
- type distribution
- repeat-diagnosis stability
- wording-version effects
- social-desirability bias
- answer-position bias
- inter-question correlation

No clinical, medical, psychiatric, or formally validated psychometric claim is supported by this candidate.

## Automated verification

### Passed

- `node scripts/validate-question-bank-v2.mjs`
- Question Bank focused test: 6 of 6 passed
- Complete local unit suite: 20 files, 88 tests passed
- Production build: passed

### External integration limitation

The complete repository test command produced 89 passing tests and seven failures in `tests/integration/database.test.ts`. All seven failures were caused by the configured Neon Development database WebSocket being unavailable. They did not indicate a Question Bank, schema, scoring, or build failure. No database or environment change was made to bypass them.

## Readiness assessment

**Ready for owner editorial review.**

Not yet authorized or ready for Production release. Owner approval, mobile visual QA, and a controlled release/measurement plan are still required. Empirical statistical validation can begin only after real response data is available.
