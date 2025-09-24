# 🔧 Quick Integration Guide

### 1. Install the Package

```bash
# Navigate to your project directory
cd /path/to/your/project
npm install prompt-bouncer
```

### 2. Create Moderation Service

Create a new file: `src/services/moderationService.ts`

```typescript
import { moderate, AIContentFilter, FilterConfig } from "prompt-bouncer";

// Default configuration for your AI service
const defaultConfig: FilterConfig = {
  enableProfanityFilter: true,
  enableExplicitFilter: true,
  enableViolenceFilter: true,
  enableDrugsFilter: false,
  enableHateSpeechFilter: true,
  enableSelfHarmFilter: true,
  caseSensitive: false,
  strictWordBoundaries: true,
  customBannedWords: [],
  allowedWords: [],
};

// Quick moderation function
export const moderatePrompt = (text: string) => {
  return moderate(text, defaultConfig);
};

// Create reusable filter instance
export const aiContentFilter = new AIContentFilter(defaultConfig);

// Moderate with custom settings
export const moderateWithCustomSettings = (
  text: string,
  customConfig: Partial<FilterConfig>
) => {
  const config = { ...defaultConfig, ...customConfig };
  return moderate(text, config);
};

// Batch moderation for multiple texts
export const moderateMultipleTexts = (texts: string[]) => {
  return texts.map((text) => ({
    text,
    result: moderatePrompt(text),
  }));
};
```

### 3. Update Your Controller

Example integration with an Express.js controller:

```typescript
import { moderatePrompt } from "../services/moderationService";

// Example: AI content generation controller
export const aiContentController = async (req: Request, res: Response) => {
  try {
    const { prompt, negative_prompt } = req.body;

    // 🛡️ CONTENT MODERATION - Add this before your existing logic
    const moderationResult = moderatePrompt(prompt);

    if (!moderationResult.isSafe) {
      return res.status(400).json({
        success: false,
        message: "Content violates our community guidelines",
        data: {
          type: "MODERATION_VIOLATION",
          reason: moderationResult.reason,
          categories: moderationResult.categories,
          severity: moderationResult.severity,
          blockedWords: moderationResult.blockedWords,
        },
      });
    }

    // Optional: Also moderate additional prompts if provided
    if (negative_prompt) {
      const negativePromptModeration = moderatePrompt(negative_prompt);
      if (!negativePromptModeration.isSafe) {
        return res.status(400).json({
          success: false,
          message: "Additional prompt violates our community guidelines",
          data: {
            type: "MODERATION_VIOLATION",
            field: "negative_prompt",
            reason: negativePromptModeration.reason,
            categories: negativePromptModeration.categories,
          },
        });
      }
    }

    // Your existing AI generation logic continues here...
    // Process the validated prompt with your AI service
    // ... rest of your existing code
  } catch (error) {
    // Your existing error handling
  }
};
```

### 4. Add Middleware (Optional)

Create `src/middleware/contentModerationMiddleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { moderatePrompt } from "../services/moderationService";

interface ModerationRequest extends Request {
  moderationResults?: {
    prompt: any;
    negative_prompt?: any;
  };
}

export const contentModerationMiddleware = (
  req: ModerationRequest,
  res: Response,
  next: NextFunction
) => {
  const { prompt, negative_prompt } = req.body;

  if (!prompt) {
    return next(); // Skip if no prompt
  }

  // Moderate main prompt
  const promptModeration = moderatePrompt(prompt);

  if (!promptModeration.isSafe) {
    return res.status(400).json({
      success: false,
      message: "Content violates our community guidelines",
      data: {
        type: "MODERATION_VIOLATION",
        field: "prompt",
        reason: promptModeration.reason,
        categories: promptModeration.categories,
        severity: promptModeration.severity,
      },
    });
  }

  // Store results for controller use
  req.moderationResults = { prompt: promptModeration };

  // Moderate negative prompt if provided
  if (negative_prompt) {
    const negativeModeration = moderatePrompt(negative_prompt);
    if (!negativeModeration.isSafe) {
      return res.status(400).json({
        success: false,
        message: "Negative prompt violates our community guidelines",
        data: {
          type: "MODERATION_VIOLATION",
          field: "negative_prompt",
          reason: negativeModeration.reason,
          categories: negativeModeration.categories,
        },
      });
    }
    req.moderationResults.negative_prompt = negativeModeration;
  }

  next();
};
```

### 5. Apply Middleware to Routes

Update your routes file (e.g., `src/routes/aiRoutes.ts`):

```typescript
import { contentModerationMiddleware } from "../middleware/contentModerationMiddleware";

// Apply to your routes
router.post(
  "/generate-content",
  authMiddleware,
  contentModerationMiddleware, // Add this line
  aiContentController
);

router.post(
  "/chat",
  authMiddleware,
  contentModerationMiddleware, // Add this line
  chatController
);

router.post(
  "/image-generation",
  authMiddleware,
  contentModerationMiddleware, // Add this line
  imageGenerationController
);
```

### 6. Test Integration

Create a test file: `tests/test-moderation.ts`

```typescript
import { moderatePrompt } from "../src/services/moderationService";

// Test the integration
console.log("Testing AI Content Filter Integration...\n");

const testCases = [
  { text: "A beautiful sunset over mountains", expected: true },
  { text: "fuck this shit", expected: false },
  { text: "Create a violent scene with blood", expected: false },
  { text: "A cute puppy playing in a garden", expected: true },
];

testCases.forEach((testCase, index) => {
  const result = moderatePrompt(testCase.text);
  console.log(`Test ${index + 1}: "${testCase.text}"`);
  console.log(
    `Expected Safe: ${testCase.expected}, Actual Safe: ${result.isSafe}`
  );
  if (!result.isSafe) {
    console.log(`Reason: ${result.reason}`);
    console.log(`Categories: ${result.categories.join(", ")}`);
  }
  console.log("---");
});
```

### 7. Update Package Dependencies

Add to your main project's `package.json`:

```json
{
  "dependencies": {
    "prompt-bouncer": "^1.0.0"
  }
}
```

### 8. Environment Configuration (Optional)

Add to your `.env` file:

```env
# Content Moderation Settings
ENABLE_CONTENT_MODERATION=true
MODERATION_STRICT_MODE=true
CUSTOM_BANNED_WORDS=word1,word2,word3
```

Update your moderation service to use env vars:

```typescript
const defaultConfig: FilterConfig = {
  enableProfanityFilter: process.env.ENABLE_CONTENT_MODERATION === "true",
  enableExplicitFilter: process.env.ENABLE_CONTENT_MODERATION === "true",
  enableViolenceFilter: process.env.ENABLE_CONTENT_MODERATION === "true",
  strictWordBoundaries: process.env.MODERATION_STRICT_MODE === "true",
  customBannedWords: process.env.CUSTOM_BANNED_WORDS?.split(",") || [],
};
```

## 🚀 You're Ready!

Run these commands to integrate:

```bash
# 1. Install the package
npm install prompt-bouncer

# 2. Create the moderation service file
# Copy the code above to src/services/moderationService.ts

# 3. Update your controllers with moderation logic

# 4. Test the integration
npm run test
```

Your application now has professional content moderation! 🛡️

## 📋 Integration Checklist

- [ ] Package installed via npm
- [ ] Moderation service created
- [ ] Controllers updated with moderation logic
- [ ] Middleware configured (optional)
- [ ] Routes updated with middleware
- [ ] Environment variables configured
- [ ] Integration tested
- [ ] Error handling implemented

## 🔧 Framework-Specific Examples

### Next.js API Routes

```typescript
// pages/api/generate.ts or app/api/generate/route.ts
import { moderatePrompt } from "../../services/moderationService";

export default async function handler(req, res) {
  const { prompt } = req.body;

  const moderation = moderatePrompt(prompt);
  if (!moderation.isSafe) {
    return res.status(400).json({ error: moderation.reason });
  }

  // Your generation logic here
}
```

### Fastify

```typescript
import { moderatePrompt } from "../services/moderationService";

fastify.post("/generate", async (request, reply) => {
  const { prompt } = request.body;

  const moderation = moderatePrompt(prompt);
  if (!moderation.isSafe) {
    return reply.status(400).send({ error: moderation.reason });
  }

  // Your generation logic here
});
```

### Koa.js

```typescript
import { moderatePrompt } from "../services/moderationService";

router.post("/generate", async (ctx) => {
  const { prompt } = ctx.request.body;

  const moderation = moderatePrompt(prompt);
  if (!moderation.isSafe) {
    ctx.status = 400;
    ctx.body = { error: moderation.reason };
    return;
  }

  // Your generation logic here
});
```
