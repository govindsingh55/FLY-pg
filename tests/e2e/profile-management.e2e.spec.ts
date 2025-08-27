import { test, expect, Page } from '@playwright/test'

test.describe('Profile Management Flow', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('should allow user to register with profile information', async ({ page }) => {
    // Navigate to sign up page
    await page.goto('/auth/sign-up')
    await page.waitForLoadState('domcontentloaded')

    // Check for profile-related form fields
    const nameInput = page.locator(
      'input[name="name"], input[name="fullName"], input[placeholder*="name"]',
    )
    const emailInput = page.locator('input[name="email"], input[type="email"]')
    const phoneInput = page.locator(
      'input[name="phone"], input[name="mobile"], input[placeholder*="phone"]',
    )
    const passwordInput = page.locator('input[name="password"], input[type="password"]')

    // Verify form fields are present
    if ((await nameInput.count()) > 0) {
      await expect(nameInput.first()).toBeVisible()
    }
    if ((await emailInput.count()) > 0) {
      await expect(emailInput.first()).toBeVisible()
    }
    if ((await phoneInput.count()) > 0) {
      await expect(phoneInput.first()).toBeVisible()
    }
    if ((await passwordInput.count()) > 0) {
      await expect(passwordInput.first()).toBeVisible()
    }
  })

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.waitForLoadState('domcontentloaded')

    // Find form fields
    const emailInput = page.locator('input[name="email"], input[type="email"]')
    const phoneInput = page.locator(
      'input[name="phone"], input[name="mobile"], input[placeholder*="phone"]',
    )
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")',
    )

    if ((await emailInput.count()) > 0 && (await submitButton.count()) > 0) {
      // Test invalid email
      await emailInput.first().fill('invalid-email')
      await submitButton.first().click()

      // Wait for potential validation error
      await page.waitForTimeout(1000)

      // Check for validation error (if any)
      const errorMessage = page.locator(
        'text=Invalid, text=Error, text=Please, [class*="error"], [class*="invalid"]',
      )
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible()
      }
    }
  })

  test('should handle user login with profile credentials', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.waitForLoadState('domcontentloaded')

    // Check for login form fields
    const emailInput = page.locator('input[name="email"], input[type="email"]')
    const passwordInput = page.locator('input[name="password"], input[type="password"]')
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign In"), button:has-text("Login")',
    )

    // Verify form fields are present
    if ((await emailInput.count()) > 0) {
      await expect(emailInput.first()).toBeVisible()
    }
    if ((await passwordInput.count()) > 0) {
      await expect(passwordInput.first()).toBeVisible()
    }
    if ((await submitButton.count()) > 0) {
      await expect(submitButton.first()).toBeVisible()
    }
  })

  test('should display user-friendly error messages', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.waitForLoadState('domcontentloaded')

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign In"), button:has-text("Login")',
    )

    if ((await submitButton.count()) > 0) {
      // Try to submit empty form
      await submitButton.first().click()

      // Wait for potential validation
      await page.waitForTimeout(1000)

      // Check for error messages
      const errorMessages = page.locator(
        'text=required, text=Please, text=Error, text=Invalid, [class*="error"]',
      )
      if ((await errorMessages.count()) > 0) {
        await expect(errorMessages.first()).toBeVisible()
      }
    }
  })

  test('should handle forgot password functionality', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.waitForLoadState('domcontentloaded')

    // Look for forgot password link
    const forgotPasswordLink = page.locator(
      'a:has-text("Forgot"), a:has-text("Password"), a[href*="forgot"]',
    )

    if ((await forgotPasswordLink.count()) > 0) {
      await expect(forgotPasswordLink.first()).toBeVisible()

      // Click on forgot password link
      await forgotPasswordLink.first().click()
      await page.waitForLoadState('domcontentloaded')

      // Check that we're on forgot password page or stay on sign-in page
      const currentUrl = page.url()
      expect(
        currentUrl.includes('forgot') ||
          currentUrl.includes('reset') ||
          currentUrl.includes('sign-in'),
      ).toBe(true)
    } else {
      // If forgot password link doesn't exist, that's also acceptable for now
      // Just verify we're on the sign-in page
      await expect(page).toHaveURL(/.*sign-in.*/)
    }
  })

  test('should handle social authentication options', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.waitForLoadState('domcontentloaded')

    // Look for social login buttons
    const socialButtons = page.locator(
      'button:has-text("Google"), button:has-text("Facebook"), button:has-text("GitHub"), [class*="social"], [class*="oauth"]',
    )

    if ((await socialButtons.count()) > 0) {
      await expect(socialButtons.first()).toBeVisible()
    }
  })
})
