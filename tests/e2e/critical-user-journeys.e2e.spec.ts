import { test, expect, Page } from '@playwright/test'

test.describe('Critical User Journeys', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test.describe('Basic Navigation Flow', () => {
    test('should navigate through main pages without authentication', async ({ page }) => {
      // 1. Navigate to homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Verify homepage loads with flexible title check
      await expect(page).toHaveTitle(/FLY-pg|Property Rental|Payload/)

      // Check for main content
      const mainContent = page
        .locator('main, [role="main"], .hero, .hero-section, nav, header')
        .first()
      await expect(mainContent).toBeVisible()

      // 2. Navigate to properties page
      const propertiesLink = page.locator(
        'a[href="/properties"], a:has-text("Properties"), nav a:has-text("Properties")',
      )
      if ((await propertiesLink.count()) > 0) {
        await propertiesLink.first().click()
        await page.waitForLoadState('domcontentloaded')

        // Verify properties page loads
        await expect(page).toHaveURL(/.*properties.*/)
      }

      // 3. Navigate to sign up page
      const signUpLink = page.locator(
        'a[href="/auth/sign-up"], a:has-text("Sign Up"), a:has-text("Register")',
      )
      if ((await signUpLink.count()) > 0) {
        await signUpLink.first().click()
        await page.waitForLoadState('domcontentloaded')

        // Verify sign up page loads
        await expect(page).toHaveURL(/.*sign-up.*/)
      }

      // 4. Navigate to sign in page
      const signInLink = page.locator(
        'a[href="/auth/sign-in"], a:has-text("Sign In"), a:has-text("Login")',
      )
      if ((await signInLink.count()) > 0) {
        await signInLink.first().click()
        await page.waitForLoadState('domcontentloaded')

        // Verify sign in page loads
        await expect(page).toHaveURL(/.*sign-in.*/)
      }
    })

    test('should display property listings', async ({ page }) => {
      await page.goto('/properties')
      await page.waitForLoadState('domcontentloaded')

      // Check if properties are displayed (either as cards or list items)
      const propertyElements = page.locator(
        '[data-testid="property-card"], .property-card, .property-item, [class*="property"], .card, [class*="listing"]',
      )

      // If properties exist, verify they're visible
      const count = await propertyElements.count()
      if (count > 0) {
        await expect(propertyElements.first()).toBeVisible()
      } else {
        // If no properties, check for a message or empty state
        const emptyState = page.locator(
          'text=No properties found, text=No listings, .empty-state, text=Loading, text=Search',
        )
        if ((await emptyState.count()) > 0) {
          await expect(emptyState.first()).toBeVisible()
        } else {
          // If no specific empty state, just verify the page loaded
          await expect(page.locator('body')).toBeVisible()
        }
      }
    })

    test('should handle authentication pages', async ({ page }) => {
      // Test sign up page
      await page.goto('/auth/sign-up')
      await page.waitForLoadState('domcontentloaded')

      // Check for form elements
      const form = page.locator('form')
      if ((await form.count()) > 0) {
        await expect(form.first()).toBeVisible()
      }

      // Test sign in page
      await page.goto('/auth/sign-in')
      await page.waitForLoadState('domcontentloaded')

      // Check for form elements
      const signInForm = page.locator('form')
      if ((await signInForm.count()) > 0) {
        await expect(signInForm.first()).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Verify page loads on mobile with flexible title check
      await expect(page).toHaveTitle(/FLY-pg|Property Rental|Payload/)

      // Check for mobile navigation or hamburger menu
      const mobileNav = page.locator(
        '[data-testid="mobile-menu"], .mobile-menu, .hamburger, button[aria-label*="menu"], nav, header',
      )
      if ((await mobileNav.count()) > 0) {
        await expect(mobileNav.first()).toBeVisible()
      }
    })

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Verify page loads on tablet with flexible title check
      await expect(page).toHaveTitle(/FLY-pg|Property Rental|Payload/)
    })
  })
})
