#!/bin/bash
# Quick script to add Homebrew to PATH

# Add Homebrew to PATH for Apple Silicon Macs
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

echo "✅ Homebrew added to PATH"
echo "📝 Run this command to verify:"
echo "   brew --version"
echo ""
echo "💡 If it still doesn't work, close and reopen your terminal."
