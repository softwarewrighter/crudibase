# Node.js Version Management

## Overview

Crudibase requires **Node.js 22 LTS** for compatibility with `better-sqlite3` and other native dependencies. This document explains how to manage Node.js versions for development.

## Why Node.js 22?

- **better-sqlite3 compatibility**: Native module compiled against Node 22
- **Long-term support**: Node 22 is an LTS release (stable and maintained)
- **Native module ABI**: better-sqlite3 requires specific Node.js ABI version
- **Build consistency**: Ensures all developers use the same Node version

## Automated Version Management

### Using `.nvmrc` with nvm

The project includes a `.nvmrc` file that specifies Node 22. When you have `nvm` installed:

```bash
# Automatically switch to Node 22 when entering the directory
nvm use

# Or manually install and use Node 22
nvm install 22
nvm use 22
```

### Using `dev-setup.sh` Script

The recommended way to set up the project is using the automated setup script:

```bash
./scripts/dev-setup.sh
```

This script will:

1. Check if nvm is installed and load it
2. Detect your current Node.js version
3. Automatically switch to Node 22 (or install it if needed)
4. Rebuild `better-sqlite3` if needed
5. Run the standard setup process

## Version Enforcement

### Automatic Checks

The project includes automatic Node.js version checking that runs before:

- **Building**: `npm run build`
- **Testing**: `npm run test`
- **Any workspace build/test**: Backend and frontend tests

### Manual Check

You can manually check your Node version compatibility:

```bash
npm run check-node-version
```

### What Happens on Version Mismatch?

If you try to build or test with the wrong Node version, you'll see:

```
❌ ERROR: Node.js 23 is not yet supported
   Maximum supported version: v22.x.x
   Current version: v23.11.0

📦 Please downgrade to Node.js 22 LTS:
   - Using nvm: nvm install 22 && nvm use 22
   - Or download from: https://nodejs.org/
```

**The build/test will fail** and prevent incompatible builds.

## Installation Options

### Option 1: Using nvm (Recommended)

**Install nvm:**

```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal, then:
nvm install 22
nvm use 22
```

**Auto-switch with shell integration:**

Add to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
# Auto-load .nvmrc when entering directory
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

### Option 2: Using Volta

```bash
# Install Volta
curl https://get.volta.sh | bash

# Install and pin Node 22
volta install node@22
```

### Option 3: Manual Installation

Download Node.js 22 LTS from: https://nodejs.org/

**Important**: You must manually switch versions if you have multiple Node installations.

## Troubleshooting

### Issue: Tests fail with "NODE_MODULE_VERSION mismatch"

**Cause**: `better-sqlite3` was compiled with a different Node version.

**Solution**:

```bash
# Switch to Node 22
nvm use 22

# Rebuild native modules
npm rebuild better-sqlite3 --workspace=src/backend

# Or run full setup
./scripts/dev-setup.sh
```

### Issue: "nvm: command not found"

**Cause**: nvm is not installed or not loaded in your shell.

**Solution**:

```bash
# Load nvm (add to shell profile for persistence)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Then install Node 22
nvm install 22
nvm use 22
```

### Issue: Already have Node installed globally

**Solution**: Use nvm to manage Node versions without affecting your global installation:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal, then use Node 22 for this project
cd /path/to/crudibase
nvm use 22
```

## CI/CD Considerations

### GitHub Actions

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
```

### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
```

## Version Policy

- **Current Required Version**: Node.js 22.x (LTS)
- **Minimum Version**: 22.0.0
- **Maximum Version**: <24.0.0
- **Unsupported**: Node.js 23+ (not yet compatible with better-sqlite3)

## Files Involved

| File                            | Purpose                                  |
| ------------------------------- | ---------------------------------------- |
| `.nvmrc`                        | Specifies Node 22 for nvm auto-switching |
| `scripts/dev-setup.sh`          | Automated setup with version switching   |
| `scripts/check-node-version.js` | Version validation script                |
| `package.json`                  | Engines field + prebuild/pretest hooks   |

## Quick Reference

```bash
# Check current Node version
node -v

# Switch to Node 22 (with nvm)
nvm use 22

# Verify version is compatible
npm run check-node-version

# Full automated setup
./scripts/dev-setup.sh

# Rebuild native modules after version switch
npm rebuild better-sqlite3 --workspace=src/backend
```

## Support

If you encounter Node version issues not covered here, please:

1. Check the error message for specific instructions
2. Run `./scripts/dev-setup.sh` to reset your environment
3. Open an issue if problems persist
