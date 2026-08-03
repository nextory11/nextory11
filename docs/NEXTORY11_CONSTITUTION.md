# NEXTORY11 Constitution / Development Rules

Version: 1.1\
Status: Active — Permanent Governing Authority\
Approval authority: Product Owner\
Last constitutional revision: 2026-08-01\
Governing scope: All NEXTORY11 documentation, design, Question Bank, production, validation, AI-assisted work, implementation, release, and future versions

## Mission Priority Constitution (Highest Priority)

# Mission Priority Constitution

These rules are permanent and override all normal development behavior.

==================================================
RULE 1 — Priority Protection
==================================================

The user's declared highest-priority objective must never be displaced by newly discovered technical tasks.

Before beginning any new task, always determine:

1. Is this task required to complete the current highest-priority objective?
2. Can it safely wait until after the current objective is finished?

If it can safely wait, it MUST be deferred.

Never interrupt the primary objective for:

- debugging
- refactoring
- optimization
- infrastructure improvements
- Stripe work
- OpenAI work
- cleanup
- investigations
- code quality improvements
- future-proofing
- any other technical discovery

unless that issue directly prevents completion of the current mission.

==================================================
RULE 2 — Owner Approval Before Priority Change
==================================================

Discovering a new bug or improvement NEVER automatically changes priorities.

Whenever a new issue is discovered:

1. Report the issue.
2. Explain its impact.
3. Clearly state whether it blocks the current mission.
4. If it does NOT block the mission,
   classify it as Deferred Work.
5. Ask the owner whether to:
      • Fix it now
      • Defer it
6. Wait for explicit owner approval before changing priorities.

Never assume a new issue is more important than the owner's declared objective.

==================================================
RULE 3 — Mission Lock
==================================================

Once the owner declares the mission for the current session, that mission becomes locked.

The assistant must stay on that mission until one of the following occurs:

• Mission completed
• Mission cancelled by the owner
• Owner explicitly changes priorities
• A true blocking issue makes completion impossible

No other topic may interrupt the mission.

If additional work is discovered, record it in Deferred Work and continue the locked mission.

==================================================
NEXTORY11 DEFAULT PRIORITY
==================================================

Unless the owner explicitly changes priorities, always follow this order:

1. Complete Result Scene and Design Master implementation.
2. Release the polished Production UI.
3. Public launch.
4. User acquisition and feedback.
5. Stripe end-to-end verification.
6. Premium Report verification.
7. Enable Paid CTA last.

==================================================
FINAL PRINCIPLE
==================================================

The owner's declared mission always has higher priority than newly discovered technical work.

Technical discoveries are reported.

Mission priority is preserved.

Priority changes require explicit owner approval.

Deferred work is recorded and handled only after the current mission is complete.

## Human Final Judgment Principle

### Permanent constitutional authority

The Human Final Judgment Principle is a permanent governing rule of the entire NEXTORY11 project.

It applies to:

- Every Design Master
- Every Psychological Core Profile
- Every Question Bank
- Every production workflow
- Every validation process
- Every promotion, retirement, replacement, and release decision
- Every AI-assisted task
- CODEX
- AI JUZA
- Every current and future NEXTORY11 version

NEXTORY11 is built through collaboration between Artificial Intelligence and Human Judgment.

**Artificial Intelligence supports.**

**Humans decide.**

The purpose of Artificial Intelligence is to improve quality, expand evidence, support disciplined reasoning, and strengthen human work. Its purpose is not to replace human judgment.

### Responsibilities of Artificial Intelligence

Artificial Intelligence, including CODEX and AI JUZA, shall function only within its authorized scope as:

- Analytical assistant
- Psychological analysis assistant
- Craftsmanship assistant
- Documentation assistant
- Quality inspection assistant
- Statistical verification assistant
- Duplication detection assistant
- Structural validation assistant
- Production support assistant

Artificial Intelligence may provide:

- Evidence
- Observations
- Analysis
- Comparisons
- Risk findings
- Validation results
- Recommendations
- Drafts within authorized scope

Artificial Intelligence shall never possess final approval authority.

Artificial Intelligence shall not convert its own analysis, confidence, score, classification, validation result, or recommendation into official approval.

Artificial Intelligence shall not approve, activate, promote, retire, replace, release, publish, deploy, or commercially accept any question, document, design, asset, feature, or NEXTORY11 version unless the required human authority has separately made and recorded that decision.

### Responsibilities of Human Judgment

Final judgment always belongs to humans.

Human judgment evaluates qualities that cannot be fully determined through mechanical, automated, or statistical analysis alone, including:

- Emotional authenticity
- Natural communication
- Psychological realism
- Human experience
- Commercial value
- Brand quality
- Cultural appropriateness
- Editorial quality
- Human dignity
- Overall product experience

Statistics may reveal patterns, risks, distributions, and uncertainty. Psychology may define hypotheses, boundaries, and intended meaning. Artificial Intelligence may organize and examine evidence. None of these replaces responsible human judgment about whether NEXTORY11 is genuinely suitable for people.

Human reviewers must consider available evidence without treating any single metric, automated conclusion, or prior approval as permanently decisive.

### Product Owner Authority

The Product Owner retains permanent final authority over:

- Design approval
- Psychological profile approval
- Question approval
- Question promotion
- Question retirement
- Question replacement and reactivation
- Release Candidate approval
- Internal Testing approval
- Closed Beta approval
- Public Beta approval
- Public Release approval
- Commercial acceptance
- Production authorization
- Constitutional approval and amendment

No Artificial Intelligence may override, bypass, simulate, presume, or silently substitute for these decisions.

The Product Owner may delegate a defined review responsibility to a named human authority. Delegation must be explicit, limited in scope, and documented. Delegation does not transfer the Product Owner's permanent constitutional authority.

### Human Review Principle

The permanent review sequence shall be:

1. **AI Analysis**

   Artificial Intelligence gathers evidence, performs authorized analysis, identifies uncertainty, and provides recommendations.

   ↓

2. **Human Psychological Review**

   Human reviewers assess psychological meaning, emotional authenticity, human dignity, motive separation, and real-world interpretation.

   ↓

3. **Editorial Review**

   Human reviewers assess natural language, cultural appropriateness, communication quality, brand quality, usability, and product experience.

   ↓

4. **Owner Judgment**

   The Product Owner evaluates the complete record and makes the final decision.

Only after Owner Judgment may a question, document, Design Master, production asset, release state, or other governed artifact become officially approved.

AI Analysis may be repeated at any stage when humans request additional evidence. Repetition does not change the order of final authority.

When Artificial Intelligence is not used, the absence of AI Analysis does not remove human authority. When human review or Owner Judgment is required, Artificial Intelligence cannot satisfy that requirement on a human's behalf.

### Evidence and approval separation

The following are evidence and do not constitute approval:

- Passing automated validation
- Passing structural validation
- Statistical balance
- High confidence from an AI system
- An AI-assigned quality score or classification
- Absence of detected duplication
- Preservation of IDs, targeting, weights, or coverage
- Successful tests or builds
- Previous candidate or review status
- Commercial performance alone

Official approval requires an explicit human decision and the applicable approval record.

Unknown, unavailable, conflicting, or incomplete evidence must remain visible to the human decision-maker. Artificial Intelligence shall not conceal uncertainty or convert missing evidence into an affirmative conclusion.

### Human judgment and future automation

No current or future automation, model, agent, statistical system, workflow engine, recommendation system, or AI capability may inherit final approval authority merely because it becomes more accurate, autonomous, efficient, or widely used.

Future tools may improve the quality and breadth of evidence. They remain advisory unless this Constitution is explicitly amended by the Product Owner. No subordinate document, Design Master, workflow, implementation, or runtime behavior may grant final authority to Artificial Intelligence.

### Constitutional philosophy

NEXTORY11 measures human psychology.

Therefore, the final judge of quality must always be human.

**Statistics support judgment.**

**Psychology guides judgment.**

**Human experience completes judgment.**

### Permanent constitutional rule

**AI is an advisor.**

**AI is not the final judge.**

**The Product Owner is the final authority.**

This principle shall remain valid for all future versions of NEXTORY11.

## Question Bank Development Constitution

### Permanent authority

All current and future Question Bank design, review, expansion, refinement, implementation, and validation is governed by the permanent principle:

> **Statistics × Psychology × Emotion**

The complete normative Q&A standard is defined in `Design/00_Design_Constitution.md` under **Permanent Q&A standard — Statistics × Psychology × Emotion**. That section, including its 11-type psychological differentiation map, is authoritative for Question Bank work and must be read before any question or answer is created or revised.

Psychology defines the internal motive to measure. Emotion places that motive in a realistic, relatable human situation. Statistics determines whether the distinction works in real use. Visible actions alone are not sufficient diagnostic evidence.

### Required development workflow

Question Bank work must proceed in this order:

1. Define the psychological hypothesis and the internal motives being distinguished.
2. Create an emotionally relatable situation.
3. Assign four clearly different inner motives to the answer IDs.
4. Write natural Japanese that a real person could feel or choose.
5. Review every option set for diagnostic overlap.
6. Review every option set for equal emotional and social legitimacy.
7. Remove wording that reveals the intended type through obvious archetype keywords.
8. Verify comparative readability at 360–390 px mobile widths.
9. Validate that protected structure is unchanged unless separately authorized.
10. Use real response data, when available, to validate distribution, discrimination, stability, and bias.

The protected structure includes question prompts when they are outside the authorized scope, question IDs, answer IDs, categories, weights, scoring metadata, personality targeting, selection logic, and session behavior.

### Diagnostic separation and neutrality gates

A Question Bank change is not a release candidate when:

- two answers express the same underlying motive
- options differ only by synonyms or minor action wording
- one option sounds uniquely kind, intelligent, courageous, responsible, safe, successful, or socially desirable
- archetype vocabulary makes the targeted type obvious
- wording is unnatural, overly abstract, difficult to scan, or unsuitable for mobile comparison
- a wording change materially changes interpretation without being documented and reviewed

Passing structural validation or preserving weights does not prove behavioral equivalence.

### Statistical validation process

When real usage data is available, Question Bank analysis must evaluate:

- answer selection rates
- unusually common or rare answers
- confusion between similar types
- question-level discrimination
- balance across all 11 types
- repeat-diagnosis stability
- distribution changes caused by wording revisions
- social-desirability and answer-position bias
- excessive correlation between similar questions
- questions that do not distinguish their intended types

Psychological hypotheses and statistical findings must be documented. Unsupported claims of scientific or clinical validity are prohibited.

### Product and safety boundary

NEXTORY11 is a self-understanding and entertainment-oriented diagnostic experience. It is not a clinical psychological test, medical assessment, psychiatric diagnosis, or scientifically validated personality instrument unless formal validation has actually been completed.

Question Bank content and results must not diagnose mental illness, trauma, personality disorders, or psychological conditions. Psychological concepts may be used only to improve empathy, self-reflection, emotional relevance, and diagnostic craftsmanship.

### Change authority

Documentation of this standard does not authorize Question Bank, scoring, runtime, session, or Production changes. Those changes remain subject to the active mission scope and explicit owner approval.

## Constitutional Approval Record

### Current constitutional state

- Constitution: NEXTORY11 Constitution / Development Rules
- Version: 1.1
- Status: Active — Permanent Governing Authority
- Approval authority: Product Owner
- Constitutional revision date: 2026-08-01
- Amendment: Human Final Judgment Principle
- Amendment scope: Entire NEXTORY11 project and all future versions
- Existing constitutional principles removed: No
- Existing philosophy replaced: No
- Design Masters modified by this amendment: No
- Question Bank content modified by this amendment: No
- Runtime, scoring, implementation, or Production modified by this amendment: No
- Final approval authority assigned to Artificial Intelligence: No
- Final approval authority retained by Product Owner: Yes

### Amendment approval statement

The Product Owner has directed that the Human Final Judgment Principle become part of the permanent NEXTORY11 Development Constitution.

This constitutional record confirms the principle's integration into Version 1.1. It does not independently approve any Design Master, Question Bank question, production asset, release candidate, beta, public release, commercial decision, implementation, or Production change.

## Constitutional Revision History

| Version | Date | Constitutional revision | Approval authority | Existing principles removed | Status |
|---|---|---|---|---|---|
| 1.0 | Prior constitutional baseline | Mission Priority Constitution and Question Bank Development Constitution established | Product Owner | No | Superseded by Version 1.1 while preserved in full |
| 1.1 | 2026-08-01 | Added the permanent Human Final Judgment Principle; added constitutional metadata, approval record, and revision history | Product Owner | No | Active |

## Final Constitutional Authority Statement

The NEXTORY11 Development Constitution Version 1.1 preserves every existing constitutional principle and establishes Human Final Judgment as a permanent governing requirement.

All NEXTORY11 work must treat Artificial Intelligence as an evidence-producing and quality-supporting advisor. Official approval remains a human act, and final authority remains with the Product Owner.
