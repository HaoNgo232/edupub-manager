import { test, expect } from '@playwright/test';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function mockAuthenticatedDocumentCreate(page: import('@playwright/test').Page) {
  await page.route(`${apiUrl}/auth/me`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-upload-ui',
        email: 'upload-ui@edupub.test',
        fullName: 'Upload UI Tester',
        role: 'USER',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('accessToken', 'test-token');
  });
}

test.describe('Document upload UI', () => {
  test('uploads image and file, then submits document URLs in JSON payload', async ({ page }) => {
    await mockAuthenticatedDocumentCreate(page);

    let createPayload: Record<string, unknown> | null = null;

    await page.route(`${apiUrl}/uploads/image`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          url: `${apiUrl}/uploads/images/1716720000000-a8f2-cover.png`,
          path: '/uploads/images/1716720000000-a8f2-cover.png',
          filename: '1716720000000-a8f2-cover.png',
          originalName: 'cover.png',
          mimeType: 'image/png',
          size: 68,
        }),
      });
    });

    await page.route(`${apiUrl}/uploads/file`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          url: `${apiUrl}/uploads/files/1716720000000-a8f2-document.pdf`,
          path: '/uploads/files/1716720000000-a8f2-document.pdf',
          filename: '1716720000000-a8f2-document.pdf',
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
          size: 128,
        }),
      });
    });

    await page.route(`${apiUrl}/documents`, async (route) => {
      createPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'doc-upload-ui',
          ...createPayload,
          ownerId: 'user-upload-ui',
          owner: {
            id: 'user-upload-ui',
            email: 'upload-ui@edupub.test',
            fullName: 'Upload UI Tester',
            role: 'USER',
            avatarUrl: null,
          },
          description: createPayload?.description ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/documents/new');

    await page.fill('#doc-title', 'Upload UI Document');
    await page.selectOption('#doc-subject', 'MATH');
    await page.fill('#doc-grade', '10');

    await page.locator('#doc-cover-upload').setInputFiles({
      name: 'cover.png',
      mimeType: 'image/png',
      buffer: Buffer.from('image-fixture'),
    });
    await expect(page.getByText('Uploading image...')).toBeVisible();
    await expect(page.getByAltText('Cover image preview')).toBeVisible();

    await page.locator('#doc-file-upload').setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 upload ui fixture'),
    });
    await expect(page.getByText('Uploading file...')).toBeVisible();
    await expect(page.getByRole('link', { name: /Open File 1716720000000-a8f2-document\.pdf/i })).toBeVisible();

    await page.click('#btn-submit-document');
    await page.waitForURL('**/documents/doc-upload-ui');

    expect(createPayload?.coverImageUrl).toBe(`${apiUrl}/uploads/images/1716720000000-a8f2-cover.png`);
    expect(createPayload?.fileUrl).toBe(`${apiUrl}/uploads/files/1716720000000-a8f2-document.pdf`);
  });

  test('rejects invalid image and file on the client before upload', async ({ page }) => {
    await mockAuthenticatedDocumentCreate(page);

    let imageUploadCalled = false;
    let fileUploadCalled = false;

    await page.route(`${apiUrl}/uploads/image`, async (route) => {
      imageUploadCalled = true;
      await route.abort();
    });
    await page.route(`${apiUrl}/uploads/file`, async (route) => {
      fileUploadCalled = true;
      await route.abort();
    });

    await page.goto('/documents/new');

    await page.locator('#doc-cover-upload').setInputFiles({
      name: 'not-an-image.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    });
    await expect(page.getByText('Invalid image type. Please upload JPG, PNG, WEBP, or GIF.')).toBeVisible();

    await page.locator('#doc-file-upload').setInputFiles({
      name: 'danger.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ'),
    });
    await expect(page.getByText('Invalid file type. Please upload PDF, Word, Excel, PowerPoint, or TXT.')).toBeVisible();

    expect(imageUploadCalled).toBe(false);
    expect(fileUploadCalled).toBe(false);
  });
});
