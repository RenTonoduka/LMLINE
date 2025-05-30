import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, chapterId, isCompleted = true } = body;

    // Validate required fields
    if (!userId || !chapterId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'userId and chapterId are required',
        },
        { status: 400 }
      );
    }

    // Check if chapter exists and user is enrolled in the course
    const enrollmentCheck = await query(
      `SELECT 
        ch.id as chapter_id,
        ch.title as chapter_title,
        c.id as course_id,
        c.title as course_title,
        e.id as enrollment_id
      FROM chapters ch
      LEFT JOIN courses c ON ch."courseId" = c.id
      LEFT JOIN enrollments e ON c.id = e."courseId" AND e."userId" = $1
      WHERE ch.id = $2 AND ch."isPublished" = true AND c."isPublished" = true`,
      [userId, chapterId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          message: 'Chapter not found or user not enrolled in course',
        },
        { status: 403 }
      );
    }

    const { chapter_id, chapter_title, course_id, course_title, enrollment_id } = enrollmentCheck.rows[0];

    if (!enrollment_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not enrolled',
          message: 'User is not enrolled in this course',
        },
        { status: 403 }
      );
    }

    // Check if progress already exists
    const existingProgress = await query(
      'SELECT id, "isCompleted" FROM user_progress WHERE "userId" = $1 AND "chapterId" = $2',
      [userId, chapterId]
    );

    let progressResult;

    if (existingProgress.rows.length > 0) {
      // Update existing progress
      progressResult = await query(
        `UPDATE user_progress 
         SET "isCompleted" = $1, "updatedAt" = CURRENT_TIMESTAMP
         WHERE "userId" = $2 AND "chapterId" = $3
         RETURNING *`,
        [isCompleted, userId, chapterId]
      );
    } else {
      // Create new progress record
      const progressId = uuidv4();
      progressResult = await query(
        `INSERT INTO user_progress (id, "userId", "chapterId", "isCompleted", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [progressId, userId, chapterId, isCompleted]
      );
    }

    const progress = progressResult.rows[0];

    // Get course progress summary
    const progressSummary = await query(
      `SELECT 
        COUNT(ch.id) as total_chapters,
        COUNT(up.id) as completed_chapters
      FROM chapters ch
      LEFT JOIN user_progress up ON ch.id = up."chapterId" AND up."userId" = $1 AND up."isCompleted" = true
      WHERE ch."courseId" = $2 AND ch."isPublished" = true`,
      [userId, course_id]
    );

    const summary = progressSummary.rows[0];
    const completionPercentage = summary.total_chapters > 0 
      ? Math.round((parseInt(summary.completed_chapters) / parseInt(summary.total_chapters)) * 100)
      : 0;

    // Format response
    const formattedProgress = {
      id: progress.id,
      userId: progress.userId,
      chapterId: progress.chapterId,
      isCompleted: progress.isCompleted,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
      chapter: {
        id: chapter_id,
        title: chapter_title,
      },
      course: {
        id: course_id,
        title: course_title,
        progress: {
          totalChapters: parseInt(summary.total_chapters),
          completedChapters: parseInt(summary.completed_chapters),
          completionPercentage,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: formattedProgress,
      message: `Chapter ${isCompleted ? 'completed' : 'marked as incomplete'}`,
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update progress',
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
    const chapterId = searchParams.get('chapterId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter',
          message: 'userId is required',
        },
        { status: 400 }
      );
    }

    let whereClause = 'WHERE up."userId" = $1';
    const queryParams: any[] = [userId];
    let paramCount = 1;

    if (courseId) {
      paramCount++;
      whereClause += ` AND ch."courseId" = $${paramCount}`;
      queryParams.push(courseId);
    }

    if (chapterId) {
      paramCount++;
      whereClause += ` AND up."chapterId" = $${paramCount}`;
      queryParams.push(chapterId);
    }

    const progressQuery = `
      SELECT 
        up.*,
        ch.title as chapter_title,
        ch.position as chapter_position,
        c.id as course_id,
        c.title as course_title
      FROM user_progress up
      LEFT JOIN chapters ch ON up."chapterId" = ch.id
      LEFT JOIN courses c ON ch."courseId" = c.id
      ${whereClause}
      ORDER BY c.title, ch.position
    `;

    const progressResult = await query(progressQuery, queryParams);
    const progressRecords = progressResult.rows;

    const formattedProgress = progressRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      chapterId: record.chapterId,
      isCompleted: record.isCompleted,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      chapter: {
        id: record.chapterId,
        title: record.chapter_title,
        position: record.chapter_position,
      },
      course: {
        id: record.course_id,
        title: record.course_title,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedProgress,
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}