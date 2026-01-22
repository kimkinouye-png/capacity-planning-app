#!/bin/bash

# Script to help find the last stable commit before inline editing

echo "🔍 Searching for commits related to inline editing..."
echo ""

# Show commits with "inline" in message
echo "=== Commits with 'inline' in message ==="
git log --oneline --grep="inline" -20 || echo "No commits found"
echo ""

# Show commits with "Editable" in message
echo "=== Commits with 'Editable' in message ==="
git log --oneline --grep="Editable" -20 || echo "No commits found"
echo ""

# Show commits that modified EditableNumberCell or EditableDateCell files
echo "=== Commits that modified EditableNumberCell or EditableDateCell ==="
git log --oneline --all -- "**/EditableNumberCell*" "**/EditableDateCell*" -10 || echo "No commits found"
echo ""

# Show all recent commits
echo "=== All recent commits (last 30) ==="
git log --oneline -30
echo ""

echo "💡 Tip: Look for the commit BEFORE inline editing was added"
echo "   That commit hash is your 'stable' version"
echo ""
echo "Example: If you see:"
echo "  f32a131 Add inline editing for roadmap items"
echo "  abc1234 Previous stable version"
echo ""
echo "Then 'abc1234' is your stable commit hash"
