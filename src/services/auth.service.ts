import { User, UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';

export class AuthService {
  static async createOrUpdateUser(firebaseUid: string, email: string, name?: string): Promise<User> {
    const userData = {
      firebaseUid,
      email,
      name: name || 'User',
      lastLogin: new Date(),
    };

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { lastLogin: new Date() },
      create: userData,
    });

    return user;
  }

  static async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    return user;
  }

  static async updateUserProfile(
    firebaseUid: string,
    updates: Partial<Pick<User, 'name' | 'profileUrl'>>
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return user;
  }

  static async linkLineAccount(firebaseUid: string, lineUserId: string): Promise<User> {
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: {
        lineUserId,
        updatedAt: new Date(),
      },
    });

    return user;
  }

  static async unlinkLineAccount(firebaseUid: string): Promise<User> {
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: {
        lineUserId: null,
        updatedAt: new Date(),
      },
    });

    return user;
  }

  static async setUserRole(firebaseUid: string, role: UserRole): Promise<User> {
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: {
        role,
        updatedAt: new Date(),
      },
    });

    return user;
  }

  static async deactivateUser(firebaseUid: string): Promise<User> {
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return user;
  }

  static async getAllUsers(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  }
}