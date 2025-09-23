// Example integration with your existing workers-ai-cloudflare project

import { moderate } from "@kaweendras/ai-content-filter";
import { Request, Response } from "express";

/**
 * Middleware for content moderation in your AI image generation endpoints
 */
export const contentModerationMiddleware = (
  req: Request,
  res: Response,
  next: Function
) => {
  const { prompt, negative_prompt } = req.body;

  // Check main prompt
  if (prompt) {
    const moderationResult = moderate(prompt);

    if (!moderationResult.isSafe) {
      return res.status(400).json({
        success: "false",
        message: "Content violates our community guidelines",
        data: {
          type: "MODERATION_VIOLATION",
          reason: moderationResult.reason,
          categories: moderationResult.categories,
          flaggedWords: moderationResult.flaggedWords,
          severity: moderationResult.severity,
          suggestion:
            "Please revise your prompt to comply with our content policy",
        },
      });
    }
  }

  // Check negative prompt if provided
  if (negative_prompt) {
    const negModerationResult = moderate(negative_prompt);

    if (!negModerationResult.isSafe) {
      return res.status(400).json({
        success: "false",
        message: "Negative prompt violates our community guidelines",
        data: {
          type: "MODERATION_VIOLATION",
          reason: negModerationResult.reason,
          categories: negModerationResult.categories,
          flaggedWords: negModerationResult.flaggedWords,
          severity: negModerationResult.severity,
          suggestion:
            "Please revise your negative prompt to comply with our content policy",
        },
      });
    }
  }

  next();
};

/**
 * Enhanced text-to-image controller with built-in moderation
 */
export const enhancedTextToImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { prompt, negative_prompt, ...otherParams } = req.body;

    // Built-in moderation (alternative to middleware)
    const moderationResult = moderate(prompt, {
      enableProfanityFilter: true,
      enableExplicitFilter: true,
      enableViolenceFilter: true,
      strictWordBoundaries: true,
    });

    if (!moderationResult.isSafe) {
      console.log(`Content moderation violation:`, {
        reason: moderationResult.reason,
        categories: moderationResult.categories,
        flaggedWords: moderationResult.flaggedWords,
        userEmail: req.body.userEmail || "unknown",
      });

      return res.status(400).json({
        success: "false",
        message: "Content violates our community guidelines",
        data: {
          type: "MODERATION_VIOLATION",
          reason: moderationResult.reason,
          categories: moderationResult.categories,
          severity: moderationResult.severity,
          suggestion:
            "Please revise your prompt to comply with our content policy",
        },
      });
    }

    // Your existing image generation logic here...
    // const result = await generateImage(params);
    // res.json(result);
  } catch (error) {
    console.error("Error in enhanced text-to-image controller:", error);
    res.status(500).json({
      success: "false",
      message: "Internal server error",
    });
  }
};

/**
 * Frontend integration example for React components
 */
export const useFrontendModeration = () => {
  const checkContent = (text: string) => {
    // Quick client-side check before API call
    const result = moderate(text, {
      enableProfanityFilter: true,
      enableExplicitFilter: true,
      enableViolenceFilter: false, // Be less strict on frontend
      strictWordBoundaries: true,
    });

    return {
      isSafe: result.isSafe,
      message: result.isSafe
        ? "Content looks good!"
        : `Content contains ${result.categories.join(", ")} violations`,
      severity: result.severity,
      cleanedText: result.cleanedText,
    };
  };

  return { checkContent };
};

// Usage in your existing routes:
/*
import express from 'express';
import { contentModerationMiddleware } from './moderation';

const router = express.Router();

// Apply moderation to all image generation routes
router.post('/text-to-image', contentModerationMiddleware, textToImageController);
router.post('/lucid-origin-tti', contentModerationMiddleware, lucidOriginTTIController);
router.post('/sdxl', contentModerationMiddleware, sdxlController);
router.post('/image-to-image', contentModerationMiddleware, imageToImageController);
router.post('/inpaint', contentModerationMiddleware, inpaintImageController);
router.post('/nano-banana', contentModerationMiddleware, nanaoBananaController);
*/
