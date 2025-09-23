# 🚀 Complete Guide to Publishing @kaweendras/ai-content-filter to NPM

## 📋 Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://npmjs.com)
2. **NPM CLI**: Ensure npm is installed and updated
3. **Git Repository**: Initialize and push to GitHub

## 🔧 Step-by-Step Publishing Process

### 1. **Prepare Your NPM Account**

```bash
# Login to npm
npm login

# Verify you're logged in
npm whoami

# Check if package name is available
npm search @kaweendras/ai-content-filter
```

### 2. **Update Package Information**

Edit `package.json` with your actual details:

```json
{
  "name": "@kaweendras/ai-content-filter",
  "version": "1.0.0",
  "description": "A lightweight, customizable content moderation library for AI applications",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "url": "https://your-website.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/ai-content-filter.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/ai-content-filter/issues"
  },
  "homepage": "https://github.com/yourusername/ai-content-filter#readme"
}
```

### 3. **Create GitHub Repository**

```bash
# Initialize git (if not already done)
cd /Users/kaweendra/Documents/work/workers-ai-cloudflare/ai-content-filter
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial release: AI Content Filter v1.0.0"

# Add remote repository (replace with your GitHub repo)
git remote add origin https://github.com/yourusername/ai-content-filter.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. **Final Pre-publish Checks**

```bash
# Run all tests
npm test

# Build the package
npm run build

# Check package contents
npm pack --dry-run

# Verify package size
npm pack
ls -la *.tgz
tar -tzf *.tgz
rm *.tgz
```

### 5. **Publish to NPM**

#### **Option A: Public Package (Free)**

```bash
# Publish as public package
npm publish --access public
```

#### **Option B: Scoped Package**

```bash
# For scoped packages (@kaweendras/ai-content-filter)
npm publish --access public
```

### 6. **Verify Publication**

```bash
# Check if package is published
npm view @kaweendras/ai-content-filter

# Install and test
npm install @kaweendras/ai-content-filter
```

## 🔄 Version Management

### **Semantic Versioning**

- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features (backward compatible)
- **Major** (2.0.0): Breaking changes

```bash
# Update version and publish
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0
npm version major   # 1.0.0 -> 2.0.0

# Publish new version
npm publish
```

### **Publishing Updates**

```bash
# Make changes to your code
# Update tests
npm test

# Build
npm run build

# Bump version
npm version patch

# Commit version change
git push && git push --tags

# Publish
npm publish
```

## 📊 Package Management

### **View Package Stats**

```bash
# View package info
npm view @kaweendras/ai-content-filter

# Check download stats
npm view @kaweendras/ai-content-filter downloads

# View all versions
npm view @kaweendras/ai-content-filter versions --json
```

### **Unpublish (if needed)**

⚠️ **Warning**: Only unpublish within 72 hours if absolutely necessary

```bash
# Unpublish specific version
npm unpublish @kaweendras/ai-content-filter@1.0.0

# Unpublish entire package (dangerous!)
npm unpublish @kaweendras/ai-content-filter --force
```

## 🛠️ Integration in Your Main Project

### **Install in Your Workers AI Project**

```bash
cd /Users/kaweendra/Documents/work/workers-ai-cloudflare
npm install @kaweendras/ai-content-filter
```

### **Update Your Controllers**

```typescript
// src/services/moderationService.ts
import { moderate, AIContentFilter } from "@kaweendras/ai-content-filter";

export const moderateContent = (text: string) => {
  return moderate(text, {
    enableProfanityFilter: true,
    enableExplicitFilter: true,
    enableViolenceFilter: true,
    strictWordBoundaries: true,
  });
};

// Custom filter for your app
export const createCustomFilter = () => {
  return new AIContentFilter({
    enableProfanityFilter: true,
    enableExplicitFilter: true,
    enableViolenceFilter: true,
    customBannedWords: ["your", "custom", "words"],
    allowedWords: ["allowed", "words"],
    strictWordBoundaries: true,
  });
};
```

### **Update Your Routes**

```typescript
// src/controllers/generativeControllers.ts
import { moderateContent } from "../services/moderationService";

export const textToImageController = async (req: Request, res: Response) => {
  try {
    const { prompt, negative_prompt } = req.body;

    // 🛡️ CONTENT MODERATION
    const moderationResult = moderateContent(prompt);

    if (!moderationResult.isSafe) {
      return res.status(400).json({
        success: "false",
        message: "Content violates our community guidelines",
        data: {
          type: "MODERATION_VIOLATION",
          reason: moderationResult.reason,
          categories: moderationResult.categories,
          severity: moderationResult.severity,
        },
      });
    }

    // Your existing logic...
  } catch (error) {
    // Error handling...
  }
};
```

## 📈 Promotion and Usage

### **Documentation Website**

Create a GitHub Pages site or use:

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)

### **NPM Keywords for Discoverability**

In your `package.json`:

```json
{
  "keywords": [
    "content-moderation",
    "profanity-filter",
    "ai-safety",
    "text-filtering",
    "content-safety",
    "moderation",
    "nsfw-filter",
    "ai-content-filter",
    "typescript",
    "text-to-image",
    "ai-guardrails"
  ]
}
```

### **README Badges**

Add these to your README:

```markdown
[![npm version](https://badge.fury.io/js/@kaweendras/ai-content-filter.svg)](https://badge.fury.io/js/@kaweendras/ai-content-filter)
[![Downloads](https://img.shields.io/npm/dm/@kaweendras/ai-content-filter.svg)](https://npmjs.org/package/@kaweendras/ai-content-filter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Build Status](https://github.com/yourusername/ai-content-filter/workflows/CI/badge.svg)
```

## 🎯 Marketing Your Package

1. **Share on social media** (Twitter, LinkedIn, Reddit)
2. **Write a blog post** about AI content moderation
3. **Submit to newsletters** (JavaScript Weekly, Node Weekly)
4. **Create examples** for popular frameworks (React, Vue, Angular)
5. **Contribute to communities** (Stack Overflow, Discord servers)

## 📊 Success Metrics

Track these metrics:

- **Downloads per week** (npm stats)
- **GitHub stars** and forks
- **Issues and contributions**
- **Community adoption**

## 🚀 Ready to Publish?

Your package is now ready! Here's the final checklist:

- ✅ All tests passing
- ✅ Build succeeds
- ✅ Documentation complete
- ✅ Examples provided
- ✅ GitHub repository ready
- ✅ NPM account set up

**Run this to publish:**

```bash
npm publish --access public
```

🎉 **Congratulations! Your AI Content Filter package is now available on NPM!**
