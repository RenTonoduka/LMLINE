import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Project Foundation Tests', () => {
  describe('Configuration Files', () => {
    test('package.json should exist and have required dependencies', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Check core dependencies
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('typescript');
      expect(packageJson.dependencies).toHaveProperty('firebase');
      expect(packageJson.dependencies).toHaveProperty('@prisma/client');
      expect(packageJson.dependencies).toHaveProperty('tailwindcss');
      
      // Check dev dependencies
      expect(packageJson.devDependencies).toHaveProperty('jest');
      expect(packageJson.devDependencies).toHaveProperty('eslint');
      expect(packageJson.devDependencies).toHaveProperty('prettier');
    });

    test('TypeScript configuration should be valid', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig.compilerOptions).toHaveProperty('strict', true);
      expect(tsconfig.compilerOptions).toHaveProperty('jsx', 'preserve');
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*');
    });

    test('Next.js configuration should exist', () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      expect(fs.existsSync(nextConfigPath)).toBe(true);
    });

    test('Tailwind configuration should exist', () => {
      const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
      expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    });

    test('ESLint configuration should exist', () => {
      const eslintConfigPath = path.join(process.cwd(), '.eslintrc.json');
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
    });

    test('Prettier configuration should exist', () => {
      const prettierConfigPath = path.join(process.cwd(), '.prettierrc');
      expect(fs.existsSync(prettierConfigPath)).toBe(true);
    });

    test('Jest configuration should exist', () => {
      const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    test('Environment example file should exist', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
      
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      expect(envContent).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(envContent).toContain('DATABASE_URL');
      expect(envContent).toContain('LINE_CHANNEL_ACCESS_TOKEN');
    });
  });

  describe('Directory Structure', () => {
    test('src directory should exist', () => {
      const srcPath = path.join(process.cwd(), 'src');
      expect(fs.existsSync(srcPath)).toBe(true);
    });

    test('lib directory should exist with required files', () => {
      const libPath = path.join(process.cwd(), 'src/lib');
      expect(fs.existsSync(libPath)).toBe(true);
      expect(fs.existsSync(path.join(libPath, 'firebase.ts'))).toBe(true);
      expect(fs.existsSync(path.join(libPath, 'firebase-admin.ts'))).toBe(true);
      expect(fs.existsSync(path.join(libPath, 'prisma.ts'))).toBe(true);
    });

    test('types directory should exist with required files', () => {
      const typesPath = path.join(process.cwd(), 'src/types');
      expect(fs.existsSync(typesPath)).toBe(true);
      expect(fs.existsSync(path.join(typesPath, 'auth.ts'))).toBe(true);
      expect(fs.existsSync(path.join(typesPath, 'course.ts'))).toBe(true);
    });

    test('services directory should exist', () => {
      const servicesPath = path.join(process.cwd(), 'src/services');
      expect(fs.existsSync(servicesPath)).toBe(true);
      expect(fs.existsSync(path.join(servicesPath, 'auth.service.ts'))).toBe(true);
    });

    test('middleware directory should exist', () => {
      const middlewarePath = path.join(process.cwd(), 'src/middleware');
      expect(fs.existsSync(middlewarePath)).toBe(true);
      expect(fs.existsSync(path.join(middlewarePath, 'auth.middleware.ts'))).toBe(true);
    });

    test('prisma directory should exist with schema', () => {
      const prismaPath = path.join(process.cwd(), 'prisma');
      expect(fs.existsSync(prismaPath)).toBe(true);
      expect(fs.existsSync(path.join(prismaPath, 'schema.prisma'))).toBe(true);
    });

    test('tests directory should exist', () => {
      const testsPath = path.join(process.cwd(), 'tests');
      expect(fs.existsSync(testsPath)).toBe(true);
    });
  });

  describe('Prisma Schema Validation', () => {
    test('Prisma schema should have required models', () => {
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      
      // Check for required models
      expect(schemaContent).toContain('model User');
      expect(schemaContent).toContain('model Course');
      expect(schemaContent).toContain('model Lesson');
      expect(schemaContent).toContain('model Enrollment');
      expect(schemaContent).toContain('model Quiz');
      expect(schemaContent).toContain('model Question');
      
      // Check for Firebase integration
      expect(schemaContent).toContain('firebaseUid');
      expect(schemaContent).toContain('@unique @map("firebase_uid")');
      
      // Check for LINE integration
      expect(schemaContent).toContain('lineUserId');
    });

    test('User model should have required fields', () => {
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      
      expect(schemaContent).toContain('firebaseUid String');
      expect(schemaContent).toContain('email       String');
      expect(schemaContent).toContain('role        UserRole');
      expect(schemaContent).toContain('lineUserId  String?');
    });
  });

  describe('Firebase Configuration', () => {
    test('Firebase client configuration should be properly structured', () => {
      const firebasePath = path.join(process.cwd(), 'src/lib/firebase.ts');
      const firebaseContent = fs.readFileSync(firebasePath, 'utf-8');
      
      expect(firebaseContent).toContain('initializeApp');
      expect(firebaseContent).toContain('getAuth');
      expect(firebaseContent).toContain('getFirestore');
      expect(firebaseContent).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
    });

    test('Firebase admin configuration should be properly structured', () => {
      const firebaseAdminPath = path.join(process.cwd(), 'src/lib/firebase-admin.ts');
      const firebaseAdminContent = fs.readFileSync(firebaseAdminPath, 'utf-8');
      
      expect(firebaseAdminContent).toContain('firebase-admin');
      expect(firebaseAdminContent).toContain('admin.auth()');
      expect(firebaseAdminContent).toContain('FIREBASE_PROJECT_ID');
      expect(firebaseAdminContent).toContain('FIREBASE_PRIVATE_KEY');
    });
  });

  describe('Type Definitions', () => {
    test('Auth types should be properly defined', () => {
      const authTypesPath = path.join(process.cwd(), 'src/types/auth.ts');
      const authTypesContent = fs.readFileSync(authTypesPath, 'utf-8');
      
      expect(authTypesContent).toContain('interface User');
      expect(authTypesContent).toContain('interface AuthContextType');
      expect(authTypesContent).toContain('enum UserRole');
      expect(authTypesContent).toContain('firebaseUid: string');
    });

    test('Course types should be properly defined', () => {
      const courseTypesPath = path.join(process.cwd(), 'src/types/course.ts');
      const courseTypesContent = fs.readFileSync(courseTypesPath, 'utf-8');
      
      expect(courseTypesContent).toContain('interface Course');
      expect(courseTypesContent).toContain('interface Lesson');
      expect(courseTypesContent).toContain('interface Enrollment');
      expect(courseTypesContent).toContain('enum Difficulty');
    });
  });

  describe('Service Layer', () => {
    test('Auth service should have required methods', () => {
      const authServicePath = path.join(process.cwd(), 'src/services/auth.service.ts');
      const authServiceContent = fs.readFileSync(authServicePath, 'utf-8');
      
      expect(authServiceContent).toContain('createOrUpdateUser');
      expect(authServiceContent).toContain('getUserByFirebaseUid');
      expect(authServiceContent).toContain('linkLineAccount');
      expect(authServiceContent).toContain('unlinkLineAccount');
    });
  });

  describe('Middleware', () => {
    test('Auth middleware should have required functions', () => {
      const authMiddlewarePath = path.join(process.cwd(), 'src/middleware/auth.middleware.ts');
      const authMiddlewareContent = fs.readFileSync(authMiddlewarePath, 'utf-8');
      
      expect(authMiddlewareContent).toContain('authenticateToken');
      expect(authMiddlewareContent).toContain('createAuthMiddleware');
      expect(authMiddlewareContent).toContain('verifyIdToken');
    });
  });
});