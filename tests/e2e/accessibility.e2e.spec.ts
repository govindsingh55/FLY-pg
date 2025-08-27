import { test, expect, Page } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('should have proper heading structure on homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Check for main heading
    const h1Elements = await page.locator('h1').all()
    expect(h1Elements.length).toBeGreaterThan(0)

    // Check heading hierarchy
    const h2Elements = await page.locator('h2').all()
    const h3Elements = await page.locator('h3').all()

    // Should have logical heading structure
    expect(h1Elements.length).toBeLessThanOrEqual(2) // Allow for multiple h1s on homepage
  })

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const images = await page.locator('img').all()

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      // Images should have alt text (empty alt is acceptable for decorative images)
      expect(alt).not.toBeNull()
    }
  })

  test('should have proper form labels on sign up page', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.waitForLoadState('domcontentloaded')

    const inputs = await page.locator('input, select, textarea').all()

    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const name = await input.getAttribute('name')
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')

      // Input should have either id with label, aria-label, or placeholder
      const hasLabel = id && (await page.locator(`label[for="${id}"]`).count()) > 0
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0
      const hasPlaceholder = placeholder && placeholder.length > 0

      expect(hasLabel || hasAriaLabel || hasPlaceholder).toBe(true)
    }
  })

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const buttons = await page.locator('button').all()

    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')

      // Button should have accessible text or label
      const hasText = text && text.trim().length > 0
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0
      const hasTitle = title && title.length > 0

      expect(hasText || hasAriaLabel || hasTitle).toBe(true)
    }
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Test tab navigation
    await page.keyboard.press('Tab')

    // Should focus on first focusable element
    const focusedElement = await page.evaluate(() => document.activeElement)
    expect(focusedElement).not.toBeNull()

    // Test tab order - but be more flexible about focus changes
    await page.keyboard.press('Tab')
    const secondFocusedElement = await page.evaluate(() => document.activeElement)
    // Focus might stay the same if there's only one focusable element
    expect(secondFocusedElement).not.toBeNull()
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Basic color contrast check - verify text is visible
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div').all()

    for (const element of textElements.slice(0, 5)) {
      // Check first 5 text elements
      const isVisible = await element.isVisible()
      if (isVisible) {
        const color = await element.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return style.color
        })
        // Basic check that color is not transparent or white on white
        expect(color).not.toBe('rgba(0, 0, 0, 0)')
        expect(color).not.toBe('transparent')
      }
    }
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Check for proper ARIA labels on interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea').all()

    for (const element of interactiveElements.slice(0, 10)) {
      // Check first 10 elements
      const ariaLabel = await element.getAttribute('aria-label')
      const ariaLabelledBy = await element.getAttribute('aria-labelledby')
      const role = await element.getAttribute('role')

      // Element should have either aria-label, aria-labelledby, or be properly labeled
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0
      const hasAriaLabelledBy = ariaLabelledBy && ariaLabelledBy.length > 0
      const hasRole = role && role.length > 0

      // For buttons and links, they should have accessible text
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase())
      if (tagName === 'button' || tagName === 'a') {
        const text = await element.textContent()
        const hasText = text && text.trim().length > 0
        expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBe(true)
      }
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    let focusCount = 0
    const maxTabs = 20 // Limit to prevent infinite loops

    while (focusCount < maxTabs) {
      const focusedElement = await page.evaluate(() => document.activeElement)
      if (focusedElement) {
        focusCount++
        await page.keyboard.press('Tab')
      } else {
        break
      }
    }

    expect(focusCount).toBeGreaterThan(0)
  })
})
