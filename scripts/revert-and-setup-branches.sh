#!/bin/bash

# Script to revert main to stable version and create development branch
# Run this script manually in your terminal

set -e

echo "🔍 Finding commit history..."
echo ""

# Show recent commits
echo "Recent commits:"
git log --oneline -20
echo ""

# Find commits related to inline editing
echo "Commits related to inline editing:"
git log --oneline --grep="inline" -10 || echo "No commits found with 'inline' in message"
echo ""

# Find commits related to EditableNumberCell or EditableDateCell
echo "Commits that might have added inline editing:"
git log --oneline --all -30 | grep -i -E "(editable|inline|number|date|cell)" || echo "No matching commits found"
echo ""

echo ""
echo "📋 Next steps:"
echo ""
echo "1. Review the commits above to find the last stable commit"
echo "2. Copy the commit hash of the commit BEFORE inline editing was added"
echo "3. Run one of these options:"
echo ""
echo "   Option 1: Revert main to stable version"
echo "   git checkout main"
echo "   git reset --hard <commit-hash-before-inline-editing>"
echo "   git push origin main --force"
echo ""
echo "   Option 2: Create development branch (keeps main as-is)"
echo "   git checkout -b development"
echo "   git push -u origin development"
echo ""
echo "4. Then configure Netlify:"
echo "   - capacity-planner: Deploy from 'main' branch"
echo "   - capacity-planner-2: Deploy from 'development' branch"
echo ""
