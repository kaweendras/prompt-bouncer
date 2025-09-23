import {
  AIContentFilter,
  moderate,
  isSafe,
  clean,
  getFlaggedWords,
} from "../index";

describe("AIContentFilter", () => {
  let filter: AIContentFilter;

  beforeEach(() => {
    filter = new AIContentFilter();
  });

  describe("Basic Functionality", () => {
    test("should allow safe content", () => {
      const result = filter.moderate(
        "This is a beautiful sunset over mountains"
      );
      expect(result.isSafe).toBe(true);
      expect(result.flaggedWords).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });

    test("should detect profanity", () => {
      const result = filter.moderate("This is fucking terrible");
      expect(result.isSafe).toBe(false);
      expect(result.flaggedWords).toContain("fucking");
      expect(result.categories).toContain("profanity");
      expect(result.severity).toBe("medium");
    });

    test("should detect explicit content", () => {
      const result = filter.moderate("Show me nude photos");
      expect(result.isSafe).toBe(false);
      expect(result.flaggedWords).toContain("nude");
      expect(result.categories).toContain("explicit");
      expect(result.severity).toBe("high");
    });

    test("should detect violent content", () => {
      const result = filter.moderate("I want to kill someone");
      expect(result.isSafe).toBe(false);
      expect(result.flaggedWords).toContain("kill");
      expect(result.categories).toContain("violence");
      expect(result.severity).toBe("high");
    });
  });

  describe("Text Cleaning", () => {
    test("should clean profanity", () => {
      const cleaned = filter.clean("This is fucking terrible shit");
      expect(cleaned).toContain("*******"); // fucking replaced
      expect(cleaned).toContain("****"); // shit replaced
      expect(cleaned).not.toContain("fucking");
      expect(cleaned).not.toContain("shit");
    });

    test("should preserve safe words", () => {
      const text = "This is a beautiful day";
      const cleaned = filter.clean(text);
      expect(cleaned).toBe(text);
    });
  });

  describe("Configuration", () => {
    test("should respect disabled profanity filter", () => {
      const customFilter = new AIContentFilter({
        enableProfanityFilter: false,
        enableExplicitFilter: true,
        enableViolenceFilter: true,
      });

      const result = customFilter.moderate("This is fucking terrible");
      expect(result.isSafe).toBe(true); // Should be safe since profanity filter is disabled
    });

    test("should handle custom banned words", () => {
      const customFilter = new AIContentFilter({
        customBannedWords: ["customword", "anotherbad"],
      });

      const result = customFilter.moderate("This contains customword");
      expect(result.isSafe).toBe(false);
      expect(result.flaggedWords).toContain("customword");
    });

    test("should handle allowed words whitelist", () => {
      const customFilter = new AIContentFilter({
        allowedWords: ["damn"], // Allow 'damn' even though it's usually banned
      });

      const result = customFilter.moderate("Damn this is good");
      expect(result.isSafe).toBe(true); // Should be safe since 'damn' is whitelisted
    });

    test("should handle case sensitivity", () => {
      const caseSensitiveFilter = new AIContentFilter({
        caseSensitive: true,
      });

      const result1 = caseSensitiveFilter.moderate("FUCK");
      const result2 = caseSensitiveFilter.moderate("fuck");

      // Only lowercase should be detected in case-sensitive mode
      expect(result1.isSafe).toBe(true);
      expect(result2.isSafe).toBe(false);
    });
  });

  describe("Word Boundaries", () => {
    test("should respect strict word boundaries", () => {
      const strictFilter = new AIContentFilter({
        strictWordBoundaries: true,
      });

      // 'class' contains 'ass' but shouldn't be flagged with strict boundaries
      const result = strictFilter.moderate("This is a class");
      expect(result.isSafe).toBe(true);
    });

    test("should detect partial matches when strict boundaries disabled", () => {
      const looseFilter = new AIContentFilter({
        strictWordBoundaries: false,
      });

      const result = looseFilter.moderate("This is classy"); // contains 'ass'
      expect(result.isSafe).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty string", () => {
      const result = filter.moderate("");
      expect(result.isSafe).toBe(true);
      expect(result.flaggedWords).toHaveLength(0);
    });

    test("should handle null/undefined", () => {
      const result1 = filter.moderate(null as any);
      const result2 = filter.moderate(undefined as any);

      expect(result1.isSafe).toBe(true);
      expect(result2.isSafe).toBe(true);
    });

    test("should handle numbers and special characters", () => {
      const result = filter.moderate("123 !@# $%^ &*()");
      expect(result.isSafe).toBe(true);
    });
  });

  describe("Multiple Categories", () => {
    test("should detect multiple violation categories", () => {
      const result = filter.moderate("I want to kill and see nude photos");
      expect(result.isSafe).toBe(false);
      expect(result.categories).toContain("violence");
      expect(result.categories).toContain("explicit");
      expect(result.severity).toBe("high");
    });
  });
});

describe("Convenience Functions", () => {
  test("moderate function should work", () => {
    const result = moderate("This is fucking terrible");
    expect(result.isSafe).toBe(false);
    expect(result.flaggedWords).toContain("fucking");
  });

  test("isSafe function should work", () => {
    expect(isSafe("This is a nice day")).toBe(true);
    expect(isSafe("This is fucking terrible")).toBe(false);
  });

  test("clean function should work", () => {
    const cleaned = clean("This is fucking terrible");
    expect(cleaned).toContain("*******");
    expect(cleaned).not.toContain("fucking");
  });

  test("getFlaggedWords function should work", () => {
    const flagged = getFlaggedWords("This is fucking shit");
    expect(flagged).toContain("fucking");
    expect(flagged).toContain("shit");
  });
});
