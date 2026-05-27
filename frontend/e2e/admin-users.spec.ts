import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const randomSuffix = Math.floor(Math.random() * 1000000);
const adminEmail = 'admin@edupub.test';
const adminPassword = 'Admin@123456';

const userEmail = 'user@edupub.test';
const userPassword = 'User@123456';

const newEmail = `admin-user-${randomSuffix}@edupub.test`;
const newPassword = 'TempPassword123';
const newName = `Temp User ${randomSuffix}`;

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', adminPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
}

test.describe('Admin User Management E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  });

  test('should redirect unauthenticated users to login when visiting admin users list', async ({ page }) => {
    await page.goto('/admin/users');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin/users');
    await page.waitForURL('**/login');
  });

  test('should redirect USER role to documents when visiting admin users list', async ({ page }) => {
    // Login as normal user
    await page.goto('/login');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Attempt to access admin users page
    await page.goto('/admin/users');
    // Should be redirected to /documents
    await page.waitForURL('**/documents');
  });

  test('should allow ADMIN role to access the users list page', async ({ page }) => {
    await loginAsAdmin(page);

    // Access admin users page
    await page.goto('/admin/users');
    await page.waitForURL('**/admin/users');

    // Page title and subtitle assertions
    await expect(page.locator('main h2')).toContainText('Users');
    await expect(page.locator('main p').first()).toContainText('Manage user accounts, roles, and access permissions.');

    // Check that table or elements are visible
    await expect(page.locator('#admin-users-table')).toBeVisible();
    await expect(page.locator('a:has-text("Create User")')).toBeVisible();
  });

  test('should filter and search users on the list page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    // Use search filter
    await page.fill('#filter-search', 'Regular');
    await page.waitForTimeout(500); // Allow debounce
    await page.click('button:has-text("Apply")');

    // Assert that search result is shown
    await expect(page.locator('#admin-users-table')).toContainText('Regular User');
    await expect(page.locator('#admin-users-table')).not.toContainText('Admin User');

    // Reset filters
    await page.click('button:has-text("Reset")');
    // Wait for Admin User to appear back
    await expect(page.locator('#admin-users-table')).toContainText('Admin User');

    // Select role filter
    await page.selectOption('#filter-role', 'ADMIN');
    await page.click('button:has-text("Apply")');
    await expect(page.locator('#admin-users-table')).toContainText('Admin User');
    await expect(page.locator('#admin-users-table')).not.toContainText('Regular User');
  });

  test('should allow ADMIN to create a new user', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.click('a:has-text("Create User")');
    await page.waitForURL('**/admin/users/new');

    // Fill new user form
    await page.fill('#user-fullname', newName);
    await page.fill('#user-email', newEmail);
    await page.fill('#user-password', newPassword);
    await page.selectOption('#user-role', 'USER');
    await page.fill('#user-avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

    // Submit
    await page.click('#btn-submit-user');

    // On success, redirect to user detail
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+/);

    // Check if new user exists in the detail page
    await expect(page.locator('#user-detail-name')).toContainText(newName);
  });

  test('should allow ADMIN to view user details and show recent documents', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    // Search the newly created user
    await page.fill('#filter-search', newName);
    await page.click('button:has-text("Apply")');

    // Wait for search to complete and user to appear
    await expect(page.locator('#admin-users-table')).toContainText(newName);

    // Click "View" action
    await page.click('a[title="View"]');
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+/);

    // Verify information
    await expect(page.locator('#user-detail-name')).toContainText(newName);
    await expect(page.locator('#user-detail-email')).toContainText(newEmail);
    await expect(page.locator('#user-detail-role')).toContainText('User');
    await expect(page.locator('#user-detail-documents')).toBeVisible();
  });

  test('should display self-action protection when ADMIN views their own detail page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    // Search for current admin
    await page.fill('#filter-search', 'Admin User');
    await page.click('button:has-text("Apply")');

    // Wait for search to complete
    await expect(page.locator('#admin-users-table')).toContainText('Admin User');
    await expect(page.locator('#admin-users-table')).not.toContainText('Regular User');

    // View admin detail
    await page.click('a[title="View"]');
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+/);

    // Assert change role and delete actions are disabled
    const changeRoleBtn = page.locator('#btn-change-role');
    const deleteBtn = page.locator('#btn-delete-user');

    await expect(changeRoleBtn).toBeDisabled();
    await expect(deleteBtn).toBeDisabled();

    // Check helper texts/tooltips
    await expect(page.locator('#self-action-role-warning')).toBeVisible();
    await expect(page.locator('#self-action-delete-warning')).toBeVisible();
  });

  test('should allow ADMIN to edit user details', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.fill('#filter-search', newName);
    await page.click('button:has-text("Apply")');

    // Wait for search to complete
    await expect(page.locator('#admin-users-table')).toContainText(newName);
    await expect(page.locator('#admin-users-table')).not.toContainText('Admin User');

    // Go to details
    await page.click('a[title="View"]');
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+/);

    // Go to edit page
    await page.click('#btn-edit-user');
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+\/edit/);

    // Check that role input is not present
    await expect(page.locator('#user-role')).not.toBeVisible();

    // Edit full name
    const updatedName = `${newName} Updated`;
    await page.fill('#user-fullname', updatedName);
    await page.click('#btn-submit-user');

    // Redirect to detail
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+/);
    await expect(page.locator('#user-detail-name')).toContainText(updatedName);
  });

  test('should allow ADMIN to change user role via dialog', async ({ page }) => {
    const updatedName = `${newName} Updated`;
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.fill('#filter-search', updatedName);
    await page.click('button:has-text("Apply")');

    // Wait for search to complete
    await expect(page.locator('#admin-users-table')).toContainText(updatedName);
    await expect(page.locator('#admin-users-table')).not.toContainText('Admin User');

    await page.click('a[title="View"]');
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+/);

    // Open change role dialog
    await page.click('#btn-change-role');
    await expect(page.locator('#change-role-dialog')).toBeVisible();

    // Select role ADMIN
    await page.selectOption('#dialog-user-role', 'ADMIN');
    await page.click('#btn-dialog-save-role');

    // Verify role updated to ADMIN
    await expect(page.locator('#user-detail-role')).toContainText('Admin');
  });

  test('should allow ADMIN to delete a user via dialog', async ({ page }) => {
    const updatedName = `${newName} Updated`;
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.fill('#filter-search', updatedName);
    await page.click('button:has-text("Apply")');

    // Wait for search to complete
    await expect(page.locator('#admin-users-table')).toContainText(updatedName);
    await expect(page.locator('#admin-users-table')).not.toContainText('Admin User');

    await page.click('a[title="View"]');
    await page.waitForURL(/\/admin\/users\/[a-zA-Z0-9-]+/);

    // Open delete user dialog
    await page.click('#btn-delete-user');
    await expect(page.locator('#delete-user-dialog')).toBeVisible();

    // Confirm delete
    await page.click('#btn-dialog-confirm-delete');

    // Redirection back to admin users list
    await page.waitForURL('**/admin/users');

    // Search deleted user to verify they're gone
    await page.fill('#filter-search', updatedName);
    await page.click('button:has-text("Apply")');
    await expect(page.locator('#admin-users-table')).toContainText('Admin User');
    await expect(page.locator('#admin-users-table')).not.toContainText(updatedName);
  });
});
