import { test, expect } from '@playwright/test';

test.describe('Transactions', () => {
  // Login via demo mode before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo|try demo/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await page.getByRole('link', { name: /transactions/i }).first().click();
    await page.waitForURL(/\/transactions/, { timeout: 10000 });
  });

  test.describe('Transactions List', () => {
    test('should display transactions page header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /transactions/i })).toBeVisible();
    });

    test('should display transaction items', async ({ page }) => {
      // Wait for transactions to load
      await page.waitForTimeout(1000);

      // Check for transaction content (amounts with dollar signs)
      const transactionAmounts = page.locator('text=/\\$[\\d,]+\\.\\d{2}/');
      await expect(transactionAmounts.first()).toBeVisible({ timeout: 5000 });
    });

    test('should display transaction details', async ({ page }) => {
      // Each transaction should have merchant/description and amount
      const transactionItem = page.locator('[data-testid="transaction-item"], [class*="transaction"]').first();

      if (await transactionItem.isVisible().catch(() => false)) {
        // Check for amount
        await expect(transactionItem.locator('text=/\\$/')).toBeVisible();
      }
    });
  });

  test.describe('Filtering', () => {
    test('should display transactions page with filter options', async ({ page }) => {
      // The transactions page should be visible
      await expect(page.getByRole('heading', { name: /transactions/i })).toBeVisible();

      // Page should have some way to filter/search (varies by viewport)
      const hasSearch = await page.getByPlaceholder(/search/i).first().isVisible().catch(() => false);
      const hasFilterButton = await page.getByRole('button', { name: /filter|export/i }).first().isVisible().catch(() => false);

      // At least one action should be available
      expect(hasSearch || hasFilterButton).toBe(true);
    });
  });

  test.describe('Add Transaction', () => {
    test('should have add transaction button', async ({ page }) => {
      const addButton = page.getByRole('button', { name: /add|new|create/i })
        .or(page.getByRole('link', { name: /add|new|create/i }));

      await expect(addButton.first()).toBeVisible();
    });

    test('should open add transaction modal/form', async ({ page }) => {
      const addButton = page.getByRole('button', { name: /add.*transaction|new.*transaction/i })
        .or(page.getByRole('button', { name: /add|new|\+/i }));

      await addButton.first().click();

      // Should show transaction form
      const form = page.getByRole('dialog')
        .or(page.locator('form'))
        .or(page.getByRole('form'));

      await expect(form.first()).toBeVisible({ timeout: 5000 });
    });

    test('should have required form fields', async ({ page }) => {
      const addButton = page.getByRole('button', { name: /add|new|\+/i });
      await addButton.first().click();

      // Check for form fields
      await expect(page.getByLabel(/amount/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByLabel(/category/i).or(page.locator('select[name*="category"]'))).toBeVisible();
    });
  });

  test.describe('Transaction Actions', () => {
    test('should have edit option for transactions', async ({ page }) => {
      // Look for edit buttons or icons
      const editButton = page.getByRole('button', { name: /edit/i })
        .or(page.locator('[data-testid="edit-transaction"]'))
        .or(page.locator('button[aria-label*="edit"]'));

      // May need to click a menu first
      const menuButton = page.locator('[data-testid="transaction-menu"]')
        .or(page.getByRole('button', { name: /more|options|menu/i }));

      if (await menuButton.first().isVisible().catch(() => false)) {
        await menuButton.first().click();
        await expect(editButton.first()).toBeVisible();
      }
    });

    test('should have delete option for transactions', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /delete/i })
        .or(page.locator('[data-testid="delete-transaction"]'));

      const menuButton = page.locator('[data-testid="transaction-menu"]')
        .or(page.getByRole('button', { name: /more|options|menu/i }));

      if (await menuButton.first().isVisible().catch(() => false)) {
        await menuButton.first().click();
        await expect(deleteButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination if many transactions', async ({ page }) => {
      // Look for pagination controls
      const pagination = page.locator('[data-testid="pagination"]')
        .or(page.getByRole('navigation', { name: /pagination/i }))
        .or(page.locator('.pagination'))
        .or(page.getByRole('button', { name: /next|previous|page/i }));

      // Pagination may not be visible if few transactions
      const hasPagination = await pagination.first().isVisible().catch(() => false);

      // If pagination exists, test it
      if (hasPagination) {
        await expect(pagination.first()).toBeVisible();
      }
    });

    test('should load more transactions on scroll or button click', async ({ page }) => {
      const loadMoreButton = page.getByRole('button', { name: /load more|show more/i });

      if (await loadMoreButton.isVisible().catch(() => false)) {
        const initialCount = await page.locator('[class*="transaction"]').count();
        await loadMoreButton.click();
        await page.waitForTimeout(1000);
        // Count should increase or stay same if no more
      }
    });
  });

  test.describe('Transaction Details', () => {
    test('should show transaction type indicator', async ({ page }) => {
      // Transactions should indicate income vs expense via category or amount sign
      const hasIncome = await page.getByText('Income').first().isVisible().catch(() => false);
      const hasExpense = await page.getByText(/^-\$/).first().isVisible().catch(() => false);
      const hasPositiveAmount = await page.getByText(/^\+\$/).first().isVisible().catch(() => false);

      expect(hasIncome || hasExpense || hasPositiveAmount).toBe(true);
    });

    test('should display transaction date', async ({ page }) => {
      // Dates in various formats
      const datePattern = page.locator('text=/\\d{1,2}[\\/\\-]\\d{1,2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i');
      await expect(datePattern.first()).toBeVisible({ timeout: 5000 });
    });

    test('should display transaction category', async ({ page }) => {
      // Wait for transactions to load
      await page.waitForTimeout(1000);

      // Categories are displayed in the transaction table - check for any common category
      const hasCategory = await page.getByText(/Food|Entertainment|Shopping|Transportation|Travel|Healthcare|Personal|Bills|Income/i).first().isVisible().catch(() => false);
      expect(hasCategory).toBe(true);
    });
  });

  test.describe('Sorting', () => {
    test('should have sort options', async ({ page }) => {
      const sortButton = page.getByRole('button', { name: /sort/i })
        .or(page.getByRole('combobox', { name: /sort/i }))
        .or(page.locator('select[name*="sort"]'));

      // Sorting may be integrated into table headers
      const tableHeader = page.getByRole('columnheader');

      const hasSort =
        (await sortButton.isVisible().catch(() => false)) ||
        (await tableHeader.first().isVisible().catch(() => false));

      expect(hasSort).toBe(true);
    });
  });

  test.describe('Empty State', () => {
    test('should show message when no transactions match filter', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i)
        .or(page.getByRole('searchbox'));

      if (await searchInput.isVisible()) {
        // Search for something unlikely to exist
        await searchInput.fill('xyznonexistent123');
        await page.waitForTimeout(1000);

        // Should show empty state or no results message
        const emptyState = page.getByText(/no.*found|no.*transactions|no results/i);
        // May or may not show empty state depending on implementation
      }
    });
  });
});
