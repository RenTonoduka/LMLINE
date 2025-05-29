import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '@/contexts/auth-context'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { toast } from 'react-hot-toast'

// Mock Firebase auth
jest.mock('firebase/auth')
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))
jest.mock('react-hot-toast')

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>
const mockFirebaseSignOut = firebaseSignOut as jest.MockedFunction<typeof firebaseSignOut>
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>
const mockToast = toast as jest.Mocked<typeof toast>

// Mock fetch globally
global.fetch = jest.fn()

const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
}

const TestComponent = () => {
  const auth = useAuthContext()
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'no-user'}</div>
      <div data-testid="db-user">{auth.dbUser ? auth.dbUser.email : 'no-db-user'}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => auth.signUp('test@example.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={() => auth.signInWithGoogle()}>Google Sign In</button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockToast.success = jest.fn()
    mockToast.error = jest.fn()
    
    // Mock fetch by default
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'db-user-id', email: 'test@example.com' }),
    })
  })

  it('provides auth context to children', () => {
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn() // unsubscribe function
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')

    // Simulate user sign in
    act(() => {
      authStateListener(mockUser)
    })

    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
  })

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuthContext must be used within an AuthProvider')

    consoleError.mockRestore()
  })

  it('handles sign in', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({} as any)
    
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initial state
    act(() => {
      authStateListener(null)
    })

    const signInButton = screen.getByText('Sign In')
    
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      )
    })

    expect(mockToast.success).toHaveBeenCalledWith('ログインしました')
  })

  it('handles sign in error', async () => {
    const error = { code: 'auth/user-not-found' }
    mockSignInWithEmailAndPassword.mockRejectedValue(error)
    
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('ユーザーが見つかりません')
    })
  })

  it('handles sign up', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    } as any)
    mockUpdateProfile.mockResolvedValue()
    
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signUpButton = screen.getByText('Sign Up')
    
    await act(async () => {
      signUpButton.click()
    })

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      )
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' })
    })

    expect(mockToast.success).toHaveBeenCalledWith('アカウントを作成しました')
  })

  it('handles Google sign in', async () => {
    mockSignInWithPopup.mockResolvedValue({} as any)
    
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const googleSignInButton = screen.getByText('Google Sign In')
    
    await act(async () => {
      googleSignInButton.click()
    })

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled()
    })

    expect(mockToast.success).toHaveBeenCalledWith('Googleアカウントでログインしました')
  })

  it('handles sign out', async () => {
    mockFirebaseSignOut.mockResolvedValue()
    
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    
    await act(async () => {
      signOutButton.click()
    })

    await waitFor(() => {
      expect(mockFirebaseSignOut).toHaveBeenCalled()
    })

    expect(mockToast.success).toHaveBeenCalledWith('ログアウトしました')
  })

  it('syncs user with database on auth state change', async () => {
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      authStateListener(mockUser)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify({
          email: mockUser.email,
          name: mockUser.displayName,
          image: mockUser.photoURL,
          firebaseUid: mockUser.uid,
          emailVerified: mockUser.emailVerified,
        }),
      })
    })
  })

  it('handles database sync error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    
    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      authStateListener(mockUser)
    })

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error syncing user with database:', expect.any(Error))
    })

    consoleError.mockRestore()
  })

  it('provides correct error messages', async () => {
    const errorCodes = [
      ['auth/user-not-found', 'ユーザーが見つかりません'],
      ['auth/wrong-password', 'パスワードが間違っています'],
      ['auth/email-already-in-use', 'このメールアドレスは既に使用されています'],
      ['auth/weak-password', 'パスワードは6文字以上で入力してください'],
      ['auth/invalid-email', 'メールアドレスの形式が正しくありません'],
      ['auth/popup-closed-by-user', 'ログインがキャンセルされました'],
      ['unknown-error', 'エラーが発生しました'],
    ]

    let authStateListener: (user: any) => void = () => {}
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback
      return jest.fn()
    })

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    for (const [errorCode, expectedMessage] of errorCodes) {
      const error = { code: errorCode }
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      const signInButton = screen.getByText('Sign In')
      
      await act(async () => {
        signInButton.click()
      })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(expectedMessage)
      })

      jest.clearAllMocks()
      mockToast.error = jest.fn()
    }
  })
})