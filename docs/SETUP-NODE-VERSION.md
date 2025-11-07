# Node.js Version Setup Guide

## Quick Summary

This project now includes **automatic Node.js version management and enforcement** to prevent build issues with `better-sqlite3`.

## What Was Added

### 1. `.nvmrc` File

- Specifies Node.js 22 as the required version
- Enables automatic version switching with nvm

### 2. `scripts/dev-setup.sh`

- **Automated development setup script**
- Detects and loads nvm
- Automatically switches to Node.js 22
- Rebuilds native modules if needed
- Runs the standard setup process

### 3. `scripts/check-node-version.js`

- **Version validation script**
- Checks if Node.js version is compatible
- Provides clear error messages with instructions
- Exits with error code if version is wrong

### 4. Package.json Hooks

Added automatic version checking to:

- `prebuild` - Runs before any build
- `pretest` - Runs before any test
- Applies to root, backend, and frontend workspaces

## How to Use

### For New Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/wrightmikea/crudibase.git
cd crudibase

# Run automated setup
./scripts/dev-setup.sh
```

This handles everything automatically!

### For Existing Setup (After Pulling Changes)

```bash
# Switch to Node 22 if not already
nvm use 22

# Rebuild native modules
npm rebuild better-sqlite3 --workspace=src/backend

# Verify everything works
npm run check-node-version
npm test
```

### Daily Development

With `.nvmrc` in place:

```bash
# Just cd into the project directory
cd crudibase

# nvm will auto-switch (if configured)
nvm use

# Or manually check version
npm run check-node-version
```

## What Gets Blocked

The version checker will **prevent** these commands if Node version is wrong:

- ❌ `npm run build` - Will fail with clear error
- ❌ `npm run test` - Will fail with clear error
- ❌ `npm run build:backend` - Will fail
- ❌ `npm run test:backend` - Will fail
- ❌ `npm run build:frontend` - Will fail
- ❌ `npm run test:frontend` - Will fail

## Error Messages

### When Node 23 is detected:

```
❌ ERROR: Node.js 23 is not yet supported
   Maximum supported version: v22.x.x
   Current version: v23.11.0

📦 Please downgrade to Node.js 22 LTS:
   - Using nvm: nvm install 22 && nvm use 22
   - Or download from: https://nodejs.org/
```

### When Node 20 or lower is detected:

```
❌ ERROR: Node.js 22 LTS or higher is required
   Current version: v20.11.0

📦 Please upgrade Node.js:
   - Using nvm: nvm install 22 && nvm use 22
   - Or download from: https://nodejs.org/
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc' # Reads from .nvmrc automatically
      - run: npm ci
      - run: npm test
```

## Benefits

✅ **Prevents build failures** - Catches version mismatches before native modules fail
✅ **Clear error messages** - Users know exactly what to do
✅ **Automatic switching** - With nvm, version switches automatically
✅ **CI/CD ready** - Works seamlessly with GitHub Actions
✅ **Developer-friendly** - One command setup with `dev-setup.sh`

## Files Modified

- ✅ `package.json` - Added `check-node-version` script, `prebuild`, `pretest` hooks
- ✅ `src/backend/package.json` - Added version checking hooks
- ✅ `src/frontend/package.json` - Added version checking hooks
- ✅ `.nvmrc` - Created with Node 22
- ✅ `scripts/dev-setup.sh` - Created automated setup script
- ✅ `scripts/check-node-version.js` - Created version checker
- ✅ `README.md` - Updated installation instructions
- ✅ `docs/node-version-management.md` - Created comprehensive guide

## Troubleshooting

### "nvm: command not found"

**Solution**: Install nvm first:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart terminal
nvm install 22
nvm use 22
```

### Build still fails after switching versions

**Solution**: Rebuild native modules:

```bash
npm rebuild better-sqlite3 --workspace=src/backend
```

### Want to skip version check (not recommended)

**Solution**: Run commands directly in workspaces:

```bash
cd src/backend
# This skips the root pretest hook
npx vitest run
```

**⚠️ Warning**: This may cause native module errors!

## Next Steps

1. Pull the latest changes
2. Run `./scripts/dev-setup.sh`
3. Verify tests pass: `npm test`
4. Continue development!

For more details, see [docs/node-version-management.md](./node-version-management.md)
