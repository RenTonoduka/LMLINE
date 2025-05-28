/**
 * データベースモデル設計のテスト
 */

import fs from 'fs';
import path from 'path';

describe('Database Model Design', () => {
  test('Prismaスキーマに必要なモデルが定義されている', () => {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    expect(fs.existsSync(prismaSchemaPath)).toBe(true);
    
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // 基本モデルの存在確認
    expect(schemaContent).toMatch(/model User \{/);
    expect(schemaContent).toMatch(/model Course \{/);
    expect(schemaContent).toMatch(/model Lesson \{/);
    expect(schemaContent).toMatch(/model Enrollment \{/);
    expect(schemaContent).toMatch(/model Progress \{/);
    expect(schemaContent).toMatch(/model Quiz \{/);
    expect(schemaContent).toMatch(/model QuizSubmission \{/);
  });

  test('Userモデルが正しく設定されている', () => {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // Firebase連携フィールド
    expect(schemaContent).toMatch(/firebaseUid\s+String\s+@unique/);
    expect(schemaContent).toMatch(/email\s+String\s+@unique/);
    
    // LINE連携フィールド
    expect(schemaContent).toMatch(/lineUserId\s+String\?\s+@unique/);
    
    // ユーザー情報フィールド
    expect(schemaContent).toMatch(/name\s+String\?/);
    expect(schemaContent).toMatch(/avatar\s+String\?/);
    expect(schemaContent).toMatch(/role\s+UserRole\s+@default\(STUDENT\)/);
    
    // タイムスタンプ
    expect(schemaContent).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
    expect(schemaContent).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
    expect(schemaContent).toMatch(/lastLoginAt\s+DateTime\?/);
    
    // リレーション
    expect(schemaContent).toMatch(/enrollments\s+Enrollment\[\]/);
    expect(schemaContent).toMatch(/progresses\s+Progress\[\]/);
    expect(schemaContent).toMatch(/submissions\s+QuizSubmission\[\]/);
  });

  test('Courseモデルが正しく設定されている', () => {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // コース情報フィールド
    expect(schemaContent).toMatch(/title\s+String/);
    expect(schemaContent).toMatch(/description\s+String\?/);
    expect(schemaContent).toMatch(/thumbnail\s+String\?/);
    expect(schemaContent).toMatch(/category\s+String/);
    expect(schemaContent).toMatch(/difficulty\s+CourseDifficulty\s+@default\(BEGINNER\)/);
    expect(schemaContent).toMatch(/isPublished\s+Boolean\s+@default\(false\)/);
    expect(schemaContent).toMatch(/price\s+Float\s+@default\(0\)/);
    
    // リレーション
    expect(schemaContent).toMatch(/lessons\s+Lesson\[\]/);
    expect(schemaContent).toMatch(/enrollments\s+Enrollment\[\]/);
  });

  test('Progress/Enrollmentモデルでリレーションが正しく設定されている', () => {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // Enrollmentの複合ユニーク制約
    expect(schemaContent).toMatch(/@@unique\(\[userId, courseId\]\)/);
    
    // Progressの複合ユニーク制約
    expect(schemaContent).toMatch(/@@unique\(\[userId, lessonId\]\)/);
    
    // カスケード削除設定
    expect(schemaContent).toMatch(/onDelete: Cascade/);
  });

  test('必要なEnumが定義されている', () => {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // UserRole enum
    expect(schemaContent).toMatch(/enum UserRole \{/);
    expect(schemaContent).toMatch(/STUDENT/);
    expect(schemaContent).toMatch(/INSTRUCTOR/);
    expect(schemaContent).toMatch(/ADMIN/);
    
    // CourseDifficulty enum
    expect(schemaContent).toMatch(/enum CourseDifficulty \{/);
    expect(schemaContent).toMatch(/BEGINNER/);
    expect(schemaContent).toMatch(/INTERMEDIATE/);
    expect(schemaContent).toMatch(/ADVANCED/);
    
    // EnrollmentStatus enum
    expect(schemaContent).toMatch(/enum EnrollmentStatus \{/);
    expect(schemaContent).toMatch(/ACTIVE/);
    expect(schemaContent).toMatch(/COMPLETED/);
    expect(schemaContent).toMatch(/SUSPENDED/);
  });

  test('UserServiceが正しく実装されている', () => {
    const userServicePath = path.join(process.cwd(), 'src/lib/db/user.ts');
    expect(fs.existsSync(userServicePath)).toBe(true);
    
    const serviceContent = fs.readFileSync(userServicePath, 'utf8');
    
    // 必要なメソッドの存在確認
    expect(serviceContent).toMatch(/static async findByFirebaseUid/);
    expect(serviceContent).toMatch(/static async create/);
    expect(serviceContent).toMatch(/static async update/);
    expect(serviceContent).toMatch(/static async syncWithFirebase/);
    expect(serviceContent).toMatch(/static async linkLineAccount/);
    expect(serviceContent).toMatch(/static async unlinkLineAccount/);
    expect(serviceContent).toMatch(/static async getEnrolledCourses/);
    expect(serviceContent).toMatch(/static async getLearningProgress/);
    
    // Firebase連携機能
    expect(serviceContent).toMatch(/firebaseUid/);
    expect(serviceContent).toMatch(/lastLoginAt/);
    
    // LINE連携機能
    expect(serviceContent).toMatch(/lineUserId/);
  });

  test('CourseServiceが正しく実装されている', () => {
    const courseServicePath = path.join(process.cwd(), 'src/lib/db/course.ts');
    expect(fs.existsSync(courseServicePath)).toBe(true);
    
    const serviceContent = fs.readFileSync(courseServicePath, 'utf8');
    
    // 必要なメソッドの存在確認
    expect(serviceContent).toMatch(/static async getPublishedCourses/);
    expect(serviceContent).toMatch(/static async getCourseById/);
    expect(serviceContent).toMatch(/static async create/);
    expect(serviceContent).toMatch(/static async update/);
    expect(serviceContent).toMatch(/static async delete/);
    expect(serviceContent).toMatch(/static async enrollUser/);
    expect(serviceContent).toMatch(/static async unenrollUser/);
    expect(serviceContent).toMatch(/static async isUserEnrolled/);
    expect(serviceContent).toMatch(/static async getCourseCountByCategory/);
    
    // ビジネスロジック
    expect(serviceContent).toMatch(/isPublished: true/);
    expect(serviceContent).toMatch(/EnrollmentStatus.ACTIVE/);
    expect(serviceContent).toMatch(/Already enrolled/);
  });

  test('ProgressServiceが正しく実装されている', () => {
    const progressServicePath = path.join(process.cwd(), 'src/lib/db/progress.ts');
    expect(fs.existsSync(progressServicePath)).toBe(true);
    
    const serviceContent = fs.readFileSync(progressServicePath, 'utf8');
    
    // 必要なメソッドの存在確認
    expect(serviceContent).toMatch(/static async getProgress/);
    expect(serviceContent).toMatch(/static async upsertProgress/);
    expect(serviceContent).toMatch(/static async markLessonComplete/);
    expect(serviceContent).toMatch(/static async saveWatchPosition/);
    expect(serviceContent).toMatch(/static async updateCourseProgress/);
    expect(serviceContent).toMatch(/static async getCourseProgressStats/);
    expect(serviceContent).toMatch(/static async getLearningStreak/);
    
    // 進捗管理ロジック
    expect(serviceContent).toMatch(/isCompleted/);
    expect(serviceContent).toMatch(/watchTime/);
    expect(serviceContent).toMatch(/lastPosition/);
    expect(serviceContent).toMatch(/completedAt/);
    expect(serviceContent).toMatch(/progressPercentage/);
  });

  test('Prismaクライアント設定が正しい', () => {
    const prismaClientPath = path.join(process.cwd(), 'src/lib/prisma.ts');
    expect(fs.existsSync(prismaClientPath)).toBe(true);
    
    const clientContent = fs.readFileSync(prismaClientPath, 'utf8');
    
    // Prismaクライアントの設定
    expect(clientContent).toMatch(/PrismaClient/);
    expect(clientContent).toMatch(/globalForPrisma/);
    expect(clientContent).toMatch(/process\.env\.NODE_ENV !== 'production'/);
    
    // シングルトンパターン
    expect(clientContent).toMatch(/globalForPrisma\.prisma \?\?/);
  });

  test('データベースサービスクラスの型定義が正しい', () => {
    const userServicePath = path.join(process.cwd(), 'src/lib/db/user.ts');
    const userContent = fs.readFileSync(userServicePath, 'utf8');
    
    // インターフェースの定義
    expect(userContent).toMatch(/interface CreateUserData/);
    expect(userContent).toMatch(/interface UpdateUserData/);
    expect(userContent).toMatch(/firebaseUid: string/);
    expect(userContent).toMatch(/email: string/);
    expect(userContent).toMatch(/UserRole/);
    
    const courseServicePath = path.join(process.cwd(), 'src/lib/db/course.ts');
    const courseContent = fs.readFileSync(courseServicePath, 'utf8');
    
    expect(courseContent).toMatch(/interface CreateCourseData/);
    expect(courseContent).toMatch(/interface UpdateCourseData/);
    expect(courseContent).toMatch(/CourseDifficulty/);
    expect(courseContent).toMatch(/EnrollmentStatus/);
  });
});