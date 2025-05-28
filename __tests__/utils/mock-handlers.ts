import { http, HttpResponse } from 'msw'
import { mockApiResponses } from './test-utils'

export const handlers = [
  // Auth sync endpoint
  http.post('/api/auth/sync', () => {
    return HttpResponse.json(mockApiResponses.userSync)
  }),

  // User profile endpoint
  http.get('/api/auth/user', () => {
    return HttpResponse.json(mockApiResponses.userProfile)
  }),

  // Update user profile
  http.put('/api/auth/user', async ({ request }) => {
    const updates = await request.json()
    return HttpResponse.json({
      ...mockApiResponses.userProfile,
      ...updates,
    })
  }),

  // Courses endpoint
  http.get('/api/courses', () => {
    return HttpResponse.json(mockApiResponses.courses)
  }),

  // Single course endpoint
  http.get('/api/courses/:id', ({ params }) => {
    const course = mockApiResponses.courses.find(c => c.id === params.id)
    if (!course) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(course)
  }),

  // Error responses for testing error handling
  http.post('/api/auth/sync-error', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get('/api/user-error', () => {
    return new HttpResponse(null, { status: 401 })
  }),
]

// Handlers for specific test scenarios
export const errorHandlers = [
  http.post('/api/auth/sync', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get('/api/auth/user', () => {
    return new HttpResponse(null, { status: 401 })
  }),

  http.get('/api/courses', () => {
    return new HttpResponse(null, { status: 500 })
  }),
]

export const loadingHandlers = [
  http.get('/api/auth/user', () => {
    return new Promise(() => {}) // Never resolves
  }),

  http.get('/api/courses', () => {
    return new Promise(() => {}) // Never resolves
  }),
]