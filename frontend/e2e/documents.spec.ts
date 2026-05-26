import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Generate a random suffixes for clean execution
const randomSuffix = Math.floor(Math.random() * 1000000);
const user1Email = `user1-${randomSuffix}@edupub.test`;
const user2Email = `user2-${randomSuffix}@edupub.test`;
const testPassword = 'Password123';
const user1Name = 'Document Owner';
const user2Name = 'Other Viewer';

let createdDocumentId = '';

test.describe('Document CRUD + Ownership E2E UI Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  });

  // Setup step: Register two users
  test('should register User 1 and User 2 successfully', async ({ page }) => {
    // Register User 1
    await page.goto('/register');
    await page.fill('input[placeholder="John Doe"]', user1Name);
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Logout User 1
    await page.click('button:has-text("Log out")');
    await page.waitForURL('**/login');

    // Register User 2
    await page.goto('/register');
    await page.fill('input[placeholder="John Doe"]', user2Name);
    await page.fill('input[type="email"]', user2Email);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Logout User 2
    await page.click('button:has-text("Log out")');
    await page.waitForURL('**/login');
  });

  test('should allow User 1 to create a document', async ({ page }) => {
    // Login User 1
    await page.goto('/login');
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Go to Documents Dashboard
    await page.goto('/documents');
    await page.click('a:has-text("Create Document"), button:has-text("Create Document")');
    await page.waitForURL('**/documents/create');

    // Fill Create Document Form
    await page.fill('input[name="title"]', 'Playwright Test Book');
    await page.fill('textarea[name="description"]', 'Educational resources compiled by playwright E2E test runner.');
    await page.selectOption('select[name="subject"]', 'MATH');
    await page.fill('input[name="gradeLevel"]', '10');
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.fill('input[name="coverImageUrl"]', 'https://example.com/cover.png');
    await page.fill('input[name="fileUrl"]', 'https://example.com/book.pdf');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect back to list
    await page.waitForURL('**/documents');

    // Verify document is in list
    const documentCard = page.locator('div:has-text("Playwright Test Book")').first();
    await expect(documentCard).toBeVisible();
    await expect(documentCard).toContainText('MATH');
    await expect(documentCard).toContainText('Grade 10');

    // Save document ID from the href if available or detail click
    const detailLink = page.locator('a:has-text("View"), a:has-text("Details")').first();
    const href = await detailLink.getAttribute('href');
    if (href) {
      createdDocumentId = href.split('/').pop() || '';
    }
  });

  test('should allow User 1 to view and edit their own document', async ({ page }) => {
    // Login User 1
    await page.goto('/login');
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Access detail view directly
    await page.goto(`/documents/${createdDocumentId}`);

    // Verify information
    await expect(page.locator('h1')).toContainText('Playwright Test Book');
    await expect(page.getByText('MATH')).toBeVisible();

    // Verify actions are visible
    await expect(page.locator('a:has-text("Edit"), button:has-text("Edit")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();

    // Click edit
    await page.click('a:has-text("Edit"), button:has-text("Edit")');
    await page.waitForURL(`**/documents/${createdDocumentId}/edit`);

    // Edit title
    await page.fill('input[name="title"]', 'Playwright Test Book Updated');
    await page.click('button[type="submit"]');

    // Redirect to detail or dashboard
    await page.waitForURL(`**/documents/${createdDocumentId}`);
    await expect(page.locator('h1')).toContainText('Playwright Test Book Updated');
  });

  test('should not show User 1 document to User 2 (Ownership rule)', async ({ page }) => {
    // Login User 2
    await page.goto('/login');
    await page.fill('input[type="email"]', user2Email);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Go to list
    await page.goto('/documents');

    // Verify User 1 document is NOT listed
    await expect(page.getByText('Playwright Test Book Updated')).not.toBeVisible();

    // Try to access direct details page
    await page.goto(`/documents/${createdDocumentId}`);

    // Should show NotFound / Error Page or redirect
    await expect(page.getByText('Document not found', { exact: false })).toBeVisible();

    // Try to access edit page directly
    await page.goto(`/documents/${createdDocumentId}/edit`);
    await expect(page.getByText('Document not found', { exact: false })).toBeVisible();
  });

  test('should allow Admin to view and edit User 1 document', async ({ page }) => {
    // Login Admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@edupub.test');
    await page.fill('input[type="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Access User 1 document details
    await page.goto(`/documents/${createdDocumentId}`);

    // Verify information is visible to admin
    await expect(page.locator('h1')).toContainText('Playwright Test Book Updated');
    await expect(page.locator('a:has-text("Edit"), button:has-text("Edit")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
  });

  test('should allow User 1 to delete their own document', async ({ page }) => {
    // Login User 1
    await page.goto('/login');
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Go to document details
    await page.goto(`/documents/${createdDocumentId}`);

    // Click delete
    page.once('dialog', async (dialog) => {
      await dialog.accept(); // click OK on confirmation modal
    });
    await page.click('button:has-text("Delete")');

    // Redirect to list
    await page.waitForURL('**/documents');

    // Verify not visible anymore
    await expect(page.getByText('Playwright Test Book Updated')).not.toBeVisible();
  });
});
