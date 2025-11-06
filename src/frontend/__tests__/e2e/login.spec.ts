import { test, expect } from '@playwright/test';

test.describe('User Login E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3000');
  });

  test('should complete full login flow and access dashboard', async ({
    page,
  }) => {
    // First, register a user
    await page.click('text=Get Started');
    await expect(page).toHaveURL('http://localhost:3000/register');

    const timestamp = Date.now();
    const testEmail = `logintest${timestamp}@example.com`;
    const testPassword = 'TestPassword123';

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Verify we see the authenticated dashboard content
    await expect(page.getByText(/welcome to your dashboard/i)).toBeVisible();

    // Log out
    await page.click('text=Sign Out');

    // Should see logged out view
    await expect(
      page.getByText(/please sign in to access your dashboard/i)
    ).toBeVisible();

    // Now test login with the same credentials
    await page.click('text=Sign In');
    await expect(page).toHaveURL('http://localhost:3000/login');

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Verify authenticated content again
    await expect(page.getByText(/welcome to your dashboard/i)).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.click('button[type="submit"]');

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Click Sign up link
    await page.click('text=Sign up');
    await expect(page).toHaveURL('http://localhost:3000/register');

    // Click Sign in link
    await page.click('text=Sign in');
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('should show protected content only when logged in', async ({
    page,
  }) => {
    // Visit dashboard without being logged in
    await page.goto('http://localhost:3000/dashboard');

    // Should see logged-out view
    await expect(
      page.getByText(/please sign in to access your dashboard/i)
    ).toBeVisible();
    await expect(
      page.getByText(/welcome to your dashboard/i)
    ).not.toBeVisible();

    // Register and login
    await page.click('text=Sign In');
    await page.goto('http://localhost:3000/register');

    const timestamp = Date.now();
    const testEmail = `protectedtest${timestamp}@example.com`;
    const testPassword = 'TestPassword123';

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect
    await expect(page).toHaveURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Now should see authenticated view
    await expect(page.getByText(/welcome to your dashboard/i)).toBeVisible();
    await expect(
      page.getByText(/please sign in to access your dashboard/i)
    ).not.toBeVisible();
  });
});
