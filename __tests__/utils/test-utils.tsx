import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/auth-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock user data
export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
}

export const mockUserProfile = {
  id: 'test-id',
  firebaseUid: 'test-uid',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'STUDENT' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock authentication context value
export const mockAuthContext = {
  user: mockUser,
  userProfile: mockUserProfile,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: typeof mockAuthContext
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: ReactElement,
  {
    authContext = mockAuthContext,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Mock the AuthProvider
  const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
      <div data-testid="mock-auth-provider">
        {children}
      </div>
    )
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock API responses
export const mockApiResponses = {
  userSync: {
    success: true,
    user: mockUserProfile,
  },
  userProfile: mockUserProfile,
  courses: [
    {
      id: 'course-1',
      title: 'Test Course 1',
      description: 'Test description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'course-2',
      title: 'Test Course 2',
      description: 'Test description 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
}

// Test helper functions
export const createMockEvent = (overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: '' },
  ...overrides,
})

export const createMockFormData = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

// Wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0))

// Mock fetch responses
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  )
}

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
}

// Mock component props
export const mockComponentProps = {
  button: {
    onClick: jest.fn(),
    children: 'Test Button',
  },
  input: {
    onChange: jest.fn(),
    value: '',
    placeholder: 'Test input',
  },
  form: {
    onSubmit: jest.fn(),
  },
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'