#!/usr/bin/env node

/**
 * Check Node.js version before build/test
 * Ensures we don't accidentally build with incompatible Node versions
 */

const REQUIRED_MAJOR = 22;
const MAX_MAJOR = 23;

const currentVersion = process.version;
const currentMajor = parseInt(currentVersion.split('.')[0].substring(1));

console.log(`\n🔍 Checking Node.js version...`);
console.log(`   Current: ${currentVersion}`);
console.log(`   Required: v${REQUIRED_MAJOR}.x.x`);

if (currentMajor < REQUIRED_MAJOR) {
  console.error(`\n❌ ERROR: Node.js ${REQUIRED_MAJOR} LTS or higher is required`);
  console.error(`   Current version: ${currentVersion}`);
  console.error(`\n📦 Please upgrade Node.js:`);
  console.error(`   - Using nvm: nvm install ${REQUIRED_MAJOR} && nvm use ${REQUIRED_MAJOR}`);
  console.error(`   - Or download from: https://nodejs.org/\n`);
  process.exit(1);
}

if (currentMajor >= MAX_MAJOR) {
  console.error(`\n❌ ERROR: Node.js ${currentMajor} is not yet supported`);
  console.error(`   Maximum supported version: v${MAX_MAJOR - 1}.x.x`);
  console.error(`   Current version: ${currentVersion}`);
  console.error(`\n📦 Please downgrade to Node.js ${REQUIRED_MAJOR} LTS:`);
  console.error(`   - Using nvm: nvm install ${REQUIRED_MAJOR} && nvm use ${REQUIRED_MAJOR}`);
  console.error(`   - Or download from: https://nodejs.org/\n`);
  process.exit(1);
}

if (currentMajor !== REQUIRED_MAJOR) {
  console.warn(`\n⚠️  WARNING: Node.js ${currentMajor} detected`);
  console.warn(`   Recommended version: v${REQUIRED_MAJOR}.x.x (LTS)`);
  console.warn(`   Some dependencies (like better-sqlite3) work best on LTS versions.\n`);
  // Don't exit - allow non-LTS versions but warn
}

console.log(`✅ Node.js version is compatible\n`);
process.exit(0);
