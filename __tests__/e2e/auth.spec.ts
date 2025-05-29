import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page before each test
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    // Navigate to login page
    await page.click('text=ログイン')
    
    // Wait for navigation
    await page.waitForURL('/auth/login')
    
    // Check if login form elements are present
    await expect(page.locator('h1, h2')).toContainText('ログイン')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
    await expect(page.locator('button:has-text("Googleでログイン")')).toBeVisible()
  })

  test('should display registration page', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=新規登録')
    
    // Wait for navigation
    await page.waitForURL('/auth/register')
    
    // Check if registration form elements are present
    await expect(page.locator('h1, h2')).toContainText('新規登録')
    await expect(page.locator('input[name="firstName"], input[placeholder*="名前"], input[placeholder*="姓"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"], input[placeholder*="名前"], input[placeholder*="姓"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("アカウント作成")')).toBeVisible()
  })

  test('should show validation errors on invalid login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Try to submit empty form
    await page.click('button:has-text("ログイン")')
    
    // Check for validation errors
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible()
    await expect(page.locator('text=パスワードは6文字以上で入力してください')).toBeVisible()
  })

  test('should show validation errors on invalid registration', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth/register')
    
    // Fill in invalid data
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', '123')
    
    // Try to submit form
    await page.click('button:has-text("アカウント作成")')
    
    // Check for validation errors
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible()
    await expect(page.locator('text=パスワードは6文字以上で入力してください')).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login')
    
    const passwordInput = page.locator('input[type="password"]')
    const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first()
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    await toggleButton.click()
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click toggle button again
    await toggleButton.click()
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should navigate between login and registration pages', async ({ page }) => {
    // Start at login page
    await page.goto('/auth/login')
    await expect(page.locator('h1, h2')).toContainText('ログイン')
    
    // Go to registration page
    await page.click('text=新規登録')
    await page.waitForURL('/auth/register')
    await expect(page.locator('h1, h2')).toContainText('新規登録')
    
    // Go back to login page
    await page.click('text=ログイン')
    await page.waitForURL('/auth/login')
    await expect(page.locator('h1, h2')).toContainText('ログイン')
  })

  test('should have working forgot password link', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Check if forgot password link exists and is clickable
    const forgotPasswordLink = page.locator('text=パスワードを忘れた方')
    await expect(forgotPasswordLink).toBeVisible()
    await expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
  })

  test('should have working Google sign-in button', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Check if Google sign-in button exists
    const googleButton = page.locator('button:has-text("Googleでログイン")')
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
    
    // Check if button has Google icon
    await expect(googleButton.locator('svg')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }
    
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Check if form is properly displayed on mobile
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
    
    // Check if buttons are properly sized for mobile
    const loginButton = page.locator('button:has-text("ログイン")')
    const buttonBox = await loginButton.boundingBox()
    
    if (buttonBox) {
      // Button should be wide enough for mobile touch
      expect(buttonBox.height).toBeGreaterThan(40)
    }
  })
})

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')
    
    // Check if home page loads correctly
    await expect(page.locator('h1, h2')).toContainText(/LMS|学習|コース|AI/)
    
    // Check if navigation elements are present
    await expect(page.locator('nav, header')).toBeVisible()
  })

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Check if main navigation links are present
    const navLinks = [
      'ホーム',
      'コース',
      'ログイン',
      '新規登録'
    ]
    
    for (const linkText of navLinks) {
      const link = page.locator(`text=${linkText}`)
      if (await link.count() > 0) {
        await expect(link.first()).toBeVisible()
      }
    }
  })

  test('should handle 404 page', async ({ page }) => {
    // Navigate to non-existent page
    const response = await page.goto('/non-existent-page')
    
    // Should return 404 status
    expect(response?.status()).toBe(404)
    
    // Should display 404 page or redirect
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load pages within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should have no console errors on main pages', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Visit main pages
    await page.goto('/')
    await page.goto('/auth/login')
    await page.goto('/auth/register')
    
    // Should have no console errors
    expect(consoleErrors).toHaveLength(0)
  })
})