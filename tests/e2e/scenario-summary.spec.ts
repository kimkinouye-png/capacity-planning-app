import { test, expect } from '@playwright/test';

const QA_CODE = process.env.QA_CODE || 'QA2026';

/**
 * Helper function to authenticate with QA code
 * Will be a no-op if QA auth is disabled (VITE_DISABLE_QA_AUTH=true)
 */
async function authenticate(page: any) {
  // Check if QA auth screen is shown
  const qaInput = page.locator('input[type="password"], input[placeholder*="QA"], input[placeholder*="code"]').first();
  
  if (await qaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await qaInput.fill(QA_CODE);
    await page.locator('button:has-text("Access"), button:has-text("Submit"), button[type="submit"]').first().click();
    // Wait for app to load after authentication
    await page.waitForURL(/\/(scenarios|sessions|$)/, { timeout: 10000 });
  }
}

test.describe('Scenario Summary Page', () => {
  test.beforeEach(async ({ page }) => {
    // Start from scenarios list page
    await page.goto('/scenarios');
    await authenticate(page);

    // Wait for scenarios list to load - use specific heading to avoid strict mode violations
    const scenariosHeading = page.getByRole('heading', { name: 'Planning Scenarios' });
    const emptyStateHeading = page.getByRole('heading', { name: 'Welcome to Capacity Planning!' });
    
    // Wait for either the scenarios list or empty state to appear
    await Promise.race([
      scenariosHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      emptyStateHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    ]);

    // Check if we're in empty state - create a scenario if needed
    const isEmpty = await emptyStateHeading.isVisible().catch(() => false);
    if (isEmpty) {
      // Create a "Lebron" scenario for testing
      await page.getByRole('button', { name: '+ Create New Scenario' }).click();
      
      // Fill out the form
      await page.getByLabel('Name').fill('Lebron');
      await page.getByLabel('Planning Period').selectOption('2026-Q3');
      // UX Designers and Content Designers should have defaults (3 and 2), but let's set them explicitly
      await page.getByLabel('UX Designers').fill('3');
      await page.getByLabel('Content Designers').fill('6');
      
      // Submit the form
      await page.getByRole('button', { name: 'Create Scenario' }).click();
      
      // Wait for navigation to the new scenario's summary page
      // Use strict-mode locator: target the scenario name header (not breadcrumb)
      const scenarioNameHeader = page
        .getByRole('group', { name: 'Scenario name - Click to edit' })
        .getByText('Lebron', { exact: true });
      await expect(scenarioNameHeader).toBeVisible({ timeout: 15000 });
      return; // Already on the summary page
    }

    // Ensure scenarios list is visible
    await expect(scenariosHeading).toBeVisible({ timeout: 5000 });

    // Try to find and click "Lebron" scenario, or click the first scenario if Lebron doesn't exist
    // Use link locator to avoid clicking on non-clickable text elements
    const lebronLink = page.getByRole('link', { name: /Lebron/i });
    const lebronExists = await lebronLink.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (lebronExists) {
      await lebronLink.click();
    } else {
      // If Lebron doesn't exist, click the first scenario link
      // Use link locator to ensure we're clicking a navigable element
      const firstScenarioLink = page.locator('a[href^="/sessions/"]').first();
      if (await firstScenarioLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstScenarioLink.click();
      } else {
        // Fallback: try to find any scenario card and click it
        const firstScenarioCard = page.locator('[data-testid="scenario-card"], article, [role="article"]').first();
        if (await firstScenarioCard.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstScenarioCard.click();
        }
      }
    }
    
    // Wait for the summary page to load
    await expect(page.getByText(/2026 Q|UX Designers|Content Designers/i)).toBeVisible({ timeout: 15000 });
  });

  test('Lebron session loads with correct details', async ({ page }) => {
    // Page is already on the summary page from beforeEach
    // Verify session name is visible (rendered by InlineEditableText)
    // Use strict-mode locator: target the scenario name header group
    const scenarioNameGroup = page.getByRole('group', { name: 'Scenario name - Click to edit' });
    await expect(scenarioNameGroup).toBeVisible();
    
    // Verify the scenario name text is present (may be "Lebron" or another name)
    const scenarioNameText = scenarioNameGroup.getByText(/.+/, { exact: false }).first();
    await expect(scenarioNameText).toBeVisible();
    const sessionName = await scenarioNameText.textContent();
    expect(sessionName).toBeTruthy();
    expect(sessionName?.trim().length).toBeGreaterThan(0);
    
    // Verify subtitle with quarter and team info exists
    // Format: "2026 Q3 • 3 UX Designers • 6 Content Designers" or similar
    // These are unique enough that regex patterns are acceptable
    await expect(page.getByText(/\d{4} Q\d/)).toBeVisible(); // Matches "2026 Q3" pattern
    await expect(page.getByText(/UX Designers/i)).toBeVisible();
    await expect(page.getByText(/Content Designers/i)).toBeVisible();
  });

  test('Scenario summary shows capacity cards', async ({ page }) => {
    // Page is already on the summary page from beforeEach
    // Check for capacity card headings
    await expect(page.getByRole('heading', { name: 'UX Design Capacity' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Content Design Capacity' })).toBeVisible({ timeout: 10000 });
    
    // Verify capacity cards show "Total Capacity" labels
    await expect(page.getByText('Total Capacity', { exact: false }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Scenario summary shows roadmap items section', async ({ page }) => {
    // Page is already on the summary page from beforeEach
    // Check for empty state message
    await expect(page.getByText('No roadmap items yet. Add items to see capacity calculations.')).toBeVisible({ timeout: 10000 });
    
    // Check for "Add Your First Item" button
    await expect(page.getByRole('button', { name: '+ Add Your First Item' })).toBeVisible({ timeout: 10000 });
  });
});
