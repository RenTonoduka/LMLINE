import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    // Get course with related data
    const courseQuery = `
      SELECT 
        c.*,
        cat.name as category_name,
        u.name as creator_name,
        u.image as creator_image,
        u.role as creator_role,
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT ch.id) as total_chapters,
        COUNT(DISTINCT CASE WHEN ch."isPublished" = true THEN ch.id END) as published_chapters,
        COUNT(DISTINCT CASE WHEN ch."isPublished" = true AND ch."isFree" = true THEN ch.id END) as free_chapters
      FROM courses c
      LEFT JOIN categories cat ON c."categoryId" = cat.id
      LEFT JOIN users u ON c."creatorId" = u.id
      LEFT JOIN enrollments e ON c.id = e."courseId"
      LEFT JOIN chapters ch ON c.id = ch."courseId"
      WHERE c.id = $1 AND c."isPublished" = true
      GROUP BY c.id, cat.id, cat.name, u.id, u.name, u.image, u.role
    `;

    // Get chapters for this course
    const chaptersQuery = `
      SELECT id, title, description, position, "isFree", "videoUrl", "isPublished"
      FROM chapters
      WHERE "courseId" = $1 AND "isPublished" = true
      ORDER BY position ASC
    `;

    const [courseResult, chaptersResult] = await Promise.all([
      query(courseQuery, [courseId]),
      query(chaptersQuery, [courseId]),
    ]);

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
          message: 'The requested course does not exist or is not published',
        },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];
    const chapters = chaptersResult.rows;

    // Format response data
    const formattedCourse = {
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
        role: course.creator_role,
      },
      chapters: chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        position: ch.position,
        isFree: ch.isFree,
        videoUrl: ch.videoUrl,
        isPublished: ch.isPublished,
      })),
      enrollmentCount: parseInt(course.enrollment_count || '0'),
      totalChapters: parseInt(course.total_chapters || '0'),
      publishedChapters: parseInt(course.published_chapters || '0'),
      freeChapters: parseInt(course.free_chapters || '0'),
      estimatedDuration: chapters.length * 15, // Rough estimate: 15 min per chapter
      averageRating: 0, // TODO: Implement reviews
      reviewCount: 0,
    };

    return NextResponse.json({
      success: true,
      data: formattedCourse,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}