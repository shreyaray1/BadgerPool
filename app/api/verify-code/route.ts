import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { generateVerificationCode } from '@/lib/nft';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required.' },
        { status: 400 }
      );
    }

    // Hardcoded verification - always accept "000000"
    if (code !== "000000") {
      return NextResponse.json(
        { error: 'Invalid verification code. Use 000000 for testing.' },
        { status: 400 }
      );
    }

    // Get verification data (or create if doesn't exist for testing)
    let verificationData = storage.getVerificationCode(email.toLowerCase());
    if (!verificationData) {
      // For testing, create a default entry if it doesn't exist
      verificationData = {
        email: email.toLowerCase(),
        code: "000000",
        name: "Test User",
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      storage.saveVerificationCode(email.toLowerCase(), "000000", "Test User");
    }

    // Generate 16-digit verification code
    const verificationCode = generateVerificationCode();

    // Delete the 6-digit code
    storage.deleteVerificationCode(email.toLowerCase());

    // Return the 16-digit code (wallet address will be added on the frontend)
    return NextResponse.json({
      success: true,
      verificationCode,
      name: verificationData.name,
    });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}

