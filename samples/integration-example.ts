// Example integration with AI applications using prompt-bouncer

import { moderate, AIContentFilter } from "prompt-bouncer";
import { Request, Response } from "express";

/**
 * Recommended configuration for most AI applications
 */
const DEFAULT_MODERATION_CONFIG = {
  enableProfanityFilter: true, // Block offensive language
  enableExplicitFilter: true, // Block adult content
  enableViolenceFilter: true, // Block violence and threats
  enableSelfHarmFilter: true, // Block self-harm content
  enableDrugsFilter: false, // Optional - depends on your use case
  enableHateSpeechFilter: true, // Block hate speech
  enableMildFilter: false, // Keep disabled - allow contextual usage
  strictWordBoundaries: true,
};

/**
 * Middleware for content moderation in your AI endpoints
 */
export const contentModerationMiddleware = (
  req: Request,
  res: Response,
  next: Function
) => {
  const { prompt, negative_prompt } = req.body;

  // Check main prompt
  if (prompt) {
    const moderationResult = moderate(prompt, DEFAULT_MODERATION_CONFIG);

    // Use severity-based logic for better UX
    const shouldAllow =
      moderationResult.isSafe || moderationResult.severity === "low";

    if (!shouldAllow) {
      return res.status(400).json({
        success: false,
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
    const negModerationResult = moderate(
      negative_prompt,
      DEFAULT_MODERATION_CONFIG
    );
    const shouldAllowNegative =
      negModerationResult.isSafe || negModerationResult.severity === "low";

    if (!shouldAllowNegative) {
      return res.status(400).json({
        success: false,
        message: "Negative prompt violates our community guidelines",
        data: {
          type: "MODERATION_VIOLATION",
          field: "negative_prompt",
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
 * Enhanced AI content controller with built-in moderation
 */
export const enhancedAIContentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { prompt, negative_prompt, ...otherParams } = req.body;

    // Built-in moderation (alternative to middleware)
    const moderationResult = moderate(prompt, DEFAULT_MODERATION_CONFIG);
    const shouldAllow =
      moderationResult.isSafe || moderationResult.severity === "low";

    if (!shouldAllow) {
      console.log(`Content moderation violation:`, {
        reason: moderationResult.reason,
        categories: moderationResult.categories,
        flaggedWords: moderationResult.flaggedWords,
        severity: moderationResult.severity,
        userEmail: req.body.userEmail || "unknown",
      });

      return res.status(400).json({
        success: false,
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

    // Your existing AI generation logic here...
    // const result = await generateContent(prompt, otherParams);
    // res.json({ success: true, data: result });

    res.json({
      success: true,
      message: "Content approved",
      moderation: {
        severity: moderationResult.severity,
        categories: moderationResult.categories,
      },
    });
  } catch (error) {
    console.error("Error in enhanced AI content controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Frontend integration example for React components
 */
export const useFrontendModeration = () => {
  const checkContent = (text: string) => {
    // Client-side pre-validation (less strict than server-side)
    const result = moderate(text, {
      enableProfanityFilter: true,
      enableExplicitFilter: true,
      enableViolenceFilter: true,
      enableSelfHarmFilter: true,
      enableDrugsFilter: false, // Optional for frontend
      enableHateSpeechFilter: true,
      enableMildFilter: false, // Allow contextual usage
      strictWordBoundaries: true,
    });

    // Use severity-based logic for better UX
    const shouldAllow = result.isSafe || result.severity === "low";

    return {
      isSafe: result.isSafe,
      shouldAllow,
      message: shouldAllow
        ? "Content looks good!"
        : `Content contains ${result.categories.join(", ")} violations`,
      severity: result.severity,
      cleanedText: result.cleanedText,
      categories: result.categories,
    };
  };

  return { checkContent };
};

/**
 * Specialized configurations for different use cases
 */
export const MODERATION_CONFIGS = {
  // Strict mode for professional/corporate environments
  STRICT: {
    enableProfanityFilter: true,
    enableExplicitFilter: true,
    enableViolenceFilter: true,
    enableSelfHarmFilter: true,
    enableDrugsFilter: true, // Enable drugs filter in strict mode
    enableHateSpeechFilter: true,
    enableMildFilter: true, // Enable mild filter for strictest control
    strictWordBoundaries: true,
  },

  // Gaming/Creative mode - allows contextual usage
  CREATIVE: {
    enableProfanityFilter: true,
    enableExplicitFilter: true,
    enableViolenceFilter: true, // Still block real threats
    enableSelfHarmFilter: true,
    enableDrugsFilter: false,
    enableHateSpeechFilter: true,
    enableMildFilter: false, // Allow gaming/creative terms
    strictWordBoundaries: true,
  },

  // Educational mode - balanced approach
  EDUCATIONAL: {
    enableProfanityFilter: true,
    enableExplicitFilter: true,
    enableViolenceFilter: true,
    enableSelfHarmFilter: true,
    enableDrugsFilter: false, // Context-dependent
    enableHateSpeechFilter: true,
    enableMildFilter: false, // Allow academic discussions
    strictWordBoundaries: true,
  },
};

// Usage examples in your existing application:

/* === EXPRESS.JS ROUTES ===
import express from 'express';
import { contentModerationMiddleware, MODERATION_CONFIGS } from './integration-example';

const router = express.Router();

// Apply moderation to all AI generation routes
router.post('/text-to-image', contentModerationMiddleware, textToImageController);
router.post('/chat-completion', contentModerationMiddleware, chatController);
router.post('/content-generation', contentModerationMiddleware, contentController);

// Use different configs for different endpoints
const strictFilter = new AIContentFilter(MODERATION_CONFIGS.STRICT);
const creativeFilter = new AIContentFilter(MODERATION_CONFIGS.CREATIVE);

router.post('/professional-content', (req, res, next) => {
  const result = strictFilter.moderate(req.body.prompt);
  if (!result.isSafe && result.severity !== "low") {
    return res.status(400).json({ error: result.reason });
  }
  next();
}, professionalContentController);
*/

/* === REACT COMPONENT EXAMPLE ===
import React, { useState } from 'react';
import { useFrontendModeration } from './integration-example';

function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const { checkContent } = useFrontendModeration();
  
  const handleSubmit = () => {
    const moderation = checkContent(prompt);
    
    if (!moderation.shouldAllow) {
      alert(`Content issue: ${moderation.message}`);
      return;
    }
    
    // Proceed with API call
    submitPrompt(prompt);
  };
  
  return (
    <div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={handleSubmit}>Generate</button>
    </div>
  );
}
*/

/* === NEXT.JS API ROUTE ===
// pages/api/moderate.ts or app/api/moderate/route.ts
import { moderate, MODERATION_CONFIGS } from '../../samples/integration-example';

export async function POST(request: Request) {
  const { text, config = 'CREATIVE' } = await request.json();
  
  const moderationConfig = MODERATION_CONFIGS[config] || MODERATION_CONFIGS.CREATIVE;
  const result = moderate(text, moderationConfig);
  const shouldAllow = result.isSafe || result.severity === "low";
  
  return Response.json({
    isSafe: result.isSafe,
    shouldAllow,
    severity: result.severity,
    categories: result.categories,
    reason: result.reason,
  });
}
*/
