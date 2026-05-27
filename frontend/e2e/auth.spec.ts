import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Generate a random email for the registration and login flows
const randomSuffix = Math.floor(Math.random() * 1000000);
const testEmail = `test-${randomSuffix}-${Date.now()}@edupub.test`;
const testPassword = 'User@123456';
const testName = 'Test User';

test.describe('Authentication and Profile E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('requestfailed', (request) => {
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });
  });

  test('should display validation errors during registration', async ({ page }) => {
    await page.goto('/register');

    // Fill invalid details
    await page.fill('input[placeholder="John Doe"]', 'A'); // name too short (min 2)
    await page.fill('input[type="email"]', 'test@invalid'); // passes HTML5 email validation but fails NestJS @IsEmail check
    await page.fill('input[type="password"]', '123'); // password too short (min 6)

    // Also apply novalidate right before click to prevent any browser tooltips from blocking submission
    await page.evaluate(() => {
      document.querySelector('form')?.setAttribute('novalidate', 'novalidate');
    });

    await page.click('button[type="submit"]');

    // Verify validation error list is displayed
    await expect(page.getByText('Please correct the following errors:')).toBeVisible();

    // Verify some specific validation texts are present in the list
    const errorList = page.locator('ul.list-disc >> li');
    const errorTexts = await errorList.allTextContents();

    expect(errorTexts.length).toBeGreaterThan(0);
    expect(errorTexts.some((text) => text.includes('email') || text.includes('Email'))).toBeTruthy();
    expect(errorTexts.some((text) => text.includes('fullName') || text.includes('name'))).toBeTruthy();
    expect(errorTexts.some((text) => text.includes('password'))).toBeTruthy();
  });

  test('should register a new user successfully and redirect to home', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[placeholder="John Doe"]', testName);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    await page.click('button[type="submit"]');

    // Should be redirected to '/'
    await page.waitForURL('**/');
    expect(page.url()).not.toContain('/register');

    // Verify token is stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('should display registration conflict when using same email', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[placeholder="John Doe"]', 'Another Name');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    await page.click('button[type="submit"]');

    // Verify conflict error message
    await expect(page.getByText('Email already exists')).toBeVisible();
  });

  test('should display generic error on login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@edupub.test');
    await page.fill('input[type="password"]', 'WrongPassword123');

    await page.click('button[type="submit"]');

    // Verify generic error message
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('should login successfully with the registered user', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    await page.click('button[type="submit"]');

    // Redirect to home page
    await page.waitForURL('**/');

    // Verify token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('should redirect to login when accessing home page without a token', async ({ page }) => {
    // Access with a clean/new page context
    await page.goto('/');

    // Clear localStorage to simulate lack of token
    await page.evaluate(() => localStorage.clear());

    // Reload or visit page again
    await page.goto('/');

    // Verify redirect to login
    await page.waitForURL('**/login');
  });

  test('should view user profile and verify read-only fields', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Verify user details are visible and correct
    await expect(page.getByText(`Welcome back, ${testName.split(' ')[0]}`)).toBeVisible();

    const profileCard = page.locator('div.lg\\:col-span-2');
    await expect(profileCard).toContainText(testName);
    await expect(profileCard).toContainText(testEmail);
    await expect(profileCard).toContainText('USER'); // Role is USER by default

    // Verify email and role cannot be changed (i.e. no input/select for them inside the edit form)
    const editForm = page.locator('form');
    const emailInputs = editForm.locator('input[type="email"]');
    await expect(emailInputs).toHaveCount(0);

    const roleInputs = editForm.locator('select');
    await expect(roleInputs).toHaveCount(0);
  });

  test('should update profile and persist changes', async ({ page }) => {
    // Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Wait for the profile dashboard to load completely
    const profileCard = page.locator('div.lg\\:col-span-2');
    await expect(profileCard).toContainText(testEmail);
    await page.waitForTimeout(1000); // Settle delay to ensure event handlers are bound

    // Edit details
    const updatedName = 'Test User Updated';
    const validAvatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150';

    const nameInput = page.locator('form >> input[type="text"]');
    await nameInput.clear();
    await nameInput.fill(updatedName);

    const avatarInput = page.locator('form >> input[type="url"]');
    await avatarInput.clear();
    await avatarInput.fill(validAvatarUrl);

    await page.click('form >> button[type="submit"]');

    // Verify details are updated in the UI (checking persistence and display)
    await expect(profileCard.getByRole('heading', { name: updatedName })).toBeVisible();

    // Verify avatar image has updated src
    const avatarImg = profileCard.locator('img');
    await expect(avatarImg).toHaveAttribute('src', validAvatarUrl);
  });

  test('should display validation errors when updating profile with invalid fields', async ({ page }) => {
    // Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Wait for the profile dashboard to load completely
    const profileCard = page.locator('div.lg\\:col-span-2');
    await expect(profileCard).toContainText(testEmail);
    await page.waitForTimeout(1000); // Settle delay to ensure event handlers are bound

    // Set invalid name (too short)
    const nameInput = page.locator('form >> input[type="text"]');
    await nameInput.clear();
    await nameInput.fill('A');

    // Click save
    await page.click('form >> button[type="submit"]');

    // Verify error message from backend is shown
    await expect(page.getByText('fullName must be longer than or equal to 2 characters')).toBeVisible();
  });

  test('should log out successfully', async ({ page }) => {
    // Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Wait for the profile dashboard to load completely
    const profileCard = page.locator('div.lg\\:col-span-2');
    await expect(profileCard).toContainText(testEmail);

    // Click logout
    await page.click('button:has-text("Log out")');

    // Verify redirection to /login
    await page.waitForURL('**/login');

    // Verify accessToken is cleared from localStorage
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });
});
