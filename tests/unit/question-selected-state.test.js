import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("question answer selected state", () => {
  it("binds the saved answer to a visible and accessible pressed state", async () => {
    const component = await readFile("src/components/QuestionCard.jsx", "utf8");
    const styles = await readFile("src/styles/question.css", "utf8");

    expect(component).toContain("setSelectedAnswerId(savedAnswerId)");
    expect(component).toContain("aria-pressed={selectedAnswerId === (answer.id ?? answer.text)}");
    expect(component).toContain("answerButton__selectedStatus");
    expect(component).toContain("選択中");
    expect(styles).toContain(".answerButton--selected:focus-visible");
    expect(styles).toContain(".answerButton__selectedStatus");
  });
});
