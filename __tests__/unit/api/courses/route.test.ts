import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/courses/route';
import { getAuth } from 'firebase-admin/auth';
import { query } from '@/lib/db';

jest.mock('firebase-admin/auth');
jest.mock('@/lib/db');

const mockGetAuth = getAuth as jest.Mock;
const mockQuery = query as jest.Mock;

describe('/api/courses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/courses', () => {
    it('should create a new course when user is instructor', async () => {
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
        title: 'Test Course',
        description: 'Test Description',
        categoryId: 'category-123',
        creatorId: 'instructor-123',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('INSERT INTO courses')) {
          return Promise.resolve({ rows: [mockCourse] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Test Course',
          description: 'Test Description',
          categoryId: 'category-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Test Course');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO courses'),
        expect.any(Array)
      );
    });

    it('should return 403 when user is student', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Test Course',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should return 401 when no authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Course',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when title is missing', async () => {
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

      mockQuery.mockResolvedValue({ rows: [mockDbUser] });

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Title is required');
    });
  });

  describe('PUT /api/courses', () => {
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

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
          title: 'Updated Course',
          description: 'Updated Description',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Course');
    });

    it('should return 403 when user is not the creator', async () => {
      const mockUser = {
        uid: 'other-instructor',
        email: 'other@example.com',
      };

      const mockDbUser = {
        id: 'other-instructor',
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

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
          title: 'Updated Course',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });
  });

  describe('DELETE /api/courses', () => {
    it('should delete course when user is admin', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Course deleted successfully');
    });

    it('should allow creator to delete their own course', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});