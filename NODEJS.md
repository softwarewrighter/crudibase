# Node.js Installation Guide

## Required Version

**Crudibase requires Node.js 22 LTS "Jod"**

- ✅ **Node.js 22.x** - Fully supported (Active LTS until April 2027)
- ❌ **Node.js 24.x** - Not compatible with better-sqlite3 yet
- ❌ **Node.js 23.x** - Not LTS, has compatibility issues
- ⚠️ **Node.js 20.x** - Works but use Node.js 22 for better long-term support

## Why Node.js 22?

1. **Active LTS Support** - Maintained until April 2027
2. **better-sqlite3 Compatible** - Full support for native SQLite bindings
3. **Production Ready** - Widely adopted and battle-tested
4. **Modern Features** - Latest stable JavaScript features

## Installation Methods

### Option 1: Using Homebrew (macOS - Recommended)

```bash
# Uninstall current Node.js version
brew unlink node

# Install Node.js 22 LTS
brew install node@22

# Link Node.js 22
brew link node@22

# Verify installation
node -v  # Should show v22.x.x
npm -v
```

### Option 2: Using NVM (Cross-Platform - Most Flexible)

**Install NVM:**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal or run:
source ~/.bashrc  # or ~/.zshrc

# Verify nvm installation
nvm --version
```

**Install Node.js 22:**

```bash
# Install Node.js 22 LTS
nvm install 22

# Use Node.js 22
nvm use 22

# Set Node.js 22 as default
nvm alias default 22

# Verify
node -v  # Should show v22.x.x
```

**Using .nvmrc (Automatic Version Switching):**

This project includes a `.nvmrc` file. When you `cd` into the project:

```bash
# Automatically use the correct Node.js version
nvm use

# Or set up automatic switching (add to ~/.bashrc or ~/.zshrc):
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

### Option 3: Official Installer (Windows/macOS/Linux)

1. Visit [nodejs.org](https://nodejs.org/)
2. Download **Node.js 22 LTS** (look for "22.x.x LTS")
3. Run the installer
4. Verify installation:

```bash
node -v  # Should show v22.x.x
npm -v
```

### Option 4: Using n (Alternative Version Manager)

```bash
# Install n globally
npm install -g n

# Install Node.js 22 LTS
sudo n lts

# Or specifically:
sudo n 22

# Verify
node -v  # Should show v22.x.x
```

### Option 5: Using fnm (Fast Node Manager)

```bash
# Install fnm
curl -fsSL https://fnm.vercel.app/install | bash

# Restart terminal, then:
fnm install 22
fnm use 22
fnm default 22

# Verify
node -v  # Should show v22.x.x
```

## Verification

After installation, verify you have the correct version:

```bash
# Check Node.js version (must be 22.x.x)
node -v

# Check npm version (should be 9.x or higher)
npm -v

# Check that better-sqlite3 can compile (optional)
npx better-sqlite3 --help
```

## Troubleshooting

### "node: command not found"

If Node.js is installed but not found:

```bash
# Find where Node.js is installed
which node

# Add to PATH in ~/.bashrc or ~/.zshrc:
export PATH="/path/to/node/bin:$PATH"

# Then reload:
source ~/.bashrc  # or ~/.zshrc
```

### Switching from Node.js 23/24 to 22

**With Homebrew:**
```bash
brew uninstall node
brew install node@22
brew link node@22 --force
```

**With NVM:**
```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### Permission Errors (macOS/Linux)

If you get permission errors with global npm installs:

```bash
# Fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to ~/.bashrc or ~/.zshrc:
export PATH=~/.npm-global/bin:$PATH

# Reload
source ~/.bashrc  # or ~/.zshrc
```

### better-sqlite3 Build Errors

If you still get build errors after installing Node.js 22:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Why Not Node.js 24?

Node.js 24 is the newest LTS, but:
- **better-sqlite3 is not compatible** (C++20 build failures)
- Native `node:sqlite` is experimental
- Most production apps still use Node.js 22

Once better-sqlite3 adds Node.js 24 support (expected in 2025), we'll upgrade.

## Next Steps

After installing Node.js 22:

1. Verify version: `node -v` (should be v22.x.x)
2. Run setup: `./scripts/setup.sh`
3. Start development: `npm run dev`

## Resources

- [Node.js Official Site](https://nodejs.org/)
- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)
- [NVM GitHub](https://github.com/nvm-sh/nvm)
- [better-sqlite3 Compatibility](https://github.com/WiseLibs/better-sqlite3)
