import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@prisma/client';

export interface AuthUser extends FirebaseUser {
  id: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  dbUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}