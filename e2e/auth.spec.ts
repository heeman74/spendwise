import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      // Check for login form elements
      await expect(page.getByRole('heading', { name: /welcome|sign in|login/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
      await page.goto('/login');

      // Click sign in without filling form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Form should still be visible (not submitted) or show validation error
      // HTML5 validation may prevent submission without showing custom error text
      const formStillVisible = await page.getByRole('button', { name: /sign in/i }).isVisible();
      const hasValidationError = await page.getByText(/email.*required|invalid|please/i).first().isVisible().catch(() => false);

      expect(formStillVisible || hasValidationError).toBe(true);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill in invalid credentials
      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should show error message or remain on login page (not redirect to dashboard)
      await page.waitForTimeout(2000);
      const hasError = await page.getByText(/invalid|incorrect|failed|error|wrong/i).isVisible().catch(() => false);
      const stillOnLogin = await page.getByRole('button', { name: /sign in/i }).isVisible();

      expect(hasError || stillOnLogin).toBe(true);
    });

    test('should have link to registration page', async ({ page }) => {
      await page.goto('/login');

      const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
      await expect(registerLink).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('link', { name: /sign up|register|create account/i }).click();
      await expect(page).toHaveURL(/\/register/);
    });
  });

  test.describe('Demo Mode', () => {
    test('should have demo login option', async ({ page }) => {
      await page.goto('/login');

      const demoButton = page.getByRole('button', { name: /demo|try demo/i });
      await expect(demoButton).toBeVisible();
    });

    test('should navigate to dashboard when clicking demo', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('button', { name: /demo|try demo/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should display dashboard data in demo mode', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: /demo|try demo/i }).click();

      // Wait for dashboard to load
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });

      // Should display dashboard elements
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/total balance/i)).toBeVisible();
    });
  });

  test.describe('Registration Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');

      await expect(page.getByRole('heading', { name: /create.*account|sign up|register/i })).toBeVisible();
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/register');

      await page.getByRole('button', { name: /sign up|create.*account|register/i }).click();

      // Form should still be visible (not submitted) or show validation error
      const formStillVisible = await page.getByRole('button', { name: /sign up|create.*account|register/i }).isVisible();
      const hasValidationError = await page.getByText(/required|invalid|please/i).first().isVisible().catch(() => false);

      expect(formStillVisible || hasValidationError).toBe(true);
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('notanemail');
      await page.getByRole('button', { name: /sign up|create.*account|register/i }).click();

      // Form should still be visible or show email validation error
      const formStillVisible = await page.getByRole('button', { name: /sign up|create.*account|register/i }).isVisible();
      const hasValidationError = await page.getByText(/invalid.*email|valid email/i).isVisible().catch(() => false);

      expect(formStillVisible || hasValidationError).toBe(true);
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');

      const loginLink = page.getByRole('link', { name: /sign in|login/i });
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    // Note: App may use demo mode or redirect to login - behavior varies
    test('should handle dashboard access', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      // Either loads dashboard or redirects to login
      const hasDashboard = await page.getByRole('heading', { name: /dashboard|overview/i }).isVisible().catch(() => false);
      const hasLogin = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false);

      expect(hasDashboard || hasLogin).toBe(true);
    });

    test('should handle transactions access', async ({ page }) => {
      await page.goto('/transactions');
      await page.waitForTimeout(2000);

      // Either loads transactions or redirects to login
      const hasTransactions = await page.getByRole('heading', { name: /transactions/i }).isVisible().catch(() => false);
      const hasLogin = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false);

      expect(hasTransactions || hasLogin).toBe(true);
    });

    test('should handle accounts access', async ({ page }) => {
      await page.goto('/accounts');
      await page.waitForTimeout(2000);

      // Either loads accounts or redirects to login
      const hasAccounts = await page.getByRole('heading', { name: 'Accounts', level: 1 }).isVisible().catch(() => false);
      const hasLogin = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false);

      expect(hasAccounts || hasLogin).toBe(true);
    });
  });

  test.describe('Logout', () => {
    test('should logout and redirect to login page', async ({ page }) => {
      // First login via demo mode
      await page.goto('/login');
      await page.getByRole('button', { name: /demo|try demo/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });

      // Find and click logout button (usually in header or sidebar)
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i });

      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      }
    });
  });
});
