// Manual Prisma type definitions
// These are manually defined to avoid Prisma client generation dependency

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  PENDING_REVIEW = 'PENDING_REVIEW'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export enum NotificationType {
  COURSE_UPDATE = 'COURSE_UPDATE',
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  COURSE_ACCESS = 'COURSE_ACCESS',
  ASSIGNMENT_SUBMIT = 'ASSIGNMENT_SUBMIT',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE'
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  firebaseUid: string | null;
  lineUserId: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  price: number | null;
  isPublished: boolean;
  categoryId: string | null;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  chapterId: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  maxScore: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  content: string;
  score: number | null;
  feedback: string | null;
  status: SubmissionStatus;
  userId: string;
  assignmentId: string;
  submittedAt: Date;
  gradedAt: Date | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  messageType: MessageType;
  isFromBot: boolean;
  userId: string | null;
  sessionId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  createdAt: Date;
}

export interface UserActivity {
  id: string;
  action: string;
  details: string | null;
  activityType: ActivityType;
  userId: string;
  createdAt: Date;
}

export interface LineIntegration {
  id: string;
  lineUserId: string;
  userName: string | null;
  isActive: boolean;
  webhookUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
