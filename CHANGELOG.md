# Changelog

All notable changes to this project will be documented in this file.

## [1.0.4] - 2024-12-21

### 🔒 Security Fixes

- **CRITICAL**: Fixed case sensitivity vulnerability in violence detection that could allow threats to bypass filtering
- **CRITICAL**: Fixed runtime state persistence issues where `addBannedWords`, `removeBannedWords`, and `addAllowedWords` changes weren't preserved across configuration updates
- **CRITICAL**: Fixed allowedWords normalization to ensure proper case-insensitive matching

### 🚀 Features

- Added granular filter configuration options:
  - `filterProfanity`: Control profanity detection (default: true)
  - `filterExplicit`: Control explicit content detection (default: true)
  - `filterViolence`: Control violence detection (default: true)
  - `filterSelfHarm`: Control self-harm detection (default: true)
  - `filterDrugs`: Control drug-related content detection (default: true)
  - `filterHateSpeech`: Control hate speech detection (default: true)
  - `filterMild`: Control mild content detection (default: false)

### 🐛 Bug Fixes

- Fixed over-broad "want to kill" phrase detection that was incorrectly flagging innocent expressions like "want to kill time"
- Replaced broad phrase matching with targeted person-specific threat detection
- Enhanced death-related phrase detection with better context awareness
- Improved arson-related violence detection with more specific targeting

### 📚 Documentation

- Complete README.md overhaul with:
  - Comprehensive configuration tables
  - Best practices and usage patterns
  - Express.js and React integration examples
  - Security considerations and guidelines
- Updated INTEGRATION-GUIDE.md to be universal for any project
- Added comprehensive PUBLISHING-GUIDE.md for npm publishing
- Enhanced code examples and API documentation

### 🧪 Testing

- Expanded test suite to 29 comprehensive tests
- Added phrase vs word context detection tests
- Enhanced edge case testing
- Added user testing utility (`test-phrases.js`) for phrase validation

### 🏗️ Internal Improvements

- Enhanced word lists with better categorization
- Improved phrase detection logic with priority-based matching
- Better separation of concerns between filtering categories
- Enhanced type definitions for better developer experience

### 📦 Project Structure

- Moved integration examples to `samples/` directory
- Better organization of test utilities
- Improved build configuration
- Enhanced TypeScript support

## [1.0.3] - Previous Version

- Basic content filtering functionality
- Initial configuration options
- Core word lists and detection logic

## [1.0.2] - Previous Version

- Initial release functionality

## [1.0.1] - Previous Version

- Package setup and basic structure

## [1.0.0] - Initial Release

- Core content moderation functionality
- Basic word filtering
- Initial configuration system
