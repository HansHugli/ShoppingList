#!/bin/bash
set -e

# ============================================================
# ship.sh — Update docs, type-check, commit, push, and build
# Usage:
#   npm run ship "feat(list): add swipe to delete"
#   npm run ship "fix(sync): handle offline state"
# ============================================================

COMMIT_MSG="$1"

if [ -z "$COMMIT_MSG" ]; then
  echo "❌ Usage: npm run ship \"<type>(<scope>): <message>\""
  echo ""
  echo "Types: feat | fix | chore | docs | refactor | style | test | build"
  echo "Scopes: list | auth | sync | store | ui | deps | config"
  echo ""
  echo "Examples:"
  echo "  npm run ship \"feat(list): add swipe to delete\""
  echo "  npm run ship \"fix(sync): handle 429 rate limit\""
  echo "  npm run ship \"chore(deps): update expo to SDK 55\""
  exit 1
fi

# Validate conventional commit format
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|chore|docs|refactor|style|test|build)(\(.+\))?: .+"; then
  echo "❌ Commit message must follow conventional format:"
  echo "   <type>(<scope>): <description>"
  echo ""
  echo "   Got: $COMMIT_MSG"
  exit 1
fi

echo ""
echo "🚀 Shipping: $COMMIT_MSG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Type-check
echo ""
echo "📝 Step 1/5: Type-checking..."
npx tsc --noEmit
echo "   ✅ Types OK"

# Step 2: Run expo doctor
echo ""
echo "🩺 Step 2/5: Running expo doctor..."
if npx -y expo-doctor 2>&1 | grep -q "checks passed"; then
  echo "   ✅ Expo checks passed"
else
  echo "   ⚠️  Some expo checks had warnings (continuing anyway)"
fi

# Step 3: Stage and commit
echo ""
echo "📦 Step 3/5: Committing changes..."
git add -A
CHANGES=$(git diff --cached --stat)
if [ -z "$CHANGES" ]; then
  echo "   ⚠️  No changes to commit. Skipping commit/push."
  echo "   Starting build anyway..."
else
  echo "$CHANGES"
  echo ""
  git commit -m "$COMMIT_MSG

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
  echo "   ✅ Committed"

  # Step 4: Push
  echo ""
  echo "🔼 Step 4/5: Pushing to GitHub..."
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  git push origin "$BRANCH"
  echo "   ✅ Pushed to origin/$BRANCH"
fi

# Step 5: Build
echo ""
echo "🏗️  Step 5/5: Starting EAS build..."
echo "   This will run in the cloud. You can Ctrl+C after it uploads."
echo ""
npx eas build --platform ios --profile preview

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ship complete!"
