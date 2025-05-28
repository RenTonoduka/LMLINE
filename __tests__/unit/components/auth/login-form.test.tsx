import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { useAuth } from '@/hooks/useAuth'

// Mock modules
jest.mock('next/navigation')
jest.mock('@/hooks/useAuth')

const mockPush = jest.fn()
const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('LoginForm', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with all elements', () => {
    render(<LoginForm />)

    expect(screen.getByRole('heading', { name: /ログイン/i })).toBeInTheDocument()
    expect(screen.getByText(/アカウントにログインして学習を続けましょう/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /googleでログイン/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^ログイン$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /パスワードを忘れた方/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /新規登録/i })).toBeInTheDocument()
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /^ログイン$/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /^ログイン$/i })

    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/有効なメールアドレスを入力してください/i)).toBeInTheDocument()
      expect(screen.getByText(/パスワードは6文字以上で入力してください/i)).toBeInTheDocument()
    })

    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/パスワード/i)
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('handles Google sign in', async () => {
    const user = userEvent.setup()
    mockSignInWithGoogle.mockResolvedValue(undefined)

    render(<LoginForm />)

    const googleButton = screen.getByRole('button', { name: /googleでログイン/i })
    await user.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled()
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('disables form elements during loading', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /^ログイン$/i })
    const googleButton = screen.getByRole('button', { name: /googleでログイン/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(googleButton).toBeDisabled()
    })
  })

  it('shows loading spinner during form submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /^ログイン$/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ログイン/i })).toBeDisabled()
    })
  })

  it('shows loading spinner during Google sign in', async () => {
    const user = userEvent.setup()
    mockSignInWithGoogle.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<LoginForm />)

    const googleButton = screen.getByRole('button', { name: /googleでログイン/i })
    await user.click(googleButton)

    await waitFor(() => {
      expect(googleButton).toBeDisabled()
    })
  })

  it('handles sign in error gracefully', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Sign in failed'))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /^ログイン$/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })

    // Form should be re-enabled after error
    expect(emailInput).not.toBeDisabled()
    expect(passwordInput).not.toBeDisabled()
    expect(submitButton).not.toBeDisabled()
  })

  it('handles Google sign in error gracefully', async () => {
    const user = userEvent.setup()
    mockSignInWithGoogle.mockRejectedValue(new Error('Google sign in failed'))

    render(<LoginForm />)

    const googleButton = screen.getByRole('button', { name: /googleでログイン/i })
    await user.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled()
    })

    // Button should be re-enabled after error
    expect(googleButton).not.toBeDisabled()
  })

  it('has correct navigation links', () => {
    render(<LoginForm />)

    const forgotPasswordLink = screen.getByRole('link', { name: /パスワードを忘れた方/i })
    const registerLink = screen.getByRole('link', { name: /新規登録/i })

    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
    expect(registerLink).toHaveAttribute('href', '/auth/register')
  })
})