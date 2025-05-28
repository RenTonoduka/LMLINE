import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { UserService } from '@/lib/db/user';

export const POST = withAuth(async (request) => {
  try {
    const { user } = request;
    
    // Firebase認証情報からPostgreSQLのユーザーを同期
    const syncedUser = await UserService.syncWithFirebase({
      uid: user.uid,
      email: user.email || '',
      displayName: null,
      photoURL: null,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: syncedUser.id,
        firebaseUid: syncedUser.firebaseUid,
        email: syncedUser.email,
        name: syncedUser.name,
        role: syncedUser.role,
        createdAt: syncedUser.createdAt,
        lastLoginAt: syncedUser.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync user' 
      },
      { status: 500 }
    );
  }
});