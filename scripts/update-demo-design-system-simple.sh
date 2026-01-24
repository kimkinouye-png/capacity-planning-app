#!/bin/bash

# Simple script to update design system files
# Usage: ./scripts/update-demo-design-system-simple.sh [tier]
# Tier options: 1 (core), 2 (complete), 3 (full)

set -e

TIER=${1:-1}  # Default to tier 1
DEVELOPMENT_BRANCH="development"

echo "Updating design system files (Tier $TIER)..."

# Tier 1: Core files
if [ "$TIER" = "1" ]; then
    echo "Updating Tier 1 (Core) files..."
    git checkout ${DEVELOPMENT_BRANCH} -- src/theme.ts
    git checkout ${DEVELOPMENT_BRANCH} -- src/components/AppHeader.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/App.tsx
    echo "✓ Tier 1 complete"
fi

# Tier 2: Add page files
if [ "$TIER" = "2" ] || [ "$TIER" = "3" ]; then
    echo "Updating Tier 2 (Pages) files..."
    git checkout ${DEVELOPMENT_BRANCH} -- src/pages/HomePage.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/pages/GuidePage.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/pages/SessionsListPage.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/pages/ItemDetailPage.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/pages/CommittedPlanPage.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/pages/SettingsPage.tsx
    echo "✓ Tier 2 complete"
fi

# Tier 3: Add component files
if [ "$TIER" = "3" ]; then
    echo "Updating Tier 3 (Components) files..."
    git checkout ${DEVELOPMENT_BRANCH} -- src/components/CreateScenarioModal.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/components/ErrorBoundary.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/components/PMIntakeForm.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx
    git checkout ${DEVELOPMENT_BRANCH} -- src/pages/QuarterlyCapacityPage.tsx
    echo "✓ Tier 3 complete"
fi

echo ""
echo "Files updated! Review with: git status"
echo "Commit with: git add . && git commit -m 'Design system update: Tier $TIER'"
