#!/bin/bash

# Script to update design system files on main branch from development branch
# This cherry-picks only design system styling changes, not functional features

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEVELOPMENT_BRANCH="development"
MAIN_BRANCH="main"
BACKUP_BRANCH="main-backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Design System Update Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"

# Check if development branch exists
if ! git show-ref --verify --quiet refs/heads/${DEVELOPMENT_BRANCH}; then
    echo -e "${RED}Error: Branch '${DEVELOPMENT_BRANCH}' does not exist${NC}"
    exit 1
fi

# Check if main branch exists
if ! git show-ref --verify --quiet refs/heads/${MAIN_BRANCH}; then
    echo -e "${RED}Error: Branch '${MAIN_BRANCH}' does not exist${NC}"
    exit 1
fi

# Confirm before proceeding
echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "  1. Create a backup branch: ${BACKUP_BRANCH}"
echo "  2. Switch to ${MAIN_BRANCH} branch"
echo "  3. Copy design system files from ${DEVELOPMENT_BRANCH}"
echo "  4. Stage and commit the changes"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Aborted${NC}"
    exit 0
fi

# Stash any uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Stashing uncommitted changes...${NC}"
    git stash push -m "Stash before design system update"
    STASHED=true
else
    STASHED=false
fi

# Create backup branch from current main
echo -e "${BLUE}Creating backup branch: ${BACKUP_BRANCH}${NC}"
git checkout ${MAIN_BRANCH}
git branch ${BACKUP_BRANCH}

# Switch to main branch
echo -e "${BLUE}Switching to ${MAIN_BRANCH} branch...${NC}"
git checkout ${MAIN_BRANCH}

# Define files to update based on tier selection
echo ""
echo -e "${YELLOW}Select update tier:${NC}"
echo "  1) Tier 1 only (Core: theme.ts, AppHeader.tsx, App.tsx) - Quick"
echo "  2) Tier 1 + Tier 2 (Core + All Pages) - Complete"
echo "  3) Tier 1 + Tier 2 + Tier 3 (Core + Pages + Components) - Full"
echo "  4) Custom selection"
read -p "Choice (1-4): " TIER_CHOICE

case $TIER_CHOICE in
    1)
        FILES=(
            "src/theme.ts"
            "src/components/AppHeader.tsx"
            "src/App.tsx"
        )
        TIER_NAME="tier1-core"
        ;;
    2)
        FILES=(
            "src/theme.ts"
            "src/components/AppHeader.tsx"
            "src/App.tsx"
            "src/pages/HomePage.tsx"
            "src/pages/GuidePage.tsx"
            "src/pages/SessionsListPage.tsx"
            "src/pages/ItemDetailPage.tsx"
            "src/pages/CommittedPlanPage.tsx"
            "src/pages/SettingsPage.tsx"
        )
        TIER_NAME="tier1-2-complete"
        ;;
    3)
        FILES=(
            "src/theme.ts"
            "src/components/AppHeader.tsx"
            "src/App.tsx"
            "src/pages/HomePage.tsx"
            "src/pages/GuidePage.tsx"
            "src/pages/SessionsListPage.tsx"
            "src/pages/ItemDetailPage.tsx"
            "src/pages/CommittedPlanPage.tsx"
            "src/pages/SettingsPage.tsx"
            "src/components/CreateScenarioModal.tsx"
            "src/components/ErrorBoundary.tsx"
            "src/components/PMIntakeForm.tsx"
            "src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx"
            "src/pages/QuarterlyCapacityPage.tsx"
        )
        TIER_NAME="tier1-2-3-full"
        ;;
    4)
        echo ""
        echo -e "${YELLOW}Enter file paths (one per line, empty line to finish):${NC}"
        FILES=()
        while IFS= read -r line; do
            [[ -z "$line" ]] && break
            FILES+=("$line")
        done
        TIER_NAME="custom"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Updating ${#FILES[@]} files from ${DEVELOPMENT_BRANCH}...${NC}"
echo ""

# Track files that were successfully updated
UPDATED_FILES=()
FAILED_FILES=()

# Copy each file from development branch
for file in "${FILES[@]}"; do
    if git show ${DEVELOPMENT_BRANCH}:${file} > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Updating ${file}"
        git checkout ${DEVELOPMENT_BRANCH} -- "${file}"
        UPDATED_FILES+=("${file}")
    else
        echo -e "${RED}✗${NC} File not found in ${DEVELOPMENT_BRANCH}: ${file}"
        FAILED_FILES+=("${file}")
    fi
done

echo ""
if [ ${#FAILED_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}Warning: ${#FAILED_FILES[@]} file(s) could not be updated:${NC}"
    for file in "${FAILED_FILES[@]}"; do
        echo -e "  ${YELLOW}- ${file}${NC}"
    done
    echo ""
fi

# Show status
echo -e "${BLUE}Checking git status...${NC}"
git status --short

# Ask if user wants to commit
echo ""
read -p "Stage and commit these changes? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stage all changes
    git add "${UPDATED_FILES[@]}"
    
    # Create commit message
    COMMIT_MSG="Design system update: ${TIER_NAME}

Updated design system files from ${DEVELOPMENT_BRANCH} branch:
- Core theme and styling
- Component design system colors
- Page-level design system styling

Files updated (${#UPDATED_FILES[@]}):
$(printf '  - %s\n' "${UPDATED_FILES[@]}")"

    git commit -m "$COMMIT_MSG"
    
    echo ""
    echo -e "${GREEN}✓ Changes committed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Review the changes: git show HEAD"
    echo "  2. Test the updated design system"
    echo "  3. Push to main: git push origin ${MAIN_BRANCH}"
    echo "  4. Netlify will auto-deploy to capacity-planner.netlify.app"
    echo ""
    echo -e "${BLUE}Backup branch created: ${BACKUP_BRANCH}${NC}"
    echo -e "${BLUE}To restore: git reset --hard ${BACKUP_BRANCH}${NC}"
else
    echo -e "${YELLOW}Changes staged but not committed.${NC}"
    echo -e "${YELLOW}Review with: git diff --cached${NC}"
    echo -e "${YELLOW}Commit manually when ready.${NC}"
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo ""
    read -p "Restore stashed changes? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash pop
    else
        echo -e "${YELLOW}Stashed changes remain in stash.${NC}"
        echo -e "${YELLOW}Restore later with: git stash pop${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Done!${NC}"
