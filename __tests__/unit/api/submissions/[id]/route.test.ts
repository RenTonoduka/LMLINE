import { NextRequest } from 'next/server'
import { GET, PUT } from '@/app/api/submissions/[id]/route'
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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/submissions/[id]', () => {
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
    user: {
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
    assignment: {
      id: 'assignment-id',
      title: 'Test Assignment',
      maxScore: 100,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/submissions/[id]', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const request = new NextRequest('http://localhost/api/submissions/submission-id', {
        method: 'GET',
      })

      const response = await GET(request, { params: { id: 'submission-id' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns submission when user owns it', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.submission.findUnique.mockResolvedValue(mockSubmission)

      const request = new NextRequest('http://localhost/api/submissions/submission-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request, { params: { id: 'submission-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockSubmission)
    })

    it('returns 403 when student tries to access another user\'s submission', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.submission.findUnique.mockResolvedValue({
        ...mockSubmission,
        userId: 'another-user-id',
      })

      const request = new NextRequest('http://localhost/api/submissions/submission-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request, { params: { id: 'submission-id' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden: You can only view your own submissions')
    })

    it('allows instructor to view any submission', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.submission.findUnique.mockResolvedValue(mockSubmission)

      const request = new NextRequest('http://localhost/api/submissions/submission-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request, { params: { id: 'submission-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockSubmission)
    })

    it('returns 404 when submission not found', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.submission.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/submissions/non-existent', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Submission not found')
    })
  })

  describe('PUT /api/submissions/[id]', () => {
    it('returns 403 when student tries to grade', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser) // STUDENT role

      const request = new NextRequest('http://localhost/api/submissions/submission-id', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          score: 85,
          feedback: 'Good work!',
        }),
      })

      const response = await PUT(request, { params: { id: 'submission-id' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden: Only instructors can grade submissions')
    })

    it('grades submission when user is instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.submission.findUnique.mockResolvedValue(mockSubmission)
      mockPrisma.submission.update.mockResolvedValue({
        ...mockSubmission,
        score: 85,
        feedback: 'Good work!',
        status: 'GRADED',
        gradedAt: new Date(),
      })

      const gradeData = {
        score: 85,
        feedback: 'Good work!',
      }

      const request = new NextRequest('http://localhost/api/submissions/submission-id', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify(gradeData),
      })

      const response = await PUT(request, { params: { id: 'submission-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.score).toBe(85)
      expect(data.data.feedback).toBe('Good work!')
      expect(data.data.status).toBe('GRADED')

      expect(mockPrisma.submission.update).toHaveBeenCalledWith({
        where: { id: 'submission-id' },
        data: {
          score: 85,
          feedback: 'Good work!',
          status: 'GRADED',
          gradedAt: expect.any(Date),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              maxScore: true,
            },
          },
        },
      })
    })

    it('validates score is within range', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.submission.findUnique.mockResolvedValue(mockSubmission)

      const request = new NextRequest('http://localhost/api/submissions/submission-id', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          score: 150, // Over max score
          feedback: 'Good work!',
        }),
      })

      const response = await PUT(request, { params: { id: 'submission-id' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Score cannot exceed maximum score of 100')
    })

    it('returns 404 when submission not found', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.submission.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/submissions/non-existent', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          score: 85,
        }),
      })

      const response = await PUT(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Submission not found')
    })
  })
})