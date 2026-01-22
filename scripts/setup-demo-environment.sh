#!/bin/bash

# Setup Separate Demo Environment Script
# This script helps set up capacity-planner-2.netlify.app as a separate development environment

set -e

echo "🚀 Setting up separate demo environment..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if development branch exists
if git show-ref --verify --quiet refs/heads/development; then
    echo "✅ Development branch already exists"
    read -p "Do you want to switch to it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout development
    fi
else
    echo "📦 Creating development branch..."
    read -p "Create development branch from current branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout -b development
        echo "✅ Created and switched to development branch"
    else
        echo "❌ Aborted"
        exit 1
    fi
fi

# Push development branch
echo ""
echo "📤 Pushing development branch to remote..."
read -p "Push development branch to origin? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin development
    echo "✅ Pushed development branch"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://app.netlify.com"
echo "2. Click 'Add new site' → 'Import an existing project'"
echo "3. Connect to your Git repository"
echo "4. Configure:"
echo "   - Site name: capacity-planner-2"
echo "   - Branch to deploy: development"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "   - Functions directory: netlify/functions"
echo "5. Add environment variables (NETLIFY_DATABASE_URL, etc.)"
echo "6. Run database migration (see docs/setup-separate-demo-environment.md)"
echo ""
echo "📚 See docs/setup-separate-demo-environment.md for detailed instructions"
