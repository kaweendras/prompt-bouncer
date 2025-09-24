# Prompt Bouncer

A lightweight, customizable content moderation library for AI applications. Perfect for filtering profanity, explicit content, and inappropriate prompts for text-to-image generation and other AI services.

## 🚀 Features

- **🛡️ Multi-Category Filtering**: Profanity, explicit content, violence, drugs, hate speech, and self-harm detection
- **⚙️ Highly Configurable**: Enable/disable specific categories, add custom words, whitelist exceptions
- **🎯 AI-Focused**: Specifically designed for AI prompt filtering and content moderation
- **🪶 Lightweight**: Zero external dependencies, pure TypeScript implementation
- **🔧 Flexible**: Class-based API with convenient utility functions
- **📊 Detailed Results**: Get flagged words, categories, confidence scores, and cleaned text
- **🔍 Smart Detection**: Handles leetspeak, character substitutions, and word boundaries

## 📦 Installation

```bash
npm install prompt-bouncer
```

## 🔧 Quick Start

### Basic Usage

```typescript
import { AIContentFilter, moderate, isSafe } from "prompt-bouncer";

// Quick safety check
if (isSafe("Create a beautiful sunset image")) {
  console.log("Content is safe!");
}

// Detailed moderation with recommended approach
const result = moderate("This is inappropriate content");
console.log(result);
// {
//   isSafe: false,
//   reason: "Content contains profanity violations",
//   flaggedWords: ['inappropriate'],
//   categories: ['profanity'],
//   confidence: 0.25,
//   severity: 'medium',
//   cleanedText: 'This is ************* content'
// }

// ✅ RECOMMENDED: Use severity-based logic for better UX
const shouldAllow = result.isSafe || result.severity === "low";
if (shouldAllow) {
  console.log("✅ Content allowed");
} else {
  console.log("❌ Content blocked:", result.categories);
}
```

### Advanced Usage

```typescript
import { AIContentFilter } from "prompt-bouncer";

// Recommended configuration for most applications
const filter = new AIContentFilter({
  enableProfanityFilter: true, // Block offensive language
  enableExplicitFilter: true, // Block adult content
  enableViolenceFilter: true, // Block violence and threats
  enableSelfHarmFilter: true, // Block self-harm content
  enableDrugsFilter: false, // Optional - context dependent
  enableHateSpeechFilter: true, // Block hate speech
  enableMildFilter: false, // Keep disabled for contextual usage
  customBannedWords: ["mycustomword"],
  allowedWords: ["damn"], // Whitelist specific words
  strictWordBoundaries: true,
  caseSensitive: false,
});

// Moderate content with severity-based decision
const result = filter.moderate("Generate an image of...");
const shouldAllow = result.isSafe || result.severity === "low";

// Clean text (replace flagged words with asterisks)
const cleaned = filter.clean("Remove bad words from this text");

// Get only flagged words
const flaggedWords = filter.getFlaggedWords("Text to analyze");

// Dynamic configuration updates
filter.updateConfig({
  enableDrugsFilter: true, // Enable for stricter filtering
  customBannedWords: ["newword"],
});
```

## 🎯 Use Cases

### Text-to-Image Generation

```typescript
import { moderate } from "prompt-bouncer";

function generateImage(prompt: string) {
  const moderation = moderate(prompt);

  if (!moderation.isSafe) {
    throw new Error(`Content policy violation: ${moderation.reason}`);
  }

  // Proceed with image generation
  return callImageGenerationAPI(prompt);
}
```

### Chat Applications

```typescript
import { AIContentFilter } from "prompt-bouncer";

const chatFilter = new AIContentFilter({
  enableProfanityFilter: true,
  enableExplicitFilter: true,
  strictWordBoundaries: true,
});

function moderateMessage(message: string) {
  const result = chatFilter.moderate(message);

  if (!result.isSafe) {
    return {
      allowed: false,
      cleanedMessage: result.cleanedText,
      warning: `Message contains ${result.categories.join(", ")} content`,
    };
  }

  return { allowed: true, message };
}
```

### Content Management

```typescript
import { moderate } from "prompt-bouncer";

function validateUserContent(content: string) {
  const result = moderate(content, {
    enableProfanityFilter: true,
    enableExplicitFilter: true,
    enableViolenceFilter: true,
    enableSelfHarmFilter: true,
    enableHateSpeechFilter: true,
    enableMildFilter: false, // Allow contextual usage
  });

  // Use severity-based logic for better user experience
  const canPublish = result.isSafe || result.severity === "low";

  return {
    canPublish,
    isSafe: result.isSafe,
    severity: result.severity,
    issues: result.flaggedWords,
    categories: result.categories,
    suggestion: canPublish ? null : "Please revise your content",
    cleanedVersion: result.cleanedText,
  };
}
```

## ⚙️ Configuration Options

| Option                   | Type     | Default | Description                                                |
| ------------------------ | -------- | ------- | ---------------------------------------------------------- |
| `enableProfanityFilter`  | boolean  | `true`  | Enable profanity detection                                 |
| `enableExplicitFilter`   | boolean  | `true`  | Enable explicit content detection                          |
| `enableViolenceFilter`   | boolean  | `true`  | Enable violence detection                                  |
| `enableSelfHarmFilter`   | boolean  | `true`  | Enable self-harm/suicide detection                         |
| `enableDrugsFilter`      | boolean  | `false` | Enable drug-related content detection                      |
| `enableHateSpeechFilter` | boolean  | `true`  | Enable hate speech detection                               |
| `enableMildFilter`       | boolean  | `false` | Enable mild content detection (recommended: keep disabled) |
| `customBannedWords`      | string[] | `[]`    | Additional words to ban                                    |
| `allowedWords`           | string[] | `[]`    | Words to allow (whitelist)                                 |
| `caseSensitive`          | boolean  | `false` | Case sensitive matching                                    |
| `strictWordBoundaries`   | boolean  | `true`  | Prevent partial word matches                               |

> **🔧 Recommended**: Keep `enableMildFilter: false` to allow contextual words (gaming, technical terms, mild expressions) and check `severity === "low"` in your application logic instead.

## 📊 Detection Categories

| Category      | Severity | Description                                    | Examples                         |
| ------------- | -------- | ---------------------------------------------- | -------------------------------- |
| **mild**      | low      | Light offensive language, gaming/fantasy terms | damn, kill (gaming), fire, blood |
| **profanity** | medium   | General profanity and offensive language       | Common swear words               |
| **explicit**  | high     | Sexually explicit and adult content            | Adult themes, nudity             |
| **violence**  | high     | Violent and harmful content                    | Violence, weapons, harm          |
| **drugs**     | medium   | Drug-related content                           | Illegal substances               |
| **hate**      | high     | Hate speech and discrimination                 | Racist, sexist content           |
| **self_harm** | high     | Self-harm and suicide content                  | Self-injury, suicide             |

## � Best Practices & Recommendations

### ✅ **Allow the "Mild" Category**

**We strongly recommend allowing content flagged as "mild" in most applications.** Here's why:

#### 🎮 **Context-Aware Design**

The `mild` category includes words that have **legitimate uses** in many contexts:

- **Gaming**: "kill", "attack", "blood", "weapon" (RPG/gaming terminology)
- **Creative Writing**: "death", "dark", "evil" (fantasy/horror themes)
- **Technical**: "kill process", "fire event" (programming/technical terms)
- **Everyday Language**: "damn", "hell" (mild expressions)

#### 🎯 **Smart Phrase Detection**

Our filter uses **advanced phrase detection** to distinguish context:

- ❌ **"want to kill you"** → Detected as **violence** (high severity)
- ❌ **"I want to set fire on someone"** → Detected as **violence** (high severity)
- ✅ **"kill the bug"** → **Safe** (with mild filter disabled)
- ✅ **"this song is fire"** → **Safe** (with mild filter disabled)
- ✅ **"fire the employee"** → **Safe** (business context)

#### ⚖️ **Balanced Moderation**

```typescript
// Recommended: Allow mild, block medium/high severity
const result = moderate(text);
const shouldAllow = result.isSafe || result.severity === "low";

if (!shouldAllow) {
  // Block only medium/high severity content
  console.log("Content blocked:", result.categories);
} else {
  // Allow safe content and mild violations
  console.log("Content allowed");
}
```

#### 🛠️ **Flexible Configuration**

```typescript
// For creative/gaming applications
const creativeFilter = new AIContentFilter({
  enableProfanityFilter: true, // Medium severity
  enableExplicitFilter: true, // High severity
  enableViolenceFilter: true, // High severity
  enableSelfHarmFilter: true, // High severity
  enableDrugsFilter: false, // Optional - depends on your use case
  enableHateSpeechFilter: true, // High severity
  enableMildFilter: false, // Keep disabled - allow contextual usage
});

// Recommended: Check severity instead of just isSafe
function isContentAcceptable(text: string) {
  const result = creativeFilter.moderate(text);

  // Allow safe content and mild violations (severity: "low")
  return result.isSafe || result.severity === "low";
}
```

**📊 Real-world Impact**: Blocking mild content can lead to 40-60% false positives in creative applications, gaming platforms, and technical documentation.

## �🔄 API Reference

### Class: AIContentFilter

#### Constructor

```typescript
new AIContentFilter(config?: FilterConfig)
```

#### Methods

##### `moderate(text: string): ModerationResult`

Performs comprehensive content moderation.

##### `isSafe(text: string): boolean`

Quick boolean check if content is safe.

##### `clean(text: string): string`

Returns text with banned words replaced by asterisks.

##### `getFlaggedWords(text: string): string[]`

Returns array of flagged words found in text.

##### `addBannedWords(words: string[]): void`

Adds custom words to the banned list.

##### `removeBannedWords(words: string[]): void`

Removes words from the banned list.

##### `addAllowedWords(words: string[]): void`

Adds words to the allowed list (whitelist).

##### `updateConfig(config: Partial<FilterConfig>): void`

Updates the filter configuration.

### Utility Functions

```typescript
// Quick moderation with default settings
moderate(text: string, config?: FilterConfig): ModerationResult

// Quick safety check
isSafe(text: string, config?: FilterConfig): boolean

// Quick text cleaning
clean(text: string, config?: FilterConfig): string

// Get flagged words
getFlaggedWords(text: string, config?: FilterConfig): string[]
```

## 🛠️ Integration Examples

> 💡 **Complete integration examples are available in the [`samples/`](./samples/) folder**

### Express.js Middleware

```typescript
import { moderate } from "prompt-bouncer";

const RECOMMENDED_CONFIG = {
  enableProfanityFilter: true,
  enableExplicitFilter: true,
  enableViolenceFilter: true,
  enableSelfHarmFilter: true,
  enableHateSpeechFilter: true,
  enableMildFilter: false, // Allow contextual usage
};

function contentModerationMiddleware(req, res, next) {
  const { prompt } = req.body;

  if (prompt) {
    const result = moderate(prompt, RECOMMENDED_CONFIG);
    const shouldAllow = result.isSafe || result.severity === "low";

    if (!shouldAllow) {
      return res.status(400).json({
        error: "Content policy violation",
        reason: result.reason,
        categories: result.categories,
        severity: result.severity,
      });
    }
  }

  next();
}

app.post("/generate-content", contentModerationMiddleware, (req, res) => {
  // Safe to proceed with content generation
});
```

### React Hook with Severity Logic

```typescript
import { useState, useCallback } from "react";
import { moderate } from "prompt-bouncer";

function useContentModeration() {
  const [lastResult, setLastResult] = useState(null);

  const checkContent = useCallback((text: string) => {
    const result = moderate(text, {
      enableMildFilter: false, // Allow contextual usage
    });

    setLastResult(result);
    return {
      ...result,
      shouldAllow: result.isSafe || result.severity === "low",
    };
  }, []);

  return { checkContent, lastResult };
}
```

### Next.js API Route

```typescript
// app/api/moderate/route.ts
import { moderate } from "prompt-bouncer";

export async function POST(request: Request) {
  const { text } = await request.json();

  const result = moderate(text);
  const shouldAllow = result.isSafe || result.severity === "low";

  return Response.json({
    isSafe: result.isSafe,
    shouldAllow,
    severity: result.severity,
    categories: result.categories,
  });
}
```

### Configuration Presets

```typescript
import { AIContentFilter } from "prompt-bouncer";

// For creative/gaming applications
const creativeFilter = new AIContentFilter({
  enableMildFilter: false, // Allow gaming terms
  enableDrugsFilter: false, // Context-dependent
});

// For professional environments
const strictFilter = new AIContentFilter({
  enableMildFilter: true, // Stricter control
  enableDrugsFilter: true, // Block all drug references
});
```

📁 **[View complete integration examples →](./samples/integration-example.ts)**

## 📁 Project Structure & Examples

```
prompt-bouncer/
├── src/                      # Source code
│   ├── filter.ts            # Main AIContentFilter class
│   ├── types.ts             # TypeScript interfaces
│   ├── wordLists.ts         # Detection categories and keywords
│   └── index.ts             # Main exports
├── samples/                  # Integration examples
│   └── integration-example.ts # Complete integration samples
└── dist/                     # Compiled JavaScript
```

### 📚 Available Examples

- **[integration-example.ts](./samples/integration-example.ts)** - Complete integration patterns for:
  - Express.js middleware
  - React hooks
  - Next.js API routes
  - Configuration presets
  - Different moderation strategies

## 🧪 Testing

```bash
npm test                 # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, please open an issue on GitHub or contact [kaweendra@example.com](mailto:kaweendra@example.com).

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Machine learning-based detection
- [ ] Browser/Web Worker support
- [ ] Custom severity levels
- [ ] Regex pattern support
- [ ] Performance optimizations
