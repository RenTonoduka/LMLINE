import React from 'react'
import { renderHook } from '@testing-library/react'
import { useAuth, useAuthContext } from '@/hooks/useAuth'
import { AuthProvider } from '@/contexts/auth-context'

// Mock the auth context
const mockAuthContext = {
  user: null,
  dbUser: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  signInWithGoogle: jest.fn(),
}

jest.mock('@/contexts/auth-context', () => ({
  ...jest.requireActual('@/contexts/auth-context'),
  useAuthContext: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('useAuth Hook', () => {
  it('returns auth context', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current).toBe(mockAuthContext)
    expect(result.current.user).toBe(null)
    expect(result.current.loading).toBe(false)
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
    expect(typeof result.current.signInWithGoogle).toBe('function')
  })

  it('exports useAuthContext', () => {
    expect(useAuthContext).toBeDefined()
    expect(typeof useAuthContext).toBe('function')
  })
})