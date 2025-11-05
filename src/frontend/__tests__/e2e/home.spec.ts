import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome to Crudibase/i)).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/Sign In/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/register');
    await expect(page.getByText(/Create Account/i)).toBeVisible();
  });

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route');
    await expect(page.getByText(/404/i)).toBeVisible();
    await expect(page.getByText(/Page not found/i)).toBeVisible();
  });
});
