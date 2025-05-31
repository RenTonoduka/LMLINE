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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build SQL query with filters
    let whereClause = 'WHERE c."isPublished" = true';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (categoryId) {
      paramCount++;
      whereClause += ` AND c."categoryId" = $${paramCount}`;
      queryParams.push(categoryId);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Get courses with related data
    const coursesQuery = `
      SELECT 
        c.*,
        cat.name as category_name,
        u.name as creator_name,
        u.image as creator_image,
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT ch.id) as total_chapters,
        COUNT(DISTINCT CASE WHEN ch."isPublished" = true THEN ch.id END) as published_chapters
      FROM courses c
      LEFT JOIN categories cat ON c."categoryId" = cat.id
      LEFT JOIN users u ON c."creatorId" = u.id
      LEFT JOIN enrollments e ON c.id = e."courseId"
      LEFT JOIN chapters ch ON c.id = ch."courseId"
      ${whereClause}
      GROUP BY c.id, cat.name, u.name, u.image
      ORDER BY c."createdAt" DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `;

    const [coursesResult, countResult] = await Promise.all([
      query(coursesQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)), // Remove limit and offset params
    ]);

    const courses = coursesResult.rows;
    const totalCount = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCount / limit);

    // Format response data
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image,
      price: parseFloat(course.price || '0'),
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      category: course.category_name ? {
        id: course.categoryId,
        name: course.category_name,
      } : null,
      creator: {
        id: course.creatorId,
        name: course.creator_name,
        image: course.creator_image,
      },
      enrollmentCount: parseInt(course.enrollment_count || '0'),
      totalChapters: parseInt(course.total_chapters || '0'),
      publishedChapters: parseInt(course.published_chapters || '0'),
    }));

    return NextResponse.json({
      success: true,
      data: formattedCourses,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch courses',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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

    // Check permissions
    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, categoryId, image, price } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create course
    const insertQuery = `
      INSERT INTO courses ("title", "description", "categoryId", "image", "price", "creatorId", "isPublished")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      title,
      description || null,
      categoryId || null,
      image || null,
      price || 0,
      user.id,
      false,
    ]);

    const course = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        data: course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create course',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { courseId, title, description, categoryId, image, price, isPublished } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

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

export async function DELETE(request: NextRequest) {
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
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

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