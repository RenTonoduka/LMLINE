import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, userId } = body;

    // Validate required fields
    if (!courseId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'courseId and userId are required',
        },
        { status: 400 }
      );
    }

    // Check if course exists and is published
    const courseCheck = await query(
      'SELECT id, title, price FROM courses WHERE id = $1 AND "isPublished" = true',
      [courseId]
    );

    if (courseCheck.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
          message: 'The requested course does not exist or is not published',
        },
        { status: 404 }
      );
    }

    // Check if user exists
    const userCheck = await query(
      'SELECT id, name FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: 'The specified user does not exist',
        },
        { status: 404 }
      );
    }

    // Check if enrollment already exists
    const enrollmentCheck = await query(
      'SELECT id FROM enrollments WHERE "userId" = $1 AND "courseId" = $2',
      [userId, courseId]
    );

    if (enrollmentCheck.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Already enrolled',
          message: 'User is already enrolled in this course',
        },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollmentId = uuidv4();
    const enrollmentResult = await query(
      `INSERT INTO enrollments (id, "userId", "courseId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [enrollmentId, userId, courseId]
    );

    const enrollment = enrollmentResult.rows[0];
    const course = courseCheck.rows[0];
    const user = userCheck.rows[0];

    // Format response
    const formattedEnrollment = {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      createdAt: enrollment.createdAt,
      course: {
        id: course.id,
        title: course.title,
        price: parseFloat(course.price || '0'),
      },
      user: {
        id: user.id,
        name: user.name,
      },
    };

    return NextResponse.json({
      success: true,
      data: formattedEnrollment,
      message: 'Successfully enrolled in course',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create enrollment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    let whereClause = '';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      whereClause += `e."userId" = $${paramCount}`;
      queryParams.push(userId);
    }

    if (courseId) {
      if (whereClause) whereClause += ' AND ';
      paramCount++;
      whereClause += `e."courseId" = $${paramCount}`;
      queryParams.push(courseId);
    }

    if (whereClause) {
      whereClause = 'WHERE ' + whereClause;
    }

    const enrollmentsQuery = `
      SELECT 
        e.*,
        c.title as course_title,
        c.description as course_description,
        c.image as course_image,
        c.price as course_price,
        u.name as user_name,
        u.email as user_email,
        COUNT(DISTINCT ch.id) as total_chapters,
        COUNT(DISTINCT up.id) as completed_chapters
      FROM enrollments e
      LEFT JOIN courses c ON e."courseId" = c.id
      LEFT JOIN users u ON e."userId" = u.id
      LEFT JOIN chapters ch ON c.id = ch."courseId" AND ch."isPublished" = true
      LEFT JOIN user_progress up ON ch.id = up."chapterId" AND up."userId" = e."userId" AND up."isCompleted" = true
      ${whereClause}
      GROUP BY e.id, c.id, c.title, c.description, c.image, c.price, u.id, u.name, u.email
      ORDER BY e."createdAt" DESC
    `;

    const enrollmentsResult = await query(enrollmentsQuery, queryParams);
    const enrollments = enrollmentsResult.rows;

    const formattedEnrollments = enrollments.map(enrollment => ({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      createdAt: enrollment.createdAt,
      course: {
        id: enrollment.courseId,
        title: enrollment.course_title,
        description: enrollment.course_description,
        image: enrollment.course_image,
        price: parseFloat(enrollment.course_price || '0'),
      },
      user: {
        id: enrollment.userId,
        name: enrollment.user_name,
        email: enrollment.user_email,
      },
      progress: {
        totalChapters: parseInt(enrollment.total_chapters || '0'),
        completedChapters: parseInt(enrollment.completed_chapters || '0'),
        completionPercentage: enrollment.total_chapters > 0 
          ? Math.round((parseInt(enrollment.completed_chapters || '0') / parseInt(enrollment.total_chapters || '0')) * 100)
          : 0,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedEnrollments,
    });

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch enrollments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}