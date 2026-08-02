import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { auditQuestionBank } from "../../scripts/audit-question-bank-semantics.mjs";

const approved = JSON.parse(fs.readFileSync("src/data/questionBank/nextory11-question-pack-v1.json", "utf8"));
const fixture = () => structuredClone(approved);

function expectFailure(pack, pattern) {
  const result = auditQuestionBank(pack);
  expect(result.status).toBe("FAIL");
  expect(result.failures.some((failure) => pattern.test(failure))).toBe(true);
}

describe("Question Bank V2 semantic audit", () => {
  it("accepts the approved V2 bank without modifying it", () => {
    const pack = fixture();
    const before = JSON.stringify(pack);
    expect(auditQuestionBank(pack)).toMatchObject({ status: "PASS", questions: 220, answers: 880, failures: [] });
    expect(JSON.stringify(pack)).toBe(before);
  });

  it("rejects deliberately duplicated question wording", () => {
    const pack = fixture();
    pack.questions[1].text.ja = pack.questions[0].text.ja;
    expectFailure(pack, /Duplicate question wording/u);
  });

  it("rejects deliberately duplicated answer wording", () => {
    const pack = fixture();
    pack.questions[0].options[1].text.ja = pack.questions[0].options[0].text.ja;
    expectFailure(pack, /Duplicate answer wording/u);
  });

  it.each(["", "TODO", "placeholder", "\uFFFDbroken"])("rejects malformed or placeholder wording: %s", (wording) => {
    const pack = fixture();
    pack.questions[0].options[0].text.ja = wording;
    expectFailure(pack, /empty or malformed|placeholder|broken characters/u);
  });

  it("does not require legacy canonical wording", () => {
    const pack = fixture();
    pack.questions[0].text.ja = "承認済みの語句と異なる、重複しない有効な問いですか？";
    expect(auditQuestionBank(pack).status).toBe("PASS");
  });
});
