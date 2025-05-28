import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const body = await request.json();
    const { email, name, image, firebaseUid, emailVerified } = body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { firebaseUid },
        data: {
          email,
          name,
          image,
          emailVerified,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          firebaseUid,
          emailVerified,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}