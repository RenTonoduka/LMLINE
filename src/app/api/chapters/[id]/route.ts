import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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