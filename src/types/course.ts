export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category: string;
  difficulty: Difficulty;
  price: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  instructorId: string;
  instructor?: {
    id: string;
    name?: string;
    email: string;
  };
  lessons?: Lesson[];
  enrollments?: Enrollment[];
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  courseId: string;
  course?: Course;
  materials?: Material[];
  quizzes?: Quiz[];
  lessonProgress?: LessonProgress[];
}

export interface Material {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  lessonId: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
  lessonId: string;
  questions?: Question[];
  quizAttempts?: QuizAttempt[];
}

export interface Question {
  id: string;
  question: string;
  questionType: QuestionType;
  options?: any;
  correctAnswer: string;
  explanation?: string;
  points: number;
  order: number;
  createdAt: Date;
  quizId: string;
}

export interface Enrollment {
  id: string;
  enrolledAt: Date;
  completedAt?: Date;
  status: EnrollmentStatus;
  progress: number;
  lastAccessed?: Date;
  userId: string;
  courseId: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  course?: Course;
}

export interface LessonProgress {
  id: string;
  isCompleted: boolean;
  watchTime: number;
  lastPosition: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  lessonId: string;
}

export interface QuizAttempt {
  id: string;
  score: number;
  isPassed: boolean;
  timeSpent?: number;
  startedAt: Date;
  completedAt?: Date;
  userId: string;
  quizId: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  createdAt: Date;
  attemptId: string;
  questionId: string;
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  SUSPENDED = 'SUSPENDED',
}