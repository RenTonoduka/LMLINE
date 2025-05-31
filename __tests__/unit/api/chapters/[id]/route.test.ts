import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/chapters/[id]/route';
import { getAuth } from 'firebase-admin/auth';
import { query } from '@/lib/db';

jest.mock('firebase-admin/auth');
jest.mock('@/lib/db');

const mockGetAuth = getAuth as jest.Mock;
const mockQuery = query as jest.Mock;

describe('/api/chapters/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/chapters/[id]', () => {
    it('should update chapter when user is course creator', async () => {
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
        title: 'Updated Chapter Title',
        description: 'Updated description',
        videoUrl: 'https://example.com/new-video.mp4',
        courseId: 'course-123',
        updatedAt: new Date(),
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('SELECT ch.*, c."creatorId"')) {
          return Promise.resolve({ 
            rows: [{ 
              id: 'chapter-123', 
              courseId: 'course-123', 
              creatorId: 'instructor-123' 
            }] 
          });
        }
        if (sql.includes('UPDATE chapters')) {
          return Promise.resolve({ rows: [mockChapter] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Updated Chapter Title',
          description: 'Updated description',
          videoUrl: 'https://example.com/new-video.mp4',
        }),
      });

      const response = await PUT(request, { params: { id: 'chapter-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Chapter Title');
      expect(data.data.videoUrl).toBe('https://example.com/new-video.mp4');
    });

    it('should update video URL separately', async () => {
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
        videoUrl: 'https://example.com/updated-video.mp4',
        updatedAt: new Date(),
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('SELECT ch.*, c."creatorId"')) {
          return Promise.resolve({ 
            rows: [{ 
              id: 'chapter-123', 
              courseId: 'course-123', 
              creatorId: 'instructor-123' 
            }] 
          });
        }
        if (sql.includes('UPDATE chapters')) {
          return Promise.resolve({ rows: [mockChapter] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          videoUrl: 'https://example.com/updated-video.mp4',
        }),
      });

      const response = await PUT(request, { params: { id: 'chapter-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.videoUrl).toBe('https://example.com/updated-video.mp4');
    });

    it('should allow admin to update any chapter', async () => {
      const mockUser = {
        uid: 'admin-123',
        email: 'admin@example.com',
      };

      const mockDbUser = {
        id: 'admin-123',
        role: 'ADMIN',
      };

      const mockChapter = {
        id: 'chapter-123',
        title: 'Admin Updated',
        updatedAt: new Date(),
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockDbUser] });
        }
        if (sql.includes('UPDATE chapters')) {
          return Promise.resolve({ rows: [mockChapter] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Admin Updated',
        }),
      });

      const response = await PUT(request, { params: { id: 'chapter-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 403 when non-creator tries to update', async () => {
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
        if (sql.includes('SELECT ch.*, c."creatorId"')) {
          return Promise.resolve({ 
            rows: [{ 
              id: 'chapter-123', 
              courseId: 'course-123', 
              creatorId: 'instructor-123' 
            }] 
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Unauthorized Update',
        }),
      });

      const response = await PUT(request, { params: { id: 'chapter-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('should return 404 when chapter not found', async () => {
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
        if (sql.includes('SELECT ch.*, c."creatorId"')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters/nonexistent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Update nonexistent',
        }),
      });

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Chapter not found');
    });
  });

  describe('DELETE /api/chapters/[id]', () => {
    it('should delete chapter when user is course creator', async () => {
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
        if (sql.includes('SELECT ch.*, c."creatorId"')) {
          return Promise.resolve({ 
            rows: [{ 
              id: 'chapter-123', 
              courseId: 'course-123', 
              creatorId: 'instructor-123' 
            }] 
          });
        }
        if (sql.includes('DELETE FROM chapters')) {
          return Promise.resolve({ rows: [{ id: 'chapter-123' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      const response = await DELETE(request, { params: { id: 'chapter-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Chapter deleted successfully');
    });

    it('should allow admin to delete any chapter', async () => {
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
        if (sql.includes('DELETE FROM chapters')) {
          return Promise.resolve({ rows: [{ id: 'chapter-123' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const request = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      const response = await DELETE(request, { params: { id: 'chapter-123' } });
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

      const request = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      const response = await DELETE(request, { params: { id: 'chapter-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });
});