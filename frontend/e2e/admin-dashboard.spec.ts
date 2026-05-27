import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const adminEmail = 'admin@edupub.test';
const adminPassword = 'Admin@123456';

const userEmail = 'user@edupub.test';
const userPassword = 'User@123456';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', adminPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
}

test.describe('Admin Dashboard E2E Flow', () => {
  test.beforeEach(async () => {
    // Suppress console logging noise if needed
  });

  test('should redirect unauthenticated users to login when visiting admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin');
    await page.waitForURL('**/login');
  });

  test('should redirect USER role to documents when visiting admin dashboard', async ({ page }) => {
    // Login as normal user
    await page.goto('/login');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Attempt to access admin dashboard
    await page.goto('/admin');
    // Should be redirected to /documents
    await page.waitForURL('**/documents');
  });

  test('should allow ADMIN role to access the admin dashboard and see stats', async ({ page }) => {
    await loginAsAdmin(page);

    // Access admin dashboard
    await page.goto('/admin');
    await page.waitForURL('**/admin');

    // Assert headers
    await expect(page.locator('main h1')).toContainText('Dashboard');
    await expect(page.locator('main p').first()).toContainText('Overview of users, documents, and system activity.');

    // Assert stats cards are visible
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Total Documents')).toBeVisible();
    await expect(page.locator('text=Published').first()).toBeVisible();
    await expect(page.locator('text=Drafts').first()).toBeVisible();

    // Assert tables are visible
    await expect(page.locator('h3:has-text("Recent Documents")')).toBeVisible();
    await expect(page.locator('h3:has-text("Recent Users")')).toBeVisible();
  });

  test('should support real-time data refreshing', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.waitForURL('**/admin');

    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();
    
    // Refresh button should not remain disabled
    await expect(refreshButton).not.toBeDisabled();
  });

  test('should render empty states correctly', async ({ page }) => {
    // Intercept GET /admin/stats and return empty data
    await page.route('**/admin/stats**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            totalUsers: 0,
            totalAdmins: 0,
            totalRegularUsers: 0,
            totalDocuments: 0,
            totalDraftDocuments: 0,
            totalPublishedDocuments: 0,
            totalArchivedDocuments: 0,
          },
          usersByRole: [
            { role: 'ADMIN', count: 0 },
            { role: 'USER', count: 0 },
          ],
          documentsByStatus: [
            { status: 'DRAFT', count: 0 },
            { status: 'PUBLISHED', count: 0 },
            { status: 'ARCHIVED', count: 0 },
          ],
          documentsBySubject: [],
          documentsByGradeLevel: [],
          recentDocuments: [],
          recentUsers: [],
        }),
      });
    });

    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.waitForURL('**/admin');

    // Assert cards show 0
    await expect(page.locator('text=0').first()).toBeVisible();

    // Assert empty states for charts and tables
    await expect(page.locator('text=No chart data').first()).toBeVisible();
    await expect(page.locator('text=No recent documents')).toBeVisible();
    await expect(page.locator('text=No recent users')).toBeVisible();
  });

  test('should display error state on API failure and support Retry', async ({ page }) => {
    let failRequest = true;

    await page.route('**/admin/stats**', async (route) => {
      if (failRequest) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            summary: {
              totalUsers: 10,
              totalAdmins: 2,
              totalRegularUsers: 8,
              totalDocuments: 20,
              totalDraftDocuments: 5,
              totalPublishedDocuments: 12,
              totalArchivedDocuments: 3,
            },
            usersByRole: [
              { role: 'ADMIN', count: 2 },
              { role: 'USER', count: 8 },
            ],
            documentsByStatus: [
              { status: 'DRAFT', count: 5 },
              { status: 'PUBLISHED', count: 12 },
              { status: 'ARCHIVED', count: 3 },
            ],
            documentsBySubject: [],
            documentsByGradeLevel: [],
            recentDocuments: [],
            recentUsers: [],
          }),
        });
      }
    });

    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.waitForURL('**/admin');

    // Assert error state is visible
    await expect(page.locator('text=Unable to load dashboard')).toBeVisible();

    // Trigger retry
    failRequest = false;
    await page.click('button:has-text("Retry")');

    // Verify dashboard displays successfully
    await expect(page.locator('text=Total Users')).toBeVisible();
  });
});
