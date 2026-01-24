# End-to-End Tests

Playwright E2E tests for the Capacity Planning application.

## Test Files

- **`scenario-summary.spec.ts`** - Tests for scenario summary page (Lebron session)
- **`radio-button-commit.spec.ts`** - Tests for commit/uncommit radio button functionality
- **`add-roadmap-item.spec.ts`** - Tests for adding roadmap items to scenarios
- **`sizing-persistence.spec.ts`** - Tests for sizing data persistence

## Running Tests

### Prerequisites

1. Install Playwright browsers (first time only):
   ```bash
   npx playwright install
   ```

2. Start the dev server (in a separate terminal):
   ```bash
   npm run dev
   ```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (see browser)

```bash
npm run test:e2e:headed
```

### Run Specific Test File

```bash
npx playwright test scenario-summary
npx playwright test radio-button-commit
npx playwright test add-roadmap-item
npx playwright test sizing-persistence
```

## Environment Variables

Tests use these environment variables (with defaults):

- `BASE_URL` - Base URL for the app (default: `http://localhost:5174` from playwright.config.ts)
- `QA_CODE` - QA access code (default: `QA2026`)

To test against production:

```bash
BASE_URL=https://capacity-planner-2.netlify.app npm run test:e2e
```

**Note:** The baseURL is configured in `playwright.config.ts`. Tests use relative paths (e.g., `/scenarios`) which automatically use the configured baseURL.

## Test Coverage

### ✅ Radio Button Tests
- Uncommitting scenarios with 0 items
- Warning when trying to commit without items
- Committing/uncommitting scenarios with items

### ✅ Roadmap Item Tests
- Adding items to scenarios with 0 items
- Database error detection

### ✅ Sizing Persistence Tests
- UX sizing data persistence
- Database error detection during sizing updates

### ✅ Scenario Summary Tests
- Page loads correctly
- Capacity cards display
- Roadmap items section visible

## Debugging

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Debug a Specific Test

```bash
npx playwright test scenario-summary --debug
```

### Take Screenshots on Failure

Screenshots are automatically saved to `test-results/` on failure.

### View Traces

Traces are saved on first retry. View them with:

```bash
npx playwright show-trace test-results/trace.zip
```

## CI/CD

Tests run automatically on GitHub Actions (see `.github/workflows/playwright.yml`).

## Notes

- Tests automatically handle QA authentication
- Tests wait for network idle to ensure pages are fully loaded
- Some tests may be skipped if required scenarios/items don't exist
- Tests include error detection for database connection issues
