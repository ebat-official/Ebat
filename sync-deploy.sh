#!/bin/bash

echo "🚀 Syncing to deploy repository..."
echo "=================================="

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "⚠️  Warning: You're not on main branch (currently on $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Sync cancelled"
        exit 1
    fi
fi

# Push all branches to deploy
echo "📤 Pushing all branches to deploy..."
git push deploy --all --force

# Push all tags to deploy
echo "🏷️  Pushing all tags to deploy..."
git push deploy --tags --force

echo "✅ Sync completed successfully!"
echo "🌐 Deploy repository: https://github.com/pranavmappoli/ebat" 