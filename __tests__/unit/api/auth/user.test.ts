import { NextRequest } from 'next/server'
import { GET } from '@/app/api/auth/user/route'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/firebase-admin')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/auth/user', () => {
  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    firebaseUid: 'firebase-uid',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockDecodedToken = {
    uid: 'firebase-uid',
    email: 'test@example.com',
    aud: 'test-project',
    auth_time: 1234567890,
    exp: 1234567890,
    firebase: {
      identities: {},
      sign_in_provider: 'password',
    },
    iat: 1234567890,
    iss: 'https://securetoken.google.com/test-project',
    sub: 'firebase-uid',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when no authorization header is provided', async () => {
    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when authorization header does not start with Bearer', async () => {
    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Invalid token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns user data when user exists', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUser)
    
    expect(mockAdminAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'firebase-uid' },
    })
  })

  it('returns 404 when user does not exist', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('returns 500 when Firebase token verification fails', async () => {
    mockAdminAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))

    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('returns 500 when database operation fails', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
    mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('extracts token correctly from authorization header', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer complex.jwt.token.with.dots',
      },
    })

    await GET(request)

    expect(mockAdminAuth.verifyIdToken).toHaveBeenCalledWith('complex.jwt.token.with.dots')
  })

  it('uses correct Firebase UID from decoded token', async () => {
    const customDecodedToken = {
      ...mockDecodedToken,
      uid: 'different-firebase-uid',
    }

    mockAdminAuth.verifyIdToken.mockResolvedValue(customDecodedToken)
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    await GET(request)

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'different-firebase-uid' },
    })
  })
})