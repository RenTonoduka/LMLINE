import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    initAdmin();
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

async function getUserFromDb(userId: string) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}

function validateVideoUrl(url: string): boolean {
  if (!url) return true; // Video URL is optional
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuth(request);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserFromDb(decodedToken.uid);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { courseId, title, description, content, videoUrl, isFree } = body;

    // Validation
    if (!courseId || !title) {
      return NextResponse.json(
        { success: false, error: 'Course ID and title are required' },
        { status: 400 }
      );
    }

    // Validate video URL
    if (videoUrl && !validateVideoUrl(videoUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video URL' },
        { status: 400 }
      );
    }

    // Check permissions
    if (user.role === 'ADMIN') {
      // Admin can create chapters for any course
    } else if (user.role === 'INSTRUCTOR') {
      // Check if the user owns the course
      const courseResult = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
      if (courseResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Course not found' },
          { status: 404 }
        );
      }
      
      const course = courseResult.rows[0];
      if (course.creatorId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get the next position
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) as max FROM chapters WHERE "courseId" = $1',
      [courseId]
    );
    const nextPosition = positionResult.rows[0].max + 1;

    // Create chapter
    const insertQuery = `
      INSERT INTO chapters ("courseId", "title", "description", "content", "videoUrl", "position", "isFree", "isPublished")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      courseId,
      title,
      description || null,
      content || null,
      videoUrl || null,
      nextPosition,
      isFree || false,
      false, // New chapters start as unpublished
    ]);

    const chapter = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        data: chapter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create chapter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}