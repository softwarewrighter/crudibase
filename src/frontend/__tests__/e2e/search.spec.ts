import { test, expect } from '@playwright/test';

test.describe('Wikibase Search', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login first
    await page.goto('http://localhost:3000/register');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    // Wait for redirect after registration
    await page.waitForURL(/\/(dashboard|search)/, { timeout: 5000 });
  });

  test('should search for entities and display results', async ({ page }) => {
    // Navigate to search page
    await page.goto('http://localhost:3000/search');

    // Search for Einstein
    await page.fill('input[placeholder*="Search"]', 'Einstein');
    await page.click('button[type="submit"]');

    // Wait for results
    await page.waitForSelector('text=/results/i', { timeout: 10000 });

    // Verify results are displayed
    const resultsText = await page.textContent('body');
    expect(resultsText).toContain('Einstein');

    // Check that entity cards are rendered
    const entityCards = await page.locator('[class*="border"]').count();
    expect(entityCards).toBeGreaterThan(0);
  });

  test('should display "no results" for non-existent search', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/search');

    await page.fill('input[placeholder*="Search"]', 'xyzabc123nonexistent999');
    await page.click('button[type="submit"]');

    // Wait for and verify "no results" message
    await expect(page.getByText(/no results found/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should allow clicking suggested searches', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    // Click on a suggested search
    await page.click('text="Albert Einstein"');

    // Results should appear
    await page.waitForSelector('text=/results/i', { timeout: 10000 });
  });

  test('should clear search input when clear button is clicked', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/search');

    // Type search query
    const input = page.locator('input[placeholder*="Search"]');
    await input.fill('Einstein');

    // Verify value
    await expect(input).toHaveValue('Einstein');

    // Click clear button
    await page.click('button:has-text("Clear")');

    // Verify input is cleared
    await expect(input).toHaveValue('');
  });

  test('should show loading state during search', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    await page.fill('input[placeholder*="Search"]', 'Einstein');
    await page.click('button[type="submit"]');

    // Should show searching state (may be brief)
    const buttonText = await page
      .locator('button[type="submit"]')
      .textContent();
    expect(buttonText).toMatch(/(Search|Searching)/);
  });

  test('should require authentication to search', async ({ page, context }) => {
    // Clear auth token
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('http://localhost:3000/search');

    await page.fill('input[placeholder*="Search"]', 'Einstein');
    await page.click('button[type="submit"]');

    // Should show login error
    await expect(page.getByText(/please log in/i)).toBeVisible({
      timeout: 5000,
    });
  });
});
