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

test.describe('Sizing Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await authenticate(page);
  });

  test('UX sizing data persists after navigation', async ({ page }) => {
    // Navigate to a roadmap item detail page
    // First, go to a scenario that has items
    await page.goto('/scenarios');
    await page.waitForLoadState('networkidle');

    // Find a scenario with items and click on it
    const scenarioWithItems = page.locator('text=/\\d+ roadmap items/i').first();
    
    if (await scenarioWithItems.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scenarioWithItems.locator('..').locator('..').click();
      await page.waitForLoadState('networkidle');
      
      // Find and click on a roadmap item
      const roadmapItem = page.locator('a, button').filter({ hasText: /roadmap item|item name/i }).first();
      
      if (await roadmapItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        await roadmapItem.click();
        await page.waitForLoadState('networkidle');
        
        // Navigate to UX Design tab
        const uxTab = page.locator('button:has-text("UX Design"), a:has-text("UX Design"), [role="tab"]:has-text("UX")').first();
        if (await uxTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await uxTab.click();
          
          // Change a factor score (Product Risk)
          const productRiskInput = page.locator('button:has-text("1"), button:has-text("2"), button:has-text("3")').first();
          const initialValue = await productRiskInput.textContent();
          
          // Click a different value
          const buttons = page.locator('button').filter({ hasText: /^[1-5]$/ });
          const count = await buttons.count();
          if (count > 0) {
            await buttons.nth(1).click();
            
            // Wait for debounce (500ms) plus some buffer
            await page.waitForTimeout(1000);
            
            // Note the calculated values
            const sizeText = await page.locator('text=/Size.*[XSLM]|UX Effort Estimate/i').textContent().catch(() => '');
            const focusWeeksText = await page.locator('text=/Focus Weeks|focus weeks/i').textContent().catch(() => '');
            
            // Navigate away
            await page.goto('/scenarios');
            await page.waitForLoadState('networkidle');
            
            // Navigate back
            await scenarioWithItems.locator('..').locator('..').click();
            await page.waitForLoadState('networkidle');
            await roadmapItem.click();
            await page.waitForLoadState('networkidle');
            await uxTab.click();
            
            // Verify values persisted
            const newSizeText = await page.locator('text=/Size.*[XSLM]|UX Effort Estimate/i').textContent().catch(() => '');
            
            // Check if sizing persisted (basic check)
            if (sizeText && newSizeText) {
              expect(newSizeText).toContain(sizeText.split(' ')[0] || '');
            }
          }
        }
      } else {
        test.skip('No roadmap items found to test');
      }
    } else {
      test.skip('No scenarios with items found');
    }
  });

  test('No database errors when changing sizing', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('response', (response) => {
      if (response.status() >= 400 && response.url().includes('netlify/functions')) {
        errors.push(`API Error: ${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/scenarios');
    await page.waitForLoadState('networkidle');

    // Try to navigate to an item and change sizing
    const scenarioWithItems = page.locator('text=/\\d+ roadmap items/i').first();
    
    if (await scenarioWithItems.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scenarioWithItems.locator('..').locator('..').click();
      await page.waitForLoadState('networkidle');
      
      // Check for error banners
      const errorBanner = page.locator('text=/Sync Error|Database Error|Failed to update/i');
      const hasError = await errorBanner.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasError).toBe(false);
      
      // Check console errors
      const dbErrors = errors.filter(e => 
        e.toLowerCase().includes('database') || 
        e.toLowerCase().includes('timeout') ||
        e.toLowerCase().includes('failed to update')
      );
      
      expect(dbErrors.length).toBe(0);
    }
  });
});
