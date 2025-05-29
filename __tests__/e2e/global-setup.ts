import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Set up test environment
  process.env.NODE_ENV = 'test'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  
  // You can add database seeding here if needed
  console.log('🧪 Setting up E2E test environment...')
  
  // Warm up the server by making a request
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    await page.goto('http://localhost:3000', { timeout: 30000 })
    console.log('✅ Server is ready for E2E tests')
  } catch (error) {
    console.error('❌ Failed to connect to server:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup