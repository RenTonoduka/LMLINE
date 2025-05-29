import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/auth/register-form'
import { useAuth } from '@/hooks/useAuth'

// Mock modules
jest.mock('next/navigation')
jest.mock('@/hooks/useAuth')

const mockPush = jest.fn()
const mockSignUp = jest.fn()

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('RegisterForm', () => {
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
      signIn: jest.fn(),
      signUp: mockSignUp,
      signOut: jest.fn(),
      updateProfile: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders registration form with all elements', () => {
    render(<RegisterForm />)

    expect(screen.getByRole('heading', { name: /新規登録/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/姓/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^パスワード$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード確認/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /アカウント作成/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ログイン/i })).toBeInTheDocument()
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/姓/i), '田中')
    await user.type(screen.getByLabelText(/名/i), '太郎')
    await user.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^パスワード$/i), 'password123')
    await user.type(screen.getByLabelText(/パスワード確認/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        '田中 太郎'
      )
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/姓は必須です/i)).toBeInTheDocument()
      expect(screen.getByText(/名は必須です/i)).toBeInTheDocument()
      expect(screen.getByText(/有効なメールアドレスを入力してください/i)).toBeInTheDocument()
      expect(screen.getByText(/パスワードは6文字以上で入力してください/i)).toBeInTheDocument()
    })

    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/^パスワード$/i), 'password123')
    await user.type(screen.getByLabelText(/パスワード確認/i), 'different123')

    const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/パスワードが一致しません/i)).toBeInTheDocument()
    })

    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('disables form elements during loading', async () => {
    const user = userEvent.setup()
    mockSignUp.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/姓/i), '田中')
    await user.type(screen.getByLabelText(/名/i), '太郎')
    await user.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^パスワード$/i), 'password123')
    await user.type(screen.getByLabelText(/パスワード確認/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/姓/i)).toBeDisabled()
      expect(screen.getByLabelText(/名/i)).toBeDisabled()
      expect(screen.getByLabelText(/メールアドレス/i)).toBeDisabled()
      expect(screen.getByLabelText(/^パスワード$/i)).toBeDisabled()
      expect(screen.getByLabelText(/パスワード確認/i)).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  it('handles registration error gracefully', async () => {
    const user = userEvent.setup()
    mockSignUp.mockRejectedValue(new Error('Registration failed'))

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/姓/i), '田中')
    await user.type(screen.getByLabelText(/名/i), '太郎')
    await user.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^パスワード$/i), 'password123')
    await user.type(screen.getByLabelText(/パスワード確認/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled()
    })

    // Form should be re-enabled after error
    expect(screen.getByLabelText(/メールアドレス/i)).not.toBeDisabled()
    expect(submitButton).not.toBeDisabled()
  })

  it('has correct navigation link to login', () => {
    render(<RegisterForm />)

    const loginLink = screen.getByRole('link', { name: /ログイン/i })
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/メールアドレス/i), 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/有効なメールアドレスを入力してください/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/^パスワード$/i), '123')
    
    const submitButton = screen.getByRole('button', { name: /アカウント作成/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/パスワードは6文字以上で入力してください/i)).toBeInTheDocument()
    })
  })
})