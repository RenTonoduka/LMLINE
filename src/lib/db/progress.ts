import { prisma } from '@/lib/prisma';

export interface CreateProgressData {
  userId: string;
  lessonId: string;
  watchTime?: number;
  lastPosition?: number;
}

export interface UpdateProgressData {
  isCompleted?: boolean;
  watchTime?: number;
  lastPosition?: number;
}

export class ProgressService {
  /**
   * ユーザーのレッスン進捗を取得
   */
  static async getProgress(firebaseUid: string, lessonId: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) return null;

    return prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  /**
   * レッスン進捗を作成または更新
   */
  static async upsertProgress(
    firebaseUid: string,
    lessonId: string,
    progressData: UpdateProgressData
  ) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

    if (existingProgress) {
      return prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          ...progressData,
          ...(progressData.isCompleted && { completedAt: new Date() }),
        },
      });
    } else {
      return prisma.progress.create({
        data: {
          userId: user.id,
          lessonId,
          ...progressData,
          ...(progressData.isCompleted && { completedAt: new Date() }),
        },
      });
    }
  }

  /**
   * レッスンを完了としてマーク
   */
  static async markLessonComplete(firebaseUid: string, lessonId: string) {
    const progress = await this.upsertProgress(firebaseUid, lessonId, {
      isCompleted: true,
    });

    // コース進捗を更新
    await this.updateCourseProgress(firebaseUid, progress.lessonId);

    return progress;
  }

  /**
   * 動画視聴位置を保存
   */
  static async saveWatchPosition(
    firebaseUid: string,
    lessonId: string,
    position: number,
    watchTime: number
  ) {
    return this.upsertProgress(firebaseUid, lessonId, {
      lastPosition: position,
      watchTime,
    });
  }

  /**
   * コース全体の進捗を更新
   */
  static async updateCourseProgress(firebaseUid: string, lessonId: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) return;

    // レッスンからコースIDを取得
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) return;

    // コースの全レッスン数を取得
    const totalLessons = await prisma.lesson.count({
      where: {
        courseId: lesson.courseId,
        isPublished: true,
      },
    });

    // ユーザーの完了レッスン数を取得
    const completedLessons = await prisma.progress.count({
      where: {
        userId: user.id,
        isCompleted: true,
        lesson: {
          courseId: lesson.courseId,
          isPublished: true,
        },
      },
    });

    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // 受講登録の進捗を更新
    await prisma.enrollment.updateMany({
      where: {
        userId: user.id,
        courseId: lesson.courseId,
      },
      data: {
        progress: progressPercentage,
        ...(progressPercentage === 100 && { completedAt: new Date() }),
      },
    });

    return { progressPercentage, completedLessons, totalLessons };
  }

  /**
   * ユーザーのコース別進捗統計を取得
   */
  static async getCourseProgressStats(firebaseUid: string, courseId: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) return null;

    const progresses = await prisma.progress.findMany({
      where: {
        userId: user.id,
        lesson: {
          courseId,
          isPublished: true,
        },
      },
      include: {
        lesson: true,
      },
    });

    const totalLessons = await prisma.lesson.count({
      where: {
        courseId,
        isPublished: true,
      },
    });

    const completedLessons = progresses.filter(p => p.isCompleted).length;
    const totalWatchTime = progresses.reduce((sum, p) => sum + p.watchTime, 0);
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      completedLessons,
      progressPercentage,
      totalWatchTime,
      progresses,
    };
  }

  /**
   * ユーザーの学習ストリークを計算
   */
  static async getLearningStreak(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) return 0;

    const recentProgresses = await prisma.progress.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 365, // 最大1年分
    });

    if (recentProgresses.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const progress of recentProgresses) {
      if (!progress.completedAt) continue;

      const progressDate = new Date(progress.completedAt);
      progressDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff === streak + 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}