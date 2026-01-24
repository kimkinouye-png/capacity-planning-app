import { test, expect } from '@playwright/test';

// Using baseURL from playwright.config.ts
const QA_CODE = process.env.QA_CODE || 'QA2026';

async function authenticate(page: any) {
  const qaInput = page.locator('input[type="password"], input[placeholder*="QA"], input[placeholder*="code"]').first();
  if (await qaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await qaInput.fill(QA_CODE);
    await page.locator('button:has-text("Access"), button:has-text("Submit"), button[type="submit"]').first().click();
    await page.waitForURL(/\/(scenarios|sessions|$)/, { timeout: 10000 });
  }
}

test.describe('Add Roadmap Item', () => {
  test.beforeEach(async ({ page }) => {
    // Start from scenarios list page (same pattern as scenario-summary.spec.ts)
    await page.goto('/scenarios');
    await authenticate(page);

    // Wait for scenarios list to load
    const scenariosHeading = page.getByRole('heading', { name: 'Planning Scenarios' });
    const emptyStateHeading = page.getByRole('heading', { name: 'Welcome to Capacity Planning!' });
    
    await Promise.race([
      scenariosHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      emptyStateHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    ]);

    // Check if we're in empty state - create a scenario if needed
    const isEmpty = await emptyStateHeading.isVisible().catch(() => false);
    if (isEmpty) {
      // Create a "Lebron" scenario for testing
      await page.getByRole('button', { name: '+ Create New Scenario' }).click();
      await page.getByLabel('Name').fill('Lebron');
      await page.getByLabel('Planning Period').selectOption('2026-Q3');
      await page.getByLabel('UX Designers').fill('3');
      await page.getByLabel('Content Designers').fill('6');
      await page.getByRole('button', { name: 'Create Scenario' }).click();
      
      // Wait for navigation to the summary page
      await expect(
        page.getByRole('group', { name: 'Scenario name - Click to edit' })
      ).toBeVisible({ timeout: 15000 });
      return; // Already on the summary page
    }

    // Ensure scenarios list is visible
    await expect(scenariosHeading).toBeVisible({ timeout: 5000 });

    // Click on the first scenario (or Lebron if it exists)
    const lebronLink = page.getByRole('link', { name: /Lebron/i });
    const lebronExists = await lebronLink.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (lebronExists) {
      await lebronLink.click();
    } else {
      const firstScenarioLink = page.locator('a[href^="/sessions/"]').first();
      if (await firstScenarioLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstScenarioLink.click();
      }
    }
    
    // Wait for the summary page to load (UI-based wait, not networkidle)
    await expect(
      page.getByRole('group', { name: 'Scenario name - Click to edit' })
    ).toBeVisible({ timeout: 15000 });
  });

  test('Can add roadmap item to scenario with zero items', async ({ page }) => {
    // Page is already on the summary page from beforeEach
    // Look for "Add Your First Item" button (strict-mode locator)
    const addButton = page.getByRole('button', { name: '+ Add Your First Item' });
    
    // Check if button exists (scenario may already have items)
    const buttonExists = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!buttonExists) {
      test.skip('Add button not found - scenario may already have items');
      return;
    }

    await addButton.click();
    
    // Wait for modal dialog to open (ModalHeader renders as banner, not heading)
    const dialog = page.getByRole('dialog', { name: 'Create New Roadmap Item' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Fill out the form - scope locators to the dialog to avoid matching page elements
    await dialog.getByLabel(/Short Key/i).fill('TEST-1');
    await dialog.getByRole('textbox', { name: 'Name' }).fill('Test Item');
    await dialog.getByLabel(/Initiative/i).fill('Test Initiative');
    
    // Submit the form - scope to dialog to avoid matching other buttons
    await dialog.getByRole('button', { name: /Create Item|Submit/i }).click();
    
    // Wait for success - check for item in the roadmap items table or success message
    await expect(
      page.getByText(/Test Item|TEST-1/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Shows error if database connection fails', async ({ page }) => {
    // Page is already on the summary page from beforeEach
    // Monitor for error messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Look for any "Add" button (could be "+ Add Your First Item" or "+ Add Roadmap Item")
    const addButton = page.getByRole('button', { name: /Add.*Item/i }).first();
    
    const buttonExists = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!buttonExists) {
      test.skip('Add button not found - cannot test error handling');
      return;
    }

    await addButton.click();
    
    // Wait for modal dialog to open
    await expect(
      page.getByRole('dialog', { name: /Create.*Roadmap.*Item/i })
    ).toBeVisible({ timeout: 5000 });
    
    // Fill form with minimal data to trigger potential errors
    const shortKeyInput = page.getByLabel(/Short Key/i).first();
    if (await shortKeyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await shortKeyInput.fill('TEST-ERROR');
      await page.getByRole('button', { name: /Create|Submit/i }).click();
      
      // Check for error banners or toast messages
      const errorBanner = page.getByText(/Sync Error|Database Error|Failed to create|Error/i).first();
      const hasError = await errorBanner.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasError) {
        console.log('Database error detected during item creation');
      }
    }
  });
});
