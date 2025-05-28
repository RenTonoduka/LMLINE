/**
 * 環境設定とFirebase設定のテスト
 */

import fs from 'fs';
import path from 'path';

describe('Environment and Firebase Configuration', () => {
  test('環境変数テンプレートファイルが存在する', () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);
    
    const envLocalPath = path.join(process.cwd(), '.env.local');
    expect(fs.existsSync(envLocalPath)).toBe(true);
  });

  test('.env.example に必要な環境変数が定義されている', () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Database
    expect(envContent).toMatch(/DATABASE_URL=/);
    
    // Firebase Client
    expect(envContent).toMatch(/NEXT_PUBLIC_FIREBASE_API_KEY=/);
    expect(envContent).toMatch(/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=/);
    expect(envContent).toMatch(/NEXT_PUBLIC_FIREBASE_PROJECT_ID=/);
    expect(envContent).toMatch(/NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=/);
    expect(envContent).toMatch(/NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=/);
    expect(envContent).toMatch(/NEXT_PUBLIC_FIREBASE_APP_ID=/);
    
    // Firebase Admin
    expect(envContent).toMatch(/FIREBASE_PROJECT_ID=/);
    expect(envContent).toMatch(/FIREBASE_CLIENT_EMAIL=/);
    expect(envContent).toMatch(/FIREBASE_PRIVATE_KEY=/);
    
    // LINE Bot
    expect(envContent).toMatch(/LINE_CHANNEL_SECRET=/);
    expect(envContent).toMatch(/LINE_CHANNEL_ACCESS_TOKEN=/);
    
    // AI APIs
    expect(envContent).toMatch(/OPENAI_API_KEY=/);
    expect(envContent).toMatch(/ANTHROPIC_API_KEY=/);
    
    // NextAuth
    expect(envContent).toMatch(/NEXTAUTH_SECRET=/);
    expect(envContent).toMatch(/NEXTAUTH_URL=/);
  });

  test('User型定義が正しく設定されている', () => {
    const userTypesPath = path.join(process.cwd(), 'src/types/user.ts');
    expect(fs.existsSync(userTypesPath)).toBe(true);
    
    const userTypesContent = fs.readFileSync(userTypesPath, 'utf8');
    
    // User interface
    expect(userTypesContent).toMatch(/interface User \{/);
    expect(userTypesContent).toMatch(/firebaseUid: string;/);
    expect(userTypesContent).toMatch(/email: string;/);
    expect(userTypesContent).toMatch(/role: UserRole;/);
    
    // UserRole enum
    expect(userTypesContent).toMatch(/enum UserRole \{/);
    expect(userTypesContent).toMatch(/STUDENT/);
    expect(userTypesContent).toMatch(/INSTRUCTOR/);
    expect(userTypesContent).toMatch(/ADMIN/);
    
    // AuthContext interface
    expect(userTypesContent).toMatch(/interface AuthContext \{/);
    expect(userTypesContent).toMatch(/signIn:/);
    expect(userTypesContent).toMatch(/signUp:/);
    expect(userTypesContent).toMatch(/signOut:/);
    expect(userTypesContent).toMatch(/signInWithGoogle:/);
  });

  test('useAuth フックが正しく設定されている', () => {
    const useAuthPath = path.join(process.cwd(), 'src/hooks/useAuth.ts');
    expect(fs.existsSync(useAuthPath)).toBe(true);
    
    const useAuthContent = fs.readFileSync(useAuthPath, 'utf8');
    
    // AuthProvider component
    expect(useAuthContent).toMatch(/export function AuthProvider/);
    expect(useAuthContent).toMatch(/createContext/);
    expect(useAuthContent).toMatch(/useState/);
    expect(useAuthContent).toMatch(/useEffect/);
    
    // Firebase Auth methods
    expect(useAuthContent).toMatch(/signInWithEmailAndPassword/);
    expect(useAuthContent).toMatch(/createUserWithEmailAndPassword/);
    expect(useAuthContent).toMatch(/signInWithPopup/);
    expect(useAuthContent).toMatch(/onAuthStateChanged/);
    
    // useAuth hook
    expect(useAuthContent).toMatch(/export function useAuth/);
    expect(useAuthContent).toMatch(/useContext/);
  });

  test('認証ミドルウェアが正しく設定されている', () => {
    const authMiddlewarePath = path.join(process.cwd(), 'src/lib/auth-middleware.ts');
    expect(fs.existsSync(authMiddlewarePath)).toBe(true);
    
    const authMiddlewareContent = fs.readFileSync(authMiddlewarePath, 'utf8');
    
    // Middleware functions
    expect(authMiddlewareContent).toMatch(/export async function verifyIdToken/);
    expect(authMiddlewareContent).toMatch(/export function withAuth/);
    expect(authMiddlewareContent).toMatch(/export function withAdminAuth/);
    
    // Firebase Admin integration
    expect(authMiddlewareContent).toMatch(/adminAuth.verifyIdToken/);
    
    // Authorization header handling
    expect(authMiddlewareContent).toMatch(/authorization/);
    expect(authMiddlewareContent).toMatch(/Bearer/);
    
    // Error handling
    expect(authMiddlewareContent).toMatch(/401/);
    expect(authMiddlewareContent).toMatch(/403/);
  });

  test('Firebase設定ファイルが環境変数を正しく参照している', () => {
    const firebaseConfigPath = path.join(process.cwd(), 'src/lib/firebase.ts');
    const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Client-side Firebase config
    expect(firebaseContent).toMatch(/process\.env\.NEXT_PUBLIC_FIREBASE_API_KEY/);
    expect(firebaseContent).toMatch(/process\.env\.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN/);
    expect(firebaseContent).toMatch(/process\.env\.NEXT_PUBLIC_FIREBASE_PROJECT_ID/);
    
    // Firebase services initialization
    expect(firebaseContent).toMatch(/getAuth\(app\)/);
    expect(firebaseContent).toMatch(/getFirestore\(app\)/);
    
    // Duplicate initialization prevention
    expect(firebaseContent).toMatch(/getApps\(\)\.length === 0/);
    
    const firebaseAdminPath = path.join(process.cwd(), 'src/lib/firebase-admin.ts');
    const firebaseAdminContent = fs.readFileSync(firebaseAdminPath, 'utf8');
    
    // Server-side Firebase Admin config
    expect(firebaseAdminContent).toMatch(/process\.env\.FIREBASE_PROJECT_ID/);
    expect(firebaseAdminContent).toMatch(/process\.env\.FIREBASE_CLIENT_EMAIL/);
    expect(firebaseAdminContent).toMatch(/process\.env\.FIREBASE_PRIVATE_KEY/);
    
    // Firebase Admin Auth
    expect(firebaseAdminContent).toMatch(/getAuth\(adminApp\)/);
  });

  test('必要なコンポーネントが定義されているかの型チェック', () => {
    // TypeScript compilation would catch type errors
    // This test ensures files can be imported without syntax errors
    expect(() => {
      // If these files have syntax errors, this would fail
      require('../../src/types/user.ts');
    }).not.toThrow();
    
    expect(() => {
      require('../../src/lib/firebase.ts');
    }).not.toThrow();
    
    expect(() => {
      require('../../src/lib/firebase-admin.ts');
    }).not.toThrow();
    
    expect(() => {
      require('../../src/lib/auth-middleware.ts');
    }).not.toThrow();
  });
});