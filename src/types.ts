/**
 * Configuration interface for the content filter
 */
export interface FilterConfig {
  /** Enable profanity detection */
  enableProfanityFilter?: boolean;
  /** Enable explicit content detection */
  enableExplicitFilter?: boolean;
  /** Enable violence/harmful content detection */
  enableViolenceFilter?: boolean;
  /** Enable self-harm content detection */
  enableSelfHarmFilter?: boolean;
  /** Enable drug-related content detection */
  enableDrugsFilter?: boolean;
  /** Enable hate speech detection */
  enableHateSpeechFilter?: boolean;
  /** Enable mild content detection (gaming, technical terms, mild expressions) */
  enableMildFilter?: boolean;
  /** Custom words to add to the filter */
  customBannedWords?: string[];
  /** Words to allow (whitelist) */
  allowedWords?: string[];
  /** Case sensitive matching */
  caseSensitive?: boolean;
  /** Enable word boundary detection (prevents partial matches) */
  strictWordBoundaries?: boolean;
}

/**
 * Result of content moderation
 */
export interface ModerationResult {
  /** Whether the content is safe */
  isSafe: boolean;
  /** Reason for flagging if not safe */
  reason?: string;
  /** Specific words that were flagged */
  flaggedWords: string[];
  /** Categories of violations found */
  categories: string[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Original text */
  originalText: string;
  /** Cleaned version of the text */
  cleanedText: string;
  /** Severity level */
  severity: "low" | "medium" | "high";
}

/**
 * Detection category
 */
export interface DetectionCategory {
  name: string;
  keywords: string[];
  severity: "low" | "medium" | "high";
  description: string;
}
