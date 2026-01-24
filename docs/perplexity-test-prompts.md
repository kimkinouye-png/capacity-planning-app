# Perplexity Test Prompts - Quick Start Guide

Copy and paste these prompts into Perplexity to execute the test plan.

---

## Initial Setup Prompt

```
I need to test a Capacity Planning web application deployed on Netlify. Please help me execute a comprehensive test plan.

Application URL: https://capacity-planner-2.netlify.app
QA Access Code: QA2026

Please start by:
1. Accessing the application using the QA code
2. Confirming you can see the main interface
3. Then proceed with the test plan I'll provide next
```

---

## Main Test Execution Prompt

```
I need you to execute a comprehensive test plan for the Capacity Planning app at capacity-planner-2.netlify.app. Please perform these tests in order and report findings:

**TEST 1: Radio Button on Committed Scenarios with Zero Items**
1. Navigate to /scenarios
2. Find a scenario marked "Committed plan" with "0 roadmap items"
3. Click the radio button (circle next to "Committed plan")
4. Report: Does it uncommit? Any errors? Check browser console (F12)

**TEST 2: Adding Roadmap Items**
1. Click on a scenario with "0 roadmap items"
2. Click "+ Add Your First Item"
3. Fill form: Short Key: TEST-1, Name: Test Item, Initiative: Test, Priority: 1
4. Click "Create Item"
5. Report: Does it work? Any errors? Check console and Network tab

**TEST 3: Sizing Data Persistence**
1. Open a roadmap item detail page
2. Go to "UX Design" tab
3. Change factor scores (Product Risk, Problem Ambiguity, Discovery Depth)
4. Note the calculated Size, Focus Weeks, Work Weeks
5. Wait 5 seconds
6. Navigate away, then come back
7. Report: Did sizing data persist? Or did it reset?

**TEST 4: Error Collection**
1. Open browser DevTools (F12)
2. Go through the app performing actions
3. Collect ALL error messages from:
   - Console tab
   - Network tab (failed requests)
   - UI error banners
4. Report all errors found

**TEST 5: Database Connection Check**
1. In Network tab, filter to /.netlify/functions/*
2. Perform: create item, update sizing, commit scenario
3. Measure response times
4. Report: Any timeouts? Status codes? Response times?

Please provide a detailed report with:
- Which tests passed/failed
- All error messages found
- Timing data
- Screenshots or exact error text
- Recommendations
```

---

## Netlify Investigation Prompt

```
I need help investigating Netlify deployment and function issues for capacity-planner-2.netlify.app:

1. How do I access Netlify function logs for this site?
2. What should I look for in the logs related to:
   - Database connection errors
   - Timeout errors
   - Failed function invocations (update-roadmap-item, create-roadmap-item)
3. How do I check if NETLIFY_DATABASE_URL environment variable is set?
4. How do I check recent deployment status and build health?
5. What patterns indicate Neon database connection issues?

Please provide step-by-step instructions for accessing Netlify dashboard and interpreting the logs.
```

---

## Neon Database Investigation Prompt

```
I need help investigating Neon Postgres database connection issues:

1. How do I access the Neon dashboard for the database used by capacity-planner-2.netlify.app?
2. What should I check:
   - Is compute active or suspended?
   - Connection status and metrics
   - Query execution times
   - Failed queries
   - Connection pool usage
3. How do I identify if writes (INSERT/UPDATE) are failing more than reads?
4. How do I check if timeouts are happening during compute wake-up?
5. How do I verify the roadmap_items table schema has all required columns (ux_size, content_size, ux_focus_weeks, etc.)?
6. How do I test direct database connectivity?

Please provide step-by-step instructions for investigating Neon database health and connection issues.
```

---

## Specific Issue Reproduction Prompt

```
I need to reproduce specific issues in the Capacity Planning app:

**ISSUE 1: Radio Button Not Working**
- Find a scenario that is "Committed plan" with "0 roadmap items"
- Try clicking the radio button
- Document: Does click register? Any console errors? Network requests?

**ISSUE 2: Sizing Data Not Persisting**
- Open a roadmap item
- Change UX factor scores
- Wait 5 seconds
- Navigate away and back
- Document: Did values persist? What changed?

**ISSUE 3: Cannot Add Items**
- Try adding a roadmap item to a scenario with 0 items
- Document: What happens? Any errors? Check console and Network tab

For each issue, provide:
- Steps to reproduce
- Expected vs actual behavior
- Error messages
- Console logs
- Network request details
```

---

## Comprehensive Error Analysis Prompt

```
I need a comprehensive error analysis for capacity-planner-2.netlify.app:

1. Access the application and perform all major actions:
   - Navigate pages
   - Commit/uncommit scenarios
   - Add/update roadmap items
   - Change sizing factor scores
   - Update settings

2. Collect ALL errors from:
   - Browser console (F12 → Console)
   - Network tab (failed requests)
   - UI error banners
   - Toast notifications

3. For each error, document:
   - Exact error message
   - Where it occurred (page/action)
   - When it occurred (sequence)
   - Error type (database, timeout, connection, etc.)

4. Analyze patterns:
   - Which actions cause errors most?
   - Are errors consistent or intermittent?
   - Do errors relate to database operations?
   - Are there timeout patterns?

5. Provide recommendations for fixes

Please provide a detailed error log and analysis.
```

---

## Performance Testing Prompt

```
I need performance testing for database operations:

1. Open browser DevTools → Network tab
2. Filter to /.netlify/functions/*
3. Measure response times for:
   - create-roadmap-item
   - update-roadmap-item
   - commit-scenario
   - update-settings

4. For each operation:
   - Note request duration
   - Check if under 30 seconds (timeout limit)
   - Note any timeouts
   - Check status codes

5. Report:
   - Average response times
   - Timeout frequency
   - Slow operations
   - Performance bottlenecks

Please provide timing data and performance analysis.
```

---

## Quick Diagnostic Prompt

```
Quick diagnostic for capacity-planner-2.netlify.app:

1. Access the app (QA code: QA2026)
2. Open browser console (F12)
3. Try these actions and report errors:
   - Click radio button on committed scenario with 0 items
   - Add a roadmap item
   - Change sizing factor scores
4. Check for error banners on:
   - /scenarios page
   - /sessions/{id} page
   - /settings page
5. Report all errors found immediately
```

---

## Tips for Using These Prompts

1. **Start with Initial Setup** - Get Perplexity into the app first
2. **Use Main Test Execution** - For comprehensive testing
3. **Use Specific Prompts** - When you need to focus on one issue
4. **Combine Prompts** - You can combine multiple prompts in one message
5. **Ask for Screenshots** - Perplexity can describe what it sees
6. **Request Step-by-Step** - Ask Perplexity to walk through each step

---

## Expected Output Format

After running tests, ask Perplexity to provide:

```
Please format your findings as:

**Test Results:**
- Test 1: [Pass/Fail] - [Details]
- Test 2: [Pass/Fail] - [Details]
...

**Errors Found:**
- [Error message] - [Location] - [When]
...

**Database Health:**
- Connection status: [Active/Issues]
- Timeout rate: [X%]
- Average response time: [X seconds]

**Recommendations:**
- [Specific fix suggestions]
```
