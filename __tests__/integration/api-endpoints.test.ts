import { NextRequest } from 'next/server'
import { POST as syncPOST } from '@/app/api/auth/sync/route'
import { GET as userGET } from '@/app/api/auth/user/route'
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

describe('API Endpoints Integration Tests', () => {
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
    mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
  })

  describe('User Registration Flow', () => {
    it('creates new user and retrieves user data', async () => {
      // Mock user doesn't exist initially
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      // Mock user creation
      mockPrisma.user.create.mockResolvedValue(mockUser)
      // Mock user retrieval after creation
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser)

      // Step 1: Sync user (registration)
      const syncRequest = new NextRequest('http://localhost/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          image: null,
          firebaseUid: 'firebase-uid',
          emailVerified: true,
        }),
      })

      const syncResponse = await syncPOST(syncRequest)
      const syncData = await syncResponse.json()

      expect(syncResponse.status).toBe(200)
      expect(syncData).toEqual(mockUser)
      expect(mockPrisma.user.create).toHaveBeenCalled()

      // Step 2: Fetch user data
      const userRequest = new NextRequest('http://localhost/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const userResponse = await userGET(userRequest)
      const userData = await userResponse.json()

      expect(userResponse.status).toBe(200)
      expect(userData).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid' },
      })
    })
  })

  describe('User Login Flow', () => {
    it('updates existing user and retrieves updated data', async () => {
      // Mock user exists
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser)
      // Mock user update
      const updatedUser = { ...mockUser, name: 'Updated Name' }
      mockPrisma.user.update.mockResolvedValue(updatedUser)
      // Mock user retrieval after update
      mockPrisma.user.findUnique.mockResolvedValueOnce(updatedUser)

      // Step 1: Sync user (login with updated info)
      const syncRequest = new NextRequest('http://localhost/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Updated Name',
          image: null,
          firebaseUid: 'firebase-uid',
          emailVerified: true,
        }),
      })

      const syncResponse = await syncPOST(syncRequest)
      const syncData = await syncResponse.json()

      expect(syncResponse.status).toBe(200)
      expect(syncData.name).toBe('Updated Name')
      expect(mockPrisma.user.update).toHaveBeenCalled()

      // Step 2: Fetch updated user data
      const userRequest = new NextRequest('http://localhost/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const userResponse = await userGET(userRequest)
      const userData = await userResponse.json()

      expect(userResponse.status).toBe(200)
      expect(userData.name).toBe('Updated Name')
    })
  })

  describe('Authentication Error Scenarios', () => {
    it('handles invalid token across endpoints', async () => {
      mockAdminAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))

      // Test sync endpoint
      const syncRequest = new NextRequest('http://localhost/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const syncResponse = await syncPOST(syncRequest)
      expect(syncResponse.status).toBe(500)

      // Test user endpoint
      const userRequest = new NextRequest('http://localhost/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })

      const userResponse = await userGET(userRequest)
      expect(userResponse.status).toBe(500)
    })

    it('handles missing authorization across endpoints', async () => {
      // Test sync endpoint
      const syncRequest = new NextRequest('http://localhost/api/auth/sync', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const syncResponse = await syncPOST(syncRequest)
      expect(syncResponse.status).toBe(401)

      // Test user endpoint
      const userRequest = new NextRequest('http://localhost/api/auth/user', {
        method: 'GET',
      })

      const userResponse = await userGET(userRequest)
      expect(userResponse.status).toBe(401)
    })
  })

  describe('Database Error Scenarios', () => {
    it('handles database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

      // Test sync endpoint
      const syncRequest = new NextRequest('http://localhost/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          firebaseUid: 'firebase-uid',
          emailVerified: true,
        }),
      })

      const syncResponse = await syncPOST(syncRequest)
      expect(syncResponse.status).toBe(500)

      // Test user endpoint
      const userRequest = new NextRequest('http://localhost/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const userResponse = await userGET(userRequest)
      expect(userResponse.status).toBe(500)
    })
  })

  describe('Data Consistency', () => {
    it('maintains data consistency between sync and user endpoints', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/photo.jpg',
        firebaseUid: 'firebase-uid',
        emailVerified: true,
      }

      // Mock user creation
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, ...userData })
      mockPrisma.user.findUnique.mockResolvedValueOnce({ ...mockUser, ...userData })

      // Sync user data
      const syncRequest = new NextRequest('http://localhost/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const syncResponse = await syncPOST(syncRequest)
      const syncData = await syncResponse.json()

      // Fetch user data
      const userRequest = new NextRequest('http://localhost/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const userResponse = await userGET(userRequest)
      const fetchedData = await userResponse.json()

      // Data should be consistent
      expect(syncData.email).toBe(fetchedData.email)
      expect(syncData.name).toBe(fetchedData.name)
      expect(syncData.image).toBe(fetchedData.image)
      expect(syncData.firebaseUid).toBe(fetchedData.firebaseUid)
      expect(syncData.emailVerified).toBe(fetchedData.emailVerified)
    })
  })

  describe('Edge Cases', () => {
    it('handles user not found after sync', async () => {
      // User sync succeeds
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      mockPrisma.user.create.mockResolvedValue(mockUser)

      const syncRequest = new NextRequest('http://localhost/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          firebaseUid: 'firebase-uid',
          emailVerified: true,
        }),
      })

      const syncResponse = await syncPOST(syncRequest)
      expect(syncResponse.status).toBe(200)

      // But user fetch fails (user was deleted between sync and fetch)
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)

      const userRequest = new NextRequest('http://localhost/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const userResponse = await userGET(userRequest)
      expect(userResponse.status).toBe(404)

      const userData = await userResponse.json()
      expect(userData.error).toBe('User not found')
    })
  })
})