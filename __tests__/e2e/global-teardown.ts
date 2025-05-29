import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  // Clean up test environment
  console.log('🧹 Cleaning up E2E test environment...')
  
  // You can add database cleanup here if needed
  // await cleanupTestDatabase()
  
  console.log('✅ E2E test cleanup completed')
}

export default globalTeardown