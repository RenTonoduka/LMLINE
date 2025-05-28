/**
 * 依存関係とツール設定のテスト
 */

import fs from 'fs';
import path from 'path';

describe('Dependencies and Tools Setup', () => {
  test('package.json に必要な依存関係が追加されている', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Firebase関連
    expect(packageJson.dependencies.firebase).toBeDefined();
    expect(packageJson.dependencies['firebase-admin']).toBeDefined();
    
    // Prisma関連
    expect(packageJson.dependencies['@prisma/client']).toBeDefined();
    expect(packageJson.dependencies.prisma).toBeDefined();
    
    // Tailwind CSS関連
    expect(packageJson.dependencies.tailwindcss).toBeDefined();
    expect(packageJson.dependencies.autoprefixer).toBeDefined();
    expect(packageJson.dependencies.postcss).toBeDefined();
    
    // 状態管理とAPI
    expect(packageJson.dependencies.zustand).toBeDefined();
    expect(packageJson.dependencies['@tanstack/react-query']).toBeDefined();
    expect(packageJson.dependencies.axios).toBeDefined();
    
    // フォーム関連
    expect(packageJson.dependencies['react-hook-form']).toBeDefined();
    expect(packageJson.dependencies['@hookform/resolvers']).toBeDefined();
    expect(packageJson.dependencies.zod).toBeDefined();
    
    // テスト関連
    expect(packageJson.devDependencies['@testing-library/react']).toBeDefined();
    expect(packageJson.devDependencies['@testing-library/jest-dom']).toBeDefined();
    expect(packageJson.devDependencies.jest).toBeDefined();
    
    // Prismaスクリプト
    expect(packageJson.scripts['db:generate']).toBe('prisma generate');
    expect(packageJson.scripts['db:push']).toBe('prisma db push');
    expect(packageJson.scripts['db:migrate']).toBe('prisma migrate dev');
    expect(packageJson.scripts['db:studio']).toBe('prisma studio');
  });

  test('Tailwind CSS設定ファイルが存在する', () => {
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
    expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    
    const postcssConfigPath = path.join(process.cwd(), 'postcss.config.js');
    expect(fs.existsSync(postcssConfigPath)).toBe(true);
  });

  test('Firebase設定ファイルが存在する', () => {
    const firebaseConfigPath = path.join(process.cwd(), 'src/lib/firebase.ts');
    expect(fs.existsSync(firebaseConfigPath)).toBe(true);
    
    const firebaseAdminConfigPath = path.join(process.cwd(), 'src/lib/firebase-admin.ts');
    expect(fs.existsSync(firebaseAdminConfigPath)).toBe(true);
  });

  test('Prisma設定ファイルが存在する', () => {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    expect(fs.existsSync(prismaSchemaPath)).toBe(true);
    
    const prismaClientPath = path.join(process.cwd(), 'src/lib/prisma.ts');
    expect(fs.existsSync(prismaClientPath)).toBe(true);
  });

  test('Prismaスキーマに必要なモデルが定義されている', () => {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // 基本モデルの存在確認
    expect(schemaContent).toMatch(/model User \{/);
    expect(schemaContent).toMatch(/model Course \{/);
    expect(schemaContent).toMatch(/model Lesson \{/);
    expect(schemaContent).toMatch(/model Enrollment \{/);
    expect(schemaContent).toMatch(/model Progress \{/);
    expect(schemaContent).toMatch(/model Quiz \{/);
    
    // Firebase連携フィールドの確認
    expect(schemaContent).toMatch(/firebaseUid\s+String\s+@unique/);
    expect(schemaContent).toMatch(/lineUserId\s+String\?\s+@unique/);
    
    // 必要なEnumの確認
    expect(schemaContent).toMatch(/enum UserRole \{/);
    expect(schemaContent).toMatch(/enum CourseDifficulty \{/);
    expect(schemaContent).toMatch(/enum EnrollmentStatus \{/);
  });

  test('Firebase設定が環境変数を参照している', () => {
    const firebaseConfigPath = path.join(process.cwd(), 'src/lib/firebase.ts');
    const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // 環境変数の参照確認
    expect(firebaseContent).toMatch(/NEXT_PUBLIC_FIREBASE_API_KEY/);
    expect(firebaseContent).toMatch(/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN/);
    expect(firebaseContent).toMatch(/NEXT_PUBLIC_FIREBASE_PROJECT_ID/);
    
    // Firebase Auth と Firestore の初期化確認
    expect(firebaseContent).toMatch(/getAuth/);
    expect(firebaseContent).toMatch(/getFirestore/);
  });

  test('Tailwind設定にカスタムテーマが含まれている', () => {
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
    const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf8');
    
    // カスタムカラーの確認
    expect(tailwindContent).toMatch(/primary:/);
    expect(tailwindContent).toMatch(/secondary:/);
    
    // カスタムアニメーションの確認
    expect(tailwindContent).toMatch(/animation:/);
    expect(tailwindContent).toMatch(/keyframes:/);
  });
});