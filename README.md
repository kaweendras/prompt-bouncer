# AI Content Filter

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
npm install @kaweendras/ai-content-filter
```

## 🔧 Quick Start

### Basic Usage

```typescript
import {
  AIContentFilter,
  moderate,
  isSafe,
} from "@kaweendras/ai-content-filter";

// Quick check
if (isSafe("Create a beautiful sunset image")) {
  console.log("Content is safe!");
}

// Detailed moderation
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
```

### Advanced Usage

```typescript
import { AIContentFilter } from "@kaweendras/ai-content-filter";

// Create filter with custom configuration
const filter = new AIContentFilter({
  enableProfanityFilter: true,
  enableExplicitFilter: true,
  enableViolenceFilter: false, // Disable violence detection
  customBannedWords: ["mycustomword"],
  allowedWords: ["damn"], // Allow specific words
  strictWordBoundaries: true,
  caseSensitive: false,
});

// Moderate content
const result = filter.moderate("Generate an image of...");

// Clean text
const cleaned = filter.clean("Remove bad words from this text");

// Check specific words
const flaggedWords = filter.getFlaggedWords("Text to analyze");

// Update configuration
filter.updateConfig({
  enableViolenceFilter: true,
  customBannedWords: ["newbadword"],
});
```

## 🎯 Use Cases

### Text-to-Image Generation

```typescript
import { moderate } from "@kaweendras/ai-content-filter";

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
import { AIContentFilter } from "@kaweendras/ai-content-filter";

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
import { moderate } from "@kaweendras/ai-content-filter";

function validateUserContent(content: string) {
  const result = moderate(content, {
    enableProfanityFilter: true,
    enableExplicitFilter: true,
    enableViolenceFilter: true,
  });

  return {
    canPublish: result.isSafe,
    issues: result.flaggedWords,
    categories: result.categories,
    severity: result.severity,
    suggestion: result.isSafe ? null : "Please revise your content",
  };
}
```

## ⚙️ Configuration Options

| Option                  | Type     | Default | Description                       |
| ----------------------- | -------- | ------- | --------------------------------- |
| `enableProfanityFilter` | boolean  | `true`  | Enable profanity detection        |
| `enableExplicitFilter`  | boolean  | `true`  | Enable explicit content detection |
| `enableViolenceFilter`  | boolean  | `true`  | Enable violence/harm detection    |
| `customBannedWords`     | string[] | `[]`    | Additional words to ban           |
| `allowedWords`          | string[] | `[]`    | Words to allow (whitelist)        |
| `caseSensitive`         | boolean  | `false` | Case sensitive matching           |
| `strictWordBoundaries`  | boolean  | `true`  | Prevent partial word matches      |

## 📊 Detection Categories

| Category      | Severity | Description                              | Examples                |
| ------------- | -------- | ---------------------------------------- | ----------------------- |
| **profanity** | medium   | General profanity and offensive language | Common swear words      |
| **explicit**  | high     | Sexually explicit and adult content      | Adult themes, nudity    |
| **violence**  | high     | Violent and harmful content              | Violence, weapons, harm |
| **drugs**     | medium   | Drug-related content                     | Illegal substances      |
| **hate**      | high     | Hate speech and discrimination           | Racist, sexist content  |
| **self_harm** | high     | Self-harm and suicide content            | Self-injury, suicide    |

## 🔄 API Reference

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

### Express.js Middleware

```typescript
import { moderate } from "@kaweendras/ai-content-filter";

function contentModerationMiddleware(req, res, next) {
  const { prompt } = req.body;

  if (prompt) {
    const result = moderate(prompt);

    if (!result.isSafe) {
      return res.status(400).json({
        error: "Content policy violation",
        reason: result.reason,
        categories: result.categories,
      });
    }
  }

  next();
}

app.post("/generate-image", contentModerationMiddleware, (req, res) => {
  // Safe to proceed with image generation
});
```

### React Hook

```typescript
import { useState, useCallback } from "react";
import { moderate } from "@kaweendras/ai-content-filter";

function useContentModeration() {
  const [lastResult, setLastResult] = useState(null);

  const checkContent = useCallback((text: string) => {
    const result = moderate(text);
    setLastResult(result);
    return result;
  }, []);

  return { checkContent, lastResult };
}
```

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
