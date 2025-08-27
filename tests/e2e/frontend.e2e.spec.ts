import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads successfully with a more flexible title check
    await expect(page).toHaveTitle(/FLY-pg|Property Rental|Payload/)

    // Check for the main hero section or navigation
    const heroSection = page.locator('main, [role="main"], .hero, .hero-section, nav').first()
    await expect(heroSection).toBeVisible()

    // Check for navigation elements
    const nav = page.locator('nav, [role="navigation"], header').first()
    await expect(nav).toBeVisible()
  })

  test('should have basic page structure', async ({ page }) => {
    await page.goto('/')

    // Basic structure checks that don't require specific content
    await expect(page.locator('html')).toBeVisible()
    await expect(page.locator('body')).toBeVisible()

    // Check for basic HTML structure
    const head = page.locator('head')
    const title = page.locator('title')

    expect(await head.count()).toBeGreaterThan(0)
    expect(await title.count()).toBeGreaterThan(0)
  })
})
