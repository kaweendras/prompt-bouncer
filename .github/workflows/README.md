# GitHub Actions Setup for NPM Auto-Deployment

This directory contains GitHub Actions workflows for automated testing, building, and publishing of the prompt-bouncer package.

## Workflows

### 1. CI Workflow (`ci.yml`)
- **Triggers**: Push to master/main branch, Pull Requests
- **Purpose**: Runs tests and builds across multiple Node.js versions
- **Actions**: 
  - Tests on Node.js 16, 18, and 20
  - Runs TypeScript compilation checks
  - Verifies build artifacts are created correctly

### 2. Publish Workflow (`publish.yml`)
- **Triggers**: 
  - When a release is published on GitHub
  - Push to master/main branch (only if version in package.json changed)
- **Purpose**: Automatically publishes package to NPM
- **Actions**:
  - Checks if version has changed
  - Runs tests and builds
  - Publishes to NPM registry
  - Creates git tags for new versions

### 3. Release Workflow (`release.yml`)
- **Triggers**: Manual workflow dispatch
- **Purpose**: Create releases with version bumping
- **Actions**:
  - Allows choosing version bump type (patch/minor/major)
  - Updates package.json version
  - Creates GitHub release with changelog
  - Publishes to NPM

## Setup Instructions

### 1. NPM Token Setup
1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Go to Access Tokens in your account settings
3. Generate a new token with "Automation" type
4. In your GitHub repository, go to Settings → Secrets and variables → Actions
5. Add a new repository secret named `NPM_TOKEN` with your token value

### 2. GitHub Token (Already Available)
The `GITHUB_TOKEN` is automatically provided by GitHub Actions - no setup needed.

### 3. Branch Protection (Optional but Recommended)
1. Go to your repository Settings → Branches
2. Add a branch protection rule for `master` (or `main`)
3. Enable "Require status checks to pass before merging"
4. Select the CI workflow checks

## Usage

### Automatic Publishing
1. **Version-based**: Update the version in `package.json` and push to master
   ```bash
   npm version patch  # or minor, major
   git push origin master
   ```

2. **Release-based**: Create a release on GitHub
   - Go to Releases → Create a new release
   - Choose or create a tag (e.g., v1.0.3)
   - The publish workflow will trigger automatically

### Manual Release
1. Go to Actions tab in your GitHub repository
2. Select "Release" workflow
3. Click "Run workflow"
4. Choose version bump type or enter custom version
5. The workflow will handle version bumping, tagging, and publishing

## Workflow Features

- ✅ **Version Change Detection**: Only publishes when version actually changes
- ✅ **Multi-Node Testing**: Tests across Node.js 16, 18, and 20
- ✅ **Automatic Tagging**: Creates git tags for new versions
- ✅ **Build Verification**: Ensures TypeScript compilation and artifacts
- ✅ **Changelog Generation**: Auto-generates release notes
- ✅ **Safe Publishing**: Tests must pass before publishing

## Troubleshooting

### Common Issues

1. **NPM_TOKEN not working**
   - Ensure token type is "Automation"
   - Check token hasn't expired
   - Verify secret name is exactly `NPM_TOKEN`

2. **Version not bumping**
   - Ensure package.json version has actually changed
   - Check that you've pushed the version change to master

3. **Tests failing**
   - Check CI workflow logs for specific test failures
   - Ensure all dependencies are properly listed in package.json

4. **Publishing fails**
   - Verify NPM token permissions
   - Check if package name is available/you have publish rights
   - Ensure package.json has correct registry settings

## Monitoring

You can monitor workflow runs in the "Actions" tab of your GitHub repository. Each workflow run shows:
- Status (success/failure)
- Detailed logs for each step
- Artifacts (if any)
- Time taken

For NPM publishing status, check:
- [npmjs.com/package/prompt-bouncer](https://www.npmjs.com/package/prompt-bouncer)
- GitHub Releases page
- Package download statistics