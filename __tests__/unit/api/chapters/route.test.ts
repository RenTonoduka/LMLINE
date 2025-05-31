import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chapters/route';
import { getAuth } from 'firebase-admin/auth';
import { query } from '@/lib/db';

jest.mock('firebase-admin/auth');
jest.mock('@/lib/db');

const mockGetAuth = getAuth as jest.Mock;
const mockQuery = query as jest.Mock;

describe('/api/chapters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chapters', () => {
    it('should create chapter when user is course creator', async () => {
      const mockUser = {
        uid: 'instructor-123',
        email: 'instructor@example.com',
      };

      const mockDbUser = {
        id: 'instructor-123',
        role: 'INSTRUCTOR',
      };

      const mockChapter = {
        id: 'chapter-123',
        title: 'Introduction to React',
        description: 'Learn React basics',
        courseId: 'course-123',
        videoUrl: 'https://example.com/video1.mp4',
        position: 1,
        isPublished: false,
        isFree: false,
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
        if (sql.includes('SELECT * FROM courses WHERE id =')) {
          return Promise.resolve({ rows: [{ id: 'course-123', creatorId: 'instructor-123' }] });
        }
        if (sql.includes('SELECT COALESCE(MAX(position), 0)')) {
          return Promise.resolve({ rows: [{ max: 0 }] });
        }
        if (sql.includes('INSERT INTO chapters')) {
          return Promise.resolve({ rows: [mockChapter] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
          title: 'Introduction to React',
          description: 'Learn React basics',
          videoUrl: 'https://example.com/video1.mp4',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Introduction to React');
      expect(data.data.position).toBe(1);
    });

    it('should auto-increment position for new chapters', async () => {
      const mockUser = {
        uid: 'instructor-123',
        email: 'instructor@example.com',
      };

      const mockDbUser = {
        id: 'instructor-123',
        role: 'INSTRUCTOR',
      };

      const mockChapter = {
        id: 'chapter-124',
        title: 'Advanced React',
        courseId: 'course-123',
        position: 3,
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
        if (sql.includes('SELECT * FROM courses WHERE id =')) {
          return Promise.resolve({ rows: [{ id: 'course-123', creatorId: 'instructor-123' }] });
        }
        if (sql.includes('SELECT COALESCE(MAX(position), 0)')) {
          return Promise.resolve({ rows: [{ max: 2 }] });
        }
        if (sql.includes('INSERT INTO chapters')) {
          return Promise.resolve({ rows: [mockChapter] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
          title: 'Advanced React',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.position).toBe(3);
    });

    it('should return 403 when user is not course creator', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
          title: 'Unauthorized Chapter',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should allow admin to create chapter for any course', async () => {
      const mockUser = {
        uid: 'admin-123',
        email: 'admin@example.com',
      };

      const mockDbUser = {
        id: 'admin-123',
        role: 'ADMIN',
      };

      const mockChapter = {
        id: 'chapter-125',
        title: 'Admin Chapter',
        courseId: 'course-123',
        position: 1,
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
        if (sql.includes('SELECT COALESCE(MAX(position), 0)')) {
          return Promise.resolve({ rows: [{ max: 0 }] });
        }
        if (sql.includes('INSERT INTO chapters')) {
          return Promise.resolve({ rows: [mockChapter] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
          title: 'Admin Chapter',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should return 400 when required fields missing', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Chapter without course',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Course ID and title are required');
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

      const request = new NextRequest('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'nonexistent-course',
          title: 'Chapter for nonexistent course',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Course not found');
    });
  });
});