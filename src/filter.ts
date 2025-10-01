import { FilterConfig, ModerationResult } from "./types";
import { DETECTION_CATEGORIES, getAllKeywords } from "./wordLists";

/**
 * Default configuration for the content filter
 */
const DEFAULT_CONFIG: Required<FilterConfig> = {
  enableProfanityFilter: true,
  enableExplicitFilter: true,
  enableViolenceFilter: true,
  enableSelfHarmFilter: true,
  enableDrugsFilter: false,
  enableHateSpeechFilter: true,
  enableMildFilter: false, // Disabled by default - allows contextual usage
  customBannedWords: [],
  allowedWords: [],
  caseSensitive: false,
  strictWordBoundaries: true,
};

/**
 * AI Content Filter - Main class for content moderation
 */
export class AIContentFilter {
  private config: Required<FilterConfig>;
  private bannedWords: Set<string>;
  private allowedWords: Set<string>;

  constructor(config: FilterConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bannedWords = new Set();
    // Normalize allowed words for case sensitivity
    this.allowedWords = new Set(
      this.config.allowedWords.map((word) =>
        this.config.caseSensitive ? word : word.toLowerCase()
      )
    );
    this.initializeBannedWords();
  }

  /**
   * Initialize the banned words list based on configuration
   */
  private initializeBannedWords(): void {
    // Add words from enabled categories
    Object.entries(DETECTION_CATEGORIES).forEach(([categoryName, category]) => {
      const shouldInclude = this.shouldIncludeCategory(categoryName);
      if (shouldInclude) {
        category.keywords.forEach((word) => {
          const processedWord = this.config.caseSensitive
            ? word
            : word.toLowerCase();
          this.bannedWords.add(processedWord);
        });
      }
    });

    // Add custom banned words
    this.config.customBannedWords.forEach((word) => {
      const processedWord = this.config.caseSensitive
        ? word
        : word.toLowerCase();
      this.bannedWords.add(processedWord);
    });
  }

  /**
   * Check if a category should be included based on config
   */
  private shouldIncludeCategory(categoryName: string): boolean {
    switch (categoryName) {
      case "profanity":
        return this.config.enableProfanityFilter;
      case "explicit":
        return this.config.enableExplicitFilter;
      case "violence":
        return this.config.enableViolenceFilter;
      case "self_harm":
        return this.config.enableSelfHarmFilter;
      case "drugs":
        return this.config.enableDrugsFilter;
      case "hate":
        return this.config.enableHateSpeechFilter;
      case "mild":
        return this.config.enableMildFilter;
      default:
        return false; // Don't include unknown categories
    }
  }

  /**
   * Normalize text for processing
   */
  private normalizeText(text: string): string {
    if (!this.config.caseSensitive) {
      text = text.toLowerCase();
    }

    // Replace common character substitutions
    const substitutions: Record<string, string> = {
      "@": "a",
      "3": "e",
      "1": "i",
      "0": "o",
      "5": "s",
      "7": "t",
      $: "s",
      "!": "i",
    };

    let normalized = text;
    Object.entries(substitutions).forEach(([char, replacement]) => {
      // Escape special regex characters
      const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      normalized = normalized.replace(
        new RegExp(escapedChar, "g"),
        replacement
      );
    });

    return normalized;
  }

  /**
   * Extract words from text
   */
  private extractWords(text: string): string[] {
    // Remove punctuation and split by whitespace
    const cleanText = text.replace(/[^\w\s]/g, " ");
    return cleanText.split(/\s+/).filter((word) => word.length > 0);
  }

  /**
   * Check if a word matches any banned word
   */
  private isWordBanned(word: string): {
    isBanned: boolean;
    matchedWord?: string;
    category?: string;
  } {
    const normalizedWord = this.normalizeText(word);

    // Check if word is in allowed list
    if (this.allowedWords.has(normalizedWord)) {
      return { isBanned: false };
    }

    // Check exact matches
    if (this.bannedWords.has(normalizedWord)) {
      return {
        isBanned: true,
        matchedWord: normalizedWord,
        category: this.getCategoryForWord(normalizedWord),
      };
    }

    // Check for partial matches if strict word boundaries is disabled
    if (!this.config.strictWordBoundaries) {
      for (const bannedWord of this.bannedWords) {
        if (
          normalizedWord.includes(bannedWord) ||
          bannedWord.includes(normalizedWord)
        ) {
          return {
            isBanned: true,
            matchedWord: bannedWord,
            category: this.getCategoryForWord(bannedWord),
          };
        }
      }
    }

    return { isBanned: false };
  }

  /**
   * Get category for a specific word
   */
  private getCategoryForWord(word: string): string {
    for (const [categoryName, category] of Object.entries(
      DETECTION_CATEGORIES
    )) {
      // Check if the word exists in this category's keywords
      // Handle case sensitivity properly by comparing lowercased versions
      const wordExists = category.keywords.some((keyword) => {
        const processedKeyword = this.config.caseSensitive
          ? keyword
          : keyword.toLowerCase();
        const processedWord = this.config.caseSensitive
          ? word
          : word.toLowerCase();
        return processedKeyword === processedWord;
      });

      if (wordExists) {
        return categoryName;
      }
    }
    return "custom";
  }

  /**
   * Get severity for categories
   */
  private getSeverityForCategories(
    categories: string[]
  ): "low" | "medium" | "high" {
    if (
      categories.some((cat) => DETECTION_CATEGORIES[cat]?.severity === "high")
    ) {
      return "high";
    }
    if (
      categories.some((cat) => DETECTION_CATEGORIES[cat]?.severity === "medium")
    ) {
      return "medium";
    }
    return "low";
  }

  /**
   * Clean text by replacing banned words
   */
  private cleanText(text: string, flaggedWords: string[]): string {
    let cleaned = text;

    flaggedWords.forEach((word) => {
      const replacement = "*".repeat(word.length);
      const regex = new RegExp(
        `\\b${word}\\b`,
        this.config.caseSensitive ? "g" : "gi"
      );
      cleaned = cleaned.replace(regex, replacement);
    });

    return cleaned;
  }

  /**
   * Main moderation function
   */
  public moderate(text: string): ModerationResult {
    if (!text || typeof text !== "string") {
      return {
        isSafe: true,
        flaggedWords: [],
        categories: [],
        confidence: 0,
        originalText: text || "",
        cleanedText: text || "",
        severity: "low",
      };
    }

    const flaggedWords: string[] = [];
    const categories: Set<string> = new Set();
    const normalizedText = this.normalizeText(text);

    // First, check for multi-word phrases (higher priority)
    this.bannedWords.forEach((bannedWord) => {
      if (bannedWord.includes(" ")) {
        // Multi-word phrase
        const regex = this.config.strictWordBoundaries
          ? new RegExp(
              `\\b${bannedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
              this.config.caseSensitive ? "g" : "gi"
            )
          : new RegExp(
              bannedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              this.config.caseSensitive ? "g" : "gi"
            );

        if (regex.test(this.config.caseSensitive ? text : normalizedText)) {
          flaggedWords.push(bannedWord);
          const category = this.getCategoryForWord(bannedWord);
          if (category) {
            categories.add(category);
          }
        }
      }
    });

    // Then check individual words (only if not part of an already flagged phrase)
    const words = this.extractWords(text);
    words.forEach((word) => {
      const result = this.isWordBanned(word);
      if (result.isBanned && result.matchedWord) {
        // Check if this word is part of an already detected phrase
        const isPartOfPhrase = flaggedWords.some(
          (flaggedPhrase) =>
            flaggedPhrase.includes(" ") &&
            flaggedPhrase.includes(result.matchedWord!)
        );

        if (!isPartOfPhrase) {
          flaggedWords.push(result.matchedWord);
          if (result.category) {
            categories.add(result.category);
          }
        }
      }
    });

    const categoriesArray = Array.from(categories);
    const isSafe = flaggedWords.length === 0;
    const severity = this.getSeverityForCategories(categoriesArray);
    const confidence =
      flaggedWords.length > 0 ? Math.min(flaggedWords.length * 0.25, 1.0) : 0;

    return {
      isSafe,
      reason: !isSafe
        ? `Content contains ${categoriesArray.join(", ")} violations`
        : undefined,
      flaggedWords: [...new Set(flaggedWords)], // Remove duplicates
      categories: categoriesArray,
      confidence,
      originalText: text,
      cleanedText: this.cleanText(text, flaggedWords),
      severity,
    };
  }

  /**
   * Quick boolean check if content is safe
   */
  public isSafe(text: string): boolean {
    return this.moderate(text).isSafe;
  }

  /**
   * Get only flagged words
   */
  public getFlaggedWords(text: string): string[] {
    return this.moderate(text).flaggedWords;
  }

  /**
   * Get cleaned version of text
   */
  public clean(text: string): string {
    return this.moderate(text).cleanedText;
  }

  /**
   * Add custom words to banned list
   */
  public addBannedWords(words: string[]): void {
    words.forEach((word) => {
      const processedWord = this.config.caseSensitive
        ? word
        : word.toLowerCase();
      this.bannedWords.add(processedWord);
    });

    // Persist to config - avoid duplicates
    const newWords = words.filter(
      (word) => !this.config.customBannedWords.includes(word)
    );
    this.config.customBannedWords = [
      ...this.config.customBannedWords,
      ...newWords,
    ];
  }

  /**
   * Remove words from banned list
   */
  public removeBannedWords(words: string[]): void {
    words.forEach((word) => {
      const processedWord = this.config.caseSensitive
        ? word
        : word.toLowerCase();
      this.bannedWords.delete(processedWord);
    });

    // Remove from config
    this.config.customBannedWords = this.config.customBannedWords.filter(
      (configWord) => !words.includes(configWord)
    );
  }

  /**
   * Add words to allowed list
   */
  public addAllowedWords(words: string[]): void {
    words.forEach((word) => {
      const processedWord = this.config.caseSensitive
        ? word
        : word.toLowerCase();
      this.allowedWords.add(processedWord);
    });

    // Persist to config - avoid duplicates
    const newWords = words.filter(
      (word) => !this.config.allowedWords.includes(word)
    );
    this.config.allowedWords = [...this.config.allowedWords, ...newWords];
  }

  /**
   * Get current configuration
   */
  public getConfig(): FilterConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<FilterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.bannedWords.clear();
    // Normalize allowed words for case sensitivity
    this.allowedWords = new Set(
      this.config.allowedWords.map((word) =>
        this.config.caseSensitive ? word : word.toLowerCase()
      )
    );
    this.initializeBannedWords();
  }
}
