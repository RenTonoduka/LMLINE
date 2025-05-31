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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = params.id;

    // Get chapter with course and user progress information
    const chapterQuery = `
      SELECT 
        ch.*,
        c.title as course_title,
        c.id as course_id,
        c."creatorId" as course_creator_id,
        u.name as creator_name
      FROM chapters ch
      LEFT JOIN courses c ON ch."courseId" = c.id
      LEFT JOIN users u ON c."creatorId" = u.id
      WHERE ch.id = $1 AND ch."isPublished" = true AND c."isPublished" = true
    `;

    // Get all chapters for the course (for navigation sidebar)
    const chaptersQuery = `
      SELECT id, title, position, "isFree", "isPublished"
      FROM chapters
      WHERE "courseId" = (SELECT "courseId" FROM chapters WHERE id = $1)
        AND "isPublished" = true
      ORDER BY position ASC
    `;

    // Get next and previous chapters
    const navigationQuery = `
      SELECT 
        ch.id,
        ch.title,
        ch.position,
        CASE 
          WHEN ch.position < (SELECT position FROM chapters WHERE id = $1) THEN 'previous'
          WHEN ch.position > (SELECT position FROM chapters WHERE id = $1) THEN 'next'
        END as nav_type
      FROM chapters ch
      WHERE ch."courseId" = (SELECT "courseId" FROM chapters WHERE id = $1)
        AND ch."isPublished" = true
        AND ch.position IN (
          (SELECT position - 1 FROM chapters WHERE id = $1),
          (SELECT position + 1 FROM chapters WHERE id = $1)
        )
      ORDER BY ch.position
    `;

    const [chapterResult, chaptersResult, navigationResult] = await Promise.all([
      query(chapterQuery, [chapterId]),
      query(chaptersQuery, [chapterId]),
      query(navigationQuery, [chapterId]),
    ]);

    if (chapterResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chapter not found',
          message: 'The requested chapter does not exist or is not published',
        },
        { status: 404 }
      );
    }

    const chapter = chapterResult.rows[0];
    const chapters = chaptersResult.rows;
    const navigation = navigationResult.rows;

    const previousChapter = navigation.find(nav => nav.nav_type === 'previous');
    const nextChapter = navigation.find(nav => nav.nav_type === 'next');

    // Format response data
    const formattedChapter = {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      content: chapter.content || 'このチャプターの詳細な説明やリソースがここに表示されます。',
      videoUrl: chapter.videoUrl,
      position: chapter.position,
      isFree: chapter.isFree,
      isPublished: chapter.isPublished,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      course: {
        id: chapter.course_id,
        title: chapter.course_title,
        creatorId: chapter.course_creator_id,
        creator: {
          name: chapter.creator_name,
        },
        chapters: chapters.map(ch => ({
          id: ch.id,
          title: ch.title,
          position: ch.position,
          isFree: ch.isFree,
          isPublished: ch.isPublished,
          isCompleted: false, // TODO: Get actual progress
        })),
      },
      prevChapter: previousChapter ? {
        id: previousChapter.id,
        title: previousChapter.title,
        position: previousChapter.position,
      } : null,
      nextChapter: nextChapter ? {
        id: nextChapter.id,
        title: nextChapter.title,
        position: nextChapter.position,
      } : null,
      navigation: {
        previous: previousChapter ? {
          id: previousChapter.id,
          title: previousChapter.title,
          position: previousChapter.position,
        } : null,
        next: nextChapter ? {
          id: nextChapter.id,
          title: nextChapter.title,
          position: nextChapter.position,
        } : null,
      },
      // Placeholder for user progress - will be implemented with authentication
      userProgress: null,
      estimatedDuration: 15, // minutes
    };

    return NextResponse.json({
      success: true,
      data: formattedChapter,
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chapter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const chapterId = params.id;

    // Parse request body
    const body = await request.json();
    const { title, description, content, videoUrl, isFree, isPublished, position } = body;

    // Validate video URL
    if (videoUrl !== undefined && !validateVideoUrl(videoUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video URL' },
        { status: 400 }
      );
    }

    // Check permissions
    if (user.role === 'ADMIN') {
      // Admin can update any chapter
    } else if (user.role === 'INSTRUCTOR') {
      // Check if the user owns the course
      const chapterResult = await query(
        `SELECT ch.*, c."creatorId" 
         FROM chapters ch 
         JOIN courses c ON ch."courseId" = c.id 
         WHERE ch.id = $1`,
        [chapterId]
      );

      if (chapterResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Chapter not found' },
          { status: 404 }
        );
      }

      const chapter = chapterResult.rows[0];
      if (chapter.creatorId !== user.id) {
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

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`"title" = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`"description" = $${paramIndex++}`);
      values.push(description);
    }
    if (content !== undefined) {
      updates.push(`"content" = $${paramIndex++}`);
      values.push(content);
    }
    if (videoUrl !== undefined) {
      updates.push(`"videoUrl" = $${paramIndex++}`);
      values.push(videoUrl);
    }
    if (isFree !== undefined) {
      updates.push(`"isFree" = $${paramIndex++}`);
      values.push(isFree);
    }
    if (isPublished !== undefined) {
      updates.push(`"isPublished" = $${paramIndex++}`);
      values.push(isPublished);
    }
    if (position !== undefined) {
      updates.push(`"position" = $${paramIndex++}`);
      values.push(position);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updatedAt
    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);

    // Add chapterId to values
    values.push(chapterId);

    const updateQuery = `
      UPDATE chapters
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update chapter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const chapterId = params.id;

    // Check permissions
    if (user.role === 'ADMIN') {
      // Admin can delete any chapter
    } else if (user.role === 'INSTRUCTOR') {
      // Check if the user owns the course
      const chapterResult = await query(
        `SELECT ch.*, c."creatorId" 
         FROM chapters ch 
         JOIN courses c ON ch."courseId" = c.id 
         WHERE ch.id = $1`,
        [chapterId]
      );

      if (chapterResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Chapter not found' },
          { status: 404 }
        );
      }

      const chapter = chapterResult.rows[0];
      if (chapter.creatorId !== user.id) {
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

    // Delete chapter
    const deleteQuery = 'DELETE FROM chapters WHERE id = $1 RETURNING id';
    const result = await query(deleteQuery, [chapterId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete chapter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}