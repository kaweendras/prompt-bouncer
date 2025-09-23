// Export main classes and functions
export { AIContentFilter } from "./filter";
export {
  DETECTION_CATEGORIES,
  getAllKeywords,
  getKeywordsByCategory,
  getCategoryNames,
} from "./wordLists";
export type {
  FilterConfig,
  ModerationResult,
  DetectionCategory,
} from "./types";

// Convenience functions for quick use
import { AIContentFilter } from "./filter";

/**
 * Create a filter instance with default settings
 */
export const createFilter = (
  config?: import("./types").FilterConfig
): AIContentFilter => {
  return new AIContentFilter(config);
};

/**
 * Quick moderation function with default settings
 */
export const moderate = (
  text: string,
  config?: import("./types").FilterConfig
): import("./types").ModerationResult => {
  const filter = new AIContentFilter(config);
  return filter.moderate(text);
};

/**
 * Quick safety check with default settings
 */
export const isSafe = (
  text: string,
  config?: import("./types").FilterConfig
): boolean => {
  const filter = new AIContentFilter(config);
  return filter.isSafe(text);
};

/**
 * Quick text cleaning with default settings
 */
export const clean = (
  text: string,
  config?: import("./types").FilterConfig
): string => {
  const filter = new AIContentFilter(config);
  return filter.clean(text);
};

/**
 * Get flagged words with default settings
 */
export const getFlaggedWords = (
  text: string,
  config?: import("./types").FilterConfig
): string[] => {
  const filter = new AIContentFilter(config);
  return filter.getFlaggedWords(text);
};

// Default export
export default AIContentFilter;
