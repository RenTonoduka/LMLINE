import { NextRequest } from 'next/server';
import { POST as createCourse, PUT as updateCourse, DELETE as deleteCourse } from '@/app/api/courses/route';
import { POST as createChapter } from '@/app/api/chapters/route';
import { PUT as updateChapter, DELETE as deleteChapter } from '@/app/api/chapters/[id]/route';
import { getAuth } from 'firebase-admin/auth';
import { query } from '@/lib/db';

jest.mock('firebase-admin/auth');
jest.mock('@/lib/db');

const mockGetAuth = getAuth as jest.Mock;
const mockQuery = query as jest.Mock;

describe('Video Management Integration Tests', () => {
  const mockInstructor = {
    uid: 'instructor-123',
    email: 'instructor@example.com',
  };

  const mockInstructorDb = {
    id: 'instructor-123',
    role: 'INSTRUCTOR',
    name: 'Test Instructor',
  };

  const mockAdmin = {
    uid: 'admin-123',
    email: 'admin@example.com',
  };

  const mockAdminDb = {
    id: 'admin-123',
    role: 'ADMIN',
    name: 'Test Admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Course and Video Management Flow', () => {
    it('should allow instructor to create course with video chapters', async () => {
      // Step 1: Create Course
      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockInstructor),
      });

      const mockCourse = {
        id: 'course-123',
        title: 'Complete React Course',
        description: 'Learn React from scratch',
        categoryId: 'web-dev',
        creatorId: 'instructor-123',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockInstructorDb] });
        }
        if (sql.includes('INSERT INTO courses')) {
          return Promise.resolve({ rows: [mockCourse] });
        }
        return Promise.resolve({ rows: [] });
      });

      const createCourseRequest = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          title: 'Complete React Course',
          description: 'Learn React from scratch',
          categoryId: 'web-dev',
        }),
      });

      const courseResponse = await createCourse(createCourseRequest);
      const courseData = await courseResponse.json();

      expect(courseResponse.status).toBe(201);
      expect(courseData.success).toBe(true);
      expect(courseData.data.id).toBe('course-123');

      // Step 2: Create Chapter with Video
      const mockChapter = {
        id: 'chapter-123',
        title: 'Introduction to React',
        description: 'Getting started with React',
        courseId: 'course-123',
        videoUrl: 'https://example.com/react-intro.mp4',
        position: 1,
        isPublished: false,
        isFree: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockInstructorDb] });
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

      const createChapterRequest = new NextRequest('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          courseId: 'course-123',
          title: 'Introduction to React',
          description: 'Getting started with React',
          videoUrl: 'https://example.com/react-intro.mp4',
          isFree: true,
        }),
      });

      const chapterResponse = await createChapter(createChapterRequest);
      const chapterData = await chapterResponse.json();

      expect(chapterResponse.status).toBe(201);
      expect(chapterData.success).toBe(true);
      expect(chapterData.data.videoUrl).toBe('https://example.com/react-intro.mp4');
    });

    it('should allow updating video URL in existing chapter', async () => {
      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockInstructor),
      });

      const updatedChapter = {
        id: 'chapter-123',
        videoUrl: 'https://example.com/updated-video.mp4',
        updatedAt: new Date(),
      };

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockInstructorDb] });
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
          return Promise.resolve({ rows: [updatedChapter] });
        }
        return Promise.resolve({ rows: [] });
      });

      const updateRequest = new NextRequest('http://localhost:3000/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          videoUrl: 'https://example.com/updated-video.mp4',
        }),
      });

      const response = await updateChapter(updateRequest, { params: { id: 'chapter-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.videoUrl).toBe('https://example.com/updated-video.mp4');
    });

    it('should handle video URL validation', async () => {
      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockInstructor),
      });

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockInstructorDb] });
        }
        if (sql.includes('SELECT * FROM courses WHERE id =')) {
          return Promise.resolve({ rows: [{ id: 'course-123', creatorId: 'instructor-123' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const invalidVideoUrls = [
        'not-a-url',
        'ftp://example.com/video.mp4',
        'javascript:alert("xss")',
        '',
      ];

      for (const invalidUrl of invalidVideoUrls) {
        const request = new NextRequest('http://localhost:3000/api/chapters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token',
          },
          body: JSON.stringify({
            courseId: 'course-123',
            title: 'Test Chapter',
            videoUrl: invalidUrl,
          }),
        });

        const response = await createChapter(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid video URL');
      }
    });
  });

  describe('Role-based Video Management', () => {
    it('should allow admin to manage any course videos', async () => {
      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockAdmin),
      });

      const mockChapter = {
        id: 'chapter-456',
        title: 'Admin Created Chapter',
        videoUrl: 'https://example.com/admin-video.mp4',
        courseId: 'course-456',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQuery.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE id =')) {
          return Promise.resolve({ rows: [mockAdminDb] });
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
          'Authorization': 'Bearer admin-token',
        },
        body: JSON.stringify({
          courseId: 'course-456',
          title: 'Admin Created Chapter',
          videoUrl: 'https://example.com/admin-video.mp4',
        }),
      });

      const response = await createChapter(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Admin Created Chapter');
    });

    it('should prevent students from managing videos', async () => {
      const mockStudent = {
        uid: 'student-123',
        email: 'student@example.com',
      };

      const mockStudentDb = {
        id: 'student-123',
        role: 'STUDENT',
      };

      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockStudent),
      });

      mockQuery.mockResolvedValue({ rows: [mockStudentDb] });

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer student-token',
        },
        body: JSON.stringify({
          title: 'Student Course Attempt',
        }),
      });

      const response = await createCourse(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });
  });

  describe('Batch Video Operations', () => {
    it('should handle multiple chapter creation with videos', async () => {
      mockGetAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockInstructor),
      });

      const chapters = [
        { title: 'Chapter 1', videoUrl: 'https://example.com/video1.mp4' },
        { title: 'Chapter 2', videoUrl: 'https://example.com/video2.mp4' },
        { title: 'Chapter 3', videoUrl: 'https://example.com/video3.mp4' },
      ];

      let positionCounter = 0;

      for (const [index, chapter] of chapters.entries()) {
        mockQuery.mockImplementation((sql: string, params: any[]) => {
          if (sql.includes('SELECT * FROM users WHERE id =')) {
            return Promise.resolve({ rows: [mockInstructorDb] });
          }
          if (sql.includes('SELECT * FROM courses WHERE id =')) {
            return Promise.resolve({ rows: [{ id: 'course-123', creatorId: 'instructor-123' }] });
          }
          if (sql.includes('SELECT COALESCE(MAX(position), 0)')) {
            return Promise.resolve({ rows: [{ max: positionCounter }] });
          }
          if (sql.includes('INSERT INTO chapters')) {
            positionCounter++;
            return Promise.resolve({ 
              rows: [{
                id: `chapter-${index + 1}`,
                title: chapter.title,
                videoUrl: chapter.videoUrl,
                position: positionCounter,
                courseId: 'course-123',
                createdAt: new Date(),
                updatedAt: new Date(),
              }] 
            });
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
            ...chapter,
          }),
        });

        const response = await createChapter(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.data.position).toBe(index + 1);
      }
    });
  });
});