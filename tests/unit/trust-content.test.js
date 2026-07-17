import { describe, expect, it } from "vitest";
import { FAQ_ITEMS, LEGAL_PAGES, TRUST_LINKS, TRUST_ROUTES } from "../../src/data/trustContent.js";

describe("trust and legal content", () => {
  it("exposes every required trust destination", () => {
    expect(Object.keys(TRUST_ROUTES)).toEqual([
      "/terms", "/privacy", "/refund-policy", "/faq", "/why-nextory11", "/contact",
    ]);
    expect(TRUST_LINKS).toHaveLength(6);
    expect(new Set(TRUST_LINKS.map((link) => link.href)).size).toBe(6);
  });

  it("keeps every legal section populated", () => {
    for (const page of Object.values(LEGAL_PAGES)) {
      expect(page.title.trim()).not.toBe("");
      expect(page.lead.trim()).not.toBe("");
      expect(page.sections.length).toBeGreaterThanOrEqual(5);
      for (const [heading, paragraphs] of page.sections) {
        expect(heading.trim()).not.toBe("");
        expect(paragraphs.every((paragraph) => paragraph.trim().length > 20)).toBe(true);
      }
    }
  });

  it("contains all requested FAQ topics with non-empty answers", () => {
    expect(FAQ_ITEMS).toHaveLength(12);
    expect(FAQ_ITEMS.every(([question, answer]) => question.trim() && answer.trim().length > 20)).toBe(true);
  });
});
