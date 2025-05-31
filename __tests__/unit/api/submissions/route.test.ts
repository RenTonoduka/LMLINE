import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/submissions/route'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/firebase-admin')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    submission: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    assignment: {
      findUnique: jest.fn(),
    },
  },
}))

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/submissions', () => {
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

  const mockSubmission = {
    id: 'submission-id',
    content: 'Test submission content',
    score: null,
    feedback: null,
    status: 'SUBMITTED',
    userId: 'user-id',
    assignmentId: 'assignment-id',
    submittedAt: new Date(),
    gradedAt: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/submissions', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns submissions for a specific assignment', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.submission.findMany.mockResolvedValue([mockSubmission])

      const request = new NextRequest('http://localhost/api/submissions?assignmentId=assignment-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([mockSubmission])

      expect(mockPrisma.submission.findMany).toHaveBeenCalledWith({
        where: { assignmentId: 'assignment-id' },
        include: {
          assignment: {
            select: {
              title: true,
              courseId: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      })
    })

    it('returns submissions for a specific user when userId is provided', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.submission.findMany.mockResolvedValue([mockSubmission])

      const request = new NextRequest('http://localhost/api/submissions?userId=user-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      expect(mockPrisma.submission.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: {
          assignment: {
            select: {
              title: true,
              courseId: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      })
    })

    it('returns only user\'s own submissions when not instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser) // STUDENT role
      mockPrisma.submission.findMany.mockResolvedValue([mockSubmission])

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request)
      await response.json()

      expect(mockPrisma.submission.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' }, // Should filter by user's own ID
        include: expect.any(Object),
        orderBy: { submittedAt: 'desc' },
      })
    })
  })

  describe('POST /api/submissions', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: 'assignment-id',
          content: 'My submission',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('creates a new submission', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findUnique.mockResolvedValue(mockAssignment)
      mockPrisma.submission.findFirst.mockResolvedValue(null) // No existing submission
      mockPrisma.submission.create.mockResolvedValue(mockSubmission)

      const requestBody = {
        assignmentId: 'assignment-id',
        content: 'My submission content',
      }

      const request = new NextRequest('http://localhost/api/submissions', {
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
      expect(data.data).toEqual(mockSubmission)

      expect(mockPrisma.submission.create).toHaveBeenCalledWith({
        data: {
          assignmentId: requestBody.assignmentId,
          content: requestBody.content,
          userId: 'user-id',
          status: 'SUBMITTED',
        },
      })
    })

    it('returns 400 when assignment does not exist', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          assignmentId: 'non-existent',
          content: 'My submission',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Assignment not found')
    })

    it('returns 400 when user already submitted', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findUnique.mockResolvedValue(mockAssignment)
      mockPrisma.submission.findFirst.mockResolvedValue(mockSubmission) // Existing submission

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          assignmentId: 'assignment-id',
          content: 'My submission',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('You have already submitted this assignment')
    })

    it('returns 400 when required fields are missing', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          content: 'My submission',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Bad Request: Missing required fields')
    })
  })
})