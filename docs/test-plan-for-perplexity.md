# Comprehensive Test Plan for Capacity Planning App

## Overview

This test plan is designed to be executed by Perplexity AI to thoroughly test the Capacity Planning application and investigate database connection issues. The app is deployed on Netlify with a Neon Postgres database.

**Application URLs:**
- Development/Testing: `capacity-planner-2.netlify.app`
- Stable Demo: `capacity-planner.netlify.app` (if applicable)

**QA Access Code:** `QA2026

---

## Test Plan Execution Instructions for Perplexity

### Phase 1: Environment Setup and Access

**Prompt 1: Access the Application**
```
I need to test a Capacity Planning web application. Please:
1. Navigate to https://capacity-planner-2.netlify.app
2. Enter the QA access code: QA2026
3. Confirm you can see the main application interface with navigation links (Scenarios, Committed Plan, Guide, Settings)
4. Report any errors or access issues you encounter
```

**Expected Result:** Successfully access the app and see the main interface.

---

## Phase 2: Radio Button Functionality Tests

### Test 2.1: Radio Button on Committed Scenarios with Zero Items

**Prompt 2.1:**
```
On the Capacity Planning app (capacity-planner-2.netlify.app), I need to test the "Commit as plan" radio button functionality:

1. Navigate to the Scenarios page (/scenarios)
2. Find a scenario that is marked as "Committed plan" but has "0 roadmap items"
3. Click on the radio button (the circle next to "Committed plan" text)
4. Observe what happens:
   - Does the radio button toggle/uncommit?
   - Do you see a success toast notification?
   - Does the scenario status change from "Committed plan" to "Commit as plan"?
   - Are there any error messages?
5. Try clicking the radio button again to recommit it
6. Report all observations, including any errors in the browser console (F12 → Console tab)
```

**Expected Result:** 
- Radio button should work to uncommit scenarios with 0 items
- Should see success toast: "Scenario uncommitted"
- Status should change from "Committed plan" to "Commit as plan"
- No errors in console

**Success Criteria:** Radio button works for both committing and uncommitting, regardless of item count.

---

### Test 2.2: Radio Button on Draft Scenarios with Zero Items

**Prompt 2.2:**
```
On the Capacity Planning app, test the radio button on draft scenarios:

1. Navigate to /scenarios
2. Find a scenario that is NOT committed (shows "Commit as plan") and has "0 roadmap items"
3. Click the radio button
4. Observe:
   - Does it show a warning message?
   - What does the warning say?
   - Can you still commit it, or is it blocked?
5. Report observations
```

**Expected Result:**
- Should show warning toast: "Cannot commit scenario - Add at least one roadmap item before committing"
- Should NOT allow committing without items
- Radio button should remain unchecked

---

### Test 2.3: Radio Button on Scenarios with Items

**Prompt 2.3:**
```
Test the radio button on scenarios that have roadmap items:

1. Navigate to /scenarios
2. Find a scenario that has at least 1 roadmap item (not "0 roadmap items")
3. If it's committed, click to uncommit, then click again to recommit
4. If it's not committed, click to commit, then click again to uncommit
5. Verify:
   - Radio button toggles correctly
   - Toast notifications appear
   - Status updates correctly
   - No errors occur
```

**Expected Result:** Radio button works correctly for scenarios with items.

---

## Phase 3: Adding Roadmap Items Tests

### Test 3.1: Add Item to Scenario with Zero Items

**Prompt 3.1:**
```
Test adding roadmap items to a scenario that currently has zero items:

1. Navigate to /scenarios
2. Click on a scenario that shows "0 roadmap items" (e.g., "Lebron" or "Chicago Bulls")
3. This should take you to the scenario detail page (/sessions/{id})
4. Look for the "No roadmap items yet" section
5. Click the "+ Add Your First Item" button
6. Fill out the form:
   - Short Key: TEST-1
   - Name: Test Item
   - Initiative: Test Initiative
   - Priority: 1
7. Click "Create Item"
8. Observe:
   - Does the modal close?
   - Does the item appear in the roadmap items list?
   - Are there any error messages?
   - Check browser console (F12) for any errors
9. If it fails, note the exact error message
```

**Expected Result:**
- Modal opens and closes correctly
- Item is created and appears in the list
- No database errors

**Failure Indicators:**
- Error toast: "Failed to create roadmap item"
- Console errors about database connection
- Item doesn't appear after creation

---

### Test 3.2: Add Item to Committed Scenario

**Prompt 3.2:**
```
Test adding items to a scenario that is already committed:

1. Navigate to a committed scenario (one marked as "Committed plan")
2. Try to add a roadmap item using "+ Add Your First Item" or "+ Add another feature"
3. Verify:
   - Can you add items to committed scenarios?
   - Does the item creation work?
   - Are there any restrictions or errors?
```

**Expected Result:** Should be able to add items to committed scenarios (no restrictions).

---

## Phase 4: Sizing Data Persistence Tests

### Test 4.1: UX Sizing Data Persistence

**Prompt 4.1:**
```
Test if UX sizing data persists correctly:

1. Navigate to a scenario that has at least one roadmap item
2. Click on a roadmap item to open the detail page
3. Go to the "UX Design" tab
4. Change the factor scores (Product Risk, Problem Ambiguity, Discovery Depth):
   - Change Product Risk from current value to a different value (e.g., 1 to 5)
   - Wait 2-3 seconds after each change
5. Observe the "UX Effort Estimate" card:
   - Does the Size change?
   - Do Focus Weeks change?
   - Do Work Weeks change?
6. Navigate away from the page (go back to scenarios list)
7. Navigate back to the same item
8. Check if the sizing data persisted:
   - Are the factor scores still set to what you changed them to?
   - Is the Size still showing the calculated value?
   - Are Focus Weeks and Work Weeks still showing the calculated values?
9. Report what persisted and what didn't
```

**Expected Result:**
- Factor scores persist
- Calculated sizing (Size, Focus Weeks, Work Weeks) persists
- All data should be saved after 500ms debounce delay

**Failure Indicators:**
- Sizing data resets to defaults
- Factor scores reset
- Error messages about database sync

---

### Test 4.2: Content Sizing Data Persistence

**Prompt 4.2:**
```
Test if Content sizing data persists correctly:

1. Navigate to a roadmap item detail page
2. Go to the "Content Design" tab
3. Change the factor scores (Content Surface Area, Localization Scope, etc.)
4. Observe the "Content Effort Estimate" card updates
5. Navigate away and come back
6. Verify if Content sizing data persisted
7. Report findings
```

**Expected Result:** Content sizing data should persist like UX sizing.

---

### Test 4.3: Date Data Persistence (Baseline)

**Prompt 4.3:**
```
Verify that date fields persist correctly (this should be working):

1. Navigate to a roadmap item
2. Find the Start Date and End Date fields
3. Set dates (e.g., Start: 2026-01-01, End: 2026-02-01)
4. Navigate away and come back
5. Verify dates are still set
6. Report if dates persist (they should)
```

**Expected Result:** Dates should persist (this is the baseline that works).

---

## Phase 5: Database Connection Investigation

### Test 5.1: Check Browser Console for Database Errors

**Prompt 5.1:**
```
Investigate database connection issues:

1. Open browser DevTools (F12)
2. Go to the Console tab
3. Clear the console
4. Perform these actions and watch for errors:
   - Navigate to scenarios page
   - Try to commit/uncommit a scenario
   - Try to add a roadmap item
   - Change sizing factor scores
5. Look for error messages containing:
   - "database"
   - "timeout"
   - "connection"
   - "failed"
   - "sync"
   - "NETLIFY_DATABASE_URL"
6. Copy all error messages and report them
7. Check the Network tab (F12 → Network):
   - Look for failed requests to /api/* or /.netlify/functions/*
   - Note the status codes (should be 200, not 500 or timeout)
   - Report any failed API calls
```

**Expected Result:** No database connection errors in console.

**Failure Indicators:**
- Errors about "Failed to update roadmap item in database"
- Timeout errors
- Connection refused errors
- 500 status codes on API calls

---

### Test 5.2: Check for Sync Error Banners

**Prompt 5.2:**
```
Check for sync error banners throughout the app:

1. Navigate through different pages:
   - /scenarios
   - /sessions/{id} (scenario detail)
   - /sessions/{id}/items/{itemId} (item detail)
   - /settings
2. Look for yellow or red error banners that say:
   - "Sync Error"
   - "Database Error"
   - "Failed to update"
   - "Changes saved locally"
3. Note which pages show errors
4. Try the "Retry" or refresh buttons if present
5. Report all error banners found
```

**Expected Result:** No error banners should appear if database is working.

---

## Phase 6: Netlify Dashboard Investigation

### Investigation 6.1: Check Netlify Function Logs

**Prompt 6.1:**
```
I need you to help me investigate Netlify function logs. Please provide guidance on:

1. How to access Netlify function logs for the site capacity-planner-2.netlify.app
2. What to look for in the logs:
   - Database connection errors
   - Timeout errors
   - Failed function invocations
   - Error patterns related to:
     * update-roadmap-item
     * create-roadmap-item
     * update-settings
     * commit-scenario
3. How to identify if errors are related to:
   - Neon database connection timeouts
   - Missing environment variables (NETLIFY_DATABASE_URL)
   - Function execution timeouts
4. Provide specific log entries to search for
```

**Expected Findings:**
- Look for patterns of timeout errors
- Check if functions are timing out before database responds
- Verify NETLIFY_DATABASE_URL is set

---

### Investigation 6.2: Check Netlify Environment Variables

**Prompt 6.2:**
```
Help me verify Netlify environment variables:

1. Explain how to check if NETLIFY_DATABASE_URL is set in Netlify dashboard
2. Verify the environment variable is configured for:
   - Production builds
   - Function execution
3. Check if there are separate variables for:
   - NETLIFY_DATABASE_URL (pooled)
   - NETLIFY_DATABASE_URL_UNPOOLED
4. Report if variables are missing or misconfigured
```

---

### Investigation 6.3: Check Netlify Build and Deploy Status

**Prompt 6.3:**
```
Check Netlify deployment status:

1. Access Netlify dashboard for capacity-planner-2 site
2. Check recent deployments:
   - Are builds succeeding?
   - Are there any failed deployments?
   - What are the build times?
3. Check function logs for recent errors
4. Report deployment health status
```

---

## Phase 7: Neon Database Investigation

### Investigation 7.1: Check Neon Database Connection

**Prompt 7.1:**
```
Investigate Neon database connection issues:

1. Access Neon dashboard for the database used by capacity-planner-2
2. Check:
   - Is the database compute active or suspended?
   - What is the connection status?
   - Are there connection timeout errors in logs?
3. Check database metrics:
   - Query execution times
   - Failed queries
   - Connection pool usage
4. Look for patterns:
   - Are writes (INSERT/UPDATE) failing more than reads (SELECT)?
   - Are timeouts happening during compute wake-up?
   - What is the average query execution time?
5. Report findings
```

**Key Metrics to Check:**
- Compute status (active/suspended)
- Connection pool exhaustion
- Query timeout rates
- Write operation success rates

---

### Investigation 7.2: Check Neon Database Schema

**Prompt 7.2:**
```
Verify Neon database schema:

1. Check if the roadmap_items table has all required columns:
   - ux_size (or uxSizeBand)
   - content_size (or contentSizeBand)
   - ux_focus_weeks
   - content_focus_weeks
   - ux_work_weeks
   - content_work_weeks
   - start_date
   - end_date
2. Verify data types match what the application expects
3. Check if there are any missing indexes that could cause slow queries
4. Report any schema mismatches
```

---

### Investigation 7.3: Test Direct Database Connection

**Prompt 7.3:**
```
Test direct database connectivity:

1. Use Neon SQL editor or psql to connect directly
2. Run test queries:
   - SELECT COUNT(*) FROM roadmap_items;
   - SELECT * FROM roadmap_items LIMIT 1;
   - Check if UPDATE operations work
3. Measure query execution times
4. Test if connection timeouts occur
5. Report connection health
```

---

## Phase 8: Specific Issue Reproduction

### Test 8.1: Reproduce Sizing Data Not Persisting

**Prompt 8.1:**
```
Reproduce the sizing data persistence issue:

1. Create a new roadmap item in a scenario
2. Navigate to item detail page
3. Set UX factor scores to specific values (e.g., Product Risk: 5, Problem Ambiguity: 3, Discovery Depth: 4)
4. Note the calculated Size, Focus Weeks, Work Weeks
5. Wait 5 seconds (to ensure debounce completes)
6. Navigate to scenarios list
7. Navigate back to the same item
8. Check if:
   - Factor scores are still set correctly
   - Calculated sizing values match what was shown before
9. If values are different or reset, note exactly what changed
10. Check browser console for any errors during this process
11. Check Network tab for failed API calls to update-roadmap-item
```

---

### Test 8.2: Reproduce Radio Button Issue

**Prompt 8.2:**
```
Reproduce the radio button issue on committed scenarios with zero items:

1. Find or create a scenario that is committed but has 0 items
2. Try clicking the radio button multiple times
3. Document:
   - Does the click register?
   - Does anything happen?
   - Are there console errors?
   - What does the Network tab show when clicking?
4. Try the same test on a scenario with items (should work)
5. Compare behavior between scenarios with and without items
```

---

## Phase 9: Error Message Collection

### Test 9.1: Collect All Error Messages

**Prompt 9.1:**
```
Collect comprehensive error information:

1. Go through the entire application and perform all major actions
2. Document every error message you see:
   - UI error banners
   - Toast notifications with errors
   - Browser console errors
   - Network request failures
3. For each error, note:
   - Where it occurred (which page/action)
   - Exact error message text
   - Timestamp or sequence
   - Whether it's a database error, timeout, or other issue
4. Create a comprehensive error log
```

---

## Phase 10: Performance and Timing Tests

### Test 10.1: Measure Database Operation Times

**Prompt 10.1:**
```
Measure database operation performance:

1. Open browser DevTools → Network tab
2. Filter to show only requests to /.netlify/functions/*
3. Perform these actions and measure response times:
   - Create a roadmap item (create-roadmap-item)
   - Update sizing factor scores (update-roadmap-item)
   - Commit a scenario (commit-scenario)
   - Update settings (update-settings)
4. For each operation:
   - Note the request duration
   - Check if it's under 30 seconds (write timeout limit)
   - Note if any requests timeout
5. Report timing data
```

**Expected:** Write operations should complete within 30 seconds.

---

## Reporting Template

After completing all tests, provide a report with:

1. **Test Results Summary:**
   - Which tests passed
   - Which tests failed
   - Failure rates

2. **Error Patterns:**
   - Common error messages
   - When errors occur
   - Error frequency

3. **Database Connection Health:**
   - Connection success rate
   - Timeout frequency
   - Average response times

4. **Root Cause Analysis:**
   - Likely causes of issues
   - Evidence supporting conclusions
   - Recommendations for fixes

5. **Specific Issues Found:**
   - Radio button behavior on zero-item scenarios
   - Sizing data persistence failures
   - Database connection problems
   - Any other issues discovered

---

## Quick Reference: Key URLs and Codes

- **App URL:** https://capacity-planner-2.netlify.app
- **QA Code:** QA2026
- **Key Pages:**
  - Scenarios: `/scenarios`
  - Scenario Detail: `/sessions/{id}`
  - Item Detail: `/sessions/{id}/items/{itemId}`
  - Settings: `/settings`

---

## Notes for Perplexity

- Take screenshots of error messages when possible
- Copy exact error text from console
- Note the sequence of actions that lead to errors
- Check both browser console and Network tab
- Document timing of operations
- Look for patterns across multiple test runs
