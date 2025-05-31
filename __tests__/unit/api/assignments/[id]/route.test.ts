import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/assignments/[id]/route'
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
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    submission: {
      findMany: jest.fn(),
    },
  },
}))

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/assignments/[id]', () => {
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
    content: 'Test submission',
    score: 85,
    feedback: 'Good work!',
    status: 'GRADED',
    userId: 'user-id',
    assignmentId: 'assignment-id',
    submittedAt: new Date(),
    gradedAt: new Date(),
    user: {
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/assignments/[id]', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const request = new NextRequest('http://localhost/api/assignments/assignment-id', {
        method: 'GET',
      })

      const response = await GET(request, { params: { id: 'assignment-id' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns assignment with submissions when found', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findUnique.mockResolvedValue(mockAssignment)
      mockPrisma.submission.findMany.mockResolvedValue([mockSubmission])

      const request = new NextRequest('http://localhost/api/assignments/assignment-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request, { params: { id: 'assignment-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual({
        ...mockAssignment,
        submissions: [mockSubmission],
      })

      expect(mockPrisma.assignment.findUnique).toHaveBeenCalledWith({
        where: { id: 'assignment-id' },
      })
      expect(mockPrisma.submission.findMany).toHaveBeenCalledWith({
        where: { assignmentId: 'assignment-id' },
        include: {
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

    it('returns 404 when assignment not found', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.assignment.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/assignments/non-existent', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await GET(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Assignment not found')
    })
  })

  describe('PUT /api/assignments/[id]', () => {
    it('returns 403 when user is not an instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser) // STUDENT role

      const request = new NextRequest('http://localhost/api/assignments/assignment-id', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Updated Assignment',
        }),
      })

      const response = await PUT(request, { params: { id: 'assignment-id' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden: Only instructors can update assignments')
    })

    it('updates assignment when user is an instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.assignment.findUnique.mockResolvedValue(mockAssignment)
      mockPrisma.assignment.update.mockResolvedValue({
        ...mockAssignment,
        title: 'Updated Assignment',
        description: 'Updated description',
      })

      const updateData = {
        title: 'Updated Assignment',
        description: 'Updated description',
      }

      const request = new NextRequest('http://localhost/api/assignments/assignment-id', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request, { params: { id: 'assignment-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('Updated Assignment')

      expect(mockPrisma.assignment.update).toHaveBeenCalledWith({
        where: { id: 'assignment-id' },
        data: updateData,
      })
    })

    it('returns 404 when assignment not found', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.assignment.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/assignments/non-existent', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Updated Assignment',
        }),
      })

      const response = await PUT(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Assignment not found')
    })
  })

  describe('DELETE /api/assignments/[id]', () => {
    it('returns 403 when user is not an instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser) // STUDENT role

      const request = new NextRequest('http://localhost/api/assignments/assignment-id', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await DELETE(request, { params: { id: 'assignment-id' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden: Only instructors can delete assignments')
    })

    it('deletes assignment when user is an instructor', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.assignment.findUnique.mockResolvedValue(mockAssignment)
      mockPrisma.assignment.delete.mockResolvedValue(mockAssignment)

      const request = new NextRequest('http://localhost/api/assignments/assignment-id', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await DELETE(request, { params: { id: 'assignment-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Assignment deleted successfully')

      expect(mockPrisma.assignment.delete).toHaveBeenCalledWith({
        where: { id: 'assignment-id' },
      })
    })

    it('returns 404 when assignment not found', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        ...mockDecodedToken,
        uid: 'instructor-firebase-uid',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockInstructor)
      mockPrisma.assignment.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/assignments/non-existent', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const response = await DELETE(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Assignment not found')
    })
  })
})