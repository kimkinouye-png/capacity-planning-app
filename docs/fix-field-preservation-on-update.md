# Fix: Field Preservation on Update

## Problem

When editing fields in the Roadmap Items grid, updating one field would cause other fields to disappear or reset to defaults. For example:
- Changing the name would cause dates to disappear
- Changing UX focus weeks would reset Content focus weeks to default
- Changing Content focus weeks would reset UX focus weeks to default

## Root Cause

The `updateItem` function in `RoadmapItemsContext.tsx` was merging the API response with the updates like this:

```typescript
const mergedItem = { ...updatedItem, ...updates }
```

The problem:
1. The API response (`updatedItem`) might not include all fields, especially:
   - New fields like `startDate`/`endDate` that weren't in the original schema
   - Fields that weren't changed in this update
   - Fields that the backend doesn't return in the response
2. The `updates` object only contains the fields being updated (e.g., just `name` when editing name)
3. When merging, any field that wasn't in the API response AND wasn't in the updates would be lost

## Solution

Modified `updateItem` to preserve the current item from state before merging:

```typescript
setItemsBySession((prev) => {
  // Find the current item from state to preserve all existing fields
  let currentItem: RoadmapItem | undefined
  for (const items of Object.values(prev)) {
    const item = items.find((i) => i.id === itemId)
    if (item) {
      currentItem = item
      break
    }
  }

  if (!currentItem) {
    return prev // No change if item not found
  }

  // Merge: currentItem (preserves all existing fields) + API response + updates
  const mergedItem = { ...currentItem, ...updatedItem, ...updates }
  const normalizedItem = normalizeRoadmapItem(mergedItem)
  // ... update state with normalizedItem
})
```

**Merge order matters:**
1. `currentItem` (base - all existing fields)
2. `updatedItem` (API response - may be partial)
3. `updates` (our changes - highest priority)

This ensures:
- All existing fields are preserved
- API response updates are applied
- Our explicit updates override everything

## Normalization Behavior

The `normalizeRoadmapItem` function recalculates work weeks from focus weeks, which is correct behavior:
- If UX focus weeks is updated, UX work weeks is recalculated (correct)
- If Content focus weeks is valid, it's preserved (not recalculated)
- If Content focus weeks is invalid/missing, it's calculated from size band (correct)

This normalization only affects fields that are invalid or missing, so valid existing values are preserved.

## Testing

To verify the fix:
1. Create a roadmap item with dates, UX focus weeks, and Content focus weeks
2. Edit the name - dates should remain
3. Edit UX focus weeks - Content focus weeks should remain
4. Edit Content focus weeks - UX focus weeks should remain
5. Edit dates - other fields should remain

All fields should now be preserved when updating individual fields.
