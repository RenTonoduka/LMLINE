import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user in database (password is handled by Firebase)
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: 'STUDENT',
        emailVerified: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Simple signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}