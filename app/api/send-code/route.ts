import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/email';
import { storage } from '@/lib/storage';
import { generateSixDigitCode } from '@/lib/nft';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    // Validate email format
    if (!email || !email.endsWith('@wisc.edu')) {
      return NextResponse.json(
        { error: 'Invalid email. Must be a @wisc.edu email address.' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      );
    }

    // Hardcoded verification code for testing
    const code = "000000";

    // Save verification code
    storage.saveVerificationCode(email.toLowerCase(), code, name);

    // Return the code to display in alert (instead of sending email)
    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error('Error in send-code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

