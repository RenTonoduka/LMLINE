import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { authenticateToken } from '@/middleware/auth.middleware';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firebaseUid, email, name } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    // Create or update user in database
    const user = await AuthService.createOrUpdateUser(firebaseUid, email, name);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}