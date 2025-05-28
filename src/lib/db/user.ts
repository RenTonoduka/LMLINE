import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export interface CreateUserData {
  firebaseUid: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  lineUserId?: string;
  lastLoginAt?: Date;
}

export class UserService {
  /**
   * Firebase UIDを使用してユーザーを取得
   */
  static async findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  /**
   * ユーザーを作成
   */
  static async create(userData: CreateUserData) {
    return prisma.user.create({
      data: {
        ...userData,
        role: userData.role || UserRole.STUDENT,
      },
    });
  }

  /**
   * ユーザー情報を更新
   */
  static async update(firebaseUid: string, userData: UpdateUserData) {
    return prisma.user.update({
      where: { firebaseUid },
      data: userData,
    });
  }

  /**
   * Firebase認証とPostgreSQLユーザーを同期
   */
  static async syncWithFirebase(firebaseUser: {
    uid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
  }) {
    const existingUser = await this.findByFirebaseUid(firebaseUser.uid);

    if (existingUser) {
      // 既存ユーザーの最終ログイン時刻を更新
      return this.update(firebaseUser.uid, {
        lastLoginAt: new Date(),
        name: firebaseUser.displayName || existingUser.name,
        avatar: firebaseUser.photoURL || existingUser.avatar,
      });
    } else {
      // 新規ユーザーを作成
      return this.create({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || undefined,
        avatar: firebaseUser.photoURL || undefined,
      });
    }
  }

  /**
   * LINE User IDを設定
   */
  static async linkLineAccount(firebaseUid: string, lineUserId: string) {
    return this.update(firebaseUid, { lineUserId });
  }

  /**
   * LINE連携を解除
   */
  static async unlinkLineAccount(firebaseUid: string) {
    return this.update(firebaseUid, { lineUserId: null });
  }

  /**
   * ユーザーの受講中コース一覧を取得
   */
  static async getEnrolledCourses(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        enrollments: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            course: {
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    return user?.enrollments || [];
  }

  /**
   * ユーザーの学習進捗を取得
   */
  static async getLearningProgress(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        progresses: {
          include: {
            lesson: {
              include: {
                course: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) return null;

    // コース別の進捗を計算
    const courseProgress = user.enrollments.map((enrollment) => {
      const courseProgresses = user.progresses.filter(
        (progress) => progress.lesson.courseId === enrollment.courseId
      );
      
      const totalLessons = enrollment.course.lessons?.length || 0;
      const completedLessons = courseProgresses.filter(
        (progress) => progress.isCompleted
      ).length;
      
      const progressPercentage = totalLessons > 0 
        ? (completedLessons / totalLessons) * 100 
        : 0;

      return {
        courseId: enrollment.courseId,
        courseName: enrollment.course.title,
        progress: progressPercentage,
        completedLessons,
        totalLessons,
      };
    });

    return {
      user,
      courseProgress,
      totalCompletedLessons: user.progresses.filter(p => p.isCompleted).length,
    };
  }
}