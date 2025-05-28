import { setupServer } from 'msw/node'
import { handlers } from './mock-handlers'

// Setup MSW server
export const server = setupServer(...handlers)

// Setup MSW for tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})