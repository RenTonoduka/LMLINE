export * from './auth';

// Re-export Prisma types
export type {
  User,
  Course,
  Category,
  Chapter,
  Enrollment,
  UserProgress,
  Review,
  Assignment,
  Submission,
  ChatMessage,
  Notification,
  UserActivity,
  LineIntegration,
  UserRole,
  SubmissionStatus,
  MessageType,
  NotificationType,
  ActivityType,
} from '@prisma/client';

// Additional custom types
export interface CourseWithDetails extends Course {
  creator: User;
  category?: Category;
  chapters: Chapter[];
  enrollments: Enrollment[];
  _count: {
    enrollments: number;
    chapters: number;
  };
}

export interface ChapterWithProgress extends Chapter {
  userProgress?: UserProgress[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}