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

test.describe('Commit Radio Button Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Start from scenarios list page (same pattern as other tests)
    await page.goto('/scenarios');
    await authenticate(page);

    // Wait for scenarios list to load - handle empty state
    const scenariosHeading = page.getByRole('heading', { name: 'Planning Scenarios' });
    const emptyStateHeading = page.getByRole('heading', { name: 'Welcome to Capacity Planning!' });
    
    await Promise.race([
      scenariosHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      emptyStateHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    ]);

    // Check if we're in empty state
    const isEmpty = await emptyStateHeading.isVisible().catch(() => false);
    if (isEmpty) {
      // Create a scenario for testing
      await page.getByRole('button', { name: '+ Create New Scenario' }).click();
      await page.getByLabel('Name').fill('Test Commit Scenario');
      await page.getByLabel('Planning Period').selectOption('2026-Q3');
      await page.getByLabel('UX Designers').fill('3');
      await page.getByLabel('Content Designers').fill('6');
      await page.getByRole('button', { name: 'Create Scenario' }).click();
      
      // Wait for navigation to summary page, then go back to scenarios
      await expect(
        page.getByRole('group', { name: 'Scenario name - Click to edit' })
      ).toBeVisible({ timeout: 15000 });
      await page.goto('/scenarios');
      await expect(scenariosHeading).toBeVisible({ timeout: 5000 });
    } else {
      // Ensure scenarios list is visible
      await expect(scenariosHeading).toBeVisible({ timeout: 5000 });
    }
  });

  test('Auto-uncommits when last roadmap item is removed', async ({ page }) => {
    // This test verifies that when a committed scenario's last item is removed,
    // it automatically uncommits (per business rule: scenarios with 0 items cannot be committed)
    
    // Find or create a scenario with at least 1 item
    const scenarioWithItems = page.getByText(/\d+ roadmap items?/i).first();
    const hasScenarioWithItems = await scenarioWithItems.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!hasScenarioWithItems) {
      // Create a scenario and add an item for testing
      await page.getByRole('button', { name: '+ Create New Scenario' }).click();
      await page.getByLabel('Name').fill('Auto-Uncommit Test');
      await page.getByLabel('Planning Period').selectOption('2026-Q3');
      await page.getByLabel('UX Designers').fill('3');
      await page.getByLabel('Content Designers').fill('6');
      await page.getByRole('button', { name: 'Create Scenario' }).click();
      
      // Wait for summary page
      await expect(
        page.getByRole('group', { name: 'Scenario name - Click to edit' })
      ).toBeVisible({ timeout: 15000 });
      
      // Add a roadmap item
      const addButton = page.getByRole('button', { name: '+ Add Your First Item' });
      await addButton.click();
      
      const dialog = page.getByRole('dialog', { name: 'Create New Roadmap Item' });
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      await dialog.getByLabel(/Short Key/i).fill('TEST-1');
      await dialog.getByRole('textbox', { name: 'Name' }).fill('Test Item');
      await dialog.getByLabel(/Initiative/i).fill('Test Initiative');
      await dialog.getByRole('button', { name: /Create Item/i }).click();
      
      // Wait for item to be created
      await expect(page.getByText(/Test Item|TEST-1/i).first()).toBeVisible({ timeout: 10000 });
      
      // Go back to scenarios list
      await page.goto('/scenarios');
      await expect(page.getByRole('heading', { name: 'Planning Scenarios' })).toBeVisible({ timeout: 5000 });
    }
    
    // Find a scenario with exactly 1 item (or use the one we just created)
    const scenarioCard = page.getByText(/1 roadmap item/i).first();
    const hasSingleItem = await scenarioCard.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!hasSingleItem) {
      test.skip('No scenario with exactly 1 item found to test auto-uncommit');
      return;
    }
    
    // Find the parent card
    const card = scenarioCard.locator('xpath=ancestor::article | ancestor::div[contains(@class, "card")] | ancestor::div[@role="article"]').first();
    
    // Get the scenario name to navigate to it
    const scenarioName = await card.locator('h2, h3, [role="heading"]').first().textContent();
    
    // Commit the scenario first
    const radioButton = card.locator('circle').first();
    const currentStatus = await card.getByText(/Commit as plan|Committed plan/i).first().textContent();
    
    if (currentStatus?.includes('Commit as plan')) {
      // Commit it
      await radioButton.click();
      await expect(page.getByText(/Scenario committed/i)).toBeVisible({ timeout: 5000 });
      
      // Verify it's now committed
      await expect(card.getByText('Committed plan', { exact: true })).toBeVisible({ timeout: 3000 });
    }
    
    // Click on the scenario to open it
    await card.click();
    
    // Wait for summary page
    await expect(
      page.getByRole('group', { name: 'Scenario name - Click to edit' })
    ).toBeVisible({ timeout: 15000 });
    
    // Find the item in the roadmap items table and delete it
    // The delete button is an IconButton with aria-label="Remove item" in the same table row
    const itemRow = page.getByText(/TEST-1|Test Item/i).first();
    const itemExists = await itemRow.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!itemExists) {
      test.skip('Item not found - cannot test auto-uncommit');
      return;
    }
    
    // Find the delete button in the same table row
    // The button has aria-label="Remove item"
    const deleteButton = itemRow.locator('xpath=ancestor::tr')
      .getByRole('button', { name: 'Remove item' }).first();
    
    const hasDeleteButton = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!hasDeleteButton) {
      test.skip('Delete button not found - cannot test auto-uncommit');
      return;
    }
    
    // Click the delete button
    await deleteButton.click();
    
    // Confirm deletion in the AlertDialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    // Find the Delete button (not Cancel) in the dialog
    const dialog = page.getByRole('dialog');
    const confirmButton = dialog.getByRole('button', { name: /Delete/i });
    await confirmButton.click();
    
    // Wait for item to be deleted (toast notification)
    await expect(page.getByText(/Item deleted|removed/i)).toBeVisible({ timeout: 5000 });
    
    // Wait a moment for auto-uncommit to process
    await page.waitForTimeout(1000);
    
    // Go back to scenarios list
    await page.goto('/scenarios');
    await expect(page.getByRole('heading', { name: 'Planning Scenarios' })).toBeVisible({ timeout: 5000 });
    
    // Verify the scenario is now uncommitted (auto-uncommit should have happened)
    // Find the scenario card by looking for "0 roadmap items" - should be uncommitted
    const zeroItemsCard = page.getByText(/0 roadmap items/i).first();
    await expect(zeroItemsCard).toBeVisible({ timeout: 5000 });
    
    const updatedCard = zeroItemsCard.locator('xpath=ancestor::article | ancestor::div[contains(@class, "card")] | ancestor::div[@role="article"]').first();
    
    // Should show "Commit as plan" (uncommitted) not "Committed plan"
    // This verifies that auto-uncommit worked
    await expect(updatedCard.getByText('Commit as plan', { exact: true })).toBeVisible({ timeout: 5000 });
    
    // Verify it does NOT show "Committed plan"
    const committedText = updatedCard.getByText('Committed plan', { exact: true });
    const isStillCommitted = await committedText.isVisible({ timeout: 1000 }).catch(() => false);
    expect(isStillCommitted).toBe(false);
  });

  test('Radio button shows warning when trying to commit without items', async ({ page }) => {
    // Find a draft scenario with 0 items
    const commitAsPlanText = page.getByText('Commit as plan', { exact: true });
    const hasDraftScenario = await commitAsPlanText.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!hasDraftScenario) {
      test.skip('No draft scenarios found');
      return;
    }

    // Find the parent card
    const draftCard = commitAsPlanText.locator('xpath=ancestor::article | ancestor::div[contains(@class, "card")] | ancestor::div[@role="article"]').first();
    
    // Check if it has 0 items
    const itemCountText = draftCard.getByText(/0 roadmap items/i);
    const hasZeroItems = await itemCountText.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!hasZeroItems) {
      test.skip('No draft scenario with 0 items found');
      return;
    }

    // Find the radio button circle
    const radioButton = draftCard.locator('circle').first();
    await radioButton.click();
    
    // Should show warning toast
    await expect(page.getByText(/Cannot commit|Add at least one roadmap item/i)).toBeVisible({ timeout: 5000 });
  });

  test('Radio button works on scenario with items', async ({ page }) => {
    // Find a scenario with at least 1 item (not "0 roadmap items")
    // Look for text matching "1 roadmap item" or "2 roadmap items" etc.
    const scenarioWithItems = page.getByText(/\d+ roadmap items?/i).first();
    
    const hasScenarioWithItems = await scenarioWithItems.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!hasScenarioWithItems) {
      test.skip('No scenarios with items found');
      return;
    }

    // Find the parent card
    const card = scenarioWithItems.locator('xpath=ancestor::article | ancestor::div[contains(@class, "card")] | ancestor::div[@role="article"]').first();
    
    // Find the radio button - look for circle near either "Commit as plan" or "Committed plan"
    const radioButton = card.locator('circle').first();
    
    await radioButton.click();
    
    // Should see success toast
    await expect(page.getByText(/Scenario committed|Scenario uncommitted/i)).toBeVisible({ timeout: 5000 });
  });
});
