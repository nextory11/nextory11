import { describe, expect, it } from "vitest";
import {
  FAQ_ITEMS,
  LEGAL_PAGES,
  SUPPORT_EMAIL,
  TRUST_LINKS,
  TRUST_ROUTES,
} from "../../src/data/trustContent.js";

describe("trust and legal content", () => {
  it("exposes every required trust destination", () => {
    expect(Object.keys(TRUST_ROUTES)).toEqual([
      "/terms",
      "/privacy",
      "/refund-policy",
      "/commercial-disclosure",
      "/operator",
      "/faq",
      "/why-nextory11",
      "/contact",
    ]);
    expect(TRUST_LINKS).toHaveLength(8);
    expect(new Set(TRUST_LINKS.map((link) => link.href)).size).toBe(8);
  });

  it("keeps every legal section populated", () => {
    for (const page of Object.values(LEGAL_PAGES)) {
      expect(page.title.trim()).not.toBe("");
      expect(page.lead.trim()).not.toBe("");
      expect(page.sections.length).toBeGreaterThanOrEqual(5);
      for (const [heading, paragraphs] of page.sections) {
        expect(heading.trim()).not.toBe("");
        expect(paragraphs.every((paragraph) => paragraph.trim().length > 0)).toBe(true);
      }
    }
  });

  it("publishes the verified operator details without the private account", () => {
    const publishedContent = JSON.stringify(LEGAL_PAGES);

    expect(publishedContent).toContain("TATSUMI DINING INC.");
    expect(publishedContent).toContain("HIROKI WATANABE");
    expect(publishedContent).toContain("Unit 123 – 3880 Westminster Highway");
    expect(publishedContent).toContain("+1 778-803-7077");
    expect(publishedContent).toContain(SUPPORT_EMAIL);
    expect(publishedContent).not.toContain("nextory11.official@gmail.com");
  });

  it("contains all requested FAQ topics with non-empty answers", () => {
    expect(FAQ_ITEMS).toHaveLength(12);
    expect(FAQ_ITEMS.every(([question, answer]) => question.trim() && answer.trim().length > 20)).toBe(true);
  });
});
