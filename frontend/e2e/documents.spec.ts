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
    await page.click('a:has-text("New Document"), button:has-text("New Document")');
    await page.waitForURL('**/documents/new');

    // Fill Create Document Form
    await page.fill('#doc-title', 'Playwright Test Book');
    await page.fill('#doc-description', 'Educational resources compiled by playwright E2E test runner.');
    await page.selectOption('#doc-subject', 'MATH');
    await page.fill('#doc-grade', '10');
    await page.click('button#status-published');
    await page.fill('#doc-cover', 'https://example.com/cover.png');
    await page.fill('#doc-file', 'https://example.com/book.pdf');

    // Submit
    await page.click('#btn-submit-document');

    // Should redirect to details page
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);

    // Verify document details
    await expect(page.locator('#document-title')).toContainText('Playwright Test Book');

    // Save document ID from the URL
    const url = page.url();
    createdDocumentId = url.split('/').pop() || '';
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
    await expect(page.locator('#document-title')).toContainText('Playwright Test Book');

    // Verify actions are visible
    await expect(page.locator('#btn-edit-document')).toBeVisible();
    await expect(page.locator('#btn-delete-document')).toBeVisible();

    // Click edit
    await page.click('#btn-edit-document');
    await page.waitForURL(`**/documents/${createdDocumentId}/edit`);

    // Edit title
    await page.fill('#doc-title', 'Playwright Test Book Updated');
    await page.click('#btn-submit-edit');

    // Redirect to detail
    await page.waitForURL(`**/documents/${createdDocumentId}`);
    await expect(page.locator('#document-title')).toContainText('Playwright Test Book Updated');
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
    await expect(page.locator('#document-title')).toContainText('Playwright Test Book Updated');
    await expect(page.locator('#btn-edit-document')).toBeVisible();
    await expect(page.locator('#btn-delete-document')).toBeVisible();
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

    // Click delete to open modal
    await page.click('#btn-delete-document');

    // Confirm delete inside modal
    await page.click('#btn-confirm-delete');

    // Redirect to list
    await page.waitForURL('**/documents');

    // Verify not visible anymore
    await expect(page.getByText('Playwright Test Book Updated')).not.toBeVisible();
  });
});
