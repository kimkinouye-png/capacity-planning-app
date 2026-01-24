# Deployment Verification Checklist

**Date:** January 24, 2026  
**Purpose:** Verify all recent updates are working correctly on both sites

## Pre-Deployment Checks

- [ ] Both sites have completed Netlify deployments
  - [ ] `capacity-planner.netlify.app` (main branch) - Check Netlify dashboard
  - [ ] `capacity-planner-2.netlify.app` (development branch) - Check Netlify dashboard
- [ ] No build errors in Netlify deployment logs
- [ ] Deployment status shows "Published" (not "Building" or "Failed")

---

## 1. Site Accessibility (No Password Required)

### Main Site: capacity-planner.netlify.app
- [ ] Site loads without password prompt
- [ ] Can access homepage directly
- [ ] Can navigate to all pages without authentication

### Development Site: capacity-planner-2.netlify.app
- [ ] Site loads without password prompt
- [ ] Can access homepage directly
- [ ] Can navigate to all pages without authentication

---

## 2. Editable Team Size Numbers ✅

### Test on Scenario Summary Page
- [ ] Navigate to a scenario summary page (any scenario)
- [ ] **UX Designers Team Size:**
  - [ ] Click the number (e.g., "3") in the "UX Design Capacity" card
  - [ ] Input field appears for editing
  - [ ] Change the value (e.g., change 3 to 4)
  - [ ] Press Enter or click away to save
  - [ ] Number updates immediately in UI
  - [ ] Capacity calculations update automatically (Total Capacity, Surplus/Deficit)
  - [ ] Refresh the page - value persists (still shows new number)
- [ ] **Content Designers Team Size:**
  - [ ] Click the number (e.g., "2") in the "Content Design Capacity" card
  - [ ] Input field appears for editing
  - [ ] Change the value (e.g., change 2 to 3)
  - [ ] Press Enter or click away to save
  - [ ] Number updates immediately in UI
  - [ ] Capacity calculations update automatically
  - [ ] Refresh the page - value persists

### Edge Cases
- [ ] Try entering 0 - should work (or show validation error if min=1)
- [ ] Try entering a very large number (e.g., 100) - should work or be capped
- [ ] Try entering invalid input (e.g., "abc") - should revert to original value
- [ ] Press Escape while editing - should cancel and revert to original value

---

## 3. Database Connection & Persistence ✅

### Database Health Check
- [ ] Visit `/.netlify/functions/db-health` on both sites
  - [ ] Main site: `https://capacity-planner.netlify.app/.netlify/functions/db-health`
  - [ ] Dev site: `https://capacity-planner-2.netlify.app/.netlify/functions/db-health`
- [ ] Both return: `{"status":"ok","message":"Database connection successful"}`
- [ ] No connection errors in browser console

### Data Persistence
- [ ] Create a new scenario
- [ ] Add a roadmap item
- [ ] Edit team size numbers
- [ ] Refresh the page
- [ ] All changes persist (scenario, items, team sizes still there)

### Error Handling
- [ ] Check browser console for any database-related errors
- [ ] Check Netlify function logs for connection issues
- [ ] Verify no "Database connection string provided to `neon()` is not a valid URL" errors

---

## 4. Performance Optimizations (Optimistic UI) ✅

### Delete Roadmap Item
- [ ] Navigate to a scenario with roadmap items
- [ ] Click delete on a roadmap item
- [ ] **Immediate UI Update:**
  - [ ] Item disappears from table immediately (before API completes)
  - [ ] Loading toast appears: "Deleting roadmap item..."
- [ ] **After API Completes:**
  - [ ] Item remains deleted (doesn't reappear)
  - [ ] No error messages
- [ ] Check browser console for timing logs:
  - [ ] `✅ [SessionSummaryPage] Delete successful` with duration
  - [ ] `✅ [delete-roadmap-item] Operation complete` with breakdown

### Uncommit Scenario
- [ ] Navigate to a committed scenario
- [ ] Click "Uncommit" button
- [ ] **Immediate UI Update:**
  - [ ] Button changes to "Commit this scenario" immediately
  - [ ] Status badge updates immediately
  - [ ] Loading toast appears: "Uncommitting scenario..."
- [ ] **After API Completes:**
  - [ ] Scenario remains uncommitted
  - [ ] No error messages
- [ ] Check browser console for timing logs

### Error Recovery (If API Fails)
- [ ] Simulate network failure (disable network in DevTools)
- [ ] Try to delete an item
- [ ] Item should be restored to UI after error
- [ ] Error toast should appear
- [ ] Re-enable network and verify state syncs correctly

---

## 5. Visual Updates ✅

### Capacity Cards Border Colors
- [ ] Navigate to a scenario summary page
- [ ] **UX Design Capacity Card:**
  - [ ] If surplus ≥ 0: Border is green (`rgba(16, 185, 129, 0.3)`)
  - [ ] If deficit < 0: Border is red (`rgba(239, 68, 68, 0.3)`)
- [ ] **Content Design Capacity Card:**
  - [ ] If surplus ≥ 0: Border is green
  - [ ] If deficit < 0: Border is red

### Dark Theme Consistency
- [ ] All pages use dark theme (`#0a0a0f` background)
- [ ] Cards use dark backgrounds (`#141419`)
- [ ] Text is readable (white/gray colors)
- [ ] No light theme elements visible

---

## 6. Core Functionality ✅

### Scenario Management
- [ ] Create a new scenario
- [ ] Edit scenario name (inline editing)
- [ ] Commit a scenario
- [ ] Uncommit a scenario
- [ ] Delete an empty scenario

### Roadmap Items
- [ ] Create a new roadmap item
- [ ] Edit roadmap item fields (name, key, dates, focus weeks)
- [ ] Delete a roadmap item
- [ ] Navigate to item detail page
- [ ] Edit PM Intake, Product Design, Content Design inputs
- [ ] Save changes and verify they persist

### Capacity Calculations
- [ ] Capacity metrics display correctly
- [ ] Surplus/deficit calculations are accurate
- [ ] Utilization percentages are correct
- [ ] Capacity updates when team size changes
- [ ] Capacity updates when roadmap items change

---

## 7. Navigation & Routing ✅

### Page Navigation
- [ ] Homepage loads correctly
- [ ] Scenarios list page loads
- [ ] Scenario summary page loads
- [ ] Item detail page loads
- [ ] Settings page loads (if visible)
- [ ] All navigation links work

### Client-Side Routing
- [ ] Direct URL access works (e.g., `/sessions/{id}`)
- [ ] Browser back/forward buttons work
- [ ] Page refresh on any route stays on same route (no redirect to `/`)
- [ ] No 404 errors on valid routes

---

## 8. Error Handling ✅

### Network Errors
- [ ] Check browser console for errors
- [ ] Verify error toasts appear for failed operations
- [ ] Verify state restoration on errors (optimistic updates rollback)

### Database Errors
- [ ] No connection errors in console
- [ ] No timeout errors (unless database is actually suspended)
- [ ] Error messages are user-friendly

---

## 9. Browser Console Checks ✅

### Performance Logs
- [ ] Check for timing logs from delete operations
- [ ] Check for timing logs from uncommit operations
- [ ] Verify logs show reasonable durations

### Errors & Warnings
- [ ] No critical errors (red errors)
- [ ] No React warnings
- [ ] No TypeScript errors
- [ ] Warnings are acceptable (e.g., chunk size warnings are OK)

---

## 10. Cross-Browser Testing (Optional)

- [ ] Chrome/Edge - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Mobile browser - Basic functionality works

---

## 11. Netlify Function Logs

### Check Netlify Dashboard
- [ ] Main site functions: No errors in recent logs
- [ ] Dev site functions: No errors in recent logs
- [ ] Function execution times are reasonable (< 5 seconds for most operations)
- [ ] No connection string errors

### Specific Functions to Check
- [ ] `db-health` - Returns success
- [ ] `update-scenario` - Works for team size updates
- [ ] `delete-roadmap-item` - Works with timing logs
- [ ] `update-scenario` (uncommit) - Works with timing logs

---

## 12. Quick Smoke Test

### 5-Minute Quick Check
1. [ ] Visit both sites - no password required
2. [ ] Create a scenario
3. [ ] Edit team size (UX: 3→4, Content: 2→3)
4. [ ] Add a roadmap item
5. [ ] Delete the roadmap item (verify optimistic UI)
6. [ ] Refresh page - everything persists
7. [ ] Check browser console - no errors

---

## Issues Found

### Critical Issues (Blocking)
- [ ] None found

### Minor Issues (Non-blocking)
- [ ] None found

### Notes
_Add any observations or issues here:_

---

## Sign-Off

- [ ] All critical checks passed
- [ ] All features working as expected
- [ ] Both sites are production-ready
- [ ] Ready to proceed with next phase

**Verified by:** _________________  
**Date:** _________________  
**Time:** _________________

---

## Quick Reference

### Site URLs
- **Main (Stable):** https://capacity-planner.netlify.app
- **Development (Testing):** https://capacity-planner-2.netlify.app

### Key Features to Test
1. ✅ No password required
2. ✅ Editable team size numbers
3. ✅ Optimistic UI updates (delete/uncommit)
4. ✅ Database persistence
5. ✅ Visual updates (colored borders)

### Console Commands for Testing
```javascript
// Check if QA auth is disabled
console.log('QA Auth Disabled:', import.meta.env.VITE_DISABLE_QA_AUTH)

// Check database health
fetch('/.netlify/functions/db-health').then(r => r.json()).then(console.log)
```

---

## Troubleshooting

### If team size editing doesn't work:
1. Check browser console for errors
2. Verify `EditableNumberCell` component is rendering
3. Check network tab for API calls to `update-scenario`
4. Verify database connection is working

### If password prompt still appears:
1. Check `src/config/qaConfig.ts` - `QA_AUTH_DISABLED` should be `true`
2. Clear browser cache and localStorage
3. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
4. Check Netlify environment variables (should not override)

### If database errors occur:
1. Check `/.netlify/functions/db-health` endpoint
2. Verify `NETLIFY_DATABASE_URL` is set correctly in Netlify
3. Check connection string format (should be clean PostgreSQL URL)
4. Review Netlify function logs for connection errors

### If optimistic UI doesn't work:
1. Check browser console for timing logs
2. Verify state updates immediately (before API completes)
3. Check for errors in `RoadmapItemsContext` or `PlanningSessionsContext`
4. Verify API calls are completing successfully
