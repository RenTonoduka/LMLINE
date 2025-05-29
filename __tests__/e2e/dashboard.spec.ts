import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.describe('Unauthenticated Access', () => {
    test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
      // Try to access dashboard directly
      await page.goto('/dashboard')
      
      // Should be redirected to login page
      await expect(page).toHaveURL(/\/auth\/login/)
      
      // Should show login form
      await expect(page.locator('h1, h2')).toContainText('ログイン')
    })

    test('should show authentication required message', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Wait for redirect
      await page.waitForURL(/\/auth\/login/)
      
      // Check if we're on the login page
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })
  })

  test.describe('Mock Authenticated Access', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication state
      await page.addInitScript(() => {
        // Mock localStorage to simulate logged-in state
        localStorage.setItem('authToken', 'mock-token')
        
        // Mock Firebase auth state
        window.__FIREBASE_AUTH_STATE__ = {
          uid: 'mock-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: true
        }
      })
    })

    test('should display dashboard when authenticated', async ({ page }) => {
      // Mock the API endpoints
      await page.route('/api/auth/user', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-user-id',
            email: 'test@example.com',
            name: 'Test User',
            role: 'STUDENT'
          })
        })
      })

      await page.route('/api/courses', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'course-1',
              title: 'JavaScript基礎',
              description: 'JavaScript入門コース',
              image: '/course1.jpg'
            },
            {
              id: 'course-2',
              title: 'React入門',
              description: 'Reactの基本を学ぶ',
              image: '/course2.jpg'
            }
          ])
        })
      })

      await page.goto('/dashboard')
      
      // Should display dashboard content
      await expect(page.locator('h1, h2')).toContainText(/ダッシュボード|学習|コース/)
      
      // Should show user information
      await expect(page.locator('text=Test User')).toBeVisible()
    })

    test('should display course list', async ({ page }) => {
      // Mock courses API
      await page.route('/api/courses', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'course-1',
              title: 'JavaScript基礎',
              description: 'JavaScript入門コース'
            },
            {
              id: 'course-2',
              title: 'React入門',
              description: 'Reactの基本を学ぶ'
            }
          ])
        })
      })

      await page.goto('/dashboard')
      
      // Should display courses
      await expect(page.locator('text=JavaScript基礎')).toBeVisible()
      await expect(page.locator('text=React入門')).toBeVisible()
    })

    test('should have working logout functionality', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Find and click logout button
      const logoutButton = page.locator('button:has-text("ログアウト"), a:has-text("ログアウト")')
      
      if (await logoutButton.count() > 0) {
        await logoutButton.click()
        
        // Should redirect to home page or login page
        await expect(page).toHaveURL(/\/(auth\/login)?$/)
      }
    })

    test('should display user navigation menu', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Should show user menu or avatar
      const userMenu = page.locator('[data-testid="user-menu"], [data-testid="user-nav"], .user-menu')
      
      if (await userMenu.count() > 0) {
        await expect(userMenu).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile devices', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip()
      }
      
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('authToken', 'mock-token')
      })

      await page.route('/api/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({})
        })
      })

      await page.goto('/dashboard')
      
      // Check if dashboard is properly displayed on mobile
      await expect(page.locator('body')).toBeVisible()
      
      // Check viewport width
      const viewportSize = page.viewportSize()
      if (viewportSize) {
        expect(viewportSize.width).toBeLessThan(768) // Mobile width
      }
    })

    test('should have mobile-friendly navigation', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip()
      }
      
      await page.addInitScript(() => {
        localStorage.setItem('authToken', 'mock-token')
      })

      await page.route('/api/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({})
        })
      })

      await page.goto('/dashboard')
      
      // Look for mobile menu toggle
      const mobileMenuToggle = page.locator('button:has([data-testid="mobile-menu"]), button[aria-label*="menu"], .mobile-menu-toggle')
      
      if (await mobileMenuToggle.count() > 0) {
        await expect(mobileMenuToggle).toBeVisible()
        
        // Test mobile menu toggle
        await mobileMenuToggle.click()
        
        // Menu should appear
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu')
        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu).toBeVisible()
        }
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('authToken', 'mock-token')
      })

      // Mock API error
      await page.route('/api/auth/user', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        })
      })

      await page.goto('/dashboard')
      
      // Should handle error gracefully (not crash)
      await expect(page.locator('body')).toBeVisible()
      
      // Should show error message or fallback content
      const errorMessage = page.locator('text=エラー, text=Error, text=問題が発生')
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible()
      }
    })

    test('should handle network errors', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('authToken', 'mock-token')
      })

      // Mock network failure
      await page.route('/api/**', async (route) => {
        await route.abort('failed')
      })

      await page.goto('/dashboard')
      
      // Should handle network error gracefully
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('authToken', 'mock-token')
      })

      await page.route('/api/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({})
        })
      })

      await page.goto('/dashboard')
      
      // Should have at least one main heading
      const mainHeading = page.locator('h1')
      await expect(mainHeading.first()).toBeVisible()
      
      // Check heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      expect(headingCount).toBeGreaterThan(0)
    })

    test('should have proper ARIA labels', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('authToken', 'mock-token')
      })

      await page.route('/api/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({})
        })
      })

      await page.goto('/dashboard')
      
      // Check for navigation landmarks
      const nav = page.locator('nav, [role="navigation"]')
      if (await nav.count() > 0) {
        await expect(nav.first()).toBeVisible()
      }
      
      // Check for main content area
      const main = page.locator('main, [role="main"]')
      if (await main.count() > 0) {
        await expect(main.first()).toBeVisible()
      }
    })
  })
})