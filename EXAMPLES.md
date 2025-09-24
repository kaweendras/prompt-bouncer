# Example usage of Prompt Bouncer

This directory contains example usage of the `prompt-bouncer` package.

## Basic Example

```typescript
import { AIContentFilter, moderate, isSafe } from "prompt-bouncer";

// Quick safety check
console.log(isSafe("Create a beautiful sunset image")); // true
console.log(isSafe("Create nude images")); // false

// Detailed moderation
const result = moderate("Generate a violent scene with blood");
console.log(result);
/*
{
  isSafe: false,
  reason: "Content contains violence violations",
  flaggedWords: ['violent', 'blood'],
  categories: ['violence'],
  confidence: 0.5,
  severity: 'high',
  originalText: 'Generate a violent scene with blood',
  cleanedText: 'Generate a ******* scene with *****'
}
*/

// Using the class for advanced configuration
const filter = new AIContentFilter({
  enableProfanityFilter: true,
  enableExplicitFilter: true,
  enableViolenceFilter: false, // Disable violence detection
  customBannedWords: ["customword"],
  allowedWords: ["damn"], // Allow specific words
});

const customResult = filter.moderate("Damn, this is a nice image");
console.log(customResult.isSafe); // true (because 'damn' is whitelisted)
```

## Integration Examples

### Express.js API Protection

```typescript
import express from "express";
import { moderate } from "prompt-bouncer";

const app = express();

app.post("/api/generate-image", (req, res) => {
  const { prompt } = req.body;

  const moderation = moderate(prompt);

  if (!moderation.isSafe) {
    return res.status(400).json({
      error: "Content policy violation",
      reason: moderation.reason,
      categories: moderation.categories,
      suggestion: "Please revise your prompt to comply with our guidelines",
    });
  }

  // Safe to proceed with image generation
  generateImage(prompt).then((image) => {
    res.json({ success: true, imageUrl: image.url });
  });
});
```

### React Component

```typescript
import React, { useState } from "react";
import { moderate } from "prompt-bouncer";

function ImagePromptInput() {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const moderation = moderate(prompt);

    if (!moderation.isSafe) {
      setError(`Content not allowed: ${moderation.reason}`);
      return;
    }

    setError("");
    // Submit to API
    generateImage(prompt);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Generate Image</button>
    </form>
  );
}
```
