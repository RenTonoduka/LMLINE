import { prisma } from '@/lib/prisma';
import { CourseDifficulty, EnrollmentStatus } from '@prisma/client';

export interface CreateCourseData {
  title: string;
  description?: string;
  thumbnail?: string;
  category: string;
  difficulty?: CourseDifficulty;
  price?: number;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  difficulty?: CourseDifficulty;
  price?: number;
  isPublished?: boolean;
}

export class CourseService {
  /**
   * 公開されているコース一覧を取得
   */
  static async getPublishedCourses(options?: {
    category?: string;
    difficulty?: CourseDifficulty;
    limit?: number;
    offset?: number;
  }) {
    const { category, difficulty, limit = 20, offset = 0 } = options || {};

    return prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
        ...(difficulty && { difficulty }),
      },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * コース詳細を取得
   */
  static async getCourseById(courseId: string, includeUnpublished = false) {
    return prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          where: includeUnpublished ? {} : { isPublished: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  /**
   * コースを作成
   */
  static async create(courseData: CreateCourseData) {
    return prisma.course.create({
      data: {
        ...courseData,
        difficulty: courseData.difficulty || CourseDifficulty.BEGINNER,
        price: courseData.price || 0,
      },
    });
  }

  /**
   * コースを更新
   */
  static async update(courseId: string, courseData: UpdateCourseData) {
    return prisma.course.update({
      where: { id: courseId },
      data: courseData,
    });
  }

  /**
   * コースを削除
   */
  static async delete(courseId: string) {
    return prisma.course.delete({
      where: { id: courseId },
    });
  }

  /**
   * ユーザーをコースに登録
   */
  static async enrollUser(firebaseUid: string, courseId: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      throw new Error('Course not available');
    }

    // 既に受講登録されているかチェック
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.ACTIVE) {
        throw new Error('Already enrolled');
      } else {
        // 再受講の場合は状態を更新
        return prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: EnrollmentStatus.ACTIVE,
            enrolledAt: new Date(),
          },
        });
      }
    }

    return prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  /**
   * コース受講を停止
   */
  static async unenrollUser(firebaseUid: string, courseId: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.enrollment.updateMany({
      where: {
        userId: user.id,
        courseId,
      },
      data: {
        status: EnrollmentStatus.SUSPENDED,
      },
    });
  }

  /**
   * ユーザーがコースを受講しているかチェック
   */
  static async isUserEnrolled(firebaseUid: string, courseId: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) return false;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    return enrollment?.status === EnrollmentStatus.ACTIVE;
  }

  /**
   * カテゴリ別コース数を取得
   */
  static async getCourseCountByCategory() {
    const result = await prisma.course.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: {
        category: true,
      },
    });

    return result.map(item => ({
      category: item.category,
      count: item._count.category,
    }));
  }
}