import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/courses/[id]/route';
import { getAuth } from 'firebase-admin/auth';
import { query } from '@/lib/db';

jest.mock('firebase-admin/auth');
jest.mock('@/lib/db');

const mockGetAuth = getAuth as jest.Mock;
const mockQuery = query as jest.Mock;

describe('/api/courses/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/courses/[id]', () => {
    it('should update course when user is the creator', async () => {
      const mockUser = {
        uid: 'instructor-123',
        email: 'instructor@example.com',
      };

      const mockDbUser = {
        id: 'instructor-123',
        role: 'INSTRUCTOR',
      };

      const mockCourse = {
        id: 'course-123',
        title: 'Updated Course',
        description: 'Updated Description',
        creatorId: 'instructor-123',
        updatedAt: new Date(),
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('SELECT * FROM courses WHERE id =')) {
          return Promise.resolve({ rows: [{ id: 'course-123', creatorId: 'instructor-123' }] });
        }
        if (sql.includes('UPDATE courses')) {
          return Promise.resolve({ rows: [mockCourse] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/courses/course-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Updated Course',
          description: 'Updated Description',
        }),
      });

      const response = await PUT(request, { params: { id: 'course-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Course');
    });

    it('should allow admin to update any course', async () => {
      const mockUser = {
        uid: 'admin-123',
        email: 'admin@example.com',
      };

      const mockDbUser = {
        id: 'admin-123',
        role: 'ADMIN',
      };

      const mockCourse = {
        id: 'course-123',
        title: 'Admin Updated Course',
        creatorId: 'instructor-123',
        updatedAt: new Date(),
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('UPDATE courses')) {
          return Promise.resolve({ rows: [mockCourse] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/courses/course-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Admin Updated Course',
        }),
      });

      const response = await PUT(request, { params: { id: 'course-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 403 when instructor tries to update another course', async () => {
      const mockUser = {
        uid: 'instructor-456',
        email: 'other@example.com',
      };

      const mockDbUser = {
        id: 'instructor-456',
        role: 'INSTRUCTOR',
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('SELECT * FROM courses WHERE id =')) {
          return Promise.resolve({ rows: [{ id: 'course-123', creatorId: 'instructor-123' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/courses/course-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Trying to update',
        }),
      });

      const response = await PUT(request, { params: { id: 'course-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('should return 404 when course not found', async () => {
      const mockUser = {
        uid: 'instructor-123',
        email: 'instructor@example.com',
      };

      const mockDbUser = {
        id: 'instructor-123',
        role: 'INSTRUCTOR',
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('SELECT * FROM courses WHERE id =')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/courses/nonexistent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Update attempt',
        }),
      });

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Course not found');
    });
  });

  describe('DELETE /api/courses/[id]', () => {
    it('should delete course when user is the creator', async () => {
      const mockUser = {
        uid: 'instructor-123',
        email: 'instructor@example.com',
      };

      const mockDbUser = {
        id: 'instructor-123',
        role: 'INSTRUCTOR',
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('SELECT * FROM courses WHERE id =')) {
          return Promise.resolve({ rows: [{ id: 'course-123', creatorId: 'instructor-123' }] });
        }
        if (sql.includes('DELETE FROM courses')) {
          return Promise.resolve({ rows: [{ id: 'course-123' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/courses/course-123', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      const response = await DELETE(request, { params: { id: 'course-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Course deleted successfully');
    });

    it('should allow admin to delete any course', async () => {
      const mockUser = {
        uid: 'admin-123',
        email: 'admin@example.com',
      };

      const mockDbUser = {
        id: 'admin-123',
        role: 'ADMIN',
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('DELETE FROM courses')) {
          return Promise.resolve({ rows: [{ id: 'course-123' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/courses/course-123', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      const response = await DELETE(request, { params: { id: 'course-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 403 when student tries to delete', async () => {
      const mockUser = {
        uid: 'student-123',
        email: 'student@example.com',
      };

      const mockDbUser = {
        id: 'student-123',
        role: 'STUDENT',
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockResolvedValue({ rows: [mockDbUser] });

      const request = new NextRequest('http://localhost:3000/api/courses/course-123', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      const response = await DELETE(request, { params: { id: 'course-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });
});