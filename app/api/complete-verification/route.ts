import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { createVerificationNFT } from '@/lib/nft';
import { Connection, PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode, walletAddress } = await request.json();

    if (!email || !verificationCode || !walletAddress) {
      return NextResponse.json(
        { error: 'Email, verification code, and wallet address are required.' },
        { status: 400 }
      );
    }

    // Validate wallet address
    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = storage.getUser(email.toLowerCase());
    if (existingUser && existingUser.verified) {
      return NextResponse.json(
        { error: 'Email already verified.' },
        { status: 400 }
      );
    }

    // For now, we'll skip actual NFT minting in the API
    // The frontend will handle the NFT minting transaction
    // In production, you might want to mint server-side

    // Save user
    const user = {
      email: email.toLowerCase(),
      name: existingUser?.name || 'Student',
      walletAddress,
      verificationCode,
      verified: true,
    };

    storage.saveUser(user);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error in complete-verification:', error);
    return NextResponse.json(
      { error: 'Failed to complete verification' },
      { status: 500 }
    );
  }
}

