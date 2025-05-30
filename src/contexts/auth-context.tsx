'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthContextType, AuthUser } from '@/types/auth';
import { User } from '@prisma/client';
import { toast } from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from database
  const fetchDbUser = async (firebaseUser: FirebaseUser) => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Create or update user in database
  const syncUserWithDatabase = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          image: firebaseUser.photoURL,
          firebaseUid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
      }
    } catch (error) {
      console.error('Error syncing user with database:', error);
    }
  };

  useEffect(() => {
    if (!auth || !auth.onAuthStateChanged || typeof auth.onAuthStateChanged !== 'function') {
      console.warn('Firebase auth not available, skipping auth state listener');
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const authUser: AuthUser = {
            ...firebaseUser,
            id: firebaseUser.uid,
            role: 'user', // Will be updated from database
          };
          setUser(authUser);
          await syncUserWithDatabase(firebaseUser);
        } else {
          setUser(null);
          setDbUser(null);
        }
        setLoading(false);
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.warn('Error setting up auth state listener:', error);
      setLoading(false);
      return;
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      toast.error('認証サービスが利用できません');
      throw new Error('Firebase auth not available');
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('ログインしました');
    } catch (error: any) {
      const message = getErrorMessage(error.code);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) {
      toast.error('認証サービスが利用できません');
      throw new Error('Firebase auth not available');
    }
    try {
      setLoading(true);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      await updateProfile(firebaseUser, { displayName: name });
      toast.success('アカウントを作成しました');
    } catch (error: any) {
      const message = getErrorMessage(error.code);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      toast.error('認証サービスが利用できません');
      throw new Error('Firebase auth not available');
    }
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Googleアカウントでログインしました');
    } catch (error: any) {
      const message = getErrorMessage(error.code);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) {
      toast.error('認証サービスが利用できません');
      throw new Error('Firebase auth not available');
    }
    try {
      await firebaseSignOut(auth);
      toast.success('ログアウトしました');
    } catch (error: any) {
      toast.error('ログアウトに失敗しました');
      throw error;
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'ユーザーが見つかりません';
      case 'auth/wrong-password':
        return 'パスワードが間違っています';
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/weak-password':
        return 'パスワードは6文字以上で入力してください';
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません';
      case 'auth/popup-closed-by-user':
        return 'ログインがキャンセルされました';
      default:
        return 'エラーが発生しました';
    }
  };

  const value: AuthContextType = {
    user,
    dbUser,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};