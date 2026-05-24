---
name: package-name-validation
description: >
  Validates npm package names before attempting installation.
  Checks if package exists on npm registry to prevent wasted time on
  404 errors from typos or incorrect package names.
  
  Triggers: Before installing npm packages, when setting up new projects,
  or when encountering "package not found" errors.
---

# Package Name Validation Skill

Stop wasting time on npm package typos.

## The Problem

```
npm install @better-auth/*        → 404 error
npm install @upstash/rate-limit  → 404 error (correct: @upstash/ratelimit)
npm install typescript            → works
```

**Time wasted:** Debugging why installation fails, checking registry docs.

## The Solution

Validate package names before installing:

```bash
#!/bin/bash
# validate-package.sh <package_name>
# Exit: 0 = exists, 1 = not found

PACKAGE="$1"
if [ -z "$PACKAGE" ]; then
    echo "Usage: $0 <package_name>"
    exit 1
fi

# Check npm registry
STATUS=$(npm view "$PACKAGE" name --json 2>/dev/null | jq -r '.name // empty')

if [ -n "$STATUS" ]; then
    echo "✅ Package exists: $PACKAGE"
    echo "  Latest: $(npm view "$PACKAGE" version --json 2>/dev/null | jq -r '.[0]')"
    echo "  Description: $(npm view "$PACKAGE" description --json 2>/dev/null | jq -r '.')"
    exit 0
else
    echo "❌ Package not found: $PACKAGE"
    echo ""
    echo "Suggestions:"
    echo "  - Check for typos (@scope/name format)"
    echo "  - Verify package name on https://www.npmjs.com/"
    echo "  - Try: npm search <keywords>"
    exit 1
fi
```

## Usage

```bash
# Before installing
./validate-package.sh @upstash/ratelimit
# ✅ Package exists: @upstash/ratelimit
#   Latest: 2.0.8
#   Description: Rate limiting for serverless and edge functions

# Check multiple packages
for pkg in express @prisma/client better-auth; do
    ./validate-package.sh "$pkg" || echo "⚠️  Skipping $pkg"
done
```

## Common Package Name Issues (from Satchel retrospective)

| Wrong | Correct | Notes |
|-------|---------|-------|
| `@better-auth/*` | `better-auth` | No scope needed |
| `@upstash/rate-limit` | `@upstash/ratelimit` | Typo: "rate" vs "rate" |
| `@prisma/client` | `@prisma/client` | Correct, but needs `prisma generate` |

## Node.js Integration

```javascript
// validate-package.js
const { execSync } = require('child_process');

function validatePackage(name) {
    try {
        const info = execSync(`npm view ${name} --json`, { encoding: 'utf8' });
        return JSON.parse(info);
    } catch (e) {
        return null;
    }
}

function installPackage(name) {
    const pkg = validatePackage(name);
    if (!pkg) {
        throw new Error(`Package not found: ${name}`);
    }
    
    console.log(`Installing ${pkg.name}@${pkg.version}...`);
    execSync(`npm install ${name}`, { stdio: 'inherit' });
}
```

## Pre-installation Checklist

Before running `npm install` in a setup script:

```bash
#!/bin/bash
echo "Validating packages..."
PACKAGES=(
    "express"
    "@prisma/client"
    "better-auth"
    "@upstash/ratelimit"
)

for pkg in "${PACKAGES[@]}"; do
    ./validate-package.sh "$pkg" || {
        echo "❌ Cannot proceed - package validation failed"
        exit 1
    }
done

echo "✅ All packages valid, proceeding with install..."
npm install
```

## npm Registry Quick Checks

```bash
# Check if package exists
npm view <package> name

# Get latest version
npm view <package> version

# Get package info
npm view <package>

# Search for similar names
npm search <keywords>
```

## Lessons Learned

From Satchel project setup:
- **Package naming confusion** - Better Auth is `better-auth` not `@better-auth/*`
- **Upstash ratelimit typo** - `@upstash/rate-limit` vs `@upstash/ratelimit`
- Wasted time on 404 errors before checking registry

## Files

- `scripts/validate-package.sh` - Bash validation script
- `scripts/validate-package.js` - Node.js validation helper

---

*Created from retrospective: task-retro-satchel-bwn-m7y-n9j-satchel-project-initial-setup.md*
