import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { AuthService } from '@/services/auth.service';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
    role: string;
  };
}

export async function authenticateToken(request: NextRequest): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Get user from database
    const user = await AuthService.getUserByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.isActive) {
      return { success: false, error: 'User account is deactivated' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { success: false, error: 'Invalid token' };
  }
}

export function createAuthMiddleware(requiredRoles?: string[]) {
  return async (request: NextRequest) => {
    const authResult = await authenticateToken(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Check role-based access
    if (requiredRoles && !requiredRoles.includes(authResult.user!.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user to request
    (request as AuthenticatedRequest).user = authResult.user;

    return null; // Continue to the handler
  };
}

// Helper function to get user from request
export function getUserFromRequest(request: AuthenticatedRequest) {
  return request.user;
}