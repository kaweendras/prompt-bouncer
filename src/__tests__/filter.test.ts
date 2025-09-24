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
      const result = filter.moderate("I want to murder someone");
      expect(result.isSafe).toBe(false);
      expect(result.flaggedWords).toContain("murder");
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
      const result = filter.moderate("I want to murder and see nude photos");
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

describe("Phrase vs Word Context Detection", () => {
  const filter = new AIContentFilter();

  test("should detect violent phrase 'want to kill you' as violence", () => {
    const result = filter.moderate("want to kill you");
    expect(result.isSafe).toBe(false);
    expect(result.categories).toContain("violence");
    // Should detect both "want to kill" and "kill you" phrases
    expect(result.flaggedWords).toContain("want to kill");
    expect(result.flaggedWords).toContain("kill you");
    expect(result.severity).toBe("high");
  });

  test("should allow 'i killed the bugs' as safe context", () => {
    const result = filter.moderate("i killed the bugs");
    expect(result.isSafe).toBe(true);
    expect(result.categories).not.toContain("violence");
    expect(result.flaggedWords).toHaveLength(0);
  });

  test("should allow 'that movie was fire' as safe (mild filter disabled)", () => {
    const result = filter.moderate("that movie was fire");
    // With enableMildFilter: false (default), "fire" is not flagged
    expect(result.isSafe).toBe(true);
    expect(result.categories).not.toContain("mild");
    expect(result.categories).not.toContain("violence");
    expect(result.flaggedWords).toHaveLength(0);
    expect(result.severity).toBe("low");
  });

  test("should detect 'I want to set fire on someone' as violence", () => {
    const result = filter.moderate("I want to set fire on someone");
    // Should be detected as violence (arson threat)
    expect(result.isSafe).toBe(false);
    expect(result.categories).toContain("violence");
    expect(result.flaggedWords).toContain("set fire on");
    expect(result.flaggedWords).toContain("want to set fire");
    expect(result.severity).toBe("high");
  });

  test("should prioritize violence phrases over individual mild words", () => {
    const result = filter.moderate("I want to kill him now");
    expect(result.isSafe).toBe(false);
    expect(result.categories).toContain("violence");
    // Should detect both "want to kill" and "kill him" as violence phrases
    expect(result.flaggedWords.some((word) => word.includes("kill"))).toBe(
      true
    );
    expect(result.severity).toBe("high");
  });

  test("should handle multiple context scenarios correctly", () => {
    // Actually safe contexts (no flagged words)
    const safeCases = [
      "I killed time waiting",
      "That joke killed me (laughing)",
    ];

    safeCases.forEach((text) => {
      const result = filter.moderate(text);
      expect(result.isSafe).toBe(true);
      expect(result.flaggedWords).toHaveLength(0);
    });

    // Additional safe contexts (now that mild filter is disabled by default)
    const additionalSafeCases = [
      "This song is fire",
      "The fire was warm",
      "Kill the process in task manager",
    ];

    additionalSafeCases.forEach((text) => {
      const result = filter.moderate(text);
      expect(result.isSafe).toBe(true);
      expect(result.flaggedWords).toHaveLength(0);
    });

    // Violent contexts (high severity phrases)
    const violentCases = [
      "want to kill you",
      "I want to shoot him",
      "want to stab someone",
      "kill you now",
    ];

    violentCases.forEach((text) => {
      const result = filter.moderate(text);
      expect(result.isSafe).toBe(false);
      expect(result.categories).toContain("violence");
      expect(result.severity).toBe("high");
    });
  });

  test("should demonstrate phrase vs individual word context", () => {
    // Individual word "kill" in technical context vs violent phrase context
    const technicalResult = filter.moderate(
      "I need to kill this bug in my code"
    );
    const violentResult = filter.moderate("I want to kill you");

    // Bug killing should be safe (mild filter disabled, no violent phrases)
    expect(technicalResult.isSafe).toBe(true);
    expect(technicalResult.categories).toHaveLength(0);
    expect(technicalResult.flaggedWords).toHaveLength(0);
    expect(technicalResult.severity).toBe("low");

    // Threat should be violence (phrase "want to kill" + "kill you" flagged)
    expect(violentResult.isSafe).toBe(false);
    expect(violentResult.categories).toContain("violence");
    expect(violentResult.flaggedWords).toContain("want to kill");
    expect(violentResult.flaggedWords).toContain("kill you");
    expect(violentResult.severity).toBe("high");

    // The violence case should have higher severity than technical usage
    expect(violentResult.severity).toBe("high");
    expect(technicalResult.severity).toBe("low");
  });

  test("should allow users to enable mild filter if desired", () => {
    // Create filter with mild detection enabled
    const strictFilter = new AIContentFilter({
      enableMildFilter: true,
    });

    const result = strictFilter.moderate("This song is fire");

    // With mild filter enabled, should flag "fire"
    expect(result.isSafe).toBe(false);
    expect(result.categories).toContain("mild");
    expect(result.flaggedWords).toContain("fire");
    expect(result.severity).toBe("low");
  });

  test("should properly detect arson-related violence phrases", () => {
    const arsonPhrases = [
      "I want to set fire on someone",
      "I will set fire to the building",
      "want to burn someone",
      "burn you alive",
    ];

    const safeFire = [
      "that movie was fire",
      "fire the employee",
      "the campfire was warm",
      "fire up the engine",
    ];

    // Violent arson phrases should be flagged
    arsonPhrases.forEach((text) => {
      const result = filter.moderate(text);
      expect(result.isSafe).toBe(false);
      expect(result.categories).toContain("violence");
      expect(result.severity).toBe("high");
    });

    // Safe fire-related phrases should pass
    safeFire.forEach((text) => {
      const result = filter.moderate(text);
      expect(result.isSafe).toBe(true);
      expect(result.categories).not.toContain("violence");
    });
  });
});
