import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/assignments/route'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/firebase-admin')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    assignment: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}))

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/assignments', () => {
  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    firebaseUid: 'firebase-uid',
    emailVerified: true,
    role: 'STUDENT',
    isActive: true,
    lineUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockInstructor = {
    ...mockUser,
    id: 'instructor-id',
    role: 'INSTRUCTOR',
    firebaseUid: 'instructor-firebase-uid',
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

  const mockAssignment = {
    id: 'assignment-id',
    title: 'Test Assignment',
    description: 'Test assignment description',
    dueDate: new Date('2024-12-31'),
    maxScore: 100,
    courseId: 'course-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/assignments', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns assignments for a specific course', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findMany.mockResolvedValue([mockAssignment])
      mockPrisma.assignment.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost/api/assignments?courseId=course-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([mockAssignment])
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      })

      expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-id' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('returns all assignments when no courseId is provided', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findMany.mockResolvedValue([mockAssignment])
      mockPrisma.assignment.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([mockAssignment])

      expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('supports pagination', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findMany.mockResolvedValue([])
      mockPrisma.assignment.count.mockResolvedValue(25)

      const request = new NextRequest('http://localhost/api/assignments?page=2&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3,
      })

      expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      })
    })
  })

  describe('POST /api/assignments', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Assignment',
          description: 'Assignment description',
          courseId: 'course-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 403 when user is not an instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser) // STUDENT role

      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'New Assignment',
          description: 'Assignment description',
          courseId: 'course-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden: Only instructors can create assignments')
    })

    it('creates a new assignment when user is an instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.assignment.create.mockResolvedValue(mockAssignment)

      const requestBody = {
        title: 'New Assignment',
        description: 'Assignment description',
        courseId: 'course-id',
        dueDate: '2024-12-31T23:59:59.000Z',
        maxScore: 100,
      }

      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockAssignment)

      expect(mockPrisma.assignment.create).toHaveBeenCalledWith({
        data: {
          title: requestBody.title,
          description: requestBody.description,
          courseId: requestBody.courseId,
          dueDate: new Date(requestBody.dueDate),
          maxScore: requestBody.maxScore,
        },
      })
    })

    it('returns 400 when required fields are missing', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)

      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          description: 'Assignment description',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Bad Request: Missing required fields')
    })

    it('handles database errors gracefully', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.assignment.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'New Assignment',
          description: 'Assignment description',
          courseId: 'course-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})