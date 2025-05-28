import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/sync/route'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/firebase-admin')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/auth/sync', () => {
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

  const mockRequestBody = {
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    firebaseUid: 'firebase-uid',
    emailVerified: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when no authorization header is provided', async () => {
    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify(mockRequestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when authorization header does not start with Bearer', async () => {
    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': 'Invalid token',
      },
      body: JSON.stringify(mockRequestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('creates a new user when user does not exist', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid',
      email: 'test@example.com',
    } as any)

    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUser)
    
    expect(mockAdminAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'firebase-uid' },
    })
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: mockRequestBody,
    })
  })

  it('updates existing user when user exists', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid',
      email: 'test@example.com',
    } as any)

    mockPrisma.user.findUnique.mockResolvedValue(mockUser)
    mockPrisma.user.update.mockResolvedValue({
      ...mockUser,
      name: 'Updated Name',
    })

    const updatedRequestBody = {
      ...mockRequestBody,
      name: 'Updated Name',
    }

    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRequestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('Updated Name')
    
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'firebase-uid' },
    })
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { firebaseUid: 'firebase-uid' },
      data: {
        email: 'test@example.com',
        name: 'Updated Name',
        image: null,
        emailVerified: true,
      },
    })
  })

  it('returns 500 when Firebase token verification fails', async () => {
    mockAdminAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))

    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('returns 500 when database operation fails', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid',
      email: 'test@example.com',
    } as any)

    mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('handles missing request body gracefully', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid',
      email: 'test@example.com',
    } as any)

    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: '{}',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('extracts token correctly from authorization header', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid',
      email: 'test@example.com',
    } as any)

    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer complex.jwt.token.with.dots',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestBody),
    })

    await POST(request)

    expect(mockAdminAuth.verifyIdToken).toHaveBeenCalledWith('complex.jwt.token.with.dots')
  })
})