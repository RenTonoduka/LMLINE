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

    const courseId = params.id;

    // Check if course exists and get creator
    const courseResult = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    // Check permissions
    if (user.role !== 'ADMIN' && course.creatorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, categoryId, image, price, isPublished } = body;

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
    if (categoryId !== undefined) {
      updates.push(`"categoryId" = $${paramIndex++}`);
      values.push(categoryId);
    }
    if (image !== undefined) {
      updates.push(`"image" = $${paramIndex++}`);
      values.push(image);
    }
    if (price !== undefined) {
      updates.push(`"price" = $${paramIndex++}`);
      values.push(price);
    }
    if (isPublished !== undefined) {
      updates.push(`"isPublished" = $${paramIndex++}`);
      values.push(isPublished);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updatedAt
    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);

    // Add courseId to values
    values.push(courseId);

    const updateQuery = `
      UPDATE courses
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
    console.error('Error updating course:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update course',
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

    const courseId = params.id;

    // For instructors, check if they own the course
    if (user.role === 'INSTRUCTOR') {
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
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete course (cascades to chapters, enrollments, etc.)
    const deleteQuery = 'DELETE FROM courses WHERE id = $1 RETURNING id';
    const result = await query(deleteQuery, [courseId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete course',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}