import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../utils/setup-msw'
import { handlers, errorHandlers } from '../utils/mock-handlers'
import { renderWithProviders } from '../utils/test-utils'
import { AuthProvider } from '@/contexts/auth-context'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

// Mock Firebase
jest.mock('firebase/auth')
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))
jest.mock('react-hot-toast')

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>
const mockFirebaseSignOut = firebaseSignOut as jest.MockedFunction<typeof firebaseSignOut>
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>

const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
}

describe('Authentication Flow Integration Tests', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
  })

  afterAll(() => {
    server.close()
  })

  describe('Login Flow', () => {
    it('completes successful login flow with database sync', async () => {
      let authStateListener: (user: any) => void = () => {}
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateListener = callback
        return jest.fn()
      })

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any)

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Fill in login form
      await user.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/i), 'password123')

      // Submit form
      await user.click(screen.getByRole('button', { name: /^ログイン$/i }))

      // Wait for Firebase authentication
      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        )
      })

      // Simulate auth state change
      await act(async () => {
        authStateListener(mockUser)
      })

      // Verify database sync was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/sync', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        }))
      })
    })

    it('handles login error correctly', async () => {
      let authStateListener: (user: any) => void = () => {}
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateListener = callback
        return jest.fn()
      })

      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/user-not-found'
      })

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      await user.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /^ログイン$/i }))

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
      })

      // Form should be enabled again after error
      expect(screen.getByLabelText(/メールアドレス/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/パスワード/i)).not.toBeDisabled()
    })

    it('handles database sync error gracefully', async () => {
      // Use error handlers for this test
      server.use(...errorHandlers)

      let authStateListener: (user: any) => void = () => {}
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateListener = callback
        return jest.fn()
      })

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any)

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      await user.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/i), 'password123')
      await user.click(screen.getByRole('button', { name: /^ログイン$/i }))

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
      })

      // Simulate auth state change
      await act(async () => {
        authStateListener(mockUser)
      })

      // Even if database sync fails, auth should still work
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/sync', expect.any(Object))
      })
    })
  })

  describe('Registration Flow', () => {
    beforeEach(() => {
      // Mock React Hook Form register function
      jest.spyOn(require('react-hook-form'), 'useForm').mockReturnValue({
        register: (name: string) => ({
          name,
          onChange: jest.fn(),
          onBlur: jest.fn(),
          ref: jest.fn(),
        }),
        handleSubmit: (fn: any) => (e: any) => {
          e.preventDefault()
          fn({
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            firstName: 'Test',
            lastName: 'User',
          })
        },
        formState: { errors: {} },
        watch: jest.fn(),
      })
    })

    it('completes successful registration flow', async () => {
      let authStateListener: (user: any) => void = () => {}
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateListener = callback
        return jest.fn()
      })

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any)
      mockUpdateProfile.mockResolvedValue()

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      )

      // Submit registration form
      const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        )
        expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
          displayName: 'Test User'
        })
      })

      // Simulate auth state change
      await act(async () => {
        authStateListener(mockUser)
      })

      // Verify database sync was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/sync', expect.objectContaining({
          method: 'POST',
        }))
      })
    })
  })

  describe('Logout Flow', () => {
    it('completes successful logout flow', async () => {
      let authStateListener: (user: any) => void = () => {}
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateListener = callback
        return jest.fn()
      })

      mockFirebaseSignOut.mockResolvedValue()

      const LogoutButton = () => {
        const { signOut, user } = useAuth()
        return (
          <div>
            <div data-testid="user-status">{user ? 'logged-in' : 'logged-out'}</div>
            <button onClick={signOut}>Logout</button>
          </div>
        )
      }

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LogoutButton />
        </AuthProvider>
      )

      // Start with logged in user
      await act(async () => {
        authStateListener(mockUser)
      })

      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')

      // Click logout
      await user.click(screen.getByRole('button', { name: /logout/i }))

      await waitFor(() => {
        expect(mockFirebaseSignOut).toHaveBeenCalled()
      })

      // Simulate auth state change to null
      await act(async () => {
        authStateListener(null)
      })

      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out')
    })
  })

  describe('Full User Journey', () => {
    it('handles complete user journey from registration to logout', async () => {
      let authStateListener: (user: any) => void = () => {}
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateListener = callback
        return jest.fn()
      })

      mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser } as any)
      mockUpdateProfile.mockResolvedValue()
      mockFirebaseSignOut.mockResolvedValue()

      const TestApp = () => {
        const { user, signUp, signOut } = useAuth()
        
        return (
          <div>
            <div data-testid="auth-status">
              {user ? `Logged in as ${user.email}` : 'Not logged in'}
            </div>
            <button onClick={() => signUp('test@example.com', 'password123', 'Test User')}>
              Register
            </button>
            <button onClick={signOut} disabled={!user}>
              Logout
            </button>
          </div>
        )
      }

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestApp />
        </AuthProvider>
      )

      // Initially logged out
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in')

      // Register user
      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled()
      })

      // Simulate successful registration
      await act(async () => {
        authStateListener(mockUser)
      })

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as test@example.com')

      // Logout user
      await user.click(screen.getByRole('button', { name: /logout/i }))

      await waitFor(() => {
        expect(mockFirebaseSignOut).toHaveBeenCalled()
      })

      // Simulate successful logout
      await act(async () => {
        authStateListener(null)
      })

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in')
    })
  })
})

// Helper to import useAuth
function useAuth() {
  const { useAuth } = require('@/hooks/useAuth')
  return useAuth()
}

// Helper to import act
function act(fn: () => Promise<void>) {
  return require('@testing-library/react').act(fn)
}