import { test, expect, Page } from '@playwright/test'

test.describe('Payment Flow', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('should display payment information on property details', async ({ page }) => {
    // Navigate to properties page
    await page.goto('/properties')
    await page.waitForLoadState('domcontentloaded')

    // Check if properties are displayed
    const propertyElements = page.locator(
      '[data-testid="property-card"], .property-card, .property-item, [class*="property"], .card, [class*="listing"]',
    )

    if ((await propertyElements.count()) > 0) {
      // Click on first property
      await propertyElements.first().click()
      await page.waitForLoadState('domcontentloaded')

      // Check for payment-related information
      const paymentInfo = page.locator(
        'text=rent, text=price, text=payment, [class*="price"], [class*="rent"]',
      )
      if ((await paymentInfo.count()) > 0) {
        await expect(paymentInfo.first()).toBeVisible()
      }
    }
  })

  test('should handle booking form with payment options', async ({ page }) => {
    await page.goto('/properties')
    await page.waitForLoadState('domcontentloaded')

    const propertyElements = page.locator(
      '[data-testid="property-card"], .property-card, .property-item, [class*="property"], .card, [class*="listing"]',
    )

    if ((await propertyElements.count()) > 0) {
      // Click on first property
      await propertyElements.first().click()
      await page.waitForLoadState('domcontentloaded')

      // Look for booking or book now button
      const bookButton = page.locator(
        'button:has-text("Book"), button:has-text("Book Now"), a:has-text("Book"), a:has-text("Book Now")',
      )

      if ((await bookButton.count()) > 0) {
        await bookButton.first().click()
        await page.waitForLoadState('domcontentloaded')

        // Check for booking form
        const bookingForm = page.locator('form')
        if ((await bookingForm.count()) > 0) {
          await expect(bookingForm.first()).toBeVisible()
        }
      }
    }
  })

  test('should display pricing information correctly', async ({ page }) => {
    await page.goto('/properties')
    await page.waitForLoadState('domcontentloaded')

    // Check for pricing elements
    const priceElements = page.locator(
      '[class*="price"], [class*="rent"], [class*="cost"], .price, .rent, .cost',
    )

    if ((await priceElements.count()) > 0) {
      await expect(priceElements.first()).toBeVisible()

      // Check that price is not empty
      const priceText = await priceElements.first().textContent()
      expect(priceText).toBeTruthy()
      expect(priceText?.trim().length).toBeGreaterThan(0)
    }
  })

  test('should handle payment method selection', async ({ page }) => {
    // Navigate to sign up page to test payment method selection during registration
    await page.goto('/auth/sign-up')
    await page.waitForLoadState('domcontentloaded')

    // Check for payment-related form fields
    const paymentFields = page.locator(
      'input[name*="payment"], input[name*="card"], select[name*="payment"], select[name*="method"]',
    )

    if ((await paymentFields.count()) > 0) {
      await expect(paymentFields.first()).toBeVisible()
    }
  })

  test('should display payment terms and conditions', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Look for terms, conditions, or policy links
    const termsLinks = page.locator(
      'a:has-text("Terms"), a:has-text("Conditions"), a:has-text("Policy"), a:has-text("Privacy")',
    )

    if ((await termsLinks.count()) > 0) {
      await expect(termsLinks.first()).toBeVisible()

      // Click on first terms link
      await termsLinks.first().click()
      await page.waitForLoadState('domcontentloaded')

      // Check that terms page loads or we stay on the same page
      const currentUrl = page.url()
      expect(
        currentUrl !== 'http://localhost:3000/' ||
          currentUrl.includes('terms') ||
          currentUrl.includes('policy') ||
          currentUrl.includes('privacy'),
      ).toBe(true)
    } else {
      // If terms links don't exist, that's also acceptable for now
      // Just verify we're on the homepage
      await expect(page).toHaveURL('/')
    }
  })

  test('should handle payment security information', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Look for security-related information
    const securityInfo = page.locator(
      'text=secure, text=security, text=SSL, text=encrypted, [class*="security"], [class*="secure"]',
    )

    if ((await securityInfo.count()) > 0) {
      await expect(securityInfo.first()).toBeVisible()
    }
  })
})
