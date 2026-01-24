# How to Run Playwright Tests

## Quick Start

### 1. Install Playwright Browsers (First Time Only)

```bash
npx playwright install
```

This installs Chromium, Firefox, and WebKit browsers needed for testing.

### 2. Start the Dev Server

In one terminal, start your dev server:

```bash
npm run dev
```

Make sure it's running on `http://localhost:5174` (or whatever port Vite assigns).

### 3. Run Tests

In another terminal, run the tests:

```bash
# Run all E2E tests
npm run test:e2e

# Or use Playwright directly
npx playwright test
```

---

## Running Tests in Different Modes

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Recommended for Debugging)

This opens an interactive UI where you can:
- See tests running in real-time
- Click on tests to run them individually
- See the browser as tests execute
- Use the inspector to debug locators

```bash
npm run test:e2e:ui

# Or
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed

# Or
npx playwright test --headed
```

### Run a Specific Test File

```bash
npx playwright test tests/e2e/scenario-summary.spec.ts
npx playwright test tests/e2e/radio-button-commit.spec.ts
npx playwright test tests/e2e/add-roadmap-item.spec.ts
npx playwright test tests/e2e/sizing-persistence.spec.ts
```

### Run a Specific Test by Name

```bash
npx playwright test -g "Lebron session loads"
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

This opens Playwright Inspector where you can:
- Step through tests line by line
- See the browser state at each step
- Use the locator picker to find elements

---

## Running Tests in Cursor IDE

### Option 1: Integrated Terminal

1. Open Cursor's integrated terminal: `` Ctrl+` `` (or `View → Terminal`)
2. Run the commands above

### Option 2: Terminal Panel

1. Go to `Terminal → New Terminal`
2. Run: `npm run test:e2e`

### Option 3: Using Cursor's Command Palette

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Terminal: Run Task" or "Run Test"
3. Select the test command

---

## Running Tests Against Different Environments

### Local Development (Default)

```bash
npm run test:e2e
```

Uses `http://localhost:5174` (from playwright.config.ts)

### Production/Staging

```bash
BASE_URL=https://capacity-planner-2.netlify.app npm run test:e2e
```

### Custom Port

If your dev server is on a different port:

```bash
BASE_URL=http://localhost:3000 npm run test:e2e
```

---

## Viewing Test Results

### HTML Report (After Tests Complete)

```bash
npx playwright show-report
```

This opens a detailed HTML report with:
- Test results
- Screenshots on failure
- Videos on failure
- Traces for debugging

### View Traces

If a test fails, view the trace:

```bash
npx playwright show-trace test-results/trace.zip
```

---

## Common Issues and Solutions

### Issue: "Browser not found"

**Solution:**
```bash
npx playwright install
```

### Issue: "Port 5174 not available"

**Solution:**
1. Check if dev server is running: `npm run dev`
2. Or set a different port:
   ```bash
   BASE_URL=http://localhost:5173 npm run test:e2e
   ```

### Issue: "Tests timeout"

**Solution:**
- Make sure dev server is running
- Check if QA authentication is working
- Increase timeout in test if needed

### Issue: "Can't find elements"

**Solution:**
1. Run in UI mode to see what's happening:
   ```bash
   npx playwright test --ui
   ```
2. Use the locator picker in the UI to find correct selectors
3. Check if page is fully loaded (add `await page.waitForLoadState('networkidle')`)

---

## Recommended Workflow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Run tests in UI mode (in another terminal):**
   ```bash
   npm run test:e2e:ui
   ```

3. **In the Playwright UI:**
   - Click on a test to run it
   - Watch it execute in the browser
   - See any failures immediately
   - Use the inspector to debug

4. **After tests complete:**
   ```bash
   npx playwright show-report
   ```
   View detailed results

---

## Test Files Location

All E2E tests are in: `tests/e2e/`

- `scenario-summary.spec.ts` - Scenario page tests
- `radio-button-commit.spec.ts` - Commit button tests
- `add-roadmap-item.spec.ts` - Adding items tests
- `sizing-persistence.spec.ts` - Sizing data persistence tests

---

## Quick Reference

```bash
# Install browsers (first time)
npx playwright install

# Run all tests
npm run test:e2e

# Run with UI (best for debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/scenario-summary.spec.ts

# Run in debug mode
npx playwright test --debug

# View results
npx playwright show-report
```
