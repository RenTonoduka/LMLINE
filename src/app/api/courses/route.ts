import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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