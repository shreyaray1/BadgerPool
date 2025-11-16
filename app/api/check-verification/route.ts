import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const user = storage.getUser(email.toLowerCase());
    
    if (!user) {
      return NextResponse.json({ verified: false });
    }

    return NextResponse.json({
      verified: user.verified,
      user: user.verified ? user : null,
    });
  } catch (error) {
    console.error('Error checking verification:', error);
    return NextResponse.json(
      { error: 'Failed to check verification' },
      { status: 500 }
    );
  }
}

